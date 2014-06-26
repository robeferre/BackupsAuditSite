require([
	'dojo/parser',
	'dojo/query',
	'dojo/string',
	'idx/gridx/tests/support/data/AllData',
	'idx/gridx/tests/support/stores/Memory',
	'gridx/Grid',
	'gridx/core/model/cache/Sync',
	'gridx/modules/ColumnResizer',
	'gridx/modules/CellWidget',
	'gridx/modules/Sort',
	'gridx/modules/Tree',
	'gridx/modules/Filter',
	'gridx/modules/Pagination',
	'gridx/modules/RowHeader',
	'gridx/modules/IndirectSelect',
	'gridx/modules/select/Row',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/IndirectSelectColumn',
	'gridx/modules/SummaryBar',
	'gridx/modules/VirtualVScroller',
	'idx/gridx/modules/pagination/PaginationBar',
	'idx/gridx/modules/filter/FilterBar',
	'dojo/domReady!'
], function(parser, query, string, dataSource, storeFactory){

	store1 = storeFactory({
		dataSource: dataSource,
		size: 100
	});
	dataSource.resetSeed();

	store2 = storeFactory({
		dataSource: dataSource,
		size: 100,
		tree: true,
		maxLevel: 2,
		maxChildrenCount: 5
	});
	dataSource.resetSeed();

	store3 = storeFactory({
		dataSource: dataSource,
		size: 100
	});

	layout = [
		{id: 'id', field: 'id', name: 'Identity'},
		{id: 'name', field: 'name', name: 'Name'},
		{id: 'server', field: 'server', name: 'Server'},
		{id: 'platform', field: 'platform', name: 'Platform'},
		{id: 'status', field: 'status', name: 'Status'},
		{id: 'progress', field: 'progress', name: 'Progress'}
	];

	parser.parse().then(function(){
		var toTest = [
			["indirectSelectAll", []],
			["indirectDeselectAll", []],
			["treeExpanded", []],
			["treeCollapsed", []],
			["helpMsg", ["Name"]],
			["singleHelpMsg", ["Name"]],
			["priorityOrder", ["xx"]],
			["rules", []],
			["filterDefDialogTitle", []],
			["summaryTotal", ["xx"]],
			["summaryRange", ["xx", "yy"]],
			["summarySelected", ["xx"]]
		];
		var nls = grid3.nls;
		for(var i = 0; i < toTest.length; ++i){
			var item = toTest[i];
			var name = item[0];
			var args = item[1];
			if(nls[name]){
				var str = string.substitute(grid3.nls[name], args || []);
				query('.nls_' + name).forEach(function(node){
					node.innerHTML = str;
				});
			}
		}
	});
});
