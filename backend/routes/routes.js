
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const {sign, requireAuth} = require('../auth');

const {
    cadastrarCidadao,
    listarCidadaos
} = require('../controllers/cidadaoController');

const {
    cadastrarServico,
    listarServicos
} = require('../controllers/servicoController');

const {
    cadastrarSolicitacao,
    listarSolicitacoes
} = require('../controllers/solicitacaoController');

const {
    cadastrarAgendamento,
    listarAgendamentos,
    listarHorariosDisponiveis
} = require('../controllers/agendamentoController');

const {
    cadastrarUnidade,
    listarUnidades
} = require('../controllers/unidadeController');

const {
    cadastrarFeedback,
    listarFeedbacks
} = require('../controllers/feedbackController');

const {
    autenticarCidadao,
    listarAutenticacoes
} = require('../controllers/autenticacaoController');

const {
    cadastrarInteracao,
    listarInteracoes
} = require('../controllers/interacaoController');

const {
    cadastrarImovel,
    listarImoveis
} = require('../controllers/imovelController');

const {
    cadastrarEndereco,
    listarEnderecos
} = require('../controllers/enderecoController');



// Rotas dos cidadãos
router.post('/cidadaos', cadastrarCidadao);
router.get('/cidadaos', requireAuth, (req,res) => res.status(403).json({mensagem:'Listagem indisponível.'}));

// Rotas dos serviços
router.post('/servicos', cadastrarServico);
router.get('/servicos', listarServicos);

// Rotas das solicitações
router.post('/solicitacoes', requireAuth, (req,res,next) => { req.body.id_cidadao = req.citizenId; next(); }, cadastrarSolicitacao);
router.get('/solicitacoes', requireAuth, async (req,res) => {
  try { const result = await pool.query('SELECT id_solicitacao, id_servico, descricao, status, numero_protocolo, data_solicitacao FROM solicitacao WHERE id_cidadao = $1 ORDER BY id_solicitacao DESC', [req.citizenId]); res.json(result.rows); }
  catch(err) { console.error(err); res.status(500).json({mensagem:'Erro ao consultar pedidos.'}); }
});

// Rotas dos agendamentos
router.post('/agendamentos', requireAuth, cadastrarAgendamento);

router.get('/agendamentos', requireAuth, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT
                a.id_agendamento,
                a.id_solicitacao,
                a.data_agendamento,
                a.horario,
                a.status AS status_agendamento,
                a.tipo_consulta,
                u.nome AS unidade,
                s.numero_protocolo
             FROM agendamento a
             JOIN solicitacao s
                ON s.id_solicitacao = a.id_solicitacao
             JOIN unidade u
                ON u.id_unidade = a.id_unidade
             WHERE s.id_cidadao = $1
             ORDER BY a.data_agendamento DESC, a.horario DESC`,
            [req.citizenId]
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao consultar agendamentos.'
        });
    }
});
router.get('/agendamentos/disponiveis', requireAuth, listarHorariosDisponiveis);
// Cancelar agendamento
router.patch('/agendamentos/:id/cancelar', requireAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const resultado = await pool.query(
            `UPDATE agendamento a
             SET status = 'Cancelado'
             FROM solicitacao s
             WHERE a.id_agendamento = $1
             AND a.id_solicitacao = s.id_solicitacao
             AND s.id_cidadao = $2
             AND LOWER(a.status) = 'agendado'
             RETURNING a.id_agendamento`,
            [id, req.citizenId]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensagem: 'Agendamento não encontrado ou não pode ser cancelado.'
            });
        }

        res.json({
            mensagem: 'Agendamento cancelado com sucesso!'
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao cancelar agendamento.'
        });
    }
});

// Rotas das unidades
router.post('/unidades', cadastrarUnidade);
router.get('/unidades', listarUnidades);

// Rotas dos feedbacks
router.post('/feedbacks', requireAuth, cadastrarFeedback);
router.get('/feedbacks', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));

// Rotas de autenticação
router.post('/login', autenticarCidadao);

router.get('/minha-conta', requireAuth, async(req,res)=>{
  try { const result = await pool.query('SELECT id_cidadao,nome,email FROM cidadao WHERE id_cidadao=$1',[req.citizenId]); if (!result.rows.length) return res.status(404).json({mensagem:'Conta não encontrada.'}); res.json(result.rows[0]); }
  catch(err) { console.error(err); res.status(500).json({mensagem:'Erro ao consultar conta.'}); }
});
router.post('/autenticacao', (req,res)=>res.status(410).json({mensagem:'Utilize /api/login.'}));
router.get('/autenticacao', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));

// Rotas das interações
router.post('/interacoes', requireAuth, cadastrarInteracao);
router.get('/interacoes', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));

// Imóveis
router.post('/imoveis', requireAuth, cadastrarImovel);
router.get('/imoveis', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));

// Endereços
router.post('/enderecos', requireAuth, cadastrarEndereco);
router.get('/enderecos', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));


module.exports = router;
