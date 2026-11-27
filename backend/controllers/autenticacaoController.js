const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { sign } = require('../auth');

// Realizar autenticação do cidadão
async function autenticarCidadao(req, res) {
    try {
        const cpf = String(req.body.cpf || '').replace(/\D/g, '');
        const senha = req.body.senha;

        if (!cpf || !senha) {
            return res.status(400).json({
                mensagem: 'CPF e senha são obrigatórios.'
            });
        }

        const resultado = await pool.query(
            `SELECT id_cidadao, nome, email, senha_hash
             FROM cidadao
             WHERE cpf = $1`,
            [cpf]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensagem: 'CPF ou senha inválidos.'
            });
        }

        const cidadao = resultado.rows[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            cidadao.senha_hash
        );

        const status = senhaCorreta ? 'Sucesso' : 'Falha';

        await pool.query(
            `INSERT INTO autenticacao (id_cidadao, status)
             VALUES ($1, $2)`,
            [cidadao.id_cidadao, status]
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'CPF ou senha inválidos.'
            });
        }

        res.status(200).json({
            mensagem: 'Autenticação realizada com sucesso!',
            token: sign({ id: cidadao.id_cidadao }),
            cidadao: {
                id_cidadao: cidadao.id_cidadao,
                nome: cidadao.nome,
                email: cidadao.email
            }
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao realizar autenticação.'
        });
    }
}

// Listar registros de autenticação
async function listarAutenticacoes(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT * FROM autenticacao
             ORDER BY id_autenticacao`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar autenticações.'
        });
    }
}

module.exports = {
    autenticarCidadao,
    listarAutenticacoes
};
