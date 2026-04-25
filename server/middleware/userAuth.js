import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized. Login Again",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode.userId) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    // 🔥 โหลด user + role + permission
    const user = await prisma.user.findUnique({
      where: { id: tokenDecode.userId },
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
      },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 เก็บ user ทั้งก้อน
    req.user = user;

    // (optional) เผื่อใช้
    req.userId = user.id;

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export default userAuth;
