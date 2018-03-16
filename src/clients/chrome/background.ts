// declare const chrome: any;

const tabPorts: { [key: number]: any } = {};

function initializeTab(tabId: number) {
	chrome.tabs.executeScript(tabId, { file: 'contentscript.js' });
}

function incomingMessage(tabId: number, message: any) {
	if (tabPorts[tabId]) {
		tabPorts[tabId].postMessage(message);
	}
}

chrome.runtime.onConnect.addListener((port: any) => {
	if (port.name === 'content-script') {
		const tabId = port.sender.tab.id;

		port.onMessage.addListener((message: any) => {
			if (message.type === 'incoming.tab') {
				incomingMessage(tabId, message.message);
			}
		});
	} else if (port.name === 'devtools') {
		console.log('incoming connection from devtools');

		port.onMessage.addListener((message: any, sender: any) => {
			if (message.type === 'initialize.tab') {
				const tabId = message.tabId;

				console.log('initializing tab ' + tabId, sender);

				initializeTab(tabId);
			}
		});
	} else if (port.name === 'diagnostics') {
		console.log('incoming connection from diagnostics');

		port.onMessage.addListener((event: any) => {
			if (event.type === 'register') {
				console.log('registering tab with port', event);
				tabPorts[event.tabId] = port;

				port.onDisconnect.addListener(() => {
					console.log('disconnected tab' + event.tabId);
					delete tabPorts[event.tabId];
				});
			}
		});
	}
});
