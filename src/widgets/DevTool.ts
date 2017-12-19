import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
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
import StoreState from './StoreState';
import VDom from './VDom';
import { DevToolState } from '../state/interfaces';

import devToolTheme from '../themes/devtool/index';

import * as devtoolCss from './styles/devtool.m.css';
import * as icons from './styles/icons.m.css';

export const ThemedBase = ThemedMixin(WidgetBase);

type CurrentNode = { children?: CurrentNode[]; rendered?: CurrentNode[] } | undefined | null | string;

function findDNode(root: SerializedDNode, path: string): SerializedDNode {
	const segments = path.split('/');
	segments.shift();
	if (!segments.length) {
		return;
	}
	let current: CurrentNode = { children: [root] };
	while (segments.length) {
		if (!current || typeof current === 'string' || (!current.rendered && !current.children)) {
			return;
		}
		const index = Number(segments.shift());
		current = (current.rendered && current.rendered[index]) || current.children![index];
	}
	return current as SerializedDNode;
}

export interface DevToolProperties extends ThemedProperties {
	activeIndex: DevToolState['interface']['activeIndex'];
	apiVersion: DevToolState['interface']['apiVersion'];
	diagnostics: DevToolState['diagnostics'];
	eventLog: DevToolState['eventLog'];
	projectors: DevToolState['projectors'];
	refreshDiagnostics(): Promise<void>;
	render: DevToolState['render'];
	selectedDNode: DevToolState['interface']['selectedDNode'];
	selectedEventId: DevToolState['interface']['selectedEventId'];
	setActiveIndex(index: DevToolState['interface']['activeIndex']): void;
	setEventLog(eventLog: DevToolState['eventLog']): void;
	setProjectors(projectos: DevToolState['projectors']): void;
	setRender(render: DevToolState['render']): void;
	setSelectedDNode(node: DevToolState['interface']['selectedDNode']): void;
	setSelectedEventId(id: DevToolState['interface']['selectedEventId']): void;
	setView(view: DevToolState['interface']['view']): void;
	view: DevToolState['interface']['view'];

	onCheckVersion?(): void;
}

@theme(devtoolCss)
@theme(icons)
export class DevTool extends ThemedBase<DevToolProperties> {
	private _listValueFormat(value: any, key: string) {
		if ((key === 'innerRender' || key === 'outerRender') && typeof value === 'number') {
			return value.toFixed(2);
		}
		return String(value);
	}

	private async _onLastRenderClick() {
		const { projectors, setProjectors, setRender, setView } = this.properties;
		try {
			let localProjectors = projectors;
			if (!localProjectors) {
				setProjectors((localProjectors = await getProjectors()));
			}
			setRender(await getLastRender(localProjectors[0]));
		} catch (e) {
			setRender(undefined);
			console.error(e);
		}
		setView('vdom');
	}

	private async _onLogsClick() {
		const { setEventLog, setView } = this.properties;
		try {
			setEventLog(await getEventLog());
		} catch (e) {
			console.error();
		}
		setView('logs');
	}

	private _onRefreshClick() {
		const { onCheckVersion } = this.properties;
		onCheckVersion && onCheckVersion();
	}

	private async _onStoreClick() {
		const { refreshDiagnostics, setView } = this.properties;
		refreshDiagnostics();
		setView('store');
	}

	private _onVDomSelect(id: string) {
		const { projectors, setSelectedDNode } = this.properties;
		if (projectors) {
			highlight(projectors[0], id);
		}
		setSelectedDNode(id);
	}

	private _renderLeft() {
		const {
			diagnostics,
			eventLog,
			render: root,
			selectedEventId: selected,
			setSelectedEventId,
			view
		} = this.properties;
		const left = v(
			'div',
			{
				classes: this.theme(devtoolCss.left)
			},
			[
				v(
					'div',
					{
						classes: this.theme(devtoolCss.leftHeader)
					},
					[
						v(
							'span',
							{
								classes: this.theme(devtoolCss.leftTitle)
							},
							[view && view === 'logs' ? 'Event Logs' : view ? 'Last Render' : 'Dojo 2 Development Tool']
						),
						w(
							ActionBar,
							{
								label: 'Actionbar Actions'
							},
							[
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
								}),
								w(ActionBarButton, {
									iconClass: this.theme(icons.stores),
									key: 'store',
									label: 'Display Store State',
									onClick: this._onStoreClick
								})
							]
						)
					]
				)
			]
		);
		let viewDom: DNode = null;
		switch (view) {
			case 'logs':
				viewDom = w(EventLog, {
					key: 'eventLog',
					eventLog,
					selected,
					onSelect: setSelectedEventId
				});
				break;
			case 'vdom':
				viewDom = w(VDom, {
					key: 'vdom',
					root,
					onSelect: this._onVDomSelect
				});
				break;
			case 'store':
				console.log(diagnostics.storeState);
				viewDom = w(StoreState, {
					key: 'store'
				});
				break;
		}
		left.children!.push(viewDom);
		return left;
	}

	private _renderRight() {
		const { activeIndex, eventLog, render, selectedDNode, selectedEventId, setActiveIndex, view } = this.properties;
		const selected = render && selectedDNode ? findDNode(render, selectedDNode) : undefined;
		const items =
			view && view === 'logs'
				? eventLog && selectedEventId !== undefined ? eventLog[selectedEventId].data : undefined
				: selected && typeof selected !== 'string' ? selected.properties : undefined;
		return v(
			'div',
			{
				classes: this.theme(devtoolCss.right)
			},
			[
				w(
					TabController,
					{
						activeIndex,
						onRequestTabChange: setActiveIndex
					},
					[
						items
							? w(
									Tab,
									{
										key: 'properties',
										label: 'Properties',
										// TODO: Remove when https://github.com/dojo/widgets/issues/400 resolved
										theme: devToolTheme
									},
									[
										w(ItemList, {
											items,
											valueFormatter: this._listValueFormat
										})
									]
								)
							: null
					]
				)
			]
		);
	}

	protected render(): DNode {
		const { apiVersion } = this.properties;

		/* If we can't detect the diagnostics, we will render the No API message */
		if (!apiVersion) {
			return v(
				'div',
				{
					classes: this.theme(devtoolCss.noapi),
					key: 'noapi'
				},
				[
					v(
						'div',
						{
							classes: this.theme(devtoolCss.banner)
						},
						['No Dojo 2 diagnostics detected']
					),
					w(
						Button,
						{
							onClick: this._onRefreshClick
						},
						['Refresh']
					)
				]
			);
		}

		return v(
			'div',
			{
				classes: this.theme(devtoolCss.root),
				key: 'root'
			},
			[
				v(
					'div',
					{
						classes: this.theme(devtoolCss.content),
						key: 'content'
					},
					[this._renderLeft(), this._renderRight()]
				)
			]
		);
	}
}

export default DevTool;
