const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
	try {
		const token = req.header('my-auth-token');
		if (!token)
			return res.status(401).json({ msg: 'No authentication token.' });

		// Decodifica o token com base na chave usada na criacao dele e retorna o objeto {id, displayName}
		const verified = jwt.verify(token, process.env.JWT_KEY);
		if (!verified)
			return res.status(401).json({ msg: 'Token verification faild.' });

		// Coloca no req.user o id
		req.user = verified.id;

		// Continua as funcoes seguintes na chamada do auth na rota
		next();
	} catch (error) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = auth;
