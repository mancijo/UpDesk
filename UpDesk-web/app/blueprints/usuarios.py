
from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
from werkzeug.security import generate_password_hash
from app.models import db, Usuario
from app.forms import CriarUsuarioForm, EditarUsuarioForm

bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

@bp.route('/ger_usuarios')
def ger_usuarios():
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    search_query = request.args.get('q', '')
    query = Usuario.query.filter_by(ativo=True)
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(db.or_(Usuario.nome.ilike(search_term), Usuario.email.ilike(search_term)))

    lista_usuarios = query.all()
    form_criar = CriarUsuarioForm()
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('ger_usuarios.html', usuarios=lista_usuarios, user=user, form_criar=form_criar, search_query=search_query)

@bp.route('/criar', methods=['POST'])
def criar_usuario():
    form = CriarUsuarioForm()
    if form.validate_on_submit():
        novo_usuario = Usuario(
            nome=form.nome.data,
            email=form.email.data,
            telefone=form.telefone.data,
            setor=form.setor.data,
            cargo=form.cargo.data,
            senha=generate_password_hash(form.senha.data)
        )
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"mensagem": "Usuário criado com sucesso!"}), 201
    
    erros = {campo: erro[0] for campo, erro in form.errors.items()}
    return jsonify({"mensagem": "Dados inválidos", "erros": erros}), 400

@bp.route('/editar/<int:usuario_id>', methods=['POST'])
def editar_usuario(usuario_id):
    usuario = Usuario.query.get_or_404(usuario_id)
    form = EditarUsuarioForm()
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
        return jsonify({'mensagem': 'Usuário atualizado com sucesso!'}), 200

    erros = {campo: erro[0] for campo, erro in form.errors.items()}
    return jsonify({"mensagem": "Dados inválidos", "erros": erros}), 400

@bp.route('/excluir/<int:usuario_id>', methods=['POST'])
def excluir_usuario(usuario_id):
    usuario = Usuario.query.get_or_404(usuario_id)
    # Soft delete em vez de exclusão física
    usuario.ativo = False
    db.session.commit()
    return jsonify({'mensagem': 'Usuário desativado com sucesso!'}), 200

@bp.route('/perfil')
def perfil():
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
