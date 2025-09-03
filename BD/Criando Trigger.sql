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