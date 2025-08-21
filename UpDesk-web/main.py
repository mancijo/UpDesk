from flask import Flask, request, jsonify, render_template, url_for, redirect, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import urllib.parse



# Configurações de conexão com SQL Server
params = urllib.parse.quote_plus(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=(localdb)\\MSSQLLocalDB;"
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
    prioridade = db.Column(db.String(50), nullable=False, default='baixa')

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


# Rota inicial - login
@app.route('/')
def index():
    return render_template('ger_usuarios.html')

# Login - API
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({"mensagem": "Dados inválidos"}), 400
    
    email = data['email']
    senha = data['senha']

    usuario = Usuario.query.filter_by(email=email, senha=senha).first()
    if usuario:
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

    return jsonify({"mensagem": "Email ou senha incorretos"}), 401
 

# Tela do dashboard do supervisor
@app.route('/home')
def home():
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('home.html', nome_usuario=nome_usuario)

@app.route('/chamado')
def abrir_chamado():
        return render_template('chamado.html')

# abrir chamado (salvar no banco)
@app.route('/chamado', methods=['POST'])
def chamado():
    data = request.json
    if not data:
        return jsonify({"mensagem": "Dados inválidos"}), 400

    chamado = Chamado(
        titulo=data.get("titulo"),
        descricao=data.get("descricao"),
        categoria=data.get("categoria"),
        usuario_id=data.get("usuario_id"),
        prioridade=data.get("prioridade", "baixa")
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
    lista_chamados = Chamado.query.all()
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('Verchamado.html', chamados=lista_chamados, nome_usuario=nome_usuario)


@app.route('/ger-usuarios')
def ger_usuarios():
    lista_usuarios = Usuario.query.all()
    return render_template('ger_usuarios.html', usuarios=lista_usuarios)

@app.route('/excluir_usuario/<int:id>', methods=['POST'])
def excluir_usuario(id):
    usuario = Usuario.query.get(id)
    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'success': True}), 200
    return jsonify({'error': 'Usuário não encontrado'}), 404

@app.route('/cadastro', methods=['POST'])
def cadastro():
    return render_template('ger_usuarios.html')
    

@app.route('/triagem')
def triagem():
    return render_template('triagem.html')


# Inicia servidor
if __name__ == '__main__':
    app.run(debug=True)
