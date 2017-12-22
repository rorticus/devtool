import dojoTheme from '@dojo/widgets/themes/dojo/theme';

import * as actionbar from './actionbar.m.css';
import * as actionbarbutton from './actionbarbutton.m.css';
import * as devtool from './devtool.m.css';
import * as eventlog from './eventlog.m.css';
import * as icons from './icons.m.css';
import * as itemlist from './itemlist.m.css';
import * as scrollbar from './scrollbar.m.css';
import * as select from './select.m.css';
import * as storestate from './storestate.m.css';
import * as tabcontroller from './tabcontroller.m.css';
import * as treepane from './treepane.m.css';
import * as vdom from './vdom.m.css';

const devtoolTheme = {
	...dojoTheme,
	'dojo-select': select,
	'dojo-tabController': tabcontroller,
	actionbar,
	actionbarbutton,
	devtool,
	eventlog,
	icons,
	itemlist,
	scrollbar,
	storestate,
	treepane,
	vdom
};

export default devtoolTheme;
