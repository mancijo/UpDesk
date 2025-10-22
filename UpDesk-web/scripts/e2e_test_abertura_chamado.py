import os
import sys
this_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(this_dir, '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app import create_app
from app.models import db, Chamado
from app.models import Usuario
from io import BytesIO

app = create_app()
app.config['TESTING'] = True
# Disable CSRF for test client (forms use Flask-WTF)
app.config['WTF_CSRF_ENABLED'] = False
# Use a temporary sqlite in-memory DB for tests if possible; otherwise use existing DB
# We'll try to use the app's current DB but wrap actions in a transaction and rollback where possible.

with app.app_context():
    client = app.test_client()

    def ensure_user_in_session(c):
        # ensure we have a valid usuario in DB and set session accordingly
        user = Usuario.query.filter_by(email='e2e_test@example.com').first()
        if not user:
            user = Usuario(nome='Teste E2E', email='e2e_test@example.com', telefone='0000', setor='TI', cargo='Tester', senha='x')
            db.session.add(user)
            db.session.commit()
        with c.session_transaction() as sess:
            sess['usuario_id'] = user.id
            sess['usuario_nome'] = user.nome

    # Helper to count chamados
    def count_chamados():
        return Chamado.query.count()

    print('Chamados before:', count_chamados())

    # 1) Submeter sem anexo
    ensure_user_in_session(client)
    data = {
        'titulo': 'E2E Test - sem anexo',
        'descricao': 'Descrição de teste sem anexo',
        # must match choices defined in chamadoForm: 'Eu', 'Meu setor', 'Empresa ao todo'
        'afetado': 'Eu',
        'prioridade': 'Média'
    }
    # POST to abrir (form validate_on_submit expects CSRF? If WTForms CSRF enabled, form may fail. We will post and inspect response.)
    resp = client.post('/chamados/abrir', data=data, follow_redirects=True)
    print('\nPOST /chamados/abrir status_code:', resp.status_code)
    txt = resp.get_data(as_text=True)
    # Check presence of IA fallback message or solution marker
    fallback_msg = 'Não foi possível obter uma sugestão da IA no momento'
    print('Contains fallback?', fallback_msg in txt)
    # Debug: print small slice of response to inspect form errors if any
    print('Response snippet:', txt[:500])

    # After POST, session should have 'chamado_temporario'
    with client.session_transaction() as sess:
        temp = sess.get('chamado_temporario')
    print('chamado_temporario in session?', temp is not None)

    # Confirm opening
    ensure_user_in_session(client)
    # call confirmar_abertura (POST)
    resp2 = client.post('/chamados/confirmar_abertura', follow_redirects=True)
    print('/confirmar_abertura status:', resp2.status_code)
    print('Chamados after (1):', count_chamados())

    # 2) Submeter com anexo
    ensure_user_in_session(client)
    data2 = {
        'titulo': 'E2E Test - com anexo',
        'descricao': 'Descrição de teste com anexo',
        # valid choice
        'afetado': 'Meu setor',
        'prioridade': 'Alta'
    }
    file_stream = (BytesIO(b'Test file content'), 'test.txt')
    resp3 = client.post('/chamados/abrir', data={**data2, 'anexo': file_stream}, content_type='multipart/form-data', follow_redirects=True)
    print('\nPOST /chamados/abrir (com anexo) status_code:', resp3.status_code)
    txt3 = resp3.get_data(as_text=True)
    print('Contains fallback?', fallback_msg in txt3)
    with client.session_transaction() as sess:
        temp2 = sess.get('chamado_temporario')
    print('chamado_temporario with anexo?', temp2 is not None and temp2.get('anexo') is not None)

    # Confirm opening second
    ensure_user_in_session(client)
    resp4 = client.post('/chamados/confirmar_abertura', follow_redirects=True)
    print('/confirmar_abertura status:', resp4.status_code)
    print('Chamados after (2):', count_chamados())

    # Finally check listing contains our titles
    ensure_user_in_session(client)
    resp_list = client.get('/chamados/ver')
    page_txt = resp_list.get_data(as_text=True)
    print('\n/chamados/ver status:', resp_list.status_code)
    print('Contains title 1?', 'E2E Test - sem anexo' in page_txt)
    print('Contains title 2?', 'E2E Test - com anexo' in page_txt)

    # Cleanup: remove chamados de teste
    testes = Chamado.query.filter(Chamado.titulo_Chamado.like('E2E Test%')).all()
    for cobj in testes:
        db.session.delete(cobj)
    db.session.commit()
    print('\nCleaned up test chamados; Done')
