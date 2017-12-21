import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import { ProcessError, ProcessResult } from '@dojo/stores/process';
import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ThemedMixin, { theme, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import Button from '@dojo/widgets/button/Button';
import Tab from '@dojo/widgets/tabcontroller/Tab';
import TabController from '@dojo/widgets/tabcontroller/TabController';
import { highlight } from '../diagnostics';
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

/**
 * A "shell" interface for walking nodes of a SerliazedDNode tree
 */
type CurrentNode = { children?: CurrentNode[]; rendered?: CurrentNode[] } | undefined | null | string;

/**
 * An internal function which returns a child serialized DNode based on the path from the root
 * @param root The serialized DNode to serve as the root to search
 * @param path The path from the root to retrieve the DNode
 */
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
	/**
	 * The diagnostic information available to the devtool
	 */
	diagnostics: DevToolState['diagnostics'];

	/**
	 * A state of the user interface
	 */
	interface: DevToolState['interface'];

	/**
	 * Refresh/update the diagnostics for the devtool
	 */
	refreshDiagnostics(): Promise<ProcessResult<DevToolState> | ProcessError<DevToolState>>;

	/**
	 * Update a property of the user interface state
	 */
	setInterfaceProperty<K extends keyof DevToolState['interface']>(
		key: K,
		value: DevToolState['interface'][K]
	): Promise<ProcessResult<DevToolState> | ProcessError<DevToolState>>;

	/**
	 * Check the version of the diagnostic API of the inspected applications
	 */
	onCheckVersion?(): void;
}

/**
 * A function which converts a state object and path to a set of properties for display purposes
 * @param state The state object to inspect
 * @param path The path to the value to convert
 */
function getKeyProperties(state: any, path: string): { [key: string]: string | number | boolean | undefined | null } {
	const parts = path.split('/');
	const actualValue = parts.reduce((previous, currentPath) => {
		return currentPath ? previous[currentPath] : previous;
	}, state);
	let value: string | number | boolean | undefined | null;
	let type: string;
	if (actualValue === null) {
		value = '@@null';
		type = 'null';
	} else if (typeof actualValue === 'undefined') {
		value = '@@undefined';
		type = 'undefined';
	} else if (typeof actualValue === 'string' || typeof actualValue === 'number' || typeof actualValue === 'boolean') {
		value = actualValue;
		type = typeof actualValue;
	} else if (typeof actualValue === 'symbol') {
		value = String(actualValue);
		type = 'symbol';
	} else if (typeof actualValue === 'function') {
		value = (actualValue as any).name || 'Anonymous';
		type = 'function';
	} else {
		value = JSON.stringify(actualValue);
		type = Array.isArray(actualValue) ? 'array' : 'object';
	}
	return {
		path,
		type,
		value
	};
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

	private _onEventSelect(id: number) {
		const { setInterfaceProperty } = this.properties;
		setInterfaceProperty('selectedEventId', id);
	}

	private async _onLastRenderClick() {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		refreshDiagnostics();
		setInterfaceProperty('view', 'vdom');
	}

	private async _onLogsClick() {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		refreshDiagnostics();
		setInterfaceProperty('view', 'logs');
	}

	private _onRefreshClick() {
		const { onCheckVersion } = this.properties;
		onCheckVersion && onCheckVersion();
	}

	private _onRequestTabChange(id: number) {
		const { setInterfaceProperty } = this.properties;
		setInterfaceProperty('activeIndex', id);
	}

	private _onStateSelect(id: string) {
		const { setInterfaceProperty } = this.properties;
		setInterfaceProperty('selectedStateNode', id);
	}

	private async _onStoreClick() {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		await refreshDiagnostics();
		setInterfaceProperty('view', 'store');
	}

	private _onVDomSelect(id: string) {
		const { diagnostics: { projectors }, setInterfaceProperty } = this.properties;
		if (projectors.length) {
			highlight(projectors[0], id);
		}
		setInterfaceProperty('selectedDNode', id);
	}

	/**
	 * Render the left (leading) part of the user interface
	 */
	private _renderLeft() {
		const {
			diagnostics,
			interface: { selectedDNode, selectedEventId: selected, selectedStateNode, view }
		} = this.properties;
		const { eventLog, lastRender: root, storeState: state } = diagnostics;

		let viewDom: DNode = null;
		let title = 'Dojo 2 Development Tool';
		switch (view) {
			case 'logs':
				title = 'Event Log';
				viewDom = w(EventLog, {
					key: 'eventLog',
					eventLog,
					selected,
					onSelect: this._onEventSelect
				});
				break;
			case 'vdom':
				title = 'Last Render';
				viewDom = w(VDom, {
					key: 'vdom',
					root,
					selected: selectedDNode,
					onSelect: this._onVDomSelect
				});
				break;
			case 'store':
				title = 'Store State';
				viewDom = w(StoreState, {
					key: 'store',
					selected: selectedStateNode,
					state,
					onSelect: this._onStateSelect
				});
				break;
		}

		const left = v('div', { classes: this.theme(devtoolCss.left) }, [
			v('div', { classes: this.theme(devtoolCss.leftHeader) }, [
				v('span', { classes: this.theme(devtoolCss.leftTitle) }, [title]),
				w(ActionBar, { label: 'Actionbar Actions' }, [
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
				])
			]),
			viewDom
		]);
		return left;
	}

	/**
	 * Render the right (trailing) part of the user interface
	 */
	private _renderRight() {
		const {
			diagnostics: { eventLog, lastRender, storeState },
			interface: { activeIndex, selectedDNode, selectedEventId, selectedStateNode, view }
		} = this.properties;

		const selected = lastRender && selectedDNode ? findDNode(lastRender, selectedDNode) : undefined;
		let items: { [key: string]: string | number | boolean | undefined | null } | undefined;
		switch (view) {
			case 'logs':
				items = eventLog && selectedEventId !== undefined ? eventLog[selectedEventId].data : undefined;
				break;
			case 'vdom':
				items = selected && typeof selected !== 'string' ? selected.properties : undefined;
				break;
			case 'store':
				items =
					(storeState && selectedStateNode && getKeyProperties(storeState, selectedStateNode)) || undefined;
				break;
		}

		return v('div', { classes: this.theme(devtoolCss.right) }, [
			w(TabController, { activeIndex, onRequestTabChange: this._onRequestTabChange }, [
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
			])
		]);
	}

	protected render(): DNode {
		const { interface: { apiVersion } } = this.properties;

		/* If we can't detect the diagnostics, we will render the No API message */
		if (!apiVersion) {
			return v('div', { classes: this.theme(devtoolCss.noapi), key: 'noapi' }, [
				v('div', { classes: this.theme(devtoolCss.banner) }, ['No Dojo 2 diagnostics detected']),
				w(Button, { onClick: this._onRefreshClick }, ['Refresh'])
			]);
		}

		/* Otherwise we will render the full user interface */
		return v('div', { classes: this.theme(devtoolCss.root), key: 'root' }, [
			v('div', { classes: this.theme(devtoolCss.content), key: 'content' }, [
				this._renderLeft(),
				this._renderRight()
			])
		]);
	}
}

export default DevTool;
