const port = chrome.runtime.connect({
	name: 'content-script'
});

window.addEventListener('message', (event) => {
	if (event.data && event.data.source === 'dojo2-diagnostics') {
		try {
			port.postMessage({
				type: 'incoming.tab',
				message: event.data
			});
		} catch (e) {
			// TODO: What do we do with errors? Presumably we discconect from the listener
		}
	}
}, false);