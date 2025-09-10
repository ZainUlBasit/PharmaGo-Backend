const mongoose = require("mongoose");
const { reqStr } = require("../utils/fieldType");

const CustomerSchema = new mongoose.Schema({
  name: reqStr,
  shopName: reqStr,
  phoneNumber: reqStr,
  profile_pic: String,
  address: [String],
  is_approved: { type: Boolean, default: false },
  signed_up_at: { type: Number, required: true },
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
