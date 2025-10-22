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
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    
    # Campo de email, usado como identificador único para o login.
    email = db.Column(db.String(255), nullable=False, unique=True)
    
    telefone = db.Column(db.String(15))
    setor = db.Column(db.String(50))
    cargo = db.Column(db.String(50), nullable=False)
    
    # Campo de senha. Armazena a senha do usuário em formato de hash, nunca em texto plano.
    senha = db.Column(db.String(255))
    
    # Flag para "soft delete". Em vez de apagar um usuário, o marcamos como inativo.
    # A lógica de login (auth.py) verifica este campo para permitir ou não a autenticação.
    ativo = db.Column(db.Boolean, default=True, nullable=False)

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
    chamado_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    atendenteID = db.Column(db.Integer, db.ForeignKey("Usuario.id"))
    solicitanteID = db.Column(db.Integer, db.ForeignKey("Usuario.id"))
    titulo_Chamado = db.Column(db.String(255), nullable=False)
    descricao_Chamado = db.Column(db.Text, nullable=False)
    categoria_Chamado = db.Column(db.String(100), nullable=False)
    prioridade_Chamado = db.Column(db.String(15), nullable=False)
    # Armazena conteúdo binário do anexo (varbinary / LargeBinary no banco)
    anexo_Chamado = db.Column(db.LargeBinary)
    status_Chamado = db.Column(
        db.String(20),
        default="Aberto"
    )  # Status possíveis: Aberto, Em Atendimento, Resolvido, etc.
    dataAbertura = db.Column(db.DateTime, default=get_sao_paulo_time)
    dataUltimaModificacao = db.Column(db.DateTime)
    solucaoSugerida = db.Column(db.Text)
    solucaoAplicada = db.Column(db.Text)

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
    
    id = db.Column(db.Integer, primary_key=True)
    chamado_id = db.Column(db.Integer, db.ForeignKey("Chamado.chamado_ID"), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("Usuario.id"), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=get_sao_paulo_time)

    # Relacionamentos
    chamado = db.relationship("Chamado")
    usuario = db.relationship("Usuario")

    def __repr__(self):
        return f"<Interacao Chamado={self.chamado_id} Usuario={self.usuario_id}>"
    

    
