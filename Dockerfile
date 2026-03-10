FROM mcr.microsoft.com/playwright:v1.53.2-jammy

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    OUTPUT_PATH=/app/output \
    UPLOAD_PATH=/app/upload \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src

RUN mkdir -p /app/output /app/upload

EXPOSE 3000

CMD ["node", "src/index.js"]
