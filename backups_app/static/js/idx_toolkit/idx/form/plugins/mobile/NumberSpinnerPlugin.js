define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style",
	"dojo/on",
	"dojo/text!idx/form/mobileTemplates/Spinner.html",
	"dijit/typematic"
], function(declare, lang, array, domStyle, on, template, typematic){
	
	lang.mixin(typematic, {
		addListener: function(/*Node*/ mouseNode, /*Node*/ keyNode, /*Object*/ keyObject, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay, /*Number?*/ minDelay){
			var handles = [
				this.addTouchListener(mouseNode, _this, callback, subsequentDelay, 100, minDelay),
				this.addKeyListener(keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay),
				this.addMouseListener(mouseNode, _this, callback, subsequentDelay, initialDelay, minDelay)
			];
			return { remove: function(){
				array.forEach(handles, function(h){
					h.remove();
				});
			} };
		},
		addTouchListener: function(/*DOMNode*/ node, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay, /*Number?*/ minDelay){
			var handles = [
				on(node, "touchstart", lang.hitch(this, function(evt){
					evt.preventDefault();
					typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
				})),
				on(node, "touchend", lang.hitch(this, function(evt){
					if(this._obj){
						evt.preventDefault();
					}
					typematic.stop();
				}))
			];
			return { remove: function(){
				array.forEach(handles, function(h){
					h.remove();
				});
			} };
		}
	});
	return declare("idx.form.plugins.mobile.NumberSpinnerPlugin", null, {
		
		templateString: template,
		
		//instantValidate: true,
		
		displayMessage: function(spinner, message){
			spinner.validationMessage.innerHTML = message;
		},
		setHelpAttr: function(spinner, helpText){
			spinner._set("help", helpText);
			if(spinner.helpContainer){
				domStyle.set(spinner.helpContainer, "display", helpText ? "block": "none");
				spinner.helpMessage.innerHTML = helpText;
			}
		},
		isFocusable: function(){
			return false;
		},
		arrowPressed: function(spinner, nodePressed, direction, increment){
			if(spinner.disabled || spinner.readOnly){
				return;
			}
			spinner._setValueAttr(spinner.adjust(spinner.get('value'), direction * increment), false);
		}
	})
});
