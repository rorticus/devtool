import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import Store from '@dojo/stores/Store';

export interface Diagnostics {
	eventLog: DiagnosticAPI['eventLog'];
	projectors: string[];
	lastRender: SerializedDNode;
	stores: string[];
	storeState: any;
}

export interface InterfaceState {
	activeIndex: number;
	apiVersion?: string;
	selectedDNode?: string;
	selectedEventId?: number;
	view?: 'vdom' | 'logs' | 'store';
}

export interface DevToolState {
	diagnostics: Diagnostics;
	interface: InterfaceState;
}

export type DevToolStore = Store<DevToolState>;
