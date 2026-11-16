const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Cadastrar cidadão
async function cadastrarCidadao(req, res) {
    try {
        const { cpf, senha, telefone, email, nome, data_nascimento } = req.body;

        if (!cpf || !senha || !email || !nome) {
            return res.status(400).json({
                mensagem: 'CPF, senha, e-mail e nome são obrigatórios.'
            });
        }

        const senha_hash = await bcrypt.hash(senha, 10);

        const resultado = await pool.query(
            `INSERT INTO cidadao
            (cpf, senha_hash, telefone, email, nome, data_nascimento)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_cidadao, cpf, telefone, email, nome, data_nascimento`,
            [cpf, senha_hash, telefone, email, nome, data_nascimento || null]
        );

        res.status(201).json({
            mensagem: 'Cidadão cadastrado com sucesso!',
            cidadao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === '23505') {
            return res.status(409).json({
                mensagem: 'CPF ou e-mail já cadastrado.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao cadastrar cidadão.'
        });
    }
}

// Listar cidadãos
async function listarCidadaos(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT id_cidadao, cpf, telefone, email, nome, data_nascimento
             FROM cidadao
             ORDER BY id_cidadao`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar cidadãos.'
        });
    }
}

module.exports = {
    cadastrarCidadao,
    listarCidadaos
};
