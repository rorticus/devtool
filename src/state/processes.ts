import { createProcess } from '@dojo/stores/process';
import { initCommand, refreshDiagnosticsCommand, setInterfacePropertyCommand } from './commands';

/**
 * Initialise the state of the store
 */
export const initProcess = createProcess([initCommand]);

/**
 * Read the diagnostic information and update the state store
 */
export const refreshDiagnosticsProcess = createProcess([refreshDiagnosticsCommand]);

/**
 * Set a property of the interface state in the state store
 */
export const setInterfacePropertyProcess = createProcess([setInterfacePropertyCommand]);
