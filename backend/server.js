const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

const routes = require('./routes/routes');
// Configurações do servidor
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
app.use('/api', routes);

// Rota inicial para testar o servidor
app.get('/', (req, res) => {
    res.send('Backend do Soundfier está funcionando!');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});