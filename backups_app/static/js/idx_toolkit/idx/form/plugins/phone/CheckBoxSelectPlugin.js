define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/_base/array",
	"dijit/_WidgetsInTemplateMixin",
	"dojox/mobile/Overlay",
	"dojox/mobile/Heading",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/ListItem",
	"dojox/mobile/EdgeToEdgeList",
    "dojo/text!../../mobileTemplates/CheckBoxSelect.html"],
function(declare, win, domStyle, domGeometry, array, _WidgetsInTemplateMixin, Overlay, Heading, ScrollableView, ListItem, EdgeToEdgeList, templateText) {

	return declare("idx.form.plugins.CheckBoxSelectPlugin", _WidgetsInTemplateMixin, {
		baseClass: "idxMobileCheckBoxSelect",

		// define the mobile template
		templateString: templateText,
		/**
		 * 
		 */
		isBodyOverlay: true,
		/**
		 * The dropDown property should be set to null on mobile platform
		 * insteadly, use the dojox.mobile.EdgeToEdgeList
		 */
		createCheckBoxSelectMenu: function(scope) {
			var roundRectList = scope.roundRectList;
			var options = scope.options
			for (var iIndex = 0; iIndex < options.length; iIndex++){
				roundRectList.addChild(
					new ListItem({label: options[iIndex].label, value:options[iIndex].value, checked:options[iIndex].selected})
				);
			}				
			// In phone platform, the dropDown property is set to null.
			// move this node to win.body
			
			if (this.isBodyOverlay)
				scope.selectOverlay.placeAt(win.body());
			return null;
		},
		/**
		 * 
		 * @param {Object} textbox
		 * @param {Object} message
		 */
		displayMessage: function(textbox, message){
			if (message) {
				textbox.validationMessage.innerHTML = message;
			}
		},
		/**
		 * 
		 * @param {Object} textbox
		 * @param {Object} helpText
		 */
		setHelpAttr: function(textbox,helpText){
			textbox._set("help", helpText);
			if(textbox.helpContainer){
				domStyle.set(textbox.helpContainer, "display", helpText ? "block": "none");
				textbox.helpMessage.innerHTML = helpText;
			}
		},
		/**
		 * 
		 */
		onCloseButtonClick: function(scope){
			scope.selectOverlay.hide(true);
		},
		/**
		 * Calculate the Overlay height according to the document height and the content height
		 * Change the hook funciton from openDropDown to _onDropDownMouseDown
		 */
		_onDropDownMouseDown: function(scope){
			
			var baseNodeContentBox = domGeometry.getContentBox(scope.oneuiBaseNode),
				openerPad = domGeometry.getPadExtents(scope.selectOverlay.domNode);
			//
			// Set the Height of Overlay due to the content and the screen height
			//
			domStyle.set(scope.placeHolderNode , "width", baseNodeContentBox.w - openerPad.l - openerPad.r + "px");
			var maxHeight = document.documentElement.clientHeight / 2,
				scrollContentBox = domGeometry.getContentBox(scope.roundRectList.domNode),
				headerContentBox = domGeometry.getContentBox(scope.header.domNode);
				
			if ( maxHeight < headerContentBox.h + scrollContentBox.h ) {
				domStyle.set(scope.selectOverlay.domNode, "height", maxHeight + "px");
			}
			else{
				domStyle.set(scope.selectOverlay.domNode, "height", headerContentBox.h + scrollContentBox.h + "px");
			}
			scope.selectOverlay.show(scope.oneuiBaseNode, ['above-centered','below-centered','after','before']);
		},
		
		/**
		 * 
		 * @param {Object} item
		 * @param {Object} checked
		 */
		onCheckStateChanged: function(scope, item, checked){
			var newValue = [];
			array.forEach(scope.getOptions(), function(option){
				if ( option.value == item.value ){
					option.selected = checked;
				}
				if (option.selected && option.selected !== "false")
					newValue.push(option.value);
			});

			scope.set("value", newValue );
		}
	});
});
