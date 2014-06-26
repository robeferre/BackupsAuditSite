define([
	'dojo/_base/array',
	'dojo/hash',
	'idx/gridx/tests/support/data/ComputerData',
	'idx/gridx/tests/support/stores/ItemFileWriteStore',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/CellWidget',
	'gridx/modules/Sort',
	'gridx/modules/AutoPagedBody',
	'gridx/modules/TouchVScroller',
	'gridx/modules/VirtualVScroller',
	'gridx/modules/SummaryBar',
	'gridx/modules/Layer',
	'gridx/modules/Tree',
	'idx/gridx/modules/Sort'
], function(array, hash, dataSource, storeFactory){

	var hashArr = (hash() || '').split('-');
	var touch = array.indexOf(hashArr, 'touch') > -1 ? true : undefined;

	var store = storeFactory({
		dataSource: dataSource,
		size: 10,
		tree: true,
		maxChildrenCount: 5,
		maxLevel: 3
	});

	var layout = [
		{id: 'id', field: 'id', name: 'ID', width: '20%'},
//        {id: 'name', field: 'name', name: 'Name', width: '15%', minWidth: 80},
//        {id: 'server', field: 'server', name: 'Server', width: '10%', sortable: false},
//        {id: 'platform', field: 'platform', name: 'Platform', width: '20%', minWidth: 120},
		{id: 'status', field: 'status', name: 'Status', width: '30%',
			decorator: function(data){
				return [
					"<span class='", {
						normal: 'testDataNormalStatus',
						warning: 'testDataWarningStatus',
						critical: 'testDataCriticalStatus'
					}[data.toLowerCase()], "'></span>",
					data
				].join('');
			}
		},
		{id: 'progress', field: 'progress', name: 'Progress', width: 'auto',
			widgetsInCell: true,
			decorator: function(){
				return "<div data-dojo-type='dijit.ProgressBar' data-dojo-props='minimum: 0, maximum: 1' class='gridxHasGridCellValue' style='width: 100%;'></div>";
			}
		}
	];

	function onParse(grid){
		grid.connect(window, 'onresize', function(){
			grid.resize();
		});
	}

	return {
		touch: touch,
		store: store,
		layout: layout,
		onParse: onParse
	};
});
