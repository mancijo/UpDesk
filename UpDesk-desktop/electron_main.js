// c:\Users\Mateus Teodoro\upDesk\UpDesk-desktop\electron_main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const log = require('electron-log');

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
            // No modo de desenvolvimento, usamos a versão publicada para garantir consistência
            apiCwd = path.join(__dirname, 'api_publish');
            const exePath = path.join(apiCwd, 'UpDesk.api.Web.exe');
            command = `"${exePath}"`;
            args = [];
            console.log(`Iniciando API em modo de desenvolvimento a partir de: ${apiCwd}`);
            
            if (!fs.existsSync(exePath)) {
                const errorMsg = `API Executable not found at: ${exePath}. Please run 'dotnet publish -c Debug -o "${apiCwd}"' on the UpDesk.api.Web project.`;
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
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: app.isPackaged
            ? path.join(process.resourcesPath, 'app', 'api', 'wwwroot', 'favicon.ico')
            : path.join(__dirname, '..', 'UpDesk.api', 'UpDesk.api.Web', 'wwwroot', 'favicon.ico')
    });

    // Limpa o cache para garantir que as alterações mais recentes sejam carregadas
    mainWindow.webContents.session.clearCache();

    mainWindow.loadURL(`http://localhost:${webPort}/index.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
    try {
        console.log('App pronto. Iniciando o servidor da API C#...');
        const port = await createApiProcess();

        if (port) {
            console.log(`Servidor da API iniciado com sucesso na porta ${port}. Criando a janela principal.`);
            createWindow();
        } else {
            throw new Error('Não foi possível obter a porta da API. O processo pode ter falhado ao iniciar.');
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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});