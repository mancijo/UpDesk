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
from ..models import db, Chamado, Interacao, get_sao_paulo_time, Usuario
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, func
from ..utils.constants import STAFF_ROLES, is_staff as cargo_is_staff
from flask import abort
from ..utils.auth import requires_roles
from ..forms import chamadoForm
from ..services import buscar_solucao_com_ia
from datetime import datetime, timedelta
from fpdf import FPDF
from flask import send_file
from io import BytesIO

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
    bypass = current_app.config.get('AUTH_BYPASS') or request.args.get('bypass') == '1'
    if 'usuario_id' not in session and not bypass:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST' and form.validate_on_submit():
        # Chama o serviço de IA para obter uma solução baseada no título e descrição
        solucao_sugerida, prioridade_ia = buscar_solucao_com_ia(form.titulo.data, form.descricao.data)
        # Fallback: se a IA não conseguir classificar, usar 'Não Classificada'
        if not prioridade_ia or str(prioridade_ia).strip().lower() in {'', 'none', 'null'}:
            prioridade_ia = 'Não Classificada'
        current_app.logger.info(f"Solucao sugerida: {solucao_sugerida}, Prioridade IA (normalizada): {prioridade_ia}")
        
        # Armazena os dados do formulário e a solução da IA na sessão para uso posterior
        chamado_data = {
            'titulo': form.titulo.data,
            'descricao': form.descricao.data,
            'afetado': form.afetado.data,
            'prioridade': prioridade_ia,  # Usa a prioridade classificada pela IA
            'solucao_sugerida': solucao_sugerida,
            'nome_anexo': None,
            'anexo_temp_path': None  # Guardar apenas caminho temporário em disco para evitar estourar cookie da sessão
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
                # Não armazenar bytes no cookie de sessão (risco de exceder tamanho). Apenas caminho e nome.
                chamado_data['nome_anexo'] = filename
                chamado_data['anexo_temp_path'] = file_path
                current_app.logger.info(f"Arquivo {filename} salvo em {file_path}; armazenado caminho temporário na sessão.")
            else:
                current_app.logger.warning(f"Tipo de arquivo não permitido: {file.filename}")
        
        session['chamado_temporario'] = chamado_data
        display_name = session.get('usuario_nome') if 'usuario_nome' in session else ('Dev Bypass' if bypass else 'Usuário')
        user = {'name': display_name}
        # Format and sanitize the solution HTML before rendering
        try:
            from ..services import format_solucao
            solucao_html = format_solucao(solucao_sugerida)
        except Exception:
            solucao_html = solucao_sugerida or ''

        # Renderiza a página que mostra a solução da IA para o usuário decidir se resolve o problema
        # Inclui prioridade sugerida no template para exibição ao usuário
        return render_template('solucao_ia.html', solucao=solucao_sugerida, solucao_html=solucao_html, prioridade_sugerida=prioridade_ia, user=user)
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
    display_name = session.get('usuario_nome') if 'usuario_nome' in session else ('Dev Bypass' if bypass else 'Usuário')
    user = {'name': display_name}
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
            flash('Sessão expirada. Por favor, abra o chamado novamente.', 'warning')
            return redirect(url_for('chamados.abrir_chamado'))

        try:
            # Carrega bytes do anexo a partir do caminho temporário (se existir)
            anexo_bytes = None
            if dados_chamado.get('anexo_temp_path'):
                try:
                    with open(dados_chamado['anexo_temp_path'], 'rb') as f:
                        anexo_bytes = f.read()
                except Exception as e:
                    current_app.logger.warning(f"Falha ao ler anexo em {dados_chamado['anexo_temp_path']}: {e}")
            
            # Cria a nova instância do modelo Chamado e a salva no banco
            # Garantia adicional de fallback antes de persistir
            prioridade_persistir = dados_chamado['prioridade'] or 'Não Classificada'
            novo_chamado = Chamado(
                titulo_Chamado=dados_chamado['titulo'],
                descricao_Chamado=dados_chamado['descricao'],
                categoria_Chamado=dados_chamado['afetado'],
                solicitanteID=session['usuario_id'],
                prioridade_Chamado=prioridade_persistir,
                solucaoSugerida=dados_chamado['solucao_sugerida'],
                anexo_Chamado=anexo_bytes,
                nome_anexo=dados_chamado.get('nome_anexo'),
                status_Chamado='Aberto',
                atendenteID=None,
                dataUltimaModificacao=get_sao_paulo_time()
            )
            db.session.add(novo_chamado)
            db.session.flush()  # Garante que o ID seja atribuído ao objeto antes do commit.
            db.session.commit()
            current_app.logger.info(f"Chamado criado com sucesso: ID={novo_chamado.chamado_ID}, Título='{novo_chamado.titulo_Chamado}'")
            flash('Chamado aberto com sucesso!', 'success')
            return render_template('chamado_enviado.html', chamado=novo_chamado, user=user)
        except Exception as e:
            current_app.logger.exception(f"Erro ao persistir chamado no banco: {e}")
            db.session.rollback()
            # Recoloca os dados na sessão para permitir tentativa novamente
            session['chamado_temporario'] = dados_chamado
            flash('Ocorreu um erro ao salvar o chamado. Tente novamente em instantes.', 'danger')
            return redirect(url_for('chamados.abrir_chamado'))
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
    try:
        # Carrega bytes do anexo
        anexo_bytes = None
        if dados_chamado.get('anexo_temp_path'):
            try:
                with open(dados_chamado['anexo_temp_path'], 'rb') as f:
                    anexo_bytes = f.read()
            except Exception as e:
                current_app.logger.warning(f"Falha ao ler anexo temporário para resolução IA: {e}")
        prioridade_persistir = dados_chamado['prioridade'] or 'Não Classificada'
        novo_chamado = Chamado(
            titulo_Chamado=dados_chamado['titulo'],
            descricao_Chamado=dados_chamado['descricao'],
            categoria_Chamado=dados_chamado['afetado'],
            solicitanteID=session['usuario_id'],
            prioridade_Chamado=prioridade_persistir,
            solucaoSugerida=dados_chamado['solucao_sugerida'],
            anexo_Chamado=anexo_bytes,
            nome_anexo=dados_chamado.get('nome_anexo'),
            status_Chamado='Resolvido por IA'
        )
        db.session.add(novo_chamado)
        db.session.flush()
        db.session.commit()
        current_app.logger.info(f"Chamado {novo_chamado.chamado_ID} criado e marcado como 'Resolvido por IA'.")
        flash('Chamado registrado como resolvido pela IA.', 'success')
        return render_template('chamado_resolvido_ia.html', chamado=novo_chamado)
    except Exception as e:
        current_app.logger.exception(f"Erro ao salvar chamado resolvido por IA: {e}")
        db.session.rollback()
        flash('Falha ao registrar resolução pela IA. Tente novamente.', 'danger')
        # Em caso de erro, volta para a abertura normal para não perder fluxo
        session['chamado_temporario'] = dados_chamado
        return redirect(url_for('chamados.abrir_chamado'))

@bp.route('/ver')
def ver_chamados():
    """
    Exibe a lista de chamados, com funcionalidades de busca e filtro.
    """
    bypass = current_app.config.get('AUTH_BYPASS') or request.args.get('bypass') == '1'
    if 'usuario_id' not in session and not bypass:
        return redirect(url_for('main.index'))

    # Obtém os parâmetros de busca e filtro da URL (?q=...&status=...)
    search_query = request.args.get('q', '')
    status_filtro = request.args.get('status', 'Todos')
    # Se o usuário for da equipe de atendimento/triagem, mostra todos; senão, só mostra os chamados do solicitante
    user = Usuario.query.get(session.get('usuario_id')) if 'usuario_id' in session else None
    cargo = (user.cargo or '').strip().lower() if user else ''

    # Escopo de visualização por cargo (regra solicitada)
    if cargo == 'supervisor':
        # Supervisor: por padrão o monitoramento NÃO deve mostrar chamados que estão em triagem
        # (status 'Aberto') para evitar duplicidade com a tela de triagem.
        # Se necessário, o filtro por status mais abaixo permite restringir ainda mais.
        query = Chamado.query.filter(Chamado.status_Chamado != 'Aberto')
    elif cargo in {'n1', 'n2'}:
        # N1/N2: por política, o chamado precisa ser triado primeiro —
        # portanto, aqui não mostramos chamados com status 'Aberto' na tela de monitoramento (/chamados/ver).
        # Os N1/N2 verão apenas chamados atribuídos a eles ou encaminhados especificamente para seu setor
        # que não estejam em estado 'Aberto'.
        user_id = session.get('usuario_id')
        # Usamos tags não ambíguas: ##destino:ti_n1## e ##destino:ti_n2##
        if cargo == 'n1':
            destino_tag = '%##destino:ti_n1##%'
            other_tag = '%##destino:ti_n2##%'
        else:
            destino_tag = '%##destino:ti_n2##%'
            other_tag = '%##destino:ti_n1##%'

        # Coalesce para tratar categoria nula e evitar comparações SQL com NULL
        cat_coalesce = func.coalesce(Chamado.categoria_Chamado, '')

        # Mostrar: chamados atribuídos ao usuário ou explicitamente encaminhados para este setor
        query = Chamado.query.filter(or_(
            Chamado.atendenteID == user_id,
            cat_coalesce.ilike(destino_tag)
        ))
        # Garantir que não incluamos chamados que ainda estão em triagem (status 'Aberto')
        query = query.filter(Chamado.status_Chamado != 'Aberto')
        # Excluir chamados que foram explicitamente encaminhados para o outro setor
        query = query.filter(~cat_coalesce.ilike(other_tag))
        bypass = False
    else:
        # Usuário final vê apenas seus próprios chamados
        query = Chamado.query.filter(Chamado.solicitanteID == session.get('usuario_id'))
        bypass = False

    # Aplica o filtro de busca no título do chamado, se houver
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(Chamado.titulo_Chamado.ilike(search_term))

    # Não redireciona mais automaticamente; supervisor, N1 e N2 podem visualizar 'Aberto' aqui também.

    # Não removemos 'Aberto' do supervisor; ele vê tudo.

    # Aplica o filtro por outro status, se não for 'Todos'
    if status_filtro and status_filtro not in {'Todos', 'Aberto'}:
        query = query.filter(Chamado.status_Chamado == status_filtro)

    # Evitar N+1 carregando solicitante e atendente junto
    query = query.options(
        joinedload(Chamado.solicitante),
        joinedload(Chamado.atendente)
    )

    # Ordena os resultados pela data de abertura e executa a query
    lista_chamados = query.order_by(Chamado.dataAbertura.desc()).all()
    # Nome exibido: se não for bypass ou se perfil for usuário comum, mostra nome real
    display_name = 'Dev Bypass' if bypass and cargo in STAFF_ROLES else session.get('usuario_nome', 'Usuário')
    user = {'name': display_name}
    is_staff = cargo in STAFF_ROLES  # Mantém sinalização ampla
    is_supervisor = (cargo == 'supervisor')
    user_id = session.get('usuario_id') if 'usuario_id' in session else None
    return render_template('verChamado.html', chamados=lista_chamados, user=user, search_query=search_query, status_filtro=status_filtro, is_staff=is_staff, is_supervisor=is_supervisor, user_id=user_id)

@bp.route('/triagem', methods=['GET'])
@requires_roles('supervisor', 'n1', 'n2')
def triagem():
    """
    Página de triagem: exibe chamados com status 'Aberto' para serem atendidos,
    com funcionalidades de busca, filtro e indicadores.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    # Permissão: apenas supervisores/atendentes (triagem, N1, N2, TI) podem acessar a tela de triagem

    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('q', '').strip()
    prioridade_filtro = request.args.get('prioridade', 'Todos')
    status_filtro = request.args.get('status', 'Aberto') # Padrão para 'Aberto' na triagem
    data_filtro = request.args.get('data', 'Todos')
    order_by = request.args.get('order_by', 'dataAbertura')
    direction = request.args.get('direction', 'asc')

    query = Chamado.query.filter(Chamado.status_Chamado == 'Aberto')  # Sempre filtra por 'Aberto' para triagem

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

    # Evitar N+1 carregando solicitante junto
    query = query.options(joinedload(Chamado.solicitante))
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
    # triagem só é acessível por perfis de atendimento, então is_staff será True
    is_staff = True
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
                           pendentes_mais_24h=pendentes_mais_24h,
                           is_staff=is_staff)

@bp.route('/transferir/<int:chamado_id>', methods=['GET', 'POST'])
@requires_roles('supervisor', 'n1', 'n2')
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
        prioridade = (request.form.get('prioridade') or '').strip()
        destino = (request.form.get('transferir') or '').strip()
        comentario = (request.form.get('comentario') or '').strip()

        alteracoes = []

        # Atualiza prioridade se fornecida e diferente
        if prioridade and prioridade != chamado.prioridade_Chamado:
            chamado.prioridade_Chamado = prioridade
            alteracoes.append('prioridade')

        # Comentário de triagem: anexa ao final da descrição mantendo histórico
        if comentario:
            try:
                marcador = datetime.now().strftime('%d/%m/%Y %H:%M')
            except Exception:
                marcador = 'agora'
            autor = session.get('usuario_nome', 'Sistema')
            bloco_comentario = f"\n\n[Triagem {marcador} por {autor}]: {comentario}"
            chamado.descricao_Chamado = (chamado.descricao_Chamado or '') + bloco_comentario
            alteracoes.append('comentário')

        # Lógica de transferência / triagem
        redirect_to = url_for('chamados.triagem')
        destino_label = None
        # Validação obrigatória de seleção de destino (N1 ou N2)
        destinos_validos = {'setor-ti-n1', 'setor-ti-n2'}
        if destino not in destinos_validos:
            flash('Selecione o setor (TI N1 ou TI N2) para encaminhar antes de salvar a triagem.', 'danger')
            user = {'name': session.get('usuario_nome', 'Usuário')}
            # Reapresenta formulário com valores escolhidos (sem persistir)
            return render_template('transferir_chamado.html', chamado=chamado, user=user,
                                   comentario_tmp=comentario, prioridade_tmp=prioridade)

        if destino == 'setor-triagem':  # (mantido para compatibilidade, ainda que não usado agora)
            chamado.status_Chamado = 'Aberto'
            chamado.atendenteID = None
            alteracoes.append('devolvido à triagem')
        elif destino in {'setor-ti-n1', 'setor-ti-n2'}:
            # Marca como Em Atendimento e indica setor destino (não atribuímos um atendente específico)
            chamado.status_Chamado = 'Em Atendimento'
            # Limpa atendenteID porque o chamado foi encaminhado ao setor, não a um usuário específico
            chamado.atendenteID = None
            destino_label = 'TI N1' if destino.endswith('n1') else 'TI N2'
            # Persiste indicação de destino de forma simples (marca na categoria para evitar migrações de esquema)
            # Normaliza categoria para incluir uma tag de destino não ambígua
            atual_categoria = chamado.categoria_Chamado or ''
            # Remove tags antigas de destino, se existirem
            import re
            atual_categoria = re.sub(r"##destino:ti_n[12]##", "", atual_categoria or '', flags=re.IGNORECASE).strip()
            destino_tag = f"##destino:ti_{'n1' if destino.endswith('n1') else 'n2'}##"
            # Acrescenta a tag de destino ao final, com espaço separador
            chamado.categoria_Chamado = (atual_categoria + ' ' + destino_tag).strip()
            alteracoes.append(f'transferido para {destino_label}')
            # Redireciona para página de confirmação de triagem
            redirect_to = url_for('chamados.confirmacao_triagem', chamado_id=chamado_id,
                                   encaminhado=destino_label, comentario=comentario,
                                   prioridade=(prioridade or chamado.prioridade_Chamado))
        # (remoção da opção de salvar sem destino)

        # Timestamp de modificação
        try:
            chamado.dataUltimaModificacao = get_sao_paulo_time()
        except Exception:
            chamado.dataUltimaModificacao = datetime.now()

        db.session.commit()
        if alteracoes:
            # Mensagem de confirmação incluindo (quando houver) encaminhamento e comentário
            base_msg = 'Atualizações na triagem: ' + ', '.join(alteracoes)
            if comentario:
                base_msg += f" | Comentário adicionado: '{comentario}'"
            flash(base_msg, 'success')
        else:
            flash('Nenhuma alteração aplicada.', 'info')
        return redirect(redirect_to)


    # alterar_afetado moved to top-level route (below)

    # GET: suporte a re-população após erro
    comentario_tmp = request.args.get('comentario_tmp', '')
    prioridade_tmp = request.args.get('prioridade_tmp')
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('transferir_chamado.html', chamado=chamado, user=user,
                           comentario_tmp=comentario_tmp, prioridade_tmp=prioridade_tmp)

@bp.route('/triar/<int:chamado_id>')
@requires_roles('supervisor', 'n1', 'n2')
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
    """Renderiza a página de atendimento de um chamado específico.

    Regras de acesso:
    - Perfis de atendimento (staff) têm acesso total (podem transferir, encerrar e enviar mensagens).
    - Atendente associado ao chamado (atendenteID) tem acesso total.
    - Solicitante do chamado pode acessar somente se o chamado estiver em "Em Atendimento" e terá visão somente leitura (não envia mensagens nem executa ações de transferência/encerramento).
    - Demais usuários: acesso negado.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)

    usuario_id = session.get('usuario_id')
    usuario = Usuario.query.get(usuario_id)
    cargo = (usuario.cargo or '').lower() if usuario and usuario.cargo else ''
    # Staff: supervisor, n1, n2
    is_staff = (cargo in {'supervisor','n1','n2'})
    is_atendente = chamado.atendenteID == usuario_id
    is_solicitante = chamado.solicitanteID == usuario_id

    # Permissões de acesso
    if not (is_staff or is_atendente or is_solicitante):
        flash('Você não tem permissão para acessar o atendimento deste chamado.', 'danger')
        return redirect(url_for('chamados.ver_chamados'))

    # Pode transferir se for supervisor ou nível (n1/n2)
    can_transfer = is_staff
    # Pode encerrar se for staff ou atendente associado
    can_encerrar = is_staff or is_atendente
    # Pode enviar mensagens: staff, atendente ou solicitante
    can_send = is_staff or is_atendente or is_solicitante

    # Parâmetros vindos de uma triagem recém-salva para exibir confirmação
    user = {'name': session.get('usuario_nome', 'Usuário')}
    # Mantém compatibilidade com template antigo usando can_manage (transferir + encerrar)
    can_manage = can_transfer or can_encerrar
    return render_template('atender_chamado.html', chamado=chamado, user=user,
                           can_transfer=can_transfer, can_encerrar=can_encerrar,
                           can_manage=can_manage, can_send=can_send)

