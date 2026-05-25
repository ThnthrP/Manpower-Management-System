import express from "express";
import userAuth from "../middleware/userAuth.js";
import companyScope from "../middleware/companyScope.js";
import { getUserData } from "../controllers/userController.js";
import { updateProfile } from "../controllers/userController.js";
import { updateUserRole } from "../controllers/userController.js";
import authorize from "../middleware/authorize.js";
import { getAllRoles } from "../controllers/userController.js";
import { getAllUsers } from "../controllers/userController.js";
import { getAllCompanies } from "../controllers/userController.js";
import { updateUserCompany } from "../controllers/userController.js";

const userRouter = express.Router();

// own-user endpoints — no companyScope needed
userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, updateProfile);

// admin endpoints — scoped to admin's company
userRouter.put(
  "/role",
  userAuth,
  companyScope,
  authorize("system", "manage"),
  updateUserRole,
);
userRouter.put(
  "/company",
  userAuth,
  companyScope,
  authorize("system", "manage"),
  updateUserCompany,
);

// global lists — no companyScope (cross-company admin data)
userRouter.get("/roles", userAuth, authorize("system", "manage"), getAllRoles);
userRouter.get(
  "/all",
  userAuth,
  companyScope,
  authorize("system", "manage"),
  getAllUsers,
);
userRouter.get(
  "/companies",
  userAuth,
  authorize("system", "manage"),
  getAllCompanies,
);

export default userRouter;
