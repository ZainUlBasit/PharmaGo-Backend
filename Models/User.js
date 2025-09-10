// Importing mongoose for MongoDB interactions
const mongoose = require("mongoose");
const { reqStr, reqNum } = require("../utils/fieldType");
// Creating a new Schema instance
const Schema = mongoose.Schema;

// Defining the UserSchema
const UserSchema = new Schema({
  name: reqStr, // Required string for user name
  phoneNumber: reqStr, // Required string for user email
  password: reqStr, // Required string for user password
  cust_id: { type: mongoose.Types.ObjectId, ref: "Customer" }, // Reference to the Customer model for wholesaller
  role: {
    ...reqNum,
    enum: [1, 2], // Enum for role: 1 for admin, 2 for Customer
  },
  shipping: {
    type: Number,
    default: 0,
  },
});

// Exporting the User model
module.exports = mongoose.model("User", UserSchema);
