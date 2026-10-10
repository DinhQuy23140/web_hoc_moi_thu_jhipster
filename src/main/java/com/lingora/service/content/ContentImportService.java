package com.lingora.service.content;

import com.lingora.config.ApplicationProperties;
import com.lingora.repository.LanguageRepository;
import com.lingora.service.util.Json;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Loads the JSON produced by {@code seed/build.mjs} into MySQL. Rows are upserted by id so
 * re-importing keeps learner progress; lesson/exam children are replaced.
 */
@Service
public class ContentImportService {

    private static final Logger LOG = LoggerFactory.getLogger(ContentImportService.class);

    private final ContentWriteService writer;
    private final LanguageRepository languages;
    private final ApplicationProperties properties;
    private final TransactionTemplate tx;

    public ContentImportService(
        ContentWriteService writer,
        LanguageRepository languages,
        ApplicationProperties properties,
        TransactionTemplate tx
    ) {
        this.writer = writer;
        this.languages = languages;
        this.properties = properties;
        this.tx = tx;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void importOnStartup() {
        if (!properties.getSeed().isAutoImport()) return;
        if (languages.count() > 0) {
            LOG.info("Content already present, skipping seed import");
            return;
        }
        Path dir = resolveSeedDir();
        if (dir == null) {
            LOG.warn("Seed folder '{}' not found; run `node seed/build.mjs` and restart, or import from the admin page", properties.getSeed().getPath());
            return;
        }
        importFrom(dir);
    }

    public Path resolveSeedDir() {
        Path configured = Path.of(properties.getSeed().getPath());
        for (Path candidate : List.of(configured, Path.of("..").resolve(configured))) {
            if (Files.isRegularFile(candidate.resolve("languages.json"))) return candidate.toAbsolutePath().normalize();
        }
        return null;
    }

    public synchronized ObjectNode importFrom(Path dir) {
        long start = System.currentTimeMillis();
        LOG.info("Importing seed content from {}", dir);
        ObjectNode report = Json.obj();

        List<JsonNode> certificates = read(dir, "certificates.json");
        report.put("languages", each(read(dir, "languages.json"), writer::saveLanguage));
        report.put("certificates", each(certificates, writer::saveCertificate));
        report.put("courses", each(read(dir, "courses.json"), writer::saveCourse));
        each(certificates, writer::relinkCertificate);

        List<JsonNode> vocab = read(dir, "vocabularies.json");
        for (int i = 0; i < vocab.size(); i += 200) {
            List<JsonNode> chunk = vocab.subList(i, Math.min(vocab.size(), i + 200));
            tx.executeWithoutResult(s -> chunk.forEach(v -> writer.saveVocabulary(Json.str(v, "id"), v)));
        }
        report.put("vocabularies", vocab.size());

        report.put("outlines", each(read(dir, "outlines.json"), (id, o) -> writer.saveOutline(Json.str(o, "courseId"), o)));
        report.put("lessons", each(read(dir, "lessons.json"), writer::saveLesson));
        report.put("exams", each(read(dir, "exams.json"), writer::saveExam));
        writer.evictAll();
        report.put("seconds", (System.currentTimeMillis() - start) / 1000.0);
        LOG.info("Seed import finished: {}", report);
        return report;
    }

    private static int each(List<JsonNode> docs, BiConsumer<String, JsonNode> save) {
        for (JsonNode d : docs) save.accept(Json.str(d, "id"), d);
        return docs.size();
    }

    private static List<JsonNode> read(Path dir, String file) {
        Path p = dir.resolve(file);
        List<JsonNode> out = new ArrayList<>();
        if (!Files.isRegularFile(p)) return out;
        try {
            JsonNode arr = Json.read(Files.readString(p));
            if (arr != null && arr.isArray()) arr.forEach(out::add);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read " + p, e);
        }
        return out;
    }
}
