const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const PAGE_SIZE = 3;

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { contact, shipTo, totalPrice, orderList } = req.body;
    //재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    //재고가 충분하지 않는 아이템이 있다면, 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }
    //재고가 충분하면, 오더 생성
    const newOrder = new Order({
      userId,
      contact,
      shipTo,
      totalPrice,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    res
      .status(200)
      .json({ status: "success", data: newOrder, orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;

    const order = await Order.find({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!order) throw new Error("오더가 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    const cond = ordernum
      ? { orderNum: { $regex: ordernum, $options: "i" } }
      : {};
    let query = Order.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      //전체 페이지 수(총 데이터 갯수 / 페이지 사이즈)
      const result = await Order.find(cond);
      const totalItemNum = result.length;
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const orderList = await query.exec();
    response.data = orderList;
    if (!orderList) {
      throw new Error("주문이 없습니다.");
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      { status: status },
      { new: true }
    );
    if (!order) throw new Error("order doesn't exist");
    res.status(200).json({ status: "success", order });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};
module.exports = orderController;
