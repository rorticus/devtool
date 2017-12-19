import { createProcess } from '@dojo/stores/process';
import {
	initCommand,
	setApiVersionCommand,
	setActiveIndexCommand,
	setDiagnosticsCommand,
	setEventLogCommand,
	setProjectorsCommand,
	setRenderCommand,
	setSelectedDNodeCommand,
	setSelectedEventIdCommand,
	setViewCommand
} from './commands';

export const initProcess = createProcess([initCommand]);

export const setActiveIndexProcess = createProcess([setActiveIndexCommand]);

export const setApiVersionProcess = createProcess([setApiVersionCommand]);

export const setDiagnosticsProcess = createProcess([setDiagnosticsCommand]);

export const setEventLogProcess = createProcess([setEventLogCommand]);

export const setProjectorsProcess = createProcess([setProjectorsCommand]);

export const setRenderProcess = createProcess([setRenderCommand]);

export const setSelectedDNodeProcess = createProcess([setSelectedDNodeCommand]);

export const setSelectedEventIdProcess = createProcess([setSelectedEventIdCommand]);

export const setViewProcess = createProcess([setViewCommand]);
