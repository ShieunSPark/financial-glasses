const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Following the definition on the Plaid Quickstart Glosssary page:
//  "An Item represents a login at a financial institution"
// (e.g., my Bank of America login with a checkings and savings acount
// is ONE item; my Fidelity investment login is ANOTHER item)
// I'd prefer to call this "InstitutionLogin", but the Plaid API has
// a route to /institution/get (which might be confusing), and "InstitutionLogin"
// is too long of a name. I'll use Plaid's name for it: "Item"
const ItemSchema = new Schema({
  institution_id: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  accessToken: { type: String },
  item_id: { type: String },
});

// Virtual for Item's URL
ItemSchema.virtual("url").get(function () {
  return `/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
