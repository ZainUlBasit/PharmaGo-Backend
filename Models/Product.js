// Importing mongoose and fieldType utilities
const mongoose = require("mongoose");
const { reqStr, reqNumZero, reqNum } = require("../utils/fieldType");
const Schema = mongoose.Schema;

// Defining the CategorySchema
const CategorySchema = new Schema({
  name: reqStr, // Required string for category name
  cat_id: { type: mongoose.Types.ObjectId, ref: "Category" }, // Reference to the Category model
  // subcat_id: { type: mongoose.Types.ObjectId, ref: "SubCategory" }, // Reference to the Category model
  desc: reqStr, // Required string for category description
  images: [reqStr], // Array of required strings for category images
  video: String, // String for category video
  cost: reqNumZero, // Required number for category price
  qty: {
    type: Number,
    default: 0,
  }, // Required number for category price
  status: {
    type: Number,
    enum: [1, 2], // 1 represents 'In Stock', 2 represents 'Out of Stock'
    required: true,
    default: 1, // Default is 'In Stock'
  },
  price: reqNumZero, // Required number for category price
  colors: [
    String, // Hexadecimal value of the color
  ], // Array of objects for colors
});

// Exporting the Category model
module.exports = mongoose.model("Product", CategorySchema);
