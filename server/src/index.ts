import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { propertyRouter } from "./routes/property.routes.js";
import { managerRouter } from "./routes/manager.routes.js";
import { applicationRouter } from "./routes/application.routes.js";
import { favoriteRouter } from "./routes/favorite.routes.js";
import { tenantRouter } from "./routes/tenant.routes.js";
import { reviewRouter } from "./routes/review.routes.js";
import { leaseRouter } from "./routes/lease.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { paymentMethodRouter } from "./routes/payment-method.routes.js";
import { maintenanceRouter } from "./routes/maintenance.routes.js";
import { tourRouter } from "./routes/tour.routes.js";
import { messageRouter } from "./routes/message.routes.js";

/* conf */
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/manager", managerRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/tenant", tenantRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/leases", leaseRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/payment-methods", paymentMethodRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/tours", tourRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
  res.send("Hello from server!");
});

/* server */
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${env.PORT}`);
});
