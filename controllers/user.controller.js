const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    const { email, password, name, level } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 가입한 회원입니다.");
    }
    //암호 암호화
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newUser = await User({
      email,
      password: hash,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    return res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("해당 유저가 없습니다.");
    }
    res.status(200).json({ status: "success", user });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
module.exports = userController;
