const mongoose = require("mongoose");

// Set up mongoose
const mongoDb = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
