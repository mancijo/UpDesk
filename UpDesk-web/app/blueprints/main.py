from flask import Blueprint, render_template, session, redirect, url_for
from ..models import Chamado
from ..forms import LoginForm

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """
    Renderiza a página de login ou redireciona para a home se o usuário já estiver logado.

    - Verifica se o 'usuario_id' existe na sessão para determinar se o usuário está autenticado.
    - Instancia o LoginForm (de forms.py) e o passa para o template 'login.html'.
      Isso permite que o template renderize o formulário com os campos, validações e 
      proteção CSRF definidos no backend.
    """
    # Se o usuário já estiver logado, redireciona para a home
    if 'usuario_id' in session:
        return redirect(url_for('main.home'))
    
    # Cria uma instância do formulário de login para ser usada no template
    form = LoginForm()
    return render_template('login.html', form=form)

@bp.route('/home')
def home():
    # if 'usuario_id' not in session:
    #     return redirect(url_for('main.index'))

    nome_usuario = session.get('usuario_nome')
    
    # Contagem de chamados por status
    chamados_abertos = Chamado.query.filter_by(status_Chamado='Aberto').count()
    chamados_em_atendimento = Chamado.query.filter_by(status_Chamado='Em Atendimento').count()
    chamados_resolvidos = Chamado.query.filter_by(status_Chamado='Resolvido').count()

    return render_template('home.html', 
                           nome_usuario=nome_usuario, 
                           chamados_abertos=chamados_abertos,
                           chamados_em_triagem=chamados_em_atendimento, # Ajustado para consistência
                           chamados_solucao_ia=chamados_resolvidos, # Simplificado
                           chamados_finalizados=chamados_resolvidos)
