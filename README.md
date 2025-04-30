# 🏠 Home Inventory Management System

The Home Inventory Management System is a full-stack MERN (MongoDB, Express.js, React, Node.js) application built to help users manage household inventory efficiently. It allows users to track quantities, unit prices, expiry dates, and reorder levels of home items, with intelligent features like automatic usage rate calculation and reporting.

---

## 🚀 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Headless UI, Heroicons
- **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM)
- **Database:** MongoDB
- **Authentication & State:** None

---

## 🔧 Core Features

- **Item Management**: Add, edit, and delete inventory items with fields such as name, type, quantity, unit of measure, price, expiry date, purchase date, and reorder level.
- **Decrease Quantity & Logging**: Every time an item's quantity is decreased, the action is logged in an `ItemTransactions` collection for historical tracking.
- **Usage Rate Calculation**: Automatically computes average daily usage rate for each item based on "decrease" transactions in the past 3 months and updates the item accordingly.
- **Reports Dashboard**: Includes components to display:
  - Most and least decreased items
  - Filtered reports by date range
  - Intelligent alerts when quantity drops below reorder level
- **Responsive UI**: Built with Tailwind CSS for a clean, mobile-friendly design.
- **Tooltip & Form Enhancements**: User-friendly forms with placeholders and tooltips for guidance (e.g., tooltip to suggest restocking).

---

## 📁 Project Structure

```bash
Root/
├── backend/        # Node.js + Express API
│   ├── models/     # Mongoose schemas (Item, ItemTransaction)
│   ├── controllers/
│   ├── routes/
│   └── .env        # Environment variables in '.env' file
├── frontend/       # React frontend
│   ├── src/components/Inventory/User/Item # ReportSection1–6 , other components
│   ├── public/
│   └── tailwind.config.js
```

---

## 🛠️ How to run the project

- **1:** Download the project
- **2:** Create a '.env' file in backend directory.
- **3:** Enter Follwing Details in that file and save it.

PORT=5000<br>
MONGO_URL= your_mongo_DB_URL<br>
DEV_MODE=development<br>

- **4:** Go To Backend Directory then run follwing commands. <br>
  "npm install" <br> "npm start"
- **5:** Go To Frontend Directory then run follwing commands. <br>
  "npm install" <br> "npm start"
