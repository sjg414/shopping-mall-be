const express = require("express");
const orderController = require("../controllers/order.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

//오더 생성
router.post("/", authController.authenticate, orderController.createOrder);

module.exports = router;
