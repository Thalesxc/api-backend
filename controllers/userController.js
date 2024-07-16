const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth");
const levelAuth = require("../middlewares/levelAuth");
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post("/users", async (req, res) => {
    const { name, email, password, level } = req.body;

    if (!name) {
        return res.status(422).json({ msg: "O nome é obrigatório!" });
    }

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    if (!level) {
        return res.status(422).json({ msg: "O nível é obrigatório!" });
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
        return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        password: passwordHash,
        level,
    });

    try {
        await user.save();

        res.status(201).json({ msg: "Usuário criado com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
});

router.get("/users", async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: error });
    }
});

router.get("/users/report", authMiddleware, async (req, res) => {
    try {
        const users = await User.find();

        const fields = ['id', 'name', 'email', 'level'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(users);

        const filePath = path.join(__dirname, '..', 'reports', 'users_report.csv');
        fs.writeFileSync(filePath, csv);

        res.download(filePath, 'users_report.csv', (err) => {
            if (err) {
                res.status(500).json({ msg: "Erro ao baixar o relatório!" });
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.get("/users/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ msg: "ID inválido!" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado!" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, password, level } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ msg: "ID inválido!" });
    }

    const userExists = await User.findById(id);
    if (!userExists) {
        return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    try {
        const update = {
            name,
            email,
            level
        };

        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }

        const userUpdated = await User.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );
        res.status(200).json({ msg: "Usuário atualizado com sucesso!", user: userUpdated });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ msg: "ID inválido!" });
    }

    try {
        const userDeleted = await User.findByIdAndDelete(id);

        if (!userDeleted) {
            return res.status(404).json({ msg: "Usuário não encontrado!" });
        }

        res.status(200).json({ msg: "Usuário deletado com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

module.exports = router;