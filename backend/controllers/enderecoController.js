const pool = require('../config/database');

// Cadastrar endereço
const cadastrarEndereco = async (req, res) => {
    try {
        const {
            id_cidadao,
            logradouro,
            bairro,
            numero,
            cidade,
            cep,
            uf
        } = req.body;

        if (!id_cidadao) {
            return res.status(400).json({
                mensagem: 'O ID do cidadão é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO endereco
            (id_cidadao, logradouro, bairro, numero, cidade, cep, uf)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [id_cidadao, logradouro, bairro, numero, cidade, cep, uf]
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
            mensagem: 'Erro ao cadastrar endereço.'
        });
    }
};

// Listar endereços
const listarEnderecos = async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM endereco ORDER BY id_endereco'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar endereços.'
        });
    }
};

module.exports = {
    cadastrarEndereco,
    listarEnderecos
};
