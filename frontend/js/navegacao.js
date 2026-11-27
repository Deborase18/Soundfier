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
  if (name === 'solicitar' && currentUser) loadUnits();
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
function verificarAgendamento() {
    const servicoSelecionado = services.find(
        service => String(service.id_servico) === $('#service-select').value
    );

    const campos = $('#appointment-fields');

    if (!servicoSelecionado) {
        campos.classList.add('hidden');
        return;
    }

    const nome = servicoSelecionado.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const precisaAgendar =
        nome.includes('consulta') ||
        nome.includes('agendamento');

    campos.classList.toggle('hidden', !precisaAgendar);

    if (precisaAgendar) {
        loadUnits();
    }
}

$('#service-select').addEventListener('change', verificarAgendamento);

async function loadUnits() {
    try {
        const units = await api('unidades');
        const select = $('#unit-select');

        select.replaceChildren(
            new Option('Selecione uma unidade', '')
        );

        units.forEach(unit => {
            select.add(
                new Option(unit.nome, unit.id_unidade)
            );
        });

    } catch (err) {
        alertMsg('Não foi possível carregar as unidades: ' + err.message);
    }
}
async function loadAvailableTimes() {
  console.log('A função loadAvailableTimes foi chamada!');

    const unidade = $('#unit-select').value;
    const data = $('#appointment-date').value;
    const horarioSelect = $('#appointment-time');

    horarioSelect.replaceChildren(
        new Option('Carregando horários...', '')
    );

    if (!unidade || !data) {
        horarioSelect.replaceChildren(
            new Option('Selecione a unidade e a data primeiro', '')
        );
        return;
    }

    try {
        const horarios = await api(
            `agendamentos/disponiveis?id_unidade=${unidade}&data=${data}`
        );

        horarioSelect.replaceChildren(
            new Option('Selecione um horário', '')
        );

        horarios.forEach(horario => {
            horarioSelect.add(
                new Option(horario, horario)
            );
        });

        if (!horarios.length) {
            horarioSelect.replaceChildren(
                new Option('Não há horários disponíveis', '')
            );
        }

    } catch (err) {
        horarioSelect.replaceChildren(
            new Option('Erro ao consultar horários', '')
        );
        alertMsg('Não foi possível consultar os horários: ' + err.message);
    }
}
$('#appointment-date').addEventListener('change', loadAvailableTimes);

$('#unit-select').addEventListener('change', loadAvailableTimes);

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

    if (!currentUser) {
        page('conta');
        return;
    }

    const button = $('#submit-request');
    button.disabled = true;

    try {
        const id_servico = Number($('#service-select').value);

        if (!id_servico) {
            throw Error('Selecione um serviço.');
        }

        // Verificar se o serviço precisa de agendamento
        const servicoSelecionado = services.find(
            service => Number(service.id_servico) === id_servico
        );

        const nome = servicoSelecionado.nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const precisaAgendar =
            nome.includes('consulta') ||
            nome.includes('agendamento');

        // Validar os dados do agendamento
        if (precisaAgendar) {
            if (!$('#unit-select').value) {
                throw Error('Selecione uma unidade.');
            }

            if (!$('#appointment-date').value) {
                throw Error('Selecione uma data.');
            }

            if (!$('#appointment-time').value) {
                throw Error('Selecione um horário.');
            }
        }

        const protocol = 'SF-' + Date.now() + '-' +
            Math.floor(Math.random() * 1000);

        // Primeiro: cadastrar a solicitação
        const data = await api('solicitacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_servico,
                descricao: $('#description').value.trim(),
                numero_protocolo: protocol
            })
        });

        // Segundo: cadastrar o agendamento, se necessário
        if (precisaAgendar) {
          console.log('Enviando agendamento...');

            await api('agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_solicitacao: data.solicitacao.id_solicitacao,
                    id_unidade: Number($('#unit-select').value),
                    data_agendamento: $('#appointment-date').value,
                    horario: $('#appointment-time').value,
                    tipo_consulta: servicoSelecionado.nome
                })
            });
            console.log('Agendamento salvo com sucesso!');
        }

        const mensagem = precisaAgendar
            ? 'Solicitação e agendamento registrados com sucesso!'
            : 'Solicitação registrada com sucesso!';

        $('#protocol').replaceChildren(
            element('strong', mensagem),
            element('p', 'Protocolo: ' +
                (data.solicitacao?.numero_protocolo || protocol))
        );

        $('#protocol').classList.remove('hidden');
        $('#request-form').reset();
        verificarAgendamento();

    } catch (err) {
        alertMsg('Falha ao registrar: ' + err.message);
    } finally {
        button.disabled = !currentUser;
    }
};



