const mongoose = require("mongoose");

const privateMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Gère automatiquement createdAt et updatedAt
  }
);

const PrivateMessage = mongoose.model("PrivateMessage", privateMessageSchema);

module.exports = PrivateMessage;
