import { createCommandFactory } from '@dojo/stores/process';
import { add, replace } from '@dojo/stores/state/operations';
import { DevToolState } from './interfaces';

export const createCommand = createCommandFactory<DevToolState>();

export const initCommand = createCommand(({ path }) => {
	return [
		add(path('eventLog'), undefined),
		add(path('interface'), {
			activeIndex: 0,
			apiVersion: undefined,
			view: undefined
		}),
		add(path('projectors'), undefined),
		add(path('render'), undefined)
	];
});

export const setApiVersionCommand = createCommand(({ payload: [apiVersion], path }) => {
	return [replace(path('interface', 'apiVersion'), apiVersion)];
});

export const setActiveIndexCommand = createCommand(({ payload: [activeIndex], path }) => {
	return [replace(path('interface', 'activeIndex'), activeIndex)];
});

export const setDiagnosticsCommand = createCommand(({ payload: [diagnostics], path }) => {
	return [replace(path('diagnostics'), diagnostics)];
});

export const setEventLogCommand = createCommand(({ payload: [eventLog], path }) => {
	return [replace(path('eventLog'), eventLog)];
});

export const setProjectorsCommand = createCommand(({ payload: [projectors], path }) => {
	return [replace(path('projectors'), projectors)];
});

export const setRenderCommand = createCommand(({ payload: [render], path }) => {
	return [replace(path('render'), render)];
});

export const setSelectedDNodeCommand = createCommand(({ payload: [selectedDNode], path }) => {
	return [replace(path('interface', 'selectedDNode'), selectedDNode)];
});

export const setSelectedEventIdCommand = createCommand(({ payload: [selectedEventId], path }) => {
	return [replace(path('interface', 'selectedEventId'), selectedEventId)];
});

export const setViewCommand = createCommand(({ payload: [view], path }) => {
	return [replace(path('interface', 'view'), view)];
});
