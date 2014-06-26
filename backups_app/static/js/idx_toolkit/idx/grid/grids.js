/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang","idx/main","dojo/_base/kernel"],
	   function(dLang,iMain,dKernel) {
	dKernel.deprecated("idx.grid.grids","idx.grid.grids deprecated. The idx/grid/grids module is no longer needed since Dojo 1.8");
	/**
	 * @name idx.grid.grids
	 * @deprecated
	 * @class Deprecated extension to dojox.grid._ViewManager to backport a Dojo 1.7 bug fix to Dojo 1.6.
	 *        This is no longer needed for Dojo 1.8.  It is also recommended you move to GridX in favor
	 *        of dojox.grid.DataGrid.
	 */
	var iGrids = dLang.getObject("grid.grids", true, iMain);
    
    return iGrids;
});
