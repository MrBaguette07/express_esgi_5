const authService = require('./auth.service.js');

const KNOWN_LOGIN_ERRORS = ["L'email et le mot de passe sont requis", "Compte introuvable", "Mot de passe incorrect"];
const KNOWN_SIGNIN_ERRORS = ["L'email, le mot de passe et le nom complet sont requis", "Cet email est déjà utilisé"];

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.status(200).json(result);
    } catch (e) {
        if (KNOWN_LOGIN_ERRORS.includes(e.message)) {
            return res.status(400).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await authService.signin(req.body);
        res.status(201).json(user);
    } catch (e) {
        if (KNOWN_SIGNIN_ERRORS.includes(e.message)) {
            return res.status(400).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
};