@bp.route('/confirmacao_triagem/<int:chamado_id>')
@requires_roles('supervisor', 'n1', 'n2')
def confirmacao_triagem(chamado_id):
    """Tela de feedback após salvar triagem.
    Exibe destino (setor), ID, título, comentário e prioridade com botões de ações.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    encaminhado = request.args.get('encaminhado', 'Não informado')
    comentario = request.args.get('comentario', '').strip()
    prioridade = request.args.get('prioridade', chamado.prioridade_Chamado)
    user = {'name': session.get('usuario_nome', 'Usuário')}
    return render_template('triagem_confirmacao.html', chamado=chamado, encaminhado=encaminhado,
                           comentario=comentario, prioridade=prioridade, user=user)

@bp.route('/anexo/<int:chamado_id>')
def baixar_anexo(chamado_id):
    """Fornece download seguro do anexo de um chamado se o usuário tiver permissão.

    Regras de acesso:
    - Solicitante do chamado
    - Atendente associado
    - Perfis de atendimento (staff)
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    usuario_id = session.get('usuario_id')
    usuario = Usuario.query.get(usuario_id)
    cargo = (usuario.cargo or '').lower() if usuario else ''
    staff_roles = STAFF_ROLES

    autorizado = (
        usuario_id == chamado.solicitanteID or
        usuario_id == chamado.atendenteID or
        cargo in staff_roles
    )
    if not autorizado:
        flash('Você não tem permissão para acessar este anexo.', 'danger')
        return redirect(url_for('chamados.ver_chamados'))

    if not chamado.anexo_Chamado:
        flash('Chamado não possui anexo.', 'warning')
        return redirect(url_for('chamados.ver_chamados'))

    filename = chamado.nome_anexo or f"anexo_{chamado.chamado_ID}"
    # Tentativa simples de inferir mimetype
    import mimetypes
    mime_type, _ = mimetypes.guess_type(filename)
    mime_type = mime_type or 'application/octet-stream'
    return send_file(BytesIO(chamado.anexo_Chamado), as_attachment=True, download_name=filename, mimetype=mime_type)

