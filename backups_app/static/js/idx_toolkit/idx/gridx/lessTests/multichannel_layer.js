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
	'gridx/modules/Tree',
	'gridx/modules/select/Row',
	'gridx/modules/IndirectSelectColumn',
	'idx/gridx/modules/filter/QuickFilter',
	'idx/gridx/modules/Sort'
], function(has, query, domClass, dataSource, storeFactory){

	var store = storeFactory({
//        isAsync: true,
		dataSource: dataSource,
//        asyncTimeout: 1000,
		size: 10,
		tree: true,
		maxChildrenCount: 5,
		maxLevel: 3
	});

	var layout = [
		{id: 'id', field: 'id', name: 'Identity', width: '100px', sortable: 'ascend'},
		{id: 'id-mobile', field: 'id', width: '20px', sortable: 'ascend'},
		{id: 'name', field: 'name', name: 'Name', width: '15%', minWidth: 100},
		{id: 'server', field: 'server', name: 'Server', width: '10%', minWidth: 100, sortable: false},
		{id: 'platform', field: 'platform', name: 'Platform', width: '20%', minWidth: 150},
		{id: 'status', field: 'status', name: 'Status', width: '80px', sortable: 'descend',
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
		{id: 'status-mobile', field: 'status', width: '20px', sortable: 'descend',
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
		{id: 'progress', field: 'progress', name: 'Progress', width: 'auto', minWidth: 180,
			widgetsInCell: true,
			decorator: function(){
				return "<div data-dojo-type='dijit.ProgressBar' data-dojo-props='minimum: 0, maximum: 1' class='gridxHasGridCellValue' style='width: 100%;'></div>";
			}
		},
		{id: 'progress-mobile', field: 'progress', name: 'Name & Progress', width: 'auto', minWidth: 150,
			widgetsInCell: true,
			decorator: function(){
				return [
					"<div data-dojo-attach-point='taskname' class='mobileNameDiv'></div>",
					"<div data-dojo-attach-point='prog' data-dojo-type='dijit.ProgressBar' ",
					"data-dojo-props='minimum: 0, maximum: 1' class='gridxHasGridCellValue' style='width: 100%;'></div>"].join('');
			},
			setCellValue: function(gridData, storeData, cellWidget){
				cellWidget.taskname.innerHTML = cellWidget.cell.row.rawData().name;
				cellWidget.prog.set('value', gridData);
			}
		}/*,
		{id: 'nextLevel', width: '20px', sortable: false,
			decorator: function(data, rowId, visualIndex, cell){
				if(cell.model.hasChildren(rowId)){
					return '<div class="hasChildren"></div>';
				}
				return '';
			}
		}*/
	];

	var isMobile = has('ios') || has('android');
	var config = isMobile ? 
		{
			desktop: ['id', 'name', 'server', 'platform', 'status', 'progress', 'nextLevel'],
			pad: ['id-mobile', 'name', 'platform', 'status', 'progress', 'nextLevel'],
			phone: ['id-mobile', 'status-mobile', 'progress-mobile', 'nextLevel']
		} : 
		{
			desktop: ['id', 'name', 'server', 'platform', 'status', 'progress'],
			pad: ['id-mobile', 'name', 'platform', 'status', 'progress'],
			phone: ['id-mobile', 'status-mobile', 'progress-mobile']
		};

	var condition = {
		desktop: function(grid){
//            return window.innerWidth > 1024;
			return !isMobile || grid.domNode.offsetWidth > 1024;
		},
		pad: function(grid){
//            return window.innerWidth <= 1024 && window.innerWidth > 480;
			return isMobile && grid.domNode.offsetWidth <= 1024 && grid.domNode.offsetWidth > 480;
		},
		phone: function(grid){
//            return window.innerWidth <= 480;
			return isMobile && grid.domNode.offsetWidth <= 480;
		}
	};

	var mods = [
		isMobile ? 'gridx/modules/TouchVScroller' : 'gridx/modules/VirtualVScroller',
		isMobile ? 'gridx/modules/Layer' : 'gridx/modules/Tree',
		'gridx/modules/CellWidget',
		'gridx/modules/HiddenColumns',
		'gridx/modules/StructureSwitch',
		'gridx/modules/SummaryBar',
//        'gridx/modules/select/Row',
//        'gridx/modules/IndirectSelectColumn',
		'gridx/modules/Sort'
	];

	function onParse(grid){
//        grid.connect(grid, has('ios') || has('android') ? 'onCellTouchStart' : 'onCellMouseDown', function(e){
//            if(e.columnId == 'nextLevel' && e.cellNode.childNodes.length){
//                grid.layer.down(e.rowId);
//            }
//        });
//        grid.connect(grid.layer, 'onReady', function(args){
//            if(args.isDown){
//                query('.hasChildren', args.parentRowNode).forEach(function(node){
//                    domClass.remove(node, 'hasChildren');
//                    domClass.add(node, 'levelUp');
//                });
//            }else if(args.parentRowNode){
//                query('.levelUp', args.parentRowNode).forEach(function(node){
//                    domClass.remove(node, 'levelUp');
//                    domClass.add(node, 'hasChildren');
//                });
//            }
//        });
	}

	return {
		store: store,
		layout: layout,
		mods: mods,
		structureSwitchCondition: condition,
		structureSwitchConfig: config,
		onParse: onParse
	};
});
