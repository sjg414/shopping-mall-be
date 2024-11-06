const express = require("express");
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

//카트에 아이템 추가
router.post("/", authController.authenticate, cartController.addItemToCart);

//카트에 담긴 아이템 갯수
router.get("/qty", authController.authenticate, cartController.getCartItemQty);

//카트에 담긴 아이템 가져오기
router.get("/", authController.authenticate, cartController.getCartList);

//카트에 담긴 개별 아이템 갯수 수정
router.put("/:id", authController.authenticate, cartController.updateQty);

//카트에 담긴 아이템 삭제
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);

module.exports = router;
