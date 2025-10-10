# UpDesk Mobile

Uma aplicação mobile para abertura e acompanhamento de chamados.

## 🚀 Pré-requisitos

Antes de começar, você vai precisar ter as seguintes ferramentas instaladas em sua máquina:

* **[Git](https://git-scm.com)**: Para clonar o projeto.
* * **Gerenciador de Versão do Node.js**: É altamente recomendado usar um gerenciador de versão para garantir que você está usando a versão correta do Node.js, especificada no arquivo `.nvmrc`.
    * Para **Windows**, use o [nvm-for-windows](https://github.com/coreybutler/nvm-windows).
    * Para **macOS** ou **Linux**, use o [nvm](https://github.com/nvm-sh/nvm).
* **[Node.js (versão 18.x ou superior)](https://nodejs.org/)**: O ambiente de execução do JavaScript.
    * *Recomendado:* Use um gerenciador de versões como o **[nvm](https://github.com/nvm-sh/nvm)** para evitar conflitos entre projetos.
* **App Expo Go**: O aplicativo no seu celular para rodar o projeto.
    * **[Link para Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)**
    * **[Link para iOS (App Store)](https://apps.apple.com/us/app/expo-go/id982107779)**

---

## 🛠️ Como Configurar e Rodar o Projeto

Siga os passos abaixo para ter o ambiente de desenvolvimento rodando:

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/seu-usuario/nome-do-seu-projeto.git](https://github.com/seu-usuario/nome-do-seu-projeto.git)
    ```

2.  **Acesse a pasta do projeto**
    ```bash
    cd nome-do-seu-projeto
    ```

3.  **Use a versão correta do Node.js**
    *Se você usa `nvm`, execute o comando abaixo para usar a versão do Node especificada no projeto:*
    ```bash
    nvm use
    ```

4.  **Instale todas as dependências**
    *Este comando vai ler o arquivo `package-lock.json` e instalar exatamente as mesmas versões de pacotes que foram usadas no desenvolvimento:*
    ```bash
    npm install
    ```

5.  **Inicie o projeto**
    ```bash
    npx expo start
    ```

6.  **Conecte seu celular**
    *Após o comando `npx expo start`, um QR Code aparecerá no terminal ou em uma aba do navegador. Abra o aplicativo **Expo Go** no seu celular e escaneie este QR Code.*

Pronto! O aplicativo deve carregar no seu celular e você pode começar a desenvolver.

---

## 📜 Scripts Úteis

* `npm start`: Inicia o servidor de desenvolvimento do Expo (atalho para `npx expo start`).
* `npm run android`: Tenta iniciar o app em um emulador Android conectado ou no Expo Go.
* `npm run ios`: Tenta iniciar o app em um emulador iOS conectado ou no Expo Go (requer macOS).