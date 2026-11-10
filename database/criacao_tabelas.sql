CREATE TABLE cidadao ( 
cpf INT PRIMARY KEY,  
idsolicitaçao INT,  
idimovel INT,  
senha INT,  
telefone INT,  
email INT,  
nome INT,  
data_nascimento INT,  
); 


CREATE TABLE servico ( 
id_servico INT PRIMARY KEY,  
idsolicitaçao INT,  
categoria INT,  
descricao INT,  
nome INT,  
); 


CREATE TABLE solicitaçao ( 
id_solicitacao INT PRIMARY KEY,  
data INT,  
descricao INT,  
status INT,  
resposta INT,  
numero_protocolo INT,  
); 


CREATE TABLE feedback ( 
id_feedback INT PRIMARY KEY,  
idsolicitaçao INT,  
nota INT,  
comentario INT,  
data_avaliacao INT,  
); 

CREATE TABLE autenticacao ( 
id_autenticacao INT PRIMARY KEY,  
idcidadao INT,  
data INT,  
horario INT,  
status INT,  
); 


CREATE TABLE interacao ( 
id_interacao INT PRIMARY KEY,  
idcidadao INT,  
tipo_entrada INT,  
data_hora INT,
comando_recebido INT,  
resposta_sistema INT,  
resultado INT,  
compreendida INT,  
); 


CREATE TABLE imovel ( 
id_imovel INT PRIMARY KEY,  
idsolicitaçao INT,  
logradouro INT,  
numero INT,  
bairro INT,  
cidade INT,  
cep INT,  
situacao INT,  
); 


CREATE TABLE unidade ( 
id_unidade INT PRIMARY KEY,  
idagendamento INT,  
nome INT,  
numero INT,  
logradouro INT,  
bairro INT,  
telefone INT,  
); 


CREATE TABLE agendamento ( 
id_agendamento INT PRIMARY KEY,  
idsolicitaçao INT,  
status INT,  
horario INT,  
data_agendamento INT,  
tipo_consulta INT,  
); 


CREATE TABLE endereco ( 
id_endereco INT PRIMARY KEY,  
idcidadao INT,  
logradouro INT,  
bairro INT,  
numero INT,  
cidade INT,  
cep INT,  
uf INT,  
); 


ALTER TABLE cidadao ADD FOREIGN KEY(idsolicitaçao) REFERENCES solicitaçao (idsolicitaçao)

ALTER TABLE cidadao ADD FOREIGN KEY(idimovel) REFERENCES imovel (idimovel)

ALTER TABLE servico ADD FOREIGN KEY(idsolicitaçao) REFERENCES solicitaçao (idsolicitaçao)

ALTER TABLE feedback ADD FOREIGN KEY(idsolicitaçao) REFERENCES solicitaçao (idsolicitaçao)

ALTER TABLE autenticacao ADD FOREIGN KEY(idcidadao) REFERENCES cidadao (idcidadao)

ALTER TABLE interacao ADD FOREIGN KEY(idcidadao) REFERENCES cidadao (idcidadao)

ALTER TABLE imovel ADD FOREIGN KEY(idsolicitaçao) REFERENCES solicitaçao (idsolicitaçao)

ALTER TABLE unidade ADD FOREIGN KEY(idagendamento) REFERENCES agendamento (idagendamento)

ALTER TABLE agendamento ADD FOREIGN KEY(idsolicitaçao) REFERENCES solicitaçao (idsolicitaçao)

ALTER TABLE endereco ADD FOREIGN KEY(idcidadao) REFERENCES cidadao (idcidadao)
