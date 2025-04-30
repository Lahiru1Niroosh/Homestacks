import React, { useState } from "react";
import axios from "axios";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Importing arrow icons

const ReportSection3 = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [dateRangeError, setDateRangeError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // To track expansion

  const dateRange = `( ${startDate} to ${endDate} )`;
  const currentUser = { id: "123456" };

  const handleDateRangeQuery = async (type) => {
    if (!startDate || !endDate) {
      setDateRangeError("Both start and end dates are required.");
      return;
    }

    setDateRangeLoading(true);
    setDateRangeError("");
    setSelectedItem(null);
    setSelectedType("");

    try {
      const [mostRes, leastRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/items/max-decrease-range/${currentUser.id}?startDate=${startDate}&endDate=${endDate}`),
        axios.get(`http://localhost:5000/api/items/min-decrease-range/${currentUser.id}?startDate=${startDate}&endDate=${endDate}`)
      ]);

      if (type === "most") {
        setSelectedItem(mostRes.data);
        setSelectedType("most");
      } else {
        setSelectedItem(leastRes.data);
        setSelectedType("least");
      }
    } catch (err) {
      setDateRangeError("No data found for the selected date range.");
    } finally {
      setDateRangeLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-full w-full mx-auto mt-6 border border-gray-100 transition-transform transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
          Most/Least Consumed Item for a Given Date Range
        </h2>

        <button
          className="text-xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <AiOutlineUp /> : <AiOutlineDown />}
        </button>
      </div>

      {dateRangeError && (
        <p className="text-red-500 text-sm text-center mb-4">{dateRangeError}</p>
      )}

      {isExpanded && (
        <div className="flex flex-col items-center">
        <div className="space-y-4 w-full ">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm text-gray-700">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="w-full p-2 border rounded-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm text-gray-700">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="w-full p-2 border rounded-md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={() => handleDateRangeQuery("most")}
              disabled={dateRangeLoading}
            >
              {dateRangeLoading ? "Loading..." : "Most Consumed Item"}
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={() => handleDateRangeQuery("least")}
              disabled={dateRangeLoading}
            >
              {dateRangeLoading ? "Loading..." : "Least Consumed Item"}
            </button>
          </div>

          {selectedItem && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
                {selectedType === "most"
                  ? `Most Consumed Item ${dateRange}`
                  : `Least Consumed Item ${dateRange}`}
              </h3>
              <table className="w-full text-sm text-gray-700 border border-collapse rounded-md overflow-hidden">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Item Code:</td>
                    <td className="p-2">{selectedItem.itemDetails.code}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Name:</td>
                    <td className="p-2">{selectedItem.itemDetails.name}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Type:</td>
                    <td className="p-2">{selectedItem.itemDetails.type}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Description:</td>
                    <td className="p-2">{selectedItem.itemDetails.desc}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Total Consumption:</td>
                    <td className="p-2">{selectedItem.totalDecreased}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Remaining Quantity:</td>
                    <td className="p-2">{selectedItem.itemDetails.qty}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Unit:</td>
                    <td className="p-2">{selectedItem.itemDetails.uom}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default ReportSection3;
