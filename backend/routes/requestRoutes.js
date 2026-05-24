import express from "express";
import userAuth from "../middleware/userAuth.js";
import companyScope from "../middleware/companyScope.js";
import authorize from "../middleware/authorize.js";
import { createRequest } from "../controllers/requestController.js";

const router = express.Router();

// PE create request — scoped to user's company
router.post(
  "/create",
  userAuth,
  companyScope,
  authorize("request", "create"),
  createRequest
);

export default router;