const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;

const cartSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, required: true, ref: User },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: Product },
        size: { type: String, required: true },
        qty: { type: Number, default: 1, required: true },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj;
};

const Cart = mongoose.model("Cart", cartSchema) || mongoose.model.cart;
module.exports = Cart;
