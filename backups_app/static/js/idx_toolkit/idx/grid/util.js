/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2011, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang",
        "../resources",
        "dojo/i18n!../nls/base",
        "dojo/i18n!./nls/base",
        "dojo/i18n!./nls/GridMessages"],
	   function(dLang,iResources) {
	   
	/**
 	 * @name idx.grid.util
 	 * @namespace Provides a set of grid column formatters 
 	 */
	var iGridUtil = dLang.getObject("idx.grid.util", true);
			
	/**
	 * NLS Grid message file
	 * @private
	 * @type Object
	 */
	var idxGridMsg = iResources.getResources("idx/grid/GridMessages");	  

    /**
	 * Formatter that returns a formatted cell with an 
	 * icon indicating whether it is valid or not.
	 * Uses CSS classes 'idxGridIconPasssed', 'idxGridIconFailed'
	 * and 'idxGridIconText'.
	 * @public
	 * @function
	 * @name idx.grid.util.formatCellValid
	 * @param {String} Value of cell (text string)
	 * @param {Integer} Row rowIdx in grid
	 * @returns {String} HTML markup formatted cell
	 */
	 iGridUtil.formatCellValid = function(value, idx){
		if(Math.abs(value) == 1) { 
			return "<div class='idxGridIconPassed'>"+idxGridMsg.idxGridIconTextValid+"</div>";
		} else {
			return "<div class='idxGridIconFailed'>"+idxGridMsg.idxGridIconTextInvalid+"</div>";
		}
	};
	
	/**
	 * Formatter to add the edit pencil icon into a
	 * grid cell, indicating that cell is editable. 
	 * Adds the pencil icon to the right of the cell text.
	 * Uses CSS class 'idxGridIconEdit'.	  
	 * @public
	 * @function
	 * @name idx.grid.util.formatCellEdit
	 * @param {String} Value of cell (text string)
	 * @param {Integer} Row rowIdx in grid
	 * @returns {String} HTML markup formatted cell
	 */	
	iGridUtil.formatCellEdit = function(value, idx){
		return "<div class='idxGridIconEdit'>"+value+"</div>";
	};
	
	/**
	 * Formatter that sets a custom class for the grid cell in the row,
	 * based on the value of the cell. Cells that are not
	 * flagged are not formatted.
	 * Uses CSS class 'idxGridIconFlag'.
	 * @public
	 * @function
	 * @name idx.grid.util.formatCellCritical	  
	 * @param {String} Value of cell (text string)
	 * @param {Integer} Row index in grid
	 * @param {Object} Cell object in grid
	 * @returns {String} ""
	 */
	iGridUtil.formatCellCritical = function(value, index, cell){
		if(Math.abs(value) == 1) { 
			cell.customClasses.push("idxGridIconFlag");
		} 
		return "";	
	};
    /**
	 * Formatter that returns a formatted cell with an 
	 * icon indicating a hierarchical item.
	 * Deprecated, due to square bullet provided now by rule:
	 * .vienna .dojoxGridTreeModel .dojoxGridNoChildren .dojoxGridExpando 
	 * in main viennaGrid.css.
	 * @public
	 * @function
	 * @name idx.grid.util.formatCellDatraHierachical
	 * @param {String} Value of cell (text string)
	 * @param {Integer} Row rowIdx in grid
	 * @param {Array} cellId
	 * @param {Object} cell
	 * @returns {String} HTML markup formatted cell
	 * @deprecated
	 */
	 iGridUtil.formatCellDataHierarchical = function(value, rowIdx,cellId, cell){
		// use of 16 squarebullet for non expando nodes moved to overall vienna grid style,in viennaGrid.css 
		 return value; // wln "<div class='idxGridIconHierarchical'>"+value+"</div>"; 
	};
	
	// return the object
	return iGridUtil;
});
