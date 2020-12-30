const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const databaseConnection = require('../utils/databaseConnection');
const auth = require('../utils/auth');

// Registrar
router.post('/register', async (req, res) => {
	try {
		const { email, password, confirmPassword, username } = req.body;

		// Validacao: 400 Bad Request
		if (!email || !password || !confirmPassword || !username)
			return res.status(400).json({ msg: 'Empty fields.' });
		if (password.length < 6)
			return res
				.status(400)
				.json({ msg: 'Password needs to have 6 or more characters.' });
		if (username.length < 3)
			return res
				.status(400)
				.json({ msg: 'Username needs to have 3 or more characters.' });
		if (password !== confirmPassword)
			return res.status(400).json({ msg: "Passwords don't match." });

		// Validacao de email com regex
		const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
		if (!email.match(regEx))
			return res.status(400).json({ msg: 'Invalid email.' });

		const connection = await databaseConnection();

		const [existingUser] = await connection.query(
			'SELECT email FROM `user` WHERE email = ?',
			[email],
			(err, results) => {
				console.log('existingUser connection err:', err);
				console.log('existingUser connection results:', results);
			}
		);

		if (existingUser[0])
			return res.status(400).json({ msg: 'Email already used.' });

		// bcrypt hashing o password
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		const [insertedUser] = await connection.query(
			'INSERT INTO user (email, username, password) VALUES (?, ?, ?);',
			[email, username, passwordHash],
			(err, results) => {
				console.log('insertedUser connection err:', err);
				console.log('insertedUser connection results:', results);
			}
		);
		res.status(200).json(insertedUser);
	} catch (err) {
		// 500 Internal Server Error
		res.status(500).json({ error: error.message });
	}
});

// Logar
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		const connection = await databaseConnection();

		// Validacao
		if (!email || !password)
			return res.status(400).json({ msg: 'Empty fields.' });

		const [existingUser] = await connection.query(
			'SELECT * FROM `user` WHERE email = ?',
			[email],
			(err, results) => {
				console.log('existingUser connection err:', err);
				console.log('existingUser connection results:', results);
			}
		);

		if (!existingUser[0])
			return res.status(400).json({ msg: 'Email not registered.' });

		const user = { ...existingUser[0] };

		// Conferindo se o password bate com o hash
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(400).json({ msg: 'Invalid password.' });

		// Criando um jwt baseado no id do user e senha salva no ambiente
		const token = jwt.sign({ id: user.id }, process.env.JWT_KEY);
		res.json({
			token,
			user: {
				id: user.id,
				username: user.username,
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Checando o JWT, retorna true ou false
router.post('/tokenIsValid', async (req, res) => {
	try {
		// Conferindo se o token existe
		const token = req.header('my-auth-token');
		if (!token) return res.json(false);

		// Conferindo se o token eh valido
		const verified = jwt.verify(token, process.env.JWT_KEY);
		if (!verified) return res.json(false);

		// Conferindo se o user existe
		const connection = await databaseConnection();

		const [existingUser] = await connection.query(
			'SELECT * FROM `user` WHERE id = ?',
			[verified.id],
			(err, results) => {
				console.log('existingUser connection err:', err);
				console.log('existingUser connection results:', results);
			}
		);

		if (!existingUser[0]) return res.json(false);

		return res.json(true);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Pegar o user que está logado
router.get('/', auth, async (req, res) => {
	const connection = await databaseConnection();
	const [existingUser] = await connection.query(
		'SELECT * FROM `user` WHERE id = ?',
		[req.user],
		(err, results) => {
			console.log('existingUser connection err:', err);
			console.log('existingUser connection results:', results);
		}
	);
	const user = { ...existingUser[0] };

	res.json({
		username: user.username,
		id: user.id,
	});
});

module.exports = router;
