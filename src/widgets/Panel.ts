import { DiagnosticInputChannel } from '@dojo/diagnostics/interfaces';
import { w } from '@dojo/widget-core/d';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import Tab from '@dojo/widgets/tab';
import TabController from '@dojo/widgets/tab-controller';
import HelloWorld from './HelloWorld';
import Log from './tools/Log';

export interface PanelProperties {
	inputChannel: DiagnosticInputChannel;
}

export class Panel extends WidgetBase<PanelProperties> {
	selectedTab = 0;

	protected onTabSelected(index: number) {
		this.selectedTab = index;
		this.invalidate();
	}

	protected render() {
		return w(TabController, {
			activeIndex: this.selectedTab,
			onRequestTabChange: (index: number) => this.onTabSelected(index)
		}, [
			w(Tab, {
				key: 'hello',
				label: ' Hello World'
			}, [
				w(HelloWorld, {})
			]),
			w(Tab, {
				key: 'log',
				label: 'Log'
			}, [
				w(Log, { inputChannel: this.properties.inputChannel })
			])
		]);
	}
}

export default Panel;
