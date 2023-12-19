const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BankSchema = new Schema({
  // Get institution_id via '/institutions/get_by_id'
  institution_id: { type: String, required: true },
  name: { type: String, required: true },
});

// Virtual for user's URL
BankSchema.virtual("url").get(function () {
  return `/bank/${this._id}`;
});

module.exports = mongoose.model("Bank", BankSchema);
