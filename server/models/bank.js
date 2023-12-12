const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BankSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
});

// Virtual for user's URL
BankSchema.virtual("url").get(function () {
  return `/bank/${this._id}`;
});

module.exports = mongoose.model("Bank", BankSchema);
