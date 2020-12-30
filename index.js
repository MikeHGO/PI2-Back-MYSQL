const express = require('express');
// Seguranca de comunicacao Cross Origin Resource Sharing do browser - UjozQOaGt1k
const cors = require('cors');
// Constantes de acordo com o ambiente
require('dotenv').config();

// Set up express
const app = express();
// middleware executado sempre que alguma rota for acessada
// json body parser
app.use(express.json());
app.use(cors());

// Pegando uma porta do ambiente caso exista, se o site estiver online provavelmente vai receber uma porta diferente em 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));

// Rotas
// ( /users/<nome_da_rota> )
const userRouter = require('./routes/userRouter');
app.use('/users', userRouter);
const favShowRouter = require('./routes/favShowRouter');
app.use('/favShows', favShowRouter);
