
const express = require('express');
const router = express.Router();

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
router.get('/cidadaos', listarCidadaos);

// Rotas dos serviços
router.post('/servicos', cadastrarServico);
router.get('/servicos', listarServicos);

// Rotas das solicitações
router.post('/solicitacoes', cadastrarSolicitacao);
router.get('/solicitacoes', listarSolicitacoes);

// Rotas dos agendamentos
router.post('/agendamentos', cadastrarAgendamento);
router.get('/agendamentos', listarAgendamentos);

// Rotas das unidades
router.post('/unidades', cadastrarUnidade);
router.get('/unidades', listarUnidades);

// Rotas dos feedbacks
router.post('/feedbacks', cadastrarFeedback);
router.get('/feedbacks', listarFeedbacks);

// Rotas de autenticação
router.post('/autenticacao', autenticarCidadao);
router.get('/autenticacao', listarAutenticacoes);

// Rotas das interações
router.post('/interacoes', cadastrarInteracao);
router.get('/interacoes', listarInteracoes);

// Imóveis
router.post('/imoveis', cadastrarImovel);
router.get('/imoveis', listarImoveis);

// Endereços
router.post('/enderecos', cadastrarEndereco);
router.get('/enderecos', listarEnderecos);


module.exports = router;
