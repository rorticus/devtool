import { v, w } from '@dojo/widget-core/d';
import { auto } from '@dojo/widget-core/diff';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import diffProperty from '@dojo/widget-core/decorators/diffProperty';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import TreePane, { TreePaneItem } from './TreePane';
import * as storestateCss from './styles/storestate.m.css';

export interface StoreStateProperties extends ThemedProperties {
	expanded?: string[];
	selected?: string;
	state?: object;

	onItemSelect?(id: string): void;
	onItemToggle?(id: string): void;
}

const ThemedBase = ThemedMixin(WidgetBase);

function createTreePaneItem(
	id: string,
	label: DNode | DNode[],
	title: string,
	iconClass?: string | undefined | null,
	children?: TreePaneItem[]
): TreePaneItem {
	return { children, iconClass, id, label, title };
}

@theme(storestateCss)
export class StoreState extends ThemedBase<StoreStateProperties> {
	private _root?: TreePaneItem;

	private _getChild(
		key: string,
		value:
			| ((...args: any[]) => any)
			| { [key: string]: any }
			| any[]
			| symbol
			| string
			| number
			| boolean
			| null
			| undefined,
		id: string
	): TreePaneItem {
		if (value === null) {
			return createTreePaneItem(id, this._getLabel(key, 'null'), `Null - ${id}`, this.theme(storestateCss.empty));
		}
		if (value === undefined) {
			return createTreePaneItem(
				id,
				this._getLabel(key, 'undefined'),
				`Undefined - ${id}`,
				this.theme(storestateCss.empty)
			);
		}
		if (typeof value === 'string') {
			return createTreePaneItem(
				id,
				this._getLabel(key, `"${value}"`),
				`String - ${id}`,
				this.theme(storestateCss.string)
			);
		}
		if (typeof value === 'number') {
			return createTreePaneItem(
				id,
				this._getLabel(key, String(value)),
				`Number - ${id}`,
				this.theme(storestateCss.number)
			);
		}
		if (typeof value === 'boolean') {
			return createTreePaneItem(
				id,
				this._getLabel(key, value ? 'true' : 'false'),
				`Boolean - ${id}`,
				this.theme(storestateCss.bool)
			);
		}
		if (typeof value === 'symbol') {
			return createTreePaneItem(
				id,
				this._getLabel(key, String(value)),
				`Symbol - ${id}`,
				this.theme(storestateCss.symbol)
			);
		}
		if (typeof value === 'function') {
			const functionName: string = (value as any).name || '[Anonymous]';
			return createTreePaneItem(
				id,
				this._getLabel(key, functionName),
				`Function - ${id}`,
				this.theme(storestateCss.func)
			);
		}
		if (Array.isArray(value)) {
			return this._mapArray(value, key, id);
		}
		return this._mapObject(value, key, id);
	}

	private _getLabel(key: string, value: string) {
		return v('span', { classes: this.theme(storestateCss.label), key: 'label' }, [
			v('span', { classes: this.theme(storestateCss.key), key: 'key' }, [key]),
			v('span', { key: 'seperator' }, [': ']),
			v('span', { classes: this.theme(storestateCss.value), key: 'value' }, [value])
		]);
	}

	private _mapArray(item: any[], label: string, path = ''): TreePaneItem {
		const id = `${path}/`;
		return createTreePaneItem(
			id,
			v('span', { classes: this.theme(storestateCss.label), key: 'label' }, [
				v('span', { classes: this.theme(storestateCss.key), key: 'key' }, [label])
			]),
			`Array`,
			this.theme(storestateCss.arr),
			item.map((value, idx) => this._getChild(`[${idx}]`, value, `${id}${idx}`))
		);
	}

	private _mapObject(item: { [key: string]: any }, label: string, path = ''): TreePaneItem {
		const id = `${path}/`;
		return createTreePaneItem(
			id,
			v('span', { classes: this.theme(storestateCss.label), key: 'label' }, [
				v('span', { classes: this.theme(storestateCss.key), key: 'key' }, [label])
			]),
			`Object - ${id}`,
			this.theme(storestateCss.obj),
			Object.keys(item).map((key) => this._getChild(key, item[key], `${id}${key}`))
		);
	}

	@diffProperty('root', auto)
	protected onRootChange(): void {
		this._root = undefined;
	}

	protected render() {
		const { state } = this.properties;
		if (state && !this._root) {
			this._root = this._mapObject(state, '/');
		}
		const { _root: root, properties: { expanded, selected, onItemSelect, onItemToggle } } = this;
		return root
			? w(TreePane, {
					expanded,
					root,
					selected,
					showRoot: true,
					toggleOnArrowClick: true,

					onItemSelect,
					onItemToggle
				})
			: null;
	}
}

export default StoreState;
