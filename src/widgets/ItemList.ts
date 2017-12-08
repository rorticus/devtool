import { v } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import * as itemListCss from './styles/itemlist.m.css';

export interface PropertiesListProperties extends ThemedProperties {
	items?: { [key: string]: any };
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(itemListCss)
export class ItemList extends ThemedBase<PropertiesListProperties> {
	private _renderProperties(): DNode[] | undefined {
		const { items } = this.properties;
		const keys = items && Object.keys(items) || [];
		if (!items || !keys.length) {
			return [
				v('div', {
					classes: this.theme(itemListCss.empty)
				}, [
					v('p', { }, [ 'empty' ])
				])
			];
		}
		const children: DNode[] = [];
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			children.push(v('li', {
				classes: this.theme(itemListCss.item),
				key
			}, [
				v('span', {
					classes: this.theme(itemListCss.key),
					key: 'key'
				}, [ key ]),
				v('span', {
					classes: this.theme(itemListCss.value),
					key: 'value'
				}, [ String(items[key]) ])
			]));
		}
		return [
			v('ol', {
				classes: this.theme(itemListCss.list)
			}, children)
		];
	}

	protected render() {
		return v('div', {
			classes: this.theme(itemListCss.root)
		}, this._renderProperties());
	}
}

export default ItemList;
