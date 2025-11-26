IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Usuario] (
    [Id] int NOT NULL IDENTITY,
    [Nome] nvarchar(100) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [Telefone] nvarchar(15) NULL,
    [Setor] nvarchar(50) NULL,
    [Cargo] nvarchar(50) NOT NULL,
    [Senha] nvarchar(max) NOT NULL,
    [Ativo] bit NOT NULL,
    CONSTRAINT [PK_Usuario] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Chamado] (
    [chamado_ID] int NOT NULL IDENTITY,
    [AtendenteId] int NULL,
    [SolicitanteId] int NULL,
    [titulo_Chamado] nvarchar(255) NOT NULL,
    [descricao_Chamado] nvarchar(max) NOT NULL,
    [categoria_Chamado] nvarchar(100) NOT NULL,
    [prioridade_Chamado] nvarchar(15) NOT NULL,
    [status_Chamado] nvarchar(max) NOT NULL,
    [DataAbertura] datetime2 NOT NULL,
    [DataUltimaModificacao] datetime2 NULL,
    [SolucaoSugerida] nvarchar(max) NULL,
    [SolucaoAplicada] nvarchar(max) NULL,
    CONSTRAINT [PK_Chamado] PRIMARY KEY ([chamado_ID]),
    CONSTRAINT [FK_Chamado_Usuario_AtendenteId] FOREIGN KEY ([AtendenteId]) REFERENCES [Usuario] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Chamado_Usuario_SolicitanteId] FOREIGN KEY ([SolicitanteId]) REFERENCES [Usuario] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Interacoes] (
    [Id] int NOT NULL IDENTITY,
    [ChamadoId] int NOT NULL,
    [UsuarioId] int NOT NULL,
    [Mensagem] nvarchar(max) NOT NULL,
    [DataCriacao] datetime2 NOT NULL,
    CONSTRAINT [PK_Interacoes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Interacoes_Chamado_ChamadoId] FOREIGN KEY ([ChamadoId]) REFERENCES [Chamado] ([chamado_ID]) ON DELETE CASCADE,
    CONSTRAINT [FK_Interacoes_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Chamado_AtendenteId] ON [Chamado] ([AtendenteId]);
GO

CREATE INDEX [IX_Chamado_SolicitanteId] ON [Chamado] ([SolicitanteId]);
GO

CREATE INDEX [IX_Interacoes_ChamadoId] ON [Interacoes] ([ChamadoId]);
GO

CREATE INDEX [IX_Interacoes_UsuarioId] ON [Interacoes] ([UsuarioId]);
GO

CREATE UNIQUE INDEX [IX_Usuario_Email] ON [Usuario] ([Email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251002143121_InitialCreate', N'8.0.0');
GO

COMMIT;
GO

