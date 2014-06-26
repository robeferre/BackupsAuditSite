/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	  "dojo/_base/declare",    // dojo_declare
	  "dijit/_Widget",		   // dijit_widget
      "dijit/registry",        // dijit_registry
	  "dojo/_base/event",      // dojo_event
      "dojo/_base/connect",    // dojo_connect
      "dojo/_base/lang",       // dojo_lang
      "dojo/keys"              // dojo_keys
	], function(dojo_declare, dijit_widget, dijit_registry, dojo_event, dojo_connect, dojo_lang, dojo_keys){
/**
 * @name idx.layout.SectionedNavController
 * @class Non-visual control to handle highlighting of several grids,
 * 			so that only one grid can have a selected row at a time.
 *			The SectionedNavController also publishes a selectionChanged
 *			topic that can be used as a central point to handle the
 *			navigation selection coming from all the grids.
 */

return dojo_declare("idx.layout.SectionedNavController",[dijit_widget],
/** @lends idx.layout.SectionedNavController# */
{

			id: "",
			
			/**
			 * A comma-separated list of the id's of the grids that are to be coordinated.
			 * 
			 * @type String
			 */ 
			associatedGrids: "",
			
			_associatedGrids: [], // need to override this class-static in postMixInProperties

			_lastGridSelected: "",
			
			_lastRowSelected: -1,

			/**
			 * @public
			 * @function
			 */
			constructor: function(n){

				//console.log("in constructor of SectionedNavController " + n.associatedGrids);
				this.id = n.id;				
			},
			
			postMixInProperties: function() {
				this._associatedGrids = [];
				this.inherited(arguments);
			},
			_setAssociatedGridsAttr: function(value) {
				this.associatedGrids = value;
				if (!this._started) return;
				this._connectToGrids();
			},
			
			startup: function() {
				this.inherited(arguments);
				this._connectToGrids();
			},
			
			_connectToGrids: function() {
				// disconnect any old connections to grids
				if (this._gridConnections) {
					for (var index = 0; index < this._gridConnections.length; index++) {
						var conn = this._gridConnections[index];
						if (! conn) continue;
						dojo_connect.disconnect(conn);
						this._gridConnections[index] = null;
					}
					delete this._gridConnections;
				}
				
				// get the IDs of the new grids
				this._associatedGrids = this.associatedGrids.split(",");
				this._gridConnections = [];
				this._pendingGrids = {};
				
				// Listen to notifications from grids
				for(var index=0; index < this._associatedGrids.length; index++)
				{
					var gridID = this._associatedGrids[index];
					var grid = dijit_registry.byId(gridID);
					if( grid ) {
						this._connectToGrid(gridID, grid);						
					}
					else
					{
						var targetGrid = gridID;
						this._pendingGrids[gridID] = dojo_connect.connect(dijit_registry, "add", dojo_lang.hitch(this, 
						function(targetGrid, widget) {
							if (widget.id != targetGrid) return;
							this._connectToGrid(widget.id, widget);
						}, targetGrid ));
					}
					
				}				
			},

			/**
			 * 
			 */
			_connectToGrid: function(gridID, grid) {
				// check if this was in the pending grids
				var pending = this._pendingGrids[gridID];
				if (pending) {
					dojo_connect.disconnect(pending);
					delete this._pendingGrids[gridID];
				}
				
				// BMC: Force NO SORTING until we properly translate the row indexes when sorted
				// and we properly change the selected content pane when sorting triggers the
				// selected row to actually be highlighting alternate data.
				grid.canSort = function() { return false; }
				
				var caller = { owner: this, grid: grid };
				var conn = dojo_connect.connect(grid, 'onSelected', dojo_lang.hitch(caller, function(index) {
					this.owner._handleSelect(this.grid, index);
				}));
				this._gridConnections.push(conn);
				
				conn = dojo_connect.connect(grid, 'onCellFocus', dojo_lang.hitch(caller, function(cell, index) {
					this.owner._handleFocus(this.grid, cell, index);
				}));
				this._gridConnections.push(conn);
				
				var conn = dojo_connect.connect(grid, "onKeyEvent", dojo_lang.hitch(caller, function(e) {
					this.owner._handleKey(this.grid, e);
				}));
				this._gridConnections.push(conn);				
			},
			
			/**
			 * 
			 */
			_handleKey: function(grid, e) {
				var funcName = "_handle_" + e.dispatch;
				if (funcName in this) {
					this[funcName](grid, e);
				}
			},

			_handle_dokeydown: function(grid, e) {
				switch (e.keyCode) {
				case dojo_keys.UP_ARROW:
				case dojo_keys.DOWN_ARROW:
				case dojo_keys.LEFT_ARROW:
				case dojo_keys.RIGHT_ARROW:
					break; // fall through
				default: 
					return; // ignore other keys
				}
				
				var cell = grid.focus.cell;
				var rowIndex = grid.focus.rowIndex;
				if (! cell) return;
				if (rowIndex < 0) return;
				var selIndex = grid.selection.selectedIndex;
				
				if (selIndex < 0) {
					grid.selection.select(rowIndex);
				} else {
					var node = cell.getNode(rowIndex);
					node.focus();
				}
            dojo_event.stop(e);
			},
			
			_handle_dokeyup: function(grid, e) {
				switch (e.keyCode) {
				case dojo_keys.UP_ARROW:
				case dojo_keys.DOWN_ARROW:
				case dojo_keys.LEFT_ARROW:
				case dojo_keys.RIGHT_ARROW:
					return; // don't trap arrow keys
				default: 
					break; // fall through
				}

				var cell = grid.focus.cell;
				var rowIndex = grid.focus.rowIndex;
				if (! cell) return;
				if (rowIndex < 0) return;
				var selIndex = grid.selection.selectedIndex;
				
				if (selIndex < 0) {
					grid.selection.select(rowIndex);
				} else {
					var node = cell.getNode(rowIndex);
					node.focus();
				}
				dojo_event.stop(e);
			},
			
			_handle_dokeypress: function(grid, e) {
				// only IE 8 and IE 9 need help here, lest our widget lose keyboard focus
				if ((dojo.isIE != 8) && (dojo.isIE != 9))return;
				
				// determine if we care about these keys (navigation keys)
				if (e.altKey || e.ctrlKey) return;
				switch (e.keyCode) {
				case dojo_keys.UP_ARROW:
				case dojo_keys.DOWN_ARROW:
				case dojo_keys.LEFT_ARROW:
				case dojo_keys.RIGHT_ARROW:
					// drop through
					break;
				default: 
					return;
				}

				var cell = grid.focus.cell;
				if (! cell) {
					cell = grid.getCell(0);
				}
				var rowIndex = grid.focus.rowIndex;
				if (rowIndex < 0) rowIndex = 0;
				var node = cell.getNode(rowIndex);
				node.focus();
				dojo_event.stop(e);
			},
			
			/**
			 * 
			 */
			_handleFocus: function(grid, cell, rowIndex) {
				if (this._internalCall) {
					this._internalCall = false;
					return;
				}
				if (rowIndex < 0) return;
				grid.selection.select(rowIndex);				
				var cellNode = cell.getNode(rowIndex); 
				if (! grid.focus.isFocusCell(cell, rowIndex)) {
					this._internalCall = true;
					grid.focus.setFocusCell(cell, rowIndex);
				}
			},
			
			/**
			 * Called after onClick of all associated grids to handle selection.
			 * Publishes <this.id>-selectionChanged topic
			 * 
			 * @private
			 * @param e Event row's click event
			 */
			_handleSelect: function(sourceGrid, rowIndex){
				for(i=0; i<this._associatedGrids.length; i++)
				{
					var gridID = this._associatedGrids[i];
					if( gridID != sourceGrid.id )
					{
						var grid = dijit_registry.byId(gridID);
						if( grid ) grid.selection.clear();
					}
				}
				
				if( this._lastGridSelected != sourceGrid.id
					|| this._lastRowSelected != rowIndex) {
					
					this._lastGridSelected = sourceGrid.id;
					this._lastRowSelected = rowIndex;
					var e = { grid: sourceGrid, rowIndex: rowIndex };
					dojo_connect.publish(this.id+"-selectionChanged", [e]);
				}
			}
	

});
});
