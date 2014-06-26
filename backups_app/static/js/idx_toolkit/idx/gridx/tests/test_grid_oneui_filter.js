require([
	'dojo/parser',
	'dojo/_base/array',
	'dijit/form/Button',
	'idx/gridx/tests/support/data/MusicData',
	'idx/gridx/tests/support/stores/Memory',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/ColumnResizer',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/ToolBar',
	'gridx/modules/VirtualVScroller',
	'gridx/modules/Filter',
	'idx/gridx/modules/filter/FilterBar',
	'idx/gridx/modules/filter/QuickFilter',
	'dojo/domReady!'
], function(parser, array, Button, dataSource, storeFactory){

	store = storeFactory({
		dataSource: dataSource,
		size: 100
	});

	layout = dataSource.layouts[1];

	parser.parse().then(function(){
		array.forEach([grid2, grid3], function(grid){
			grid.toolBar.widget.addChild(new Button({
				showLabel: false,
				label: 'Cut',
				iconClass: 'testToolbarButtonCut'
			}));
			grid.toolBar.widget.addChild(new Button({
				showLabel: false,
				label: 'Copy',
				iconClass: 'testToolbarButtonCopy'
			}));
			grid.toolBar.widget.addChild(new Button({
				showLabel: false,
				label: 'Paste',
				iconClass: 'testToolbarButtonPaste'
			}));
		});
	});
});
