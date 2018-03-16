import { ChromeExtensionInputChannel } from '@dojo/diagnostics/channels/input/ChromeExtensionInputChannel';
import Injector from '@dojo/widget-core/Injector';
import { registerThemeInjector } from '@dojo/widget-core/main';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import Registry from '@dojo/widget-core/Registry';
import Panel from './widgets/Panel';
import dojo from '@dojo/themes/dojo';

const registry = new Registry();

const themeContext = registerThemeInjector(dojo, registry);
registry.defineInjector('theme-context', new Injector(themeContext));

const listener = new ChromeExtensionInputChannel();
registry.defineInjector('input-channel', new Injector(listener));

const Projector = ProjectorMixin(Panel);
const projector = new Projector();
projector.setProperties({
	registry: registry
});

projector.append();
