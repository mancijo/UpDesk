/*USE master;
ALTER DATABASE upDesk2 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE upDesk2;*/

--create database upDesk

--use upDesk

-- criando um usuário no bd

/*INSERT INTO Usuario (nome, email, senha, setor, user_type)
VALUES ('João Silva', 'joao.silva@email.com', 'senha123', 'TI', 'N1');*/

/* Lógico_1: */

CREATE TABLE Usuario (
    user_ID INT identity(1000,1) PRIMARY KEY,
    nome VARCHAR(100) not null,
    email VARCHAR(255) not null,
    senha VARCHAR(30),
    setor VARCHAR(10),
    user_type varchar(20) not null check (user_type IN ('Usuaio','N1','N2', 'Triagem', 'Supervisor'))
);

CREATE TABLE IA (
    ia_Nome VARCHAR(50),
    ia_ID INT PRIMARY KEY
);

CREATE TABLE Chamado (
    chamado_ID INT identity(1000000,1) PRIMARY KEY,
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
    chatID INT,
    fk_IA_ia_ID INT,
    CONSTRAINT FK_Chamado_AtendenteID FOREIGN KEY (atendenteID) REFERENCES Usuario(user_ID),
    CONSTRAINT FK_Chamado_Solicitante FOREIGN KEY (solicitanteID) REFERENCES Usuario(user_ID),
    CONSTRAINT FK_Chamado_IA FOREIGN KEY (fk_IA_ia_ID) REFERENCES IA(ia_ID)
);

-- Criando o trigger para atualizar dataUltimaModificacao
GO
CREATE TRIGGER trg_UpdateChamado
ON Chamado
AFTER UPDATE
AS
BEGIN
    UPDATE Chamado
    SET dataUltimaModificacao = GETDATE()
    FROM Chamado C
    INNER JOIN inserted I ON C.chamado_ID = I.chamado_ID;
END;
GO


CREATE TABLE TI__N1_N2_ (
    ti_Nome VARCHAR(100),
    ti_ID INT identity(1000,1) PRIMARY KEY not null
);


CREATE TABLE Analista_Triagem (
    triagem_ID INT identity(1000,1) PRIMARY KEY not null,
    triagem_Nome VARCHAR(100),
    fk_IA_ia_ID INT
);

CREATE TABLE Sugestao_de_solucao_IA (
    ID_procedimento INT PRIMARY KEY,
    Titulo_procedimento VARCHAR(255),
    fk_IA_ia_ID INT identity (1000,1)
);

CREATE TABLE Chat (
    remetente VARCHAR(100),
    destinatario VARCHAR(100),
	chat_ID int identity (1000,1) primary key
    fk_Chamado_atendenteID INT FOREIGN KEY references Chamado,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_solicitanteID INT,
    fk_Chamado_chatID INT
);

CREATE TABLE Mensagem (
    date DATE,
    chatID INT,
    remetente VARCHAR(100),
    mensagem VARCHAR(255),
    mensagemID INT not null,
    PRIMARY KEY (chatID, mensagemID)
);

CREATE TABLE Base_de_Conhecimento (
    procedimento_ID INT identity(1000000,1) PRIMARY KEY not null,
    procedimento_titulo VARCHAR(255) not null,
    procedimento_descricao VARCHAR(255) not null,
    procedimento_anexo VARBINARY(MAX),
    procedimento_Status varchar(20) default 'Aberto' check (procedimento_Status in ('Draft', 'Published', 'Retired')),
    procedimento_dataAbertura datetime default current_timestamp,
    procedimento_dateLastMod datetime default null
);

-- Criando o trigger para atualizar procedimento_dateLastMod

GO
CREATE TRIGGER trg_UpdateBaseConhecimento
ON Base_de_Conhecimento
AFTER UPDATE
AS
BEGIN
    UPDATE Base_de_Conhecimento
    SET procedimento_dateLastMod = GETDATE()
    FROM Base_de_Conhecimento B
    INNER JOIN inserted I ON B.procedimento_ID = I.procedimento_ID;
END;
GO



