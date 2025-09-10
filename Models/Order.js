// Importing mongoose for MongoDB interactions
const mongoose = require("mongoose");
const { reqStr, reqNum } = require("../utils/fieldType");
const { v4: uuidv4 } = require("uuid");

// Creating a new Schema instance
const Schema = mongoose.Schema;

// Defining the UserSchema
const OrderSchema = new Schema({
  order_no: { type: String, unique: true, sparse: true, default: uuidv4() },
  items: [{ type: mongoose.Types.ObjectId, ref: "CartItem", required: true }],
  customer: String,
  address: String,
  city: String,
  contact_no: String,
  shipping: String,
  shipping_fee: Number,
  total: Number,
  discount: Number,
  status: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // 1: Pending, 2: Placed, 2-2: approved, 3: Shipped, 4: Delivered, 5: Cancel
    required: true,
  },
  order_date: {
    type: Date,
  },
  delivery_date: Number,
});

// Exporting the Order model
module.exports = mongoose.model("Order", OrderSchema);
