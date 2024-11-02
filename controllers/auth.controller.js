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
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

//토큰 검증
authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization; //헤더에 저장 된 토큰 값 받기
    if (!tokenString) {
      //토큰이 없을 시
      throw new Error("ivalid token");
    }
    const token = tokenString.replace("Bearer ", ""); //헤더에 저장된 문자 중 Bearer 문자 삭제
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      //토큰 검증
      if (error) {
        throw new Error("invalid token");
      }
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

//관리자계정 확인
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
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = authController;
