const pool = require('../config/database');

// Cadastrar feedback
async function cadastrarFeedback(req, res) {
    try {
        const { id_solicitacao, nota, comentario } = req.body;

        if (!id_solicitacao || !nota) {
            return res.status(400).json({
                mensagem: 'A solicitação e a nota são obrigatórias.'
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
            `SELECT * FROM feedback
             ORDER BY id_feedback`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar feedbacks.'
        });
    }
}

module.exports = {
    cadastrarFeedback,
    listarFeedbacks
};
