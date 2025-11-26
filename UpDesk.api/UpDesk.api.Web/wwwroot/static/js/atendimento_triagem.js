// /static/js/triagem.js

document.addEventListener("DOMContentLoaded", async () => {
    // Função para aguardar o modal estar no DOM
    async function waitForModal(selector, maxAttempts = 50) {
        for (let i = 0; i < maxAttempts; i++) {
            const el = document.querySelector(selector);
            if (el) return el;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return null;
    }

    const visualizarChamadoModal = await waitForModal('#visualizarChamadoModal');
    const comentarioInput = document.getElementById("comentarioTriagem");

    // Valida se o modal existe
    if (!visualizarChamadoModal) {
        console.error('Modal visualizarChamadoModal não encontrado no DOM após aguardar');
        alert('Erro: Modal não carregado. Recarregue a página.');
        return;
    }

    // Pega o ID da URL
    const chamadoId = new URLSearchParams(window.location.search).get("id");

    if (!chamadoId) {
        console.error('ID do chamado não fornecido na URL');
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Erro: ID não fornecido';
        return;
    }

    console.log('Carregando chamado com ID:', chamadoId);

    // Define placeholders
    visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-data-abertura').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-status').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-categoria').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-descricao').textContent = 'Carregando...';

    try {
        // Tenta buscar com fetchWithAuth se disponível, senão usa fetch direto
        const fetchFn = typeof fetchWithAuth === 'function' ? fetchWithAuth : fetch;
        const relativeEndpoint = `/api/chamados/${chamadoId}`;
        const requestUrl = new URL(relativeEndpoint, window.location.origin).toString();
        console.log('Tentando carregar chamado — URL (relativa):', requestUrl);

        let response;
        try {
            response = await fetchFn(relativeEndpoint);
        } catch (networkErr) {
            console.warn('Erro de rede ao chamar endpoint relativo:', networkErr);
            // tenta fallback para a API em localhost (porta conhecida do backend)
            const fallback = `http://localhost:5291/api/chamados/${chamadoId}`;
            console.log('Tentando fallback para API em:', fallback);
            response = await fetch(fallback, { headers: { 'Content-Type': 'application/json' } });
        }

        if (!response.ok) {
            // Se o endpoint relativo retornou 404/500, tenta fallback absoluto antes de falhar
            console.warn(`Resposta não OK do endpoint relativo: ${response.status} ${response.statusText}`);
            const fallback = `http://localhost:5291/api/chamados/${chamadoId}`;
            try {
                const fallbackResp = await fetch(fallback, { headers: { 'Content-Type': 'application/json' } });
                if (fallbackResp.ok) {
                    response = fallbackResp;
                } else {
                    throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (fbErr) {
                throw new Error(`Falha ao buscar chamado (relativo e fallback): ${fbErr.message}`);
            }
        }

        const chamado = await response.json();
        console.log('Chamado carregado:', chamado);

        // Preenche os campos do modal
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = chamado.tituloChamado || "Sem título";
        visualizarChamadoModal.querySelector('#modal-data-abertura').textContent =
            chamado.dataAbertura ? `Aberto em: ${new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}` : 'N/A';
        visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = chamado.solicitanteNome || "N/A";
        visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = chamado.solicitanteEmail || "N/A";
        visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = chamado.solicitanteTelefone || "N/A";
        visualizarChamadoModal.querySelector('#modal-status').textContent = chamado.statusChamado || "---";
        visualizarChamadoModal.querySelector('#modal-categoria').textContent = chamado.categoriaChamado || "---";
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = chamado.descricaoChamado || "Sem descrição.";

        // Atualiza link de atendimento
        const linkAtender = visualizarChamadoModal.querySelector("#modal-atender-chamado-link");
        if (linkAtender) {
            linkAtender.href = `/templates/atender_chamado.html?id=${chamado.chamadoId}`;
        }

        // Exibe o modal / container: apenas ativa o bootstrap modal se o elemento for realmente um modal
        try {
            const isBootstrapModal = visualizarChamadoModal.classList.contains('modal') || visualizarChamadoModal.getAttribute('role') === 'dialog';
            if (isBootstrapModal && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(visualizarChamadoModal);
                modal.show();
            } else {
                // Não é um modal bootstrap — apenas garante que o container esteja visível
                visualizarChamadoModal.classList.remove('d-none');
            }
        } catch (showErr) {
            console.warn('Falha ao abrir modal via Bootstrap, exibindo container sem modal:', showErr);
            visualizarChamadoModal.classList.remove('d-none');
        }

    } catch (err) {
        console.error('Erro ao carregar chamado:', err);
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Erro ao carregar chamado';
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = `Erro: ${err.message}`;
        
        // Mesmo em erro, exibe o modal / container (apenas ativa bootstrap modal se aplicável)
        try {
            const isBootstrapModal = visualizarChamadoModal.classList.contains('modal') || visualizarChamadoModal.getAttribute('role') === 'dialog';
            if (isBootstrapModal && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(visualizarChamadoModal);
                modal.show();
            } else {
                visualizarChamadoModal.classList.remove('d-none');
            }
        } catch (showErr) {
            console.warn('Falha ao abrir modal via Bootstrap no erro:', showErr);
            visualizarChamadoModal.classList.remove('d-none');
        }
    }
});

    // --- Salvamento da triagem ---
    document.addEventListener('DOMContentLoaded', () => {
        const btnSalvar = document.getElementById('btnSalvarTriagem');
        if (!btnSalvar) return;

        btnSalvar.addEventListener('click', async () => {
            try {
                btnSalvar.setAttribute('disabled', 'disabled');
                btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

                const chamadoId = new URLSearchParams(window.location.search).get('id');
                if (!chamadoId) throw new Error('ID do chamado não encontrado na URL.');

                const usuario = JSON.parse(localStorage.getItem('usuario'));
                const usuarioId = usuario ? usuario.id : null;
                if (!usuarioId) throw new Error('Usuário não autenticado. Faça login novamente.');

                // 1) Envia comentário (se houver)
                const comentario = (document.getElementById('comentarioTriagem') || {}).value || '';
                if (comentario.trim()) {
                    const respMsg = await (typeof fetchWithAuth === 'function' ? fetchWithAuth : fetch)(`/api/chamados/${chamadoId}/mensagens`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ UsuarioId: Number(usuarioId), Mensagem: comentario })
                    });

                    if (!respMsg.ok) {
                        const txt = await respMsg.text().catch(() => '');
                        console.warn('Aviso: falha ao salvar comentário:', respMsg.status, txt);
                        // não abortamos aqui — tentamos prosseguir com transfer/status
                    }
                }

                // 2) Transferência / Encaminhamento (N1 / N2)
                const encaminhar = (document.querySelector('input[name="encaminhar"]:checked') || {}).value;
                if (encaminhar === 'N1' || encaminhar === 'N2') {
                    // Busca um técnico adequado — usa /api/usuarios e escolhe primeiro com cargo contendo N1/N2
                    try {
                        const usuariosResp = await (typeof fetchWithAuth === 'function' ? fetchWithAuth : fetch)('/api/usuarios');
                        if (usuariosResp.ok) {
                            const usuarios = await usuariosResp.json();
                            const wanted = encaminhar === 'N1' ? 'n1' : 'n2';
                            const tecnico = usuarios.find(u => (u.cargo || '').toString().toLowerCase().includes(wanted));
                            if (tecnico && tecnico.id) {
                                const transferResp = await (typeof fetchWithAuth === 'function' ? fetchWithAuth : fetch)(`/api/chamados/${chamadoId}/transferir`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ NovoAtendenteId: Number(tecnico.id) })
                                });
                                if (!transferResp.ok) {
                                    const txt = await transferResp.text().catch(() => '');
                                    console.warn('Falha ao transferir chamado:', transferResp.status, txt);
                                }
                            } else {
                                console.warn('Nenhum técnico', encaminhar, 'encontrado para transferência.');
                            }
                        } else {
                            console.warn('Falha ao carregar usuários para selecionar técnico:', usuariosResp.status);
                        }
                    } catch (err) {
                        console.error('Erro ao tentar transferir (busca de técnicos):', err);
                    }
                }

                // 3) Define status como 'Aberto' (requisito do pedido do usuário)
                try {
                    const statusResp = await (typeof fetchWithAuth === 'function' ? fetchWithAuth : fetch)(`/api/chamados/${chamadoId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ NovoStatus: 'Aberto' })
                    });

                    if (!statusResp.ok) {
                        const txt = await statusResp.text().catch(() => '');
                        throw new Error(`Falha ao atualizar status: ${statusResp.status} ${txt}`);
                    }
                } catch (err) {
                    console.error('Erro ao atualizar status:', err);
                    alert('Ocorreu um erro ao atualizar o status do chamado. Verifique o console para mais detalhes.');
                    return;
                }

                // 4) Aviso sobre prioridade (o backend atual não expõe endpoint de atualização de prioridade)
                const prioridadeSelecionada = (document.querySelector('input[name="prioridade"]:checked') || {}).value;
                if (prioridadeSelecionada) {
                    console.info('Prioridade selecionada:', prioridadeSelecionada, '- Observação: o backend atual não possui endpoint para persistir prioridade.');
                }

                alert('Triagem salva com sucesso. O chamado foi atualizado para status "Aberto".');
                // volta para a lista de triagem ou refaz o carregamento
                window.location.href = '/templates/triagem.html';

            } catch (err) {
                console.error('Erro ao salvar triagem:', err);
                alert('Falha ao salvar triagem: ' + (err && err.message ? err.message : err));
            } finally {
                const btn = document.getElementById('btnSalvarTriagem');
                if (btn) {
                    btn.removeAttribute('disabled');
                    btn.innerHTML = '<i class="bi bi-check-circle"></i> Salvar Triagem';
                }
            }
        });
    });



