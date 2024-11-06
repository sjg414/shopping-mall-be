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

//아이템리스트의 개별 아이템의 stock 확인
productController.checkStock = async (item) => {
  //내가 사려는 아이템 재고 정보들고오기
  const product = await Product.findById(item.productId);
  //내가 사려는 아이템 qty, 재고 비교
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${
        product.name
      }의 ${item.size.toUpperCase()}사이즈 재고가 부족합니다.`,
    }; //재고가 불충분하면, 불충분 메세지와 함께 데이터 반환
  }
  //재고가 충분하면, 재고 - qty 후 성공 메세지
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;
  await product.save();
  return { isVerify: true };
};

//아이템리스트 전체 stock 확인
productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = []; //재고가 불충분한 아이템 저장

  //재고 확인 로직
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
