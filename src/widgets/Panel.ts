import { v, w } from '@dojo/widget-core/d';
import { I18nMixin, I18nProperties } from '@dojo/widget-core/mixins/I18n';
import { ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import Tab from '@dojo/widgets/tab';
import TabController from '@dojo/widgets/tab-controller';
import HelloWorld from './HelloWorld';
import Log from './tools/containers/Log';
import Widgets from './tools/containers/Widgets';

export interface PanelProperties extends ThemedProperties, I18nProperties {}

export const PanelBase = I18nMixin(ThemedMixin(WidgetBase));

export class Panel extends PanelBase<PanelProperties> {
	selectedTab = 0;

	protected onTabSelected(index: number) {
		this.selectedTab = index;
		this.invalidate();
	}

	protected render() {
		return v('div', {}, [
			w(
				TabController,
				{
					activeIndex: this.selectedTab,
					onRequestTabChange: (index: number) => this.onTabSelected(index)
				},
				[
					w(
						Tab,
						{
							key: 'hello',
							label: 'Hello World'
						},
						[w(HelloWorld, {})]
					),
					w(
						Tab,
						{
							key: 'widgets',
							label: 'Widgets'
						},
						[w(Widgets, {})]
					),
					w(
						Tab,
						{
							key: 'log',
							label: 'Log'
						},
						[w(Log, {})]
					)
				]
			)
		]);
	}
}

export default Panel;
