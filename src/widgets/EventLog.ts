import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { v } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import * as moment from 'moment';
import 'moment-duration-format';

import * as eventLogCss from './styles/eventlog.m.css';

export interface EventLogProperties extends ThemedProperties {
	eventLog?: DiagnosticAPI['eventLog'];
	selected?: number;
	onSelect?(index: number): void;
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(eventLogCss)
export class EventLog extends ThemedBase<EventLogProperties> {
	private _onclickTr(event: MouseEvent) {
		const { onSelect } = this.properties;
		if (!onSelect) {
			return;
		}
		let i = 0;
		let target = event.currentTarget as Element | null;
		while ((target = target!.previousElementSibling)) {
			i++;
		}
		onSelect(i);
	}

	protected render(): DNode {
		const { eventLog, selected } = this.properties;
		let firstTimestamp: number;
		if (!eventLog) {
			return null;
		}
		return v(
			'div',
			{
				classes: this.theme(eventLogCss.root)
			},
			[
				v('table', {}, [
					v('thead', {}, [
						v('tr', {}, [v('th', {}, ['Time']), v('th', {}, ['Level']), v('th', {}, ['Type'])])
					]),
					v(
						'tbody',
						{},
						eventLog.map((logEvent, idx) => {
							const { level, timestamp, type } = logEvent;
							if (!firstTimestamp) {
								firstTimestamp = timestamp;
							}
							return v(
								'tr',
								{
									classes: selected === idx ? this.theme(eventLogCss.selected) : null,
									key: idx,
									onclick: this._onclickTr
								},
								[
									v('td', {}, [
										timestamp === firstTimestamp
											? moment(timestamp).toLocaleString()
											: moment
													.duration(timestamp - firstTimestamp)
													.format('[+]mm:ss.SSS', { trim: false })
									]),
									v('td', {}, [level]),
									v('td', {}, [type])
								]
							);
						})
					)
				])
			]
		);
	}
}

export default EventLog;
