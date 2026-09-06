import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { propertyRouter } from "./routes/property.routes.js";
import { managerRouter } from "./routes/manager.routes.js";
import { applicationRouter } from "./routes/application.routes.js";

/* conf */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/manager", managerRouter);
app.use("/api/applications", applicationRouter);

app.get("/", (req, res) => {
  res.send("Hello from server!");
});

/* server */
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${env.PORT}`);
});
