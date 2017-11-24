import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';

declare const browser: typeof chrome;
const b: typeof chrome = (typeof browser !== 'undefined' && browser || typeof chrome !== 'undefined' && chrome) as any;

if (!b || !b.devtools) {
	throw new Error('Unable to resolve development tools API, unsupported environment!');
}

/**
 * The global variable in which the diagnostic APIs are being exposed.
 */
const DIAGNOSTIC_ROOT = '__dojo2_diagnostics__';

function inspectedWindowDiagnostics<T>(request: string): Promise<T> {
	return new Promise((resolve, reject) => {
		b.devtools.inspectedWindow.eval(`${DIAGNOSTIC_ROOT}.${request}`, (result, exceptionInfo) => {
			if (exceptionInfo) {
				reject(exceptionInfo);
			}
			else {
				resolve(result as T);
			}
		});
	});
}

export function getEventLog(): Promise<DiagnosticAPI['eventLog']> {
	return inspectedWindowDiagnostics('eventLog');
}

export function getLastRender(projector: string): Promise<SerializedDNode> {
	return inspectedWindowDiagnostics(`getProjectorLastRender('${projector}')`);
}

export function getProjectors(): Promise<string[]> {
	return inspectedWindowDiagnostics('getProjectors()');
}

export function version(): Promise<DiagnosticAPI['version']> {
	return inspectedWindowDiagnostics('version');
}

export function highlight(projector: string, path: string): Promise<void> {
	return inspectedWindowDiagnostics(`highlight('${projector}', '${path}')`);
}

export function unhighlight(): Promise<void> {
	return inspectedWindowDiagnostics(`unighlight()`);
}
