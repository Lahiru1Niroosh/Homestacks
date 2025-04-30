const Item = require("../Model/Item");
const ItemTransaction = require('../Model/ItemTransaction');

// @desc    Add new item
// @route   POST /api/items
const addItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();

     // Log the transaction in itemTransactions collection
     const transaction = new ItemTransaction({
      userId: savedItem.user_id,
      itemCode: savedItem.code, // Assuming `code` is the item code in the Item document
      action: 'increase',
      quantity: savedItem.qty,
      
    });
    await transaction.save();



    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Get all items (optionally filtered by user_id and search keyword)
// @route   GET /api/items?user_id=123456&searchKeyword=ABC
const getItems = async (req, res) => {
  try {
    const { user_id, searchKeyword } = req.query;

    let query = {};
    let flag1 = false;

    if (user_id) {
      query.user_id = user_id;
    }

    if (searchKeyword) {
      query.itemCode = { $regex: searchKeyword, $options: 'i' }; // case-insensitive
      flag1 = true;
    }

    const items = await Item.find(query);
    if(flag1){
      console.log(items);
    }
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// @desc    Update an item
// @route   PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const itemCode = item.code; // Save item code before deletion

    // Delete the item
    await item.deleteOne();

    // Delete all transactions with the matching itemCode
    await ItemTransaction.deleteMany({ itemCode });

    console.log("Deleted item code:", itemCode);
    console.log("Deleted all transactions for item code:", itemCode);

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};




// Increase item quantity
const increaseQuantity = async (req, res) => {
  try {
    const itemId = req.params.id;
    const quantity = parseFloat(req.body.quantity); // Ensure quantity is a number
    const purchasedDate =req.body.purchasedDate ; 
    const expDate = req.body.expDate ;

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        $inc: { qty: quantity },
        purchasedDate: purchasedDate,
        expDate : expDate,
      }, // Increment the quantity by the specified value
      { new: true } // Return the updated item
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    /////////item transaction////

    // Fetch the item details before updating quantity
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const userId = item.user_id; // Fetch the userId from the item document

     // Log the transaction in itemTransactions collection
     const transaction = new ItemTransaction({
      userId,
      itemCode: updatedItem.code, // Assuming `code` is the item code in the Item document
      action: 'increase',
      quantity,
      createdAt: purchasedDate,
    });
    await transaction.save();

    ///////////////////

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Decrease item quantity
const decreaseQuantity = async (req, res) => {
  try {
    const itemId = req.params.id;
    const quantity = parseFloat(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity value' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $inc: { qty: -quantity } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Fetch the item details again
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const userId = item.user_id;

    // Log the transaction
    const transaction = new ItemTransaction({
      userId,
      itemCode: updatedItem.code,
      action: 'decrease',
      quantity: -quantity,
    });
    await transaction.save();

    // Calculate usage rate from transactions within the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await ItemTransaction.find({
      itemCode: updatedItem.code,
      action: 'decrease',
      createdAt: { $gte: threeMonthsAgo },
    }).sort({ createdAt: 1 });

    if (transactions.length > 1) {
      const totalDecreased = transactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);

      const firstDate = transactions[0].createdAt;
      const lastDate = transactions[transactions.length - 1].createdAt;

      const diffTime = Math.abs(new Date(lastDate) - new Date(firstDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Prevent division by zero

      const usageRate = parseFloat((totalDecreased / diffDays).toFixed(2));

      await Item.findByIdAndUpdate(itemId, {
        usageRate,
      });
    }

    res.status(200).json(updatedItem);
  } catch (err) {
    console.error('Error in decreaseQuantity:', err);
    res.status(500).json({ error: err.message });
  }
};


const getMostDecreasedItemForMonth = async (req, res) => {
  try {
    const { userId, date } = req.params;

    const givenDate = new Date(date);
    const year = givenDate.getFullYear();
    const month = givenDate.getMonth(); // Note: Jan = 0, Dec = 11

    // Start and end of the target month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1); // First day of next month

    const result = await ItemTransaction.aggregate([
      {
        $match: {
          userId: userId,
          action: 'decrease',
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$itemCode',
          totalDecreased: { $sum: { $abs: '$quantity' } },
        },
      },
      {
        $sort: { totalDecreased: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found for given month and user.' });
    }

    const itemCode = result[0]._id;
    const totalDecreased = result[0].totalDecreased;

    // Fetch the item using the itemCode
    const item = await Item.findOne({ code: itemCode });

    if (!item) {
      console.log('Item not found for itemCode..: ' + itemCode);
      return res.status(404).json({ message: 'Item not found for itemCode: ' + itemCode });
    }
    

    res.status(200).json({
      itemCode,
      totalDecreased,
      itemDetails: item,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLeastDecreasedItemForMonth = async (req, res) => {
  try {
    const { userId, date } = req.params;

    const givenDate = new Date(date);
    const year = givenDate.getFullYear();
    const month = givenDate.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const result = await ItemTransaction.aggregate([
      {
        $match: {
          userId: userId,
          action: 'decrease',
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$itemCode',
          totalDecreased: { $sum: { $abs: '$quantity' } },
        },
      },
      {
        $sort: { totalDecreased: 1 }, // sort ASCENDING to get least used
      },
      {
        $limit: 1,
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found for given month and user.' });
    }

    const itemCode = result[0]._id;
    const totalDecreased = result[0].totalDecreased;

    const item = await Item.findOne({ code: itemCode });

    if (!item) {
      console.log('Item not found for itemCode: ' + itemCode);
      return res.status(404).json({ message: 'Item not found for itemCode: ' + itemCode });
    }

    res.status(200).json({
      itemCode,
      totalDecreased,
      itemDetails: item,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getMostDecreasedItemForRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await ItemTransaction.aggregate([
      {
        $match: {
          userId: userId,
          action: 'decrease',
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$itemCode',
          totalDecreased: { $sum: { $abs: '$quantity' } },
        },
      },
      {
        $sort: { totalDecreased: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found in the date range for this user.' });
    }

    const itemCode = result[0]._id;
    const totalDecreased = result[0].totalDecreased;
    const item = await Item.findOne({ code: itemCode });

    if (!item) {
      return res.status(404).json({ message: 'Item not found for itemCode: ' + itemCode });
    }

    res.status(200).json({ itemCode, totalDecreased, itemDetails: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLeastDecreasedItemForRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await ItemTransaction.aggregate([
      {
        $match: {
          userId: userId,
          action: 'decrease',
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$itemCode',
          totalDecreased: { $sum: { $abs: '$quantity' } },
        },
      },
      {
        $sort: { totalDecreased: 1 }, // Least decreased
      },
      {
        $limit: 1,
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found in the date range for this user.' });
    }

    const itemCode = result[0]._id;
    const totalDecreased = result[0].totalDecreased;
    const item = await Item.findOne({ code: itemCode });

    if (!item) {
      return res.status(404).json({ message: 'Item not found for itemCode: ' + itemCode });
    }

    res.status(200).json({ itemCode, totalDecreased, itemDetails: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getItemAndTransactionDetails = async (req, res) => {
  try {
    // Extracting parameters from the request
    const { itemCode, userId, startDate, endDate, action } = req.params;

    if (!itemCode || !userId || !startDate || !endDate || !action) {
      return res.status(400).json({ message: 'All parameters (itemCode, userId, startDate, endDate, action) are required.' });
    }

    // Parse the date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Step 1: Fetch the item details based on itemCode and userId
    const item = await Item.findOne({ code: itemCode, user_id: userId });
    
    if (!item) {
      return res.status(404).json({ message: `Item with code ${itemCode} not found for user ${userId}.` });
    }

    // Step 2: Fetch the item transactions based on itemCode, userId, action, and date range
    const transactions = await ItemTransaction.aggregate([
      {
        $match: {
          itemCode: itemCode,
          userId: userId,
          action: action,
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $project: {
          _id: 0, // We don't need the Mongo-generated _id
          createdAt: 1, // Only select the createdAt field
          quantity: 1,  // Only select the quantity field
        },
      },
    ]);

    // Step 3: If no transactions are found, return a message
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for the given criteria.' });
    }

    // Step 4: Group and sum the transaction quantities by date
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      // Format the createdAt date to only include the date part (ignore time)
      const dateKey = transaction.createdAt.toISOString().split('T')[0];

      // If the dateKey already exists in the accumulator, add the quantity; otherwise, initialize it
      if (acc[dateKey]) {
        acc[dateKey] += action === 'decrease' ? Math.abs(transaction.quantity) : transaction.quantity;
      } else {
        acc[dateKey] = action === 'decrease' ? Math.abs(transaction.quantity) : transaction.quantity;
      }

      return acc;
    }, {});

    // Step 5: Convert the grouped data into an array of transactions with summed quantities
    const transactionData = Object.keys(groupedTransactions).map(date => ({
      createdAt: date,
      quantity: groupedTransactions[date],
    }));

    // Step 6: Return the item and the matching transactions
    res.status(200).json({
      itemDetails: item,
      transactions: transactionData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




const getIncreasedItemsSummary = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.params;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ message: 'userId, startDate, and endDate are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Step 1: Aggregate increased transactions grouped by itemCode
    const summary = await ItemTransaction.aggregate([
      {
        $match: {
          userId: userId,
          action: 'increase',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$itemCode",
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.status(404).json({ message: 'No increased transactions found in the given date range.' });
    }

    // Step 2: Fetch item details
    const itemCodes = summary.map(entry => entry._id);
    const itemDetails = await Item.find({
      code: { $in: itemCodes },
      user_id: userId
    }).lean(); // Plain JS objects

    // Step 3: Merge and calculate totalUsedQuantity & totalCost
    const result = itemDetails.map(item => {
      const match = summary.find(s => s._id === item.code);
      const totalUsedQuantity = match ? match.totalQuantity : 0;
      const totalCost = totalUsedQuantity * item.price;

      return {
        ...item,
        totalUsedQuantity,
        totalCost
      };
    });

    // Step 4: Send response
    res.status(200).json({ items: result });

  } catch (err) {
    console.error("Error in getIncreasedItemsSummary:", err);
    res.status(500).json({ error: err.message });
  }
};





module.exports = {
  addItem,
  getItems,
  updateItem,
  deleteItem,
  increaseQuantity,
  decreaseQuantity,
  getMostDecreasedItemForMonth,
  getLeastDecreasedItemForMonth,
  getLeastDecreasedItemForRange,
  getMostDecreasedItemForRange,
  getItemAndTransactionDetails,
  getIncreasedItemsSummary,
};

