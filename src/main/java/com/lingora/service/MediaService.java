package com.lingora.service;

import com.lingora.config.ApplicationProperties;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.util.Json;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Media lives in Supabase Storage. The browser never sees the service key: the backend checks
 * permissions (admins write {@code content/**}, each learner writes {@code avatars/<own id>/**}),
 * then hands out a short-lived signed upload URL; the file goes straight from the browser to Supabase.
 */
@Service
public class MediaService {

    private record Rule(Pattern mime, long maxBytes) {}

    private static final Map<String, Rule> RULES = Map.of(
        "image",
        new Rule(Pattern.compile("^image/(png|jpe?g|webp|gif|avif|svg\\+xml)$"), 5L * 1024 * 1024),
        "audio",
        new Rule(Pattern.compile("^audio/(mpeg|mp3|wav|ogg|webm|mp4|aac|x-m4a)$"), 20L * 1024 * 1024),
        "video",
        new Rule(Pattern.compile("^video/(mp4|webm|ogg|quicktime)$"), 200L * 1024 * 1024)
    );
    private static final Pattern FOLDER = Pattern.compile("^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+){0,4}$");

    private final ApplicationProperties.Supabase supabase;
    private final RestClient http = RestClient.create();

    public MediaService(ApplicationProperties properties) {
        this.supabase = properties.getSupabase();
    }

    public boolean isEnabled() {
        return supabase.isEnabled();
    }

    public ObjectNode signUpload(Long userId, boolean admin, JsonNode req) {
        if (!isEnabled()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Supabase Storage chưa được cấu hình");
        String kind = Json.str(req, "kind");
        Rule rule = kind == null ? null : RULES.get(kind);
        if (rule == null) throw new ContentValidationException("Loại tệp không hợp lệ");
        String contentType = Json.str(req, "contentType");
        if (contentType == null || !rule.mime().matcher(contentType).matches()) throw new ContentValidationException("Định dạng tệp không được hỗ trợ");
        long size = (long) Json.number(req, "size", -1);
        if (size <= 0 || size > rule.maxBytes()) throw new ContentValidationException("Tệp quá lớn");

        String folder = trimSlashes(Json.str(req, "folder"));
        if (folder == null || !FOLDER.matcher(folder).matches()) throw new ContentValidationException("Thư mục không hợp lệ");
        boolean contentFolder = folder.equals("content") || folder.startsWith("content/");
        boolean ownAvatar = folder.equals("avatars/" + userId);
        if (!(contentFolder && admin) && !ownAvatar) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền tải lên thư mục này");

        String ext = extension(Json.str(req, "fileName"));
        String path = folder + "/" + UUID.randomUUID() + "." + ext;
        String body;
        try {
            body = http
                .post()
                .uri(supabase.getUrl() + "/storage/v1/object/upload/sign/" + supabase.getBucket() + "/" + path)
                .header("Authorization", "Bearer " + supabase.getServiceKey())
                .header("apikey", supabase.getServiceKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body("{}")
                .retrieve()
                .body(String.class);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không tạo được liên kết tải lên", e);
        }
        JsonNode res = Json.read(body);
        String signed = Json.str(res, "url");
        if (signed == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Phản hồi Supabase không hợp lệ");
        ObjectNode o = Json.obj();
        o.put("uploadUrl", supabase.getUrl() + "/storage/v1" + (signed.startsWith("/") ? signed : "/" + signed));
        o.put("publicUrl", publicUrl(path));
        o.put("path", path);
        return o;
    }

    public ArrayNode list(String folderParam) {
        ArrayNode out = Json.arr();
        if (!isEnabled()) return out;
        String folder = trimSlashes(folderParam);
        if (folder == null || !FOLDER.matcher(folder).matches()) throw new ContentValidationException("Thư mục không hợp lệ");
        ObjectNode req = Json.obj();
        req.put("prefix", folder);
        req.put("limit", 100);
        req.put("offset", 0);
        ObjectNode sort = req.putObject("sortBy");
        sort.put("column", "created_at");
        sort.put("order", "desc");
        String body;
        try {
            body = http
                .post()
                .uri(supabase.getUrl() + "/storage/v1/object/list/" + supabase.getBucket())
                .header("Authorization", "Bearer " + supabase.getServiceKey())
                .header("apikey", supabase.getServiceKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.write(req))
                .retrieve()
                .body(String.class);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không đọc được danh sách tệp", e);
        }
        JsonNode arr = Json.read(body);
        if (arr == null || !arr.isArray()) return out;
        for (JsonNode f : arr) {
            if (Json.str(f, "id") == null) continue;
            String name = Json.str(f, "name");
            ObjectNode item = out.addObject();
            item.put("name", name);
            JsonNode meta = f.get("metadata");
            item.put("size", meta != null ? Json.integer(meta, "size", 0) : 0);
            item.put("url", publicUrl(folder + "/" + name));
        }
        return out;
    }

    private String publicUrl(String path) {
        return supabase.getUrl() + "/storage/v1/object/public/" + supabase.getBucket() + "/" + path;
    }

    private static String trimSlashes(String s) {
        return s == null ? null : s.replaceAll("^/+|/+$", "");
    }

    private static String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "bin";
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return ext.isEmpty() || ext.length() > 8 ? "bin" : ext;
    }
}
