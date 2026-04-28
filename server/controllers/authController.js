import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import transporter from "../config/nodemailer.js";
import {
  // EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // หา role "user"
    // const userRole = await prisma.role.findUnique({
    //   where: { name: "user" },
    // });

    const userRole = await prisma.role.findUnique({
      where: { name: "pe" },
    });

    if (!userRole) {
      return res.json({ success: false, message: "Role not found" });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      // secure: false,
      // sameSite: "lax",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
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
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // role: user.role,
        role: user.role.name,
        permissions: user.role.permissions.map(
          (p) => `${p.permission.resource}:${p.permission.action}`,
        ),
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// export const sendVerifyOtp = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (user.isAccountVerified) {
//       return res.json({ success: false, message: "Account Already verified" });
//     }

//     const otp = String(Math.floor(100000 + Math.random() * 900000));

//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         verifyOtp: otp,
//         verifyOtpExpireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       },
//     });

//     const mailOption = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: "Account Verification OTP",
//       html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
//         "{{email}}",
//         user.email,
//       ),
//     };

//     await transporter.sendMail(mailOption);

//     res.json({ success: true, message: "Verification OTP Sent on Email" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// export const verifyEmail = async (req, res) => {
//   const { otp } = req.body;
//   const userId = req.userId;

//   if (!userId || !otp) {
//     return res.json({ success: false, message: "Missing Details" });
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     if (user.verifyOtp !== otp) {
//       return res.json({ success: false, message: "Invalid OTP" });
//     }

//     if (!user.verifyOtpExpireAt) {
//       return res.json({ success: false, message: "OTP not requested" });
//     }

//     if (new Date(user.verifyOtpExpireAt) < new Date()) {
//       return res.json({ success: false, message: "OTP Expired" });
//     }

//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         isAccountVerified: true,
//         verifyOtp: "",
//         verifyOtpExpireAt: null,
//       },
//     });

//     return res.json({ success: true, message: "Email verified successfully" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpireAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset User Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "Missing fields" });
    }

    if (user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (!user.resetOtpExpireAt) {
      return res.json({ success: false, message: "OTP not requested" });
    }

    if (new Date(user.resetOtpExpireAt) < new Date()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: "",
        resetOtpExpireAt: null,
      },
    });

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