async function loadHistory() {
    const box = $('#history');

    if (!currentUser) {
        box.replaceChildren();
        return;
    }

    box.replaceChildren(element('p', 'Consultando...'));

    try {
        const rows = await api('solicitacoes');
        const agendamentos = await api('agendamentos');

        box.replaceChildren();

        if (!rows.length) {
            box.append(element('p', 'Você ainda não possui solicitações.'));
            return;
        }

        rows.forEach(request => {
            const item = element('div', '', 'history-item');

            const name = services.find(
                s => Number(s.id_servico) === Number(request.id_servico)
            )?.nome || 'Serviço #' + request.id_servico;

            item.append(
                element('small', 'Protocolo: ' + request.numero_protocolo),
                element('strong', name),
                element('p', 'Status: ' + (request.status || 'Pendente')),
                element('p', request.descricao || 'Sem descrição')
            );

            const relacionados = agendamentos.filter(
                a => Number(a.id_solicitacao) === Number(request.id_solicitacao)
            );

            relacionados.forEach(agendamento => {
                const data = String(agendamento.data_agendamento)
                    .slice(0, 10)
                    .split('-')
                    .reverse()
                    .join('/');

                const horario = String(agendamento.horario).slice(0, 5);

                item.append(
                    element('strong', 'Dados do agendamento'),
                    element('p', 'Unidade: ' + agendamento.unidade),
                    element('p', 'Data: ' + data),
                    element('p', 'Horário: ' + horario),
                    element('p', 'Status do agendamento: ' + agendamento.status_agendamento)
                );

                // Mostrar botão somente para agendamentos ativos
                if (String(agendamento.status_agendamento).toLowerCase() === 'agendado') {
                    const cancelar = element('button', 'Cancelar agendamento', 'small-btn');
                    cancelar.type = 'button';

                    cancelar.addEventListener('click', async () => {
                        if (!confirm('Deseja realmente cancelar este agendamento?')) {
                            return;
                        }

                        cancelar.disabled = true;

                        try {
                            const resultado = await api(
                                `agendamentos/${agendamento.id_agendamento}/cancelar`,
                                { method: 'PATCH' }
                            );

                            alertMsg(resultado.mensagem);
                            await loadHistory();

                        } catch (err) {
                            alertMsg('Erro ao cancelar: ' + err.message);
                            cancelar.disabled = false;
                        }
                    });

                    item.append(cancelar);
                }
            });

            box.append(item);
        });

    } catch (err) {
        box.replaceChildren(
            element('p', 'Não foi possível consultar: ' + err.message)
        );
    }
}

$('#contrast').onclick = () => document.body.classList.toggle('contrast');
let fontSize = 16;
$('#font').onclick = () => { fontSize = fontSize >= 20 ? 16 : fontSize + 2; document.documentElement.style.fontSize = fontSize + 'px'; };

function falarMensagem(mensagem) {
    return new Promise(resolve => {
        const fala = new SpeechSynthesisUtterance(mensagem);
        fala.lang = 'pt-BR';

        fala.onend = resolve;
        fala.onerror = resolve;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(fala);
    });
}

function ouvirResposta() {
    return new Promise((resolve, reject) => {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!Speech) {
            reject(new Error('Seu navegador não suporta reconhecimento de voz.'));
            return;
        }

        const reconhecimento = new Speech();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.onresult = event => {
            resolve(event.results[0][0].transcript);
        };

        reconhecimento.onerror = () => {
            reject(new Error('Não consegui entender sua resposta. Tente novamente.'));
        };

        reconhecimento.onend = () => {
            reject(new Error('Não ouvi sua resposta. Tente novamente.'));
        };

        reconhecimento.start();
    });
}


