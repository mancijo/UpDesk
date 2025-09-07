from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import urllib.parse
from models import db, Usuario, Chamado, Interacao
from forms import CriarUsuarioForm, EditarUsuarioForm, chamadoForm, LoginForm
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import google.generativeai as genai

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# --- Integração com a API de IA (Gemini) ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    print("\nERRO CRÍTICO: A variável de ambiente 'GEMINI_API_KEY' não foi encontrada.")
    print("Por favor, adicione a linha GEMINI_API_KEY='sua_chave_aqui' ao seu arquivo .env e reinicie o servidor.\n")
else:
    try:
        genai.configure(api_key=gemini_api_key)
    except Exception as e:
        print(f"Erro ao configurar a API do Gemini. Verifique sua GEMINI_API_KEY no arquivo .env: {e}")

def buscar_solucao_com_ia(titulo, descricao):
    """
    Busca uma solução para um problema técnico usando a API do Google Gemini.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""Aja como um especialista de suporte técnico de TI (Nível 1). Um usuário está relatando o seguinte problema:
        - Título do Chamado: "{titulo}"
        - Descrição do Problema: "{descricao}"
        Forneça uma solução clara e em formato de passo a passo para um usuário final. A resposta deve ser direta e fácil de entender. Se não tiver certeza, sugira coletar mais informações que poderiam ajudar no diagnóstico."""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Erro ao contatar a API do Gemini: {e}")
        return "Não foi possível obter uma sugestão da IA no momento. Por favor, prossiga com a abertura do chamado."
# --------------------------------

# Configuração do Flask
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'uma-chave-secreta-padrao')
app.config['UPLOAD_FOLDER'] = './static/uploads'

# Conexão com o banco de dados usando variáveis de ambiente
db_driver = os.getenv('DB_DRIVER')
db_server = os.getenv('DB_SERVER')
db_database = os.getenv('DB_DATABASE')
db_uid = os.getenv('DB_UID')
db_pwd = os.getenv('DB_PWD')

params = urllib.parse.quote_plus(
    f"Driver={{{db_driver}}};"
    f"Server={db_server};"
    f"Database={db_database};"
    f"UID={db_uid};"
    f"PWD={{{db_pwd}}};"
)
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc:///?odbc_connect=%s" % params
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Definição das Rotas
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
    return redirect(url_for('index'))


@app.route('/home')
def home():
    if 'usuario_nome' not in session:
        return redirect(url_for('index'))

    current_user = {
        'name': session.get('usuario_nome')
    }
    
    ticket_stats = {
        'open': Chamado.query.filter_by(status_Chamado='Aberto').count(),
        'in_triage': Chamado.query.filter_by(status_Chamado='Em Atendimento').count(),
        'ai_solution': Chamado.query.filter_by(status_Chamado='Resolvido').count(),
        'finished': Chamado.query.filter_by(status_Chamado='Resolvido').count()
    }
    
    return render_template(
        'home.html', 
        user=current_user, 
        stats=ticket_stats
    )

@app.route('/chamado', methods=['GET', 'POST'])
def chamado():
    form = chamadoForm()
    if 'usuario_nome' not in session:
        return render_template('login.html', mensagem="Faça login para continuar")
    
    user = {
        'name': session.get('usuario_nome')
    }

    return render_template('chamado.html', form=form, user=user, form_action=url_for('buscar_solucao_ia'))

@app.route('/buscar_solucao_ia', methods=['POST'])
def buscar_solucao_ia():
    if 'usuario_id' not in session:
        return redirect(url_for('index'))
    
    form = chamadoForm()
    if form.validate_on_submit():
        # Simula a chamada da IA
        solucao_sugerida = buscar_solucao_com_ia(form.titulo.data, form.descricao.data)

        # Armazena os dados do chamado e a solução na sessão
        session['chamado_temporario'] = {
            'titulo': form.titulo.data,
            'descricao': form.descricao.data,
            'afetado': form.afetado.data,
            'prioridade': form.prioridade.data,
            'solucao_sugerida': solucao_sugerida
        }
        user = {
            'name': session.get('usuario_nome')
        }
        return render_template('solucao_ia.html', solucao=solucao_sugerida, user=user)
    
    # Se o formulário não for válido, redireciona de volta
    # e exibe os erros de validação.
    user = {
        'name': session.get('usuario_nome')
    }
    return render_template('chamado.html', form=form, user=user, form_action=url_for('buscar_solucao_ia'))

