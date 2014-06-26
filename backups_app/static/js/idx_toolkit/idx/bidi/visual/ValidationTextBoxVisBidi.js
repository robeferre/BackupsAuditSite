define(["dojo/_base/declare", "dojo/has", "dijit/form/ValidationTextBox", "./TextBoxVisBidi"], function(declare, has , validationText ,bidiText){

	return declare("idx.bidi.visual.ValidationTextBoxVisBidi",[bidiText, validationText],{
		isValid: function(/*Boolean*/ /*===== isFocused =====*/){
			var text = this.getValue();
			//if(has("ie")) 
			//	text = text.substring(1);
			if(this.isVisualMode) 
				return this.validator(this.reorderText (text,this.dir == "rtl", false ), this.constraints);
			else 
				return this.inherited(arguments);
		},	
		_isEmpty: function(value){
			//if(has("ie")) 
			//	value = value.substring(1);
			return this.inherited(arguments);
		}


	});
}); 