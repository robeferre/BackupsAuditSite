require([
	'dojo/_base/lang',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'idx/gridx/tests/support/data/MusicData',
	'idx/gridx/tests/support/stores/Memory',
	'gridx/modules/Bar',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/extendedSelect/Column',
	'gridx/modules/move/Row',
	'gridx/modules/move/Column',
	'idx/gridx/modules/dnd/Row',
	'idx/gridx/modules/dnd/Column',
	'gridx/modules/VirtualVScroller',
	'dijit/form/Button',
	'dojo/domReady!'
], function(lang, Grid, Cache, dataSource, storeFactory){

	function create(id, container, size, layoutIdx, args){
		var g = new Grid(lang.mixin({
			id: id,
			cacheClass: Cache,
			store: storeFactory({
				path: './support/stores',
				dataSource: dataSource, 
				size: size 
			}),
			selectRowTriggerOnCell: true,
			modules: [
				'gridx/modules/Bar',
				'gridx/modules/extendedSelect/Row',
				'gridx/modules/extendedSelect/Column',
				'gridx/modules/move/Row',
				'gridx/modules/move/Column',
				'idx/gridx/modules/dnd/Row',
				'idx/gridx/modules/dnd/Column',
				'gridx/modules/VirtualVScroller'
			],
			structure: dataSource.layouts[layoutIdx]
		}, args));
		g.placeAt(container);
		g.startup();
		return g;
	}

	create('grid1', 'grid1Container', 100, 9, {
		barTop: [{content: '<h1>Grid 1</h1>Draggable to any other grid.'}],
		dndRowAccept: ['grid3/rows', 'grid4/rows'],
		dndRowProvide: ['grid1/rows']
	});
	create('grid2', 'grid2Container', 0, 6, {
		barTop: [{content: '<h1>Grid 2</h1>Not draggable to grid 1 and grid 4.'}],
		dndRowAccept: ['grid1/rows', 'grid4/rows'],
		dndRowProvide: ['grid2/rows']
	});
	create('grid3', 'grid3Container', 0, 7, {
		barTop: [{content: '<h1>Grid 3</h1>Not draggable to grid 2. Can not rearrange.'}],
		dndRowCanRearrange: false,
		dndRowAccept: ['grid1/rows', 'grid2/rows'],
		dndRowProvide: ['grid3/rows']
	});
	create('grid4', 'grid4Container', 0, 8, {
		barTop: [{content: '<h1>Grid 4</h1>Not draggable to grid 3.'}],
		dndRowAccept: ['grid1/rows', 'grid3/rows'],
		dndRowProvide: ['grid4/rows']
	});
});
