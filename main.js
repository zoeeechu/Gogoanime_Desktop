// Modules to control application life and create native browser window
const { app, BrowserWindow, session, globalShortcut } = require('electron')
const path = require('path')
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const client = require('discord-rich-presence')('1033927014995992596');
const Store = require('electron-store');
const store = new Store();

//stop it from blocking stuffs
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';


//intilize mainWindow so it can be refrenced everywhere
let mainWindow = null;

//intilize currentURL
let currentURL;
let details = 'In main menu';
let staterpc;
let playON;

//Presistance Varaibles
let setUrl
pr = store.get('p');

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createWindow() {


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      allowEval: false, // This is the key!
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      //icon: path.join(__dirname,'/images/icon.png')
    },
    autoHideMenuBar: true,
    //  titleBarStyle: 'hidden',
  })

  //Set title ;>
  mainWindow.setTitle('Gogoanime Desktop');
  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  });

  //dont allow any other URLS other than gogoanime
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith === 'https://ww4.gogoanimes.org') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            allowEval: false, // This is the key!
            preload: path.join(__dirname, 'preload.js'),
            devTools: false,
            webSecurity: false
          }
        }
      }
    }
    return { action: 'deny' }
  })

  //if presistance exists load it otherwise dont;;
  if (pr == null) {
    setUrl = 'https://ww4.gogoanimes.org';
  } else {
    setUrl = pr
  }

  mainWindow.loadURL(setUrl).then(() => {

    mainWindow.webContents.on('did-frame-navigate', function () {

      mainWindow.webContents.insertCSS('.logo.show.ads-evt {content: url("https://github.com/zoeeechu/Ako/blob/main/logo.png?raw=true");}')

      currentURL = mainWindow.webContents.getURL()
      console.log(currentURL)

      //save last veiwed page
      store.set('p', currentURL);

      if (currentURL.includes("watch")) {
        playON = 'play'
        let dtemp = currentURL.replace('https://ww4.gogoanimes.org/watch/', '');
        let dtemp2 = dtemp.replaceAll('-', " ")
        let d = dtemp2.split("episode")[0];
        console.log(d);
        details = "Watching: " + capitalize(d);
        let epNum = dtemp2.split('episode').splice(1).join('episode')
        console.log(epNum)
        staterpc = "Ep " + epNum
        updateP()
      } else if (currentURL.includes("search")) {
        details = 'Searching...';
        staterpc = undefined;
        playON = undefined;
        updateP()
      } else {
        details = 'In main menu';
        staterpc = undefined;
        playON = undefined;
        updateP()
      }

    })


  })
  mainWindow.show()
  mainWindow.focus()



  //injecting CSS TEST WORKON LATER
  //mainWindow.webContents.insertCSS('html, body { overflow: hidden;  }')
  mainWindow.webContents.insertCSS('.logo.show.ads-evt {content: url("https://github.com/zoeeechu/Ako/blob/main/logo.png?raw=true");}')
  // mainWindow.webContents.insertCSS('html, .wrapper_inside { overflow-y: scroll; padding-right: 0px; }')

}



app.whenReady().then(() => {

  updateP()

  // Register a shortcut listener for Ctrl + Shift + I
  globalShortcut.register('Control+Shift+I', () => {
    // When the user presses Ctrl + Shift + I, this function will get called
    // You can modify this function to do other things, but if you just want
    // to disable the shortcut, you can just return false
    return false;
  });


  //blocker
  ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInSession(session.defaultSession);
  });

  createWindow()


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


async function updateP() {
  client.updatePresence({
    state: staterpc,
    details: details,
    largeImageKey: 'ako1',
    largeImageText: "Ako Gogoanime client",
    smallImageKey: playON,
    instance: true,
    buttons: [
      {
        label: `Get Ako`,
        url: `https://www.github.com/zoeeechu`,

      },
    ]
  })
}
