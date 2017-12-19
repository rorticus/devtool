import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import { v, w } from '@dojo/widget-core/d';
import { includes } from '@dojo/shim/array';
import Map from '@dojo/shim/Map';
import { auto } from '@dojo/widget-core/diff';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import diffProperty from '@dojo/widget-core/decorators/diffProperty';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import TreePane, { TreePaneItem } from './TreePane';
import * as vdomCss from './styles/vdom.m.css';

export interface VDomProperties extends ThemedProperties {
	root?: SerializedDNode;

	onSelect?(id: string): void;
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(vdomCss)
export class VDom extends ThemedBase<VDomProperties> {
	private _expanded: string[] = [];
	private _selected: string;
	private _treeItemMap = new Map<string, TreePaneItem>();
	private _root: TreePaneItem | undefined;

	private _createTreePaneItem(
		id: string,
		label: DNode | DNode[],
		title: string,
		children?: TreePaneItem[]
	): TreePaneItem {
		const item = { children, id, label, title };
		this._treeItemMap.set(id, item);
		return item;
	}

	private _getItemIconClass = (item: TreePaneItem): string | undefined | null => {
		if (item.title.indexOf('Widget') >= 0) {
			return this.theme(vdomCss.wnode);
		}
		if (item.title.indexOf('Virtual DOM') >= 0) {
			return this.theme(vdomCss.hnode);
		}
		if (item.label && typeof item.label === 'string' && item.label.indexOf('String(') >= 0) {
			return this.theme(vdomCss.string);
		}
		return this.theme(vdomCss.empty);
	};

	private _mapNodes(node: SerializedDNode, path: string = '', index: number = 0): TreePaneItem {
		const id = `${path}/${index}`;
		if (node === null) {
			return this._createTreePaneItem(id, 'Null', id);
		}
		if (typeof node === 'string') {
			return this._createTreePaneItem(id, `String('${node}')`, id);
		}
		if (!node) {
			return this._createTreePaneItem(id, 'Undefined', id);
		}
		const key =
			(node.properties && node.properties.key && typeof node.properties.key === 'string') ||
			typeof node.properties.key === 'number'
				? v(
						'span',
						{
							classes: this.theme(vdomCss.keyLabel),
							key: 'key'
						},
						[
							v('i', {
								'aria-hidden': true,
								'aria-label': 'Key',
								classes: this.theme(vdomCss.key),
								role: 'presentation'
							}),
							`${node.properties.key}`
						]
					)
				: null;
		if (node.type === 'hnode') {
			const labelNode = v('span', {}, [node.tag || (node.text && `"${node.text}"`) || 'Virtual DOM']);
			const label = [labelNode, key];
			const children =
				node.children && node.children.length
					? node.children.map((child, idx) => this._mapNodes(child, id, idx))
					: undefined;
			return this._createTreePaneItem(id, label, `Virtual DOM - ${id}`, children);
		}
		const labelNode = v('span', {}, [node.widgetConstructor || 'Widget']);
		const label = [labelNode, key];
		const children = node.rendered.length
			? node.rendered.map((child, idx) => this._mapNodes(child, id, idx))
			: undefined;
		return this._createTreePaneItem(id, label, `Widget - ${id}`, children);
	}

	private _onItemSelect(id: string) {
		this._selected = id;
		const { onSelect } = this.properties;
		onSelect && onSelect(id);
	}

	private _onItemToggle(id: string) {
		const { _expanded } = this;
		if (includes(_expanded, id)) {
			_expanded.splice(_expanded.indexOf(id), 1);
		} else {
			_expanded.push(id);
		}
		this.invalidate();
	}

	@diffProperty('root', auto)
	protected onRootChange(): void {
		this._treeItemMap.clear();
	}

	protected render(): DNode {
		if (this.properties.root && !this._treeItemMap.size) {
			this._root = this._mapNodes(this.properties.root);
		}
		const { _expanded: expanded, _root: root, _selected: selected } = this;
		return root
			? w(TreePane, {
					expanded,
					getItemIconClass: this._getItemIconClass,
					root,
					selected,
					showRoot: true,
					toggleOnArrowClick: true,
					onItemSelect: this._onItemSelect,
					onItemToggle: this._onItemToggle
				})
			: null;
	}
}

export default VDom;
