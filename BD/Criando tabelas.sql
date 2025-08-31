CREATE TABLE Usuario (
    user_ID INT identity(1,1) PRIMARY KEY,
    nome VARCHAR(100) not null,
    email VARCHAR(255) not null,
    senha VARCHAR(30),
    setor VARCHAR(10),
    user_type varchar(20) not null check (user_type IN ('Usuaio','N1','N2', 'Triagem', 'Supervisor'))
);

CREATE TABLE Chamado (
    chamado_ID INT identity(1000,1) PRIMARY KEY,
    atendenteID INT,
    solicitanteID INT,
    titulo_Chamado VARCHAR(255) not null,
    descricao_Chamado VARCHAR(400) not null,
    categoria_Chamado VARCHAR(100) not null,
    prioridade_Chamado VARCHAR(15)not null,
    anexo_Chamado VARBINARY(MAX),
   	status_Chamado varchar(20) default 'Aberto' check (status_Chamado in ('Aberto', 'Em Atendimento', 'Resolvido', 'Transferido', 'Agendado')),
    dataAbertura datetime default current_timestamp,
    dataUltimaModificacao datetime null,
    solucaoSugerida VARCHAR(255),
    solucaoAplicada VARCHAR(255),
);

CREATE TABLE Analista_Triagem (
    triagem_ID INT identity(100,1) PRIMARY KEY not null,
    triagem_Nome VARCHAR(100),
);

CREATE TABLE Sugestao_de_solucao_IA (
    ID_procedimento INT PRIMARY KEY,
    Titulo_procedimento VARCHAR(255),
);

CREATE TABLE Chat (
    chat_ID INT IDENTITY(100,1) PRIMARY KEY,
    chamado_ID INT NOT NULL,
    remetente_ID INT NOT NULL,
    destinatario_ID INT NOT NULL,
);

CREATE TABLE Mensagem (
    mensagem_ID INT IDENTITY(1,1) PRIMARY KEY,
    chat_ID INT NOT NULL,
    remetente_ID INT NOT NULL,
    destinatario_ID INT NOT NULL,
    conteudo VARCHAR(255) NOT NULL,
    data_envio DATETIME DEFAULT GETDATE(),
);

CREATE TABLE Base_de_Conhecimento (
    procedimento_ID INT identity(1000,1) PRIMARY KEY not null,
    procedimento_titulo VARCHAR(255) not null,
    procedimento_descricao VARCHAR(255) not null,
    procedimento_anexo VARBINARY(MAX),
    procedimento_Status varchar(20) default 'Aberto' check (procedimento_Status in ('Draft', 'Published', 'Retired')),
    procedimento_dataAbertura datetime default current_timestamp,
    procedimento_dateLastMod datetime default null
);