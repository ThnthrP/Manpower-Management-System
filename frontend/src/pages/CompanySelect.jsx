import { useNavigate } from "react-router-dom";

const CompanySelect = () => {
  const navigate = useNavigate();

  const handleSelect = (company) => {
    localStorage.setItem("company", company);
    navigate("/login");
  };

  const companies = [
    {
      name: "CES",
      label: "Construction Services",
      desc: "Project execution, manpower planning, and construction operations",
      key: "CES",
      logo: "/ces_logo.png",
    },
    {
      name: "EXPERT TEAM",
      label: "Maintenance",
      desc: "Specialized workforce, offshore support, and technical services",
      key: "EXPERT",
      logo: "/experteam_logo.png",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4
      bg-gradient-to-br from-blue-50 via-white to-indigo-100"
    >
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">เลือกบริษัทของคุณ</h1>
        <p className="text-gray-500 mt-3 text-sm">
          Please select your company to continue
        </p>
      </div>

      {/* CARDS */}
      <div className="flex flex-col sm:flex-row gap-8">
        {companies.map((company) => (
          <div
            key={company.key}
            onClick={() => handleSelect(company.key)}
            className="w-72 bg-white/80 backdrop-blur-md border border-gray-200 
                       rounded-2xl p-6 cursor-pointer text-center
                       shadow-md hover:shadow-2xl 
                       hover:-translate-y-2 hover:scale-[1.02]
                       transition-all duration-300 ease-in-out"
          >
            {/* LOGO */}
            <div className="flex justify-center mb-4">
              <img
                src={company.logo}
                alt={company.name}
                className="h-16 object-contain"
              />
            </div>

            {/* NAME */}
            <h2 className="text-lg font-semibold text-gray-800">
              {company.name}
            </h2>

            {/* LABEL */}
            <p className="text-sm text-gray-500 mt-1">{company.label}</p>

            {/* DESCRIPTION */}
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              {company.desc}
            </p>
          </div>
        ))}
      </div>

      {/* FOOTER (optional but pro look) */}
      <p className="mt-12 text-xs text-gray-400">
        © Experteam Manpower Management System
      </p>
    </div>
  );
};

export default CompanySelect;
