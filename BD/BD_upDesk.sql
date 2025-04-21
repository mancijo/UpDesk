-- create database upDesk

-- use upDesk


/* create table Usuario (
	
	user_ID int identity(1000,1) primary key,
	user_Name varchar(100) not null,
	user_Login varchar(7) not null,
	user_email varchar(30),
	user_tell int,
	user_type varchar(20) not null check (user_type IN ('UsuaioComum','N1','N2', 'Triagem', 'Supervisor'))
);


create table Chamados (
	
	chamado_ID int identity(1000000,1) primary key,
    chamado_Titulo varchar(100) not null,
    chamado_Descricao text not null,
    chamado_DataCriacao datetime default current_timestamp,
    Status varchar(20) default 'Aberto' check (Status in ('Aberto', 'Em Atendimento', 'Resolvido', 'Encaminhado')),
    user_ID int not null,
    foreign key (user_ID) references Usuario (user_ID)
);

create table Atendimentos (
    
	atendimentos_Id int identity(1000000,1) primary key,
    atendimentos_ChamadoId int not null,
    atendimentos_Responsavel_Id int not null,
    atendimentos_DataAtendimento datetime default current_timestamp,
    atendimentos_DescricaoAtendimento text,
    atendimentos_EncaminhadoParaId INT null,
    foreign key (atendimentos_ChamadoID) references Chamados(chamado_ID),
    foreign key (atendimentos_Responsavel_Id) references Usuario(user_ID),
    foreign key (atendimentos_EncaminhadoParaId) references Usuario(user_ID)
);

create table SolucoesIA (

    ia_ID int identity(1000,1) primary key,
    ia_ChamadoId int not null,
    ia_Sugestao text not null,
    ia_DataSugestao datetime default current_timestamp,
    ia_Responsavel varchar(100) not null,
    foreign key (ia_ChamadoId) references Chamados(chamado_ID)
);

CREATE TABLE BaseDeConhecimento (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(255) NOT NULL,
    DataCriacao DATETIME DEFAULT GETDATE(),
    DataModificacao DATETIME DEFAULT GETDATE(),
    Anexo VARBINARY(MAX),
    Descricao NVARCHAR(MAX)
);*/


