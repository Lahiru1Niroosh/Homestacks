// router.js

const express = require('express');
const router = express.Router();
const itemController = require('../Controllers/ItemController');

// @route   POST /api/items
// @desc    Add new item
router.post("/", itemController.addItem);

// @route   GET /api/items
// @desc    Get all items
router.get("/", itemController.getItems);

// @route   PUT /api/items/:id
// @desc    Update an item
router.put("/:id", itemController.updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete an item
router.delete("/:id", itemController.deleteItem);

// @route   PATCH /api/items/:id/increase
// @desc    Increase item quantity
router.patch("/:id/increase", itemController.increaseQuantity);

// @route   PATCH /api/items/:id/decrease
// @desc    Decrease item quantity
router.patch("/:id/decrease", itemController.decreaseQuantity);

router.get('/max-decrease/:userId/:date', itemController.getMostDecreasedItemForMonth);

router.get('/min-decrease/:userId/:date', itemController.getLeastDecreasedItemForMonth );

router.get('/max-decrease-range/:userId', itemController.getMostDecreasedItemForRange);
router.get('/min-decrease-range/:userId', itemController.getLeastDecreasedItemForRange);

router.get('/item-transactions/:itemCode/:userId/:startDate/:endDate/:action', itemController.getItemAndTransactionDetails);
router.get('/increased-summary/:userId/:startDate/:endDate', itemController.getIncreasedItemsSummary);

module.exports = router;
