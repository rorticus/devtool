import { DiagnosticChannelMessage, DiagnosticInputChannel } from '@dojo/diagnostics/interfaces';
import { v, w } from '@dojo/widget-core/d';
import { theme } from '@dojo/widget-core/main';
import { I18nMixin, I18nProperties } from '@dojo/widget-core/mixins/I18n';
import { ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import Checkbox from '@dojo/widgets/checkbox';
import { handleFromSubscription } from '../../utils/handles';
import * as css from '../styles/tools/widgets.m.css';

export interface WidgetsProperties extends ThemedProperties, I18nProperties {
	inputChannel: DiagnosticInputChannel;
	highlightWidgetInvalidations: boolean;
	onHighlightInvalidations: (shouldHighlight: boolean) => void;
}

export const WidgetsBase = I18nMixin(ThemedMixin(WidgetBase));

@theme(css)
export class Widgets extends WidgetsBase<WidgetsProperties> {
	messages: DiagnosticChannelMessage[] = [];
	private initialized = false;

	constructor() {
		super();
	}

	protected render() {
		const { highlightWidgetInvalidations } = this.properties;

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

		return v('div', { classes: this.theme(css.root) }, [
			w(Checkbox, {
				checked: highlightWidgetInvalidations,
				label: 'Highlight Widget Invalidations',
				onChange: this.onHighlightChanged
			})
		]);
	}

	private onHighlightChanged() {
		this.properties.onHighlightInvalidations(!this.properties.highlightWidgetInvalidations);
	}
}

export default Widgets;
