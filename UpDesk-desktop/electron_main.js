// c:\Users\Mateus Teodoro\upDesk\UpDesk-desktop\electron_main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const log = require('electron-log');

// Habilita reload automático durante desenvolvimento usando electron-reload.
// Observa as pastas de conteúdo estático para que alterações em HTML/CSS/JS recarreguem a janela.
if (!app.isPackaged) {
    try {
        const watchPaths = [
            path.join(__dirname, 'api_publish', 'wwwroot'),
            path.join(__dirname, '..', 'UpDesk.api', 'UpDesk.api.Web', 'wwwroot'),
            path.join(__dirname, 'wwwroot')
        ];
        // Requer o módulo instalado como devDependency. Usa process.execPath para localizar o ejecutável do Electron.
        require('electron-reload')(watchPaths, {
            electron: process.execPath,
            awaitWriteFinish: true,
            verbose: false
        });
        console.log('electron-reload ativado (dev). Observando:', watchPaths.join(', '));
    } catch (err) {
        console.warn('electron-reload não está disponível ou falhou ao iniciar:', err && err.message ? err.message : err);
    }
}

// --- MUDANÇA IMPORTANTE: CONFIGURAR LOGS ---
// Redireciona todos os console.log e console.error para o arquivo de log
console.log = log.log;
console.error = log.error;
// Define o formato do log
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

console.log('Aplicação iniciada. Logging configurado.');
console.log(`Arquivo de log localizado em: ${log.transports.file.getFile().path}`);

let apiProcess = null;
let webPort = null; // Porta do front-end, será definida dinamicamente

