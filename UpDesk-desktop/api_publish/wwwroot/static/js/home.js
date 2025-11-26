// /static/js/home.js

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

            if (!usuario || !usuario.cargo) {
                console.warn("Usuário não encontrado ou sem cargo definido.");
                return;
            }


const cargo = usuario.cargo.trim().toLowerCase();
            console.log(`Permissões carregadas para o cargo: ${cargo}`);

            // Oculta todos inicialmente
            const btnGerUsuarios = document.getElementById('btn-gerenciar-usuarios');
            const btnTriagem = document.getElementById('btn-triagem');
            const btnMonitoramento = document.getElementById('btn-monitoramento');

            // Define permissões
            switch (cargo) {
                case 'supervisor':
                case 'administrador':
                    // Acesso total — todos os botões visíveis
                    break;

                case 'tecnico N1':
                case 'tecnico N2':
                    if (btnGerUsuarios) btnGerUsuarios.style.display = 'none'; // sem acesso a gerenciamento
                    if (btnTriagem) btnTriagem.style.display = 'none'; // sem acesso ao painel de triagem
                    break;

                case 'aux. administrativo':
                    if (btnGerUsuarios) btnGerUsuarios.style.display = 'none';
                    if (btnTriagem) btnTriagem.style.display = 'none';
                    break;

                case 'triagem':
                    if (btnGerUsuarios) btnGerUsuarios.style.display = 'none';
                    break;

                default:
                    console.warn(`Cargo '${cargo}' não reconhecido — aplicando acesso mínimo.`);
                    if (btnGerUsuarios) btnGerUsuarios.style.display = 'none';
                    if (btnTriagem) btnTriagem.style.display = 'none';
                    break;
            }

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
});