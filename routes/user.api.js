const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();

router.post("/", userController.createUser); //회원가입

module.exports = router;
