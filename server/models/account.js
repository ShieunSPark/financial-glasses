const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  // id in Plaid; maybe assign it to Mongo's _id field?
  account_id: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bank: { type: Schema.Types.ObjectId, ref: "Bank", required: true },
  // Prefer merchant_name, then name
  name: { type: String, required: true },
  // Note that positive amount is $ going OUT of the account and negative is $ going INTO the account
  balance: { type: Number, required: true },
  subtype: { type: String, required: true },
  type: { type: String, required: true },
});

// Virtual for user's URL
AccountSchema.virtual("url").get(function () {
  return `/bank/${this._id}`;
});

module.exports = mongoose.model("Bank", AccountSchema);
