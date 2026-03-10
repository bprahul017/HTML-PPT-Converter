import fs from "fs-extra";
import { extname, join, resolve } from "path";
import { pathToFileURL } from "url";
import PptxGenJS from "pptxgenjs";
import { chromium } from "playwright";

const outputFolder = process.env.OUTPUT_PATH || "./output";

export const convertAllHtmlToPptx = async (files = []) => {
  if (!files.length) {
    throw new Error("No HTML files uploaded");
  }

  await fs.ensureDir(outputFolder);

  const outputFileName = `slides-${Date.now()}.pptx`;
  const outputPptx = join(outputFolder, outputFileName);

  const presentation = new PptxGenJS();
  presentation.layout = "LAYOUT_WIDE";
  presentation.author = "pptGenerator";
  presentation.subject = "HTML to PPTX";
  presentation.title = outputFileName;
  presentation.company = "pptGenerator";
  presentation.revision = "1";
  presentation.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-US",
  };
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1600, height: 900 }, // 16:9 to match LAYOUT_WIDE
      deviceScaleFactor: 2,
    });

    // Keep original upload order unless missing; fallback to filename sort.
    const sortedFiles = [...files].sort((a, b) => {
      if (typeof a.filename === "string" && typeof b.filename === "string") {
        return a.filename.localeCompare(b.filename);
      }
      return 0;
    });
    let convertedCount = 0;

    for (const file of sortedFiles) {
      const htmlPath = file.path;
      if (!htmlPath || extname(file.originalname || "").toLowerCase() !== ".html") {
        continue;
      }

      const page = await context.newPage();
      const htmlUrl = pathToFileURL(resolve(htmlPath)).href;

      await page.goto(htmlUrl, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      });
      await page.waitForTimeout(200);

      const screenshotBase64 = await page.screenshot({
        type: "png",
        fullPage: false,
        animations: "disabled",
        caret: "hide",
        encoding: "base64",
      });
      await page.close();

      const base64String = Buffer.isBuffer(screenshotBase64)
        ? screenshotBase64.toString("base64")
        : String(screenshotBase64);
      const normalizedBase64 = base64String.replace(/\s/g, "").trim();
      if (!normalizedBase64) {
        throw new Error("Screenshot capture returned empty data");
      }

      const imageData = normalizedBase64.toLowerCase().includes("base64,")
        ? normalizedBase64
        : `data:image/png;base64,${normalizedBase64}`;

      const slide = presentation.addSlide();
      slide.addImage({
        data: imageData,
        x: 0,
        y: 0,
        w: 13.333,
        h: 7.5,
      });
      convertedCount += 1;
    }

    if (!convertedCount) {
      throw new Error("No valid HTML files found for conversion");
    }

    await presentation.writeFile({ fileName: outputPptx });

    if (!(await fs.pathExists(outputPptx))) {
      throw new Error("PPT file was not generated");
    }

    return {
      outputPath: outputPptx,
      outputFileName,
    };
  } catch (error) {
    if (await fs.pathExists(outputPptx)) {
      await fs.remove(outputPptx);
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }

    // Uploaded HTML files are temporary and should be removed before returning.
    await Promise.all(
      files.map(async (file) => {
        if (!file?.path) {
          return;
        }
        try {
          await fs.remove(file.path);
        } catch {
          // Best-effort cleanup.
        }
      })
    );
  }
};
