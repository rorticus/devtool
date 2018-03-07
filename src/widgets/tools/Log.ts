import { DiagnosticChannelMessage, DiagnosticInputChannel } from '@dojo/diagnostics/interfaces';
import { Subscription } from '@dojo/shim/Observable';
import { v } from '@dojo/widget-core/d';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';

export interface LogProperties {
	inputChannel: DiagnosticInputChannel;
}

export class Panel extends WidgetBase<LogProperties> {
	messages: DiagnosticChannelMessage[] = [];
	subscription: Subscription;

	constructor() {
		super();
	}

	protected render() {
		if (!this.subscription) {
			this.subscription = this.properties.inputChannel.listen().subscribe((message) => {
				this.messages.push(message);
				this.invalidate();
			});
		}

		return v('div', {}, this.messages.map((message) => v('div', {}, [message.eventId])));
	}
}

export default Panel;
