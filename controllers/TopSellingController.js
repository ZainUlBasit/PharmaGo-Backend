const Order = require("../Models/Order");
const CartItem = require("../Models/CartItem");
const Product = require("../Models/Product");
const { createError, successMessage } = require("../utils/ResponseMessage");

/**
 * Get top 10 most sold items based on quantity
 * This aggregates data from orders -> cart items -> products to calculate total quantities sold
 */
const getTopSellingItems = async (req, res) => {
  try {
    // Aggregate pipeline to get top selling items
    const allOrder = await Order.find({}).populate("items");

    const allItems = allOrder.map((order) => {
      return order.items;
    });

    const flattenedItems = allItems.flat();

    const mergedItemsMap = new Map();

    flattenedItems.forEach((item) => {
      const itemId = item.itemId.toString(); // Ensure consistent key type
      if (mergedItemsMap.has(itemId)) {
        const existingItem = mergedItemsMap.get(itemId);
        existingItem.qty += item.qty; // Sum quantities
        mergedItemsMap.set(itemId, existingItem);
      } else {
        // Create a new entry, copying relevant fields
        mergedItemsMap.set(itemId, {
          itemId: item.itemId,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        });
      }
    });

    // Convert map values to an array and sort by quantity
    const topSellingItems = Array.from(mergedItemsMap.values())
      .sort((a, b) => b.qty - a.qty) // Sort in descending order of quantity
      .slice(0, 5); // Get top 10 items

    return successMessage(
      res,
      topSellingItems, // Changed allItems to topSellingItems
      "Top 10 most sold items retrieved successfully."
    );

    return successMessage(
      res,
      { allItems },
      "Top 10 most sold items retrieved successfully."
    );
  } catch (error) {
    console.log("Error getting top selling items:", error);
    return createError(
      res,
      500,
      "Internal server error while fetching top selling items."
    );
  }
};

/**
 * Get top selling items with date range filter
 */
const getTopSellingItemsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return createError(res, 400, "Start date and end date are required.");
    }

    const startTimestamp = parseInt(startDate);
    const endTimestamp = parseInt(endDate);

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return createError(res, 400, "Invalid date format. Use timestamp.");
    }

    if (startTimestamp > endTimestamp) {
      return createError(res, 400, "Start date must be before end date.");
    }

    // Aggregate pipeline with date filter
    const topSellingItems = await Order.aggregate([
      // Match orders within date range and completed status
      {
        $match: {
          status: 4,
          order_date: { $gte: startTimestamp, $lte: endTimestamp },
        },
      },

      // Lookup cart items
      {
        $lookup: {
          from: "cartitems",
          localField: "items",
          foreignField: "_id",
          as: "cartItems",
        },
      },

      // Unwind cart items
      { $unwind: "$cartItems" },

      // Group by product ID
      {
        $group: {
          _id: "$cartItems.itemId",
          totalQuantitySold: { $sum: "$cartItems.qty" },
          totalRevenue: {
            $sum: { $multiply: ["$cartItems.qty", "$cartItems.price"] },
          },
          orderCount: { $sum: 1 },
        },
      },

      // Sort by quantity sold
      { $sort: { totalQuantitySold: -1 } },

      // Limit to top 10
      { $limit: 10 },

      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      // Unwind product details
      { $unwind: "$productDetails" },

      // Project final result
      {
        $project: {
          productId: "$_id",
          productName: "$productDetails.name",
          productDescription: "$productDetails.desc",
          productImages: "$productDetails.images",
          productPrice: "$productDetails.price",
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
          averageOrderValue: { $divide: ["$totalRevenue", "$orderCount"] },
          dateRange: {
            startDate: startTimestamp,
            endDate: endTimestamp,
          },
        },
      },
    ]);

    if (!topSellingItems || topSellingItems.length === 0) {
      return successMessage(
        res,
        [],
        "No sales data found for the specified date range."
      );
    }

    return successMessage(
      res,
      topSellingItems,
      "Top 10 most sold items for the date range retrieved successfully."
    );
  } catch (error) {
    console.error("Error getting top selling items by date range:", error);
    return createError(
      res,
      500,
      "Internal server error while fetching top selling items by date range."
    );
  }
};

/**
 * Get top selling items by category
 */
const getTopSellingItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return createError(res, 400, "Category ID is required.");
    }

    // Aggregate pipeline with category filter
    const topSellingItems = await Order.aggregate([
      // Match completed orders
      { $match: { status: 4 } },

      // Lookup cart items
      {
        $lookup: {
          from: "cartitems",
          localField: "items",
          foreignField: "_id",
          as: "cartItems",
        },
      },

      // Unwind cart items
      { $unwind: "$cartItems" },

      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "cartItems.itemId",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      // Unwind product details
      { $unwind: "$productDetails" },

      // Match products in the specified category
      { $match: { "productDetails.cat_id": categoryId } },

      // Group by product ID
      {
        $group: {
          _id: "$cartItems.itemId",
          totalQuantitySold: { $sum: "$cartItems.qty" },
          totalRevenue: {
            $sum: { $multiply: ["$cartItems.qty", "$cartItems.price"] },
          },
          orderCount: { $sum: 1 },
          productDetails: { $first: "$productDetails" },
        },
      },

      // Sort by quantity sold
      { $sort: { totalQuantitySold: -1 } },

      // Limit to top 10
      { $limit: 10 },

      // Project final result
      {
        $project: {
          productId: "$_id",
          productName: "$productDetails.name",
          productDescription: "$productDetails.desc",
          productImages: "$productDetails.images",
          productPrice: "$productDetails.price",
          categoryId: "$productDetails.cat_id",
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
          averageOrderValue: { $divide: ["$totalRevenue", "$orderCount"] },
        },
      },
    ]);

    if (!topSellingItems || topSellingItems.length === 0) {
      return successMessage(
        res,
        [],
        "No sales data found for the specified category."
      );
    }

    return successMessage(
      res,
      topSellingItems,
      "Top 10 most sold items for the category retrieved successfully."
    );
  } catch (error) {
    console.error("Error getting top selling items by category:", error);
    return createError(
      res,
      500,
      "Internal server error while fetching top selling items by category."
    );
  }
};

module.exports = {
  getTopSellingItems,
  getTopSellingItemsByDateRange,
  getTopSellingItemsByCategory,
};
