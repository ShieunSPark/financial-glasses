const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bank: { type: Schema.Types.ObjectId, ref: "Bank", required: true },
  account_id: { type: String, required: true },
  // Prefer merchant_name, then name
  name: { type: String, required: true },
  // Note that positive amount is $ going OUT of the account and negative is $ going INTO the account
  amount: { type: Number, required: true },
  iso_currency_code: { type: String, required: true },
  // Prefer authorized-date
  date: { type: Date, required: true },
  // Prefer personal_finance_category
  category: { type: Object, required: true },
});

// Virtual for user's URL
TransactionsSchema.virtual("url").get(function () {
  return `/bank/${this._id}`;
});

module.exports = mongoose.model("Bank", TransactionsSchema);
