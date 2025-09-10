const mongoose = require("mongoose");
const { reqStr } = require("../utils/fieldType");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: reqStr,
});

module.exports = mongoose.model("Category", CategorySchema);