@bp.route('/encerrar/<int:chamado_id>', methods=['POST'])
def encerrar_chamado(chamado_id):
    """
    Encerra um chamado, alterando seu status para 'Resolvido'.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    # Verifica permissões similares à view de atendimento
    chamado = Chamado.query.get_or_404(chamado_id)

    usuario_id = session.get('usuario_id')
    usuario = Usuario.query.get(usuario_id)
    cargo = (usuario.cargo or '').lower() if usuario and usuario.cargo else ''
    is_staff = (cargo in {'supervisor','n1','n2'})
    is_atendente = chamado.atendenteID == usuario_id

    # Somente staff ou o atendente associado podem encerrar
    if not (is_staff or is_atendente):
        flash('Você não tem permissão para encerrar este chamado.', 'danger')
        return redirect(url_for('chamados.atender_chamado', chamado_id=chamado_id))

    # Marca como resolvido e atualiza timestamp
    chamado.status_Chamado = 'Resolvido'
    try:
        chamado.dataUltimaModificacao = get_sao_paulo_time()
    except Exception:
        chamado.dataUltimaModificacao = datetime.now()
    db.session.commit()

    # Recupera histórico de interações para exibição após o encerramento
    interacoes = Interacao.query.filter_by(chamado_id=chamado_id).order_by(Interacao.data_criacao.asc()).all()

    user = {'name': session.get('usuario_nome', 'Usuário')}
    # Permissão para reabrir: solicitante ou staff
    is_solicitante = (chamado.solicitanteID == usuario_id)
    can_reopen = is_staff or is_solicitante
    flash('Chamado encerrado com sucesso.', 'success')
    return render_template('chamado_encerrado.html', chamado=chamado, interacoes=interacoes, user=user, can_reopen=can_reopen)

@bp.route('/devolver_triagem/<int:chamado_id>')
@requires_roles('supervisor', 'n1', 'n2')
def devolver_triagem(chamado_id):
    """
    Devolve um chamado para a triagem.
    - Altera o status do chamado para 'Aberto'.
    - Remove o atendente associado ao chamado.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    # autorização verificada pelo decorator

    chamado = Chamado.query.get_or_404(chamado_id)
    chamado.status_Chamado = 'Aberto'
    chamado.atendenteID = None  # Remove o atendente
    db.session.commit()
    
    flash('Chamado devolvido para a triagem com sucesso!', 'success')
    return redirect(url_for('chamados.triagem'))


