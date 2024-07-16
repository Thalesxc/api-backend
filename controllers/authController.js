const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, process.env.JWT_SECRET, {
        expiresIn: 86400,
    });
}

router.post("/login" , async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ msg: "Senha inválida!" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    res.status(200).json({ token });
});

module.exports = router;
