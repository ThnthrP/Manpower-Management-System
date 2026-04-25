import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Booking = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleType = queryParams.get("type");

  const [mode, setMode] = useState("person");
  const [loading, setLoading] = useState(false);
  const { userData, backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  // const hasProfileData =
  //   userData?.name && userData?.phone && userData?.department;
  // const disableName = !!userData?.name;
  // const disablePhone = !!userData?.phone;
  // const disableDept = !!userData?.department;

  const initialState = {
    origin: "",
    destination: "",
    department: "",
    name: "",
    position: "",
    phone: "",
    peopleCount: "",
    purpose: "",
    date: "",
    time: "",
    durationHours: "",
    durationMinutes: "",
    quantity: "",
    size: "",
    weight: "",
    image: null,
  };

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (userData) {
      setForm((prev) => ({
        ...prev,
        name: userData.name || "",
        phone: userData.phone || "",
        department: userData.department || "",
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formData = new FormData();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload =
        mode === "person"
          ? {
              type: "person",
              vehicleType,
              origin: form.origin,
              destination: form.destination,

              peopleCount: Number(form.peopleCount),

              name: form.name,
              phone: form.phone,
              department: form.department,
              position: form.position,

              purpose: form.purpose,
              date: form.date,
              time: form.time,
            }
          : {
              type: "cargo",
              vehicleType,
              origin: form.origin,
              destination: form.destination,

              // 👤 auto fill
              name: form.name,
              phone: form.phone,
              department: form.department,

              // 📦 flat แล้ว
              quantity: Number(form.quantity),
              size: form.size,
              weight: Number(form.weight),

              purpose: form.purpose,
              date: form.date,
              time: form.time,
            };

      // append payload
      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
      });

      // 🔥 append image
      if (form.image) {
        formData.append("image", form.image);
      }

      const { data } = await axios.post(
        backendUrl + "/api/bookings",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        toast.success("จองสำเร็จ");
        setForm(initialState);
        navigate("/my-bookings");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const inputClass = (disabled) =>
  //   `w-full border px-3 py-1 rounded text-sm mt-1 ${
  //     disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
  //   }`;

  // const inputBase = (disabled) =>
  //   `"w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" ${
  //     disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
  //   }`;

  const inputBase = (disabled = false) =>
    `w-full border px-3 py-2 rounded-md text-sm 
   focus:outline-none focus:ring-2 focus:ring-blue-500
   ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-800"}`;

  const isDeptEditable = !form.department;
  const isPhoneEditable = !form.phone;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">สร้างรายการจอง</h1>
          <p className="text-sm text-gray-500">ประเภทรถ: {vehicleType}</p>
        </div>

        {/* CARD */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          {/* TOGGLE */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("person")}
              className={`flex-1 py-2 rounded-md text-sm font-medium cursor-pointer ${
                mode === "person"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              👤 ส่งคน
            </button>

            <button
              onClick={() => setMode("cargo")}
              className={`flex-1 py-2 rounded-md text-sm font-medium cursor-pointer ${
                mode === "cargo"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              📦 ส่งของ
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SECTION: USER INFO */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">
                ข้อมูลผู้จอง
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DEPARTMENT */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    แผนก
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    disabled={!isDeptEditable}
                    className={inputBase(!isDeptEditable)}
                  >
                    <option value="" className="text-gray-400">
                      กรุณาเลือก
                    </option>
                    <option>MANPOWER</option>
                    <option>CISS</option>
                    <option>CES</option>
                    <option>QAQC</option>
                    <option>HR</option>
                  </select>
                </div>

                {/* NAME */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ชื่อ
                  </label>

                  <input
                    value={form.name}
                    disabled
                    className={inputBase(true)}
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    เบอร์โทร
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="เช่น 0812345678"
                    disabled={!isPhoneEditable}
                    className={inputBase(!isPhoneEditable)}
                  />
                </div>
              </div>
            </div>

            {/* SECTION: ROUTE */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">
                เส้นทาง
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ORIGIN */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ต้นทาง
                  </label>

                  <select
                    name="origin"
                    value={form.origin || ""}
                    onChange={handleChange}
                    className={`${inputBase()} cursor-pointer`}
                    required
                  >
                    <option>กรุณาเลือก</option>
                    <option value="สมุทรสาคร">สมุทรสาคร</option>
                    <option value="พระราม 2">พระราม 2</option>
                  </select>
                </div>

                {/* DESTINATION */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ปลายทาง
                  </label>

                  <select
                    name="destination"
                    value={form.destination || ""}
                    onChange={handleChange}
                    className={`${inputBase()} cursor-pointer`}
                    required
                  >
                    <option>กรุณาเลือก</option>
                    <option value="สมุทรสาคร">สมุทรสาคร</option>
                    <option value="พระราม 2">พระราม 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: PERSON */}
            {mode === "person" && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  รายละเอียดผู้โดยสาร
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* จำนวนคน */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      จำนวนคน
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        name="peopleCount"
                        value={form.peopleCount || ""}
                        onChange={handleChange}
                        placeholder="กรอกจำนวนคน"
                        className={`${inputBase()} pr-10 cursor-pointer`}
                        min="1"
                      />

                      {/* suffix */}
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        คน
                      </span>
                    </div>
                  </div>

                  {/* วัตถุประสงค์ */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      วัตถุประสงค์
                    </label>

                    <select
                      name="purpose"
                      value={form.purpose || ""}
                      onChange={handleChange}
                      className={`${inputBase()} cursor-pointer`}
                      required
                    >
                      <option value="" disabled hidden>
                        กรุณาเลือก
                      </option>
                      <option value="รับ-ส่งพนักงาน">รับ-ส่งพนักงาน</option>
                      <option value="ไปหน้างาน">ไปหน้างาน</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: CARGO */}
            {mode === "cargo" && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  รายละเอียดสินค้า
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* จำนวน */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      จำนวน
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        value={form.quantity || ""}
                        onChange={handleChange}
                        placeholder="กรอกจำนวน"
                        className={`${inputBase()} pr-10 cursor-pointer`}
                        min="1"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        ชิ้น
                      </span>
                    </div>
                  </div>

                  {/* ขนาด */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      ขนาด
                    </label>

                    <select
                      name="size"
                      value={form.size || ""}
                      onChange={handleChange}
                      className={`${inputBase()} cursor-pointer`}
                    >
                      <option value="" disabled hidden>
                        กรุณาเลือก
                      </option>
                      <option value="เล็ก">เล็ก</option>
                      <option value="ใหญ่">ใหญ่</option>
                    </select>
                  </div>

                  {/* น้ำหนัก */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      น้ำหนัก
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        name="weight"
                        value={form.weight || ""}
                        onChange={handleChange}
                        placeholder="กรอกน้ำหนัก"
                        className={`${inputBase()} pr-12 cursor-pointer`}
                        min="0"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        กก.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1 mt-2">
                    รูปสินค้า (ถ้ามี)
                  </label>

                  <div className="flex items-center gap-4">
                    {/* upload box */}
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition">
                      <span className="text-xs text-gray-500 text-center px-2">
                        คลิกเพื่ออัปโหลด
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setForm({ ...form, image: e.target.files[0] })
                        }
                        className="hidden"
                      />
                    </label>

                    {/* preview */}
                    {form.image && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(form.image)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: DATE */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">
                เวลาใช้งาน
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* วันที่ */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    วันที่
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date || ""}
                    onChange={handleChange}
                    className={inputBase()}
                    required
                  />
                </div>

                {/* เวลาเริ่ม */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    เวลาเริ่ม
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime || ""}
                    onChange={handleChange}
                    className={inputBase()}
                    required
                  />
                </div>

                {/* เวลาสิ้นสุด */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    เวลาสิ้นสุด
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime || ""}
                    onChange={handleChange}
                    className={inputBase()}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "กำลังจอง..." : "ยืนยันการจอง"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;

// return (
//   <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
//     <Navbar />

//     {/* 🔥 card ใหญ่ขึ้น + แน่นขึ้น */}
//     <div className="max-w-5xl mx-auto mt-6 bg-white px-8 py-6 rounded-2xl shadow-lg">
//       <h1 className="text-xl font-bold text-center mb-4">
//         📦 สร้างรายการจอง
//       </h1>

//       {/* 🔥 toggle */}
//       <div className="flex gap-2 mb-4">
//         <button
//           onClick={() => setMode("person")}
//           className={`flex-1 py-2 rounded-md text-sm ${
//             mode === "person" ? "bg-indigo-600 text-white" : "bg-gray-200"
//           }`}
//         >
//           👤 ส่งคน
//         </button>

//         <button
//           onClick={() => setMode("cargo")}
//           className={`flex-1 py-2 rounded-md text-sm ${
//             mode === "cargo" ? "bg-indigo-600 text-white" : "bg-gray-200"
//           }`}
//         >
//           📦 ส่งของ
//         </button>
//       </div>

//       <p className="text-xs text-gray-500 mb-2">
//         ประเภทรถ: <b>{vehicleType}</b>
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-2">
//         <div className="grid grid-cols-3 gap-4">
//           {/* 🔥 แผนก */}
//           <div>
//             <label className="text-xs text-gray-600">ฝ่าย / แผนก</label>
//             <select
//               name="department"
//               value={form.department}
//               onChange={handleChange}
//               // disabled={hasProfileData}
//               disabled={disableDept}
//               className={inputClass(disableDept)}
//             >
//               <option value="">กรุณาเลือก</option>
//               <option>MANPOWER</option>
//               <option>CISS</option>
//               <option>CES</option>
//               <option>QAQC</option>
//               <option>HR</option>
//             </select>
//           </div>

//           <div>
//             <label className="text-xs text-gray-600">ชื่อผู้ขอใช้รถ</label>
//             <input
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               disabled
//               className="w-full border px-3 py-1 rounded text-sm mt-1 bg-gray-100 text-gray-500 cursor-not-allowed"
//             />
//           </div>

//           <div>
//             <label className="text-xs text-gray-600">เบอร์โทร</label>
//             <input
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               // disabled={hasProfileData}
//               disabled={disablePhone}
//               className={inputClass(disablePhone)}
//             />
//           </div>
//         </div>

//         {/* 🔥 ต้นทาง + ปลายทาง */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="text-xs text-gray-600">ต้นทาง</label>
//             <select
//               name="origin"
//               onChange={handleChange}
//               className="w-full border px-3 py-1 rounded text-sm mt-1"
//               required
//             >
//               <option value="">กรุณาเลือก</option>
//               <option>สาขาสมุทรสาคร</option>
//               <option>สาขาพระราม 2</option>
//               <option>สาขาสงขลา</option>
//             </select>
//           </div>

//           <div>
//             <label className="text-xs text-gray-600">ปลายทาง</label>
//             <select
//               name="destination"
//               onChange={handleChange}
//               className="w-full border px-3 py-1 rounded text-sm mt-1"
//               required
//             >
//               <option value="">กรุณาเลือก</option>
//               <option>สาขาสมุทรสาคร</option>
//               <option>สาขาพระราม 2</option>
//               <option>สาขาสงขลา</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           {/* 🔥 วัตถุประสงค์ */}
//           {mode === "person" && (
//             <div>
//               <label className="text-xs text-gray-600">วัตถุประสงค์</label>
//               <select
//                 name="purpose"
//                 onChange={handleChange}
//                 className="w-full border px-3 py-1 rounded text-sm mt-1"
//               >
//                 <option value="">กรุณาเลือก</option>
//                 <option>รับ-ส่งพนักงาน</option>
//                 <option>ขนส่งสินค้า</option>
//                 <option>ไปหน้างาน</option>
//               </select>
//             </div>
//           )}

//           {mode === "person" && (
//             <div>
//               <label className="text-xs text-gray-600">จำนวนคน</label>

//               <div className="flex mt-1">
//                 <input
//                   type="number"
//                   name="peopleCount"
//                   onChange={handleChange}
//                   className="w-full border rounded-l-md px-3 py-1 text-sm"
//                   placeholder="จำนวน"
//                 />
//                 <span className="bg-gray-100 border border-l-0 px-3 py-1 rounded-r-md text-sm">
//                   คน
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 🔥 ส่งของ */}
//         {mode === "cargo" && (
//           <div className="grid grid-cols-3 gap-4">
//             {/* จำนวน */}
//             <div>
//               <label className="text-xs text-gray-600">จำนวน</label>

//               <div className="flex mt-1">
//                 <input
//                   type="number"
//                   name="quantity"
//                   onChange={handleChange}
//                   className="w-full border rounded-l-md px-3 py-1 text-sm"
//                   placeholder="จำนวน"
//                 />

//                 <span className="bg-gray-100 border border-l-0 px-3 py-1 rounded-r-md text-sm">
//                   ชิ้น
//                 </span>
//               </div>
//             </div>

//             {/* ขนาด (dropdown) */}
//             <div>
//               <label className="text-xs text-gray-600">ขนาด</label>
//               <select
//                 name="size"
//                 onChange={handleChange}
//                 className="w-full border px-3 py-1 rounded text-sm mt-1"
//               >
//                 <option value="">เลือกขนาด</option>
//                 <option value="small">เล็ก</option>
//                 <option value="large">ใหญ่</option>
//               </select>
//             </div>

//             {/* น้ำหนัก + กก. */}
//             <div>
//               <label className="text-xs text-gray-600">น้ำหนัก</label>
//               <div className="flex mt-1">
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   name="weight"
//                   onChange={handleChange}
//                   className="w-full border rounded-l-md px-3 py-1 text-sm"
//                   placeholder="น้ำหนัก"
//                 />
//                 <span className="bg-gray-100 border border-l-0 px-3 py-1 rounded-r-md text-sm">
//                   กก.
//                 </span>
//               </div>
//             </div>

//             {/* รูป */}
//             <div className="col-span-3">
//               <label className="text-xs text-gray-600">รูปของ</label>

//               <div className="flex mt-1">
//                 {/* ปุ่มเลือกไฟล์ */}
//                 <label className="px-3 py-1 bg-gray-200 border rounded-l-md text-sm cursor-pointer hover:bg-gray-300">
//                   Choose File
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) =>
//                       setForm({ ...form, image: e.target.files[0] })
//                     }
//                     className="hidden"
//                   />
//                 </label>

//                 {/* ชื่อไฟล์ */}
//                 <div className="flex-1 border border-l-0 px-3 py-1 rounded-r-md text-sm text-gray-500 truncate">
//                   {form.image ? form.image.name : "No file chosen"}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* วันที่ + เวลา */}
//         <div>
//           <label className="text-xs text-gray-600">
//             วัน / เวลา / ระยะเวลาใช้รถ
//           </label>

//           <div className="grid grid-cols-4 gap-3 mt-1 items-end">
//             {/* วันที่ */}
//             <div>
//               <label className="text-[10px] text-gray-400">วันที่</label>
//               <input
//                 type="date"
//                 name="date"
//                 onChange={handleChange}
//                 className="w-full border px-3 py-1 rounded text-sm"
//               />
//             </div>

//             {/* เวลา */}
//             <div>
//               <label className="text-[10px] text-gray-400">เวลา</label>
//               <input
//                 type="time"
//                 name="time"
//                 onChange={handleChange}
//                 className="w-full border px-3 py-1 rounded text-sm"
//               />
//             </div>

//             {/* ชั่วโมง */}
//             <div className="flex">
//               <input
//                 type="number"
//                 min="0"
//                 name="durationHours"
//                 value={form.durationHours || ""}
//                 onChange={handleChange}
//                 className="w-full border rounded-l-md px-3 py-1 text-sm"
//                 placeholder="ชม."
//               />
//               <span className="bg-gray-100 border border-l-0 px-3 py-1 rounded-r-md text-sm">
//                 ชม.
//               </span>
//             </div>

//             {/* นาที */}
//             <div className="flex">
//               <input
//                 type="number"
//                 min="0"
//                 max="59"
//                 name="durationMinutes"
//                 value={form.durationMinutes || ""}
//                 onChange={handleChange}
//                 className="w-full border rounded-l-md px-3 py-1 text-sm"
//                 placeholder="นาที"
//               />
//               <span className="bg-gray-100 border border-l-0 px-3 py-1 rounded-r-md text-sm">
//                 นาที
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* 🔘 submit */}
//         <button
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm hover:opacity-90 mt-3"
//         >
//           {loading ? "กำลังจอง..." : "ยืนยันการจอง"}
//         </button>
//       </form>
//     </div>
//   </div>
// );
// };

// export default Booking;
