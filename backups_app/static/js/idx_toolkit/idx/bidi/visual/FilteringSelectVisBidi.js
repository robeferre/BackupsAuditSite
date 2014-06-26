define(["dojo/_base/declare", "dojo/has", "dijit/form/FilteringSelect", "./ComboBoxVisBidi"], function(declare, has , select ,bidiCombo){

	return declare("idx.bidi.visual.FilteringSelectVisBidi",[bidiCombo, select],{
/*	postCreate: function(){
        	this.inherited(arguments);                 
    },*/
	validate: function(isFocused){
		var tmpMarker = null;
		var fakedFocus = false;
		if(has("ie") && this.isVisualMode) {
			if (this.textbox.value.length > 0 && (this.textbox.value.charAt(0) == this.LRO || this.textbox.value.charAt(0) == this.RLO)){
				tmpMarker = this.textbox.value.charAt(0);
				this.textbox.value = this.textbox.value.substring(1);
			}
		}
		dijit.form.FilteringSelect.prototype.validate.apply(this, arguments)
		if(has("ie") && tmpMarker) {
			this.textbox.value = tmpMarker + this.textbox.value;
		}
	},
	isValid: function(isFocused){
		if (/*isFocused || */!((has("ie") && this.isVisualMode)))
			return this.inherited(arguments);   

		var options = this.store.data;    
		if (options == null)
                    options = this.store._itemsByIdentity;
                if (options == null)
                    options = this.store._jsonData; 
		if (options == null)
			return true;
                if (!this._hasBeenBlurred) {
			for (var k = 0; k < options.length; k++) {
				var text = options[k].name;
				if (this.reorderText (text,this.dir == "rtl", false ) == this.textbox.value)
					return true;
			} 
		} else {
			for (var k = 0; k < options.length; k++) {
				var text = options[k].name;
				if (text == this.textbox.value)
					return true;
			} 
		}

		return false;
	},
	_setBlurValue: function(){
		var value = null;
		this.inherited(arguments);     
		if (value)
			this.set('displayedValue', value);
			
	}
	});
}); 
