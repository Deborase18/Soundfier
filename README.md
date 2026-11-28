# Soundfier

O Soundfier é um sistema que facilita o acesso dos cidadãos aos serviços municipais, permitindo realizar solicitações e utilizar comandos de voz para navegar pela plataforma.

## Como executar o projeto

1. Crie o banco de dados PostgreSQL utilizando o arquivo `database/criacao_tabelas.sql`.
2. Se necessário, execute também o arquivo `database/dados_iniciais.sql`.
3. Crie o arquivo `.env` dentro da pasta `backend`, seguindo o modelo do arquivo `.env.example`.
4. Configure os dados de acesso ao banco e gere uma chave para o `SESSION_SECRET` usando:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Abra o terminal na pasta `backend` e instale as dependências:

   ```bash
   npm install
   ```

6. Para iniciar o sistema, execute:

   ```bash
   node server.js
   ```

   Também é possível usar `npm start`. Durante o desenvolvimento, use `npm run dev`.

7. Abra o navegador e acesse `http://localhost:3000`.

## Como testar

Faça um cadastro com dados fictícios, entre na sua conta, escolha um serviço e registre uma solicitação. Depois, acesse a área de acompanhamento para consultar o pedido. Também é possível navegar pelo sistema utilizando comandos de voz.

## Observações

- É necessário estar logado para consultar as próprias solicitações.
- O token de acesso tem validade de 8 horas.
- O projeto foi desenvolvido como um MVP acadêmico e utiliza dados fictícios para testes locais.
- Para utilizar o sistema em um ambiente real, ainda são necessários outros cuidados de segurança.
- Os arquivos `.env` e as pastas `node_modules` não devem ser enviados ao GitHub.

## Tecnologias utilizadas

- HTML, CSS e JavaScript
- Node.js e Express
- PostgreSQL