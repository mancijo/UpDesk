
"""
Blueprint para Gerenciamento de Usuários

Responsabilidade:
- Agrupar todas as rotas relacionadas às operações de CRUD (Create, Read, Update, Delete) de usuários.
- Fornece endpoints para criar, listar, editar e desativar usuários, além de visualizar o perfil do usuário logado.
"""
from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
from werkzeug.security import generate_password_hash
from ..models import db, Usuario
from ..forms import CriarUsuarioForm, EditarUsuarioForm

bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

@bp.route('/ger_usuarios')
def ger_usuarios():
    """
    Renderiza a página principal de gerenciamento de usuários.
    - Lista todos os usuários ativos.
    - Fornece uma funcionalidade de busca por nome ou email.
    - Passa um formulário de criação de usuário para ser usado em um modal na página.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    search_query = request.args.get('q', '')
    # Inicia a query buscando apenas usuários ativos
    query = Usuario.query.filter_by(ativo=True)
    if search_query:
        search_term = f"%{search_query}%"
        # Filtra por nome ou email que contenham o termo de busca (case-insensitive)
        query = query.filter(db.or_(Usuario.nome.ilike(search_term), Usuario.email.ilike(search_term)))

    lista_usuarios = query.all()
    form_criar = CriarUsuarioForm()
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('ger_usuarios.html', usuarios=lista_usuarios, user=user, form_criar=form_criar, search_query=search_query)

@bp.route('/criar', methods=['POST'])
def criar_usuario():
    """
    Endpoint para criar um novo usuário. Responde em JSON.
    - Valida os dados recebidos usando o `CriarUsuarioForm`.
    - Gera um hash seguro para a senha antes de salvar no banco.
    - Retorna uma resposta JSON de sucesso ou de erro com os detalhes da validação.
    """
    form = CriarUsuarioForm()
    if form.validate_on_submit():
        novo_usuario = Usuario(
            nome=form.nome.data,
            email=form.email.data,
            telefone=form.telefone.data,
            setor=form.setor.data,
            cargo=form.cargo.data,
            # É crucial armazenar apenas o hash da senha, nunca a senha em texto plano
            senha=generate_password_hash(form.senha.data)
        )
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"mensagem": "Usuário criado com sucesso!"}), 201 # 201 Created
    
    # Se a validação falhar, retorna os erros para o frontend
    erros = {campo: erro[0] for campo, erro in form.errors.items()}
    return jsonify({"mensagem": "Dados inválidos", "erros": erros}), 400 # 400 Bad Request

@bp.route('/editar/<int:usuario_id>', methods=['POST'])
def editar_usuario(usuario_id):
    """
    Endpoint para editar um usuário existente. Responde em JSON.
    - Se o campo de senha for deixado em branco, a senha atual não é alterada.
    - Valida os dados e atualiza o registro do usuário no banco.
    """
    usuario = Usuario.query.get_or_404(usuario_id)
    form = EditarUsuarioForm()
    # Remove a validação da senha se o campo não for preenchido, permitindo a edição sem troca de senha
    if not form.senha.data:
        form.senha.validators = []

    if form.validate_on_submit():
        usuario.nome = form.nome.data
        usuario.email = form.email.data
        usuario.telefone = form.telefone.data
        usuario.setor = form.setor.data
        usuario.cargo = form.cargo.data
        if form.senha.data:
            usuario.senha = generate_password_hash(form.senha.data)
        db.session.commit()
        return jsonify({'mensagem': 'Usuário atualizado com sucesso!'}), 200 # 200 OK

    erros = {campo: erro[0] for campo, erro in form.errors.items()}
    return jsonify({"mensagem": "Dados inválidos", "erros": erros}), 400

@bp.route('/excluir/<int:usuario_id>', methods=['POST'])
def excluir_usuario(usuario_id):
    """
    Endpoint para excluir (desativar) um usuário.
    - Realiza um "soft delete": o usuário não é apagado do banco, mas o campo `ativo` é 
      definido como `False`, impedindo seu login e removendo-o das listagens.
    """
    usuario = Usuario.query.get_or_404(usuario_id)
    usuario.ativo = False
    db.session.commit()
    return jsonify({'mensagem': 'Usuário desativado com sucesso!'}), 200

@bp.route('/perfil')
def perfil():
    """
    Renderiza a página de perfil do usuário atualmente logado.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))
    
    usuario = Usuario.query.get_or_404(session['usuario_id'])
    user = {
        'name': usuario.nome,
        'email': usuario.email,
        'cargo': usuario.cargo,
        'setor': usuario.setor,
        'telefone': usuario.telefone
    }
    return render_template('perfil.html', user=user)
