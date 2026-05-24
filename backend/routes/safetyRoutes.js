import express from "express";
import userAuth from "../middleware/userAuth.js";
import companyScope from "../middleware/companyScope.js";
import authorize from "../middleware/authorize.js";
import { createSafetyCheck } from "../controllers/safetyController.js";

const router = express.Router();

router.post(
  "/check",
  userAuth,
  companyScope,
  authorize("safety", "check"),
  createSafetyCheck
);

export default router;