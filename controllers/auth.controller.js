const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWIthEmail = async (req, res) => {
  try {
    const { email, password } = req.body; //로그인 정보
    const user = await User.findOne({ email }); //email로 user 찾기
    if (!user) {
      //user가 없을 시
      throw new Error("아이디가 틀렸습니다.");
    }
    const decodePassword = bcrypt.compareSync(password, user.password); //암호화 된 비밀번호 해독
    if (decodePassword) {
      //비밀번호 일치할 시
      const token = user.generateToken(); //토큰 생성
      return res.status(200).json({ status: "success", user, token });
    } else {
      throw new Error("비밀번호가 틀렸습니다.");
    }
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error("ivalid token");
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        throw new Error("invalid token");
      }
      req.userId = payload._id;
    });
    next();
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("해당 유저를 찾을 수 없습니다.");
    }
    if (user.level !== "admin") {
      throw new Error("no permission");
    }
    next();
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};

module.exports = authController;
