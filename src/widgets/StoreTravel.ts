import { v, w } from '@dojo/widget-core/d';
import { TypedTargetEvent } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import Slider from '@dojo/widgets/slider/Slider';
import * as icons from './styles/icons.m.css';
import * as storeTravelCss from './styles/storetravel.m.css';
import ActionBar, { ActionBarButton } from './ActionBar';

export interface StoreTravelProperties extends ThemedProperties {
	historyLength: number;
	redoLength: number;

	onTravel?(distance: number): void;
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(storeTravelCss)
@theme(icons)
export class StoreTravel extends ThemedBase<StoreTravelProperties> {
	private _onBackwardsClick() {
		const { historyLength, onTravel } = this.properties;
		// disallowing time travel to first command, the init command, ugly things happen if this occurs
		if (historyLength > 1 && onTravel) {
			onTravel(-1);
		}
	}

	private _onForwardsClick() {
		const { redoLength, onTravel } = this.properties;
		if (redoLength && onTravel) {
			onTravel(1);
		}
	}

	private _onInput(evt: TypedTargetEvent<HTMLInputElement>) {
		const { historyLength, onTravel } = this.properties;
		const value = parseFloat(evt.target.value);
		const distance = value - historyLength;
		// disallowing time travel to first command, the init command, ugly things happen if this occurs
		if ((historyLength <= 1 && distance < 0) || value === 0) {
			return;
		}
		onTravel && onTravel(distance);
	}

	private _sliderOutput(value: number) {
		const { redoLength } = this.properties;
		return `${value}/${value + redoLength} commands`;
	}

	protected render() {
		const { properties: { historyLength, redoLength } } = this;
		return v('div', { classes: this.theme(storeTravelCss.root) }, [
			v('div', { classes: this.theme(storeTravelCss.ops), key: 'log' }, ['log of ops']),
			v('div', { classes: this.theme(storeTravelCss.timeline), key: 'timeline' }, [
				v('div', { classes: this.theme(storeTravelCss.slider) }, [
					w(Slider, {
						key: 'slider',
						value: historyLength,
						min: 0,
						max: historyLength + redoLength,
						output: this._sliderOutput,

						onInput: this._onInput
					})
				]),
				w(ActionBar, { label: 'Time Travel Controls' }, [
					w(ActionBarButton, {
						iconClass: [
							this.theme(icons.backwards),
							historyLength === 0 ? this.theme(icons.disabled) : null
						],
						key: 'backwards',
						label: 'Step backwards in store state',

						onClick: this._onBackwardsClick
					}),
					w(ActionBarButton, {
						iconClass: [this.theme(icons.forwards), redoLength === 0 ? this.theme(icons.disabled) : null],
						key: 'forwards',
						label: 'Step forwards in store state',

						onClick: this._onForwardsClick
					})
				])
			])
		]);
	}
}

export default StoreTravel;