async function iniciarCadastroPorVoz() {
    try {
        const normalizar = texto => texto.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

        const limparEmail = texto => normalizar(texto)
            .replace(/\s+arroba\s+/g, '@')
            .replace(/\s+at\s+/g, '@')
            .replace(/\s+ponto\s+/g, '.')
            .replace(/\s+(underline|sublinhado)\s+/g, '_')
            .replace(/\s+(hifen|traco)\s+/g, '-')
            .replace(/\s/g, '');

        // Nome
        await falarMensagem('Qual é seu nome completo?');
        let nome = await ouvirResposta();
        $('#signup-name').value = nome.trim();

        // CPF
        await falarMensagem('Agora diga os onze números do seu CPF.');

        let cpf = '';

        while (cpf.length !== 11) {
            const resposta = await ouvirResposta();
            cpf = resposta.replace(/\D/g, '');

            if (cpf.length !== 11) {
                await falarMensagem('Não consegui identificar os onze números. Vamos tentar novamente. Diga seu CPF devagar.');
            }
        }

        $('#signup-cpf').value = cpf;

        // E-mail
        await falarMensagem('Qual é seu endereço de e-mail?');

        let email = '';

        while (!email.includes('@') || !email.split('@')[1]?.includes('.')) {
            const resposta = await ouvirResposta();
            email = limparEmail(resposta);

            if (!email.includes('@') || !email.split('@')[1]?.includes('.')) {
                await falarMensagem('Não consegui identificar seu e-mail corretamente. Vamos tentar novamente.');
            }
        }

        $('#signup-email').value = email;

        // Telefone
        await falarMensagem('Qual é seu telefone? Se não tiver, diga não tenho.');
        let telefoneFalado = await ouvirResposta();
        let telefone = normalizar(telefoneFalado).includes('nao tenho')
            ? ''
            : telefoneFalado.replace(/\D/g, '');

        $('#signup-phone').value = telefone;

        // Conferência dos dados
        let confirmado = false;

        while (!confirmado) {
            const emailParaFalar = email
                .replace('@', ' arroba ')
                .replace(/\./g, ' ponto ');

            await falarMensagem(
                `Vamos conferir seus dados. Seu nome é ${$('#signup-name').value}. ` +
                `Seu CPF termina em ${$('#signup-cpf').value.slice(-4)}. ` +
                `Seu e-mail é ${emailParaFalar}. ` +
                `Seu telefone termina em ${telefone.slice(-4) || 'não informado'}. ` +
                'As informações estão corretas? Diga sim ou não.'
            );

            const resposta = normalizar(await ouvirResposta());

            if (/\b(sim|correto|corretos|estao certos|esta certo)\b/.test(resposta)) {
                confirmado = true;
                break;
            }

            if (/\b(nao|errado|incorreto)\b/.test(resposta)) {
                await falarMensagem('Sem problemas. Qual informação está incorreta? Diga nome, CPF, e-mail ou telefone.');

                let campo = '';

                while (!campo) {
                    const erro = normalizar(await ouvirResposta());

                    if (/\b(nome)\b/.test(erro)) campo = 'nome';
                    else if (/\b(cpf|documento)\b/.test(erro)) campo = 'cpf';
                    else if (/\b(email|correio)\b/.test(erro)) campo = 'email';
                    else if (/\b(telefone|celular)\b/.test(erro)) campo = 'telefone';
                    else await falarMensagem('Não entendi qual campo deseja corrigir. Diga nome, CPF, e-mail ou telefone.');
                }

                if (campo === 'nome') {
                    await falarMensagem('Diga novamente seu nome completo.');
                    nome = await ouvirResposta();
                    $('#signup-name').value = nome.trim();
                }

                if (campo === 'cpf') {
                    await falarMensagem('Diga novamente os onze números do seu CPF.');
                    let novoCpf = '';

                    while (novoCpf.length !== 11) {
                        novoCpf = (await ouvirResposta()).replace(/\D/g, '');

                        if (novoCpf.length !== 11) {
                            await falarMensagem('Não consegui identificar os onze números. Tente novamente.');
                        }
                    }

                    $('#signup-cpf').value = novoCpf;
                }

                if (campo === 'email') {
                    await falarMensagem('Diga novamente seu endereço de e-mail.');
                    let novoEmail = '';

                    while (!novoEmail.includes('@') || !novoEmail.split('@')[1]?.includes('.')) {
                        novoEmail = limparEmail(await ouvirResposta());

                        if (!novoEmail.includes('@') || !novoEmail.split('@')[1]?.includes('.')) {
                            await falarMensagem('Não consegui identificar seu e-mail. Vamos tentar novamente.');
                        }
                    }

                    email = novoEmail;
                    $('#signup-email').value = email;
                }

                if (campo === 'telefone') {
                    await falarMensagem('Diga novamente seu telefone. Se não tiver, diga não tenho.');
                    telefoneFalado = await ouvirResposta();

                    telefone = normalizar(telefoneFalado).includes('nao tenho')
                        ? ''
                        : telefoneFalado.replace(/\D/g, '');

                    $('#signup-phone').value = telefone;
                }

            } else {
                await falarMensagem('Por favor, responda sim se estiver correto ou não se precisar corrigir alguma informação.');
            }
        }

        // Senha digitada manualmente
        await falarMensagem('Pronto! Seus dados foram conferidos. Agora digite sua senha no campo indicado. Por segurança, não fale sua senha em voz alta.');

        $('#signup-password').focus();

        alertMsg('Dados conferidos! Digite sua senha e clique em Cadastrar.');

    } catch (erro) {
        alertMsg(erro.message);
    }
}

