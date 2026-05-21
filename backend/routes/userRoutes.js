import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js";
import { updateProfile } from "../controllers/userController.js";
import { updateUserRole } from "../controllers/userController.js";
import authorize from "../middleware/authorize.js";
import { getAllRoles } from "../controllers/userController.js";
import { getAllUsers } from "../controllers/userController.js";
import { getAllCompanies } from "../controllers/userController.js";
import { updateUserCompany } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, updateProfile);
userRouter.put(
  "/role",
  userAuth,
  authorize("system", "manage"), // admin เท่านั้น
  updateUserRole,
);
userRouter.put(
  "/company",
  userAuth,
  authorize("system", "manage"),
  updateUserCompany
);

userRouter.get("/roles", userAuth, authorize("system", "manage"), getAllRoles);
userRouter.get("/all", userAuth, authorize("system", "manage"), getAllUsers);
userRouter.get(
  "/companies",
  userAuth,
  authorize("system", "manage"),
  getAllCompanies
);

export default userRouter;
