const { populate } = require("dotenv");
const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    //유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    //카트가 없다면, 새로운 카트 생성 / 있다면 그대로 사용
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    //카트에 이미 들어간 아이템이면 에러 / 새로운 아이템이면 추가 (productId and size 확인)
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      throw new Error("아이템이 이미 카트에 담겨 있습니다.");
    }
    //카트에 아이템을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartList = async (req, res, next) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!cart) throw new Error("카트가 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: cart });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartItemQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("카트가 존재하지 않습니다.");
    res.status(200).json({
      status: "success",
      cartItemQty: cart ? cart.items.length : 0,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {};
module.exports = cartController;
