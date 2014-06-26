/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare", "dijit/_Widget"],
		function(dDeclare,dWidget) {
		/**
		 * @name idx.widget.ContextScope
		 * @class Works in conjunction with idx.context to scope attribute values in the vicinity of a widget
		 *        according to the DOM hierarchy.  This is part of an experimental API to loosely couple
		 *        widgets from disparate groups within the same DOM but under different roots and be able
		 *        to reference things by name.  This is intended for aggregate applications that leverage the
		 *        DOM to fence off distinct functional areas of the application.  The public API is found 
		 *        under the idx.context module.
		 */
return dDeclare("idx.widget.ContextScope",[dWidget],
/**@lends idx.widget.ContextScope# */
{
  /**
   * @public
   * @function
   * @description Constructor simply creates the array of values.
   */
  constructor: function(args, node) {
     this._idx_scopedVariables = [ ];
     this._idx_scopedValues    = [ ];
  },

  /**
   * @private
   * @function
   * @name _idx_hasContextAttribute
   * @description Checks if the specified variable is recognized by this instance.  Once a 
   *              variable has been declared and added it cannot be removed and will 
   *              mask anything from the parent scope.
   * @param {String} name The name of the context attribute.
   * @return {Boolean} Returns true if the attribute exists and otherwise false.
   */
  _idx_hasContextAttribute: function(/*String*/ name) {
    if (name == null) return true;
    var key = "" + name;
    return (this._idx_scopedVariables[key]);
  },

  /**
   * @private
   * @function
   * @name _idx_getContextAttribute
   * @description Obtains the scoped reference by the specified name.  If the specified 
   *              name is null, then a reference to this pane is returned.
   * @param {String} name The name of the context attribute.
   * @return {Object} Returns true if the attribute exists and otherwise false.
   */
  _idx_getContextAttribute: function(/*String*/ name) {
    if (name == null) return this;
    var key = "" + name;
    return this._idx_scopedValues[key];
  },

  /**
   * @private
   * @function
   * @name _idx_setContextAttribute
   * @description Sets the value of the variable with the specified name to the specified 
   *              value.  If the specified value is null, then this method takes no action.
   *              This will overwrite any previous value.
   * @param {String} name The name of the context attribute.
   * @param {Object} value The value for the attribute.
   */
  _idx_setContextAttribute: function(/*String*/ name, /*Object*/ value) {
    if (name == null) return;
    var key = "" + name;
    this._idx_scopedVariables[key] = true;
    this._idx_scopedValues[key]    = value;
  }
});
});
