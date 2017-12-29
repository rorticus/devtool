import { createCommandFactory } from '@dojo/stores/process';
import { add, replace } from '@dojo/stores/state/operations';
import { DevToolState } from './interfaces';
import {
	getEventLog,
	getLastRender,
	getProjectors,
	getStores,
	getStoreState,
	getStoreTransactions
} from '../diagnostics';

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
			expandedProperties: {},
			expandedStateNodes: [],
			view: undefined
		})
	];
});

/**
 * Update the diagnostic state
 */
export const refreshDiagnosticsCommand = createCommand(async ({ get, path }) => {
	const selectedProjector = get(path('interface', 'selectedProjector'));
	const selectedStore = get(path('interface', 'selectedStore'));
	const diagnostics: DevToolState['diagnostics'] = {
		eventLog: await getEventLog(),
		projectors: await getProjectors(),
		lastRender: selectedProjector ? await getLastRender(selectedProjector) : undefined,
		stores: await getStores(),
		storeState: selectedStore ? await getStoreState(selectedStore) : undefined,
		storeTransactions: selectedStore ? await getStoreTransactions(selectedStore) : undefined
	};
	return [replace(path('diagnostics'), diagnostics)];
});

/**
 * Set a property of the interface state
 */
export const setInterfacePropertyCommand = createCommand(({ payload: [key, value], path }) => {
	return [replace(path('interface', key), value)];
});

/**
 * Toggle a value in an expanded property array
 */
export const toggleExpandedCommand = createCommand(({ get, path, payload: [key, id, value] }) => {
	const keyPath = path('interface', 'expandedProperties', key);
	if (!get(keyPath)) {
		return [add(keyPath, { [id]: [value] })];
	}
	const idPath = path('interface', 'expandedProperties', key, id);
	const expanded = get(idPath);
	if (!expanded) {
		return [add(idPath, [value])];
	}
	const indexOfValue = expanded.indexOf(value);
	if (indexOfValue >= 0) {
		const newExpanded = [...expanded];
		newExpanded.splice(indexOfValue, 1);
		return [replace(idPath, newExpanded)];
	}
	return [replace(idPath, [...expanded, value as string])];
});
