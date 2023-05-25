const {app, BrowserWindow, Menu, dialog, remote} = require('electron')
const {autoUpdater} = require('electron-updater')
const isDev = require('electron-is-dev');
const { title } = require('process');
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

console.log(app.getVersion())

var mainWindow = null;
async function createWindow(){
    mainWindow = new BrowserWindow({
        //fullscreen: true,
        //frame: false,
        //width:1025,
        //height: 1017,
        icon: 'icon.ico',
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    mainWindow.removeMenu()
    mainWindow.maximize()
    remoteMain.enable(mainWindow.webContents)


    if(isDev){
        mainWindow.webContents.openDevTools()
    }

    if(!isDev){
        autoUpdater.checkForUpdates()
    }
    await mainWindow.loadFile('src/pages/main/index.html')
}

autoUpdater.on('update-available', (_event, releaseNotes, releaseName)=>{
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: 'Atualização Disponível!',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'Uma nova versão do programa está sendo baixada. Não feche o programa. Por favor aguarde...'
    }
    dialog.showMessageBox(dialogOpts, (response)=>{

    })
})

autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName)=>{
    const dialogOpts = {
        type: 'info',
        buttons: ['Reiniciar', 'Mais tarde'],
        title: 'Feito! Atualização concluida',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A nova versão foi baixada. Reinicie para aplicar as alterações.'
    }
    dialog.showMessageBox(dialogOpts).then((returnValue)=>{
        if(returnValue.response===0) autoUpdater.quitAndInstall()
    })
})




    
//Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('activate', ()=>{
    if(BrowserWindow.getAllWindows().length===0){
        createWindow();
    }
})