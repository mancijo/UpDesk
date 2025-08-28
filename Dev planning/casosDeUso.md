# Casos de Uso e Requisitos do UpDesk

---

## 1. Requisitos dos Usuários

Estes são os objetivos e necessidades dos diferentes tipos de usuários do sistema.

* **Colaboradores:** Precisam de uma forma simples para abrir e acompanhar seus próprios chamados.
* **Analistas de Triagem:** Devem ter uma visão geral de todos os chamados pendentes para poder validá-los e classificá-los corretamente.
* **Técnicos de Suporte (N1 e N2):** Precisam receber e atender chamados com base no nível de complexidade e nas suas especializações.
* **Supervisores:** Necessitam de acesso a relatórios de desempenho, permissão para redefinir senhas e a capacidade de acompanhar todo o fluxo de trabalho.
* **Todos os Usuários:** Devem poder interagir com um chatbot inteligente para obter suporte inicial e soluções automáticas.

---

## 2. Requisitos Funcionais

Estas são as funções e comportamentos que o sistema deve executar para atender aos requisitos dos usuários.

### Autenticação e Cadastro
* O sistema deve permitir o cadastro de usuários apenas com e-mails corporativos.
* A autenticação de usuários deve ser feita através de e-mail e senha.
* Deve haver uma função para redefinição de senha, solicitada pelo usuário e aprovada por um supervisor.

### Gestão de Perfis
* O sistema deve diferenciar o acesso e as funcionalidades de acordo com o perfil do usuário: Usuário Padrão, Triagem, Suporte N1/N2 e Supervisor.

### Abertura e Gerenciamento de Chamados
* Os usuários devem ser capazes de abrir chamados utilizando a IA do UpDesk ou o chatbot.
* A IA deve analisar o conteúdo do chamado e sugerir soluções automáticas.
* Se a IA não conseguir resolver, o chamado deve ser encaminhado automaticamente para a triagem.
* A triagem deve poder validar ou reclassificar o chamado.
* Os chamados devem ser encaminhados para o nível de suporte (N1 ou N2) apropriado após a validação.
* Chamados resolvidos pela IA devem ser identificados com um selo "Resolvido IA UPDESK".

### Chatbot Inteligente
* O chatbot deve ser exibido na tela inicial (home) após o login do usuário.
* Ele deve ser capaz de coletar informações do usuário e abrir um chamado automaticamente.
* O chatbot deve se integrar com a IA para análise e sugestão de soluções.

### Histórico e Relatórios
* Cada usuário deve ter acesso ao histórico completo de seus próprios chamados.
* O sistema deve gerar relatórios detalhados para supervisores, incluindo:
    * Tempo médio de resolução.
    * Categorias de chamados mais frequentes.
    * Métricas de efetividade da IA.

### Controle de Status
* O status de cada chamado deve ser atualizado automaticamente: Aguardando triagem → Em análise → Em atendimento → Resolvido.
* O sistema deve registrar automaticamente a data e a hora de cada mudança de status.

---

## 3. Requisitos Não-Funcionais

Estes são os critérios de qualidade e as restrições que o sistema deve cumprir.

* **Segurança:** A autenticação é obrigatória e apenas e-mails corporativos são permitidos. Os dados de chamados e usuários devem estar protegidos de acordo com a LGPD.
* **Disponibilidade:** O sistema deve estar disponível 99,5% do tempo, exceto em manutenções programadas.
* **Escalabilidade:** Deve ser capaz de suportar um aumento no número de chamados e usuários sem perda de desempenho.
* **Confiabilidade:** O sistema não deve perder dados em caso de falhas.
* **Acessibilidade:** Deve ser compatível com leitores de tela e seguir os padrões de acessibilidade WCAG 2.1.
* **Compatibilidade:** O acesso deve ser garantido através dos navegadores modernos como Chrome, Edge e Firefox.

---

## 4. Requisitos do Sistema

Estas são as características técnicas esperadas para a solução.

### Usabilidade
* A interface deve ser intuitiva, responsiva e fornecer feedback visual claro ao usuário.

### Desempenho
* O sistema deve responder a todas as ações do usuário em menos de 2 segundos.

### Capacidade
* O sistema deve suportar até 100 usuários simultâneos no ambiente controlado da instituição.
* O banco de dados deve ser capaz de armazenar com segurança até 1.000 chamados, incluindo seus históricos e interações com a IA.

### Manutenibilidade
* O código deve ser modular e fácil de ser atualizado e corrigido.

### Portabilidade
* O sistema deve funcionar em diferentes plataformas como Windows, Linux, Android e iOS via web.

### Monitoramento
* Deve existir um log de atividades e falhas visível para os administradores.

### Inteligência Artificial
* A IA deve ser treinada usando o histórico de chamados e o contexto técnico para garantir sugestões de soluções e categorização precisas.
