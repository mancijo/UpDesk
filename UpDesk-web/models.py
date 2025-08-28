from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Modelo de Usuários
class Usuario(db.Model):
    __tablename__ = 'Usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # usuario, suporte_n1, suporte_n2, supervisor
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    chamados = db.relationship("Chamado", back_populates="usuario", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Usuario {self.nome} - {self.tipo}>"


# Modelo de Chamados
class Chamado(db.Model):
    __tablename__ = 'Chamados'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default="Aberto")  # Aberto, Em andamento, Resolvido
    usuario_id = db.Column(db.Integer, db.ForeignKey("Usuarios.id"), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship("Usuario", back_populates="chamados")
    interacoes = db.relationship("Interacao", back_populates="chamado", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Chamado {self.titulo} - {self.status}>"


# Modelo de Interações
class Interacao(db.Model):
    __tablename__ = 'Interacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    chamado_id = db.Column(db.Integer, db.ForeignKey("Chamados.id"), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("Usuarios.id"), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    chamado = db.relationship("Chamado", back_populates="interacoes")
    usuario = db.relationship("Usuario")

    def __repr__(self):
        return f"<Interacao Chamado={self.chamado_id} Usuario={self.usuario_id}>"
    
