define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/text!idx/form/mobileTemplates/TextBox.html"
], function(declare, domStyle, template){
	
	return declare("idx.form.plugins.mobile.TextBoxPlugin", null, {
		
		templateString: template,
		
		//instantValidate: true,
		
		displayMessage: function(textbox, message){
			textbox.validationMessage.innerHTML = message;
		},
		setHelpAttr: function(textbox,helpText){
			textbox._set("help", helpText);
			if(textbox.helpContainer){
				domStyle.set(textbox.helpContainer, "display", helpText ? "block": "none");
				textbox.helpMessage.innerHTML = helpText;
			}
		}
	});
})
