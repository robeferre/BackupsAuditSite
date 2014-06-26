require([
	'dojo/parser',
	'dojo/query',
	'dojo/_base/array',
	'dojo/store/Memory',
	'gridx/support/QuickFilter',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/CellWidget',
	'gridx/modules/HiddenColumns',
	'gridx/modules/Edit',
	'gridx/modules/Filter',
	'gridx/modules/select/Row',
	'gridx/modules/Bar',
	'dijit/form/CheckBox',
	'dojo/domReady!'
], function(parser, query, array, Memory, QuickFilter){

	var users = [
		{id: 'u1', user: 'Elaine'},
		{id: 'u2', user: 'Nate'},
		{id: 'u3', user: 'Leslie'},
		{id: 'u4', user: 'Evans'},
		{id: 'u5', user: 'Rock'},
		{id: 'u6', user: 'JayZ'},
		{id: 'u7', user: 'Oliver'},
		{id: 'u8', user: 'Raymond'}
	];

	var groups = [
		{id: 'g1', group: 'Product Administrators'},
		{id: 'g2', group: 'Security Administrators'},
		{id: 'g3', group: 'Operators'},
		{id: 'g4', group: 'Testers'}
	];

	var privileges = [
		{id: 'p1', privilege: 'Login'},
		{id: 'p2', privilege: 'Manage users'},
		{id: 'p3', privilege: 'Manage connections'},
		{id: 'p4', privilege: 'View jobs'},
		{id: 'p5', privilege: 'Run jobs'}
	];

	var relations = [
		{user: 'u1', group: 'g3'},
		{group: 'g3', privilege: 'p2'},
		{user: 'u1', privilege: 'p4'},
		{user: 'u2', group: 'g1'},
		{user: 'u2', group: 'g2'},
		{group: 'g2', privilege: 'p3'},
		{user: 'u3', group: 'g3'},
		{user: 'u3', group: 'g4'},
		{user: 'u3', privilege: 'p4'},
		{group: 'g4', privilege: 'p4'},
		{user: 'u4', group: 'g1'},
		{user: 'u4', privilege: 'p1'}
	];

	collapsedMode = function(grid){
		grid.hiddenColumns.add('directRel', 'inheritedRel');
	};

	directRelMode = function(grid){
		grid.hiddenColumns.remove('directRel');
		grid.hiddenColumns.add('inheritedRel');
	};

	inheritedRelMode = function(grid){
		grid.hiddenColumns.remove('directRel', 'inheritedRel');
	};

	function getRels(keyName, valueName, id){
		var values = [];
		for(var i = 0; i < relations.length; ++i){
			var item = relations[i];
			if(item[keyName] && item[valueName] && item[keyName] == id){
				values.push({
					from: id,
					to: item[valueName]
				});
			}
		}
		return values;
	}

	function updateGrid(grid){
		grid.updatingRels = true;
		grid.model.clearMark('directRel');
		grid.model.clearMark('inheritedRel');

		var i, item;
		if(grid.directRels){
			for(i = 0; i < grid.directRels.length; ++i){
				grid.model.markById(grid.directRels[i].to, true, 'directRel');
			}
		}
		if(grid.inheritedRels){
			for(i = 0; i < grid.inheritedRels.length; ++i){
				grid.model.markById(grid.inheritedRels[i].to, true, 'inheritedRel');
			}
		}
		grid.model.when().then(function(){
			grid.updatingRels = false;
			grid.body.refresh();
		});
	}

	function saveRelation(name_a, name_b, masterId, rowId, checked){
		var pos = -1;
		for(var i = 0; i < relations.length; ++i){
			var item = relations[i];
			if(item[name_a] == masterId && item[name_b] == rowId){
				pos = i;
				break;
			}
		}
		if(checked && pos < 0){
			var newItem = {};
			newItem[name_a] = masterId;
			newItem[name_b] = rowId;
			relations.push(newItem);
		}else if(!checked && pos >= 0){
			relations.splice(pos, 1);
		}
	}

	bindEvents = function(name_a, grid_a, name_b, grid_b, name_c, grid_c){
		function update(rowId){
			var directRels_b = getRels(name_a, name_b, rowId);
			var directRels_c = getRels(name_a, name_c, rowId);
			var inheritedRels = [];
			for(var i = 0; i < directRels_b.length; ++i){
				inheritedRels = inheritedRels.concat(getRels(name_b, name_c, directRels_b[i].to));
			}

			grid_a.modeName = grid_b.modeName = grid_c.modeName = name_a;
			grid_a.masterId = grid_b.masterId = grid_c.masterId = rowId;
			grid_a.directRels = null;
			grid_a.inheritedRels = null;
			grid_b.directRels = directRels_b;
			grid_b.inheritedRels = null;
			grid_c.directRels = directRels_c;
			grid_c.inheritedRels = inheritedRels;

		}
		grid_a.connect(grid_a.select.row, 'onSelected', function(row){
			collapsedMode(grid_a);
			directRelMode(grid_b);
			inheritedRelMode(grid_c);
			grid_b.select.row.clear();
			grid_c.select.row.clear();

			update(row.id);

			updateGrid(grid_a);
			updateGrid(grid_b);
			updateGrid(grid_c);
		});
		grid_a.connect(grid_a.model, 'onMarkChange', function(id, toMark, oldStatus, type){
			if(!grid_a.updatingRels && {directRel: 1, inheritedRel: 1}[type]){
				update(id);

				updateGrid(grid_b);
				updateGrid(grid_c);
			}
		});
		grid_a.connect(grid_a.body, 'onAfterRow', function(row){
			var directRel = grid_a.model.getMark(row.id, 'directRel');
			var directRelCell = row.cell('directRel');
			if(directRelCell){
				directRelCell.widget().checkBox.set('checked', directRel);
			}
			var inheritedRel = grid_a.model.getMark(row.id, 'inheritedRel');
			var inheritedRelCell = row.cell('inheritedRel');
			if(inheritedRelCell){
				inheritedRelCell.widget().checkBox.set('checked', inheritedRel);
			}
		});
		grid_b.connect(grid_b, 'onCellClick', function(evt){
			if(grid_b.modeName == name_a){
				var n = query(evt.target).closest('.dijitCheckBox', evt.cellNode)[0];
				if(n){
					if(evt.columnId == 'directRel'){
						var checked = grid_b.cell(evt.rowId, evt.columnId).widget().checkBox.get('checked');
						saveRelation(name_a, name_b, grid_b.masterId, evt.rowId, checked);
						update(grid_b.masterId);
						updateGrid(grid_c);
					}
				}
			}
		});
		grid_c.connect(grid_c, 'onCellClick', function(evt){
			if(grid_c.modeName == name_a){
				var n = query(evt.target).closest('.dijitCheckBox', evt.cellNode)[0];
				if(n){
					if(evt.columnId == 'directRel'){
						var checked = grid_c.cell(evt.rowId, evt.columnId).widget().checkBox.get('checked');
						saveRelation(name_a, name_c, grid_c.masterId, evt.rowId, checked);
						update(evt.rowId);
					}
				}
			}
		});
	};

	var directRelColumn = {id: 'directRel', width: '20px', widgetsInCell: true, 'class': 'checker',
		name: 'D',
		decorator: function(){
			return "<div data-dojo-type='dijit/form/CheckBox' data-dojo-attach-point='checkBox'></div>";
		},
		setCellValue: function(){
		}
	};
	var inheritedRelColumn = {id: 'inheritedRel', width: '20px', widgetsInCell: true, 'class': 'checker',
		name: 'I',
		decorator: function(){
			return "<div data-dojo-type='dijit/form/CheckBox' data-dojo-attach-point='checkBox' data-dojo-props='readOnly: true'></div>";
		},
		setCellValue: function(){
		}
	};

	//grid1
	store1 = new Memory({
		data: users
	});


	layout1 = [
		directRelColumn,
		inheritedRelColumn,
		{id: 'user', field: 'user', name: 'Users'}
	];

	barTop1 = [
		[{content: "Users", style: "font-size: 20; font-weight: bolder;"}],
		[{pluginClass: QuickFilter, style: "float: right;"}]
	];

	//grid2
	store2 = new Memory({
		data: groups
	});

	layout2 = [
		directRelColumn,
		inheritedRelColumn,
		{id: 'group', field: 'group', name: 'Groups'}
	];

	barTop2 = [
		[{content: "Groups", style: "font-size: 20; font-weight: bolder;"}],
		[{pluginClass: QuickFilter, style: "float: right;"}]
	];

	//grid3
	store3 = new Memory({
		data: privileges
	});

	layout3 = [
		directRelColumn,
		inheritedRelColumn,
		{id: 'privilege', field: 'privilege', name: 'Privileges'}
	];

	barTop3 = [
		[{content: "Privileges", style: "font-size: 20; font-weight: bolder;"}],
		[{pluginClass: QuickFilter, style: "float: right;"}]
	];

	parser.parse().then(function(){
		collapsedMode(grid1);
		directRelMode(grid2);
		inheritedRelMode(grid3);

		bindEvents('user', grid1, 'group', grid2, 'privilege', grid3);
		bindEvents('privilege', grid3, 'group', grid2, 'user', grid1);
		bindEvents('group', grid2, 'user', grid1, 'privilege', grid3);

		grid1.row(0).select();
	});
});
