import Container from '@dojo/widget-core/Container';
import { DevToolStore } from '../state/interfaces';

import DevTool, { DevToolProperties } from '../widgets/DevTool';
import { refreshDiagnosticsProcess, setInterfacePropertyProcess } from '../state/processes';

function getProperties(store: DevToolStore): DevToolProperties {
	const { get, path } = store;
	return {
		diagnostics: get(path('diagnostics')),
		interface: get(path('interface')),
		refreshDiagnostics: refreshDiagnosticsProcess(store),
		setInterfaceProperty: setInterfacePropertyProcess(store) as any
	};
}

const DevToolContainer = Container(DevTool, 'state', { getProperties });

export default DevToolContainer;
