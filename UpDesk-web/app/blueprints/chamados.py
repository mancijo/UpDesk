"""
Blueprint para Gerenciamento de Chamados

Responsabilidade:
- Orquestrar todas as funcionalidades relacionadas a chamados (tickets) de suporte.
- Inclui rotas para abrir, visualizar, atender, transferir, encerrar e interagir com chamados.
- Fornece uma API para a funcionalidade de chat em tempo real.
"""
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, make_response, current_app, flash
from werkzeug.utils import secure_filename
import os
from ..models import db, Chamado, Interacao, get_sao_paulo_time
from ..forms import chamadoForm
from ..services import buscar_solucao_com_ia
from datetime import datetime, timedelta
from fpdf import FPDF

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

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
    # Define o status padrão para 'Aberto' para novos chamados, já que o campo é readonly no frontend.
    form.status.data = 'Aberto'
    # Log mínimo: método da requisição (útil para auditoria)
    current_app.logger.debug(f"abrir_chamado called, method={request.method}")
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST' and form.validate_on_submit():
        # Chama o serviço de IA para obter uma solução baseada no título e descrição
        solucao_sugerida, prioridade_ia = buscar_solucao_com_ia(form.titulo.data, form.descricao.data)
        current_app.logger.info(f"Solucao sugerida: {solucao_sugerida}, Prioridade IA: {prioridade_ia}")
        
        # Armazena os dados do formulário e a solução da IA na sessão para uso posterior
        chamado_data = {
            'titulo': form.titulo.data,
            'descricao': form.descricao.data,
            'afetado': form.afetado.data,
            'prioridade': prioridade_ia, # Usa a prioridade classificada pela IA
            'solucao_sugerida': solucao_sugerida,
            'anexo': None  # Inicializa anexo como None
        }

        # Lida com o upload do arquivo
        if 'anexo' in request.files:
            file = request.files['anexo']
            if file.filename == '':
                current_app.logger.warning("Nenhum arquivo selecionado para upload.")
            elif file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                upload_folder = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, filename)
                # Salva uma cópia no disco para referência (opcional)
                file.save(file_path)
                # Lê bytes para armazenar no banco (LargeBinary)
                try:
                    with open(file_path, 'rb') as f:
                        file_bytes = f.read()
                    chamado_data['anexo'] = file_bytes
                    chamado_data['nome_anexo'] = filename # Salva o nome do arquivo
                    current_app.logger.info(f"Arquivo {filename} salvo em {file_path} e bytes preparados para DB")
                except Exception as e:
                    current_app.logger.exception(f"Erro ao ler arquivo salvo para armazenamento em DB: {e}")
                    chamado_data['anexo'] = None
            else:
                current_app.logger.warning(f"Tipo de arquivo não permitido: {file.filename}")
        
        session['chamado_temporario'] = chamado_data
        user = {'name': session.get('usuario_nome')}
        # Format and sanitize the solution HTML before rendering
        try:
            from ..services import format_solucao
            solucao_html = format_solucao(solucao_sugerida)
        except Exception:
            solucao_html = solucao_sugerida or ''

        # Renderiza a página que mostra a solução da IA para o usuário decidir se resolve o problema
        return render_template('solucao_ia.html', solucao=solucao_sugerida, solucao_html=solucao_html, user=user)
    elif request.method == 'POST':
        # Validação falhou: registrar erros e fornecer feedback ao usuário
        current_app.logger.warning('POST recebido em /chamados/abrir, mas form.validate_on_submit() retornou False')
        current_app.logger.debug(f'form.errors: {form.errors}')
        try:
            current_app.logger.debug(f'request.form keys: {list(request.form.keys())}')
        except Exception:
            current_app.logger.debug('Não foi possível ler request.form')
        # Mostrar mensagem genérica e permitir que template exiba os erros detalhados
        flash('Corrija os erros do formulário e tente novamente.', 'danger')

    # Para requisições GET, apenas exibe o formulário de abertura de chamado
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('chamado.html', form=form, user=user)

@bp.route('/confirmar_abertura', methods=['GET', 'POST'])
def confirmar_abertura_chamado():
    """
    Cria o chamado no banco de dados.
    Esta rota é chamada quando o usuário, após ver a solução da IA, decide que 
    ainda precisa abrir o chamado. Ela recupera os dados da sessão e os salva no banco.
    """
    if 'usuario_id' not in session or 'chamado_temporario' not in session:
        return redirect(url_for('main.index'))

    dados_chamado = session.get('chamado_temporario')
    if not dados_chamado:
        return redirect(url_for('chamados.abrir_chamado'))

    user = {'name': session.get('usuario_nome', 'Usuário')} # Define user aqui, antes dos blocos GET/POST

    if request.method == 'POST':
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
            solucaoSugerida=dados_chamado['solucao_sugerida'],
            anexo_Chamado=dados_chamado.get('anexo') # Adiciona o nome do arquivo anexado, se existir
        )
        db.session.add(novo_chamado)
        db.session.flush() # Garante que o ID seja atribuído ao objeto antes do commit.
        db.session.commit()
        return render_template('chamado_enviado.html', chamado=novo_chamado, user=user) # Passa user aqui
    else: # GET request
        current_app.logger.debug(f"Nome do usuário na sessão para chamado_enviado.html (GET): {user['name']}")
        return render_template('chamado_enviado.html', chamado_data=dados_chamado, user=user) # Passa user aqui

