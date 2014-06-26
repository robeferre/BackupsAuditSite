require([
	'dojo/parser',
	'dojo/_base/array',
	'idx/gridx/tests/support/data/ComputerData',
	'idx/gridx/tests/support/stores/Memory',
	'dijit/form/Button',
	'gridx/Grid',
	'gridx/core/model/cache/Sync',
	'gridx/modules/Filter',
	'gridx/modules/CellWidget',
	'gridx/modules/ColumnResizer',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/VirtualVScroller',
	'gridx/modules/ToolBar',
	'gridx/modules/SummaryBar',
	'idx/gridx/modules/filter/QuickFilter',
	'idx/gridx/modules/Sort',
	'dojo/domReady!'
], function(parser, array, dataSource, storeFactory, Button){

	store = storeFactory({
		dataSource: dataSource,
		size: 100
	});

	layout = dataSource.layouts[0];

	function addToolbarButtons(grid){
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
	}

	parser.parse().then(function(){
		array.forEach([gridA, gridB, gridC, gridD, gridE, gridF, gridG, gridH, gridI, gridJ], addToolbarButtons);
	});
});