CREATE TABLE Abre (
    fk_Usuario_user_ID INT,
    fk_Chamado_atendenteID INT,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_solicitanteID INT,
    fk_Chamado_chatID INT
);

CREATE TABLE Aprova_e_Transfere (
    fk_Analista_Triagem_triagem_ID INT,
    fk_TI__N1_N2__ti_ID INT
);

CREATE TABLE Atende (
    fk_TI__N1_N2__ti_ID INT,
    fk_Chamado_atendenteID INT,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_solicitanteID INT,
    fk_Chamado_chatID INT
);

CREATE TABLE Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2_ (
    fk_Base_de_Conhecimento_procedimento_ID INT,
    fk_IA_ia_ID INT,
    fk_Analista_Triagem_triagem_ID INT,
    fk_TI__N1_N2__ti_ID INT
);
 

ALTER TABLE Chamado ADD CONSTRAINT FK_Chamado_2
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Analista_Triagem ADD CONSTRAINT FK_Analista_Triagem_2
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Sugestao_de_solucao_IA ADD CONSTRAINT FK_Sugestao_de_solucao_IA_2
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE CASCADE;
 
 ALTER TABLE Chat ADD CONSTRAINT FK_Chat_Chamado
    FOREIGN KEY (fk_Chamado_chamado_ID)
    REFERENCES Chamado (chamado_ID)
    ON DELETE CASCADE;

 
ALTER TABLE Abre ADD CONSTRAINT FK_Abre_1
    FOREIGN KEY (fk_Usuario_user_ID)
    REFERENCES Usuario (user_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Abre ADD CONSTRAINT FK_Abre_2
    FOREIGN KEY (fk_Chamado_chamado_ID)
    REFERENCES Chamado (chamado_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Aprova_e_Transfere ADD CONSTRAINT FK_Aprova_e_Transfere_1
    FOREIGN KEY (fk_Analista_Triagem_triagem_ID)
    REFERENCES Analista_Triagem (triagem_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Aprova_e_Transfere ADD CONSTRAINT FK_Aprova_e_Transfere_2
    FOREIGN KEY (fk_TI__N1_N2__ti_ID)
    REFERENCES TI__N1_N2_ (ti_ID)
    ON DELETE SET NULL;
 
ALTER TABLE Atende ADD CONSTRAINT FK_Atende_1
    FOREIGN KEY (fk_TI__N1_N2__ti_ID)
    REFERENCES TI__N1_N2_ (ti_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Atende ADD CONSTRAINT FK_Atende_2
    FOREIGN KEY (fk_Chamado_chamado_ID)
    REFERENCES Chamado (chamado_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2_ ADD CONSTRAINT FK_Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2__1
    FOREIGN KEY (fk_Base_de_Conhecimento_procedimento_ID)
    REFERENCES Base_de_Conhecimento (procedimento_ID)
    ON DELETE NO ACTION;
 
ALTER TABLE Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2_ ADD CONSTRAINT FK_Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2__2
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE NO ACTION;
 
ALTER TABLE Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2_ ADD CONSTRAINT FK_Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2__3
    FOREIGN KEY (fk_Analista_Triagem_triagem_ID)
    REFERENCES Analista_Triagem (triagem_ID)
    ON DELETE NO ACTION;
 
ALTER TABLE Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2_ ADD CONSTRAINT FK_Consulta_Base_de_Conhecimento_IA_Analista_Triagem_TI__N1_N2__4
    FOREIGN KEY (fk_TI__N1_N2__ti_ID)
    REFERENCES TI__N1_N2_ (ti_ID)
    ON DELETE NO ACTION;

ALTER TABLE Chamado DROP CONSTRAINT FK_Chamado_IA;

ALTER TABLE Chamado ADD CONSTRAINT FK_Chamado_IA
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE NO ACTION;

	ALTER TABLE Chat DROP CONSTRAINT FK_Chat_Chamado;

ALTER TABLE Chat ADD CONSTRAINT FK_Chat_Chamado
    FOREIGN KEY (fk_Chamado_chamado_ID)
    REFERENCES Chamado (chamado_ID)
    ON DELETE CASCADE;
	