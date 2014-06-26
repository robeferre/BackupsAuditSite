define([
	'dojo/_base/array',
	'dojo/hash',
	'idx/gridx/tests/support/data/ComputerData',
	'idx/gridx/tests/support/stores/ItemFileWriteStore',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/AutoPagedBody',
	'gridx/modules/TouchVScroller',
	'gridx/modules/VirtualVScroller',
	'gridx/modules/SummaryBar'
], function(array, hash, dataSource, storeFactory){

	var hashArr = (hash() || '').split('-');
	var touch = array.indexOf(hashArr, 'touch') > -1 ? true : undefined;

	var store = storeFactory({
		dataSource: dataSource,
		size: 1000
	});

	var layout = [
		{id: 'id', field: 'id', name: 'ID', width: '20px'},
		{id: 'name', field: 'name', name: 'Name', width: 'auto'},
		{id: 'server', field: 'server', name: 'Server', width: 'auto'},
		{id: 'status', field: 'status', name: 'Status', width: '40px',
			style: 'text-align: center;',
			decorator: function(data){
				return [
					"<span class='", {
						normal: 'testDataNormalStatus',
						warning: 'testDataWarningStatus',
						critical: 'testDataCriticalStatus'
					}[data.toLowerCase()], "'></span>"
				].join('');
			}
		},
		{id: 'platform', field: 'platform', name: 'Platform', width: 'auto'}
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
