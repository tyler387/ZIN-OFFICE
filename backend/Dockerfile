FROM gradle:8.12.1-jdk17 AS builder

WORKDIR /app
COPY . /app
RUN bash -lc "gradle clean bootJar -x test -PskipFrontendBuild=true --no-daemon --console=plain > /tmp/gradle.log 2>&1 || { tail -n 200 /tmp/gradle.log; exit 1; }"

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar /app/app.jar

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
