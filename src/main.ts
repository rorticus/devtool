import Projector from '@dojo/widget-core/mixins/Projector';
import Registry from '@dojo/widget-core/Registry';
import { registerThemeInjector } from '@dojo/widget-core/mixins/Themed';
import { version } from './diagnostics';
import theme from './themes/devtool';
import DevTool from './widgets/DevTool';

const registry = new Registry();
registerThemeInjector(theme, registry);

const projector = new (Projector(DevTool))();

async function onCheckVersion() {
	let apiVersion: string | undefined;
	try {
		apiVersion = await version();
	}
	catch {
		console.log('Unable to detect Dojo 2 Diagnostic API');
	}
	projector.setProperties({
		apiVersion,
		registry,
		onCheckVersion
	});
}

(async () => {
	await onCheckVersion();
	projector.append();
})();
