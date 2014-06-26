/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
    	"dojo/_base/window",
        "dojo/dom-class",
        "dojox/mobile/SimpleDialog",
        "idx/mobile/AboutPane"],
        function(declare,
        		 win,
        		 domClass,
        		 SimpleDialog,
        		 AboutPane){

	/**
	 * Creates a new "About" dialog
	 * @name idx.mobile.About
	 * @class The About widget is a dialog presenting information about an
	 * IBM One UI application in a standard way. It extends dojox/mobile/SimpleDialog
	 * to perform initialisation and configuration.
	 * <p>
	 * To create the dialog, initialise the widget with the required
	 * properties. The appropriate HTML and CSS is created immediately, and
	 * subsidiary dijit components may be created and marshalled, but the dialog
	 * is initially hidden. When the dialog is to be shown, call the show()
	 * method. The dialog incorporates its own 'Close' button which will hide
	 * the dialog automatically. If programmatic closing of the dialog is
	 * required, the hide() method may be called.
	 * </p>
	 * @augments dojox.mobile.SimpleDialog
	 * @example
	 * var about = new idx.mobile.About({
	 * 		 
	 */
	return declare("idx.mobile.About", [SimpleDialog],
	/** @lends idx.mobile.About.prototype */
	{
		/**
		 * The product name (required), to a maximum of 90 characters. This may
		 * include simple HTML mark-up (e.g. for special characters or emphasis).
		 * @type string
		 */
		name: undefined,
		
		/**
		 * The product version (optional) in the form "V", "V.r", "V.r.m" or "V.r.m.f".
		 * @type string
		 */
		version: undefined,
		
		/**
		 * The product build identifier (optional).
		 * @type string
		 */
		build: undefined,
		
		/**
		 * The copyright or other legal information that should be displayed. This
		 * may include simple HTML mark-up (e.g. for special characters or emphasis).
		 * It may also include string substitutions, eg ${copyright}.
		 * @type string
		 */
		legal: undefined,
		
		/**
		 * The copyright year or years that should be inserted into the legal information.
		 * This may be a single year number or a comma-separated list of year numbers.
		 * The default is to omit copyright years.
		 */
		copyright: undefined,
		
		/**
		 * Additional trademark information that should be inserted into the legal information.
		 * This may include simple HTML mark-up (e.g. for special characters or emphasis). The
		 * exact text from www.ibm.com/legal/copytrade.shtml should be used for the special
		 * non-IBM trademarks that appear on the label. If there is insufficient space, consult
		 * with your Division Intellectual Property attorney.
		 */
		trademarks: undefined,
		
		/**
		 * An array of names of third-party logos to be displayed. There are no pre-defined names
		 * currently defined.
		 */
		logos: undefined,
		
		closeButton: true,
		closeButtonClass: 'mblDomButtonIdxPopupCloseIcon',
			   
		buildRendering: function(){
			// create an about pane and reparent any content into it
			this._pane = new AboutPane();
			if(this.srcNodeRef){
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this._pane.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
				}
			}
			
			this.inherited(arguments);
			
			this.containerNode.appendChild(this._pane.domNode);
			domClass.add(this.domNode, "mblIdxAboutDialog");
		},
		
		addCover: function(){
			var isnew = !this._cover[0], me = this;
			this.inherited(arguments);
			if(isnew && this._cover[0]){
				this._coverClickHandle = me.connect(me._cover[0], "ontouchend", "_onCloseButtonClick");
			}
		},
		
		refresh: function(){
			this.inherited(arguments);
			
			// ensure refresh doesn't place the top of the dialog off the screen
			var h = win.global.innerHeight || win.doc.documentElement.clientHeight,
				n = this.domNode;
			
			// prevent the top of the dialog going higher than top=30px
			if(n.offsetHeight > h - 60){
				n.style.top = "30px";
			} 
		},
		
		_setNameAttr: function(newvalue){
			this._pane.set("name", newvalue);
		},
		
		_setVersionAttr: function(newvalue){
			this._pane.set("version", newvalue);
		},
		
		_setBuildAttr: function(newvalue){
			this._pane.set("build", newvalue);
		},
		
		_setLegalAttr: function(newvalue){
			this._pane.set("legal", newvalue);
		},
		
		_setCopyrightAttr: function(newvalue){
			this._pane.set("copyright", newvalue);
		},
		
		_setTrademarksAttr: function(newvalue){
			this._pane.set("trademarks", newvalue);
		},
		
		_setLogosAttr: function(newvalue){
			this._pane.set("logos", newvalue);
		}
	});
});