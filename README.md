# 📌 UpDesk

## 📝 Descrição do Desafio
O **UpDesk** tem como objetivo resolver uma dor comum de empresas e setores de TI: **a dificuldade na triagem, priorização e acompanhamento de chamados de suporte**. 
Muitas vezes, usuários enfrentam demora no atendimento devido à falta de organização, categorização incorreta ou sobrecarga de analistas. 
O UpDesk propõe uma solução inovadora com **inteligência artificial integrada**, permitindo a sugestão automática de soluções, categorização de chamados e direcionamento para o nível adequado de suporte.

---

## 📋 Backlog do Produto

### [Clique aqui para backlog](https://github.com/mancijo/UpDesk/blob/main/Dev%20planning/backlogSprint.txt)

---

## 📅 Cronograma de Evolução
- **Etapa 1** → Levantamento de requisitos e modelagem inicial 
- **Etapa 2** → Protótipos em baixa, média e alta fidelidade (Figma) 
- **Etapa 3** → Implementação da interface web e modelagem do banco
- **Etapa 4** → Implementação do sistema Desktop e Android

---

## 📊 Cronograma de Sprints
Este documento detalha o cronograma do projeto, dividindo as tarefas por semana e por time (Desenvolvimento Web e ServerSide).

| Data | Time | Tarefas |
| :--- | :--- | :--- |
| **19/08/2025** | **Desenvolvimento Web (Front-End)** | **Kaique**: Implementação da tela de login.<br>**Mariozan**: Implementação da tela inicial para o supervisor.<br>**Filipe**: Desenvolvimento do card de perfil.<br>**Andrei**: Desenvolvimento do card para chamados enviados. |
| | **ServerSide (Back-End)** | **Jonatas**: Desenvolvimento do CRUD (Create, Read, Update, Delete) para o chat, utilizando MySQL.<br>**Matheus**: Desenvolvimento do CRUD para perfis, utilizando MySQL. |
| **26/08/2025** | **Desenvolvimento Web (Front-End)** | Desenvolvimento do card para editar perfis.<br>Desenvolvimento do card de confirmação para excluir usuário.<br>Desenvolvimento do card de confirmação de identidade.<br>Implementação da tela de gerenciamento de usuários.<br>Desenvolvimento do formulário de abertura de chamado.<br>Implementação da tela de solução sugerida pela IA (Up Desk).<br>Implementação da tela de chamado resolvido (Up Desk). |
| | **ServerSide (Back-End)** | Definição da estrutura JSON da API.<br>Desenvolvimento do servidor de requisições.<br>Implementação da validação de login. |
| **02/09/2025** | **Desenvolvimento Web (Front-End)** | Desenvolvimento do painel de triagem.<br>Desenvolvimento do card de dados do chamado.<br>Desenvolvimento do card de dados do chamado na triagem.<br>Desenvolvimento do card para aprovar ações da IA.<br>Desenvolvimento do card de prioridade do chamado.<br>Desenvolvimento do card de confirmação de transferência de chamado.<br>Desenvolvimento do card de feedback de transferência de chamado.<br>Implementação do painel de visualização de chamados.<br>Desenvolvimento do card de informações dos chamados. |

### [Clique aqui para o cronograma](https://github.com/mancijo/UpDesk/blob/main/Dev%20planning/sprintPlanning.md) 

---

## 🛠 Tecnologias Utilizadas
- **Backend**: Python
- **Banco de Dados**: MYSQL Server  
- **Frontend**: HTML, CSS, JavaScript  
- **Protótipos**: Figma  
- **Versionamento**: GitHub  
- **Metodologia**: Scrum  

---

## ▶️ Como Executar, Usar e Testar o Projeto
1. Clone este repositório:  
   ```bash
   git clone [https://github.com/mancijo/UpDesk.git](https://github.com/mancijo/UpDesk.git)
   ```
2. Configure o banco de dados no MS SQL Server utilizando os scripts em `/db`.
3. Abra o projeto no Visual Studio e restaure as dependências.
4. Execute a aplicação localmente.
5. Para testes, utilize os casos definidos em `/tests`.

---

## 📑 Documentação
Este documento reúne:

- Modelagem do banco de dados
- Diagramas UML
- Planejamentos de sprint
- Roteiros de teste
- Políticas de LGPD

---

## ✅ DoR (Definition of Ready)
Critérios que devem estar prontos antes que uma história entre em desenvolvimento:

- História descrita claramente.
- Critérios de aceitação definidos.
- Protótipo ou diagrama associado (quando necessário).
- Dependências mapeadas.
- Estimativa realizada pela equipe.

---

## ✅ DoD (Definition of Done)
Critérios para considerar uma história finalizada:

- Código desenvolvido, revisado e integrado.
- Testes unitários executados e aprovados.
- Critérios de aceitação atendidos.
- Documentação atualizada.
- Deploy interno validado.

---

## 📘 Manual do Usuário
### [Manual do usuário](https://github.com/mancijo/UpDesk/blob/main/Documentation/Manual%20do%20Usu%C3%A1rio.docx)
---

## 👥 Equipe do Projeto
- **Product Owner (PO):** Jonatas Santos  
- **Scrum Master:** Andrei Mancijo  
- **Dev Team:**
    - Mariozan Damasceno Lacerda Júnior  
    - Mateus Teodoro  
    - Kaique Batista da Silva  
    - Filipe Vitor dos Santos  
