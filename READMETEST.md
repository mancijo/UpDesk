# 📌 UpDesk

## 📝 Descrição do Desafio
O **UpDesk** tem como objetivo resolver uma dor comum de empresas e setores de TI: **a dificuldade na triagem, priorização e acompanhamento de chamados de suporte**.  
Muitas vezes, usuários enfrentam demora no atendimento devido à falta de organização, categorização incorreta ou sobrecarga de analistas.  
O UpDesk propõe uma solução inovadora com **inteligência artificial integrada**, permitindo a sugestão automática de soluções, categorização de chamados e direcionamento para o nível adequado de suporte.

---

## 📋 Backlog do Produto

---

## 📅 Cronograma de Evolução
- **Etapa 1** → Levantamento de requisitos e modelagem inicial  
- **Etapa 2** → Protótipos em baixa, média e alta fidelidade (Figma)  
- **Etapa 3** → Implementação da interface web e modelagem do banco  

---

## 📊 Tabela de Sprints

| Período da Sprint | Documentação | Incremento (YouTube) |
|-------------------|--------------|-----------------------|
| Sprint 1 | Planejamento inicial | [Vídeo Sprint 1](https://youtube.com/placeholder) |
| Sprint 2 | Backlog de Sprint | [Vídeo Sprint 2](https://youtube.com/placeholder) |
| Sprint 3 | Requisitos & Casos de Uso | [Vídeo Sprint 3](https://youtube.com/placeholder) |

---

## 🛠 Tecnologias Utilizadas
- **Backend**: C# (.NET)  
- **Banco de Dados**: MS SQL Server  
- **Frontend**: HTML, CSS, JavaScript  
- **Protótipos**: Figma  
- **Versionamento**: GitHub  
- **Metodologia**: Scrum  

---

## 📂 Estrutura do Projeto
UpDesk/
│── src/ # Código-fonte do sistema
│── db/ # Scripts SQL e modelagem
│── tests/ # Casos e roteiros de testes
│── README.md # Apresentação principal do projeto

---

## ▶️ Como Executar, Usar e Testar o Projeto
1. Clone este repositório:  
   ```bash
   git clone https://github.com/mancijo/UpDesk.git
   ```
2. Configure o banco de dados no MS SQL Server utilizando os scripts em `/db`.
3. Abra o projeto no Visual Studio e restaure as dependências.
4. Execute a aplicação localmente.
5. Para testes, utilize os casos definidos em `/tests`.

---

## 📑 Documentação
Este documento reúne:

- Modelagem do banco de dados
- Diagramas de casos de uso e sequência
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
### 🔐 Acesso
O usuário deve realizar login com e-mail e senha cadastrados.  
A autenticação garante o acesso às funcionalidades de acordo com a hierarquia.

### 📝 Abertura de Chamado
1. Clique em **Abrir Chamado**.  
2. Preencha os campos: título, descrição e categoria.  
3. A IA poderá sugerir soluções antes do envio.  
   - Caso o usuário aceite → o chamado é encerrado automaticamente.  
   - Caso recuse → o chamado segue para triagem.  

### 👥 Perfis de Usuário
- **Supervisor** → Gerencia usuários, acessos e relatórios.  
- **TI Nível 1** → Atende chamados de baixa/média complexidade.  
- **TI Nível 2** → Atende chamados de média/alta complexidade.  
- **Triagem** → Classifica chamados e valida ações da IA.  
- **Usuário Padrão** → Abre chamados.  
- **Inteligência Artificial** → Sugere soluções e categoriza chamados.  

### 📊 Relatórios Disponíveis
- Evolução dos chamados.  
- Desempenho dos funcionários.  
- Eficiência da IA.  
- Tendências por categoria.  
- Histórico de atendimentos.  

---

## 👥 Equipe do Projeto
- **Product Owner (PO):** Jonatas Santos  
- **Scrum Master:** Andrei Mancijo  
- **Dev Team:**  
  - Mariozan Damasceno Lacerda Júnior  
  - Mateus Teodoro  
  - Kaique Batista da Silva  
  - Filipe Vitor dos Santos  

---

👉 Agora está tudo **em um único arquivo `.md`** – você pode simplesmente salvar esse conteúdo como `README.md` e terá toda a documentação centralizada.  
