define([
	"dojo/_base/declare",
	"dojo/_base/kernel",
	"idx/app/Banner"
], function(dojo_declare, dojo_kernel, idx_app_banner){

dojo_kernel.deprecated("idx/widget/Banner", "Use idx/app/Banner instead", "IDX 2.0");

/**
 * @name idx.widget.Banner
 * @class Application banner with built-in and custom links.
 * @deprecated Use idx/app/Banner instead.
 */
return dojo_declare("idx.widget.Banner", [ idx_app_banner ],
/** @lends idx.widget.Banner# */
{
});

});
