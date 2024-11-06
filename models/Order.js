const mongoose = require("mongoose");
const User = require("./User");
const Cart = require("./Cart");
const Product = require("./Product");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    shipTo: { type: Object, required: true },
    contact: { type: Object, required: true },
    totalPrice: { type: Number, required: true, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: User, required: true },
    status: { type: String, default: "preparing", required: true },
    orderNum: { type: String },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: Product,
          required: true,
        },
        qty: { type: Number, default: 1, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

orderSchema.post("save", async function () {
  //카트 비우기
  const cart = await Cart.findOne({ userId: this.userId });
  cart.items = [];
  await cart.save();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
