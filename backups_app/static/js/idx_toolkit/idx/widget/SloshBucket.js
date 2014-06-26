/**
 * Licensed Materials - Property of IBM (C) Copyright IBM Corp. 2012 US Government Users Restricted Rights - Use,
 * duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/on",
	"dojo/keys",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-attr",
	"dojo/store/Memory",
	"gridx/Grid",
	"gridx/core/model/cache/Sync",
	"gridx/modules/Body",
	"gridx/modules/select/Row",
	"gridx/modules/extendedSelect/Row",
	"gridx/modules/Focus",
	"gridx/modules/CellWidget",
	"gridx/modules/Filter",
	"gridx/modules/move/Row",
	"gridx/modules/VirtualVScroller",
	"idx/html",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"dijit/_WidgetBase",
	"dijit/layout/_ContentPaneResizeMixin",
	"dijit/registry",
	"dijit/Tooltip",
	"dojo/i18n!./nls/SloshBucket",
	"dojo/text!./templates/SloshBucket.html"
], //
function(declare, //
array, //
event, //
lang, //
aspect, //
on, //
keys, //
domStyle, //
domClass, //
domConstruct, //
domGeom, //
domAttr, //
MemoryStore, //
Grid, //
Cache, //
Body, //
SelectRow, //
ExtendedSelectRow, //
Focus, //
CellWidget, //
FilterModule, //
MoveRow, //
VirtualVScroller, //
idxHtml, //
_TemplatedMixin, //
_WidgetsInTemplateMixin, //
Button, //
_WidgetBase, //
_ContentPaneResizeMixin,
registry, //
Tooltip, //
messages, //
template) {
	/**
	 * @name idx.widget.SloshBucket
	 * @class Provides a widget that is used to pick a subset of unique items from a larger set of items.
	 *        <p>
	 *        The widget contains two single column lists. One list contains the available items and the other list
	 *        contains the selected items. The <strong>Add</strong> button and a <strong>Remove</strong> button that
	 *        are used to move items from one list to the other appear between the columns. Optionally, the widget
	 *        includes an <strong>Up</strong> button and a <strong>Down</strong> button that are used to order the
	 *        selected items.
	 *        </p>
	 */
	return declare("idx.widget.SloshBucket", [
		_WidgetBase,
		_TemplatedMixin,
		_WidgetsInTemplateMixin,
		_ContentPaneResizeMixin
	], {
		/** @lends idx.widget.SloshBucket.prototype */

		templateString: template,
		widgetsInTemplate: true,
		baseClass: "idxSloshBucket",

		/**
		 * If set to <code>false</code>, then the move up and move down buttons are not displayed.
		 */
		canReorderSelectedGridData: true,
		/**
		 * If set to <code>true</code>, when an available item is added to the selected list it is hidden in the
		 * available list.
		 */
		hideAvailableOnAdd: true,
		/**
		 * Boolean indicating if fixed values can be moved up and down within the selected grid.
		 */
		canReoderFixedValues: false,
		/**
		 * Boolean indicating if the sloshBucket is disabled.
		 */
		disabled: false,
		/**
		 * An optional label to display above the available grid.
		 */
		availableLabel: "",
		/**
		 * An optional label to display above the selected grid.
		 */
		selectedLabel: "",
		/**
		 * Attribute used to order the rows in the selected grid. Used if canReorderSelectedGridData is
		 * <code>true</code>.
		 */
		orderField: "order",
		/**
		 * Attribute used to show / hide the rows in the selected grid. Used if hideAvailableOnAdd is <code>true</code>.
		 */
		displayItField: "displayit",
		/**
		 * The tooltip position.
		 */
		tooltipPosition: [
			"after",
			"before",
			"above",
			"below"
		], // adding above & below due to long tooltip with no spaces causing issues when only before & after
		/**
		 * List of modules to optionally add to the available grid.
		 */
		availableGridModules: null,
		/**
		 * List of modules to optionally add to the selected grid.
		 */
		selectedGridModules: null,
		/**
		 * The core modules that will be added in the constructor and used when the grid is created.
		 */
		coreModules: null,

		/**
		 * Constructor.
		 */
		constructor: function() {
			if (!this.coreModules) {
				this.coreModules = [
					CellWidget,
					Focus,
					SelectRow,
					ExtendedSelectRow,
					FilterModule,
					VirtualVScroller, // large dojo/store/Memory performs much faster with VirtualVScroller
					{
						moduleClass: Body,
						emptyInfo: ""
					}
				];
				if (this.canReorderSelectedGridData) {
					this.coreModules.push({
						moduleClass: MoveRow,
						moveField: this.orderField
					});
				}
			}
		},

		/**
		 * Post create.
		 */
		postCreate: function() {
			this.inherited(arguments);
			this._filterCheckerFunction = lang.hitch(this, "_filterChecker");
			this._setButtonsTitle();
			this.own(on(this.focusNode || this.domNode, "keydown", lang.hitch(function(evt) {
				if (evt.keyCode == keys.ESCAPE) {
					Tooltip.hide(this._prevTooltipCellNode);
				}
			})));
			if (this.disabled) {
				domClass.add(this.domNode, "dijitSloshBucketDisabled");
			} else {
				domClass.remove(this.domNode, "dijitSloshBucketDisabled");
			}
		},
		startup: function(){
			this.inherited(arguments);
			this.resize();
		},
		/**
		 * Destroy.
		 */
		destroy: function() {
			if (this._prevTooltipCellNode) {
				Tooltip.hide(this._prevTooltipCellNode);
			}
			if (this.availableGrid) {
				this.availableGrid.destroy();
			}
			if (this.selectedGrid) {
				this.selectedGrid.destroy();
			}
			this.inherited(arguments);
		},
		
		/**
		 * @private Sets the title on the buttons.
		 */
		_setButtonsTitle: function() {
			var addTooltip = messages.add_to_selected_tooltip;
			this._addButton.set("title", addTooltip);
			domAttr.set(this._addButton.focusNode, "aria-label", addTooltip);
			var removeTooltip = messages.remove_from_selected_tooltip;
			this._removeButton.set("title", removeTooltip);
			domAttr.set(this._removeButton.focusNode, "aria-label", removeTooltip);
			if (this.canReorderSelectedGridData) {
				var moveUpTooltip = messages.move_up_selected_tooltip;
				this._upButton.set("title", moveUpTooltip);
				domAttr.set(this._upButton.focusNode, "aria-label", moveUpTooltip);
				var moveDownTooltip = messages.move_down_selected_tooltip;
				this._downButton.set("title", moveDownTooltip);
				domAttr.set(this._downButton.focusNode, "aria-label", moveDownTooltip);
			}
		},

		/**
		 * Returns an array of items from the selected grid.
		 * 
		 * @return Array of items.
		 */
		getSelectedItems: function() {
			if (this.selectedGrid) {
				if (this.canReorderSelectedGridData) {
					return this.selectedGrid.model.store.query({}, {
						"sort": [
							{
								attribute: this.orderField,
								descending: false
							}
						]
					});
				} else {
					return this.selectedGrid.model.store.query();
				}
			} else {
				return [];
			}
		},

		/**
		 * Sets the store and layout on the available (left) grid.
		 * 
		 * @param store
		 *            The store for the available grid.
		 * @param layout
		 *            The structure for the available grid.
		 */
		setAvailableGridData: function(store, layout) {
			if (this.availableGrid) {
				this.availableGrid.destroy();
			}
			if (this.availableLabel.length == 0) {
				domClass.add(this._availableLabel, "dijitHidden");
			} else {
				domClass.remove(this._availableLabel, "dijitHidden");
			}
			this.availableGrid = new Grid({
				store: store,
				structure: this._hitchEscapeHtmlDecorators(layout),
				cacheClass: Cache,
				selectRowTriggerOnCell: true,
				modules: this._getAvailableGridModules(),
				columnWidthAutoResize: true
			});
			domConstruct.place(this.availableGrid.domNode, this._availableGridContainer, "only");
			this.availableGrid.startup();

			this._setAvailableGridConnections();
			this.refreshAvailableGrid();
		},
		_setAvailableGridDataAttr: function(gridData){
			this.availableGridData = gridData;
			this.setAvailableGridData(gridData.store, gridData.layout);
		},

		/**
		 * @private Returns the modules to add to the available grid.
		 */
		_getAvailableGridModules: function() {
			var modules = this.coreModules;
			if (this.availableGridModules) {
				for ( var i in this.availableGridModules) {
					modules.push(this.availableGridModules[i]);
				}
			}
			return modules;
		},

		/**
		 * @private Any cell without a decorator, add the html escape decorator so all string data is shown as-is.
		 * @param structure
		 *            Structure array containing column definitions to modify.
		 */
		_hitchEscapeHtmlDecorators: function(structure) {
			if (structure) {
				for ( var i in structure) {
					var cell = structure[i];
					if (cell && !cell.decorator) {
						cell.decorator = function(data, rowId) {
							if (data && lang.isString(data)) {
								return idxHtml.escapeHTML(data);
							} else {
								return data;
							}
						};
					}
				}
			}
			return structure;
		},

		/**
		 * @private Set the connections for the available grid.
		 */
		_setAvailableGridConnections: function() {
			this.own(aspect.after(this.availableGrid.select.row, "onSelectionChange", lang.hitch(this, function(selected) {
				this._addButton.set("disabled", this.disabled || selected.length == 0);
			}), true));
			this.own(on(this.availableGrid.domNode, "keydown", lang.hitch(this, function(evt) {
				if (evt.ctrlKey && evt.keyCode == 65) { // Ctrl A
					event.stop(evt);
					this._selectAllRows(this.availableGrid);
				}
			})));
			this.own(aspect.after(this.availableGrid, "onRowDblClick", lang.hitch(this, function(evt) {
				Tooltip.hide(evt.target);
				if (!this.disabled) {
					this._addItem(this.availableGrid.row(evt.rowId).item());
					if (this.hideAvailableOnAdd) {
						this.refreshAvailableGrid();
					}
				}
			}), true));
			this._addGridTooltipConnect(this.availableGrid);
		},

		/**
		 * @private Selects all rows in the grid.
		 */
		_selectAllRows: function(grid) {
			grid.select.row.selectByIndex([
				0,
				grid.rowCount() - 1
			]);
		},

		/**
		 * @private Set up the grid tooltip connections. On mouse over a grid row, display the tooltip. On mouse out,
		 *          hide the tooltip. When hit Control F1, display the tooltip. When hit Escape, hide the tooltip.
		 */
		_addGridTooltipConnect: function(grid) {
			// Ctrl F1 opens the tooltip. Escape closes it.
			this.own(on(grid.domNode, "keypress", lang.hitch(this, function(evt) {
				if (evt.ctrlKey && evt.charOrCode == keys.F1) {
					var node = evt.target;
					while (true) {
						if (!node || domClass.contains(node, "gridxRow")) {
							break;
						}
						node = node.parentNode;
					}
					if (node && node.getAttribute("rowid") != undefined) {
						var item = grid.row(node.getAttribute("rowid")).item();
						var tooltipText = this.getGridTooltipText(grid, item);
						if (tooltipText && tooltipText != "") {
							if (!this._prevTooltipCellNode || this._prevTooltipCellNode != evt.target) {
								try {
									if (evt.target) {
										Tooltip.show(tooltipText, evt.target, this.tooltipPosition, !this.isLeftToRight(), this.textDir);
									}
									this._prevTooltipCellNode = evt.cellNode;
								} catch (e) {
									Tooltip.hide(this._prevTooltipCellNode);
								}
							}
						}
						event.stop(evt);
					}
				}
			})));
			// Hovering over a row displays the tooltip.
			this.own(aspect.after(grid, "onRowMouseOver", lang.hitch(this, function(evt) {
				var row = grid.row(evt.rowId);
				if (row) {
					var item = row.item();
					if (item) {
						var tooltipText = this.getGridTooltipText(grid, item);
						if (tooltipText && tooltipText != "") {
							if (!this._prevTooltipCellNode || this._prevTooltipCellNode != evt.cellNode) {
								try {
									if (evt.cellNode) {
										Tooltip.show(tooltipText, evt.cellNode, this.tooltipPosition, !this.isLeftToRight(), this.textDir);
									}
									this._prevTooltipCellNode = evt.cellNode;
								} catch (e) {
									Tooltip.hide(this._prevTooltipCellNode);
								}
							}
						}
					}
				}
			}), true));
			this.own(aspect.after(grid, "onRowMouseOut", lang.hitch(this, function(evt) {
				this._prevTooltipCellNode = null;
				Tooltip.hide(evt.cellNode);
			}), true));
		},

		/**
		 * Returns the grid item tooltip text. Override this method to return custom tooltip text which is displayed
		 * when the user hovers over a row or hits Control F1 from a focused row.
		 * 
		 * @param grid
		 *            The grid the user is hovering over.
		 * @param item
		 *            The item in the grid on which the the user is focused.
		 * @return The tooltip text to display.
		 */
		getGridTooltipText: function(grid, item) {
			return "";
		},

		/**
		 * Sets the store, layout, and fixed values for the selected (right) grid. Call
		 * <code>setAvailableGridData</code> method before calling <code>setSelectedGridData</code> method.
		 * 
		 * @param store
		 *            The selected values store.
		 * @param layout
		 *            The selected values structure.
		 * @param fixedValues
		 *            Array of values that cannot be removed from the selected values grid. (Optional)
		 */
		setSelectedGridData: function(store, layout, fixedValues) {
			if (this.selectedGrid) {
				this.selectedGrid.destroy();
			}
			this._fixedSelectedValues = fixedValues;

			if (this.selectedLabel.length == 0) {
				domClass.add(this._selectedLabel, "dijitHidden");
			} else {
				domClass.remove(this._selectedLabel, "dijitHidden");
			}
			if (!this.canReorderSelectedGridData) {
				domClass.add(this._valuesGridContentPane, "dijitSloshBucketHideSortButtons");
				domClass.add(this._moveUpDownButtonContainer, "dijitHidden");
			}

			var selectedValuesMap = (this.canReorderSelectedGridData || this.hideAvailableOnAdd) ? this._preprocessSelectedStore(store, fixedValues) : {};
			this.selectedGrid = new Grid({
				store: store,
				structure: this._hitchEscapeHtmlDecorators(layout),
				cacheClass: Cache,
				selectRowTriggerOnCell: true,
				modules: this._getSelectedGridModules(),
				columnWidthAutoResize: true
			});
			domConstruct.place(this.selectedGrid.domNode, this._valuesGridContainer, "only");
			this.selectedGrid.startup();

			this._setSelectedGridConnections();

			if (this.hideAvailableOnAdd) {
				this._hideAvailableGridItems(selectedValuesMap);
			} else {
				this.availableGrid.select.row.clear();
			}
			// Disable the buttons 
			this._addButton.set("disabled", true);
			this._removeButton.set("disabled", true);
			if (this.canReorderSelectedGridData) {
				this._upButton.set("disabled", true);
				this._downButton.set("disabled", true);
			}
			if (this._started) {
				this.resize();
			}
		},
		
		_setSelectedGridDataAttr: function(gridData){
			this.selectedGridData = gridData;
			this.setSelectedGridData(gridData.store, gridData.layout, gridData.fixedValues);
		},

		/**
		 * @private Hides the available grid items that are in the selected values map.
		 */
		_hideAvailableGridItems: function(selectedMap) {
			for ( var i in selectedMap) {
				var id = selectedMap[i];
				var availItem = this.availableGrid.store.get(id);
				if (availItem) {
					this.setAvailableItemDisplayable(availItem, false);
				}
			}
			this.refreshAvailableGrid();
		},

		/**
		 * @private Returns the modules to add to the available grid.
		 */
		_getSelectedGridModules: function() {
			var modules = this.coreModules;
			if (this.selectedGridModules) {
				for ( var i in this.selectedGridModules) {
					modules.push(this.selectedGridModules[i]);
				}
			}
			return modules;
		},

		/**
		 * @private Preprocess the selected grid's store. If canReorderSelectedGridData is <code>true</code>, then
		 *          gridx requires a field for ordering. This method sets this order field if it is not already set. If
		 *          hideAvailableOnAdd is <code>true</code>, then return an map with all the values in the store.
		 */
		_preprocessSelectedStore: function(store, fixedValues) {
			var results;
			var prefix = 0;
			if (this.canReorderSelectedGridData) {
				results = store.query({}, {
					"sort": [
						{
							attribute: this.orderField,
							descending: false
						}
					]
				});
				// If cannot move fixed values up and down, then make sure they are at the top of the list.
				if (!this.canReoderFixedValues && fixedValues && fixedValues.length > 0) {
					prefix = fixedValues.length;
					for ( var i = 0; i < fixedValues.length; i++) {
						var fixedValue = fixedValues[i];
						for ( var j = 0; j < results.length; j++) {
							var item = results[j];
							if (item[store.idProperty] == fixedValue) {
								item[this.orderField] = i;
								break;
							}
						}
					}
				}
			} else {
				results = store.query();
			}
			var selectedValuesMap = {};
			for ( var i = 0; i < results.length; i++) {
				var item = results[i];
				// Set the order of the other values.
				if (this.canReorderSelectedGridData) {
					if (item[this.orderField] == undefined) {
						item[this.orderField] = prefix + i;
					}
				}
				if (this.hideAvailableOnAdd) {
					var v = item[this.availableGrid.store.idProperty];
					selectedValuesMap[v] = v;
				}
			}
			return selectedValuesMap;
		},

		/**
		 * @private Set the selected grid's connections. Hitting Control A selects all the rows in the grid. Double
		 *          clicking a row moves it to the other grid. Selecting a row enables / disables the add, remove, up,
		 *          and down buttons.
		 */
		_setSelectedGridConnections: function() {
			this.own(on(this.selectedGrid.domNode, "keydown", lang.hitch(this, function(evt) {
				if (evt.ctrlKey && evt.keyCode == 65) { // Ctrl A
					event.stop(evt);
					this._selectAllRows(this.selectedGrid);
				}
			})));
			this.own(aspect.after(this.selectedGrid, "onRowDblClick", lang.hitch(this, function(evt) {
				Tooltip.hide(evt.target);
				if (!this.disabled) {
					var item = this.selectedGrid.row(evt.rowId).item();
					if (!this.isFixed(item[this.selectedGrid.model.store.idProperty])) {
						if (this.isValidToRemove([ item ])) {
							if (this.hideAvailableOnAdd) {
								var availItem = this.availableGrid.store.get(item[this.availableGrid.model.store.idProperty]);
								if (availItem) {
									this.setAvailableItemDisplayable(availItem, true);
									this.refreshAvailableGrid();
								}
							}
							// Remove the item from the selected grid
							this.selectedGrid.select.row.clear();
							this.selectedGrid.model.store.remove(item[this.selectedGrid.model.store.idProperty]);
						}
					}
				}
			}), true));
			this.own(aspect.after(this.selectedGrid.select.row, "onSelectionChange", lang.hitch(this, function(selected) {
				if (this.canReorderSelectedGridData) {
					this._checkUpDownButtons();
				}
				this._checkRemoveButton();
			}), true));
			this.own(aspect.after(this.selectedGrid.body, "onRender", lang.hitch(this, function() {
				if (this.canReorderSelectedGridData) {
					this._checkUpDownButtons();
				}
			})));
			this.own(aspect.after(this.selectedGrid.model, "onDelete", lang.hitch(this, function() {
				if (this.canReorderSelectedGridData) {
					this._checkUpDownButtons();
				}
				this.onAddRemove();
			})));
			this.own(aspect.after(this.selectedGrid.model, "onNew", lang.hitch(this, function(id) {
				if (this.canReorderSelectedGridData) {
					this._checkUpDownButtons();
				}
				this.onAddRemove();
				var index = this.selectedGrid.model.idToIndex(id);
				if (index > 0) {
					setTimeout(lang.hitch(this, function() {
						this.selectedGrid.vScroller.scrollToRow(index - 1, true);
					}), 500);
				}
			}), true));
			this.own(aspect.after(this.selectedGrid.model, "onMoved", lang.hitch(this, "onMoved")));
			this._addGridTooltipConnect(this.selectedGrid);
		},

		/**
		 * Sets the grid item as displayable or hidden. Must call filter on the grid to get the item to actually display
		 * or hide.
		 */
		setAvailableItemDisplayable: function(item, displayable) {
			if (item && this.hideAvailableOnAdd) {
				item[this.displayItField] = displayable ? "true" : "false";
				this.availableGrid.store.put(item, {
					id: item.id,
					overwrite: true
				});
			}
		},

		/**
		 * Returns boolean indicating if the input value is a fixed value. Fixed data is fixed in the selected grid and
		 * cannot be removed from the selected grid.
		 * 
		 * @return Boolean indicating if the value is a fixed value.
		 */
		isFixed: function(value) {
			return (this._fixedSelectedValues ? (array.indexOf(this._fixedSelectedValues, value) >= 0) : false);
		},

		/**
		 * Returns the fixed selected values. Fixed data is fixed in the selected grid and cannot be removed from the
		 * selected grid.
		 * 
		 * @return Array of selected grid fixed values.
		 */
		getFixedSelectedValues: function() {
			return this._fixedSelectedValues;
		},

		/**
		 * Update the list of fixed values that cannot be removed from the selected grid.
		 * 
		 * @param fixedValues
		 *            Array of fixed values.
		 */
		setFixedValues: function(fixedValues) {
			if (!this.disabled && this.selectedGrid && this.availableGrid) {
				this._fixedSelectedValues = fixedValues;
				if (this._fixedSelectedValues && this._fixedSelectedValues.length > 0) {
					// Add the fixed values to the selected grid.
					for ( var i in this._fixedSelectedValues) {
						var item = this.availableGrid.store.get(this._fixedSelectedValues[i]);
						if (item) {
							this._addItem(item);
						}
					}
					if (this.hideAvailableOnAdd) {
						setTimeout(lang.hitch(this, function() {
							this.refreshAvailableGrid();

							this.selectedGrid.select.row.clear();
							this.selectedGrid.body.refresh();
						}), 100);
					}
				}
				// If cannot move fixed values up and down, then make sure they are at the top of the list.
				if (this.canReorderSelectedGridData && !this.canReoderFixedValues) {
					if (this._fixedSelectedValues && this._fixedSelectedValues.length > 0) {
						for ( var i = 0; i < this._fixedSelectedValues.length; i++) {
							var index = this.selectedGrid.model.idToIndex(this._fixedSelectedValues[i]);
							if (index > 0) {
								this.selectedGrid.move.row.move([
									index
								], 0);
							}
						}
					}
				}
				if (this.canReorderSelectedGridData) {
					this._checkUpDownButtons();
				}
				this._checkRemoveButton();
			}
		},

		/**
		 * Boolean that sets the slosh bucket as disabled.
		 * 
		 * @param disabled
		 *            {Boolean} Set to <code>true</code> to make the slosh bucket disabled and <code>false</code> to
		 *            make it read only.
		 */
		_setDisabledAttr: function(disabled) {
			this.disabled = disabled;
			if (disabled) {
				domClass.add(this.domNode, "dijitSloshBucketDisabled");
			} else {
				domClass.remove(this.domNode, "dijitSloshBucketDisabled");
			}
			this._addButton.set("disabled", this.disabled);
			this._removeButton.set("disabled", this.disabled);
			this._upButton.set("disabled", this.disabled);
			this._downButton.set("disabled", this.disabled);
		},

		/**
		 * @private Event fired when the user clicks the remove button to remove the selected items from the selected
		 *          grid.
		 */
		_onClickRemove: function() {
			var selectedItems = [];
			var selected = this.selectedGrid.select.row.getSelected();
			for ( var i = 0; i < selected.length; i++) {
				var row = this.selectedGrid.row(selected[i]);
				if (row) {
					selectedItems.push(row.item());
				}
			}
			if (this.isValidToRemove(selectedItems)) {
				if (this.hideAvailableOnAdd) { // If hideAvailableOnAdd, then show the selected items in the available grid
					for ( var i = 0; i < selectedItems.length; i++) {
						var item = selectedItems[i];
						var itemValue = item[this.availableGrid.model.store.idProperty];
						var availItem = this.availableGrid.store.get(itemValue);
						if (availItem) {
							this.setAvailableItemDisplayable(availItem, true);
						}
					}
					this.refreshAvailableGrid();
				}
				// Remove the selected items from the selected grid
				for ( var i = 0; i < selectedItems.length; i++) {
					this.selectedGrid.model.store.remove(selectedItems[i][this.selectedGrid.model.store.idProperty]);
				}
				this.selectedGrid.select.row.clear();
			}
		},

		/**
		 * Check if the input items can be removed from the selected grid. This method can be overriden to add custom
		 * logic.  (This method is called after the user selects the remove button and after the user double clicks on a row in the selected grid.)
		 * 
		 * @return Boolean indicating if the input items can be removed from the selected grid.
		 */
		isValidToRemove: function(selectedItems) {
			return true;
		},

		/**
		 * @private Event fired when the up button is clicked.
		 */
		_onClickUp: function() {
			this._moveUpSelectedRows(this.selectedGrid);
			if (this.canReorderSelectedGridData) {
				this._checkUpDownButtons();
			}
		},

		/**
		 * @private Moves the selected rows up.
		 */
		_moveUpSelectedRows: function(grid) {
			var rowIds = grid.select.row.getSelected();
			if (rowIds) {
				var prevIndex = -1;
				for ( var i = 0; i < rowIds.length; i++) {
					var id = rowIds[i];
					var index = grid.model.idToIndex(id);
					var newIndex = index - 1;
					if (index != 0 && prevIndex != newIndex) {
						grid.move.row.move([
							index
						], newIndex);
						prevIndex = newIndex;
					} else {
						prevIndex = index;
					}
				}
				if (grid.vScroller && grid.vScroller.scrollToRow) {
					grid.vScroller.scrollToRow(grid.row(rowIds[0]).visualIndex(), true);
				}
			}
		},

		/**
		 * @private Event fired when the down button is clicked.
		 */
		_onClickDown: function() {
			this._moveDownSelectedRows(this.selectedGrid);
			this._checkUpDownButtons();
		},

		/**
		 * @private Move the selected rows down.
		 */
		_moveDownSelectedRows: function(grid) {
			var rowIds = grid.select.row.getSelected();
			if (rowIds) {
				var lastIndex = grid.rowCount() - 1;
				var prevIndex = -1;
				for ( var i = rowIds.length - 1; i >= 0; i--) {
					var id = rowIds[i];
					var index = grid.model.idToIndex(id);
					var newIndex = index + 2;
					if (index != lastIndex && prevIndex + 1 != newIndex) {
						grid.move.row.move([
							index
						], newIndex);
						prevIndex = newIndex;
					} else {
						prevIndex = index;
					}
				}
				if (grid.vScroller && grid.vScroller.scrollToRow) {
					grid.vScroller.scrollToRow(grid.row(rowIds[0]).visualIndex(), true);
				}
			}
		},

		/**
		 * @private Check if the remove button should be disabled. If the selected item is a fixed value, it cannot be
		 *          removed.
		 */
		_checkRemoveButton: function() {
			var selected = this.selectedGrid.select.row.getSelected();
			var disabled = this.disabled || selected.length == 0;
			if (!disabled && this._fixedSelectedValues && this._fixedSelectedValues.length > 0) {
				for ( var i = 0; i < selected.length; i++) {
					var row = this.selectedGrid.row(selected[i]);
					if (row && row.item() && row.item()[this.selectedGrid.model.store.idProperty]) {
						var v = row.item()[this.selectedGrid.model.store.idProperty];
						if (v) {
							if (this.isFixed(v)) {
								disabled = true;
								break;
							}
						}
					}
				}
			}
			this._removeButton.set("disabled", disabled);
		},

		/**
		 * @private Check if the up down buttons should be disabled.
		 */
		_checkUpDownButtons: function() {
			if (this.canReorderSelectedGridData) {
				if (this._fixedSelectedValues && this._fixedSelectedValues.length > 0 && !this.canReoderFixedValues) {
					var disableMoveUp = false;
					var selected = this.selectedGrid.select.row.getSelected();
					var disabled = this.disabled || selected.length == 0;
					if (!disabled) {
						for ( var i = 0; i < selected.length; i++) {
							var row = this.selectedGrid.row(selected[i]);
							if (row && row.item()) {
								var v = row.item()[this.selectedGrid.model.store.idProperty];
								if (v) {
									if (this.isFixed(v)) {
										disabled = true;
										break;
									}
								}
							}
							var index = this.selectedGrid.model.idToIndex(selected[i]);
							if (index == this._fixedSelectedValues.length) {
								disableMoveUp = true;
							}
						}
					}
					this._upButton.set("disabled", disabled || disableMoveUp);
					this._downButton.set("disabled", disabled || !this._hasRowsToMoveDown(this.selectedGrid));
				} else {
					this._upButton.set("disabled", this.disabled || !this._hasRowsToMoveUp(this.selectedGrid));
					this._downButton.set("disabled", this.disabled || !this._hasRowsToMoveDown(this.selectedGrid));
				}
			}
		},

		/**
		 * @private Boolean indicating if there are rows to move up.
		 */
		_hasRowsToMoveUp: function(grid) {
			var hasRowsToMoveUp = false;
			var rowIds = grid.select.row.getSelected();
			if (rowIds.length > 0) {
				var prevIndex = -1;
				for ( var i = 0; i < rowIds.length; i++) {
					var index = grid.model.idToIndex(rowIds[i]);
					if (prevIndex + 1 != index) {
						hasRowsToMoveUp = true;
						break;
					}
					prevIndex = index;
				}
			}
			return hasRowsToMoveUp;
		},

		/**
		 * @private Boolean indicating if there are rows to move down.
		 */
		_hasRowsToMoveDown: function(grid) {
			var hasRowsToMoveDown = false;
			var rowIds = grid.select.row.getSelected();
			if (rowIds.length > 0) {
				var prevIndex = grid.rowCount();
				for ( var i = rowIds.length - 1; i >= 0; i--) {
					var index = grid.model.idToIndex(rowIds[i]);
					if (prevIndex - 1 != index) {
						hasRowsToMoveDown = true;
						break;
					}
					prevIndex = index;
				}
			}
			return hasRowsToMoveDown;
		},

		/**
		 * Add the input newItem to the selected grid. This method can be used to add user values to the selected grid.
		 * The input newItem can optionally be in the available grid.
		 * 
		 * @param newItem
		 *            The new item to add to the selected grid.
		 */
		addToSelected: function(newItem) {
			if (this.hideAvailableOnAdd) {
				// If the item is in the available grid, then hide it
				var item = this.availableGrid.store.get(newItem[this.availableGrid.store.idProperty]);
				if (item) {
					if (item[this.displayItField] == undefined || item[this.displayItField] != "false") {
						this.setAvailableItemDisplayable(item, false);
					}
				}
				this.refreshAvailableGrid();
			}
			// Give the item an order
			if (this.canReorderSelectedGridData && newItem[this.orderField] == undefined) {
				newItem[this.orderField] = this._getLastOrder();
			}
			// Add it to selected grid.
			try {
				this.selectedGrid.model.store.add(newItem);
			} catch (e) {
				// ignore
			}
		},

		/**
		 * @private Event fired when items from the available grid should be added to the selected grid.
		 */
		_onClickAdd: function() {
			var selected = this.availableGrid.select.row.getSelected();
			for ( var i = 0; i < selected.length; i++) {
				var row = this.availableGrid.row(selected[i]);
				if (row) {
					this._addItem(row.item());
				}
			}
			if (this.hideAvailableOnAdd) {
				this.refreshAvailableGrid();
			}
		},

		/**
		 * @private Adds the item to the selected grid. If <code>this.hideAvailableOnAdd</code> is <code>true</code>,
		 *          then hide the item from the available grid.
		 * @param item
		 *            The item to add to the selected grid.
		 */
		_addItem: function(item) {
			// Add the item to the selected store.
			var newItem = this.newItem(item);
			if (newItem) {
				if (this.hideAvailableOnAdd) {
					this.setAvailableItemDisplayable(item, false);
				}
				if (this.canReorderSelectedGridData && newItem[this.orderField] == undefined) {
					newItem[this.orderField] = this._getLastOrder();
				}
				try {
					this.selectedGrid.model.store.add(newItem);
				} catch (e) {
					// ignore duplicates
				}
			}
		},

		/**
		 * Creates a new item that will be added to the selected grid's store. This method can be overriden to add
		 * custom code for creating the new item. If this method returns null, then do not add an item.
		 * 
		 * @return The item to be added to the selected grid.
		 */
		newItem: function(item) {
			var newItem = {};
			for ( var i in item) {
				newItem[i] = item[i];
			}
			if (!this.hideAvailableOnAdd && this.selectedGrid.store.idProperty) {
				var idProperty = this.selectedGrid.store.idProperty;
				newItem[idProperty] = item[idProperty] + "_" + new Date().getTime();
			}
			if (this.canReorderSelectedGridData) {
				newItem[this.orderField] = this._getLastOrder();
			}
			return newItem;
		},

		/**
		 * @private Returns an order value for the last item. If an item is given this order value, the item will be
		 *          positioned at the end of the selected list.
		 */
		_getLastOrder: function() {
			var order = 0;
			for ( var i in this.selectedGrid.model.store.data) {
				var data = this.selectedGrid.model.store.data[i];
				if (order < data[this.orderField]) {
					order = data[this.orderField];
				}
			}
			order++;
			return order;
		},

		/**
		 * Filters the available data using the passed in filter structure. Currently this function only filters on one
		 * field in this input struct. In the future, the filtering could be enhanced to filter on multiple fields in
		 * this struct.
		 * 
		 * @param struct
		 *            The filter structure for filtering.
		 */
		filter: function(struct) {
			for ( var i in struct) {
				this._filterField = i;
				this._filterValue = struct[i].toLowerCase();
				break;
			}
			this.refreshAvailableGrid();
		},

		/**
		 * @private Called for each row to determine if it matches the filter data.
		 */
		_filterChecker: function(row, id) {
			if (this.hideAvailableOnAdd && row.item[this.displayItField] != undefined && row.item[this.displayItField] == "false") {
				return false;
			} else if (this._filterField == undefined || this._filterValue == undefined || this._filterValue == "") {
				return true;
			} else {
				var rowValue = row.item[this._filterField];
				if (rowValue) {
					return rowValue.toLowerCase().indexOf(this._filterValue) > -1;
				} else {
					return true;
				}
			}
		},

		/**
		 * @private Filters and refreshes the available grid.
		 */
		refreshAvailableGrid: function() {
			this.availableGrid.select.row.clear();
			this.availableGrid.model.filter(this._filterCheckerFunction);
			this.availableGrid.body.refresh();
		},

		/**
		 * Resizes the pane.
		 * 
		 * @param changeSize
		 *            The changed size.
		 */
		resize: function(changeSize) {
			this.inherited(arguments);

			var availableLabelBox = domGeom.getMarginBox(this._availableLabel);
			var selectedLabelBox = domGeom.getMarginBox(this._selectedLabel);
			var valuesMarginBox = domGeom.getMarginBox(this._valuesGridContainer);
			var availableMarginBox = domGeom.getMarginBox(this._availableGridContainer);
			var widgetMarginBox = domGeom.getMarginBox(this.domNode);
			// Use height of domNode as the base height, otherwise height reduced each time that widget (with label) resized.
			//var height = (valuesMarginBox.h - selectedLabelBox.h) > (availableMarginBox.h - availableLabelBox.h) ? valuesMarginBox.h - selectedLabelBox.h : availableMarginBox.h - availableLabelBox.h;
			var height = widgetMarginBox.h - Math.max(selectedLabelBox.h, availableLabelBox.h);
			
			if (height > 0 && valuesMarginBox.w > 0) {
				if (this.selectedGrid) {
					domGeom.setMarginBox(this._valuesGridBorder, {
						h: height
					});
					this.selectedGrid.resize({
						h: height,
						w: valuesMarginBox.w
					});
					this._updateVirtualVScroller(this.selectedGrid);
				}
				if (this.availableGrid) {
					domGeom.setMarginBox(this._availableGridBorder, {
						h: height
					});
					this.availableGrid.resize({
						h: height,
						w: availableMarginBox.w
					});
					this._updateVirtualVScroller(this.availableGrid);
				}
			}
		},

		/**
		 * @private Update the placement of the VirtualVScroller
		 */
		_updateVirtualVScroller: function(grid) {
			if (grid.vScrollerNode) {
				var ltr = grid.isLeftToRight();
				var margin = ltr ? "marginRight" : "marginLeft";
				var margin = grid.mainNode.style[margin];
				if (margin) {
					var leftRight = ltr ? "right" : "left";
					domStyle.set(grid.vScrollerNode, leftRight, "-" + margin);
				}
			}
		},

		/**
		 * Fired when an item is added or remove from the selected grid.
		 */
		onAddRemove: function() {
		},

		/**
		 * Fired when an row is move up or down in the selected grid.
		 */
		onMoved: function() {
		}
	});
});
