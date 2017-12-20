import Store from '@dojo/diagnostics/wrappers/Store';
import Projector from '@dojo/widget-core/mixins/Projector';
import Registry from '@dojo/widget-core/Registry';
import { registerThemeInjector } from '@dojo/widget-core/mixins/Themed';
import { version } from './diagnostics';
import { initProcess, setInterfacePropertyProcess } from './state/processes';
import StateInjector from './state/StateInjector';
import theme from './themes/devtool';
import DevToolContainer from './containers/DevToolContainer';

const registry = new Registry();

const store = new Store();
initProcess(store)();

registerThemeInjector(theme, registry);
registry.defineInjector('state', new StateInjector(store));

const projector = new (Projector(DevToolContainer))();

async function onCheckVersion() {
	try {
		(setInterfacePropertyProcess(store) as any)('apiVersion', await version());
	} catch {
		console.log('Unable to detect Dojo 2 Diagnostic API');
	}
	projector.setProperties({ registry, onCheckVersion });
}

(async () => {
	await onCheckVersion();
	projector.append();
})();
