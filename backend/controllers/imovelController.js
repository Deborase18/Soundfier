
const pool = require('../config/database');

// Cadastrar imóvel
const cadastrarImovel = async (req, res) => {
    try {
        const {
            id_cidadao,
            logradouro,
            numero,
            bairro,
            cidade,
            cep,
            situacao
        } = req.body;

        if (!id_cidadao) {
            return res.status(400).json({
                mensagem: 'O ID do cidadão é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO imovel
            (id_cidadao, logradouro, numero, bairro, cidade, cep, situacao)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [id_cidadao, logradouro, numero, bairro, cidade, cep, situacao]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        if (erro.code === '23503') {
            return res.status(400).json({
                mensagem: 'O cidadão informado não existe.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao cadastrar imóvel.'
        });
    }
};

// Listar imóveis
const listarImoveis = async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM imovel ORDER BY id_imovel'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar imóveis.'
        });
    }
};

module.exports = {
    cadastrarImovel,
    listarImoveis
};
