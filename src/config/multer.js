import multer from "multer";
import fs from "fs-extra";
import path from "path";

const uploadDir = process.env.UPLOAD_PATH || "./upload";
fs.ensureDirSync(uploadDir);

// Multer config: Multiple HTML files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // upload folder
  },
  filename: (req, file, cb) => {
    // Keep original name or add timestamp: `${Date.now()}-${file.originalname}`
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/html" ||
    path.extname(file.originalname).toLowerCase() === ".html"
  ) {
    cb(null, true); // accept HTML files only
  } else {
    cb(new Error("Only HTML files allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

export default upload;
