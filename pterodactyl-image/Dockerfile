FROM node:22-bookworm-slim AS node

FROM ghcr.io/pterodactyl/yolks:java_25

LABEL org.opencontainers.image.source="https://github.com/LumaLibre/web"
LABEL org.opencontainers.image.description="Pterodactyl runtime with Java 25 and Node.js 22"

USER root

COPY --from=node /usr/local/bin/node /usr/local/bin/node

RUN java -version && node --version

USER container
