const express = require("express");
const router = express.Router();
const {
  getTopSellingItems,
  getTopSellingItemsByDateRange,
  getTopSellingItemsByCategory,
} = require("../controllers/TopSellingController");

// Get top 10 most sold items (all time)
router.get("/", getTopSellingItems);

// Get top 10 most sold items within a date range
// Query params: startDate, endDate (timestamps)
router.get("/date-range", getTopSellingItemsByDateRange);

// Get top 10 most sold items by category
// Params: categoryId
router.get("/category/:categoryId", getTopSellingItemsByCategory);

module.exports = router;
