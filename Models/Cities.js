const mongoose = require("mongoose");
const { reqStr } = require("../utils/fieldType");

const Schema = mongoose.Schema;

const CitiesSchema = new Schema({
  name: reqStr,
  shipping_fee: {
    type: Number,
    default: 0,
    required: true,
  },
});

module.exports = mongoose.models.Cities || mongoose.model("Cities", CitiesSchema);
