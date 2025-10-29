// /static/js/modal-handler.js

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona um listener de evento no corpo do documento para capturar cliques nos botões de visualização
    // Isso funciona para botões que já existem na página (Monitoramento) e para os que são criados dinamicamente (Triagem)
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('.visualizar-btn')) {
            fetchAndPopulateDetailsModal(event.target);
        }
    });
});

/**
 * Busca os detalhes completos de um chamado na API e preenche o modal.
 * @param {HTMLButtonElement} button O botão que foi clicado.
 */
async function fetchAndPopulateDetailsModal(button) {
    const chamadoId = button.dataset.id;
    if (!chamadoId || chamadoId === 'undefined') {
        console.error("ID do chamado inválido ou não encontrado no botão.", button);
        alert("Não foi possível carregar os detalhes: ID do chamado não encontrado.");
        return;
    }

    try {
        // CORREÇÃO: Usar a função fetchWithAuth para lidar com a URL e autenticação
        const response = await fetchWithAuth(`/api/chamados/${chamadoId}`);

        if (!response.ok) {
            throw new Error('Falha ao carregar os detalhes do chamado.');
        }
        const chamado = await response.json();

        // CORREÇÃO: Usar camelCase para acessar as propriedades do JSON
        const dataAbertura = new Date(chamado.dataAbertura).toLocaleString('pt-BR'); // Este já estava correto

        // Preenche os campos do modal
        document.getElementById('modal-titulo').textContent = chamado.tituloChamado || 'Não informado';
        document.getElementById('modal-data-abertura').textContent = `Aberto em: ${dataAbertura}`;
        document.getElementById('modal-solicitante-nome').textContent = chamado.solicitanteNome || 'Não informado'; // Já estava correto
        document.getElementById('modal-solicitante-email').textContent = chamado.solicitanteEmail || 'Não informado'; // Já estava correto
        document.getElementById('modal-solicitante-ramal').textContent = chamado.solicitanteTelefone || 'Não informado'; // Já estava correto
        document.getElementById('modal-status').textContent = chamado.statusChamado || 'Não informado';
        document.getElementById('modal-categoria').textContent = chamado.categoriaChamado || 'Não informado';
        document.getElementById('modal-descricao').textContent = chamado.descricaoChamado || 'Não informado';

        // Atualiza o link do botão "Atender Chamado" no modal
        const atenderLink = document.getElementById('modal-atender-chamado-link');
        if(atenderLink) {
            atenderLink.href = `/templates/atender_chamado.html?id=${chamado.chamadoId}`;
        }

    } catch (error) {
        console.error("Erro ao buscar ou popular detalhes do chamado:", error);
        alert(error.message);
    }
}