const pool = require('../config/database');

// Cadastrar serviço
async function cadastrarServico(req, res) {
    try {
        const { nome, categoria, descricao } = req.body;

       if (!nome || !nome.trim()) {
            return res.status(400).json({
                mensagem: 'O nome do serviço é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO servico (nome, categoria, descricao)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nome, categoria, descricao]
        );

        res.status(201).json({
            mensagem: 'Serviço cadastrado com sucesso!',
            servico: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar serviço.'
        });
    }
}

// Listar serviços
async function listarServicos(req, res) {
    try {
        const resultado = await pool.query(
            'SELECT * FROM servico ORDER BY id_servico'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar serviços.'
        });
    }
}

module.exports = {
    cadastrarServico,
    listarServicos
};
