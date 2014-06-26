define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/currency",
	"dijit/form/NumberTextBox",
	"dojo/text!idx/form/mobileTemplates/CurrencyTextBox.html"
], function(declare, lang, domStyle, currency, DijitNumberTextBox, template){
	
	return declare("idx.form.plugins.mobile.CurrencyTextBoxPlugin", null, {
		
		templateString: template,
		
		//instantValidate: true,
		
		displayMessage: function(currencyTextbox, message){
			currencyTextbox.validationMessage.innerHTML = message;
		},
		setHelpAttr: function(currencyTextbox, helpText){
			currencyTextbox._set("help", helpText);
			if(currencyTextbox.helpContainer){
				domStyle.set(currencyTextbox.helpContainer, "display", helpText ? "block": "none");
				currencyTextbox.helpMessage.innerHTML = helpText;
			}
		},
		setCurrencyAttr: function(currencyTextbox, currency){
		},
		
		setConstraintsAttr: function(currencyTextbox, constraints){
			if(!constraints.currency && currencyTextbox.currency){
				constraints.currency = currencyTextbox.currency;
			}
			DijitNumberTextBox.prototype._setConstraintsAttr(constraints, [currency._mixInDefaults(lang.mixin(constraints, {exponent: false}))]);
		}
	});
})