@bp.route('/alterar_afetado/<int:chamado_id>', methods=['POST'])
@requires_roles('supervisor', 'n1', 'n2')
def alterar_afetado(chamado_id):
    """
    Atualiza o campo 'Quem esse chamado afeta' (categoria_Chamado) a partir de um formulário.
    Apenas perfis de atendimento podem alterar esse campo via triagem/transferência.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    afetado = request.form.get('afetado')
    if afetado:
        chamado.categoria_Chamado = afetado
        try:
            chamado.dataUltimaModificacao = get_sao_paulo_time()
        except Exception:
            chamado.dataUltimaModificacao = datetime.now()
        db.session.commit()
        flash('Campo "Quem esse chamado afeta" atualizado.', 'success')

    return redirect(url_for('chamados.triagem'))

@bp.route('/alterar_prioridade/<int:chamado_id>', methods=['POST'])
@requires_roles('supervisor', 'n1', 'n2')
def alterar_prioridade(chamado_id):
    """Atualiza a prioridade de um chamado a partir do modal de triagem.

    Regras:
    - Somente perfis de atendimento podem alterar.
    - Valida prioridade contra lista permitida.
    - Atualiza dataUltimaModificacao para métricas.
    """
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    chamado = Chamado.query.get_or_404(chamado_id)
    nova_prioridade = (request.form.get('prioridade') or '').strip()
    prioridades_validas = {"Não Classificada", "Baixa", "Média", "Alta"}

    if not nova_prioridade:
        flash('Prioridade ausente na requisição.', 'warning')
        return redirect(url_for('chamados.triagem'))

    if nova_prioridade not in prioridades_validas:
        flash('Prioridade inválida.', 'danger')
        return redirect(url_for('chamados.triagem'))

    # Aplica atualização somente se houve alteração
    if chamado.prioridade_Chamado != nova_prioridade:
        chamado.prioridade_Chamado = nova_prioridade
        try:
            chamado.dataUltimaModificacao = get_sao_paulo_time()
        except Exception:
            chamado.dataUltimaModificacao = datetime.now()
        db.session.commit()
        flash('Prioridade atualizada com sucesso.', 'success')
    else:
        flash('Prioridade mantida (sem alterações).', 'info')

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

    usuario_id = session.get('usuario_id')
    usuario = Usuario.query.get(usuario_id)
    cargo = (usuario.cargo or '').lower() if usuario and usuario.cargo else ''
    is_staff = (cargo in {'supervisor','n1','n2'})
    is_solicitante = (chamado.solicitanteID == usuario_id)
    if not (is_staff or is_solicitante):
        flash('Você não tem permissão para reabrir este chamado.', 'danger')
        return redirect(url_for('chamados.ver_chamados'))

    chamado.status_Chamado = 'Aberto'
    chamado.atendenteID = None  # Remove o atendente
    try:
        chamado.dataUltimaModificacao = get_sao_paulo_time()
    except Exception:
        chamado.dataUltimaModificacao = datetime.now()
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

        chamado = Chamado.query.get(chamado_id)
        if not chamado:
            return jsonify({"erro": "Chamado não encontrado"}), 404

        usuario_id = session.get('usuario_id')
        usuario = Usuario.query.get(usuario_id)
        cargo = (usuario.cargo or '').lower() if usuario and usuario.cargo else ''
        # Unificar critérios de staff com as constantes globais
        staff_roles = STAFF_ROLES

        is_solicitante = chamado.solicitanteID == usuario_id
        autorizado_envio = (chamado.atendenteID == usuario_id) or (cargo in staff_roles) or is_solicitante
        if not autorizado_envio:
            return jsonify({"erro": "Não autorizado a enviar mensagens para este chamado"}), 403

        nova_interacao = Interacao(chamado_id=chamado_id, usuario_id=usuario_id, mensagem=data['mensagem'])
        db.session.add(nova_interacao)
        db.session.commit()
        return jsonify({"mensagem": "Mensagem enviada com sucesso!"}), 201

@bp.route('/relatorio/pdf')
@requires_roles('supervisor')
def gerar_relatorio_pdf():
    """ (Placeholder) Rota para a futura implementação da geração de relatórios em PDF. """
    # Parâmetros: intervalo (dias) e status
    if 'usuario_id' not in session:
        return redirect(url_for('main.index'))

    try:
        intervalo = int(request.args.get('intervalo')) if request.args.get('intervalo') else None
    except Exception:
        intervalo = None
    status_param = (request.args.get('status') or 'todos').strip().lower()

    query = Chamado.query
    # Filtra por intervalo de dias, se fornecido
    if intervalo and intervalo > 0:
        inicio = datetime.now() - timedelta(days=intervalo)
        query = query.filter(Chamado.dataAbertura >= inicio)

    # Filtra por status textual (quando não for 'todos')
    if status_param and status_param != 'todos':
        # Faz uma busca case-insensitive por conter o termo informado
        query = query.filter(Chamado.status_Chamado.ilike(f"%{status_param}%"))

    # Evita N+1
    query = query.options(joinedload(Chamado.solicitante))
    chamados = query.order_by(Chamado.dataAbertura.desc()).all()

    # Gera PDF simples com sumário dos chamados
    try:
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Relatório de Chamados - UpDesk', ln=True)
        pdf.set_font('Arial', '', 10)
        intervalo_text = f"Últimos {intervalo} dias" if intervalo else 'Todos'
        pdf.cell(0, 8, f"Intervalo: {intervalo_text}    |    Status filter: {status_param}", ln=True)
        pdf.ln(4)

        if not chamados:
            pdf.cell(0, 8, 'Nenhum chamado encontrado para os filtros informados.', ln=True)
        else:
            # Cabeçalho da tabela
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(12, 8, 'ID', 1)
            pdf.cell(70, 8, 'Título', 1)
            pdf.cell(40, 8, 'Solicitante', 1)
            pdf.cell(30, 8, 'Status', 1)
            pdf.cell(28, 8, 'Prioridade', 1)
            pdf.ln()

            pdf.set_font('Arial', '', 9)
            for c in chamados:
                # Valores
                cid = str(c.chamado_ID)
                titulo = (c.titulo_Chamado or '')
                solicitante = (c.solicitante.nome if c.solicitante else 'N/A')
                status = (c.status_Chamado or '')
                prioridade = (c.prioridade_Chamado or '')

                # Trunca textos longos para caber na célula
                def trunc(text, length):
                    return (text[:length-3] + '...') if text and len(text) > length else (text or '')

                pdf.cell(12, 8, cid, 1)
                pdf.cell(70, 8, trunc(titulo, 60), 1)
                pdf.cell(40, 8, trunc(solicitante, 30), 1)
                pdf.cell(30, 8, trunc(status, 20), 1)
                pdf.cell(28, 8, trunc(prioridade, 18), 1)
                pdf.ln()

        # Produz bytes do PDF e retorna como attachment
        pdf_bytes = pdf.output(dest='S').encode('latin-1')
        buf = BytesIO(pdf_bytes)
        buf.seek(0)
        return send_file(buf, as_attachment=True, download_name='relatorio_chamados.pdf', mimetype='application/pdf')
    except Exception as e:
        current_app.logger.exception(f"Erro ao gerar PDF: {e}")
        flash('Erro ao gerar o relatório em PDF. Veja logs para detalhes.', 'danger')
        return redirect(url_for('chamados.ver_chamados'))
