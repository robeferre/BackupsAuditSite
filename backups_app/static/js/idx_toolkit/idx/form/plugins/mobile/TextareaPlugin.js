define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/text!idx/form/mobileTemplates/Textarea.html"
], function(declare, domStyle, template){
	
	return declare("idx.form.plugins.mobile.TextareaPlugin", null, {
		
		templateString: template,
		
		displayMessage: function(textarea, message){
			if(message){
				textarea.validationMessage.innerHTML = message;
			}
		},
		setHelpAttr: function(textarea, helpText){
			textarea._set("help", helpText);
			if(textarea.helpContainer){
				domStyle.set(textarea.helpContainer, "display", helpText ? "block": "none");
				textarea.helpMessage.innerHTML = helpText;
			}
		},
		onExpanded: function(textarea, newHeight){
			var top = domStyle.get(textarea.textbox, "height") - 1 + "px";
			domStyle.set(textarea.validationContainer, "top", top);
			domStyle.set(textarea.helpContainer, "top", top);
		}
	});
})
