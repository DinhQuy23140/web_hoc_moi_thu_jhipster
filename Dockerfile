# syntax=docker/dockerfile:1
# Production image: Angular SPA + seed dataset + Spring Boot API in a single container.

FROM node:22-bookworm-slim AS web
WORKDIR /src
COPY app/package.json app/package-lock.json app/
RUN cd app && npm ci --no-audit --no-fund
COPY app app
RUN cd app && npm run build
COPY seed seed
RUN node seed/build.mjs

FROM eclipse-temurin:21-jdk AS api
WORKDIR /src
COPY mvnw pom.xml sonar-project.properties checkstyle.xml ./
COPY .mvn .mvn
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -B -q -Pprod -Dskip.npm dependency:go-offline
COPY src/main src/main
COPY --from=web /src/app/dist/app/browser src/main/resources/static
RUN ./mvnw -B -Pprod -Dskip.npm -DskipTests package \
    && cp target/lingora-*.jar /src/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=api --chown=1000 /src/app.jar app.jar
COPY --from=web --chown=1000 /src/seed/out seed/out
# Hugging Face Spaces runs containers as uid 1000 (the image's default "ubuntu" user).
USER 1000
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=7860 \
    LINGORA_SEED_PATH=/app/seed/out \
    LINGORA_SEED_AUTO_IMPORT=true \
    LINGORA_FRAME_ANCESTORS=https://huggingface.co \
    JAVA_OPTS="-Xms256m -Xmx1g -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"
EXPOSE 7860
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
