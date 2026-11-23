const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let services = [];
let token = sessionStorage.getItem('soundfier_token');
let currentUser = null;
const titles = {
  inicio: ['Sua cidade, mais perto de você.', 'Encontre serviços, registre solicitações e acompanhe seus protocolos em um só lugar.'],
  servicos: ['Serviços disponíveis', 'Escolha o atendimento que você precisa.'],
  solicitar: ['Como podemos ajudar?', 'Registre sua solicitação de forma simples.'],
  historico: ['Meus pedidos', 'Acompanhe suas solicitações em um só lugar.'],
  conta: ['Minha conta', 'Entre ou crie seu cadastro para acessar seus pedidos.']
};
function alertMsg(message) {
  $('#alert').textContent = message;
  $('#alert').classList.remove('hidden');
}
function page(name) {
  $$('.page').forEach(el => el.classList.toggle('hidden', el.id !== 'page-' + name));
  $$('.nav').forEach(el => el.classList.toggle('active', el.dataset.page === name));
  $('#page-title').textContent = titles[name][0];
  $('#page-subtitle').textContent = titles[name][1];
  $('#alert').classList.add('hidden');
  if (name === 'servicos' || name === 'solicitar') loadServices();
  if (name === 'historico' && currentUser) loadHistory();
  if ((name === 'historico' || name === 'solicitar') && !currentUser) alertMsg('Entre ou crie uma conta em Minha conta para continuar.');
  window.scrollTo(0, 0);
}
$$('[data-page]').forEach(button => button.onclick = () => page(button.dataset.page));
$$('[data-go]').forEach(button => button.onclick = () => page(button.dataset.go));
async function api(endpoint, options = {}) {
  const headers = {...(options.headers || {})};
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch('/api/' + endpoint, {...options, headers});
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Error(data?.mensagem || 'Erro HTTP ' + response.status);
  return data;
}
function element(tag, text, className) {
  const el = document.createElement(tag);
  el.textContent = text ?? '';
  if (className) el.className = className;
  return el;
}
function refreshAccount() {
  $('#account-forms').classList.toggle('hidden', !!currentUser);
  $('#account-info').classList.toggle('hidden', !currentUser);
  $('#account-name').textContent = currentUser ? 'Olá, ' + currentUser.nome : '';
  $('#request-account-status').textContent = currentUser ? 'Solicitação em nome de ' + currentUser.nome : 'Entre na sua conta para registrar solicitações.';
  $('#history-account-status').textContent = currentUser ? 'Pedidos de ' + currentUser.nome : 'Entre na sua conta para consultar seus pedidos.';
  $('#submit-request').disabled = !currentUser;
}
async function restoreSession() {
  if (token) {
    try { currentUser = await api('minha-conta'); }
    catch { token = null; sessionStorage.removeItem('soundfier_token'); }
  }
  refreshAccount();
}
$('#signup-form').onsubmit = async event => {
  event.preventDefault();
  const cpf = $('#signup-cpf').value.replace(/\D/g, '');
  try {
    const data = await api('cidadaos', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
      cpf, nome:$('#signup-name').value.trim(), email:$('#signup-email').value.trim(),
      telefone:$('#signup-phone').value.trim(), senha:$('#signup-password').value
    })});
    $('#login-cpf').value = cpf;
    $('#signup-form').reset();
    alertMsg('Cadastro realizado! Agora entre com seu CPF e sua senha.');
    $('#login-password').focus();
  } catch(err) { alertMsg('Não foi possível cadastrar: ' + err.message); }
};
$('#login-form').onsubmit = async event => {
  event.preventDefault();
  try {
    const data = await api('login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
      cpf:$('#login-cpf').value.replace(/\D/g,''), senha:$('#login-password').value
    })});
    token = data.token;
    sessionStorage.setItem('soundfier_token', token);
    currentUser = data.cidadao;
    $('#login-form').reset();
    refreshAccount();
    page('historico');
  } catch(err) { alertMsg('Não foi possível entrar: ' + err.message); }
};
$('#logout').onclick = () => {
  token = null;
  currentUser = null;
  sessionStorage.removeItem('soundfier_token');
  $('#history').replaceChildren();
  refreshAccount();
  page('inicio');
};
async function loadServices() {
  try {
    services = await api('servicos');
    $('#connection').textContent = '● Sistema disponível';
    $('#connection').classList.remove('bad');
    renderServices();
    const select = $('#service-select');
    const old = select.value;
    select.replaceChildren(new Option('Selecione um serviço', ''));
    services.forEach(service => select.add(new Option(service.nome, service.id_servico)));
    select.value = old;
  } catch(err) {
    $('#connection').textContent = '● Sistema indisponível';
    $('#connection').classList.add('bad');
    $('#services').replaceChildren(element('p', 'Não foi possível carregar os serviços.'));
    alertMsg('Não foi possível consultar os serviços: ' + err.message);
  }
}
function renderServices() {
  const box = $('#services');
  box.replaceChildren();
  const query = $('#search').value.toLowerCase();
  const filtered = services.filter(s => (s.nome + ' ' + (s.categoria || '') + ' ' + (s.descricao || '')).toLowerCase().includes(query));
  if (!filtered.length) { box.append(element('p','Nenhum serviço encontrado.')); return; }
  filtered.forEach(service => {
    const card = element('article', '', 'service');
    card.append(element('small', service.categoria || 'Serviço municipal'), element('strong',service.nome), element('p',service.descricao || ''));
    const button = element('button', 'Solicitar →');
    button.onclick = () => { page('solicitar'); $('#service-select').value = service.id_servico; };
    card.append(button);
    box.append(card);
  });
}
$('#search').oninput = renderServices;
$('#reload').onclick = loadServices;
$('#request-form').onsubmit = async event => {
  event.preventDefault();
  if (!currentUser) { page('conta'); return; }
  const button = $('#submit-request');
  button.disabled = true;
  try {
    const id_servico = Number($('#service-select').value);
    if (!id_servico) throw Error('Selecione um serviço.');
    const protocol = 'SF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const data = await api('solicitacoes', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
      id_servico, descricao:$('#description').value.trim(), numero_protocolo:protocol
    })});
    $('#protocol').replaceChildren(element('strong','Solicitação registrada com sucesso!'), element('p','Protocolo: ' + (data.solicitacao?.numero_protocolo || protocol)));
    $('#protocol').classList.remove('hidden');
    $('#request-form').reset();
  } catch(err) { alertMsg('Falha ao registrar: ' + err.message); }
  finally { button.disabled = !currentUser; }
};
async function loadHistory() {
  const box = $('#history');
  if (!currentUser) { box.replaceChildren(); return; }
  box.replaceChildren(element('p','Consultando...'));
  try {
    const rows = await api('solicitacoes');
    box.replaceChildren();
    if (!rows.length) box.append(element('p','Você ainda não possui solicitações.'));
    rows.forEach(request => {
      const item = element('div','','history-item');
      const name = services.find(s => Number(s.id_servico) === Number(request.id_servico))?.nome || 'Serviço #' + request.id_servico;
      item.append(element('small','Protocolo: ' + request.numero_protocolo), element('strong',name), element('p','Status: ' + (request.status || 'Pendente')), element('p',request.descricao || 'Sem descrição'));
      box.append(item);
    });
  } catch(err) { box.replaceChildren(element('p','Não foi possível consultar: ' + err.message)); }
}
$('#contrast').onclick = () => document.body.classList.toggle('contrast');
let fontSize = 16;
$('#font').onclick = () => { fontSize = fontSize >= 20 ? 16 : fontSize + 2; document.documentElement.style.fontSize = fontSize + 'px'; };
$('#speak').onclick = () => {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Speech) { $('#speech-result').textContent = 'Seu navegador não suporta reconhecimento de voz.'; return; }
  const recognition = new Speech();
  recognition.lang = 'pt-BR';
  recognition.onresult = event => {
    const term = event.results[0][0].transcript;
    page('servicos');
    $('#search').value = term;
    renderServices();
    $('#speech-result').textContent = 'Você disse: ' + term;
  };
  recognition.onerror = () => { $('#speech-result').textContent = 'Não foi possível reconhecer sua fala.'; };
  recognition.start();
  $('#speech-result').textContent = 'Ouvindo...';
};
restoreSession();
loadServices();
