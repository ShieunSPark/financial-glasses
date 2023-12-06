const mongoose = require("mongoose");

const connectDB = async () => {
  // Set up mongoose
  mongoose.connect(process.env.MONGO_CONNECTION_STRING);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "mongo connection error"));
};

module.exports = connectDB;
