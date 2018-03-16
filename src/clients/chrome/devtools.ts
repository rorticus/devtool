/*
Entry point for Chrome Devtools extension

Load and configure the panel which contains the devtools dojo2 application
 */

declare const chrome: any;

const tabId = chrome.devtools.inspectedWindow.tabId;

const backgroundPort = chrome.runtime.connect({
	name: 'devtools'
});

backgroundPort.postMessage({
	type: 'initialize.tab',
	tabId
});

chrome.devtools.panels.create(
	'Dojo',
	'', // icon goes here
	'index.html',
	function(panel: any) {
		// code invoked on panel creation
	}
);
