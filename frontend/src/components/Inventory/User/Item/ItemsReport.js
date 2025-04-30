// Dashboard.js
import React from 'react';
import ReportSection1 from './ReportSection1';
import ReportSection2 from './ReportSection2';
import ReportSection3 from './ReportSection3';
import ReportSection4 from './ReportSection4';
import ReportSection5 from './ReportSection5';
import ReportSection6 from './ReportSection6';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">Inventory Report</h1>

      {/* First two sections side-by-side */}
      <div className="flex flex-col md:flex-row md:space-x-6 mb-6">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <ReportSection1 />
        </div>
        <div className="md:w-1/2">
          <ReportSection2 />
        </div>
      </div>

      {/* Section 3 */}
      <div className="mb-6">
        <ReportSection3 />
      </div>

      {/* Section 4 and 5 side-by-side */}
      <div className="flex flex-col md:flex-row md:space-x-6 mb-6">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <ReportSection4 />
        </div>
        <div className="md:w-1/2">
          <ReportSection5 />
        </div>
      </div>

      {/* Section 6 */}
      <div className="mb-6">
        <ReportSection6 />
      </div>
    </div>
  );
};

export default Dashboard;
