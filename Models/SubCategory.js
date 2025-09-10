const mongoose = require("mongoose");
const { reqStr } = require("../utils/fieldType");

const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
  catId: { type: mongoose.Types.ObjectId, ref: "Category", required: true },
  name: reqStr,
});

module.exports = mongoose.model("SubCategory", SubCategorySchema);
