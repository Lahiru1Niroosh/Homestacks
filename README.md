# Homestacks
🏡 Home Stock Management System
A full-stack web application to manage household items efficiently. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with a Python-based item recommendation system for smarter shopping and inventory decisions.

📌 Table of Contents

About the Project
Features
Tech Stack
System Architecture
How to Run the Project

📖 About the Project
The Home Stock Management System helps users keep track of items in their home. It reduces waste, avoids overbuying, and ensures users never run out of essentials. Users can manage inventory, maintain shopping lists, and get smart item recommendations based on their usage patterns.

✨ Features
🔹 Inventory Management
Add, update, delete, and view home inventory items
Track quantities and expiry dates
Receive alerts for low stock

🔹 Shopping List Management
Create shopping lists from scratch or based on low-stock items
Mark purchased items
View history of purchased items

🔹 User Management
Register, login, and manage user profiles
Role-based access (optional)

🔹 Item Recommendation System (Python)
Suggests items to buy based on previous shopping and inventory usage patterns
Built using data analysis techniques (e.g., Apriori algorithm, frequency analysis)

💻 Tech Stack
🧠 Backend
Node.js
Express.js
MongoDB (Mongoose ODM)

🎨 Frontend
React.js
Tailwind CSS or Material UI (for design)

🧪 Machine Learning
Python (for recommendation engine)
Pandas, Scikit-learn, Apyori, etc.

+----------------------+         +---------------------+
|   React Frontend     | <--->   |  Node.js + Express  |
|  (client)            |         |  (server)           |
+----------^-----------+         +-----------^---------+
           |                                 |
           | REST API                        | Inter-process
           |                                 | Communication
+----------v-----------+         +-----------v---------+
|     MongoDB          |         | Python Recommender  |
|  (Inventory DB)      |         | Engine (item sugg.) |
+----------------------+         +---------------------+

▶️ How to Run the Project

2. Run Backend
cd server
npm install
npm run dev

4. Run Frontend
cd client
npm install
npm start
