
"""
Blueprint para Autenticação

Responsabilidade:
- Gerenciar as rotas relacionadas à autenticação de usuários, como login e logout.
- Funciona como uma API interna para o frontend, recebendo dados em JSON e respondendo em JSON.
"""
from flask import Blueprint, request, jsonify, session, redirect, url_for, render_template, current_app
from werkzeug.security import check_password_hash
from ..models import Usuario, db # Import db aqui se for fazer commits
from ..forms import FormularioEsqueciSenha

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint para realizar o login do usuário.

    Recebe um JSON contendo 'email' e 'senha'.
    1. Valida se os dados foram recebidos.
    2. Busca o usuário no banco de dados pelo email (apenas usuários 'ativos').
    3. Compara a hash da senha fornecida com a hash armazenada no banco.
    4. Se a autenticação for bem-sucedida, armazena informações do usuário na sessão.
    5. Retorna uma resposta JSON com o status e os dados do usuário (em caso de sucesso) 
       ou uma mensagem de erro (em caso de falha).
    """
    # Pega os dados JSON enviados pelo frontend (login.js)
    data = request.get_json()
    
    # Validação inicial para garantir que os campos necessários foram enviados
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({"mensagem": "Email e senha são obrigatórios."}), 400 # 400 Bad Request

    # Busca pelo usuário no banco de dados que corresponda ao email e que esteja ativo
    usuario = Usuario.query.filter_by(email=data['email'], ativo=True).first()
    
    # Verifica se o usuário existe e se a senha fornecida corresponde à senha hasheada no banco
    if usuario and check_password_hash(usuario.senha, data['senha']):
        # Se a autenticação for válida, armazena os dados do usuário na sessão do Flask
        session['usuario_nome'] = usuario.nome
        session['usuario_id'] = usuario.id
        # Armazena o cargo na sessão para uso em templates (frontend) e verificações simples
        session['usuario_cargo'] = usuario.cargo
        # Armazena o salt atual da aplicação na sessão para validar reinícios
        try:
            session['session_salt'] = current_app.config.get('SESSION_SALT')
        except Exception:
            pass
        
        # Retorna uma resposta de sucesso com os dados do usuário
        return jsonify({
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "cargo": usuario.cargo
            }
        }), 200 # 200 OK
        
    # Se o usuário não existir ou a senha estiver incorreta, retorna um erro de não autorizado
    return jsonify({"mensagem": "Email ou senha incorretos"}), 401 # 401 Unauthorized

@bp.route('/logout')
def logout():
    """
    Endpoint para realizar o logout do usuário.

    - Limpa todos os dados da sessão atual.
    - Redireciona o usuário para a página de login.
    """
    session.clear()
    return redirect(url_for('main.index'))

@bp.route('/esqueci_senha', methods=['GET', 'POST'])
def esqueci_senha():
    form = FormularioEsqueciSenha()
    if form.validate_on_submit():
        email = form.email.data
        # Lógica para encontrar o supervisor e enviar o e-mail
        # Por enquanto, apenas um placeholder
        print(f"E-mail de recuperação solicitado para: {email}")
        # TODO: Implementar a lógica real de envio de e-mail para o supervisor.
        # 1. Buscar o usuário pelo e-mail.
        # 2. Se o usuário existir, buscar o supervisor responsável.
        # 3. Gerar um token de redefinição de senha.
        # 4. Salvar o token no banco de dados associado ao usuário.
        # 5. Enviar um e-mail para o supervisor com o link de redefinição de senha (contendo o token).
        return render_template('mensagem_esqueci_senha.html', mensagem="Se o e-mail estiver cadastrado, um link de recuperação foi enviado ao supervisor responsável.")
    return render_template('esqueci_senha.html', form=form)
