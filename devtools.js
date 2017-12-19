'use strict';

const b = typeof browser !== 'undefined' && browser || typeof chrome !== 'undefined' && chrome;
if (!b || !b.devtools) {
	throw new Error('Unable to resolve development tools API, unsupported environment!');
}

b.devtools.panels.create('Dojo 2', 'img/logo/32x32.png', 'output/dist/index.html');
