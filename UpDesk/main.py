from flask import Flask, request, jsonify, render_template, url_for, redirect, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import urllib.parse

# Configurações de conexão com SQL Server
params = urllib.parse.quote_plus(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=localhost\\SQLEXPRESS;"
    "Database=UpDesk;"
    "Trusted_Connection=yes;"
)

# Inicializa app Flask
app = Flask(__name__)
CORS(app)
app.secret_key = 'MateusTeod' 

# Configura SQLAlchemy com SQL Server
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc:///?odbc_connect=%s" % params
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa banco de dados
db = SQLAlchemy(app)

# Modelo Chamado (ORM)
class Chamado(db.Model):
    __tablename__ = 'Chamados'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='Aberto')
    usuario_id = db.Column(db.Integer, nullable=False)
    data_criacao = db.Column(db.DateTime, default=db.func.now())

class Usuario(db.Model):
    __tablename__ = 'Usuarios'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    senha = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)


# Cria as tabelas no banco de dados
with app.app_context():
    db.create_all()

# Banco fictício de usuários
usuarios = [
    {"id": 1, "nome": "João Silva", "email": "joao@email.com", "senha": "123456", "tipo": "usuario"},
    {"id": 2, "nome": "Maria Suporte", "email": "maria@email.com", "senha": "abc123", "tipo": "suporte_n1"}
]

# Rota inicial - login
@app.route('/')
def index():
    return render_template('login.html')

# Login - API
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({"mensagem": "Dados inválidos"}), 400
    
    email = data['email']
    senha = data['senha']

    usuario = Usuario.query.filter_by(email=email, senha=senha).first()
    if not usuario:
        return jsonify({"mensagem": "Usuário ou senha inválidos"}), 401
    session['usuario_nome'] = usuario.nome

    return jsonify({
        "mensagem": "Login realizado com sucesso!",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "tipo": usuario.tipo
        }
    }), 200
 

# Tela do dashboard do supervisor
@app.route('/home')
def home():
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('home.html', nome_usuario=nome_usuario)

# abrir chamado (salvar no banco)
@app.route('/chamado')
def chamado():
    data = request.json
    if not data:
        return jsonify({"mensagem": "Dados inválidos"}), 400

    chamado = Chamado(
        titulo=data.get("titulo"),
        descricao=data.get("descricao"),
        categoria=data.get("categoria"),
        usuario_id=data.get("usuario_id")
    )
    db.session.add(chamado)
    db.session.commit()

    return jsonify({
        "mensagem": "Chamado registrado com sucesso!",
        "chamado_id": chamado.id
    }), 201

# Tela de ver chamados (listar)
@app.route('/ver-chamado')
def ver_chamado():
    return render_template('Verchamado.html')


@app.route('/ger-usuarios')
def ger_usuarios():
    return render_template('ger_usuarios.html')


# Inicia servidor
if __name__ == '__main__':
    print("Conexão estabelecida com o banco de dados.")
    app.run(debug=True)
