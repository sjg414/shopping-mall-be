const Product = require("../models/Product");

const PAGE_SIZE = 5;

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
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

//상품가져오기
productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      //전체 페이지 수(총 데이터 갯수 / 페이지 사이즈)
      const result = await Product.find(cond);
      const totalItemNum = result.length;
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;
    if (!productList) {
      throw new Error("상품이 없습니다.");
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

//상품 디테일
productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById({ _id: productId });
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

//상품 수정
productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { sku, name, image, category, description, price, stock, status } =
      req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, image, category, description, price, stock, status },
      { new: true }
    );
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

//상품 삭제
productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deleteProduct = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDelete: true },
      { new: true }
    );
    if (!deleteProduct) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", deleteProduct });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
