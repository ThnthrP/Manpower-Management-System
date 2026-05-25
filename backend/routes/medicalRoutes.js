import express from "express";
import userAuth from "../middleware/userAuth.js";
import companyScope from "../middleware/companyScope.js";
import authorize from "../middleware/authorize.js";
import { createMedicalCheck } from "../controllers/medicalController.js";

const router = express.Router();

// สร้าง medical check — scoped to user's company
router.post(
  "/check",
  userAuth,
  companyScope,
  authorize("medical", "check"),
  createMedicalCheck
);

export default router;