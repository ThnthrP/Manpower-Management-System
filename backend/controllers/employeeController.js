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
// Returns: positions with required trainings per client (like reference UI)
export const getTrainingMatrix = async (req, res) => {
  try {
    const { clientCode } = req.query;

    // Get all clients with contracts that have position requirements
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    // Build where clause — filter by client if provided
    const contractWhere = clientCode
      ? { client: { code: clientCode } }
      : {};

    // Get position requirements grouped by position
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

    // Group by position
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
