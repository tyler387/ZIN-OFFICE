FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts eslint.config.js ./
COPY public ./public
COPY src ./src
COPY backend ./backend

RUN npm run build

FROM gradle:8.12.1-jdk17 AS backend-builder

WORKDIR /app/backend
COPY backend /app/backend
COPY --from=frontend-builder /app/backend/src/main/resources/static ./src/main/resources/static

RUN gradle clean bootJar -x test -PskipFrontendBuild=true --no-daemon --console=plain

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=backend-builder /app/backend/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
