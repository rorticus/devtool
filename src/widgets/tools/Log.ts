import { DiagnosticChannelMessage, DiagnosticInputChannel } from '@dojo/diagnostics/interfaces';
import { v } from '@dojo/widget-core/d';
import { theme } from '@dojo/widget-core/main';
import { I18nMixin, I18nProperties } from '@dojo/widget-core/mixins/I18n';
import { ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { handleFromSubscription } from '../../utils/handles';
import * as css from '../styles/tools/log.m.css';

export interface LogProperties extends ThemedProperties, I18nProperties {
	inputChannel: DiagnosticInputChannel;
}

export const LogBase = I18nMixin(ThemedMixin(WidgetBase));

@theme(css)
export class Log extends LogBase<LogProperties> {
	messages: DiagnosticChannelMessage[] = [];
	private initialized = false;

	constructor() {
		super();
	}

	protected render() {
		if (!this.initialized) {
			this.initialized = true;
			this.own(
				handleFromSubscription(
					this.properties.inputChannel.listen().subscribe((message) => {
						this.messages.push(message);
						this.invalidate();
					})
				)
			);
		}

		return v(
			'div',
			{ classes: this.theme(css.logContainer) },
			this.messages.map((message) => v('div', {}, [message.eventId]))
		);
	}
}

export default Log;
