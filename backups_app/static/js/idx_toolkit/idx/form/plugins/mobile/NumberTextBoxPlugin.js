define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/text!idx/form/mobileTemplates/TextBox.html"
], function(declare, domStyle, template){
	
	return declare("idx.form.plugins.mobile.NumberTextBoxPlugin", null, {
		
		templateString: template,
		
		//instantValidate: true,
		
		displayMessage: function(numberTextbox, message){
			numberTextbox.validationMessage.innerHTML = message;
		},
		setHelpAttr: function(numberTextbox,helpText){
			numberTextbox._set("help", helpText);
			if(numberTextbox.helpContainer){
				domStyle.set(numberTextbox.helpContainer, "display", helpText ? "block": "none");
				numberTextbox.helpMessage.innerHTML = helpText;
			}
		}
	});
})
