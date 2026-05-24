import express from "express";
import userAuth from "../middleware/userAuth.js";
import companyScope from "../middleware/companyScope.js";
import authorize from "../middleware/authorize.js";
import {
  getEmployees,
  getEmployeeById,
  getTrainingMatrix,
  getCertifications,
  getPassports,
  getComplianceByEmployee,
  getPositions,
  createEmployee,
  updateEmployee,
  upsertPassport,
  addCertification,
  updateCertification,
  deleteCertification,
  getCV,
  upsertCV,
  addExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/employeeController.js";

const router = express.Router();

// ── Static paths (must come before /:id) ──────────────────

router.get("/matrix",         userAuth, companyScope, authorize("employee","view"),   getTrainingMatrix);
router.get("/certifications", userAuth, companyScope, authorize("employee","view"),   getCertifications);
router.get("/passports",      userAuth, companyScope, authorize("employee","view"),   getPassports);
router.get("/positions",      userAuth, companyScope,                                 getPositions);
router.get("/",               userAuth, companyScope, authorize("employee","view"),   getEmployees);
router.post("/",              userAuth, companyScope, authorize("employee","create"),  createEmployee);

// ── Per-employee sub-resources ─────────────────────────────

router.get("/:id/compliance",                   userAuth, companyScope, authorize("employee","view"),   getComplianceByEmployee);

// Passport
router.put("/:id/passport",                     userAuth, companyScope, authorize("employee","update"), upsertPassport);

// Certifications
router.post("/:id/certifications",              userAuth, companyScope, authorize("employee","update"), addCertification);
router.put("/:id/certifications/:certId",       userAuth, companyScope, authorize("employee","update"), updateCertification);
router.delete("/:id/certifications/:certId",    userAuth, companyScope, authorize("employee","update"), deleteCertification);

// CV
router.get("/:id/cv",                           userAuth, companyScope, authorize("employee","view"),   getCV);
router.put("/:id/cv",                           userAuth, companyScope, authorize("employee","update"), upsertCV);
router.post("/:id/cv/experiences",              userAuth, companyScope, authorize("employee","update"), addExperience);
router.put("/:id/cv/experiences/:expId",        userAuth, companyScope, authorize("employee","update"), updateExperience);
router.delete("/:id/cv/experiences/:expId",     userAuth, companyScope, authorize("employee","update"), deleteExperience);

// ── Employee CRUD ──────────────────────────────────────────

router.get("/:id",  userAuth, companyScope, authorize("employee","view"),   getEmployeeById);
router.put("/:id",  userAuth, companyScope, authorize("employee","update"),  updateEmployee);

export default router;
