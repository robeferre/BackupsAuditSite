require([
	'dojo/parser',
	'idx/gridx/tests/support/data/MusicData',
	'idx/gridx/tests/support/stores/Memory',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/Pagination',
	'gridx/modules/VirtualVScroller',
	'idx/gridx/modules/pagination/PaginationBar',
	'idx/gridx/modules/pagination/PaginationBarDD',
	'dojo/domReady!'
], function(parser, dataSource, storeFactory){

	store = storeFactory({
		dataSource: dataSource,
		size: 100
	});

	layout = dataSource.layouts[5];

	parser.parse();
});
