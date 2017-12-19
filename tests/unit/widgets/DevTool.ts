const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';

import DevTool from '../../../src/widgets/DevTool';
import * as devtoolCss from '../../../src/widgets/styles/devtool.m.css';

import Button from '@dojo/widgets/button/Button';

describe('DevTool', () => {
	it('should render no diagnostics available by default', () => {
		const widget = harness(DevTool);
		widget.expectRender(
			v(
				'div',
				{
					classes: devtoolCss.noapi,
					key: 'noapi'
				},
				[
					v(
						'div',
						{
							classes: devtoolCss.banner
						},
						['No Dojo 2 diagnostics detected']
					),
					w(
						Button,
						{
							onClick: widget.listener
						},
						['Refresh']
					)
				]
			)
		);
	});
});
