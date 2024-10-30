const Product = require("../models/Product");

const productController = {};

//상품 생성
productController.createProduct = async (req, res) => {
  try {
    const { sku, name, image, category, description, price, stock, status } =
      req.body;
    const product = await Product({
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

//상품가져오기
productController.getProducts = async (req, res) => {
  try {
    const productList = await Product.find({});
    if (!productList) {
      throw new Error("상품이 없습니다.");
    }
    res.status(200).json({ status: "success", productList });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

module.exports = productController;