@app.route('/confirmar_abertura_chamado', methods=['POST'])
def confirmar_abertura_chamado():
    if 'usuario_id' not in session or 'chamado_temporario' not in session:
        return redirect(url_for('index'))

    dados_chamado = session.pop('chamado_temporario', None)
    novo_chamado = Chamado(
        titulo_Chamado=dados_chamado['titulo'],
        descricao_Chamado=dados_chamado['descricao'],
        categoria_Chamado=dados_chamado['afetado'],
        solicitanteID=session['usuario_id'],
        prioridade_Chamado=dados_chamado['prioridade'],
        solucaoSugerida=dados_chamado['solucao_sugerida']
    )
    db.session.add(novo_chamado)
    db.session.commit()
    return redirect(url_for('ver_chamado'))

@app.route('/ver-chamado')
def ver_chamado():
    lista_chamados = Chamado.query.all()
    user = {
        'name': session.get('usuario_nome', 'Usuário')
    }
    return render_template('verChamado.html', chamados=lista_chamados, user=user)

@app.route('/ger_usuarios')
def ger_usuarios():
    lista_usuarios = Usuario.query.all()
    form_criar = CriarUsuarioForm()
    user = {
        'name': session.get('usuario_nome', 'Usuário')
    }
    return render_template('ger_usuarios.html', usuarios=lista_usuarios, user=user, form_criar=form_criar)

@app.route('/criar_usuario', methods=['POST'])
def criar_usuario():
    form = CriarUsuarioForm()
    if form.validate_on_submit():
        novo_usuario = Usuario(
            nome=form.nome.data,
            email=form.email.data,
            telefone=form.telefone.data,
            setor=form.setor.data,
            cargo=form.cargo.data,
            senha=form.senha.data # Lembre-se de hashear a senha em produção!
        )
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"mensagem": "Usuário criado com sucesso!"}), 201
    
    # Coleta os erros de validação para retornar no JSON
    erros = {campo: erro[0] for campo, erro in form.errors.items()}
    return jsonify({"mensagem": "Dados inválidos", "erros": erros}), 400

@app.route('/editar_usuario/<int:usuario_id>', methods=['POST'])
def editar_usuario(usuario_id):
    usuario = Usuario.query.get_or_404(usuario_id)
    form = EditarUsuarioForm()

    # O campo de senha não é obrigatório na edição, a menos que se queira alterar.
    # Se o campo senha estiver vazio, removemos o validador para não dar erro.
    if not form.senha.data:
        form.senha.validators = []

    if form.validate_on_submit():
        usuario.nome = form.nome.data
        usuario.email = form.email.data
        usuario.telefone = form.telefone.data
        usuario.setor = form.setor.data
        usuario.cargo = form.cargo.data
        if form.senha.data: # Só atualiza a senha se uma nova for fornecida
            usuario.senha = form.senha.data # Lembre-se de hashear a senha!
        db.session.commit()
        return jsonify({'mensagem': 'Usuário atualizado com sucesso!'}), 200

    erros = {campo: erro[0] for campo, erro in form.errors.items()}
    return jsonify({"mensagem": "Dados inválidos", "erros": erros}), 400



@app.route('/triagem')
def triagem():
    lista_chamados = Chamado.query.all()
    user = {
        'name': session.get('usuario_nome', 'Usuário')
    }
    return render_template('triagem.html', chamados=lista_chamados, user=user)

@app.route('/transferir_chamado/<int:chamado_id>')
def transferir_chamado(chamado_id):
    if 'usuario_id' not in session:
        return redirect(url_for('index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    user = {
        'name': session.get('usuario_nome', 'Usuário')
    }
    return render_template('transferir_chamado.html', chamado=chamado, user=user)

@app.route('/excluir_usuario/<int:usuario_id>', methods=['POST'])
def excluir_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'mensagem': 'Usuário excluído com sucesso!'})

@app.route('/perfil')
def perfil():
    if 'usuario_id' not in session:
        return redirect(url_for('index'))
    
    usuario = Usuario.query.get(session['usuario_id'])
    if not usuario:
        return redirect(url_for('index'))

    
    user = {
        'name': usuario.nome,
        'email': usuario.email,
        'cargo': usuario.cargo,
        'setor': usuario.setor,
        'telefone': usuario.telefone
    }
    return render_template('perfil.html', user=user)

@app.route('/meus-chamados')
def meus_chamados():
    if 'usuario_id' not in session:
        return redirect(url_for('index'))
    
    return "<h1>Meus Chamados (Página em construção)</h1>"


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)