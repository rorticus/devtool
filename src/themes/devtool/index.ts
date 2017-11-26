import { assign } from '@dojo/shim/object';
import dojoTheme from '@dojo/widgets/themes/dojo/theme';

import * as actionbar from './actionbar.m.css';
import * as actionbarbutton from './actionbarbutton.m.css';
import * as devtool from './devtool.m.css';
import * as itemlist from './itemlist.m.css';
import * as treepane from './treepane.m.css';
import * as vdom from './vdom.m.css';

const devtoolTheme = assign({}, dojoTheme, {
	actionbar,
	actionbarbutton,
	devtool,
	itemlist,
	treepane,
	vdom
});

export default devtoolTheme;
