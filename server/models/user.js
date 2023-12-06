const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, maxLength: 50, required: true },
  lastName: { type: String, maxLength: 50, required: true },
  username: { type: String, minLength: 5, required: true },
  password: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
  },
  accessToken: { type: String },
});

// Virtual for user's URL
UserSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

module.exports = mongoose.model("User", UserSchema);
