import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportSection1 = () => {
  const [mostDecreasedItem, setMostDecreasedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today1 = new Date();
  const year = today1.getFullYear();
  const month = today1.toLocaleString("default", { month: "long" });
  const formattedDate = `${year} - ${month}`;

  const currentUser = { id: "123456" };

  useEffect(() => {
    const fetchDecreasedItems = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const mostRes = await axios.get(
          `http://localhost:5000/api/items/max-decrease/${currentUser.id}/${today}`
        );
        setMostDecreasedItem(mostRes.data);
      } catch (err) {
        console.error(err);
        setError("No data found or error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDecreasedItems();
  }, []);

  const renderItemCard = (title, itemData) => (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-full w-full transition-transform transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
        {title}
      </h2>
      <table className="w-full text-sm text-gray-700 border border-collapse rounded-md overflow-hidden">
        <tbody>
          <tr className="border-b">
            <td className="p-2 font-medium">Item Code:</td>
            <td className="p-2">{itemData.itemDetails.code}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Name:</td>
            <td className="p-2">{itemData.itemDetails.name}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Type:</td>
            <td className="p-2">{itemData.itemDetails.type}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Description:</td>
            <td className="p-2">{itemData.itemDetails.desc}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Total Consumption:</td>
            <td className="p-2">{itemData.totalDecreased}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Remaining Quantity:</td>
            <td className="p-2">{itemData.itemDetails.qty}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium">Unit:</td>
            <td className="p-2">{itemData.itemDetails.uom}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {loading ? (
        <p className="text-gray-600 text-lg">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : (
        mostDecreasedItem &&
        renderItemCard(
          "Most Consumed Item ( " + formattedDate + " )",
          mostDecreasedItem
        )
      )}
    </div>
  );
};

export default ReportSection1;
