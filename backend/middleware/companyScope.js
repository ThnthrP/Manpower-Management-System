// companyScope.js
// ใช้หลัง userAuth เสมอ
// ฉีด req.companyId จาก user ที่ login อยู่
// ป้องกัน user บริษัท A เข้าถึงข้อมูลบริษัท B โดยอัตโนมัติ

const companyScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      message: "No company assigned to this user",
    });
  }

  req.companyId = req.user.companyId;
  next();
};

// สำหรับ route ที่ต้องการข้ามบริษัท (Intercompany borrowing)
// ยังคง attach companyId ของตัวเอง แต่ไม่ restrict การอ่านข้ามบริษัท
export const intercompanyScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  req.companyId = req.user.companyId;
  req.isIntercompany = true;
  next();
};

export default companyScope;
