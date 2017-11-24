'use strict';

const b = typeof browser !== 'undefined' && browser || typeof chrome !== 'undefined' && chrome;
if (!b || !b.devtools) {
	throw new Error('Unable to resolve development tools API, unsupported environment!');
}

b.devtools.panels.create('Dojo 2', 'devtools.png', 'dist/index.html');
