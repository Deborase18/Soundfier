const pool = require('../config/database');

// Cadastrar agendamento
async function cadastrarAgendamento(req, res) {
    try {
        const {
            id_solicitacao,
            id_unidade,
            horario,
            data_agendamento,
            tipo_consulta
        } = req.body;

        if (!id_solicitacao || !id_unidade || !horario || !data_agendamento) {
            return res.status(400).json({
                mensagem: 'Solicitação, unidade, horário e data são obrigatórios.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO agendamento
            (id_solicitacao, id_unidade, horario, data_agendamento, tipo_consulta)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                id_solicitacao,
                id_unidade,
                horario,
                data_agendamento,
                tipo_consulta || null
            ]
        );

        res.status(201).json({
            mensagem: 'Agendamento cadastrado com sucesso!',
            agendamento: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === '23503') {
            return res.status(400).json({
                mensagem: 'A solicitação ou unidade informada não existe.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao cadastrar agendamento.'
        });
    }
}

// Listar agendamentos
async function listarAgendamentos(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT * FROM agendamento
             ORDER BY id_agendamento`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar agendamentos.'
        });
    }
}

module.exports = {
    cadastrarAgendamento,
    listarAgendamentos
};
