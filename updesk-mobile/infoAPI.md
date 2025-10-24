# UpDesk API

Bem-vindo à documentação da UpDesk API. Este é um backend construído em ASP.NET Core 8 para um sistema de help desk, projetado para gerenciar usuários, chamados e interações de forma eficiente e segura.

## Tecnologias

- **ASP.NET Core 8**: Framework para construção da API.
- **Entity Framework Core**: ORM para interação com o banco de dados.
- **SQL Server (ou outro compatível)**: Banco de dados para persistência dos dados.
- **BCrypt.Net-Next**: Para hashing seguro de senhas.
- **RESTful Principles**: Design da API seguindo os padrões REST.
- **Integração com IA (Gemini)**: Para sugestão de soluções em novos chamados.

---

## Estrutura do Banco de Dados

A API utiliza 3 tabelas principais para gerenciar os dados.

### 1. Tabela `Usuarios`

Armazena as informações de todos os usuários do sistema, sejam eles solicitantes ou técnicos.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` (PK) | Identificador único do usuário. |
| `Nome` | `string` | Nome completo do usuário. |
| `Email` | `string` | E-mail de login (único). |
| `Senha` | `string` | Senha do usuário (armazenada com hash BCrypt). |
| `Telefone`| `string` | Telefone de contato. |
| `Setor` | `string` | Setor do usuário na empresa. |
| `Cargo` | `string` | Cargo do usuário. |
| `Ativo` | `bool` | Indica se o usuário está ativo (usado para soft delete). |

### 2. Tabela `Chamados`

Contém todos os chamados abertos no sistema.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `ChamadoId` | `int` (PK) | Identificador único do chamado. |
| `TituloChamado` | `string` | Título breve do chamado. |
| `DescricaoChamado`| `string` | Descrição detalhada do problema. |
| `CategoriaChamado`| `string` | Categoria do chamado (ex: Hardware, Software). |
| `PrioridadeChamado`| `string` | Nível de prioridade (Baixa, Média, Alta). |
| `StatusChamado` | `string` | Status atual (Aberto, Em Atendimento, Resolvido, etc.). |
| `DataAbertura` | `DateTime` | Data e hora de criação do chamado. |
| `DataUltimaModificacao`| `DateTime?`| Data da última atualização no chamado. |
| `SolucaoSugerida` | `string?` | Solução inicial sugerida pela IA. |
| `SolucaoAplicada` | `string?` | Solução final aplicada para resolver o chamado. |
| `SolicitanteId` | `int` (FK) | ID do usuário que abriu o chamado (ref: `Usuarios.Id`). |
| `AtendenteId` | `int?` (FK) | ID do técnico responsável pelo atendimento (ref: `Usuarios.Id`). |

### 3. Tabela `Interacoes`

Armazena o histórico de mensagens e interações de cada chamado.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` (PK) | Identificador único da interação. |
| `Mensagem` | `string` | Conteúdo da mensagem. |
| `DataCriacao` | `DateTime` | Data e hora em que a mensagem foi enviada. |
| `ChamadoId` | `int` (FK) | ID do chamado ao qual a mensagem pertence (ref: `Chamados.ChamadoId`). |
| `UsuarioId` | `int` (FK) | ID do usuário que enviou a mensagem (ref: `Usuarios.Id`). |

---

## Endpoints da API

A seguir estão detalhados os principais endpoints disponíveis.

### Usuários (`/api/usuarios`)

#### `GET /api/usuarios`
- **Descrição**: Retorna uma lista de todos os usuários **ativos**.
- **Parâmetros de Query**:
  - `q` (opcional): Filtra usuários por nome ou e-mail. Ex: `/api/usuarios?q=joao`
- **Resposta (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "nome": "Mateus Teodoro",
      "email": "mateus@updesk.com",
      "telefone": "11999999999",
      "setor": "TI",
      "cargo": "Supervisor"
    }
  ]
  ```

#### `GET /api/usuarios/{id}`
- **Descrição**: Busca um usuário ativo pelo seu ID.
- **Resposta (200 OK)**:
  ```json
  {
    "id": 1,
    "nome": "Mateus Teodoro",
    "email": "mateus@updesk.com",
    "telefone": "1199999...,
    "setor": "TI",
    "cargo": "Supervisor"
  }
  ```
- **Resposta de Erro**: `404 Not Found` se o usuário não existir ou estiver inativo.

#### `POST /api/usuarios`
- **Descrição**: Cria um novo usuário. A senha é automaticamente criptografada.
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Novo Usuário",
    "email": "novo@updesk.com",
    "senha": "senha_segura",
    "telefone": "11123456789",
    "setor": "Vendas",
    "cargo": "Vendedor"
  }
  ```
- **Resposta (201 Created)**: Retorna os dados do usuário criado (sem a senha).

