/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2011, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/kernel",
        "idx/app/ConsoleLayout"
	], function(dojo_declare, 
				dojo_kernel,
				idx_app_ConsoleLayout) {

dojo_kernel.deprecated("idx/templates/ConsoleLayout", "Use idx/app/ConsoleLayout instead.", "IDX 2.0");

/**
 * @name idx.templates.ConsoleLayout
 * @class Templated Widget for a basic InfoSphere styled application
 * Uses supporting mixin to dynamically load from a registry and populate
 * the UI in this template.
 * @deprecated Use idx/app/ConsoleLayout instead.
 * 
 */

return dojo_declare("idx.templates.ConsoleLayout", [idx_app_ConsoleLayout],
/**@lends idx.templates.ConsoleLayout#*/
{

});

});