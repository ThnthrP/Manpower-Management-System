import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const { companyId } = req;
    const { search, status, page = 1, limit = 20 } = req.query;

    const where = {
      companyId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { empCode: { contains: search, mode: "insensitive" } },
          { fullNameTH: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          position: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
        orderBy: { fullName: "asc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.employee.count({ where }),
    ]);

    return res.json({ success: true, employees, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employees/matrix?clientCode=CHEVRON
export const getTrainingMatrix = async (req, res) => {
  try {
    const { clientCode } = req.query;

    const clients = await prisma.client.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    const contractWhere = clientCode ? { client: { code: clientCode } } : {};

    const requirements = await prisma.positionRequirement.findMany({
      where: { contract: contractWhere },
      select: {
        requirementType: true,
        position: { select: { id: true, name: true, category: true } },
        clientTraining: { select: { name: true } },
        contract: {
          select: {
            id: true,
            name: true,
            client: { select: { name: true, code: true } },
          },
        },
      },
      orderBy: [{ position: { name: "asc" } }],
    });

    const positionMap = new Map();
    for (const req of requirements) {
      const posId = req.position.id;
      if (!positionMap.has(posId)) {
        positionMap.set(posId, {
          id: posId,
          name: req.position.name,
          category: req.position.category,
          trainings: [],
        });
      }
      positionMap.get(posId).trainings.push({
        name: req.clientTraining.name,
        requirementType: req.requirementType,
        client: req.contract.client.name,
        clientCode: req.contract.client.code,
        contract: req.contract.name,
      });
    }

    const positions = Array.from(positionMap.values());

    return res.json({ success: true, clients, positions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employees/certifications
export const getCertifications = async (req, res) => {
  try {
    const { companyId } = req;
    const { search, status, page = 1, limit = 30 } = req.query;

    const where = {
      isLatest: true,
      employee: {
        companyId,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { empCode: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      ...(status && { status }),
      ...(search && {
        OR: [
          { rawTrainingName: { contains: search, mode: "insensitive" } },
          {
            employee: {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { empCode: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }),
    };

    const [certifications, total] = await Promise.all([
      prisma.employeeTraining.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true, empCode: true, fullName: true, fullNameTH: true,
              position: { select: { name: true } },
            },
          },
          globalTraining: { select: { id: true, name: true } },
        },
        orderBy: { expiryDate: "asc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.employeeTraining.count({ where }),
    ]);

    return res.json({ success: true, certifications, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employees/passports
export const getPassports = async (req, res) => {
  try {
    const { companyId } = req;
    const { search } = req.query;

    const where = {
      employee: {
        companyId,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { empCode: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      ...(search && {
        passportNo: { contains: search, mode: "insensitive" },
      }),
    };

    // Fetch all passports for company employees (merge conditions)
    const passports = await prisma.employeePassport.findMany({
      where: {
        employee: { companyId },
        ...(search && {
          OR: [
            { passportNo: { contains: search, mode: "insensitive" } },
            {
              employee: {
                OR: [
                  { fullName: { contains: search, mode: "insensitive" } },
                  { empCode: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }),
      },
      include: {
        employee: {
          select: {
            id: true, empCode: true, fullName: true, fullNameTH: true,
            status: true,
            position: { select: { name: true } },
          },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    return res.json({ success: true, passports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        position: true,
        department: true,
        passport: true,
        trainings: {
          where: { isLatest: true },
          include: { globalTraining: { select: { id: true, name: true } } },
          orderBy: { expiryDate: "asc" },
        },
        medicalChecks: { orderBy: { expiryDate: "asc" } },
        leaves: { orderBy: { startDate: "desc" }, take: 10 },
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.json({ success: true, employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employees/:id/compliance
export const getComplianceByEmployee = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({
      where: { id, companyId },
      include: { position: { select: { id: true, name: true, category: true } } },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (!employee.positionId) {
      return res.json({
        success: true,
        employee,
        requirements: [],
        summary: { total: 0, completed: 0, missing: 0, overdue: 0, due_soon: 0 },
      });
    }

    // Get all position requirements (may span multiple clients)
    const requirements = await prisma.positionRequirement.findMany({
      where: { positionId: employee.positionId },
      include: {
        clientTraining: {
          include: {
            globalTraining: { select: { id: true, name: true } },
            contract: { include: { client: { select: { name: true, code: true } } } },
          },
        },
      },
    });

    // Deduplicate by globalTrainingId
    const seen = new Set();
    const uniqueRequirements = [];
    for (const r of requirements) {
      const gId = r.clientTraining.globalTrainingId;
      if (!seen.has(gId)) {
        seen.add(gId);
        uniqueRequirements.push(r);
      }
    }

    // Get employee training records
    const empTrainings = await prisma.employeeTraining.findMany({
      where: { employeeId: id, isLatest: true },
    });

    const empTrainingMap = new Map();
    for (const t of empTrainings) {
      if (t.globalTrainingId) empTrainingMap.set(t.globalTrainingId, t);
    }

    // Build compliance list
    const complianceItems = uniqueRequirements.map((r) => {
      const gId = r.clientTraining.globalTrainingId;
      const empTraining = empTrainingMap.get(gId);

      return {
        trainingId: gId,
        trainingName: r.clientTraining.globalTraining.name,
        requirementType: r.requirementType,
        clientCode: r.clientTraining.contract.client.code,
        clientName: r.clientTraining.contract.client.name,
        status: empTraining ? empTraining.status : "missing",
        expiryDate: empTraining?.expiryDate ?? null,
        completedDate: empTraining?.completedDate ?? null,
      };
    });

    // Sort: missing/overdue first, then due_soon, then completed
    const ORDER = { missing: 0, overdue: 1, due_soon: 2, pending: 3, completed: 4 };
    complianceItems.sort((a, b) => (ORDER[a.status] ?? 5) - (ORDER[b.status] ?? 5));

    const summary = {
      total: complianceItems.length,
      completed: complianceItems.filter((i) => i.status === "completed").length,
      missing: complianceItems.filter((i) => i.status === "missing").length,
      overdue: complianceItems.filter((i) => i.status === "overdue").length,
      due_soon: complianceItems.filter((i) => i.status === "due_soon").length,
    };

    return res.json({ success: true, employee, requirements: complianceItems, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    const { companyId } = req;
    const {
      empCode, fullName, fullNameTH, status,
      position, department, division, isOffshore,
      passport, certifications, medical,
    } = req.body;

    if (!empCode || !fullName) {
      return res.status(400).json({ success: false, message: "empCode and fullName are required" });
    }

    // Find position by name
    let positionRecord = null;
    if (position) {
      positionRecord = await prisma.position.findFirst({
        where: { name: { equals: position, mode: "insensitive" } },
      });
    }

    // Find department by name
    let departmentRecord = null;
    if (department) {
      departmentRecord = await prisma.department.findFirst({
        where: { name: { equals: department, mode: "insensitive" }, companyId },
      });
    }

    const employee = await prisma.employee.create({
      data: {
        empCode,
        fullName,
        fullNameTH: fullNameTH || null,
        status: status || "active",
        division: department || division || null,
        isOffshore: Boolean(isOffshore),
        companyId,
        positionId: positionRecord?.id ?? null,
        departmentId: departmentRecord?.id ?? null,
      },
    });

    // Passport
    if (passport?.number) {
      await prisma.employeePassport.create({
        data: {
          employeeId: employee.id,
          passportNo: passport.number,
          expiryDate: passport.expiry ? new Date(passport.expiry) : null,
        },
      });
    }

    // Certifications → EmployeeTraining
    if (Array.isArray(certifications)) {
      for (const cert of certifications) {
        if (!cert.name) continue;
        const globalTraining = await prisma.globalTraining.findFirst({
          where: { name: { contains: cert.name, mode: "insensitive" } },
        });
        const expiry = cert.expiry ? new Date(cert.expiry) : null;
        const certStatus = expiry
          ? expiry < new Date() ? "overdue" : "completed"
          : "pending";
        await prisma.employeeTraining.create({
          data: {
            employeeId: employee.id,
            globalTrainingId: globalTraining?.id ?? null,
            rawTrainingName: cert.name,
            expiryDate: expiry,
            status: certStatus,
            isLatest: true,
          },
        });
      }
    }

    // Medical check
    if (medical?.hospital || medical?.examDate || medical?.expiryDate) {
      const medStatus =
        medical.status === "fit" ? "passed" :
        medical.status === "unfit" ? "failed" : "pending";
      await prisma.medicalCheck.create({
        data: {
          employeeId: employee.id,
          checkType: "Medical Check up",
          hospital: medical.hospital || null,
          issuedDate: medical.examDate ? new Date(medical.examDate) : null,
          expiryDate: medical.expiryDate ? new Date(medical.expiryDate) : null,
          status: medStatus,
        },
      });
    }

    return res.json({ success: true, employee });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Employee ID already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;
    const { fullName, fullNameTH, status, division, isOffshore, position, department, notes } = req.body;

    const existing = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Find position by name if provided
    let positionId = existing.positionId;
    if (position !== undefined) {
      if (position) {
        const pos = await prisma.position.findFirst({
          where: { name: { equals: position, mode: "insensitive" } },
        });
        positionId = pos?.id ?? existing.positionId;
      } else {
        positionId = null;
      }
    }

    // Find department by name if provided
    let departmentId = existing.departmentId;
    if (department !== undefined) {
      if (department) {
        const dep = await prisma.department.findFirst({
          where: { name: { equals: department, mode: "insensitive" }, companyId },
        });
        departmentId = dep?.id ?? existing.departmentId;
      } else {
        departmentId = null;
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(fullNameTH !== undefined && { fullNameTH: fullNameTH || null }),
        ...(status !== undefined && { status }),
        ...(division !== undefined && { division: division || null }),
        ...(isOffshore !== undefined && { isOffshore: Boolean(isOffshore) }),
        ...(notes !== undefined && {}),
        positionId,
        departmentId,
      },
      include: {
        position: true,
        department: true,
      },
    });

    return res.json({ success: true, employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employees/positions — list all positions for dropdowns
export const getPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true },
    });
    return res.json({ success: true, positions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Passport ────────────────────────────────────────────

// PUT /api/employees/:id/passport
export const upsertPassport = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;
    const { passportNo, expiryDate, issuedDate, issuedCountry, visaType, visaExpiryDate } = req.body;

    if (!passportNo) return res.status(400).json({ success: false, message: "passportNo is required" });

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const passport = await prisma.employeePassport.upsert({
      where: { employeeId: id },
      create: {
        employeeId: id,
        passportNo,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        issuedCountry: issuedCountry || "TH",
        visaType: visaType || null,
        visaExpiryDate: visaExpiryDate ? new Date(visaExpiryDate) : null,
      },
      update: {
        passportNo,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        issuedCountry: issuedCountry || "TH",
        visaType: visaType || null,
        visaExpiryDate: visaExpiryDate ? new Date(visaExpiryDate) : null,
      },
    });

    return res.json({ success: true, passport });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Certifications ───────────────────────────────────────

const calcCertStatus = (expiryDate) => {
  if (!expiryDate) return "pending";
  const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 60) return "due_soon";
  return "completed";
};

// POST /api/employees/:id/certifications
export const addCertification = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;
    const { name, expiry } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const globalTraining = await prisma.globalTraining.findFirst({
      where: { name: { contains: name, mode: "insensitive" } },
    });

    const expiryDate = expiry ? new Date(expiry) : null;
    const cert = await prisma.employeeTraining.create({
      data: {
        employeeId: id,
        globalTrainingId: globalTraining?.id ?? null,
        rawTrainingName: name,
        expiryDate,
        status: calcCertStatus(expiryDate),
        isLatest: true,
      },
      include: { globalTraining: { select: { id: true, name: true } } },
    });

    return res.json({ success: true, certification: cert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employees/:id/certifications/:certId
export const updateCertification = async (req, res) => {
  try {
    const { companyId } = req;
    const { id, certId } = req.params;
    const { name, expiry } = req.body;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const expiryDate = expiry ? new Date(expiry) : null;
    const cert = await prisma.employeeTraining.update({
      where: { id: certId },
      data: {
        rawTrainingName: name,
        expiryDate,
        status: calcCertStatus(expiryDate),
      },
      include: { globalTraining: { select: { id: true, name: true } } },
    });

    return res.json({ success: true, certification: cert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/employees/:id/certifications/:certId
export const deleteCertification = async (req, res) => {
  try {
    const { companyId } = req;
    const { id, certId } = req.params;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    await prisma.employeeTraining.delete({ where: { id: certId } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CV ──────────────────────────────────────────────────

// GET /api/employees/:id/cv
export const getCV = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({
      where: { id, companyId },
      select: {
        id: true, fullName: true, fullNameTH: true, empCode: true,
        position: { select: { name: true } },
      },
    });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const cv = await prisma.employeeCVProfile.findUnique({
      where: { employeeId: id },
      include: { experiences: { orderBy: { startDate: "desc" } } },
    });

    return res.json({ success: true, employee, cv: cv ?? null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employees/:id/cv
export const upsertCV = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;
    const { summary, totalYearsExp } = req.body;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const cv = await prisma.employeeCVProfile.upsert({
      where: { employeeId: id },
      create: { employeeId: id, summary: summary || null, totalYearsExp: Number(totalYearsExp) || 0 },
      update: { summary: summary || null, totalYearsExp: Number(totalYearsExp) || 0 },
      include: { experiences: { orderBy: { startDate: "desc" } } },
    });

    return res.json({ success: true, cv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employees/:id/cv/experiences
export const addExperience = async (req, res) => {
  try {
    const { companyId } = req;
    const { id } = req.params;
    const { company, position, startDate, endDate, description } = req.body;

    if (!company || !position || !startDate) {
      return res.status(400).json({ success: false, message: "company, position, startDate required" });
    }

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    let cvProfile = await prisma.employeeCVProfile.findUnique({ where: { employeeId: id } });
    if (!cvProfile) {
      cvProfile = await prisma.employeeCVProfile.create({ data: { employeeId: id } });
    }

    const experience = await prisma.employeeCVExperience.create({
      data: {
        cvProfileId: cvProfile.id,
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
      },
    });

    return res.json({ success: true, experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employees/:id/cv/experiences/:expId
export const updateExperience = async (req, res) => {
  try {
    const { companyId } = req;
    const { id, expId } = req.params;
    const { company, position, startDate, endDate, description } = req.body;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const experience = await prisma.employeeCVExperience.update({
      where: { id: expId },
      data: {
        company,
        position,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
      },
    });

    return res.json({ success: true, experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/employees/:id/cv/experiences/:expId
export const deleteExperience = async (req, res) => {
  try {
    const { companyId } = req;
    const { id, expId } = req.params;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    await prisma.employeeCVExperience.delete({ where: { id: expId } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
