const pool = require('../config/database');

// Cadastrar solicitação
async function cadastrarSolicitacao(req, res) {
    try {
        const {
            id_cidadao,
            id_servico,
            id_imovel,
            descricao,
            numero_protocolo
        } = req.body;

        if (!id_cidadao || !id_servico || !numero_protocolo) {
            return res.status(400).json({
                mensagem: 'Cidadão, serviço e número de protocolo são obrigatórios.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO solicitacao
            (id_cidadao, id_servico, id_imovel, descricao, numero_protocolo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                id_cidadao,
                id_servico,
                id_imovel || null,
                descricao || null,
                numero_protocolo
            ]
        );

        res.status(201).json({
            mensagem: 'Solicitação cadastrada com sucesso!',
            solicitacao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === '23503') {
            return res.status(400).json({
                mensagem: 'O cidadão, serviço ou imóvel informado não existe.'
            });
        }

        if (erro.code === '23505') {
            return res.status(409).json({
                mensagem: 'Este número de protocolo já está cadastrado.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao cadastrar solicitação.'
        });
    }
}

// Listar solicitações
async function listarSolicitacoes(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT * FROM solicitacao
             ORDER BY id_solicitacao`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar solicitações.'
        });
    }
}

module.exports = {
    cadastrarSolicitacao,
    listarSolicitacoes
};
