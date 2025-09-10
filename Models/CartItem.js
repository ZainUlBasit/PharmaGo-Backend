// Importing mongoose and fieldType utilities
const mongoose = require("mongoose");
const { reqStr, reqNumZero, reqNum } = require("../utils/fieldType");
const Schema = mongoose.Schema;

// Defining the CategorySchema
const CategorySchema = new Schema({
  name: reqStr, // Required string for category name
  itemId: { type: mongoose.Types.ObjectId, ref: "Product" }, // Reference to the Category model
  image: reqStr,
  qty: reqNum,
  price: reqNum,
  cost: {
    type: Number,
    default: 0,
    required: true,
  },
  total: reqNum,
});

// Exporting the Category model
module.exports = mongoose.model("CartItem", CategorySchema);
