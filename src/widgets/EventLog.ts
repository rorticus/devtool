import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import * as moment from 'moment';

export interface EventLogProperties extends WidgetProperties {
	eventLog?: DiagnosticAPI['eventLog'];
}

export class EventLog extends WidgetBase<EventLogProperties> {
	protected render(): DNode {
		const { eventLog } = this.properties;
		if (!eventLog) {
			return null;
		}
		return v('table', {}, [
			v('thead', {}, [
				v('tr', {}, [
					v('th', {}, [ 'Time' ]),
					v('th', {}, [ 'Level' ]),
					v('th', {}, [ 'Type' ]),
					v('th', {}, [ 'Information' ])
				])
			]),
			v('tbody', {}, eventLog.map((logEvent) => {
				const { data, level, timestamp, type } = logEvent;
				return v('tr', {}, [
					v('td', {}, [ moment(timestamp).toISOString() ]),
					v('td', {}, [ level ]),
					v('td', {}, [ type ]),
					v('td', {}, [ v('pre', {}, [ data ? JSON.stringify(data, null, '  ') : null ]) ])
				]);
			}))
		]);
	}
}

export default EventLog;
