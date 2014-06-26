/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang","idx/main","./util"], 
	function(dLang,iMain,iUtil) {
  /**
   * @name idx.context
   * @namespace Provides an experimental API containing static methods for creating context scopes according 
   *            to the DOM hierarchy.  Use idx.widget.ContextScope to create scopes and sub-scopes and the 
   *            methods in this namespace to interact with them.  This API is only useful if functional areas 
   *            of the application are isolated according to the DOM hierarchy.  This allows for finding nearby
   *            objects and settings by name within a certain locality or globally while isolating others.
   *            This functions here are the beginnings of a framework to allow for looser coupling of 
   *            widgets without causing interference with widgets from different applications when 
   *            aggregated on the same screen.
   */
  var iContext = dLang.getObject("context", true, iMain);
  
  //
  // The global scope 
  //
  iContext._globalContext = [ ];

  /**
   * @public
   * @function
   * @name idx.context.get
   * @description Finds the context for the given source node or widget and attempts to obtain the
   *              attribute from it that has the specified name.  If the name is not provided then
   *              the context itself is returned.
   * @param {Node|Widget} source The node or widget for which the context is desired.
   * @param {String} name The optional name of the attribute desired from the context and if not 
   *                      specified then the context itself is used as a return value.
   * @return {Object} The attribute value or context associated with the specified source and name.
   */
  iContext.get = function(/*Node|Widget*/ source, /*String?*/ name) {
    var scope = iContext._getContextScope(source, name);
    if (! scope) {
      if (!name) return null;
      return iContext._globalContext[name];
    } else {
      if (!name) return scope;
      return scope._idx_getContextAttribute(name);
    }
  };

  /**
   * @public
   * @function
   * @name idx.context.set
   * @description Sets the value of an attribute within the scope closest (most local) to the
   *              the specified source node or widget.  The return value is a reference to 
   *              the widget representing the scope that was used, or null if the global 
   *              scope was used.

   * @param {Node|Widget} source The node or widget for which the context is desired.
   * @param {String} name The name of the attribute to be set for the context.
   * @param {Object} value The value to set for the attribute.
   * @return {Object} The context in which the attribute was set.
   */
  iContext.set = function(/*Node|Widget*/ source, 
                             /*String*/      name,
                             /*Object*/      value) {
    var scope = iContext._getContextScope(source);
    if (! scope) {
       iContext._globalContext[name] = value;
       
    } else {
       scope._idx_setContextAttribute(name, value);
    }
    return scope;
  };

  /**
   * @private
   * @function
   * @name idx.context._getContextScope
   * @description  Attempts to locate the parent/enclosing widget for the specified widget in 
   *               order to find the ContextScope to use.  If the name is specified then the 
   *               returned scope is guaranteed to be the first that defines the attribute
   *               with the specified name.
   * @param {Widget} source The starting point for finding the context scope
   * @param {String} name The optional attribute name that the context scope must have.
   */
  iContext._getContextScope = function(/*Node|Widget*/ source,
                                          /*String?*/     name) {
    if (source == null) return null;

    // check if the specified widget defines a topic
    if ((source != null) && (source._idx_hasContextAttribute)) {
      if ((!name) || (source._idx_hasContextAttribute(name))) return source;
    }

    var parent = iUtil.getParentWidget(source);
    while ((parent != null) 
           && ((!parent._idx_hasContextAttribute)
               || ((name) && (!parent._idx_hasContextAttribute(name))))) {
      
      parent = iUtil.getParentWidget(parent);
    }

    return parent;
  };
  
  return iContext;
});
