require([
	'dojo/parser',
	'idx/gridx/tests/support/data/MusicData',
	'idx/gridx/tests/support/stores/Memory',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/ColumnResizer',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/VirtualVScroller',
	'gridx/modules/Sort',
	'dojo/domReady!'
], function(parser, dataSource, storeFactory){

	store = storeFactory({
		dataSource: dataSource,
		size: 200
	}); 

	layout = dataSource.layouts[4];

	parser.parse();
});
