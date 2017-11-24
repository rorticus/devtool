import global from '@dojo/shim/global';

global.browser = {
	devtools: {
		inspectedWindow: {
			eval(value: string, callback: (result?: any, exceptionInfo?: any) => void) {
				callback();
			}
		},
		panels: {
			create() { }
		}
	}
};
