# PPT Generator API

API to convert uploaded HTML files into a PPTX file.

## Requirements

- Node.js 18+
- Playwright dependencies (local install) or Docker

## Install and Run (Local)

```bash
npm install
npm run dev
```

Server:
- App: http://localhost:3000
- Swagger docs: http://localhost:3000/api-docs

## API

`POST /api/html-ppt`

- Content type: `multipart/form-data`
- Field name: `htmlFiles` (multiple `.html` files)
- Response: a `.pptx` file download

Example using `curl`:

```bash
curl -X POST http://localhost:3000/api/html-ppt \
  -F "htmlFiles=@./examples/slide1.html" \
  -F "htmlFiles=@./examples/slide2.html" \
  --output slides.pptx
```

## Environment Variables

- `PORT` (default: `3000`)
- `OUTPUT_PATH` (default: `./output`)
- `UPLOAD_PATH` (default: `./upload`)

## Docker

Build and run:

```bash
docker build -t pptgenerator .
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/upload:/app/upload \
  pptgenerator
```

## Docker Compose

```bash
docker compose up --build
```

Then open:
- http://localhost:3000/api-docs
