import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import { v, w } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ThemedMixin, { theme, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import AccordionPane from '@dojo/widgets/accordionpane/AccordionPane';
import Button from '@dojo/widgets/button/Button';
import TitlePane from '@dojo/widgets/titlepane/TitlePane';
import { getLastRender, highlight } from '../diagnostics';
import ItemList from './ItemList';
import VDom from './VDom';

import * as devtoolCss from './styles/devtool.m.css';

export const ThemedBase = ThemedMixin(WidgetBase);

type CurrentNode = { children?: CurrentNode[] } | undefined | null | string;

function findDNode(root: SerializedDNode, path: string): SerializedDNode {
	const segments = path.split('/');
	segments.shift();
	if (!segments.length) {
		return;
	}
	let current: CurrentNode = { children: [ root ] };
	while (segments.length) {
		if (!current || typeof current === 'string' || !current.children) {
			return;
		}
		const index = Number(segments.shift());
		current = current.children[index];
	}
	return current as SerializedDNode;
}

export interface DevToolProperties extends ThemedProperties {
	apiVersion?: string;

	onCheckVersion?(): void;
}

export interface LastRenderProperties extends WidgetProperties {
	onSelect?(item: SerializedDNode): void;
}

export class LastRender extends WidgetBase<LastRenderProperties> {
	private _dnode?: SerializedDNode;

	private _onVDomSelect(id: string) {
		highlight('main', id);
		const { onSelect } = this.properties;
		if (this._dnode && onSelect) {
			onSelect(findDNode(this._dnode, id));
		}
	}

	private async _onLastRenderClick() {
		try {
			this._dnode = await getLastRender('main');
		}
		catch (e) {
			this._dnode = undefined;
			console.error(e);
		}
		this.invalidate();
	}

	protected render() {
		return [
			w(Button, {
				onClick: this._onLastRenderClick
			}, [ 'Get Last Render' ]),
			w(VDom, {
				root: this._dnode,

				onSelect: this._onVDomSelect
			})
		];
	}
}

@theme(devtoolCss)
export class DevTool extends ThemedBase<DevToolProperties> {
	private _selected: SerializedDNode;

	private _onLastRenderSelect(node: SerializedDNode) {
		this._selected = node;
	}

	private _onRefreshClick() {
		const { onCheckVersion } = this.properties;
		onCheckVersion && onCheckVersion();
	}

	protected render(): DNode {
		const { _selected, properties: { apiVersion } } = this;
		if (!apiVersion) {
			return v('div', {
				classes: this.theme(devtoolCss.noapi),
				key: 'noapi'
			}, [
				v('div', {
					classes: this.theme(devtoolCss.banner)
				}, [ 'No Dojo 2 diagnostics detected']),
				w(Button, {
					onClick: this._onRefreshClick
				}, [ 'Refresh' ])
			]);
		}
		const items = _selected && typeof _selected !== 'string' ? _selected.properties : undefined;
		return v('div', {
			classes: this.theme(devtoolCss.root),
			key: 'root'
		}, [
			v('div', {
				classes: this.theme(devtoolCss.left)
			}, [
				w(LastRender, {
					onSelect: this._onLastRenderSelect
				})
			]),
			v('div', {
				classes: this.theme(devtoolCss.right)
			}, [
				w(AccordionPane, {
					openKeys: items ? [ 'properties' ] : undefined
				}, [
					w(TitlePane, {
						key: 'properties',
						title: 'Properties'
					}, [
						w(ItemList, {
							items
						})
					])
				])
			])
		]);
	}
}

export default DevTool;
