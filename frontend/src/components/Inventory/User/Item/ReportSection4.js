import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Importing arrow icons

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportSection4 = () => {
  const [itemCode, setItemCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [action, setAction] = useState("decrease");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); // State to control expansion

  const currentUser = { id: "123456" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setChartData(null);
    setTableData([]);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/items/item-transactions/${itemCode}/${currentUser.id}/${startDate}/${endDate}/${action}`
      );

      const { itemDetails, transactions } = response.data;

      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const dates = sortedTransactions.map((t) =>
        new Date(t.createdAt).toLocaleDateString()
      );
      const quantities = sortedTransactions.map((t) => t.quantity);

      setChartData({
        labels: dates,
        datasets: [
          {
            label: action === "decrease" ? "Quantity Consumed" : "Quantity Purchased", // Dynamic label based on action
            data: quantities,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });

      setTableData(
        sortedTransactions.map((t) => ({
          date: new Date(t.createdAt).toLocaleDateString(),
          quantity: t.quantity,
        }))
      );
    } catch (err) {
      setError("Error fetching data or no data available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-full w-full mx-auto mt-6 border border-gray-100 transition-transform transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
          Item Consumption / Purchase For a Given Date Range
        </h2>

        <button
          className="text-xl"
          onClick={() => setIsExpanded(!isExpanded)} // Toggle the expansion
        >
          {isExpanded ? <AiOutlineUp /> : <AiOutlineDown />}
        </button>
      </div>

      {isExpanded && (
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="itemCode" className="block text-sm font-medium text-gray-700">
                  Item Code
                </label>
                <input
                  type="text"
                  id="itemCode"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                  Action
                </label>
                <select
                  id="action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                >
                  <option value="decrease">Consume</option>
                  <option value="increase">Purchase</option>
                </select>
              </div>
            </div>

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
                Get Report
              </button>
            </div>
          </form>

          {loading && <p className="text-gray-600 mt-4 text-center">Loading...</p>}
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          {chartData && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-center mb-4">Transaction Chart</h3>
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
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 border">{row.date}</td>
                        <td className="p-2 border">{row.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportSection4;
