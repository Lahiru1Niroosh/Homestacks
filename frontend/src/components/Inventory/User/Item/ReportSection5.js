import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Importing the arrow icons

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportSection5 = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false); // Track expanded state

  const currentUser = { id: "123456" }; // Replace with actual logged-in user ID

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setChartData(null);
    setTableData([]);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/items/increased-summary/${currentUser.id}/${startDate}/${endDate}`
      );

      const items = response.data.items;

      if (!items || items.length === 0) {
        setError("No data available for the selected date range.");
        return;
      }

      // Prepare data for chart
      const labels = items.map(item => `${item.code} - ${item.name}`);
      const totalCosts = items.map(item => item.totalCost);

      const chartData = {
        labels: labels,
        datasets: [
          {
            label: "Total Cost (price × purchased qty)",
            data: totalCosts,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };

      // Prepare table data
      const tableData = items.map(item => ({
        code: item.code,
        name: item.name,
        totalCost: item.totalCost.toFixed(2),
      }));

      setChartData(chartData);
      setTableData(tableData);
    } catch (err) {
      setError("Error fetching data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full mx-auto mt-6 transform transition-transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
        Items Total Cost For a Given Date Range
        </h2>
        <button
          onClick={() => setExpanded(!expanded)} // Toggle expanded state
          className="text-gray-500 hover:text-gray-700"
        >
          {expanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
        </button>
      </div>

      {expanded && ( // Show content only if expanded is true
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Generate Report
              </button>
            </div>
          </form>

          {loading && <p className="text-gray-600 mt-4 text-center">Loading...</p>}
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          {chartData && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-center mb-4">Total Cost Chart</h3>
              <div className="bg-white rounded-xl border p-4 shadow-md">
                <Bar data={chartData} />
              </div>
            </div>
          )}

          {tableData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-center mb-2">Transaction Table</h4>

              <div className="border border-gray-300 rounded-md overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 border">Item Code</th>
                      <th className="p-2 border">Item Name</th>
                      <th className="p-2 border">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 border">{row.code}</td>
                        <td className="p-2 border">{row.name}</td>
                        <td className="p-2 border">{row.totalCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportSection5;
