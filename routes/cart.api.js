const express = require("express");
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/qty", authController.authenticate, cartController.getCartItemQty);
router.get("/", authController.authenticate, cartController.getCartList);
router.put("/:id", authController.authenticate, cartController.updateQty);
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);
module.exports = router;
