from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import urllib.parse
from models import db, Usuario, Chamado, Interacao
from forms import CriarUsuarioForm, EditarUsuarioForm, chamadoForm, LoginForm
import os
from werkzeug.utils import secure_filename

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

@app.route('/logout')
def logout():
    session.clear()
    return render_template('login.html', mensagem="Você saiu com sucesso do sistema.")


@app.route('/home')
def home():
    if 'usuario_nome' not in session:
        return render_template('login.html', mensagem="Faça login para continuar")

    nome_usuario = session.get('usuario_nome')
    chamados_abertos = Chamado.query.filter_by(status_Chamado='Aberto').count()
    chamados_em_triagem = Chamado.query.filter_by(status_Chamado='Em Atendimento').count()
    chamados_solucao_ia = Chamado.query.filter_by(status_Chamado='Resolvido').count() # NOTE: Assuming 'Resolvido' maps to 'Solução IA'
    chamados_finalizados = Chamado.query.filter_by(status_Chamado='Resolvido').count() # NOTE: Assuming 'Resolvido' maps to 'Finalizados'

    return render_template('home.html', 
                           nome_usuario=nome_usuario, 
                           chamados_abertos=chamados_abertos,
                           chamados_em_triagem=chamados_em_triagem,
                           chamados_solucao_ia=chamados_solucao_ia,
                           chamados_finalizados=chamados_finalizados)

@app.route('/chamado', methods=['GET', 'POST'])
def chamado():
    form = chamadoForm()
    if 'usuario_nome' not in session:
        return render_template('login.html', mensagem="Faça login para continuar")
    nome_usuario = session.get('usuario_nome')

    if form.validate_on_submit():
        titulo = form.titulo.data
        descricao = form.descricao.data
        afetado = form.afetado.data
        prioridade = form.prioridade.data
        anexo = form.anexo.data

        filename = None
        if anexo:
            filename = secure_filename(anexo.filename)
            anexo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        novo_chamado = Chamado(
            titulo_Chamado=titulo,
            descricao_Chamado=descricao,
            categoria_Chamado=afetado, # Assuming 'afetado' is the category
            solicitanteID=session.get('usuario_id'),
            prioridade_Chamado=prioridade,
            anexo_Chamado=filename.encode() if filename else None
        )
        db.session.add(novo_chamado)
        db.session.commit()
        return redirect(url_for('ver_chamado'))

    return render_template('chamado.html', form=form, nome_usuario=nome_usuario)

@app.route('/ver-chamado')
def ver_chamado():
    lista_chamados = Chamado.query.all()
    nome_usuario = session.get('usuario_nome', 'Usuário')
    return render_template('verChamado.html', chamados=lista_chamados, nome_usuario=nome_usuario)

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

@app.route('/editar_usuario/<int:usuario_id>', methods=['POST'])
def editar_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    
    nome = request.form.get('nome')
    email = request.form.get('email')
    telefone = request.form.get('telefone')
    setor = request.form.get('setor')
    cargo = request.form.get('cargo')
    senha =  request.form.get('senha')
    if not all([nome, email, telefone, setor, cargo, senha]):
        return jsonify({"mensagem": "Dados inválidos"}), 400
    
    usuario.nome = nome
    usuario.email = email
    usuario.telefone = telefone
    usuario.setor = setor
    usuario.cargo = cargo
    usuario.senha = senha

    db.session.commit()
    return jsonify({'mensagem': 'Usuário atualizado com sucesso!'})



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