@bp.route('/resolvido_ia', methods=['POST'])
def resolvido_pela_ia():
    """
    Cria o chamado com status 'Resolvido por IA'.
    Esta rota é acionada quando o usuário confirma que a solução sugerida pela IA resolveu o problema.
    O chamado é criado para fins de registro e métricas, mas já entra no sistema como resolvido.
    """
    if 'usuario_id' not in session or 'chamado_temporario' not in session:
        # Se não houver dados na sessão, redireciona para a home, pois não há o que processar.
        flash('Sessão expirada ou inválida.', 'warning')
        return redirect(url_for('main.index'))

    # Recupera os dados do chamado da sessão.
    dados_chamado = session.pop('chamado_temporario', None)
    if not dados_chamado:
        # Se os dados não existirem, redireciona para a abertura de chamado.
        flash('Não foi possível encontrar os dados do chamado.', 'danger')
        return redirect(url_for('chamados.abrir_chamado'))

    # Cria a instância do chamado, definindo o status diretamente como 'Resolvido por IA'.
    novo_chamado = Chamado(
        titulo_Chamado=dados_chamado['titulo'],
        descricao_Chamado=dados_chamado['descricao'],
        categoria_Chamado=dados_chamado['afetado'],
        solicitanteID=session['usuario_id'],
        prioridade_Chamado=dados_chamado['prioridade'],
        solucaoSugerida=dados_chamado['solucao_sugerida'],
        anexo_Chamado=dados_chamado.get('anexo'),
        status_Chamado='Resolvido por IA'  # Status que indica a resolução pela IA.
    )
    
    # Salva o chamado no banco de dados.
    db.session.add(novo_chamado)
    db.session.flush()  # Garante que o ID seja atribuído ao objeto antes do commit.
    db.session.commit()
    
    # Log para registrar o evento.
    current_app.logger.info(f"Chamado {novo_chamado.chamado_ID} criado e marcado como 'Resolvido por IA'.")

    # Renderiza a página de confirmação para o usuário.
    return render_template('chamado_resolvido_ia.html', chamado=novo_chamado)

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

