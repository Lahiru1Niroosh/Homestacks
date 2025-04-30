import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Importing arrow icons

const ReportSection6 = () => {
  const [restockItems, setRestockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false); // Track expanded state

  const currentUser = { id: "123456" }; // Replace with actual logged-in user ID

  useEffect(() => {
    const fetchRestockItems = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`http://localhost:5000/api/items?user_id=${currentUser.id}`);
        const allItems = response.data || [];

        const restockNeeded = allItems.filter(item => {
          const qty = parseFloat(item.qty);
          const reorderLevel = parseFloat(item.reorderLevel);
          return !isNaN(qty) && !isNaN(reorderLevel) && qty <= reorderLevel;
        });

        setRestockItems(restockNeeded);
      } catch (err) {
        setError("Failed to fetch items.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestockItems();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Items to be Restocked", 14, 20);

    const tableData = restockItems.map(item => [
      item.code,
      item.name,
      item.type,
      item.desc,
      item.qty,
      item.reorderLevel,
      item.uom,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [[
        "Item Code", "Name", "Type", "Description", "Qty", "Reorder Level", "UOM"
      ]],
      body: tableData,
    });

    doc.save("restock-report.pdf");
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl w-full mx-auto mt-10 transform transition-transform hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-600" >
          Items Need To Be Restocked
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
          {loading && <p className="text-gray-600">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && restockItems.length === 0 && (
            <p className="text-green-600 text-center">All items are sufficiently stocked.</p>
          )}

          {restockItems.length > 0 && (
            <>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Download as PDF
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-300 shadow text-sm">
                  <thead>
                    <tr className="bg-blue-100 text-left text-blue-800 font-semibold">
                      <th className="border px-3 py-2">Item Code</th>
                      <th className="border px-3 py-2">Name</th>
                      <th className="border px-3 py-2">Type</th>
                      <th className="border px-3 py-2">Description</th>
                      <th className="border px-3 py-2 text-center">Qty</th>
                      <th className="border px-3 py-2 text-center">Reorder Level</th>
                      <th className="border px-3 py-2">UOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restockItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50">
                        <td className="border px-3 py-2">{item.code}</td>
                        <td className="border px-3 py-2">{item.name}</td>
                        <td className="border px-3 py-2">{item.type}</td>
                        <td className="border px-3 py-2">{item.desc}</td>
                        <td className="border px-3 py-2 text-center bg-red-400 text-white font-semibold">
                          {item.qty}
                        </td>
                        <td className="border px-3 py-2 text-center">{item.reorderLevel}</td>
                        <td className="border px-3 py-2">{item.uom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReportSection6;
