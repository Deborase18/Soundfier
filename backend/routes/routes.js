
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
    listarAgendamentos
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
router.get('/agendamentos', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));

// Rotas das unidades
router.post('/unidades', cadastrarUnidade);
router.get('/unidades', listarUnidades);

// Rotas dos feedbacks
router.post('/feedbacks', requireAuth, cadastrarFeedback);
router.get('/feedbacks', requireAuth, (req,res)=>res.status(403).json({mensagem:'Acesso restrito.'}));

// Rotas de autenticação
router.post('/login', async (req,res) => {
  try {
    const cpf = String(req.body.cpf || '').replace(/\D/g,'');
    const senha = req.body.senha;
    if (!/^\d{11}$/.test(cpf) || typeof senha !== 'string') return res.status(400).json({mensagem:'Informe CPF e senha válidos.'});
    const result = await pool.query('SELECT id_cidadao, nome, email, senha_hash FROM cidadao WHERE cpf = $1', [cpf]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(senha,user.senha_hash))) return res.status(401).json({mensagem:'CPF ou senha inválidos.'});
    res.json({token:sign({id:user.id_cidadao}),cidadao:{id_cidadao:user.id_cidadao,nome:user.nome,email:user.email}});
  } catch(err) { console.error(err); res.status(500).json({mensagem:'Erro ao entrar.'}); }
});
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
