--create database upDesk2

--use upDesk2

/* DB_Lógico: */

CREATE TABLE Usuario (
    user_ID int identity(1000,1) PRIMARY KEY not null,
    user_Nome VARCHAR not null,
    user_Email VARCHAR not null,
    user_Senha VARCHAR not null
);

CREATE TABLE Chamado (
    chamado_ID int identity(1000000,1),
    chamado_Categoria VARCHAR(200) not null,
    chamado_Descricao VARCHAR(250) not null,
    user_ID INT,
    fk_IA_ia_ID INT,
    PRIMARY KEY (chamado_ID, user_ID)
);

CREATE TABLE TI (
    ti_Nome VARCHAR not null,
    ti_ID int identity(1000,1) PRIMARY KEY not null
);

CREATE TABLE Chamado_Info (
    user_ID INT,
    chamado_ID INT,
    user_Email VARCHAR,
    user_nome VARCHAR,
    chamado_anexo VARBINARY(MAX),
	Status varchar(20) default 'Aberto' check (Status in ('Aberto', 'Agendado', 'Pendente', 'Em Atendimento', 'Resolvido', 'Transferido')),
    PRIMARY KEY (user_ID, chamado_ID)
);

CREATE TABLE IA (
    ia_Nome VARCHAR(20),
    ia_ID int identity(1000,1) PRIMARY KEY not null
);

CREATE TABLE Triagem (
    triagem_ID int identity(1000,1) PRIMARY KEY not null,
    triagem_Nome VARCHAR(50),
    fk_IA_ia_ID INT
);

CREATE TABLE Sugestao_de_solucao_IA (
    ID_procedimento int identity(100000,1) PRIMARY KEY,
    Titulo_procedimento VARCHAR(200),
    fk_IA_ia_ID INT
);

CREATE TABLE Abre (
    fk_Usuario_user_ID INT,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_user_ID INT
);

CREATE TABLE Contem (
    fk_Chamado_Info_user_ID INT,
    fk_Chamado_Info_chamado_ID INT,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_user_ID INT
);

CREATE TABLE Aprova_e_Transfere (
    fk_Triagem_triagem_ID INT,
    fk_TI_ti_ID INT
);

CREATE TABLE Atende (
    fk_TI_ti_ID INT,
    fk_Chamado_chamado_ID INT,
    fk_Chamado_user_ID INT
);
 
ALTER TABLE Chamado ADD CONSTRAINT FK_Chamado_2
FOREIGN KEY (fk_IA_ia_ID)
REFERENCES IA (ia_ID)
ON DELETE CASCADE;
 
ALTER TABLE Triagem ADD CONSTRAINT FK_Triagem_2
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Sugestao_de_solucao_IA ADD CONSTRAINT FK_Sugestao_de_solucao_IA_2
    FOREIGN KEY (fk_IA_ia_ID)
    REFERENCES IA (ia_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Abre ADD CONSTRAINT FK_Abre_1
    FOREIGN KEY (fk_Usuario_user_ID)
    REFERENCES Usuario (user_ID)
    ON DELETE SET NULL;
 
ALTER TABLE Abre ADD CONSTRAINT FK_Abre_2
    FOREIGN KEY (fk_Chamado_chamado_ID, fk_Chamado_user_ID)
    REFERENCES Chamado (chamado_ID, user_ID)
   ON DELETE CASCADE;
 
ALTER TABLE Contem ADD CONSTRAINT FK_Contem_1
    FOREIGN KEY (fk_Chamado_Info_user_ID, fk_Chamado_Info_chamado_ID)
    REFERENCES Chamado_Info (user_ID, chamado_ID)
    ON DELETE SET NULL;
 
ALTER TABLE Contem ADD CONSTRAINT FK_Contem_2
    FOREIGN KEY (fk_Chamado_chamado_ID, fk_Chamado_user_ID)
    REFERENCES Chamado (chamado_ID, user_ID)
    ON DELETE SET NULL;
 
ALTER TABLE Aprova_e_Transfere ADD CONSTRAINT FK_Aprova_e_Transfere_1
    FOREIGN KEY (fk_Triagem_triagem_ID)
    REFERENCES Triagem (triagem_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Aprova_e_Transfere ADD CONSTRAINT FK_Aprova_e_Transfere_2
    FOREIGN KEY (fk_TI_ti_ID)
    REFERENCES TI (ti_ID)
    ON DELETE SET NULL;
 
ALTER TABLE Atende ADD CONSTRAINT FK_Atende_1
    FOREIGN KEY (fk_TI_ti_ID)
    REFERENCES TI (ti_ID)
    ON DELETE CASCADE;
 
ALTER TABLE Atende ADD CONSTRAINT FK_Atende_2
    FOREIGN KEY (fk_Chamado_chamado_ID, fk_Chamado_user_ID)
    REFERENCES Chamado (chamado_ID, user_ID)
    ON DELETE CASCADE;