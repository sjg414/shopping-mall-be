const express = require("express");
const orderController = require("../controllers/order.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

//오더 생성
router.post("/", authController.authenticate, orderController.createOrder);
router.get("/me", authController.authenticate, orderController.getOrder);
router.get("/", authController.authenticate, orderController.getOrderList);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
