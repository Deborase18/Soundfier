
-- =========================================
-- BANCO DE DADOS: SOUNDFIER
-- =========================================

-- 1. CIDADÃO
CREATE TABLE IF NOT EXISTS cidadao (
    id_cidadao SERIAL PRIMARY KEY,
    cpf CHAR(11) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE
);

-- 2. SERVIÇO
CREATE TABLE IF NOT EXISTS servico (
    id_servico SERIAL PRIMARY KEY,
    categoria VARCHAR(100),
    descricao TEXT,
    nome VARCHAR(150) NOT NULL
);

-- 3. IMÓVEL
CREATE TABLE IF NOT EXISTS imovel (
    id_imovel SERIAL PRIMARY KEY,
    id_cidadao INT NOT NULL,
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    cep CHAR(8),
    situacao VARCHAR(50),

    FOREIGN KEY (id_cidadao)
        REFERENCES cidadao(id_cidadao)
);

-- 4. ENDEREÇO
CREATE TABLE IF NOT EXISTS endereco (
    id_endereco SERIAL PRIMARY KEY,
    id_cidadao INT NOT NULL,
    logradouro VARCHAR(200),
    bairro VARCHAR(100),
    numero VARCHAR(20),
    cidade VARCHAR(100),
    cep CHAR(8),
    uf CHAR(2),

    FOREIGN KEY (id_cidadao)
        REFERENCES cidadao(id_cidadao)
);

-- 5. SOLICITAÇÃO
CREATE TABLE IF NOT EXISTS solicitacao (
    id_solicitacao SERIAL PRIMARY KEY,
    id_cidadao INT NOT NULL,
    id_servico INT NOT NULL,
    id_imovel INT,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descricao TEXT,
    status VARCHAR(30) DEFAULT 'Pendente',
    resposta TEXT,
    numero_protocolo VARCHAR(30) UNIQUE NOT NULL,

    FOREIGN KEY (id_cidadao)
        REFERENCES cidadao(id_cidadao),

    FOREIGN KEY (id_servico)
        REFERENCES servico(id_servico),

    FOREIGN KEY (id_imovel)
        REFERENCES imovel(id_imovel)
);

-- 6. UNIDADE
CREATE TABLE IF NOT EXISTS unidade (
    id_unidade SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    numero VARCHAR(20),
    logradouro VARCHAR(200),
    bairro VARCHAR(100),
    telefone VARCHAR(20)
);

-- 7. AGENDAMENTO
CREATE TABLE IF NOT EXISTS agendamento (
    id_agendamento SERIAL PRIMARY KEY,
    id_solicitacao INT NOT NULL,
    id_unidade INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Agendado',
    horario TIME NOT NULL,
    data_agendamento DATE NOT NULL,
    tipo_consulta VARCHAR(100),

    FOREIGN KEY (id_solicitacao)
        REFERENCES solicitacao(id_solicitacao),

    FOREIGN KEY (id_unidade)
        REFERENCES unidade(id_unidade)
);

-- 8. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
    id_feedback SERIAL PRIMARY KEY,
    id_solicitacao INT NOT NULL,
    nota SMALLINT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_solicitacao)
        REFERENCES solicitacao(id_solicitacao)
);

-- 9. AUTENTICAÇÃO
CREATE TABLE IF NOT EXISTS autenticacao (
    id_autenticacao SERIAL PRIMARY KEY,
    id_cidadao INT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30),

    FOREIGN KEY (id_cidadao)
        REFERENCES cidadao(id_cidadao)
);

-- 10. INTERAÇÃO
CREATE TABLE IF NOT EXISTS interacao (
    id_interacao SERIAL PRIMARY KEY,
    id_cidadao INT NOT NULL,
    tipo_entrada VARCHAR(30),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comando_recebido TEXT,
    resposta_sistema TEXT,
    resultado TEXT,
    compreendida BOOLEAN,

    FOREIGN KEY (id_cidadao)
        REFERENCES cidadao(id_cidadao)
);

