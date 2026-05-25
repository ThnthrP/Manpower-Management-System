import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import safetyRouter from "./routes/safetyRoutes.js";
import medicalRouter from "./routes/medicalRoutes.js";
import requestRouter from "./routes/requestRoutes.js";

import employeeRouter from "./routes/employeeRoutes.js";
// Phase 2-5 routes (stub — implement controllers as needed)
// import candidateRouter from "./routes/candidateRoutes.js";
// import teamRouter from "./routes/teamRoutes.js";
// import assignmentRouter from "./routes/assignmentRoutes.js";
// import intercompanyRouter from "./routes/intercompanyRoutes.js";
// import preOffshoreRouter from "./routes/preOffshoreRoutes.js";
// import mobRouter from "./routes/mobRoutes.js";
// import evaluationRouter from "./routes/evaluationRoutes.js";
// import notificationRouter from "./routes/notificationRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = [process.env.CLIENT_URL?.trim(), "http://localhost:5173"]
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// routes
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/safety", safetyRouter);
app.use("/api/medical", medicalRouter);
app.use("/api/request", requestRouter);

app.use("/api/employees", employeeRouter);
// Phase 2-5 routes (uncomment when controllers are ready)
// app.use("/api/candidates", candidateRouter);
// app.use("/api/teams", teamRouter);
// app.use("/api/assignments", assignmentRouter);
// app.use("/api/intercompany", intercompanyRouter);
// app.use("/api/pre-offshore", preOffshoreRouter);
// app.use("/api/mob", mobRouter);
// app.use("/api/evaluation", evaluationRouter);
// app.use("/api/notifications", notificationRouter);

app.use("/uploads", express.static("uploads"));

// start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});