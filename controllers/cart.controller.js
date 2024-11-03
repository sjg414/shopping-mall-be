const { populate } = require("dotenv");
const Cart = require("../models/Cart");

const cartController = {};

//아이템 카트에 추가하기
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

//카트에 담긴 아이템리스트 가져오기
cartController.getCartList = async (req, res, next) => {
  try {
    const { userId } = req;
    //외래키로 조인하기(populate) cart 컬렉션에 items의 productId를 이용해 Product 데이터를 참조한다.
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

//카트에 담긴 아이템 갯수 가져오기
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

//카트에 담긴 아이템 수량 변경
cartController.updateQty = async (req, res) => {
  try {
    const { userId } = req;
    const productId = req.params.id;
    const { qty } = req.body;
    //해당 user의 카트 가져오기
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!cart) throw new Error("카트가 존재하지 않습니다.");
    //해당 아이템 찾기
    const cartItem = cart.items.find((item) => item.equals(productId));
    if (!cartItem) throw new Error("item doesn't exist");
    //수량 변경
    cartItem.qty = qty;
    await cart.save();
    res.status(200).json({ status: "success", data: cart });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

//카트에 담긴 아이템 삭제
cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const productId = req.params.id;
    //user의 카트 검색
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!cart) throw new Error("카트가 존재하지 않습니다.");
    //선택한 아이템 제외
    cart.items = cart.items.filter((item) => !item.equals(productId));
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
