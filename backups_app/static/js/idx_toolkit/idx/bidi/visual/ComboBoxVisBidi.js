/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 define(["dojo/_base/declare", "dojo/has", "dijit/form/ComboBox", "./TextBoxVisBidi"], function(declare, has , combo ,bidiText){
/**
	 * @name idx.bidi.visual.ComboBoxVisBidi
	 * @class idx.bidi.visual.ComboBoxVisBidi is implemented according requirements for IBM Visual Data Widgets <b><a href="https://w3-connections.ibm.com/communities/service/html/communityview?lang=en_US&communityUuid=dca0e714-6eee-4f05-ba6d-13d845546ac1"></a></b>.
	 * It is a composite widget which enhanced dijit.form.ComboBox and is based on idx.bidi.viaual.TextBoxVisBidi with following features:
	 * <ul>
	 * <li>Visual text layout</li>
	 * <li>AutoPush mode switch</li>
	 * <li>Start/End Push mode</li>
	 * </ul>
	 * @augments dijit.form.ComboBox
	 * @augments idx.bidi.visual.TextBoxVisBidi
	 */
	return declare("idx.bidi.visual.ComboBoxVisBidi",[bidiText, combo],{
		LRO: "\u202d",
		RLO: "\u202e",
		LRM: "\u200e",
		RLM: "\u200f",
		shouldAutoComplete: false,
        postCreate: function(){
        	if(this.isVisualMode && this.isVisualInput) {		
	            var options = this.store.data;          
	            if (options == null){
	            	options = this.store._jsonData;
	            	if (options != null){
	            		options = options.items;
	            		for (var k = 0; k < options.length; k++) {
	            			var text = options[k].fullName;
	            			text = this.insertMarksMarkers(text);
	            			text = this.bidiTransform (text, "V" + this.dirChForBidiFormat + "YNN", "I" + this.dirChForBidiFormat + "YNN");
	            			options[k].fullName = text;
	            		}
	            	}
	            	this.inherited(arguments);
	            	return;
	            }
	            for (var k = 0; k < options.length; k++) {
			var text = options[k].name;
			text = this.insertMarksMarkers(text);
			text = this.bidiTransform (text, "V" + this.dirChForBidiFormat + "YNN", "I" + this.dirChForBidiFormat + "YNN");
			options[k].name = text;
	            }
            }
            this.inherited(arguments);                 
        },

        displayMessage: function(message) {
        },
		insertMarksMarkers: function (str) {
			var marker = (this.dir == "rtl") ? this.RLM : this.LRM;
			var indx = str.search(/\d/);
			while (indx > -1) {
				str = str.substring(0,indx) + marker + str.substring (indx, str.length);
				indx++;
				while (!isNaN(str.charAt(indx)) && indx < str.length)
					indx ++;
				var subIndx = str.substring(indx).search(/\d/);
				if (subIndx > -1)
					indx = indx + subIndx;
				else
					indx = -1;
			}
			return str;
		},
		removeMarksMarkers: function (str) {
			var marker = (this.dir == "rtl") ? this.RLM : this.LRM;
			str = str.replace(marker,'');
			return str;
		},
        validate: function(isFocused){
        	return true;
        },
        
        _selectOption: function( evt){
        	this.shouldAutoComplete = true;
        	this.inherited(arguments);
        	if (this.textbox.style.direction != this.dir) {
        		this.textbox.style.direction = this.dir;
        	}
            this.processComboSelection(evt);
            this.textbox.value = this.removeMarksMarkers(this.textbox.value);
        },
    	_startSearch: function(key){
		if(!this.isVisualMode) {	
			this.inherited(arguments);			
			return;
		}
		if ((has("ie") && key.length >1) ||
		    (!has("ie") && key.length >0))	{
			this.shouldAutoComplete = false;
			var text = has("ie")? key.substring(1) : key;
			var lastCh = this.lastKeyPressed;
			var needReorder;
			var needReverse;
			if ((lastCh>='A' && lastCh <='Z') || (lastCh>='a' && lastCh <='z'))
				if (this.hasOnlyEnglishChars(text)){
					needReorder = (this.dir == "ltr") ? false : true;
					needReverse = (this.dir == "rtl") ? true : false;
				} else
					needReorder = needReverse = true;
			else
				if (this.hasOnlyBidiChars(text))
					needReorder = (this.dir == "ltr") ? false : true;
				else {
					needReorder = true;
					needReverse = (this.dir == "ltr") ? true : false;
				}
			if (needReorder)
				text = this.bidiTransform (text,"V" + this.dirChForBidiFormat + "YNN", "ILYNN");
				
			if (needReverse)
				text = this.reverseText (text);
			key = text;
		}
		this.inherited(arguments);
    	},
    	_autoCompleteText: function(/*String*/ text){
		if(!this.isVisualMode) {
			this.inherited(arguments);
			return;
		}
    		var startSelection = this.focusNode.value.length;
    		if (startSelection == 0 || this.shouldAutoComplete){
				text = this.bidiTransform (text,"V" + this.dirChForBidiFormat + "YNN", "I" + this.dirChForBidiFormat + "YNN");
    			this.inherited(arguments);
    		}
    		if (this.focusNode.style.direction != this.dir)
    			this.focusNode.style.direction = this.dir;
    		if (has("ie")){
	    		if (text.charAt(0) != this.RLO && 
	    			this.focusNode.style.direction == "rtl") 
	    			this.focusNode.value = this.RLO + text;
	    		else if (text.charAt(0) != this.LRO && 
	    			this.focusNode.style.direction == "ltr") 
	    			this.focusNode.value = this.LRO + text;
    		}
    	},
    	_announceOption: function(/*Node*/ node){
    		if (this.shouldAutoComplete){
    			this.inherited(arguments);
    		}
    	},
        processComboSelection: function(evt) {
        	if(this.isVisualMode && has("ie")) { 
            	this._onFocus(evt);        		
				var selection = this.getCaretPos(evt,this.focusNode);
				if (selection) {
				    selectionStart = Math.min(selection[0],selection[1]);
				    curPos = Math.max(selection[0],selection[1]);
				}
				this.setCaretPositions(selectionStart, curPos);
        	} 
        },
        _onKey: function(/*Event*/ evt){
        	var key = evt.charOrCode;
        	if(this._opened){
	        	switch(key){
					case dojo.keys.PAGE_DOWN:
					case dojo.keys.DOWN_ARROW:
					case dojo.keys.PAGE_UP:
					case dojo.keys.UP_ARROW:
					case dojo.keys.ENTER:
						this.shouldAutoComplete = true;

						break;
	        	}
        	}
        	this.inherited(arguments);
        },
        onClick__: function(/*DomNode*/ node){
        	this.shouldAutoComplete = true;
        	this.inherited(arguments);
        }
	});
});	
	
