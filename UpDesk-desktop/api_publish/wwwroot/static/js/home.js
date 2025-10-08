// /static/js/home.js

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
});

async function fetchDashboardStats() {
    try {
        // ATENÇÃO: Este endpoint '/api/dashboard/stats' precisa ser criado no seu backend C#.
        const response = await fetchWithAuth('/api/dashboard/stats');

        if (!response.ok) {
            // Se a resposta não for OK, exibe um erro no console.
            console.error('Erro ao buscar estatísticas do dashboard:', response.status, response.statusText);
            // Você pode querer exibir uma mensagem de erro para o usuário na página aqui.
            return;
        }

        const stats = await response.json();

        // Atualiza a interface com os dados recebidos da API.
        document.getElementById('chamados-abertos-count').textContent = stats.chamadosAbertos || 0;
        document.getElementById('chamados-em-triagem-count').textContent = stats.chamadosEmTriagem || 0;
        document.getElementById('chamados-solucao-ia-count').textContent = stats.chamadosSolucaoIA || 0;
        document.getElementById('chamados-finalizados-count').textContent = stats.chamadosFinalizados || 0;

    } catch (error) {
        // Captura erros de rede ou da função fetchWithAuth (ex: token inválido).
        console.error('Falha ao carregar estatísticas do dashboard:', error);
    }
}