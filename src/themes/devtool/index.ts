import { assign } from '@dojo/shim/object';
import dojoTheme from '@dojo/widgets/themes/dojo/theme';

import * as devtool from './devtool.m.css';
import * as itemlist from './itemlist.m.css';
import * as treepane from './treepane.m.css';
import * as vdom from './vdom.m.css';

const devtoolTheme = assign({}, dojoTheme, {
	devtool,
	itemlist,
	treepane,
	vdom
});

export default devtoolTheme;