// Modificamos esta função para retornar uma Promise
function createApiProcess() {
    return new Promise((resolve, reject) => {
        // Verifica se o app está empacotado (instalado) ou em desenvolvimento
        const isPackaged = app.isPackaged;

        let command;
        let args;
        let apiCwd;

        if (isPackaged) {
            // No modo empacotado, executamos o .exe publicado
            apiCwd = path.join(app.getAppPath(), '..', 'api');
            const exePath = path.join(apiCwd, 'UpDesk.api.Web.exe');
            command = `"${exePath}"`;
            
            if (!fs.existsSync(exePath)) {
                const errorMsg = `API Executable not found at: ${exePath}. Please run 'dotnet publish -c Release' on the Web project before building the installer.`;
                console.error(errorMsg);
                return reject(new Error(errorMsg));
            }
            
            args = [];
            console.log(`Iniciando API empacotada: ${command}`);
        } else {
            // No modo de desenvolvimento, executamos o projeto C# diretamente com 'dotnet run'
            // para que o servidor sirva os arquivos de `UpDesk.api.Web/wwwroot` em tempo real.
            const projectDir = path.join(__dirname, '..', 'UpDesk.api', 'UpDesk.api.Web');
            const csprojPath = path.join(projectDir, 'UpDesk.api.Web.csproj');
            command = 'dotnet';
            args = ['run', '--project', csprojPath, '--configuration', 'Debug'];
            apiCwd = projectDir;
            console.log(`Iniciando API em modo de desenvolvimento via 'dotnet run' no projeto: ${csprojPath}`);

            if (!fs.existsSync(csprojPath)) {
                const errorMsg = `Arquivo de projeto não encontrado em: ${csprojPath}. Verifique o caminho do projeto UpDesk.api.Web.`;
                console.error(errorMsg);
                return reject(new Error(errorMsg));
            }
        }

        const dbPath = path.join(app.getPath('userData'), 'database.db');
        console.log(`Caminho do banco de dados: ${dbPath}`);

        apiProcess = spawn(command, args, {
            cwd: apiCwd,
            env: { 
                ...process.env, 
                ASPNETCORE_ENVIRONMENT: 'Development',
                DATABASE_PATH: dbPath
            },
            shell: true
        });

        let hasStarted = false;

        const processOutput = (data) => {
            const output = data.toString();
            console.log(`Saída da API: ${output.trim()}`);

            // Regex para a saída do AppHost (dev) e do Web (prod)
            const match = output.match(/Now listening on: https?:\/\/[^:]+:(\d+)/) || output.match(/web: https?:\/\/localhost:(\d+)/);
            if (match && match[1]) {
                if (!hasStarted) {
                    webPort = parseInt(match[1], 10);
                    console.log(`Servidor WEB está pronto na porta: ${webPort}`);
                    hasStarted = true;
                    resolve(webPort);
                }
            }
        };

        apiProcess.stdout.on('data', processOutput);
        apiProcess.stderr.on('data', (data) => console.error(`Saída de erro da API: ${data.toString().trim()}`));

        apiProcess.on('close', (code) => {
            console.log(`Processo da API encerrado com código ${code}`);
            if (!hasStarted) {
                reject(new Error(`O processo da API falhou ao iniciar com o código de saída: ${code}`));
            }
        });

        apiProcess.on('error', (err) => {
            console.error('Falha ao iniciar o processo da API:', err);
            if (!hasStarted) reject(err);
        });
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "electron_preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: app.isPackaged
            ? path.join(process.resourcesPath, 'app', 'api', 'wwwroot', 'favicon.ico')
            : path.join(__dirname, '..', 'UpDesk.api', 'UpDesk.api.Web', 'wwwroot', 'favicon.ico')
    });

    // GARANTE QUE QUALQUER PÁGINA (até vindo do servidor C#) tenha preload
    mainWindow.webContents.session.setPreloads([
        path.join(__dirname, "electron_preload.js")
    ]);

    mainWindow.webContents.session.clearCache();

    mainWindow.loadURL(`http://localhost:${webPort}/templates/index.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.openDevTools();
}


app.whenReady().then(async () => {
    try {
        console.log('App pronto. Iniciando o servidor da API C#...');
        // Se SKIP_API_START estiver definido, não iniciamos o processo da API aqui.
        // Em vez disso, tentamos detectar um servidor já em execução (útil para desenvolvimento manual com `dotnet run`).
        if (process.env.SKIP_API_START === '1') {
            console.log('SKIP_API_START=1 detectado: não iniciaremos o processo da API. Tentando detectar servidor em execução...');
            // Tenta descobrir a porta a partir do launchSettings do projeto (se existir)
            const launchSettingsPath = path.join(__dirname, '..', 'UpDesk.api', 'UpDesk.api.Web', 'Properties', 'launchSettings.json');
            let detectedPort = null;
            try {
                if (fs.existsSync(launchSettingsPath)) {
                    const cfg = JSON.parse(fs.readFileSync(launchSettingsPath, 'utf8'));
                    const profiles = cfg.profiles || {};
                    // procura a primeira applicationUrl http
                    for (const k of Object.keys(profiles)) {
                        const appUrl = profiles[k].applicationUrl;
                        if (appUrl) {
                            const parts = String(appUrl).split(/;|,/).map(s => s.trim());
                            for (const p of parts) {
                                if (p.startsWith('http://')) {
                                    const m = p.match(/:(\d+)/);
                                    if (m && m[1]) { detectedPort = parseInt(m[1], 10); break; }
                                }
                            }
                        }
                        if (detectedPort) break;
                    }
                }
            } catch (err) {
                console.warn('Falha ao ler launchSettings.json:', err && err.message ? err.message : err);
            }

            // Fallback para porta padrão 5000 se não detectada
            if (!detectedPort) detectedPort = 5000;

            // Aguarda o servidor responder na porta detectada
            const waitForServer = (port, timeoutMs = 15000) => new Promise((resolve, reject) => {
                const http = require('http');
                const start = Date.now();
                const tryPing = () => {
                    const req = http.request({ method: 'GET', hostname: '127.0.0.1', port: port, path: '/' , timeout: 2000 }, res => {
                        resolve(port);
                    });
                    req.on('error', () => {
                        if (Date.now() - start > timeoutMs) return reject(new Error('Timeout ao aguardar servidor na porta ' + port));
                        setTimeout(tryPing, 500);
                    });
                    req.on('timeout', () => { req.destroy(); if (Date.now() - start > timeoutMs) return reject(new Error('Timeout ao aguardar servidor na porta ' + port)); setTimeout(tryPing, 500); });
                    req.end();
                };
                tryPing();
            });

            const port = await waitForServer(detectedPort, 15000).catch(err => { throw err; });
            if (port) {
                webPort = port;
                console.log(`Servidor detectado na porta ${webPort}. Criando janela principal.`);
                createWindow();
            } else {
                throw new Error('Não foi possível detectar servidor em execução.');
            }
        } else {
            const port = await createApiProcess();

            if (port) {
                console.log(`Servidor da API iniciado com sucesso na porta ${port}. Criando a janela principal.`);
                createWindow();
            } else {
                throw new Error('Não foi possível obter a porta da API. O processo pode ter falhado ao iniciar.');
            }
        }
    } catch (error) {
        console.error('Falha crítica ao iniciar a aplicação:', error);
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            if (apiProcess && !apiProcess.killed) {
                createWindow();
            }
        }
    });
});

app.on('will-quit', () => {
    if (apiProcess && !apiProcess.killed) {
        console.log(`Encerrando o processo da API (PID: ${apiProcess.pid})...`);
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', apiProcess.pid, '/f', '/t']);
        } else {
            apiProcess.kill('SIGKILL');
        }
    }
});

// ------------------------ PDF EXPORT SYSTEM ------------------------

const { ipcMain, dialog } = require("electron");
const PDFDocument = require("pdfkit");
const fsExtra = require("fs");
const fetch = require("node-fetch");

// Listener vindo do preload.js → window.electronAPI.exportarPDF()
ipcMain.on("gerar-relatorio-pdf", async (event, filtros) => {
    try {
        // Usa **a porta real detectada no bootstrap da API**
        let url = `http://localhost:${webPort}/api/chamados?intervalo=${filtros.intervalo}`;

        if (filtros.status)
            url += `&status=${filtros.status}`;

        console.log("🔎 Consulta API para gerar relatório:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const chamados = await response.json();

        // Janela para salvar PDF
        const { filePath } = await dialog.showSaveDialog({
            title: "Salvar relatório",
            defaultPath: "relatorio_chamados.pdf",
            filters: [{ name: "PDF", extensions: ["pdf"] }],
        });

        if (!filePath) return;

        // Gerar PDF
        const pdf = new PDFDocument({ margin: 40 });
        const stream = fsExtra.createWriteStream(filePath);
        pdf.pipe(stream);

        // Cabeçalho do relatório
        pdf.fontSize(20).text("Relatório de Gestão - UpDesk", { align: "center" });
        pdf.moveDown();

        pdf.fontSize(12).text(`Intervalo selecionado: ${filtros.intervalo} dias`);
        pdf.text(`Status filtrado: ${filtros.status || "Todos"}`);
        pdf.moveDown();

        pdf.fontSize(16).text("Chamados Encontrados:");
        pdf.moveDown();

        if (chamados.length === 0) {
            pdf.fontSize(14).text("Nenhum chamado encontrado para os filtros selecionados.");
        }

        // Listagem de chamados
        chamados.forEach((c) => {
            pdf.fontSize(12).text(`Título: ${c.tituloChamado}`);
            pdf.text(`Status: ${c.statusChamado}`);
            pdf.text(`Prioridade: ${c.prioridadeChamado}`);
            pdf.text(`Abertura: ${new Date(c.dataAbertura).toLocaleString("pt-BR")}`);
            pdf.moveDown();
        });

        pdf.end();

        stream.on("finish", () => {
            dialog.showMessageBox({
                type: "info",
                message: "Relatório gerado com sucesso!"
            });
        });

    } catch (error) {
        console.error("❌ Erro ao gerar PDF:", error);
        dialog.showErrorBox("Erro ao gerar PDF", String(error));
    }
});

// Fecha app no Windows
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});



