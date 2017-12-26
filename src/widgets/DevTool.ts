import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';
import { includes } from '@dojo/shim/array';
import { ProcessError, ProcessResult } from '@dojo/stores/process';
import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ThemedMixin, { theme, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import Button from '@dojo/widgets/button/Button';
import Select from '@dojo/widgets/select/Select';
import Tab from '@dojo/widgets/tabcontroller/Tab';
import TabController from '@dojo/widgets/tabcontroller/TabController';
import { highlight } from '../diagnostics';
import ActionBar, { ActionBarButton } from './ActionBar';
import EventLog from './EventLog';
import ItemList, { Items } from './ItemList';
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
	 * Toggle a particular node of an ItemList
	 */
	toggleExpanded(
		key: string,
		id: string,
		value: string
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
function getKeyProperties(state: any, path: string): { [key: string]: string | number | boolean } {
	const parts = path.split('/');
	const actualValue = parts.reduce((previous, currentPath) => {
		return currentPath ? previous[currentPath] : previous;
	}, state);
	let value: string | number | boolean;
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

function getPropertyValue(value: any): string | number | boolean {
	if (value === null) {
		return '@@null';
	}
	if (value === undefined) {
		return '@@undefined';
	}
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'symbol') {
		return String(value);
	}
	if (typeof value === 'function') {
		const fnName: string | undefined = (value as any).name;
		return `@@function${fnName ? `(${fnName})` : ''}`;
	}
	return JSON.stringify(value);
}

@theme(devtoolCss)
@theme(icons)
export class DevTool extends ThemedBase<DevToolProperties> {
	private _getItemChildren(value: any): Items | undefined {
		if (typeof value === 'string' && value.length > 1 && (value[0] === '[' || value[0] === '{')) {
			const parsedValue: any[] | Items = JSON.parse(value);
			if (Array.isArray(parsedValue)) {
				return parsedValue.reduce(
					(items, currentValue, idx) => {
						items[idx] = getPropertyValue(currentValue);
						return items;
					},
					{} as Items
				);
			}
			return Object.keys(parsedValue).reduce(
				(items, key) => {
					items[key] = getPropertyValue(parsedValue[key]);
					return items;
				},
				{} as Items
			);
		}
	}

	private _getOptionSelectedProjector(option: string) {
		return option === this.properties.interface.selectedProjector;
	}

	private _getOptionSelectedStore(option: string): boolean {
		return option === this.properties.interface.selectedStore;
	}

	private _listHasChildren(value: any) {
		return (typeof value === 'string' && value.length > 1 && (value[0] === '[' || value[0] === '{')) || false;
	}

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
		await refreshDiagnostics();
		setInterfaceProperty('view', 'vdom');
	}

	private async _onLogsClick() {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		await refreshDiagnostics();
		setInterfaceProperty('view', 'logs');
	}

	private async _onProjectorChange(value: string) {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		await setInterfaceProperty('selectedProjector', value);
		refreshDiagnostics();
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

	private _onStateToggle(id: string) {
		const { interface: { expandedStateNodes }, setInterfaceProperty } = this.properties;

		if (includes(expandedStateNodes, id)) {
			expandedStateNodes.splice(expandedStateNodes.indexOf(id), 1);
		} else {
			expandedStateNodes.push(id);
		}
		setInterfaceProperty('expandedStateNodes', expandedStateNodes);
	}

	private async _onStoreClick() {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		await refreshDiagnostics();
		setInterfaceProperty('view', 'store');
	}

	private async _onStoreChange(value: string) {
		const { refreshDiagnostics, setInterfaceProperty } = this.properties;
		await setInterfaceProperty('selectedStore', value);
		refreshDiagnostics();
	}

	private _onVDomSelect(id: string) {
		const { diagnostics: { projectors }, setInterfaceProperty } = this.properties;
		if (projectors.length) {
			highlight(projectors[0], id);
		}
		setInterfaceProperty('selectedDNode', id);
	}

	private _onVDomToggle(id: string) {
		const { interface: { expandedDNodes }, setInterfaceProperty } = this.properties;

		if (includes(expandedDNodes, id)) {
			expandedDNodes.splice(expandedDNodes.indexOf(id), 1);
		} else {
			expandedDNodes.push(id);
		}
		setInterfaceProperty('expandedDNodes', expandedDNodes);
	}

	/**
	 * Render the left (leading) part of the user interface
	 */
	private _renderLeft() {
		const {
			diagnostics,
			interface: {
				expandedDNodes,
				expandedStateNodes,
				selectedDNode,
				selectedEventId: selected,
				selectedProjector,
				selectedStateNode,
				selectedStore,
				view
			}
		} = this.properties;
		const { eventLog, lastRender: root, projectors, stores, storeState: state } = diagnostics;

		let viewDom: DNode = null;
		let select: DNode = null;
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
					expanded: expandedDNodes,
					key: 'vdom',
					root,
					selected: selectedDNode,
					onItemSelect: this._onVDomSelect,
					onItemToggle: this._onVDomToggle
				});
				select = v('span', { classes: this.theme(devtoolCss.leftSelect), key: 'select' }, [
					w(Select, {
						getOptionSelected: this._getOptionSelectedProjector,
						key: 'select',
						options: projectors,
						placeholder: 'Select projector',
						value: selectedProjector,

						onChange: this._onProjectorChange
					})
				]);
				break;
			case 'store':
				title = 'Store State';
				viewDom = w(StoreState, {
					expanded: expandedStateNodes,
					key: 'store',
					selected: selectedStateNode,
					state,
					onItemSelect: this._onStateSelect,
					onItemToggle: this._onStateToggle
				});
				select = v('span', { classes: this.theme(devtoolCss.leftSelect), key: 'select' }, [
					w(Select, {
						getOptionSelected: this._getOptionSelectedStore,
						key: 'select',
						options: stores,
						placeholder: 'Select store',
						value: selectedStore,

						onChange: this._onStoreChange
					})
				]);
				break;
		}

		const left = v('div', { classes: this.theme(devtoolCss.left) }, [
			v('div', { classes: this.theme(devtoolCss.leftHeader) }, [
				v('span', { classes: this.theme(devtoolCss.leftTitle), key: 'title' }, [title]),
				select,
				w(ActionBar, { label: 'Actionbar Actions' }, [
					w(ActionBarButton, {
						iconClass: this.theme(icons.logs),
						key: 'logs',
						label: 'Display Event Logs',
						onClick: this._onLogsClick
					}),
					projectors
						? w(ActionBarButton, {
								iconClass: this.theme(icons.render),
								key: 'lastRender',
								label: 'Display Last Render',
								onClick: this._onLastRenderClick
							})
						: null,
					stores
						? w(ActionBarButton, {
								iconClass: this.theme(icons.stores),
								key: 'store',
								label: 'Display Store State',
								onClick: this._onStoreClick
							})
						: null
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
			interface: {
				activeIndex,
				expandedProperties,
				selectedDNode,
				selectedEventId,
				selectedProjector,
				selectedStateNode,
				selectedStore,
				view
			},
			toggleExpanded
		} = this.properties;

		const selected = lastRender && selectedDNode ? findDNode(lastRender, selectedDNode) : undefined;
		let expandedKey: string | undefined;
		let expandedId: string | undefined;
		let items: { [key: string]: string | number | boolean | undefined | null } | undefined;
		switch (view) {
			case 'logs':
				expandedKey = '__logs';
				expandedId = selectedEventId !== undefined ? String(selectedEventId) : undefined;
				items = eventLog && selectedEventId !== undefined ? eventLog[selectedEventId].data : undefined;
				break;
			case 'vdom':
				expandedKey = selectedProjector;
				expandedId = selectedDNode;
				items = selected && typeof selected !== 'string' ? selected.properties : undefined;
				break;
			case 'store':
				expandedKey = selectedStore;
				expandedId = selectedStateNode;
				items =
					(storeState && selectedStateNode && getKeyProperties(storeState, selectedStateNode)) || undefined;
				break;
		}
		const expanded =
			(expandedKey &&
				expandedId &&
				expandedProperties[expandedKey] &&
				expandedProperties[expandedKey][expandedId]) ||
			undefined;

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
									expanded,
									getItemChildren: this._getItemChildren,
									items,
									hasChildren: this._listHasChildren,
									valueFormatter: this._listValueFormat,

									onToggle(value: string) {
										if (expandedKey && expandedId) {
											toggleExpanded(expandedKey, expandedId, value);
										}
									}
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