#### `PUT /api/usuarios/{id}`
- **Descrição**: Atualiza os dados de um usuário existente.
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Nome Atualizado",
    "email": "email.atualizado@updesk.com",
    "telefone": "11987654321",
    "setor": "Marketing",
    "cargo": "Analista"
  }
  ```
- **Resposta**: `204 No Content` em caso de sucesso.

#### `DELETE /api/usuarios/{id}`
- **Descrição**: Realiza a exclusão lógica (soft delete) de um usuário, marcando-o como inativo.
- **Resposta**: `204 No Content` em caso de sucesso.

---

### Chamados (`/api/chamados`)

#### `GET /api/chamados`
- **Descrição**: Retorna uma lista resumida de todos os chamados.
- **Parâmetros de Query**:
  - `status` (opcional): Filtra chamados por status (ex: `Aberto`, `Em Atendimento`).
  - `q` (opcional): Busca por texto no título ou na descrição do chamado.
- **Resposta (200 OK)**:
  ```json
  [
    {
      "chamadoId": 1,
      "tituloChamado": "Problema com impressora",
      "categoriaChamado": "Hardware",
      "prioridadeChamado": "Média",
      "statusChamado": "Aberto",
      "dataAbertura": "2024-10-24T10:00:00Z",
      "solicitanteNome": "Maria Santos",
      "atendenteNome": null
    }
  ]
  ```

#### `GET /api/chamados/triagem`
- **Descrição**: Retorna uma lista de chamados com status "Aberto" e que ainda não foram atribuídos a um técnico. Ideal para a tela de triagem.

#### `GET /api/chamados/{id}`
- **Descrição**: Busca os detalhes completos de um chamado, incluindo o histórico de interações.
- **Resposta (200 OK)**:
  ```json
  {
    "chamadoId": 2,
    "tituloChamado": "Erro no sistema de login",
    "descricaoChamado": "Não consigo fazer login...",
    "statusChamado": "Em Atendimento",
    // ... outros campos do chamado
    "solicitanteNome": "Maria Santos",
    "atendenteNome": "João Silva",
    "interacoes": [
      {
        "id": 1,
        "chamadoId": 2,
        "usuarioId": 2,
        "usuarioNome": "João Silva",
        "mensagem": "Olá! Vou verificar o problema.",
        "dataCriacao": "2024-10-25T14:00:00Z"
      }
    ]
  }
  ```

#### `POST /api/chamados`
- **Descrição**: Cria um novo chamado. O sistema automaticamente consulta uma IA para gerar uma `SolucaoSugerida`.
- **Corpo da Requisição**:
  ```json
  {
    "solicitanteId": 3,
    "titulo": "Computador não liga",
    "descricao": "Meu computador não dá sinal de vida ao apertar o botão de ligar.",
    "categoria": "Hardware",
    "prioridade": "Alta"
  }
  ```
- **Resposta (201 Created)**: Retorna um resumo do chamado criado.

#### `PUT /api/chamados/{id}/status`
- **Descrição**: Atualiza o status de um chamado.
- **Corpo da Requisição**:
  ```json
  {
    "novoStatus": "Resolvido"
  }
  ```
- **Resposta**: `204 No Content`.

#### `POST /api/chamados/{id}/transferir`
- **Descrição**: Atribui ou transfere um chamado para um técnico.
- **Corpo da Requisição**:
  ```json
  {
    "novoAtendenteId": 2
  }
  ```
- **Resposta**: `204 No Content`.

#### `POST /api/chamados/{id}/mensagens`
- **Descrição**: Adiciona uma nova mensagem (interação) a um chamado.
- **Corpo da Requisição**:
  ```json
  {
    "usuarioId": 3,
    "mensagem": "Alguma novidade sobre o meu problema?"
  }
  ```
- **Resposta (201 Created)**: Retorna os dados da mensagem criada.

#### `POST /api/chamados/{id}/resolver-com-ia`
- **Descrição**: Marca um chamado como resolvido, utilizando a solução fornecida pela IA.
- **Corpo da Requisição**:
  ```json
  {
    "solucao": "A solução sugerida pela IA foi aplicada e resolveu o problema."
  }
  ```
- **Resposta**: `204 No Content`.

---

### Dashboard (`/api/dashboard`)

#### `GET /api/dashboard/stats`
- **Descrição**: Retorna estatísticas gerais sobre os chamados para exibição em um painel.
- **Resposta (200 OK)**:
  ```json
  {
    "totalChamados": 150,
    "chamadosAbertos": 10,
    "chamadosEmAtendimento": 5,
    "chamadosFinalizados": 130,
    "chamadosSolucaoIA": 5,
    "chamadosEmTriagem": 2
  }
  ```

---

### Relatórios (`/api/relatorios`)

#### `GET /api/relatorios/pdf`
- **Descrição**: Endpoint reservado para a futura implementação da geração de relatórios em PDF.
- **Resposta (200 OK)**:
  ```json
  {
    "message": "Endpoint para geração de PDF. Implementação pendente."
  }
  ```

---

## Dados Iniciais (Seed)

Ao iniciar a aplicação pela primeira vez com um banco de dados vazio, o sistema irá popular as tabelas com dados de teste (3 usuários, 3 chamados e 2 interações) para facilitar o desenvolvimento e a demonstração.

---

## Como Executar o Projeto

1.  Clone o repositório.
2.  Configure a string de conexão com o banco de dados no arquivo `appsettings.json`.
3.  Execute as migrações do Entity Framework:
    ```sh
    dotnet ef database update
    ```
4.  Execute a aplicação:
    ```sh
    dotnet run
    ```
5.  A API estará disponível em `https://localhost:<porta>` e a documentação interativa (Swagger) em `https://localhost:<porta>/swagger`.

