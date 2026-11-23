const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const path = require('path');

const routes = require('./routes/routes');
// Configurações do servidor
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota inicial para testar o servidor
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});