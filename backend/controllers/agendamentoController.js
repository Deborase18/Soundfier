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

        const id_cidadao = req.citizenId;

        const solicitacao = await pool.query(
            `SELECT id_solicitacao
            FROM solicitacao
            WHERE id_solicitacao = $1
            AND id_cidadao = $2`,
            [id_solicitacao, id_cidadao]
        );

        if (solicitacao.rows.length === 0) {
            return res.status(403).json({
                mensagem: 'Você não pode agendar usando esta solicitação.'
            });
        }
        // Verificar se o horário já está ocupado
        const horarioOcupado = await pool.query(
            `SELECT id_agendamento
            FROM agendamento
            WHERE id_unidade = $1
            AND data_agendamento = $2
            AND horario = $3
            AND LOWER(status) = 'agendado'`,
            [id_unidade, data_agendamento, horario]
        );

        if (horarioOcupado.rows.length > 0) {
            return res.status(409).json({
                mensagem: 'Esse horário já está ocupado. Escolha outro horário.'
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
        if (erro.code === '23505') {
            return res.status(409).json({
            mensagem: 'Esse horário já está ocupado. Escolha outro horário.'
        });
}

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


// Consultar horários disponíveis pela manhã
async function listarHorariosDisponiveis(req, res) {
    try {
        const { id_unidade, data } = req.query;

        if (!id_unidade || !data) {
            return res.status(400).json({
                mensagem: 'Informe a unidade e a data.'
            });
        }

        // Horários disponíveis: 08h até 11h30
        const horariosPossiveis = [];

        for (let minutos = 480; minutos < 720; minutos += 30) {
            const horas = String(Math.floor(minutos / 60)).padStart(2, '0');
            const minutosRestantes = String(minutos % 60).padStart(2, '0');

            horariosPossiveis.push(`${horas}:${minutosRestantes}`);
        }

        // Consultar horários já ocupados no banco
        const resultado = await pool.query(
            `SELECT TO_CHAR(horario, 'HH24:MI') AS horario
             FROM agendamento
             WHERE id_unidade = $1
             AND data_agendamento = $2
             AND LOWER(status) = 'agendado'`,
            [id_unidade, data]
        );

        const ocupados = resultado.rows.map(item => item.horario);

        const disponiveis = horariosPossiveis.filter(
            horario => !ocupados.includes(horario)
        );

        res.status(200).json(disponiveis);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao consultar horários disponíveis.'
        });
    }
}
module.exports = {
    cadastrarAgendamento,
    listarAgendamentos,
    listarHorariosDisponiveis
};
