import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import Store from '@dojo/stores/Store';

export interface Diagnostics {
	eventLog: DiagnosticAPI['eventLog'];
	projectors: string[];
	lastRender: SerializedDNode;
	stores: string[];
	storeState?: object;
	storeTransactions?: { history: number; redo: number };
}

export interface InterfaceState {
	activeIndex: number;
	apiVersion?: string;
	expandedDNodes: string[];
	expandedProperties: {
		[key: string]: { [id: string]: string[] };
	};
	expandedStateNodes: string[];
	selectedDNode?: string;
	selectedEventId?: number;
	selectedProjector?: string;
	selectedStateNode?: string;
	selectedStore?: string;
	view?: 'vdom' | 'logs' | 'store' | 'travel';
}

export interface DevToolState {
	diagnostics: Diagnostics;
	interface: InterfaceState;
}

export type DevToolStore = Store<DevToolState>;
