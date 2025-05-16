/*USE master;
ALTER DATABASE upDesk2 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE upDesk2;*/

--create database upDesk2

--use upDesk2


/* Lógico_1: */

CREATE TABLE Usuario (
    user_ID INT identity(1000,1) PRIMARY KEY,
    nome VARCHAR(100) not null,
    email VARCHAR(7) not null,
    senha VARCHAR(30),
    setor VARCHAR(10),
    hierarquia VARCHAR(15),
	user_type varchar(20) not null check (user_type IN ('UsuaioComum','N1','N2', 'Triagem', 'Supervisor'))
);

CREATE TABLE IA (
    ia_Nome VARCHAR(100),
    ia_ID INT PRIMARY KEY
);

CREATE TABLE Chamado (
    chamado_ID INT PRIMARY KEY,
    atendenteID INT,
    solicitanteID INT,
    titulo VARCHAR(255),
    descricao VARCHAR(400),
    categoria VARCHAR(100),
    prioridade VARCHAR(50),
    anexo VARBINARY(MAX),
    status VARCHAR(50),
    dataAbertura DATE,
    dataUltimaModificacao DATE,
    solucaoSugerida VARCHAR(255),
    solucaoAplicada VARCHAR(255),
    chatID INT,
    fk_IA_ia_ID INT,
    CONSTRAINT FK_Chamado_Atendente FOREIGN KEY (atendenteID) REFERENCES Usuario(user_ID),
    CONSTRAINT FK_Chamado_Solicitante FOREIGN KEY (solicitanteID) REFERENCES Usuario(user_ID),
    CONSTRAINT FK_Chamado_IA FOREIGN KEY (fk_IA_ia_ID) REFERENCES IA(ia_ID)
);

CREATE TABLE TI__N1_N2_ (
    ti_Nome VARCHAR(100),
    ti_ID INT PRIMARY KEY
);


CREATE TABLE Analista_Triagem (
    triagem_ID INT PRIMARY KEY,
    triagem_Nome VARCHAR(100),
    fk_IA_ia_ID INT
);

CREATE TABLE Sugestao_de_solucao_IA (
    ID_procedimento INT PRIMARY KEY,
    Titulo_procedimento VARCHAR(255),
    fk_IA_ia_ID INT
);

CREATE TABLE Chat (
    remetente VARCHAR(100),
    destinatario VARCHAR(100),
    fk_Chamado_atendenteID INT,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_solicitanteID INT,
    fk_Chamado_chatID INT
);

CREATE TABLE Mensagem (
    date DATE,
    chatID INT,
    remetente VARCHAR(100),
    mensagem VARCHAR(255),
    mensagemID INT,
    PRIMARY KEY (chatID, mensagemID)
);

CREATE TABLE Base_de_Conhecimento (
    procedimento_ID INT PRIMARY KEY,
    procedimento_titulo VARCHAR(255),
    procedimento_descricao VARCHAR(255),
    procedimento_anexo VARBINARY(MAX),
    procedimento_status VARCHAR(255),
    procedimento_dataAbertura DATE,
    procedimento_dateLastMod DATE
);

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
	