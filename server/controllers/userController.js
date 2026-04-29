import prisma from "../config/prisma.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        company: true,
      },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,

        // role: user.role?.name || null,

        role: {
          id: user.role?.id,
          name: user.role?.name,
        },

        company: {
          name: user.company?.name || null,
        },

        permissions:
          user.role?.permissions?.map(
            (p) => `${p.permission.resource}:${p.permission.action}`,
          ) || [],
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, phone, department } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        department,
      },
    });

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (req.user.id === userId) {
      return res.json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany();

    res.json({
      success: true,
      roles,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        company: true,
      },
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany();

    res.json({
      success: true,
      companies,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUserCompany = async (req, res) => {
  try {
    const { userId, companyId } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { companyId },
    });

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
