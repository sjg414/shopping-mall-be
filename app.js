const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //req.body 객체 인식

const mongoURI = process.env.LOCAL_DB_ADDRESS;

//DB 연결
mongoose
  .connect(mongoURI)
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log("DB connection fail", err));

//express 연결
app.listen(process.env.PORT || 4000, () => {
  console.log("server on 4000");
});
