const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

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

module.exports = orderController;
