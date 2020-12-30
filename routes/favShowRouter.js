const express = require('express');
const router = express.Router();
const databaseConnection = require('../utils/databaseConnection');
const auth = require('../utils/auth');

router.post('/', auth, async (req, res) => {
	try {
		const {
			genres,
			id,
			image,
			language,
			name,
			premiered,
			rating,
			runtime,
			summary,
		} = req.body;

		// Validacao do body
		if (
			!genres ||
			!id ||
			!image ||
			!language ||
			!name ||
			!premiered ||
			!rating ||
			!runtime ||
			!summary
		)
			return res.status(400).json({
				msg: 'Please verify if all body elements are not undefined.',
			});

		// Definindo a estrutura
		const show = {
			genres,
			id,
			image,
			language,
			name,
			premiered,
			rating,
			runtime,
			summary,
		};

		// JSON to ojb  JSON.parse(show)
		// obj to JSON  JSON.stringify(show)

		const connection = await databaseConnection();
		const [newFavShow] = await connection.query(
			'INSERT INTO favshows (show_info, userId) VALUES (?, ?)',
			[JSON.stringify(show), req.user],
			(err, results) => {
				console.log('existingUser connection err:', err);
				console.log('existingUser connection results:', results);
			}
		);
		const formatedFavShow = {
			show,
			_id: newFavShow.insertId,
			userId: req.user,
		};

		res.json(formatedFavShow);
	} catch (err) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/all', auth, async (req, res) => {
	// Retorna todos os favoritos vinculadas a esse id
	const connection = await databaseConnection();
	const [favShows] = await connection.query(
		'SELECT * FROM `favshows` WHERE userId = ?',
		[req.user],
		(err, results) => {
			console.log('existingUser connection err:', err);
			console.log('existingUser connection results:', results);
		}
	);

	// Formatando a resposta
	const formatedShows = favShows.map((item) => {
		return {
			show: JSON.parse(item.show_info),
			_id: item._id,
			userId: item.userId,
		};
	});
	res.json(formatedShows);
});

router.delete('/', auth, async (req, res) => {
	// Tentei pegar req.body mas nao deu certo, query funcionou blz
	let { favId } = req.query;

	// Encontra a entrada pelo _id
	const connection = await databaseConnection();
	const [favShow] = await connection.query(
		'SELECT * FROM `favshows` WHERE userId = ? AND _id = ?',
		[req.user, favId],
		(err, results) => {
			console.log('existingUser connection err:', err);
			console.log('existingUser connection results:', results);
		}
	);

	if (!favShow[0])
		return res
			.status(400)
			.json({ msg: 'FavShow not found with this id for the current user.' });

	// Exclui a entrada pelo _id
	const [deletedFavShow] = await connection.query(
		'DELETE FROM `favshows` WHERE userId = ? and _id = ?',
		[req.user, favId],
		(err, results) => {
			console.log('existingUser connection err:', err);
			console.log('existingUser connection results:', results);
		}
	);
	res.json(deletedFavShow);
});

module.exports = router;
