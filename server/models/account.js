const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  account_id: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  name: { type: String, required: true },
  // Note that positive amount is $ going OUT of the account and negative is $ going INTO the account
  balance: { type: Number, required: true },
  subtype: { type: String, required: true },
  type: { type: String, required: true },
});

// Virtual for user's URL
AccountSchema.virtual("url").get(function () {
  return `/account/${this._id}`;
});

module.exports = mongoose.model("Account", AccountSchema);
