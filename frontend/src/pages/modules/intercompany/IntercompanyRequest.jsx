const IntercompanyRequest = () => (
  <div className="p-6">
    <div className="mb-4">
      <span className="text-xs text-orange-500 uppercase tracking-wider font-semibold">Intercompany</span>
      <h1 className="text-2xl font-bold text-gray-800 mt-1">Intercompany Borrow Request</h1>
      <p className="text-gray-500 text-sm mt-1">
        ขอยืมพนักงานจากบริษัทในเครือ — ส่ง Request → บริษัทต้นทาง Approve → รวมทีม
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-500 font-semibold uppercase mb-1">CES</p>
        <p className="text-sm text-gray-600">รับ / ส่งคำขอยืมพนักงาน</p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-500 font-semibold uppercase mb-1">EXPERTEAM</p>
        <p className="text-sm text-gray-600">รับ / ส่งคำขอยืมพนักงาน</p>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-xs text-orange-500 font-semibold uppercase mb-1">YARD 2</p>
        <p className="text-sm text-gray-600">รับ / ส่งคำขอยืมพนักงาน</p>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
      🚧 Module under construction — coming soon
    </div>
  </div>
);

export default IntercompanyRequest;
