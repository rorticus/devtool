import { includes } from '@dojo/shim/array';
import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import Matches from '@dojo/widget-core/meta/Matches';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import * as itemListCss from './styles/itemlist.m.css';

export interface ItemListProperties<T extends Items> extends ThemedProperties {
	expanded?: (keyof T)[];
	getItemChildren?<K extends keyof T>(value: T[K], key: keyof T, items: T): Items | undefined;
	hasChildren?<K extends keyof T>(value: T[K], key: keyof T, items: T): boolean | undefined;
	items?: T;
	sort?(a: keyof T, b: keyof T): number;
	valueFormatter?<K extends keyof T>(value: T[K], key: keyof T, items: T): DNode | DNode[];

	onToggle?(key: keyof T): void;
}

interface ItemProperties extends ThemedProperties {
	alternate?: boolean;
	expandable?: boolean;
	isExpanded?: boolean;
	keyName: string;
	value: DNode | DNode[];

	onClick?(keyName: ItemProperties, isKey: boolean): void;
}

interface SubItemListProperties extends ThemedProperties {
	expanded?: string[];
	getItemChildren?(value: any, key: string, items: Items): Items | undefined;
	hasChildren?(value: any, key: string, items: Items): boolean | undefined;
	keyName: string;
	items: Items;
	sort?(a: string, b: string): number;
	valueFormatter?(value: any, key: string, items: Items): DNode | DNode[];

	onToggle?(key: string): void;
}

export type Items = { [key: string]: any };

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(itemListCss)
class Item extends ThemedBase<ItemProperties> {
	private _onclick(evt: MouseEvent) {
		const { onClick } = this.properties;
		onClick && onClick(this.properties, this.meta(Matches).get('key', evt));
	}

	protected render() {
		const { alternate, expandable, isExpanded, keyName, value } = this.properties;
		return v(
			'li',
			{
				classes: this.theme([
					itemListCss.item,
					alternate ? itemListCss.alternate : null,
					expandable ? itemListCss.expandable : null,
					isExpanded ? itemListCss.expanded : null
				]),
				key: keyName,
				onclick: this._onclick
			},
			[
				v('span', { classes: this.theme(itemListCss.key), key: 'key' }, [keyName]),
				v(
					'span',
					{ classes: this.theme(itemListCss.value), key: 'value' },
					Array.isArray(value) ? value : [value]
				)
			]
		);
	}
}

@theme(itemListCss)
class SubItemList extends ThemedBase<SubItemListProperties> {
	private _onItemClick(itemProperties: ItemProperties, isKey: boolean) {
		const { keyName: sourceKeyName, onToggle } = this.properties;
		const { expandable, keyName } = itemProperties;
		const path = `${sourceKeyName}/${keyName}`;
		onToggle && expandable && isKey && onToggle(path);
	}

	protected render() {
		const {
			expanded,
			hasChildren,
			items,
			keyName: sourceKeyName,
			getItemChildren,
			sort,
			valueFormatter,
			onToggle
		} = this.properties;
		const originalKeys = (items && Object.keys(items)) || [];
		const keys = (sort && originalKeys.sort(sort)) || originalKeys;
		const children: DNode[] = [];
		for (let i = 0; i < keys.length; i++) {
			const keyName = keys[i];
			const path = `${sourceKeyName}/${keyName}`;
			const origValue = items[keyName];
			const value = (valueFormatter && valueFormatter(origValue, path, items)) || String(origValue);
			const expandable = hasChildren ? hasChildren(origValue, path, items) : false;
			const isExpanded = expandable && expanded ? includes(expanded, path) : false;
			children.push(w(Item, { expandable, isExpanded, key: path, keyName, value, onClick: this._onItemClick }));
			if (isExpanded) {
				const subItems = getItemChildren && getItemChildren(origValue, path, items);
				if (subItems) {
					children.push(
						w(SubItemList, {
							expanded,
							getItemChildren,
							hasChildren,
							key: `sub-${keyName}`,
							keyName,
							items: subItems,
							sort,
							valueFormatter,
							onToggle
						})
					);
				}
			}
		}
		return v('ol', { classes: this.theme(itemListCss.sublist) }, children);
	}
}

@theme(itemListCss)
export class ItemList<T extends Items> extends ThemedBase<ItemListProperties<T>> {
	private _onItemClick(itemProperties: ItemProperties, isKey: boolean) {
		const { onToggle } = this.properties;
		const { expandable, keyName } = itemProperties;
		onToggle && expandable && isKey && onToggle(keyName);
	}

	protected render() {
		const { expanded, getItemChildren, hasChildren, items, sort, valueFormatter, onToggle } = this.properties;
		const originalKeys = (items && Object.keys(items)) || [];
		const keys = (sort && originalKeys.sort(sort)) || originalKeys;
		if (!items || !keys.length) {
			return [v('div', { classes: this.theme(itemListCss.empty) }, [v('p', {}, ['empty'])])];
		}
		const children: DNode[] = [];
		for (let i = 0; i < keys.length; i++) {
			const keyName = keys[i];
			const origValue = items[keyName];
			const value = (valueFormatter && valueFormatter(origValue, keyName, items)) || String(origValue);
			const alternate = i % 2 !== 0;
			const expandable = hasChildren ? hasChildren(origValue, keyName, items) : false;
			const isExpanded = expandable && expanded ? includes(expanded, keyName) : false;
			children.push(
				w(Item, { alternate, expandable, isExpanded, key: keyName, keyName, value, onClick: this._onItemClick })
			);
			if (isExpanded) {
				const subItems = getItemChildren && getItemChildren(origValue, keyName, items);
				if (subItems) {
					children.push(
						w(SubItemList, {
							expanded,
							getItemChildren,
							hasChildren,
							key: `sub-${keyName}`,
							keyName,
							items: subItems,
							sort,
							valueFormatter,
							onToggle
						})
					);
				}
			}
		}
		return v('div', { classes: this.theme(itemListCss.root) }, [
			v('ol', { classes: this.theme(itemListCss.list) }, children)
		]);
	}
}

export default ItemList;
