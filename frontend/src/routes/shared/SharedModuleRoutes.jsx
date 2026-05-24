import { Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";

// Phase 1 — Employee Data
import EmployeeList   from "../../pages/modules/employee/EmployeeList";
import EmployeeDetail from "../../pages/modules/employee/EmployeeDetail";
import TrainingMatrix from "../../pages/modules/training/TrainingMatrix";

// Phase 2 — Request
import RequestList   from "../../pages/modules/request/RequestList";
import RequestCreate from "../../pages/modules/request/RequestCreate";
import RequestDetail from "../../pages/modules/request/RequestDetail";

// Phase 2 — Matching & Selection
import CandidatePool   from "../../pages/modules/matching/CandidatePool";
import TeamSubmission  from "../../pages/modules/selection/TeamSubmission";

// Phase 3 — Assignment
import AssignmentList   from "../../pages/modules/assignment/AssignmentList";
import AssignmentCreate from "../../pages/modules/assignment/AssignmentCreate";

// Phase 4 — Safety / SSHE
import SsheCommencement from "../../pages/modules/sshe/SsheCommencement";
import PreOffshoreCheck from "../../pages/modules/sshe/PreOffshoreCheck";

// Phase 5 — Evaluation
import EvaluationForm from "../../pages/modules/evaluation/EvaluationForm";

// Intercompany
import IntercompanyRequest from "../../pages/modules/intercompany/IntercompanyRequest";

export const getSharedModuleRoutes = () => [
  // ── Phase 1: Employee Data ──────────────────────────────────
  <Route
    key="workers"
    path="workers"
    element={
      <ProtectedRoute allowRoles={["admin", "hr", "manpower"]}>
        <EmployeeList />
      </ProtectedRoute>
    }
  />,
  <Route
    key="worker-detail"
    path="workers/:id"
    element={
      <ProtectedRoute allowRoles={["admin", "hr", "manpower", "pe", "pe_head"]}>
        <EmployeeDetail />
      </ProtectedRoute>
    }
  />,

  <Route
    key="training-matrix"
    path="training-matrix"
    element={
      <ProtectedRoute allowRoles={["admin", "hr", "manpower", "pe", "pe_head"]}>
        <TrainingMatrix />
      </ProtectedRoute>
    }
  />,

  // ── Phase 2: Requests ───────────────────────────────────────
  <Route
    key="requests"
    path="requests"
    element={
      <ProtectedRoute allowRoles={["pe", "pe_head", "manpower", "admin"]}>
        <RequestList />
      </ProtectedRoute>
    }
  />,
  <Route
    key="requests-create"
    path="requests/create"
    element={
      <ProtectedRoute allowRoles={["pe", "pe_head", "admin"]}>
        <RequestCreate />
      </ProtectedRoute>
    }
  />,
  <Route
    key="request-detail"
    path="requests/:id"
    element={
      <ProtectedRoute allowRoles={["pe", "pe_head", "manpower", "admin"]}>
        <RequestDetail />
      </ProtectedRoute>
    }
  />,

  // ── Phase 2: Matching & Selection ──────────────────────────
  <Route
    key="candidates"
    path="candidates"
    element={
      <ProtectedRoute allowRoles={["manpower", "admin"]}>
        <CandidatePool />
      </ProtectedRoute>
    }
  />,
  <Route
    key="selection"
    path="selection"
    element={
      <ProtectedRoute allowRoles={["pe", "pe_head", "manpower", "admin"]}>
        <TeamSubmission />
      </ProtectedRoute>
    }
  />,

  // ── Phase 3: Assignment ─────────────────────────────────────
  <Route
    key="assignments"
    path="assignments"
    element={
      <ProtectedRoute allowRoles={["admin", "manpower", "pe", "pe_head", "manager"]}>
        <AssignmentList />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assignments-create"
    path="assignments/create"
    element={
      <ProtectedRoute allowRoles={["manpower", "admin"]}>
        <AssignmentCreate />
      </ProtectedRoute>
    }
  />,

  // ── Phase 4: Safety / SSHE ──────────────────────────────────
  <Route
    key="safety"
    path="safety"
    element={
      <ProtectedRoute allowRoles={["admin", "safety", "manpower"]}>
        <SsheCommencement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="pre-offshore"
    path="pre-offshore"
    element={
      <ProtectedRoute allowRoles={["admin", "safety"]}>
        <PreOffshoreCheck />
      </ProtectedRoute>
    }
  />,

  // ── Phase 5: Evaluation ─────────────────────────────────────
  <Route
    key="evaluation"
    path="evaluation"
    element={
      <ProtectedRoute allowRoles={["admin", "pe", "pe_head"]}>
        <EvaluationForm />
      </ProtectedRoute>
    }
  />,

  // ── Intercompany ────────────────────────────────────────────
  <Route
    key="intercompany"
    path="intercompany"
    element={
      <ProtectedRoute allowRoles={["admin", "manpower", "pe", "pe_head"]}>
        <IntercompanyRequest />
      </ProtectedRoute>
    }
  />,
];
