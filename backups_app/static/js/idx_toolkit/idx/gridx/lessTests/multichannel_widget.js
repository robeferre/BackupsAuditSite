define([
	'dojo/_base/sniff',
	'dojo/query',
	'dojo/dom-class',
	'idx/gridx/tests/support/data/ComputerData',
	'gridx/tests/support/stores/ItemFileWriteStore',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/CellWidget',
	'gridx/modules/extendedSelect/Row',
	'gridx/modules/Sort',
	'gridx/modules/IndirectSelectColumn',
	'gridx/modules/AutoPagedBody',
	'gridx/modules/TouchVScroller',
	'gridx/modules/MultiChannelScroller',
	'gridx/modules/HiddenColumns',
	'gridx/modules/StructureSwitch',
	'gridx/modules/SummaryBar',
	'gridx/modules/Layer',
	'gridx/modules/select/Row',
	'gridx/modules/IndirectSelectColumn',
	'idx/gridx/modules/filter/QuickFilter',
	'idx/gridx/modules/Sort'
], function(has, query, domClass, dataSource, storeFactory){

	return {
		barTop: function(name){
			return [
				{
					content: '<span class="levelUp"></span>Back to menu<div class="title">' + name + '</div>',
					style: 'cursor: pointer; padding: 10px; background-color: #ededed;'
				}
			];
		},
		onParse: function(grid){
			grid.connect(grid.bar.plugins.top[0][0], 'onclick', function(){
				domClass.remove(grid.domNode.parentNode, 'activeContainer');
				query('.activeNavItem').removeClass('activeNavItem');
			});
		}
	};
});
