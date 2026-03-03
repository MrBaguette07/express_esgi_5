const authService = require('./auth.service.js');

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await authService.signin(req.body);
        res.status(201).json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};
