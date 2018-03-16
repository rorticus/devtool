import Container from '@dojo/widget-core/Container';
import Log from '../Log';
import { DiagnosticInputChannel } from '@dojo/diagnostics/interfaces';

export function getProperties(inputChannel: DiagnosticInputChannel) {
	return {
		inputChannel: inputChannel
	};
}

export default Container(Log, 'input-channel', { getProperties });
