from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import urllib.parse
from models import db, Usuario, Chamado, Interacao

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

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
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
                "tipo": usuario.tipo
            }
        }), 200

    return jsonify({"mensagem": "Email ou senha incorretos"}), 401


@app.route('/home')
def home():
    # Se o usuário não estiver logado, redireciona para login
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

@app.route('/ver-chamado')
def ver_chamado():
    lista_chamados = Chamado.query.all()
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('Verchamado.html', chamados=lista_chamados, nome_usuario=nome_usuario)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
