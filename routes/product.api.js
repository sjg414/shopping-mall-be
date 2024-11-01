const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

//상품생성, admin만 접근 가능
router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

//상품 가져오기
router.get("/", productController.getProducts);

//상품 정보 수정하기
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);

//상품 삭제(isDelete toggle)
router.put(
  "/delete/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

router.get("/:id", productController.getProductDetail);
module.exports = router;
