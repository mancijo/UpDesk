from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Modelo de Usuário
class Usuario(db.Model):
    __tablename__ = 'Usuario'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    senha = db.Column(db.String(30))
    setor = db.Column(db.String(10))
    tipo = db.Column(
        db.String(20),
        nullable=False
    )  # Usuaio, N1, N2, Triagem, Supervisor

    # Relacionamentos
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
        return f"<Usuario {self.nome} - {self.tipo}>"

# Modelo de Chamado
class Chamado(db.Model):
    __tablename__ = 'Chamado'
    chamado_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    atendenteID = db.Column(db.Integer, db.ForeignKey("Usuario.id"))
    solicitanteID = db.Column(db.Integer, db.ForeignKey("Usuario.id"))
    titulo_Chamado = db.Column(db.String(255), nullable=False)
    descricao_Chamado = db.Column(db.String(400), nullable=False)
    categoria_Chamado = db.Column(db.String(100), nullable=False)
    prioridade_Chamado = db.Column(db.String(15), nullable=False)
    anexo_Chamado = db.Column(db.LargeBinary)
    status_Chamado = db.Column(
        db.String(20),
        default="Aberto"
    )  # Aberto, Em Atendimento, Resolvido, Transferido, Agendado
    dataAbertura = db.Column(db.DateTime, default=datetime.utcnow)
    dataUltimaModificacao = db.Column(db.DateTime)
    solucaoSugerida = db.Column(db.String(255))
    solucaoAplicada = db.Column(db.String(255))

    # Relacionamentos
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
    __tablename__ = 'Interacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    chamado_id = db.Column(db.Integer, db.ForeignKey("Chamado.chamado_ID"), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("Usuario.id"), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    chamado = db.relationship("Chamado")
    usuario = db.relationship("Usuario")

    def __repr__(self):
        return f"<Interacao Chamado={self.chamado_id} Usuario={self.usuario_id}>"
    
