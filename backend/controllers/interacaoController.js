const pool = require('../config/database');

// Registrar interação
async function cadastrarInteracao(req, res) {
    try {
        const {
            tipo_entrada,
            comando_recebido,
            resposta_sistema,
            resultado,
            compreendida
        } = req.body;
        const id_cidadao = req.citizenId;

        if (!id_cidadao) {
            return res.status(401).json({
                mensagem: 'Cidadão não autenticado.'
            });
        }

        if (!comando_recebido || !comando_recebido.trim()) {
            return res.status(400).json({
                mensagem: 'O comando recebido é obrigatório.'
            });
        }

        const resultadoBanco = await pool.query(
            `INSERT INTO interacao
            (id_cidadao, tipo_entrada, comando_recebido,
             resposta_sistema, resultado, compreendida)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                id_cidadao,
                tipo_entrada || null,
                comando_recebido,
                resposta_sistema || null,
                resultado || null,
                compreendida ?? null
            ]
        );

        res.status(201).json({
            mensagem: 'Interação registrada com sucesso!',
            interacao: resultadoBanco.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === '23503') {
            return res.status(400).json({
                mensagem: 'O cidadão informado não existe.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao registrar interação.'
        });
    }
}

// Listar interações
async function listarInteracoes(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT * FROM interacao
             ORDER BY id_interacao`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar interações.'
        });
    }
}

module.exports = {
    cadastrarInteracao,
    listarInteracoes
};
