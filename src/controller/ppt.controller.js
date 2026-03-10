import fs from "fs-extra";
import { convertAllHtmlToPptx } from "../service/ppt.service.js";

export const convertHtmlToPpt = async (req, res) => {
  let outputPath;
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No HTML files uploaded" });
    }

    const result = await convertAllHtmlToPptx(files);
    outputPath = result.outputPath;

    return res.download(result.outputPath, result.outputFileName, async (error) => {
      try {
        if (await fs.pathExists(result.outputPath)) {
          await fs.remove(result.outputPath);
        }
      } catch {
        // Best-effort cleanup.
      }

      if (error && !res.headersSent) {
        res.status(500).json({ status: false, message: "Failed to send ppt file" });
      }
    });
  } catch (error) {
    try {
      if (outputPath && (await fs.pathExists(outputPath))) {
        await fs.remove(outputPath);
      }
    } catch {
       
      // Best-effort cleanup.
    }

     console.error(error)

    return res.status(500).json({ status: false, message: "Failed to convert html to ppt" });
  }
};
