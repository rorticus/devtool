import { SerializedDNode, SerializedWNode } from '@dojo/diagnostics/serializeDNode';
import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ThemedMixin, { theme, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import Button from '@dojo/widgets/button/Button';
import Tab from '@dojo/widgets/tabcontroller/Tab';
import TabController from '@dojo/widgets/tabcontroller/TabController';
import { getLastRender, highlight, getProjectors, getEventLog } from '../diagnostics';
import ActionBar, { ActionBarButton } from './ActionBar';
import EventLog from './EventLog';
import ItemList from './ItemList';
import VDom from './VDom';

import devToolTheme from '../themes/devtool/index';

import * as devtoolCss from './styles/devtool.m.css';
import * as icons from './styles/icons.m.css';
import { DiagnosticAPI } from '@dojo/diagnostics/main';

export const ThemedBase = ThemedMixin(WidgetBase);

function isSerializedWNode(value: any): value is SerializedWNode {
	return value && typeof value === 'object' && value.type === 'wnode';
}

type CurrentNode = { children?: CurrentNode[], rendered?: CurrentNode[] } | undefined | null | string;

function findDNode(root: SerializedDNode, path: string): SerializedDNode {
	const segments = path.split('/');
	segments.shift();
	if (!segments.length) {
		return;
	}
	let current: CurrentNode = { children: [ root ] };
	while (segments.length) {
		if (!current || typeof current === 'string' || (!current.rendered && !current.children)) {
			return;
		}
		const index = Number(segments.shift());
		current = current.rendered && current.rendered[index] || current.children![index];
	}
	return current as SerializedDNode;
}

export interface DevToolProperties extends ThemedProperties {
	apiVersion?: string;

	onCheckVersion?(): void;
}

@theme(devtoolCss)
@theme(icons)
export class DevTool extends ThemedBase<DevToolProperties> {
	private _activeIndex = 0;
	private _dnode?: SerializedDNode;
	private _eventLog?: DiagnosticAPI['eventLog'];
	private _projectors?: string[];
	private _selectedId?: string;
	private _view?: 'vdom' | 'logs';

	private async _onLastRenderClick() {
		try {
			if (!this._projectors) {
				this._projectors = await getProjectors();
			}
			this._dnode = await getLastRender(this._projectors[0]);
		}
		catch (e) {
			this._dnode = undefined;
			console.error(e);
		}
		this._view = 'vdom';
		this.invalidate();
	}

	private async _onLogsClick() {
		try {
			this._eventLog = await getEventLog();
		}
		catch (e) {
			console.error();
		}
		this._view = 'logs';
		this.invalidate();
	}

	private _onRefreshClick() {
		const { onCheckVersion } = this.properties;
		onCheckVersion && onCheckVersion();
	}

	private _onRequestTabChange(index: number) {
		this._activeIndex = index;
		this.invalidate();
	}

	private _onVDomSelect(id: string) {
		if (this._projectors) {
			highlight(this._projectors[0], id);
		}
		this._selectedId = id;
	}

	private _renderLeft() {
		const { _dnode: root, _eventLog: eventLog, _view } = this;
		const left = v('div', {
			classes: this.theme(devtoolCss.left)
		}, [
			v('div', {
				classes: this.theme(devtoolCss.leftHeader)
			}, [
				v('span', {
					classes: this.theme(devtoolCss.leftTitle)
				}, [
					_view && _view === 'logs' ? 'Event Logs' : 'Last Render'
				]),
				w(ActionBar, {
					label: 'Actionbar Actions'
				}, [
					w(ActionBarButton, {
						iconClass: this.theme(icons.render),
						key: 'lastRender',
						label: 'Display Last Render',
						onClick: this._onLastRenderClick
					}),
					w(ActionBarButton, {
						iconClass: this.theme(icons.logs),
						key: 'logs',
						label: 'Display Event Logs',
						onClick: this._onLogsClick
					})
				])
			])
		]);
		const view = _view && _view === 'logs' ? w(EventLog, {
			key: 'eventLog',
			eventLog
		}) : w(VDom, {
			key: 'vdom',
			root,
			onSelect: this._onVDomSelect
		});
		left.children!.push(view);
		return left;
	}

	private _renderRight() {
		const { _activeIndex: activeIndex, _dnode, _selectedId } = this;
		const selected = _dnode && _selectedId ? findDNode(_dnode, _selectedId) : undefined;
		const items = selected && typeof selected !== 'string' ? selected.properties : undefined;
		const baseRegistry = isSerializedWNode(selected) && selected.coreProperties['baseRegistry'] ? JSON.parse(selected.coreProperties['baseRegistry'] as string) : undefined;
		return v('div', {
			classes: this.theme(devtoolCss.right)
		}, [
			w(TabController, {
				activeIndex,
				onRequestTabChange: this._onRequestTabChange
			}, [
				w(Tab, {
					key: 'properties',
					label: 'Properties',
					// TODO: Remove when https://github.com/dojo/widgets/issues/400 resolved
					theme: devToolTheme
				}, [
					w(ItemList, {
						items
					})
				]),
				baseRegistry ? w(Tab, {
					key: 'base-registry',
					label: 'Base Registry',
					theme: devToolTheme
				}, [
					w(ItemList, {
						items: baseRegistry
					})
				]) : null
			])
		]);
	}

	protected render(): DNode {
		const { apiVersion } = this.properties;

		/* If we can't detect the diagnostics, we will render the No API message */
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

		return v('div', {
			classes: this.theme(devtoolCss.root),
			key: 'root'
		}, [
			v('div', {
				classes: this.theme(devtoolCss.content),
				key: 'content'
			}, [
				this._renderLeft(),
				this._renderRight()
			])
		]);
	}
}

export default DevTool;