$('#speak').onclick = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Speech) {
        $('#speech-result').textContent = 'Seu navegador não suporta reconhecimento de voz.';
        return;
    }

    const recognition = new Speech();
    recognition.lang = 'pt-BR';

    recognition.onresult = async event => {
        const term = event.results[0][0].transcript;
        const fala = term.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        $('#speech-result').textContent = 'Você disse: ' + term;

        // Ir para o início
        if (/\b(inicio|pagina inicial|tela inicial|home|voltar ao inicio)\b/.test(fala)) {
            page('inicio');
            return;
        }

        // Acompanhar solicitações
        if (/\b(acompanhar|historico|meus pedidos|minhas solicitacoes|andamento)\b/.test(fala)) {
            page('historico');
            return;
        }
        // Minha conta: cadastro e login
        if (/\b(quero criar uma conta|minha conta|criar meu cadastro|me cadastrar|fazer cadastro|novo cadastro)\b/.test(fala)) {
            page('conta');

            if (!currentUser) {
                $('#signup-form').scrollIntoView({ behavior: 'smooth' });
                await falarMensagem('Vamos criar sua conta.');
                await iniciarCadastroPorVoz();
            }

            return;
        }

        // Nova solicitação
        if (/\b(nova solicitacao|fazer solicitacao|registrar solicitacao|novo pedido)\b/.test(fala)) {
            page('solicitar');
            return;
        }

        // Agendamentos e consultas
        if (/\b(agendar|agendamento|marcar consulta|marcar atendimento)\b/.test(fala)) {
            await loadServices();
            page('solicitar');

            const servico = services.find(s => {
                const nome = s.nome.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

                return nome.includes('consulta') || nome.includes('agendamento');
            });

            if (servico) {
                $('#service-select').value = servico.id_servico;
            }

            return;
        }

        // Pesquisar serviços
        const pesquisa = fala
            .replace(/\b(quero|preciso|gostaria|de|do|da|dos|das|um|uma|o|a|os|as|por favor|informacoes|informacao|sobre|consultar|pesquisar|buscar|procurar|servico|servicos|para|ver)\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        await loadServices();
        page('servicos');
        $('#search').value = pesquisa || term;
        renderServices();
    };

    recognition.onerror = () => {
        $('#speech-result').textContent = 'Não foi possível reconhecer sua fala.';
    };

    recognition.start();
    $('#speech-result').textContent = 'Ouvindo...';
};
$('#speak-float').onclick = () => $('#speak').click();
restoreSession();
loadServices();
