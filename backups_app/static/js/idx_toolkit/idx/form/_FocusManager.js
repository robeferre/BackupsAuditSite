define([
	"dijit/focus",
	"dojo/_base/window",
	"dojo/window",
	"dojo/dom", // dom.isDescendant
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.extend	
	"dijit/registry"
], function(focus, win, winUtils, dom, domAttr, domClass, declare, lang, registry){
	focus._onTouchNode = function(/*DomNode*/ node, /*String*/ by){
		var srcNode = node;
		if(this._clearActiveWidgetsTimer){
			clearTimeout(this._clearActiveWidgetsTimer);
			delete this._clearActiveWidgetsTimer;
		}
		
		// if the click occurred on the scrollbar of a dropdown, treat it as a click on the dropdown,
		// even though the scrollbar is technically on the popup wrapper (see dojo ticket #10631)
		if(domClass.contains(node, "dijitPopup")){
			node = node.firstChild;
		}
		
		var newStack=[];
		try{
			while(node){
				var popupParent = domAttr.get(node, "dijitPopupParent");
				if(typeof node.dijitPopupParent == "object"){
					node = node.dijitPopupParent;
				}else if(popupParent){
					node = registry.byId(popupParent) ? 
						registry.byId(popupParent).domNode :
						dom.byId(popupParent);
				}else if(node.tagName && node.tagName.toLowerCase() == "body"){
					if(node === win.body()){
						break;
					}
					node=winUtils.get(node.ownerDocument).frameElement;
				}else{
					var id = node.getAttribute && node.getAttribute("widgetId"),
						widget = id && registry.byId(id);
					if(widget && !(by == "mouse" && widget.get("disabled"))){
						if(!widget._isValidFocusNode || widget._isValidFocusNode(srcNode)){
							newStack.unshift(id);
						}
					}
					node=node.parentNode;
				}
			}
		}catch(e){}
		this._setStack(newStack, by);
	}
	return focus;
});
