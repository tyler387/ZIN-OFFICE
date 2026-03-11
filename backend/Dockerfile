FROM gradle:8.12.1-jdk17 AS builder

WORKDIR /app
COPY . /app
RUN gradle clean bootJar -x test --no-daemon

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar /app/app.jar

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
