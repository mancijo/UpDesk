"""
Definição dos Modelos de Banco de Dados (SQLAlchemy)

Responsabilidade:
- Mapear as tabelas do banco de dados para classes Python (ORM - Object-Relational Mapping).
- Cada classe representa uma tabela e seus atributos representam as colunas.
- Define os relacionamentos entre as tabelas (ex: Usuario e Chamado).
"""
from .extensions import db
from datetime import datetime, timezone
import pytz

def get_sao_paulo_time():
    """
    Retorna a data e hora atuais no fuso horário de São Paulo.
    Usado como valor padrão para campos de data/hora para garantir consistência.
    """
    sao_paulo_tz = pytz.timezone("America/Sao_Paulo")
    return datetime.now(sao_paulo_tz)

# Modelo de Usuário
class Usuario(db.Model):
    """
    Representa um usuário no sistema.
    Contém informações de identificação, credenciais e seus relacionamentos.
    """
    __tablename__ = 'Usuario'
    __table_args__ = {"schema": "dbo"}
    id = db.Column('Id', db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column('Nome', db.String(100), nullable=False)
    
    # Campo de email, usado como identificador único para o login.
    email = db.Column('Email', db.String(255), nullable=False, unique=True)
    
    telefone = db.Column('Telefone', db.String(15))
    setor = db.Column('Setor', db.String(50))
    cargo = db.Column('Cargo', db.String(50), nullable=False)
    
    # Campo de senha. Armazena a senha do usuário em formato de hash, nunca em texto plano.
    senha = db.Column('Senha', db.String(255))
    
    # Flag para "soft delete". Em vez de apagar um usuário, o marcamos como inativo.
    # A lógica de login (auth.py) verifica este campo para permitir ou não a autenticação.
    ativo = db.Column('Ativo', db.Boolean, default=True, nullable=False)

    # Relacionamentos com a tabela de Chamados
    chamados_solicitados = db.relationship(
        "Chamado",
        back_populates="solicitante",
        foreign_keys="Chamado.solicitanteID",
        cascade="all, delete-orphan"
    )
    chamados_atendidos = db.relationship(
        "Chamado",
        back_populates="atendente",
        foreign_keys="Chamado.atendenteID"
    )

    def __repr__(self):
        return f"<Usuario {self.nome} - {self.cargo}>"

# Modelo de Chamado
class Chamado(db.Model):
    """
    Representa um chamado (ticket) de suporte no sistema.
    """
    __tablename__ = 'Chamado'
    __table_args__ = {"schema": "dbo"}
    chamado_ID = db.Column('chamado_ID', db.Integer, primary_key=True, autoincrement=True)
    atendenteID = db.Column('AtendenteId', db.Integer, db.ForeignKey("dbo.Usuario.Id"))
    solicitanteID = db.Column('SolicitanteId', db.Integer, db.ForeignKey("dbo.Usuario.Id"))
    titulo_Chamado = db.Column('titulo_Chamado', db.String(255), nullable=False)
    descricao_Chamado = db.Column('descricao_Chamado', db.Text, nullable=False)
    categoria_Chamado = db.Column('categoria_Chamado', db.String(100), nullable=False)
    prioridade_Chamado = db.Column('prioridade_Chamado', db.String(20), nullable=False)
    # Armazena conteúdo binário do anexo (varbinary / LargeBinary no banco)
    anexo_Chamado = db.Column('anexo_Chamado', db.LargeBinary)
    nome_anexo = db.Column('nome_anexo', db.String(255)) # Novo campo para armazenar o nome do anexo
    status_Chamado = db.Column(
        'status_Chamado', db.String(20),
        default="Aberto"
    )  # Status possíveis: Aberto, Em Atendimento, Resolvido, etc.
    dataAbertura = db.Column('DataAbertura', db.DateTime, default=get_sao_paulo_time)
    dataUltimaModificacao = db.Column('DataUltimaModificacao', db.DateTime)
    solucaoSugerida = db.Column('SolucaoSugerida', db.Text)
    solucaoAplicada = db.Column('SolucaoAplicada', db.Text)

    # Relacionamentos com a tabela de Usuário
    solicitante = db.relationship(
        "Usuario",
        back_populates="chamados_solicitados",
        foreign_keys=[solicitanteID]
    )
    atendente = db.relationship(
        "Usuario",
        back_populates="chamados_atendidos",
        foreign_keys=[atendenteID]
    )

    def __repr__(self):
        return f"<Chamado {self.titulo_Chamado} - {self.status_Chamado}>"
    


# Modelo de Interações
class Interacao(db.Model):
    """
    Representa uma interação (mensagem ou comentário) dentro de um chamado.
    """
    __tablename__ = 'Interacoes'
    __table_args__ = {"schema": "dbo"}
    
    id = db.Column('Id', db.Integer, primary_key=True)
    chamado_id = db.Column('ChamadoId', db.Integer, db.ForeignKey("dbo.Chamado.chamado_ID"), nullable=False)
    usuario_id = db.Column('UsuarioId', db.Integer, db.ForeignKey("dbo.Usuario.Id"), nullable=False)
    mensagem = db.Column('Mensagem', db.Text, nullable=False)
    data_criacao = db.Column('DataCriacao', db.DateTime, default=get_sao_paulo_time)

    # Relacionamentos
    chamado = db.relationship("Chamado")
    usuario = db.relationship("Usuario")

    def __repr__(self):
        return f"<Interacao Chamado={self.chamado_id} Usuario={self.usuario_id}>"
    

    
