require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const userController = require("./controllers/userController");
const authController = require("./controllers/authController");

app.use(userController);
app.use(authController);

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@apibackend.eiuik7n.mongodb.net/?retryWrites=true&w=majority&appName=apibackend`
  )
  .then(() => {
    console.log("Conectou ao banco!");
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
  })
  .catch((err) => console.log(err));