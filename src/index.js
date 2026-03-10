import express from "express";
import router from "./router.js";
import { config } from "dotenv";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

config();

const app = express();
const port = process.env.PORT || 3000;

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "PPT Generator API",
      version: "1.0.0",
      description: "API to convert uploaded HTML files into a PPTX file.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./src/router.js"],
});

app.use(cors());
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Application Running at ${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
