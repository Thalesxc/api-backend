const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {

        const user = await User.findById(req.userId).select('level');

        if (user.level < 4) {
            return res.status(403).json({ msg: "Acesso negado!" });
        }

        next();
    } catch (error) {
        res.status(500).json({ msg: "Erro no servidor!" });
    }
};