import express from "express";
import userAuth from "../middleware/userAuth.js";
import companyScope from "../middleware/companyScope.js";
import authorize from "../middleware/authorize.js";
import {
  getEmployees,
  getEmployeeById,
  getTrainingMatrix,
} from "../controllers/employeeController.js";

const router = express.Router();

// /matrix ต้องอยู่ก่อน /:id เพื่อกัน conflict
router.get(
  "/matrix",
  userAuth,
  companyScope,
  authorize("employee", "view"),
  getTrainingMatrix
);

router.get(
  "/",
  userAuth,
  companyScope,
  authorize("employee", "view"),
  getEmployees
);

router.get(
  "/:id",
  userAuth,
  companyScope,
  authorize("employee", "view"),
  getEmployeeById
);

export default router;
