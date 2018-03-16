import { DiagnosticInputChannel } from '@dojo/diagnostics/interfaces';
import Container from '@dojo/widget-core/Container';
import Widgets from '../Widgets';

let shouldHighlight = false;

export function getProperties(inputChannel: DiagnosticInputChannel) {
	return {
		inputChannel: inputChannel,
		highlightWidgetInvalidations: shouldHighlight,
		onHighlightInvalidations: (value: boolean) => {
			// do something...
			shouldHighlight = value;
		}
	};
}

export default Container(Widgets, 'input-channel', { getProperties });
