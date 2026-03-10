import { Router } from "express";
import upload from "./config/multer.js";
import { convertHtmlToPpt } from "./controller/ppt.controller.js";

const router = Router();

/**
 * @openapi
 * /api/html-ppt:
 *   post:
 *     summary: Convert uploaded HTML files to a PPTX file
 *     tags:
 *       - PPT
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - htmlFiles
 *             properties:
 *               htmlFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: PPTX file stream
 *         content:
 *           application/vnd.openxmlformats-officedocument.presentationml.presentation:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: No files uploaded
 *       500:
 *         description: Conversion failed
 */
router.post("/html-ppt", upload.array("htmlFiles", 100), convertHtmlToPpt);



export default router;
