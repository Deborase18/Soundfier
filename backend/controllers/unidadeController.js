const pool = require('../config/database');

// Cadastrar unidade
async function cadastrarUnidade(req, res) {
    try {
        const {
            nome,
            numero,
            logradouro,
            bairro,
            telefone
        } = req.body;

        if (!nome) {
            return res.status(400).json({
                mensagem: 'O nome da unidade é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO unidade
            (nome, numero, logradouro, bairro, telefone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [nome, numero, logradouro, bairro, telefone]
        );

        res.status(201).json({
            mensagem: 'Unidade cadastrada com sucesso!',
            unidade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar unidade.'
        });
    }
}

// Listar unidades
async function listarUnidades(req, res) {
    try {
        const resultado = await pool.query(
            'SELECT * FROM unidade ORDER BY id_unidade'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar unidades.'
        });
    }
}

module.exports = {
    cadastrarUnidade,
    listarUnidades
};
