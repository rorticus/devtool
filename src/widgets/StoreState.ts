import { w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import TreePane from './TreePane';
import * as storestateCss from './styles/storestate.m.css';

export interface StoreStateProperties extends ThemedProperties {
	state?: { [key: string]: any };
}

const ThemedBase = ThemedMixin(WidgetBase);

@theme(storestateCss)
export class StoreState extends ThemedBase<StoreStateProperties> {
	protected render() {
		const { state } = this.properties;
		return state ? w(TreePane, {}) : null;
	}
}

export default StoreState;
