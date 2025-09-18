
from flask import Blueprint, request, jsonify, session, redirect, url_for, render_template
from werkzeug.security import check_password_hash
from app.models import Usuario, db # Import db aqui se for fazer commits

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({"mensagem": "Email e senha são obrigatórios."}), 400

    usuario = Usuario.query.filter_by(email=data['email'], ativo=True).first()
    if usuario and check_password_hash(usuario.senha, data['senha']):
        session['usuario_nome'] = usuario.nome
        session['usuario_id'] = usuario.id
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

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.index'))
