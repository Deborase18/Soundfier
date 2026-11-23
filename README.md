# Soundfier — MVP

Plataforma de serviços municipais com cadastro de cidadão, login e área de solicitações.

## Executar

1. Configure o PostgreSQL com `database/criacao_tabelas.sql` e, se necessário, `database/dados_iniciais.sql`.
2. Crie `backend/.env` a partir de `backend/.env.example`, preenchendo a conexão local.
3. Gere uma chave aleatória com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` e use-a em `SESSION_SECRET` no `.env`.
4. No terminal: `cd backend`, `npm install`, `npm start`.
5. Acesse `http://localhost:3000`.

## Testar

Cadastre uma conta fictícia, entre, escolha um serviço, registre um pedido e consulte-o em Meus pedidos. O ID do cidadão é atribuído pelo banco e não precisa ser digitado.

## Segurança e limitações

- Os pedidos são associados ao cidadão autenticado no servidor. A listagem de pedidos exige autenticação.
- Tokens são assinados, expiram após 8 horas e são mantidos apenas na sessão da aba.
- Esta versão é um MVP acadêmico para testes locais com dados fictícios. Antes de publicar, implementar limitação de tentativas de login, HTTPS, política de senhas, revisão das demais rotas administrativas, proteção contra abuso e testes de segurança.
- Nunca versionar `.env` ou `node_modules`.
