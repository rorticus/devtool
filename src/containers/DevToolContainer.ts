import Container from '@dojo/widget-core/Container';
import { refresh } from '../diagnostics';
import { DevToolStore } from '../state/interfaces';

import DevTool, { DevToolProperties } from '../widgets/DevTool';
import {
	setActiveIndexProcess,
	setEventLogProcess,
	setProjectorsProcess,
	setRenderProcess,
	setSelectedDNodeProcess,
	setSelectedEventIdProcess,
	setViewProcess
} from '../state/processes';

function getProperties(store: DevToolStore): DevToolProperties {
	const { get, path } = store;
	return {
		activeIndex: get(path('interface', 'activeIndex')),
		apiVersion: get(path('interface', 'apiVersion')),
		diagnostics: get(path('diagnostics')),
		eventLog: get(path('eventLog')),
		projectors: get(path('projectors')),
		refreshDiagnostics() {
			return refresh(store);
		},
		render: get(path('render')),
		selectedDNode: get(path('interface', 'selectedDNode')),
		selectedEventId: get(path('interface', 'selectedEventId')),
		setActiveIndex: setActiveIndexProcess(store) as any,
		setEventLog: setEventLogProcess(store) as any,
		setProjectors: setProjectorsProcess(store) as any,
		setRender: setRenderProcess(store) as any,
		setSelectedDNode: setSelectedDNodeProcess(store) as any,
		setSelectedEventId: setSelectedEventIdProcess(store) as any,
		setView: setViewProcess(store) as any,
		view: get(path('interface', 'view'))
	};
}

const DevToolContainer = Container(DevTool, 'state', { getProperties });

export default DevToolContainer;