@bp.route('/triagem', methods=['GET'])
def triagem():
    """
    Página de triagem: exibe chamados com status 'Aberto' para serem atendidos,
    com funcionalidades de busca, filtro e indicadores.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('q', '').strip()
    prioridade_filtro = request.args.get('prioridade', 'Todos')
    status_filtro = request.args.get('status', 'Aberto') # Padrão para 'Aberto' na triagem
    data_filtro = request.args.get('data', 'Todos')
    order_by = request.args.get('order_by', 'dataAbertura')
    direction = request.args.get('direction', 'asc')

    query = Chamado.query.filter(Chamado.status_Chamado == 'Aberto') # Sempre filtra por 'Aberto' para triagem

    # Aplica filtro de busca por título ou ID
    if search_query:
        # Tenta converter para int para buscar por ID, caso contrário, busca por título
        try:
            chamado_id = int(search_query)
            query = query.filter(Chamado.chamado_ID == chamado_id)
        except ValueError:
            query = query.filter(Chamado.titulo_Chamado.ilike(f'%{search_query}%'))

    # Aplica filtro de prioridade
    if prioridade_filtro != 'Todos':
        query = query.filter(Chamado.prioridade_Chamado == prioridade_filtro)

    # Aplica filtro de status (embora para triagem seja sempre 'Aberto', pode ser útil para futuras expansões)
    if status_filtro != 'Todos':
        query = query.filter(Chamado.status_Chamado == status_filtro)

    # Aplica filtro de data de abertura
    if data_filtro == 'Hoje':
        query = query.filter(Chamado.dataAbertura >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0))
    elif data_filtro == 'Ultimos 7 Dias':
        query = query.filter(Chamado.dataAbertura >= (datetime.now() - timedelta(days=7)))
    elif data_filtro == 'Ultimos 30 Dias':
        query = query.filter(Chamado.dataAbertura >= (datetime.now() - timedelta(days=30)))

    # Aplica ordenação
    if order_by:
        if direction == 'asc':
            query = query.order_by(getattr(Chamado, order_by).asc())
        else:
            query = query.order_by(getattr(Chamado, order_by).desc())
    else:
        query = query.order_by(Chamado.dataAbertura.asc()) # Ordenação padrão

    chamados_paginados = query.paginate(page=page, per_page=20)

    # --- Indicadores ---
    total_aguardando_triagem = Chamado.query.filter_by(status_Chamado='Aberto').count()
    
    # Chamados triados hoje (status 'Em Atendimento' e atualizados hoje)
    # Usa o campo dataUltimaModificacao (definido no modelo) para verificar atualizações recentes
    triados_hoje = Chamado.query.filter(
        Chamado.status_Chamado == 'Em Atendimento',
        Chamado.dataUltimaModificacao != None,
        Chamado.dataUltimaModificacao >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    ).count()

    # Chamados pendentes há mais de 24h (status 'Aberto' e dataAbertura há mais de 24h)
    pendentes_mais_24h = Chamado.query.filter(
        Chamado.status_Chamado == 'Aberto',
        Chamado.dataAbertura <= (datetime.now() - timedelta(hours=24))
    ).count()

    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('triagem.html',
                           chamados_paginados=chamados_paginados,
                           user=user,
                           search_query=search_query,
                           prioridade_filtro=prioridade_filtro,
                           status_filtro=status_filtro,
                           data_filtro=data_filtro,
                           order_by=order_by,
                           direction=direction,
                           total_aguardando_triagem=total_aguardando_triagem,
                           triados_hoje=triados_hoje,
                           pendentes_mais_24h=pendentes_mais_24h)

@bp.route('/transferir/<int:chamado_id>', methods=['GET', 'POST'])
def transferir_chamado(chamado_id):
    """
    Renderiza a página para a transferência de um chamado específico.
    Também processa o POST quando o formulário de transferência é enviado.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)

    if request.method == 'POST':
        # Dados do formulário
        prioridade = request.form.get('prioridade')
        destino = request.form.get('transferir')

        # Atualiza prioridade se fornecida
        if prioridade:
            chamado.prioridade_Chamado = prioridade

        # Aplica lógica de transferência: se voltar para triagem, mantém aberto e sem atendente
        if destino == 'setor-triagem':
            chamado.status_Chamado = 'Aberto'
            chamado.atendenteID = None
            msg = 'Chamado transferido de volta para triagem.'
            redirect_to = url_for('chamados.triagem')
        else:
            # Ao transferir para N1/N2, marca como em atendimento e associa o atendente atual
            chamado.status_Chamado = 'Em Atendimento'
            chamado.atendenteID = session.get('usuario_id')
            msg = 'Chamado transferido e em atendimento.'
            redirect_to = url_for('chamados.atender_chamado', chamado_id=chamado_id)

        # Atualiza timestamp de modificação com timezone de São Paulo
        try:
            chamado.dataUltimaModificacao = get_sao_paulo_time()
        except Exception:
            chamado.dataUltimaModificacao = datetime.now()

        db.session.commit()
        flash(msg, 'success')
        return redirect(redirect_to)

    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('transferir_chamado.html', chamado=chamado, user=user)

@bp.route('/triar/<int:chamado_id>')
def triar_chamado(chamado_id):
    """
    Realiza a triagem de um chamado.
    - Altera o status do chamado para 'Em Atendimento'.
    - Associa o ID do usuário logado como o atendente do chamado.
    - Redireciona para a página de atendimento (chat).
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    chamado.status_Chamado = 'Em Atendimento'
    chamado.atendenteID = session['usuario_id']
    # Atualiza a data da última modificação para registro de métricas/indicadores
    chamado.dataUltimaModificacao = datetime.now()
    db.session.commit()

    flash('Chamado triado e em atendimento!', 'success')
    return redirect(url_for('chamados.atender_chamado', chamado_id=chamado_id))

@bp.route('/atender/<int:chamado_id>')
def atender_chamado(chamado_id):
    """
    Renderiza a página de atendimento de um chamado específico.
    Esta rota é acessada após a triagem.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
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

@bp.route('/devolver_triagem/<int:chamado_id>')
def devolver_triagem(chamado_id):
    """
    Devolve um chamado para a triagem.
    - Altera o status do chamado para 'Aberto'.
    - Remove o atendente associado ao chamado.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    chamado.status_Chamado = 'Aberto'
    chamado.atendenteID = None  # Remove o atendente
    db.session.commit()
    
    flash('Chamado devolvido para a triagem com sucesso!', 'success')
    return redirect(url_for('chamados.triagem'))

@bp.route('/reabrir/<int:chamado_id>', methods=['POST'])
def reabrir_chamado(chamado_id):
    """
    Reabre um chamado resolvido.
    - Altera o status do chamado para 'Aberto'.
    - Remove o atendente associado ao chamado.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    chamado.status_Chamado = 'Aberto'
    chamado.atendenteID = None  # Remove o atendente
    db.session.commit()
    
    flash('Chamado reaberto com sucesso!', 'success')
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
