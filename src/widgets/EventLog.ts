import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { v } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import * as moment from 'moment';

import * as eventLogCss from './styles/eventlog.m.css';

export interface EventLogProperties extends ThemedProperties {
	eventLog?: DiagnosticAPI['eventLog'];
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(eventLogCss)
export class EventLog extends ThemedBase<EventLogProperties> {
	protected render(): DNode {
		const { eventLog } = this.properties;
		if (!eventLog) {
			return null;
		}
		return v('div', {
			classes: this.theme(eventLogCss.root)
		}, [
			v('table', {}, [
				v('thead', {}, [
					v('tr', {}, [
						v('th', {}, [ 'Time' ]),
						v('th', {}, [ 'Level' ]),
						v('th', {}, [ 'Type' ]),
						v('th', {}, [ 'Information' ])
					])
				]),
				v('tbody', {}, eventLog.map((logEvent, idx) => {
					const { data, level, timestamp, type } = logEvent;
					return v('tr', {
						key: idx
					}, [
						v('td', {}, [ moment(timestamp).toISOString() ]),
						v('td', {}, [ level ]),
						v('td', {}, [ type ]),
						v('td', {}, [ v('pre', {}, [ data ? JSON.stringify(data, null, '  ') : null ]) ])
					]);
				}))
			])
		]);
	}
}

export default EventLog;
