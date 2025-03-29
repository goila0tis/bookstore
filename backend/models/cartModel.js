const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    cartItems: [
      {
        book: {
          type: ObjectId,
          required: true,
          ref: "Books",
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;