const databaseConnection = async () => {
	if (global.connection && global.connection.state !== 'disconnected') {
		return global.connection;
	}

	const mysql = require('mysql2/promise');
	const connection = await mysql.createConnection({
		host: process.env.HOST,
		user: process.env.USER,
		password: process.env.PASS,
		database: process.env.MYSQL_DB,
	});

	global.connection = connection;
	return connection;
};

module.exports = databaseConnection;
