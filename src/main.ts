import { ChromeExtensionInputChannel } from '@dojo/diagnostics/channels/input/ChromeExtensionInputChannel';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import Panel from './widgets/Panel';

// listen for events from the chrome background page
const listener = new ChromeExtensionInputChannel();

// Create a projector to convert the virtual DOM produced by the application into the rendered page.
// For more information on starting up a Dojo 2 application, take a look at
// https://dojo.io/tutorials/002_creating_an_application/
const Projector = ProjectorMixin(Panel);
const projector = new Projector();
projector.setProperties({
	inputChannel: listener
});

// By default, append() will attach the rendered content to document.body.  To insert this application
// into existing HTML content, pass the desired root node to append().
projector.append();
