from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import urllib.parse
from models import db, Usuario, Chamado, Interacao
from forms import CriarUsuarioForm, EditarUsuarioForm, chamadoForm, LoginForm

# Flask
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'chave-secreta'

# Conexão RDS SQL Server
params = urllib.parse.quote_plus(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=updesk-sql.cfgiaog68n7i.sa-east-1.rds.amazonaws.com,1433;"
    "Database=UpDesk;"
    "UID=adminsql;"
    "PWD=Skatenaveia123*;"
)
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc:///?odbc_connect=%s" % params
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Rotas
@app.route('/')
def index():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    form_login = LoginForm()
    data = request.json or request.form  # aceita JSON ou FORM

    if not data.get('email') or not data.get('senha'):
        return jsonify({"mensagem": "Dados inválidos"}), 400

    usuario = Usuario.query.filter_by(email=data['email']).first()
    if usuario and usuario.senha == data['senha']:
        session['usuario_nome'] = usuario.nome
        session['usuario_id'] = usuario.id  # Armazena o ID do usuário na sessão

        return jsonify({
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "cargo": usuario.cargo
            }
        }), 200

    return jsonify({"mensagem": "Email ou senha incorretos"}), 401


@app.route('/home')
def home():
    if 'usuario_nome' not in session:
        return render_template('login.html', mensagem="Faça login para continuar")

    nome_usuario = session.get('usuario_nome')
    return render_template('home.html', nome_usuario=nome_usuario)

@app.route('/chamado', methods=['GET', 'POST'])
def chamado():
    if request.method == 'GET':
        return render_template('chamado.html')
    else:
        data = request.json or request.form
        if not data:
            return jsonify({"mensagem": "Dados inválidos"}), 400

        chamado = Chamado(
            titulo_Chamado=data.get("titulo"),
            descricao_Chamado=data.get("descricao"),
            categoria_Chamado=data.get("categoria"),
            solicitanteID=data.get("usuario_id"),
            prioridade_Chamado=data.get("prioridade", "baixa")
        )
        db.session.add(chamado)
        db.session.commit()

        return jsonify({
            "mensagem": "Chamado registrado com sucesso!",
            "chamado_id": chamado.chamado_ID
        }), 201

@app.route('/ver-chamado')
def ver_chamado():
    lista_chamados = Chamado.query.all()
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('Verchamado.html', chamados=lista_chamados, nome_usuario=nome_usuario)

@app.route('/ger_usuarios')
def ger_usuarios():
    lista_usuarios = Usuario.query.all()
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('ger_usuarios.html', usuarios=lista_usuarios, nome_usuario=nome_usuario)

@app.route('/criar_usuario', methods=['POST'])  
def criar_usuario():
    nome = request.form.get('nome')
    email = request.form.get('email')
    telefone = request.form.get('telefone')
    setor = request.form.get('setor')
    cargo = request.form.get('cargo')  
    senha = request.form.get('senha')

    if not all([nome, email, telefone, setor, cargo, senha]):
        return jsonify({"mensagem": "Dados inválidos"}), 400

    novo_usuario = Usuario(
        nome=nome,
        email=email,
        telefone=telefone,
        setor=setor,
        cargo=cargo,
        senha=senha
    )
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({"mensagem": "Usuário criado com sucesso!"}), 201


@app.route('/triagem')
def triagem():
    lista_chamados = Chamado.query.all()
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('triagem.html', chamados=lista_chamados, nome_usuario=nome_usuario)

@app.route('/excluir_usuario/<int:usuario_id>', methods=['POST'])
def excluir_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'mensagem': 'Usuário excluído com sucesso!'})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
