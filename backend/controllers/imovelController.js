
const pool = require('../config/database');

// Cadastrar imóvel
const cadastrarImovel = async (req, res) => {
    try {
        const {
            logradouro,
            numero,
            bairro,
            cidade,
            cep,
            situacao
        } = req.body;

        const id_cidadao = req.citizenId;
    
        if (!id_cidadao) {
            return res.status(400).json({
                mensagem: 'O ID do cidadão é obrigatório.'
            });
        }

        if (!logradouro || !numero || !bairro || !cidade || !cep) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos do imóvel.'
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
            `SELECT *
            FROM imovel
            WHERE id_cidadao = $1
            ORDER BY id_imovel`,
            [req.citizenId]
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao listar imóveis.'
        });
    }
};

// Editar imóvel
const editarImovel = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            logradouro,
            numero,
            bairro,
            cidade,
            cep
        } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID do imóvel inválido.'
            });
        }

        if (!logradouro || !numero || !bairro || !cidade || !cep) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos do imóvel.'
            });
        }

        const resultado = await pool.query(
            `UPDATE imovel
             SET logradouro = $1,
                 numero = $2,
                 bairro = $3,
                 cidade = $4,
                 cep = $5
             WHERE id_imovel = $6
             AND id_cidadao = $7
             RETURNING *`,
            [
                logradouro,
                numero,
                bairro,
                cidade,
                cep,
                id,
                req.citizenId
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensagem: 'Imóvel não encontrado.'
            });
        }

        res.json({
            mensagem: 'Imóvel atualizado com sucesso!',
            imovel: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao editar imóvel.'
        });
    }
};

// Remover imóvel
const removerImovel = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID do imóvel inválido.'
            });
        }

        const resultado = await pool.query(
            `DELETE FROM imovel
             WHERE id_imovel = $1
             AND id_cidadao = $2
             RETURNING id_imovel`,
            [id, req.citizenId]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensagem: 'Imóvel não encontrado.'
            });
        }

        res.json({
            mensagem: 'Imóvel removido com sucesso!'
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao remover imóvel.'
        });
    }
};

module.exports = {
    cadastrarImovel,
    listarImoveis,
    removerImovel,
    editarImovel
};
