define([
	"dojo/_base/declare",
	"dojo/_base/lang", 
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/on",
	"dojo/keys",
	"dijit/TooltipDialog",
	"idx/util",
	"idx/string",
	"dojo/i18n!./nls/Dialog"
], function(dDeclare, dLang, dWindow, dDomConstruct, dDomAttr, dDomStyle, dDomClass, dOn, dKeys, dTooltipDialog, iUtil, iString, iDialogResources){

	/**
	 * 
	 */
	return dDeclare("idx.widget.TooltipDialog", [dTooltipDialog], {
		/**
		 * The IDX base class.
		 */
		idxBaseClass: "idxTooltipDialog",
		
		/**
		 * The label for the close button. 
		 */
		closeButtonLabel: "",
		
		/**
		 * 
		 */
		_setCloseButtonLabelAttr: function(label) {
			var oldLabel = iString.nullTrim(this.closeButtonLabel);
			this.closeButtonLabel = label;
			var newLabel = iString.nullTrim(label);
			if (newLabel == oldLabel) {
				return;
			}
			if (! newLabel) {
				newLabel = iDialogResources.closeButtonLabel;
			}
			if (this.closeButtonNode) dDomAttr.set(this.closeButtonNode, "aria-label", newLabel);
		},
		
		/**
		 * Set the template text to the IDX template.
		 */
		buildRendering: function() {
			this.inherited(arguments);
			var closeLabel = iString.nullTrim(this.closeButtonLabel);
			if (! closeLabel) { 
				closeLabel = iDialogResources.closeButtonLabel;
			}
			if (! closeLabel) closeLabel = "";
			var shell = dDomConstruct.create("div", null, this.domNode, "first");
			var attrs = { "class": this.idxBaseClass + "CloseIcon",
						  "role": "button",
						  "tabIndex": "0",
						  "aria-label": closeLabel };
						  
			this.closeButtonNode = dDomConstruct.create("span", attrs, shell);
			this.closeTextNode = dDomConstruct.create("span", {"class": this.idxBaseClass + "CloseText"}, this.closeButtonNode);
			this.closeTextNode.innerHTML = "x";
			
			dDomClass.add(this.connectorNode, "idxConnector");
			this.connectorNode.innerHTML = "<span role='presentation' class='idxConnectorBelow'>▲</span>"
										 + "<span role='presentation' class='idxConnectorAbove'>▼</span>"
										 + "<span role='presentation' class='idxConnectorLeft'>▶</span>"
										 + "<span role='presentation' class='idxConnectorRight'>◀</span>";
			
			dOn(this.closeButtonNode, "click", dLang.hitch(this,this._handleCloseClick));
			dOn(this.closeButtonNode, "key", dLang.hitch(this,this._handleCloseKey));
		},
		
		/**
		 * Handles closing the tooltip dialog when the close button is pressed.
		 */
		_handleCloseClick: function() {
			this.defer("onCancel");
		},
		
		/**
		 * Handles closing the tooltip dialog when the close button is pressed.
		 */
		_handleCloseKey: function(evt) {
			if((evt.charOrCode == keys.SPACE) || (evt.charOrCode == keys.ENTER)) {
				this.defer("onCancel");
				return;
			}
			this.inherited(arguments);
		}		
	});
});
