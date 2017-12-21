import { createCommandFactory } from '@dojo/stores/process';
import { add, replace } from '@dojo/stores/state/operations';
import { DevToolState } from './interfaces';
import { getEventLog, getLastRender, getProjectors, getStores, getStoreState } from '../diagnostics';

export const createCommand = createCommandFactory<DevToolState>();

export const initCommand = createCommand(({ path }) => {
	return [
		add(path('diagnostics'), {
			eventLog: [],
			projectors: [],
			lastRender: undefined,
			stores: [],
			storeState: undefined
		}),
		add(path('interface'), {
			activeIndex: 0,
			apiVersion: undefined,
			expandedDNodes: [],
			expandedStateNodes: [],
			view: undefined
		})
	];
});

/**
 * Update the
 */
export const refreshDiagnosticsCommand = createCommand(async ({ path }) => {
	const projectors = await getProjectors();
	const stores = await getStores();
	const diagnostics: DevToolState['diagnostics'] = {
		eventLog: await getEventLog(),
		projectors,
		lastRender: projectors.length ? await getLastRender(projectors[0]) : undefined,
		stores,
		storeState: stores.length ? await getStoreState(stores[0]) : undefined
	};
	return [replace(path('diagnostics'), diagnostics)];
});

/**
 * Set a property of the interface state
 */
export const setInterfacePropertyCommand = createCommand(({ payload: [key, value], path }) => {
	return [replace(path('interface', key), value)];
});
