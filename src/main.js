const path = require('path');

const {
    app,
    BrowserWindow,
    globalShortcut,
    ipcMain,
    Menu,
    Notification,
    Tray,
    shell
} = require('electron');

var mainWindow = null;
var tray = null;
var contextMenu = null;
var _isPlaying = false;

const toggleWindow = () => {
	mainWindow.show();
	mainWindow.focus();
};

async function initTray() {
	if (!tray) {
		tray = new Tray(path.join(__dirname, './img/logoTemplate.png'));
		tray.on('click', togglePlay);
		tray.on('right-click', displayContextMenu);
		tray.on('double-click', toggleWindow);
	}

	contextMenu = Menu.buildFromTemplate([
		{
			label: 'Play',
			checked: togglePlay(),
			click: () => { togglePlay() }
		},
		// { label: 'Open website', click: () => { shell.openExternal( {Playing track's URL}) } },
		{ type: 'separator' },
		{ label: 'Give feedback', click: () => { shell.openExternal('https://github.com/uffou/MixCloud-Play/issues') } },
		{ label: 'Quit', click: () => { app.quit() } }
	]);
};

function displayContextMenu() {
	tray.popUpContextMenu(contextMenu);
}

function togglePlay() {
	_isPlaying = !_isPlaying;
	console.log('Toggle Play:', _isPlaying);
	return _isPlaying;
}

// menuTemplate.setDashboardClickHandler(() => {
//     mainWindow.webContents.send('goToDashboard');
// })
// const menu = Menu.buildFromTemplate(menuTemplate);

// function closeHandler(event) {
//     event.preventDefault();

//     mainWindow.hide();
// }

app.on('web-contents-created', (event, contents) => {
	if (contents.getType() === 'webview') {
		contents.on('new-window', (event, url) => {
			shell.openExternal(url)
			event.preventDefault()
		});
	}
});

app.on('ready', () => {
	initTray();
    // Menu.setApplicationMenu(menu);

    mainWindow = new BrowserWindow({
		titleBarStyle: 'hiddenInset',
        width: 1100,
        minWidth: 768,
        height: 800,
		minHeight: 400,
		webPreferences: {
            // preload: 'preload.js', //
			nodeIntegration: true //TODO turn this off
		}
    });

	mainWindow.loadFile(path.join(__dirname, 'index.html'));
    //mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

    mainWindow.openDevTools();

    // mainWindow.on('focus', () => {
    //     // app.dock.setBadge("");
    // });

    // mainWindow.on('close', closeHandler)

    // Load our media keys
    // Copied from https://gist.github.com/twolfson/0a03820e27583cc9ad6e
    var registered = globalShortcut.register('medianexttrack', function () {
        console.log('medianexttrack pressed');
        mainWindow.webContents.send('next');
    });
    if (!registered) {
        console.log('medianexttrack registration failed');
    } else {
        console.log('medianexttrack registration bound!');
    }

    var registered = globalShortcut.register('mediaplaypause', function () {
        console.log('mediaplaypause pressed');
        mainWindow.webContents.send('playPause');
    });
    if (!registered) {
        console.log('mediaplaypause registration failed');
    } else {
        console.log('mediaplaypause registration bound!');
    }

    var registered = globalShortcut.register('mediaprevioustrack', function () {
        console.log('mediaprevioustrack pressed');
    });
    if (!registered) {
        console.log('mediaprevioustrack registration failed');
    } else {
        console.log('mediaprevioustrack registration bound!');
    }

    var registered = globalShortcut.register('mediastop', function () {
        console.log('mediastop pressed');
    });
    if (!registered) {
        console.log('mediastop registration failed');
    } else {
        console.log('mediastop registration bound!');
    }
});

app.on('activate', () => {
    mainWindow && mainWindow.show();
});

// app.on('before-quit', () => {
//     mainWindow && mainWindow.removeListener('close', closeHandler);
// });

ipcMain.on('notification', (_event, notificationIndex, subtitle) => {
    if (mainWindow.isFocused()) return;

    // app.dock.setBadge("!");

    const notification = new Notification({
        title: 'MixCloud Play',
        subtitle,
        silent: true
    });
    notification.on('click', (e) => {
		console.log('notificationClicked - click', e);
        mainWindow.webContents.send('notificationClicked', e);
        mainWindow.show();
    });
    notification.show();
    setTimeout(() => {
        notification.close();
    }, 7000);
});

ipcMain.on('handlePause', (_, track) => {
    // app.dock.setBadge("!");

    tray.setTitle(track + ' (paused)')
    const notification = new Notification({
        title: 'Mix Paused',
        subtitle: track,
        silent: true
    });
	notification.on('click', (e) => {
		console.log('notificationClicked - pause', e);
        mainWindow.webContents.send('notificationClicked', e);
        mainWindow.show();
    });
    notification.show();
    setTimeout(() => {
        notification.close();
    }, 7000);
});

ipcMain.on('nowPlaying', (_, nowPlaying, title, subtitle) => {
    console.log(`${nowPlaying} (${title} ${subtitle})`)

    tray.setTitle(nowPlaying);

    const notification = new Notification({
        title: title,
        subtitle: subtitle,
        silent: true
    });
    notification.on('click', (e) => {
		console.log('notificationClicked - nowPlaying', e);
        mainWindow.webContents.send('notificationClicked', e);
        mainWindow.show();
    });
    notification.show();
    setTimeout(() => {
        notification.close();
    }, 15000);
})

ipcMain.on('handlePlay', (_, track) => {
    // app.dock.setBadge("!");

    tray.setTitle(track)
    const notification = new Notification({
        title: 'Playing...',
        subtitle: track,
        silent: true
    });
    notification.on('click', (e) => {
		console.log('notificationClicked - handlePlay', e);
        mainWindow.webContents.send('notificationClicked', e);
        mainWindow.show();
    });
    notification.show();
    setTimeout(() => {
        notification.close();
    }, 7000);
});