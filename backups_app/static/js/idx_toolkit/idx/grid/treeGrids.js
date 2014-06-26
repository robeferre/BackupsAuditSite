/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang",
        "idx/main",
        "dojo/_base/kernel",
        "dojo/_base/connect",
        "dojo/dom",
        "dojo/dom-attr",
        "dojo/keys",
        "dijit/focus",
        "dojox/grid/TreeGrid",
        "dojox/grid/_TreeView"], 
        function(dLang,iMain,dKernel,dConnect,dDom,dDomAttr,dKeys,dFocus,dTreeGrid,dTreeView) {
	
	/**
	 * @name idx.grid.treeGrids
	 * @class Extension to dojox.grid.TreeGrid to add a "setOpen" function to programmatically expand
	 *        or collapse a tree node for a given row index path.
	 */
	var iTreeGrids = dLang.getObject("grid.treeGrids", true, iMain);
	console.log("************************EXTENDING dojox.grid.TreeGrid with 'setOpen' function");
	dLang.extend(dTreeGrid, /** @lends idx.grid.treeGrids# */ {
		/**
		 * Programmatically expands or collapses an row in a dojox.grid.TreeGrid.
		 * 
		 * @public
		 * @function
		 * @param {String} rowIndexPath The slash-separated path to the row index.
		 * @param {Boolean} open Set to true to expand, and false to collapse.
		 * @param {Function} callback The function to call once the expansion or collapse has completed
		 *                            since this operation may require loading children that are not
		 *                            yet loaded.
		 */
		setOpen: function(rowIndexPath, open, callback) {
			var rootIndex = parseInt(rowIndexPath.split("/")[0], 10);
			var rootRow = this._by_idx[rootIndex];
			if (! rootRow) {
				console.log("NO ROOT ROW FOUND FOR: " + rootIndex);
				return;
			}
			var rootIdty = rootRow.idty;
			for (var index = 0; index < this.views.views.length; index++) {
				var view = this.views.views[index];
				if (!view) {
					continue;
				}
				if (view._expandos) {
					var expandos = view._expandos[rootIdty];
					if (!expandos) {
						continue;
					}
					var expandoKey = "dojoxGridRowToggle-" + rowIndexPath.replace(/\//g,"-");
					var expando = expandos[expandoKey];
					if (!expando) {
						console.log("NO EXPANDO FOUND FOR " + expandoKey);
						for (var expandoKey in expandos) console.log(expandoKey);
						continue;
					}					
					if (callback) {
						var openConnection = null;

						var openCallback = function(open) {
							if (openConnection) {
								dConnect.disconnect(openConnection);
								delete openConnection;
								openConnection = null;
							}
							callback();
						};
						openConnection = dConnect.connect(expando, "_setOpen", openCallback);
					}
					expando.setOpen(open);
				}
			}
		}
	});
	
	// get the combo button prototype
	var baseProto = dTreeGrid.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseKeyDown  = baseProto.onKeyDown;
	
	console.log("************************REPLACING dojox.grid.TreeGrid.onKeyDown");
	var overrideKeyDown = function(e){
		if((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey){
			var ltr = dKernel._isBodyLtr();
			var openKey = (ltr) ? dKeys.RIGHT_ARROW : dKeys.LEFT_ARROW;
			var closeKey = (ltr) ? dKeys.LEFT_ARROW : dKeys.RIGHT_ARROW;
			var expandoCell = this.layout.cells[this.expandoCell];
			var focusCellIndex = this.focus.cell.index;
			switch(e.keyCode){
				case openKey:
				case closeKey:
					var focusRow = this.focus.rowIndex;
					var treeGrid = this;
					var refocus = function() {
						var cell = treeGrid.getCell(focusCellIndex);
						var view = null;
						for (var vi = 0; vi < treeGrid.views.views.length; vi++) {
							if (treeGrid.views.views[vi] instanceof dTreeView) {
								view = treeGrid.views.views[vi];
								break;
							}
						}
						var cellNode = view.getCellNode(focusRow, focusCellIndex);
						
						//dFocus.focus(treeGrid.domNode);
						treeGrid.focus.setFocusIndex("0", 0);
						treeGrid.focus.setFocusIndex(focusRow, focusCellIndex);
						view.focus();
						//dFocus.focus(treeGrid.domNode);
						//treeGrid.focus.focusGrid();
						dDomAttr.set(cellNode, "tabindex", "0");
						dFocus.focus(cellNode);
						dDomAttr.set(cellNode, "tabindex", "-1");
						
					};
					var callback = function() {
						// TODO(bcaceres): this is a bit of a hack because focus is lost when the
						// grid structure changes.  Sometimes we refocus a cell node, but the node is
						// erased and replaced afterward.  I have not been able to find the correct
						// method to latch onto to avoid the timing issue.  Worst case scenario is the
						// user needs to tab back into the grid and navigate back to the cell that they
						// had previously focused.  This is still better than what Dojo provided by default.
						refocus();
						setTimeout(refocus, 500);
					}
					this.setOpen(focusRow, (e.keyCode == openKey), callback);
					break;
				default:
					this.onKeyDown = baseKeyDown;
					this.onKeyDown(e);
					this.onKeyDown = overrideKeyDown;
					break;
			}
		} else {
			this.onKeyDown = baseKeyDown;
			this.onKeyDown(e);
			this.onKeyDown = overrideKeyDown;
		}
	};
	baseProto.onKeyDown = overrideKeyDown;
	
	return iTreeGrids;
});