const pool = require('../config/database');

// Cadastrar feedback
async function cadastrarFeedback(req, res) {
    try {
        const { id_solicitacao, nota, comentario } = req.body;
        const id_cidadao = req.citizenId;

        if (!id_solicitacao || !nota) {
            return res.status(400).json({
                mensagem: 'A solicitação e a nota são obrigatórias.'
            });
        }
        const solicitacao = await pool.query(
            `SELECT id_solicitacao, status
            FROM solicitacao
            WHERE id_solicitacao = $1
            AND id_cidadao = $2`,
            [id_solicitacao, id_cidadao]
        );

        if (solicitacao.rows.length === 0) {
            return res.status(403).json({
                mensagem: 'Você não pode avaliar esta solicitação.'
            });
        }

        const status = String(solicitacao.rows[0].status || '').toLowerCase();

        if (!['concluído', 'concluido', 'atendido'].includes(status)) {
            return res.status(400).json({
                mensagem: 'Você só pode avaliar uma solicitação concluída.'
            });
        }

        if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
            return res.status(400).json({
                mensagem: 'A nota deve ser um número inteiro entre 1 e 5.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO feedback
            (id_solicitacao, nota, comentario)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [id_solicitacao, nota, comentario || null]
        );

        res.status(201).json({
            mensagem: 'Feedback cadastrado com sucesso!',
            feedback: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        if (erro.code === '23505') {
            return res.status(409).json({
                mensagem: 'Esta solicitação já foi avaliada.'
            });
        }

        if (erro.code === '23503') {
            return res.status(400).json({
                mensagem: 'A solicitação informada não existe.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao cadastrar feedback.'
        });
    }
}

// Listar feedbacks
async function listarFeedbacks(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT id_solicitacao
             FROM feedback
             WHERE id_solicitacao IN (
                 SELECT id_solicitacao
                 FROM solicitacao
                 WHERE id_cidadao = $1
             )`,
            [req.citizenId]
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao consultar avaliações.'
        });
    }
}
module.exports = {
    cadastrarFeedback,
    listarFeedbacks
};
