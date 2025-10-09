
"""
Blueprint para Gerenciamento de Chamados

Responsabilidade:
- Orquestrar todas as funcionalidades relacionadas a chamados (tickets) de suporte.
- Inclui rotas para abrir, visualizar, atender, transferir, encerrar e interagir com chamados.
- Fornece uma API para a funcionalidade de chat em tempo real.
"""
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, make_response
from app.models import db, Chamado, Interacao
from app.forms import chamadoForm
from app.services import buscar_solucao_com_ia
from datetime import datetime, timedelta
from fpdf import FPDF

bp = Blueprint('chamados', __name__, url_prefix='/chamados')

@bp.route('/abrir', methods=['GET', 'POST'])
def abrir_chamado():
    """
    Rota para a página de abertura de chamado. Opera em duas etapas:
    1. GET: Exibe o formulário para o usuário preencher.
    2. POST: Recebe os dados, consulta a IA para uma solução sugerida e exibe essa solução 
       ao usuário ANTES de criar o chamado no banco. Os dados do chamado são salvos 
       temporariamente na sessão do usuário.
    """
    form = chamadoForm()
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST' and form.validate_on_submit():
        # Chama o serviço de IA para obter uma solução baseada no título e descrição
        solucao_sugerida = buscar_solucao_com_ia(form.titulo.data, form.descricao.data)
        
        # Armazena os dados do formulário e a solução da IA na sessão para uso posterior
        session['chamado_temporario'] = {
            'titulo': form.titulo.data,
            'descricao': form.descricao.data,
            'afetado': form.afetado.data,
            'prioridade': form.prioridade.data,
            'solucao_sugerida': solucao_sugerida
        }
        user = {'name': session.get('usuario_nome')}
        # Renderiza a página que mostra a solução da IA para o usuário decidir se resolve o problema
        return render_template('solucao_ia.html', solucao=solucao_sugerida, user=user)

    # Para requisições GET, apenas exibe o formulário de abertura de chamado
    user = {'name': session.get('usuario_nome')}
    return render_template('chamado.html', form=form, user=user, form_action=url_for('chamados.abrir_chamado'))

@bp.route('/confirmar_abertura', methods=['POST'])
def confirmar_abertura_chamado():
    """
    Cria o chamado no banco de dados.
    Esta rota é chamada quando o usuário, após ver a solução da IA, decide que 
    ainda precisa abrir o chamado. Ela recupera os dados da sessão e os salva no banco.
    """
    if 'usuario_id' not in session or 'chamado_temporario' not in session:
        return redirect(url_for('main.index'))

    # Recupera e remove os dados temporários da sessão para evitar reuso
    dados_chamado = session.pop('chamado_temporario', None)
    if not dados_chamado:
        return redirect(url_for('chamados.abrir_chamado'))

    # Cria a nova instância do modelo Chamado e a salva no banco
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
    return redirect(url_for('chamados.ver_chamados'))

@bp.route('/ver')
def ver_chamados():
    """
    Exibe a lista de chamados, com funcionalidades de busca e filtro.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    # Obtém os parâmetros de busca e filtro da URL (?q=...&status=...)
    search_query = request.args.get('q', '')
    status_filtro = request.args.get('status', 'Todos')
    query = Chamado.query

    # Aplica o filtro de busca no título do chamado, se houver
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(Chamado.titulo_Chamado.ilike(search_term))

    # Aplica o filtro por status, se não for 'Todos'
    if status_filtro and status_filtro != 'Todos':
        query = query.filter(Chamado.status_Chamado == status_filtro)

    # Ordena os resultados pela data de abertura e executa a query
    lista_chamados = query.order_by(Chamado.dataAbertura.desc()).all()
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('verChamado.html', chamados=lista_chamados, user=user, search_query=search_query, status_filtro=status_filtro)

@bp.route('/triagem')
def triagem():
    """
    Página de triagem: exibe chamados com status 'Aberto' para serem atendidos.
    Utiliza paginação para lidar com grandes volumes de chamados.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    page = request.args.get('page', 1, type=int)
    # Filtra apenas chamados abertos e os pagina
    chamados_paginados = Chamado.query.filter_by(status_Chamado='Aberto').order_by(Chamado.dataAbertura.asc()).paginate(page=page, per_page=20)
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('triagem.html', chamados_paginados=chamados_paginados, user=user)

@bp.route('/transferir/<int:chamado_id>')
def transferir_chamado(chamado_id):
    """
    Renderiza a página para a transferência de um chamado específico.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('transferir_chamado.html', chamado=chamado, user=user)

@bp.route('/atender/<int:chamado_id>')
def atender_chamado(chamado_id):
    """
    Inicia o atendimento de um chamado.
    - Altera o status do chamado para 'Em Atendimento'.
    - Associa o ID do usuário logado como o atendente do chamado.
    - Redireciona para a página de atendimento (chat).
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    chamado.status_Chamado = 'Em Atendimento'
    chamado.atendenteID = session['usuario_id']
    db.session.commit()
    
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('atender_chamado.html', chamado=chamado, user=user)

@bp.route('/encerrar/<int:chamado_id>', methods=['POST'])
def encerrar_chamado(chamado_id):
    """
    Encerra um chamado, alterando seu status para 'Resolvido'.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    chamado.status_Chamado = 'Resolvido'
    db.session.commit()
    return redirect(url_for('chamados.ver_chamados'))

@bp.route('/api/<int:chamado_id>/mensagens', methods=['GET', 'POST'])
def api_mensagens(chamado_id):
    """
    API REST para o chat de um chamado.
    - GET: Retorna todas as mensagens de um chamado em formato JSON.
    - POST: Recebe uma nova mensagem em JSON e a salva no banco de dados.
    """
    if 'usuario_id' not in session:
        return jsonify({"erro": "Não autorizado"}), 401

    if request.method == 'GET':
        interacoes = Interacao.query.filter_by(chamado_id=chamado_id).order_by(Interacao.data_criacao.asc()).all()
        mensagens = [{
            'id': i.id, 'mensagem': i.mensagem, 'data_criacao': i.data_criacao.strftime('%d/%m/%Y %H:%M'),
            'usuario_id': i.usuario_id, 'usuario_nome': i.usuario.nome
        } for i in interacoes]
        return jsonify(mensagens)
    
    if request.method == 'POST':
        data = request.json
        if not data or 'mensagem' not in data or not data['mensagem'].strip():
            return jsonify({"erro": "Mensagem inválida"}), 400

        nova_interacao = Interacao(chamado_id=chamado_id, usuario_id=session['usuario_id'], mensagem=data['mensagem'])
        db.session.add(nova_interacao)
        db.session.commit()
        return jsonify({"mensagem": "Mensagem enviada com sucesso!"}), 201

@bp.route('/relatorio/pdf')
def gerar_relatorio_pdf():
    """ (Placeholder) Rota para a futura implementação da geração de relatórios em PDF. """
    # ... (código de geração de PDF movido para cá, com ajustes de importação)
    pass # Implementar depois
