const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

module.exports = mongoose.model(
  "deprem",
  new mongoose.Schema({
    kanal: String,
    sunucu: { type: String, unique: true },
    status: String,
    channel: String,
  })
);
