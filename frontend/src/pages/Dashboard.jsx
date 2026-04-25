import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// import truck10 from "../assets/truck10.png";
// import truck6 from "../assets/truck6.png";
// import pickup from "../assets/pickup.png";
// import van from "../assets/van.png";
// import car from "../assets/car.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [groupedVehicles, setGroupedVehicles] = useState({});

  const vehicleTypes = [
    { key: "truck10", label: "รถ 10 ล้อ" },
    { key: "truck6", label: "รถ 6 ล้อ" },
    { key: "pickup", label: "รถกระบะ" },
    { key: "van", label: "รถตู้" },
    { key: "car", label: "รถเก๋ง" },
  ];

  // useEffect(() => {
  //   fetchVehicles();
  // }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const { data } = await axios.get(
          backendUrl + "/api/vehicles/available",
        );

        if (data.success) {
          const mapped = {};

          data.data.forEach((item) => {
            mapped[item.type] = item._count.type;
          });

          setGroupedVehicles(mapped);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">รถที่พร้อมใช้งาน</h1>
          <p className="text-sm text-gray-500">เลือกรถเพื่อทำการจอง</p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicleTypes.map((type) => (
            <div
              key={type.key}
              className="bg-white border rounded-xl p-5 hover:shadow-md hover:-translate-y-1 transition flex flex-col justify-between cursor-pointer"
            >
              {/* IMAGE */}
              <div className="flex justify-center mb-4">
                <img
                  // src={vehicleImages[type.key]}
                  alt={type.label}
                  className="h-20 object-contain"
                />
              </div>

              {/* INFO */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {type.label}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  จำนวน {groupedVehicles[type.key] || 0} คัน
                </p>
              </div>

              {/* BUTTON */}
              <button
                onClick={() => navigate(`/booking?type=${type.key}`)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium 
hover:bg-blue-700 active:scale-95 transition cursor-pointer"
              >
                จองรถ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// return (
//   <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
//     <Navbar />

//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
//         🚗 Available Vehicles
//       </h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {vehicleTypes.map((type) => (
//           <div
//             key={type.key}
//             className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 hover:shadow-lg transition"
//           >
//             <img
//               src={vehicleImages[type.key]}
//               alt={type.label}
//               className="w-20 h-20 object-contain"
//             />

//             <div className="flex-1">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 {type.label}
//               </h2>

//               <p className="text-gray-600 text-sm mb-2">
//                 จำนวน: {groupedVehicles[type.key] || 0} คัน
//               </p>

//               <button
//                 onClick={() => navigate(`/booking?type=${type.key}`)}
//                 className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-1.5 rounded-md text-sm hover:opacity-90 transition"
//               >
//                 จอง
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );
// };

// export default Dashboard;
