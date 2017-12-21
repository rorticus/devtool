import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import { v, w } from '@dojo/widget-core/d';
import { auto } from '@dojo/widget-core/diff';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import diffProperty from '@dojo/widget-core/decorators/diffProperty';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import TreePane, { TreePaneItem } from './TreePane';
import * as vdomCss from './styles/vdom.m.css';

export interface VDomProperties extends ThemedProperties {
	expanded?: string[];
	root?: SerializedDNode;
	selected?: string;

	onItemSelect?(id: string): void;
	onItemToggle?(id: string): void;
}

function createTreePaneItem(
	id: string,
	label: DNode | DNode[],
	title: string,
	iconClass: string | undefined | null,
	children?: TreePaneItem[]
): TreePaneItem {
	return { children, iconClass, id, label, title };
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(vdomCss)
export class VDom extends ThemedBase<VDomProperties> {
	private _root: TreePaneItem | undefined;

	private _mapNodes(node: SerializedDNode, path: string = '', index: number = 0): TreePaneItem {
		const id = `${path}/${index}`;
		if (node === null) {
			return createTreePaneItem(id, 'Null', id, this.theme(vdomCss.empty));
		}
		if (typeof node === 'string') {
			return createTreePaneItem(id, `String('${node}')`, id, this.theme(vdomCss.string));
		}
		if (!node) {
			return createTreePaneItem(id, 'Undefined', id, this.theme(vdomCss.empty));
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
			return createTreePaneItem(id, label, `Virtual DOM - ${id}`, this.theme(vdomCss.hnode), children);
		}
		const labelNode = v('span', {}, [node.widgetConstructor || 'Widget']);
		const label = [labelNode, key];
		const children = node.rendered.length
			? node.rendered.map((child, idx) => this._mapNodes(child, id, idx))
			: undefined;

		return createTreePaneItem(id, label, `Widget - ${id}`, this.theme(vdomCss.wnode), children);
	}

	@diffProperty('root', auto)
	protected onRootChange(): void {
		this._root = undefined;
	}

	protected render(): DNode {
		if (this.properties.root && !this._root) {
			this._root = this._mapNodes(this.properties.root);
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

export default VDom;
