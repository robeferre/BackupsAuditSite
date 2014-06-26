/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-construct",
		"dojo/i18n",
		"dojo/string",
        "dojox/mobile/Container",
        "dojo/i18n!./nls/AboutPane" ],
        function(declare,
        		 domClass,
        		 domConstruct,
        		 i18n,
        		 string,
        		 Container){

	/**
	 * Creates a new "About" pane.
	 * @name idx.mobile.AboutPane
	 * @class The AboutPane widget is a pane presenting information about an
	 * IBM One UI application in a standard way. It extends dojox/mobile/Container
	 * to perform initialisation and configuration, and can be included into Views
	 * as required to present product information.
	 * <p>
	 * To create the pane, initialise the widget with the required
	 * properties. The appropriate HTML and CSS is created immediately, and
	 * subsidiary dijit components may be created and marshalled.
	 * </p>
	 * @augments dojox.mobile.Container
	 * @example
	 * var about = new idx.mobile.AboutPane({
	 * 		 
	 */
	return declare("idx.mobile.AboutPane", [Container],
	/** @lends idx.mobile.AboutPane.prototype */
	{
		/**
		 * The product name (required), to a maximum of 90 characters. This may
		 * include simple HTML mark-up (e.g. for special characters or emphasis).
		 * @type string
		 */
		name: "",
		_setNameAttr: { node: "_nameNode", type: "innerHTML" },
		
		/**
		 * The product version (optional) in the form "V", "V.r", "V.r.m" or "V.r.m.f".
		 * @type string
		 */
		version: "",
		
		/**
		 * The product build identifier (optional).
		 * @type string
		 */
		build: "",
		
		/**
		 * The copyright or other legal information that should be displayed. This
		 * may include simple HTML mark-up (e.g. for special characters or emphasis).
		 * It may also include string substitutions, eg ${copyright}.
		 * @type string
		 */
		legal: "Licensed Materials &mdash; Property of IBM. &copy; IBM Corp. ${copyright}. " +
			   "IBM, the IBM logo, and ibm.com are trademarks of IBM Corp., registered in many jurisdictions worldwide. " +
			   "${trademarks}" +
			   "Other product and service names might be trademarks of IBM or other companies. A current list of IBM trademarks is available on the Web at www.ibm.com/legal/copytrade.shtml. " +
			   "This Program is licensed under the terms of the license agreement for the Program. Please read this agreement carefully before using the Program. By using the Program, you agree to these terms.", 			   

		/**
		 * The copyright year or years that should be inserted into the legal information.
		 * This may be a single year number or a comma-separated list of year numbers.
		 * The default is '2012'.
		 */
		copyright: "2012",
		
		/**
		 * Additional trademark information that should be inserted into the legal information.
		 * This may include simple HTML mark-up (e.g. for special characters or emphasis). The
		 * exact text from www.ibm.com/legal/copytrade.shtml should be used for the special
		 * non-IBM trademarks that appear on the label. If there is insufficient space, consult
		 * with your Division Intellectual Property attorney.
		 */
		trademarks: "",
		
		/**
		 * An array of names of third-party logos to be displayed. There are no pre-defined names
		 * currently defined.
		 */
		logos: null,
			   
		postMixInProperties: function(){
			this._nls = i18n.getLocalization("idx.mobile", "AboutPane");
			this.inherited(arguments);
		},

		buildRendering: function(){
			// create a container node and reparent any content into it
			this.containerNode = domConstruct.create("div", { className: "mblIdxAboutContent" });
			if(this.srcNodeRef){
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
				}
			}
			
			this.inherited(arguments);
			
			// create the standard layout to appear before the supplied content
			domConstruct.create("div", { className: "mblIdxIbmLogo", title: this._nls.logoIBM }, this.domNode );
			this._nameNode = domConstruct.create("h1", { className: "mblIdxProductName" }, this.domNode );
			this._versionNode = domConstruct.create("p", { className: "mblIdxInformational" }, this.domNode );
			this._legalNode = domConstruct.create("p", { className: "mblIdxLegal" }, this.domNode );
			this._logosNode = domConstruct.create("div", { className: "mblIdxLogos" }, this.domNode );
			this.domNode.appendChild(this.containerNode);

			domClass.add(this.domNode, "mblIdxAboutPane");
		},
		
		_refreshVersion: function(){
			// refresh the rendering after an update to version or build properties
			this._versionNode.innerHTML =
				(this.version ? (this._nls.labelVersion + " " + this.version) : "") +
				(this.version && this.build ? '<br />' : '') +
				(this.build ? (this._nls.labelBuild + " " + this.build) : "");
		},
		
		_setVersionAttr: function(newvalue){
			this.version = newvalue;
			this._refreshVersion();
		},

		_setBuildAttr: function(newvalue){
			this.build = newvalue;
			this._refreshVersion();
		},
		
		_refreshLegal: function(){
			// refresh the rendering after an update to legal or copyright properties
			this._legalNode.innerHTML = string.substitute(this.legal, this);
		},
		
		_setLegalAttr: function(newvalue){
			this.legal = newvalue;
			this._refreshLegal();
		},
		
		_setCopyrightAttr: function(newvalue){
			this.copyright = newvalue;
			this._refreshLegal();
		},
		
		_setTrademarksAttr: function(newvalue){
			this.trademarks = newvalue;
			this._refreshLegal();
		},
		
		_setLogosAttr: function(logos){
			while(this._logosNode.childNodes.length > 0){
				this._logosNode.removeChild(this._logosNode.firstChild);
			}
			
			for(var i = logos.length - 1; i >= 0; i--){
				domConstruct.create("div", { className: "mblIdxLogo" + logos[i] }, this._logosNode );				
			}
			
			domConstruct.create("div", { style: "clear: both;" }, this._logosNode );				
		}
	});
});