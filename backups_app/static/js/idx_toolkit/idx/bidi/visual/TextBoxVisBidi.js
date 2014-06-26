/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
define(["dojo/_base/declare", "dojo/has", "dijit/form/TextBox", "dijit/form/_TextBoxMixin","dojox/string/BidiEngine"], function(declare, has, textBox, _TextBoxMixin, BidiEngine){
	var LRO = String.fromCharCode(8237);
	var RLO = String.fromCharCode(8238);

	var TYPINGORIENT = "  Typing Orientation: ";
	var AUTOPUSH = "  Autopush: ";
	var statusBLOCKED = "";
	var Autopush_field = null;	
	var autoPush = null;
	var CONVERT_TO_HEBREW_LAYER1 = [1513,1504,1489,1490,1511,1499,1506,1497,1503,1495,1500,1498,1510,1502,1501,1508,47,1512,1491,1488,1493,1492,39,1505,1496,1494,1507]; /*65*/
	var CONVERT_TO_HEBREW_LAYER1_H = [1507,61,1514,45,1509,46,59]; /*186*/
	var CONVERT_TO_HEBREW_LAYER1_SHIFT_H = [58,43,62,95,60,63,126]; /*186*/
	var CONVERT_TO_HEBREW_LAYER2_H = [93,null,91,44]; /*219*/
	var CONVERT_TO_HEBREW_LAYER2_SHIFT_H = [125,null,123,34]; /*219*/
	var CONVERT_TO_LOWER_CASE1 = [59,61,44,45,46,47,96]; /*186*/
	var CONVERT_TO_LOWER_CASE1_SHIFT = [58,43,60,95,62,63,126]; /*186*/
	var CONVERT_TO_LOWER_CASE2 = [91,null,93,39]; /*219*/
	var CONVERT_TO_LOWER_CASE2_SHIFT = [123,null,125,34]; /*219*/
	var CONVERT_TO_ARABIC_LAYER1 = [1588,1575,1572,1610,1579,1576,1604,1575,1607,1578,1606,1605,1577,1609,1582,1581,1590,1602,1587,1601,1593,1585,1589,1569,1594,1574]; /*65*/
	var CONVERT_TO_ARABIC_LAYER1_SHIFT = [1616,1570,125,93,1615,91,1571,1571,247,1600,1548,47,8217,1570,215,1563,1614,1612,1613,1573,8216,123,1611,1618,1573,126]; /*65*/
	var CONVERT_TO_ARABIC_LAYER2 = [1603,61,1608,45,1586,1592,1584]; /*186*/
	var CONVERT_TO_ARABIC_LAYER2_SHIFT = [58,43,44,95,46,1567,1617]; /*186*/
	var CONVERT_TO_ARABIC_LAYER3 = [1580,92,1583,1591]; /*219*/
	var CONVERT_TO_ARABIC_LAYER3_SHIFT = [60,124,62,34]; /*219*/

	var CODE_A = 65;  
	var CODE_Z = 90;

	var isFldreversed = false; 
	var curPos = 0;
	var selectionStart = 0;;
	var pushMode = false;
	var mousePressed = false;
	var rightPushBound = 0; 
	var leftPushBound = 0;
	var layerGuess = false;
	var preventAltNumpad = false;
	var preventKeyPressProcessing = false;             
	var ctrlHasBeenPressed = false;
	var prevCharClass = false;
	

	var destroyNextKeyEvent = false;
	var isLinux = (navigator.platform.indexOf("Linux") != -1) ? true : false;
	var isOverwriteMozilla = false;
	var bidiEngine = new BidiEngine(); 
	/**
	 * @name idx.bidi.visual.TextBoxVisBidi
	 * @class idx.bidi.visual.TextBoxVisBidi is implemented according requirements for IBM Visual Data Widgets <b><a href="https://w3-connections.ibm.com/communities/service/html/communityview?lang=en_US&communityUuid=dca0e714-6eee-4f05-ba6d-13d845546ac1"></a></b>.
	 * It is a composite widget which enhanced dijit.form.TextBox with following features:
	 * <ul>
	 * <li>Visual text layout</li>
	 * <li>AutoPush mode switch</li>
	 * <li>Start/End Push mode</li>
	 * </ul>
	 * @augments dijit.form.TextBox
	 */
	return declare("idx.bidi.visual.TextBoxVisBidi", [textBox], {
        isVisualMode: false,
        isVisualInput: false,
        dir: 'ltr',
        autoPush: true, 
        autoKeyboardLayerSwitch: false,
        isArabic: false,
        gKeyCode: 0,
        layerSwitched: false,
        lastKeyPressed: 0,
	dirChForBidiFormat: (this.dir == "rtl") ? "R" : "L",

        postCreate: function(){
            if(this.isVisualMode && !this.isVisualInput) {
		var str = this.textbox.value;
		str = this.bidiTransform (str, "ILYNN", "VLYNN");
		this.textbox.value = str;
            }
            this.textbox.setAttribute("value", this.textbox.value);
            if(this.isVisualMode) {
                this.connect(this.textbox, "onkeyup", this._onKeyUpBidi); 
                this.connect(this.textbox, "onkeydown", this._onKeyDownBidi);
                this.connect(this.textbox, "onkeypress", this._onKeyPressBidi);
                this.connect(this.textbox, "onmouseup", this._onMouseUp);
                this.connect(this.textbox, "onmousedown", this._onMouseDown);

                if (this.focusNode.maxLength == -1)
                    this.focusNode.maxLength = 100000;

                if(has("ie")) {
                    if (this.dir == "rtl")
                    	this.focusNode.value = RLO + this.focusNode.value;
                    else
                    	this.focusNode.value = LRO + this.focusNode.value;
                    	
                    this.connect(this.textbox, "onselect", this._onSelect);
                    this.connect(this.textbox, "onmouseout", this._onMouseOut);
                    this.connect(this.textbox, "oncopy", this._onCopy);
                    this.connect(this.textbox, "oncut", this._onCut);
                    this.connect(this.textbox, "onpaste", this._onPaste);
                    this.connect(this.textbox, "oncontextmenu", this._onContextMenu);                    
                }
                else {
/*                  commented this section bcs there was problem in RTL Visual ComboBox on Mozilla. 
					Content  of text field differed from string that appeared in combo list
					if (this.dir == "rtl")
                    	this.focusNode.value = this.reverseText(this.focusNode.value);*/
                }
                this.focusNode.style.unicodeBidi = "bidi-override";                
                this.focusNode.style.direction = this.dir;
                this.focusNode.style.textAlign = (this.dir == "rtl") ? "right" : "left";                
            }

            this.Autopush_field = document.getElementsByName("AUTOPUSH")[0];							
			if (this.Autopush_field)
	            this.autoPush = ((this.Autopush_field.value).indexOf("autopush=on") >= 0) ? true : false;		

            this.inherited(arguments);
        },

        _onContextMenu: function (event) {
        	if(this.isVisualMode) {
	            var obj = this.focusNode;
	            var selection = this.getCaretPos(event,obj);
	            if (selection) {
	                selectionStart = Math.min(selection[0],selection[1]);
	                curPos = Math.max(selection[0],selection[1]);
	            }            
        	}
        },
        
        _onKeyUpBidi: function(event) {
            if(!this.isVisualMode) return;
        	
            var ieKey = event.keyCode;
            var obj = this.focusNode; 
            fieldDirection = (obj.style.direction == "ltr") ? false : true; 
            preventAltNumpad = false;
            preventKeyPressProcessing = false;
            if(has("ie") && selectionStart == 0)
                this.preventEraseMarker();
            
            if (((ieKey == dojo.keys.LEFT_ARROW) && (fieldDirection == false))||((ieKey == dojo.keys.RIGHT_ARROW) & (fieldDirection == true))) {
                if(pushMode & (curPos < rightPushBound))
                    this.toggleFieldOrient(obj,true,false);  
            }
            else if (((ieKey == dojo.keys.RIGHT_ARROW) && (fieldDirection == false))||((ieKey == dojo.keys.LEFT_ARROW) & (fieldDirection == true))) {  
                if(pushMode & (curPos > leftPushBound))
                    this.toggleFieldOrient(obj,true,false);
            }
            else if(has("ie") && (event.ctrlKey || ctrlHasBeenPressed) && (ieKey == CODE_Z)) {
            	this._onContextMenu(event);
            	ctrlHasBeenPressed = false;
            }          
        },

        setCaretPositions: function(_selectionStart, _curPos) {
        	selectionStart = _selectionStart;
        	curPos = _curPos;
        },
        
        _onKeyDownBidi: function(event) {
            if(!this.isVisualMode) return;
            
            var ieKey = this.gKeyCode = event.keyCode;
            var obj = this.focusNode;
            if(!has("ie")) {
            	curPos = obj.selectionEnd;
            	selectionStart = obj.selectionStart;
            } else {      		
				var selection = this.getCaretPos(event,obj);
				if (selection) {
				    selectionStart = Math.min(selection[0],selection[1]);
				    curPos = Math.max(selection[0],selection[1]);
					this.setCaretPositions(selectionStart, curPos);				    
				}
            }
            
            fieldDirection = (obj.style.direction == "ltr") ? false : true;
        
            if(event.shiftKey)
                this.processPush(obj,ieKey);
        
            if(!isLinux && event.shiftKey && event.altKey) {           	
                layerGuess = !layerGuess;
                this.showStatusBar(obj);
                if(this.autoKeyboardLayerSwitch)
                    this.layerSwitched = !this.layerSwitched;
            }
            
            if((event.altKey && !isLinux) || (event.shiftKey && isLinux)){  
                if(((ieKey == 111) && !isLinux) || ((ieKey == 102) && isLinux)) {
                    this.autoPush = !this.autoPush;
        	    this.Autopush_field.value = "autoreverse=off" + ((this.autoPush) ? "autopush=on" : "autopush=off");
                    if(pushMode)  
                        this.toggleFieldOrient(obj,true,false);
                
                    this.showStatusBar(obj);         
        
                    preventAltNumpad = true;            
                }
                else if(((ieKey == 144) && !isLinux) || ((ieKey == 100) && isLinux)) {                         
                    this.processFieldReverse(obj,true);                                  
                    preventAltNumpad = true;
                }   
            }
            else if(has("ie")) {     
                if(event.ctrlKey && (ieKey == CODE_A)) {
                    this._onDblClick(event);  
                }   
                else if(ieKey == dojo.keys.ENTER){       
                    if(pushMode || isFldreversed)
                        this.toggleFieldOrient(obj,false,false);         
                }
                else if (event.ctrlKey && (ieKey == CODE_Z))
                	ctrlHasBeenPressed = true;                	
            }
            
            if (ieKey == dojo.keys.HOME) {
                this.processHome(obj);
                preventKeyPressProcessing = true;                 
            }
            else if (ieKey == dojo.keys.END) {
                this.processEnd(obj);
                preventKeyPressProcessing = true;                 
            }                
            else if (ieKey == dojo.keys.BACKSPACE) {
                this.processBackspace(obj,event);
                preventKeyPressProcessing = true;                 
            }                
            else if (ieKey == dojo.keys.DELETE) {   
                this.processDelete(obj);
                preventKeyPressProcessing = true;                 
            }                
            else if (((ieKey == dojo.keys.LEFT_ARROW) && (fieldDirection == 0))||((ieKey == dojo.keys.RIGHT_ARROW) && (fieldDirection == 1))) {
                this.processLeftarrow(event);
                preventKeyPressProcessing = true;                 
            }                
            else if (((ieKey == dojo.keys.RIGHT_ARROW) && (fieldDirection == 0))||((ieKey == dojo.keys.LEFT_ARROW) && (fieldDirection == 1))) {
                this.processRightarrow(event);
                preventKeyPressProcessing = true;                 
            }                
            else if (ieKey == dojo.keys.PAGE_UP || ieKey == dojo.keys.PAGE_DOWN || ieKey == dojo.keys.UP_ARROW || ieKey == dojo.keys.DOWN_ARROW)
                this.preventDefault(event);            	
        },

        _onKeyPressBidi: function(event) {           	
		   this.lastKeyPressed = event.keyChar;
       	   if(!this.isVisualMode) return;
       	   if (this.pushJustTurnedOff){
       		   this.pushJustTurnedOff = false;
       		   if (event.keyChar == "/")
       			   event.preventDefault();
       			   return;
       	   }
            if(destroyNextKeyEvent || preventAltNumpad || (event.returnValue == false)) {
                this.preventDefault(event);              
                preventAltNumpad = false;        
                destroyNextKeyEvent = false;
                return;
            }
            else if (preventKeyPressProcessing) {
            	preventKeyPressProcessing = false;
            	return;
            }
            
            var replacedKey = null;
            var obj = this.focusNode; 
            charClass = fieldDirection = (obj.style.direction == "rtl");
            
            if(has("ie")) {
            	if (event.keyCode != event.charCode) return;
            	if (obj.value.length == 0) {
            		obj.value = obj.style.direction == "ltr" ? LRO : RLO; 
            		curPos = 1;
            	}
            	
                ieKey = this.changeKey(event.keyCode,fieldDirection,event,obj);       
                if(this.isArabic && layerGuess && (ieKey > 47) && (ieKey < 58))
                    ieKey = event.keyCode = ieKey + 1584;
            }
            else {
                ieKey = event.charCode;                    
                if(event.keyCode == dojo.keys.ENTER){                               
                    if(pushMode || isFldreversed)
                        this.toggleFieldOrient(obj,false,false);         
                }
                else if(event.keyCode == dojo.keys.INSERT) {
                    isOverwriteMozilla = !isOverwriteMozilla;
                }
                else if((ieKey > 31) && !event.altKey && !event.ctrlKey){ //regular character       
                    charCode = ieKey;                           
                    ieKey = this.changeKey(ieKey,fieldDirection,event,obj);            
                    
                    if(charCode != ieKey){
                        replacedKey = ieKey;
                    }
        
                    if(this.isArabic && layerGuess && (ieKey > 47) && (ieKey < 58)){
                        replacedKey = ieKey + 1584;
                    }
                }
            }
                        
            if(((ieKey > 64) && (ieKey < 91)) || ((ieKey > 96) && (ieKey < 123)))
                layerGuess = charClass = false;  //English
            else if((ieKey > 1487) && !((ieKey > 1631) && (ieKey < 1642)))
                layerGuess = charClass = true;
            else if(ieKey == 32) 
                charClass = layerGuess;
            else if(fieldDirection && (((ieKey > 47) && (ieKey < 58)) || ((ieKey > 1631) && (ieKey < 1642))))
                charClass = false; //Numerals
                   
            if(prevCharClass != charClass && ieKey != 0) {  
                prevCharClass = charClass;
                this.showStatusBar(obj);
            }
      
            if(this.autoPush) {
                fieldDirection = (obj.style.direction == "rtl");        
                if(fieldDirection != charClass){ //enter/leave push mode
                    curPos = (has("ie")) ? curPos : obj.selectionEnd;
                    var jumpFromPushSegment = pushMode && ((curPos == leftPushBound)||(curPos == obj.value.length));
                    this.toggleFieldOrient(obj,true,jumpFromPushSegment);
                    
                    if(this.autoKeyboardLayerSwitch && (((ieKey > 47) && (ieKey < 58)) || ((ieKey > 1631) && (ieKey < 1642)))) 
                        this.layerSwitched = true;           
                }
            }   
          
            if((ieKey > 31) && !event.altKey && !event.ctrlKey){
                var selectionLength = (has("ie")) ? Math.abs(selectionStart - curPos) : obj.selectionEnd - obj.selectionStart;
                if(!has("ie")) {  
                    curPos = obj.selectionEnd;
                    selectionStart = obj.selectionStart;
                }
 
                if(!this.isOverWriteMode() || (selectionLength > 0)) {
                    var text = obj.value;
                    if(text.length - selectionLength >= obj.maxLength){  
                        var trimmedValue = (pushMode^isFldreversed) ? text.charAt(0) : text.charAt(text.length-1);          
                        if(trimmedValue == ' ') {
                            if(pushMode^isFldreversed){         
                                obj.value = text.substring(1);
                                if (curPos > 0) {
                                    selectionStart--; curPos--; leftPushBound--; rightPushBound--;
                                }
                            }                       
                            else
                                obj.value = text.substring(0,text.length-1);                        
                            
                            if(has("ie"))
                                this.setSelectedRange(obj,selectionStart,selectionStart);
                            else
                                replacedKey = ieKey;                                                                                                        
                        }
                        else {                      
                            this.preventDefault(event);
        
                            statusBLOCKED = "X";
                            this.showStatusBar(obj);                 
                            return;
                        }               
                    }
                }
                else {
                    if (curPos >= obj.maxLength){
                        this.preventDefault(event);
                            
                        statusBLOCKED = "X";
                        this.showStatusBar(obj);                 
                        return;
                    }       
                }
                    
                if(pushMode){
                    if(!this.isOverWriteMode() || (leftPushBound == curPos) || (selectionLength > 0))    
                        leftPushBound += 1 - selectionLength;
                }
                            
                if(has("ie")) {
                    selectionStart = curPos = Math.min(selectionStart,curPos) + 1;
                }       
                else {  
                    replacedKey = (replacedKey != null) ? replacedKey : ieKey;        
                    if(isLinux && fieldDirection && this.isArabic && (ieKey > 1487)){
                        event.preventDefault();     
                        if(this.isOverWriteMode() && (selectionStart == curPos))                     
                            text = obj.value.substring(0,selectionStart) + String.fromCharCode(replacedKey) + obj.value.substring(curPos+1);
                        else
                            text = obj.value.substring(0,selectionStart) + String.fromCharCode(replacedKey) + obj.value.substring(curPos);
        
                        obj.value = ara_type(selectionStart,text,fieldDirection);                       
                        obj.setSelectionRange(selectionStart+1,selectionStart+1);
                    }
                    else if((replacedKey != null) || this.isOverWriteMode()) {
                        event.preventDefault();
                        this.replaceFieldText(obj,replacedKey);
                    }
                }
            } 
        },

        _onMouseOut: function(event) {
        	if(!this.isVisualMode) return;

            if(has("ie")) {  
                if(mousePressed && (event.x < 0)){
                    var obj = this.focusNode;
                    curPos = 1;                        
                    if(obj.style.direction == "rtl")
                        curPos = obj.value.length - curPos;                                   
                }
            }

            var hint = document.getElementById("hint"); 
            if(hint != null){
                if(hint.length > 0)
                    hint[0].style.visibility = "hidden";
                else
                    hint.style.visibility = "hidden";
            }
        },

        _onMouseUp: function(event) {
        	if(!this.isVisualMode) return;
        	
            var obj = this.focusNode;              
            var hint = document.getElementById("hint");
            if(hint != null){
                if(hint.length > 0)
                    hint[0].style.visibility = "hidden";
                else
                    hint.style.visibility = "hidden";
            }
            mousePressed = false;

            var selection = this.getCaretPos(event,obj);
            if (selection && (!has("ie") || event.button != 2)){
                selectionStart = Math.min(selection[0],selection[1]);
                curPos = Math.max(selection[0],selection[1]);
                if(has("ie") && selectionStart == 0)
                    this.preventEraseMarker();
            }
           
            if(pushMode && ((curPos > leftPushBound)||(selectionStart < rightPushBound)))  
                this.toggleFieldOrient(obj,true,false);       
        },

       _onMouseDown: function(event) {
        	if(!this.isVisualMode) return;
        	
            if(event.button == 2) {
                var hint = document.getElementById("hint");
                if(hint != null){
                    var hintElement = (hint.length > 0) ? hint[0] : hint;
                
                    hintElement.style.left=(event.clientX - hint.scrollWidth > 0) ? (event.clientX - hint.scrollWidth) : 0;
                    hintElement.style.top=event.clientY;
                    hintElement.style.visibility = "visible";
                }       
            }
            
            if(has("ie")) {
                mousePressed = true;
            }
        },
		
        bidiTransform: function (text, formatIN, formatOUT){
            return bidiEngine.bidiTransform (text, formatIN, formatOUT);
        },

        _onCopy: function(event) {
            if(!this.isVisualMode) return;
            document.body.oncopy = null;
            range = document.selection.createRange();
            text = range.text;
       
            if((text.charAt(0) == LRO) || (text.charAt(0) == RLO))
                text = text.substring(1);

            try{        
				var textToClipboard = this.bidiTransform (text,"V" + this.dirChForBidiFormat + "YNN", "ILYNN");
                window.clipboardData.setData("Text", textToClipboard);
                event.returnValue = false;             
            }catch(e){}
        },

        _onCut: function(event) {
        	if(!this.isVisualMode) return;
        	
            //var obj = this.focusNode; 
            if(pushMode)
                leftPushBound -= Math.abs(selectionStart - curPos);     
           
            this._onCopy(event);
          
            curPos = Math.min(selectionStart,curPos);
            selectionStart = curPos;
            event.returnValue = false;
            range = document.selection.clear();       
        },

        _onPaste: function(event) {
            if(!this.isVisualMode) return;
        	
            if(selectionStart == 0)
                this.preventEraseMarker();
            
            var obj = this.focusNode;
            event.returnValue = false;
            var range = document.selection.createRange();
            var clipboardText = "";
            try{
                var data = "";
                if(window.clipboardData)
                    data = window.clipboardData.getData("Text");

                if(data)
                    clipboardText = data;
            }catch(e){}

            var clipboardTextLen = clipboardText.length;
            selectionStart = Math.min(selectionStart, curPos);
            clipboardTextLen = Math.min(clipboardTextLen,obj.maxLength - selectionStart);     
            delta = clipboardTextLen - (range.text).length;
                
            if(delta > 0) {                 
                if(obj.value.length < selectionStart + clipboardTextLen)
                    delta = obj.value.length - (selectionStart + (range.text).length);
            
                range.moveEnd("character",delta);
            }               

            var textFromClipboard = clipboardText.substring(0,clipboardTextLen);
            if(range.parentElement() != obj){
				obj.value = this.bidiTransform (textFromClipboard, "ILYNN", "V" + this.dirChForBidiFormat + "YNN");
            }
            else {                    
                range.text = this.bidiTransform (textFromClipboard, "ILYNN", "V" + this.dirChForBidiFormat + "YNN");
            }
        
            selectionStart = curPos = selectionStart + clipboardTextLen;
    
            if(pushMode)   
                this.toggleFieldOrient(obj,true,false);
        },

        _onDblClick: function(event) {
        	if(this.isVisualMode) {
	            var obj = this.focusNode;    
	            selectionStart = (has("ie")) ? 1 : 0;
	            curPos = obj.value.length;
	            if(pushMode) { 
	                this.toggleFieldOrient(obj,false,false);
	                pushMode = false;
	            }
	
	            this.setSelectedRange(obj,selectionStart,curPos);
        	}
        },

        _onBlur: function(event){        	
        	if(this.isVisualMode) {
	            var obj = this.focusNode;
	
	            if(!isLinux || !preventAltNumpad) {
	                if(pushMode){
	                    this.toggleFieldOrient(obj,false,false);
	                    pushMode = false;
	                }
	            
	                if(isFldreversed) 
	                    this.processFieldReverse(obj,false);
	            }
        	}    
            this.inherited(arguments);
        },

        _onFocus: function(event) {			      	
        	if(this.isVisualMode) {
        		this.Autopush_field = document.getElementsByName("AUTOPUSH")[0];							
				if (this.Autopush_field)
					this.autoPush = ((this.Autopush_field.value).indexOf("autopush=on") >= 0) ? true : false;	
                if(pushMode)																				  
                    this.toggleFieldOrient(obj,true,false);													

	            isFldreversed = false;
	            var obj = this.focusNode;  
	            var text = obj.value;
	            if(has("ie")) {	            	
	                var selection = this.getCaretPos(event,obj);
	                if (selection){
	                    selectionStart = Math.min(selection[0],selection[1]);
	                    curPos = Math.max(selection[0],selection[1]);	                    
	                    if(selectionStart == 0) 
	                        this.preventEraseMarker();          
	                }
	            }
	     
	            if(this.autoKeyboardLayerSwitch) {
	                this.layerSwitched = false;        
	                layerGuess = (obj.style.direction == "rtl") ^ this.layerSwitched;
	            }
	        
	            if(text.length == 0)
	                obj.style.textAlign = (obj.style.direction == "rtl") ? "right" : "left";
	        
	            if(!has("ie") && isLinux && (curPos > 0))
	                obj.setSelectionRange(obj.selectionStart,obj.selectionEnd);
	       
	            this.showStatusBar(obj);
        	}
            this.inherited(arguments);
        },

        _onSelect: function(event) {
        	if(this.isVisualMode) {
	            var obj = this.focusNode;
	            if(obj.value.length < 2) {
	                selectionStart = curPos = 0; //rely on keyup to secure mark
	                return;
	            }
	            
	            if(document.selection.createRange().text.length == obj.value.length) {
	                this._onDblClick(event);
	                event.returnValue = false;
	            }
        	}
        },

        setSelectedRange: function(obj, selectionStartMod, curPosMod){
            if(has("ie")) { 
                var range = obj.createTextRange();
                if (range){    
                    range.collapse();
                    range.moveEnd('character', curPosMod);
                    range.moveStart('character', selectionStartMod);
                    range.select();
                }
            } else {
                obj.setSelectionRange(selectionStartMod,curPosMod);
            }
        },

        getCaretPos: function(event,obj) {
            if(!has("ie")) {
                return new Array(event.target.selectionStart, event.target.selectionEnd);
            }
            else {
                try{
                    var range = document.selection.createRange().duplicate();
                    var range2 = range.duplicate();
                    var rangeLength = range.text.length;
                    range2.expand('textedit');
            
                    while (range.compareEndPoints('StartToStart', range2) > 0) {
                        range.moveStart('character', -1);
                    }          
                    var position = range.text.length;

                } catch(e){return new Array(0,0);}
                return new Array(position - rangeLength, position);
            }
        },

        isOverWriteMode: function() {
            if (has("ie"))
                return document.queryCommandValue("OverWrite");
            else
                return isOverwriteMozilla;
        },

        preventEraseMarker: function() {
           var rng = this.focusNode.createTextRange();
            rng.moveStart('character', 1);
            selectionStart = 1;
            if(curPos == 0)
                curPos = selectionStart;

            rng.select();
        },

        swapBrackets: function(event,fieldDirection,swapped) {
            swapChar = this.gKeyCode;
            if(isLinux) {
                if(fieldDirection ^ (layerGuess && !this.isArabic) ) {           
                    if(swapped == 40)
                        swapped =  41;
                    else if(swapped == 41)      
                        swapped = 40;
                    else if(swapped == 60)
                        swapped = 62;
                    else if(swapped == 62)
                        swapped = 60;
                    else if(swapped == 91)
                        swapped = 93;
                    else if(swapped == 93)
                        swapped = 91;
                    else if(swapped == 123)
                        swapped = 125;
                    else if(swapped == 125)
                        swapped = 123;                                      
                }
                
                return swapped;
            }
            else if(fieldDirection) {
                if(swapChar == 219){
                    if (!this.isArabic)
                        swapped = (event.shiftKey) ? 125 : 93;
                }
                else if(swapChar == 221){
                    if (!this.isArabic)
                        swapped = (event.shiftKey) ? 123 : 91;
                }
                else if(event.shiftKey && (swapChar == 48))
                    swapped = 40;
                else if(event.shiftKey && (swapChar == 57))
                    swapped = 41;
                else if(!this.isArabic && event.shiftKey && (swapChar == 188))
                    swapped = 62;
                else if(!this.isArabic && event.shiftKey && (swapChar == 190))
                    swapped = 60;   
            }
            else {
                if(swapChar == 219){
                    if (this.isArabic) {
                        if(event.shiftKey && layerGuess)
                            swapped = 62;
                    }
                    else
                        swapped = (event.shiftKey) ? 123 : 91;
                }
                else if(swapChar == 221) {
                    if (this.isArabic) {
                        if(event.shiftKey && layerGuess)
                            swapped = 60;
                    }
                    else        
                        swapped = (event.shiftKey) ? 125 : 93;
                }
                else if(event.shiftKey && (swapChar == 48))
                    swapped = 41;
                else if(event.shiftKey && (swapChar == 57))
                    swapped = 40;
                else if(!this.isArabic && event.shiftKey && (swapChar == 188))
                    swapped = 60;
                else if(!this.isArabic && event.shiftKey && (swapChar == 190))
                    swapped = 62;   
            }
           
            return swapped;
        },

        processLamAlef: function(ieKey,fieldDirection,event,obj) {
            if((ieKey == 1604) && ((this.gKeyCode != 71) || (event.shiftKey && this.gKeyCode == 71)) )
                destroyNextKeyEvent = true;
        
            var replaced_Key = null;
            if(this.gKeyCode == 71)
                replaced_Key = 1571;
            else if(this.gKeyCode == 84)
                replaced_Key = 1573;
            else if(this.gKeyCode == 66)
                replaced_Key = (event.shiftKey) ? 1570 : 1575;                          
        
            if((obj.type != "password") && !fieldDirection && this.autoPush) {           	
                toggleFieldOrient(obj,true,pushMode && (curPos == leftPushBound));
                fieldDirection = !fieldDirection;
            }
            
            if(pushMode) {
                var cursorPos = (has("ie")) ? curPos : obj.selectionStart;
                if(!this.isOverWriteMode() || (leftPushBound == cursorPos))
                    leftPushBound += 1;             
            }
            if(has("ie")) {
                var replaceText = (fieldDirection) ? String.fromCharCode(1604) + String.fromCharCode(replaced_Key) : String.fromCharCode(replaced_Key) + String.fromCharCode(1604);     
                event.returnValue = false;
                tmp = Math.min(selectionStart, curPos);
                curPos = Math.max(selectionStart, curPos);
                selectionStart = tmp;
        
                ieKey = 1604;
                if(this.isOverWriteMode() && (curPos == selectionStart))
                    obj.value = obj.value.substring(0,selectionStart) + replaceText + obj.value.substring(curPos+1);
                else
                    obj.value = obj.value.substring(0,selectionStart) + replaceText + obj.value.substring(curPos);
        
                curPos = selectionStart = selectionStart + 1;
                this.setSelectedRange(obj,selectionStart + 1,selectionStart + 1);  
            }
            else {
                event.preventDefault();
                if(fieldDirection){
                    replaceFieldText(obj,1604);
                    ieKey = replaced_Key;
                } else {                    
                    replaceFieldText(obj,replaced_Key);
                    ieKey = 1604;
                }
            }   
            return ieKey;
        },

        changeKey: function(ieKey,fieldDirection,event,obj) {
            if(this.autoKeyboardLayerSwitch && 
            !((this.gKeyCode<62 && this.gKeyCode>47) || (this.gKeyCode<112 && this.gKeyCode>95) || this.gKeyCode==220 || this.gKeyCode==32)) { 
                if(this.isArabic)
                    ieKey = this.processAutoKeyboardLayerSwitchArabic(ieKey,fieldDirection,event,obj);
                else            
                    ieKey = this.processAutoKeyboardLayerSwitchHebrew(ieKey,fieldDirection,event,obj);           
                    
            } else if(this.autoKeyboardLayerSwitch && !has("ie") && this.gKeyCode == 59) {
                if(fieldDirection ^ this.layerSwitched) {
                    if (event.shiftKey)
                        ieKey=58;
                    else 
                        ieKey = (this.isArabic) ? 1603:1507;
                }
                else            
                    ieKey = (event.shiftKey) ? this.gKeyCode-1 : this.gKeyCode ;  
            }
            else 
                ieKey = this.swapBrackets(event,fieldDirection,ieKey);
            
            if(has("ie"))
                event.keyCode = ieKey;
        
            return ieKey;
        },
        
        processAutoKeyboardLayerSwitchHebrew: function(ieKey,fieldDirection,event,obj) {
            if(this.gKeyCode != ieKey){
                 if(fieldDirection ^ this.layerSwitched) {
                    if(this.gKeyCode < 186)
                        ieKey = CONVERT_TO_HEBREW_LAYER1[this.gKeyCode - 65];        
                    else if(this.gKeyCode < 219)
                        ieKey = (event.shiftKey) ? CONVERT_TO_HEBREW_LAYER1_SHIFT_H[this.gKeyCode - 186] : CONVERT_TO_HEBREW_LAYER1_H[this.gKeyCode - 186];
                    else if(this.gKeyCode < 223)
                        ieKey = (event.shiftKey) ? CONVERT_TO_HEBREW_LAYER2_SHIFT_H[this.gKeyCode - 219] : CONVERT_TO_HEBREW_LAYER2_H[this.gKeyCode - 219];                   
                } else {
                    if(this.gKeyCode>=65 && this.gKeyCode<=90)
                        ieKey = this.gKeyCode + 32;
                    else
                        ieKey = forceToEnglishLayer(ieKey,event);       
                }
            }
            return ieKey;
        },
        
        processAutoKeyboardLayerSwitchArabic: function(ieKey,fieldDirection,event,obj) {
            if((this.gKeyCode == 66) || (event.shiftKey && ((this.gKeyCode == 71) || (this.gKeyCode == 84)))){
                if(fieldDirection ^ this.layerSwitched)
                    return processLamAlef(ieKey,fieldDirection,event,obj);
                else if(ieKey == 1604)
                    destroyNextKeyEvent = true;
            }
        
            if(fieldDirection ^ this.layerSwitched) {    
                if(this.gKeyCode < 186)
                    ieKey = (event.shiftKey) ? CONVERT_TO_ARABIC_LAYER1_SHIFT[this.gKeyCode - 65] : CONVERT_TO_ARABIC_LAYER1[this.gKeyCode - 65];     
                else if(this.gKeyCode < 219)
                    ieKey = (event.shiftKey) ? CONVERT_TO_ARABIC_LAYER2_SHIFT[this.gKeyCode - 186] : CONVERT_TO_ARABIC_LAYER2[this.gKeyCode - 186];
                else if(this.gKeyCode < 223)
                    ieKey = (event.shiftKey) ? CONVERT_TO_ARABIC_LAYER3_SHIFT[this.gKeyCode - 219] : CONVERT_TO_ARABIC_LAYER3[this.gKeyCode - 219];                   
            } else {
                if((this.gKeyCode != ieKey) && (this.gKeyCode != ieKey-32))
                    ieKey = forceToEnglishLayer(ieKey,event);
            }
            return ieKey;
        },
        
        forceToEnglishLayer: function(ieKey,event) {
            if(this.gKeyCode < 186)
                ieKey = (event.shiftKey) ? this.gKeyCode : this.gKeyCode + 32;        
            else if(this.gKeyCode < 219)
                ieKey = (event.shiftKey) ? CONVERT_TO_LOWER_CASE1_SHIFT[this.gKeyCode - 186] : CONVERT_TO_LOWER_CASE1[this.gKeyCode - 186];
            else if(this.gKeyCode < 223)
                ieKey = (event.shiftKey) ? CONVERT_TO_LOWER_CASE2_SHIFT[this.gKeyCode - 219] : CONVERT_TO_LOWER_CASE2[this.gKeyCode - 219];
                
            return ieKey;
        },

        replaceFieldText: function(obj,characterCode) {
            if(this.isOverWriteMode() && (selectionStart == curPos))
                obj.value = obj.value.substring(0,selectionStart) + String.fromCharCode(characterCode) + obj.value.substring(curPos+1);
            else
                obj.value = obj.value.substring(0,selectionStart) + String.fromCharCode(characterCode) + obj.value.substring(curPos);
        
            obj.setSelectionRange(selectionStart+1,selectionStart+1);
        },

        doSymSwap: function(symbol){
            switch(symbol)
            {
                case "(":
                    symbol = ")";
                    break;
                case ")":
                    symbol = "(";
                    break;
                case "{":
                    symbol = "}";
                    break;
                case "}":
                    symbol = "{";
                    break;
                case "[":
                    symbol = "]";
                    break;
                case "]":
                    symbol = "[";
                    break;                  
                case "<": 
                    symbol = ">";
                    break;
                case ">":
                    symbol = "<";
                    break;                              
            }
            return symbol;
        },

        processHome: function(obj){
                if(pushMode)
                    selectionStart = curPos = obj.value.length;         
                else        
                    selectionStart = curPos = (has("ie")) ? 1 : 0;
                                
                if(has("ie")) {;
                	event.returnValue = false;
                	this.setSelectedRange(obj,curPos,curPos);
                }
        
                if(pushMode & (curPos > leftPushBound))
                    this.toggleFieldOrient(obj,true,false);  
        },

        processEnd: function(obj){
                if(pushMode)
                    selectionStart = curPos = (has("ie")) ? 1 : 0;
                else
                    selectionStart = curPos = obj.value.length;
                    
                if(has("ie")) {          
                	event.returnValue = false;
                	this.setSelectedRange(obj,curPos,curPos);          
                }
        
                if(pushMode & (curPos < rightPushBound))
                    this.toggleFieldOrient(obj,true,false);
        },

        toggleFieldOrient: function(obj,setCursor,jumpFromPushSegment) {
            var len = obj.value.length;
            var delta = 0;
            if(!has("ie")) { 
                selectionStart = obj.selectionStart;
                curPos = obj.selectionEnd;
            }
                                   
            obj.style.direction = (obj.style.direction == "rtl") ? "ltr" : "rtl";
            if(has("ie")) {
                if(obj.value.charAt(0) == LRO)
                    obj.value = RLO + obj.value.substring(1);
                else if(obj.value.charAt(0) == RLO)
                    obj.value = LRO + obj.value.substring(1);
            }
            obj.value = this.reverseText(obj.value);
                      
            if(this.autoKeyboardLayerSwitch)
                this.layerSwitched = false;
    
            if(setCursor) { 
                pushMode = !pushMode;
                var fieldStart = (has("ie")) ? 1 : 0;                        
                if(pushMode) {  
                    delta = Math.abs(selectionStart - curPos);
                    leftPushBound = rightPushBound = selectionStart = len - Math.max(selectionStart,curPos) + fieldStart;                   
                    curPos = selectionStart + delta;
                }
                else {          
                    if(jumpFromPushSegment)
                        curPos = rightPushBound;    

                	selectionStart = curPos = len - curPos + fieldStart;                
                }

                this.setSelectedRange(obj,selectionStart,curPos);                
            }                       
            this.showStatusBar(obj);      
        },

        processPush: function(obj,ieKey){
            if(((ieKey == 144) && !isLinux) || ((ieKey == 103) && isLinux)){    
                preventAltNumpad = true;
                if(!pushMode)
                    this.toggleFieldOrient(obj,true,true);
            }
            else if(((ieKey == 111) && !isLinux) || ((ieKey == 104) && isLinux)) {
                preventAltNumpad = true; 
                if(pushMode) {
                    this.toggleFieldOrient(obj,true,true);       
                    this.pushJustTurnedOff = true;
                }
            }   
            
        },

        reverseText: function(text){ 
            var temp = "";
            if (text.charAt(0) == LRO || text.charAt(0) == RLO) {
                temp += text.charAt(0);
                text = text.substring(1);
            }

            var len = text.length;            
            for(var i = 0;i < len;i++)  {
                symbol = text.charAt(len - i - 1);
                symbol = this.doSymSwap(symbol);
                temp += symbol;
            }
            
            if(isLinux && this.isArabic)
            	temp.value = ara_type(0,temp,(temp.charAt(0) == RLO));            
            
            return temp;           
        },

        processFieldReverse: function(obj,setCursor){    
            isFldreversed = !isFldreversed;
            var len = obj.value.length;
            var fieldStart = (has("ie")) ? 1 : 0;
            
            if(len == fieldStart) {
                obj.style.textAlign = (obj.style.direction == "rtl") ? "left" : "right";
                setCursor = false;
            }
                        
            this.toggleFieldOrient(obj,false,false);
                
            if(setCursor) {
            	selectionStart = curPos = len - curPos + fieldStart;              
                this.setSelectedRange(obj,curPos,curPos);
            }   
        },

        preventDefault: function(event){
            if(has("ie"))
                event.returnValue = false;      
            else
                event.preventDefault();
        },

        processDelete: function(obj){
            if(!has("ie")) {
                selectionStart = obj.selectionStart;
                curPos = obj.selectionEnd;
            }

            if(pushMode && (selectionStart < leftPushBound)){
                if(selectionStart == curPos)
                    leftPushBound--;
                else
                    leftPushBound -= Math.abs(selectionStart - curPos);
            }   
        
            if(has("ie")) {      
                curPos = Math.min(selectionStart,curPos);
                selectionStart = curPos;
                if(selectionStart == 0)
                    this.preventEraseMarker(); 
            }      
        },

        processBackspace: function(obj, event){
            if(has("ie")) {
                var range = document.selection.createRange();
                noSelection = ((range.text).length == 0);
            }
            else {
                selectionStart = obj.selectionStart;
                curPos = obj.selectionEnd;
                noSelection = (selectionStart == curPos);
            }
          
            if(noSelection) {
                var fieldStart = (has("ie")) ? 1 : 0;
                if(curPos > fieldStart) {
                    if(pushMode && (curPos <= rightPushBound)) {
                        this.preventDefault(event);
                        preventKeyPressProcessing = true;             
                        return;
                    }           
                    curPos--;
                    if(pushMode)
                        leftPushBound--;
                }
                else { 
                    this.preventDefault(event);                                 
                    return;
                }           
            }
            else {
                if(pushMode) 
                    leftPushBound -= Math.abs(selectionStart - curPos);
                                   
                    curPos = Math.min(selectionStart,curPos);
                    if(has("ie") && curPos == 0)
                        this.preventEraseMarker();
            }           
            selectionStart = curPos;
        },

        processLeftarrow: function(event){
            if(curPos > 1) {
                if (event.shiftKey) {
                    if (selectionStart == curPos)
                        selectionStart = curPos;
                        curPos--;   
                }
                else {
                    if(selectionStart != curPos)
                        selectionStart = curPos = Math.min(selectionStart,curPos);
                    else
                        selectionStart = curPos = curPos - 1;                               
                }
            }
            else
                event.returnValue = false;
        },

        processRightarrow: function(event){ 
            if(curPos < this.focusNode.value.length) {
                if (event.shiftKey) {
                    if (selectionStart == curPos)
                        selectionStart = curPos;
                        curPos++;
                }
                else {
                    if(selectionStart != curPos)
                        selectionStart = curPos = Math.max(selectionStart,curPos);
                    else
                        selectionStart = curPos = curPos + 1;                           
                }
            }
            else
                event.returnValue = false;  
        },

        generateStatusStr: function(obj) {
                var status = TYPINGORIENT;
                status += (obj.style.direction == "rtl") ? "<=" : "=>";
                
                status += AUTOPUSH;
                status += (this.autoPush) ? "on" : "off";

                status += "  Keyboard:";    
                if(this.isArabic)
                    status += (layerGuess) ? " A" : " E";
                else
                    status += (layerGuess) ? " H" : " E";
  			return status;
        },

        showStatusBar: function(obj) {
			if(has("ie")) {
                var status = this.generateStatusStr (obj);
                window.status = status;
			}
        },
        get: function(name){
        	var value = this.inherited(arguments); 
        	if (name == "value"){
        		if(has("ie") && ((value.charAt(0) == LRO) || (value.charAt(0) == RLO))) 
        			value = value.substring(1);
	            
        		if (this.focusNode.style.direction == "rtl")
	               	value = this.reverseText(value);         		
        	}
        		        	
			return value;

        },
        set: function(name, value){
        	var result = this.inherited(arguments);
        	if (name == "value")
        		if(has("ie"))
        			this.setValue(value);
        	return result;
        },
        
        _setValueAttr: function(value, priorityChange,  formattedValue){	
			this.inherited(arguments);     			
			this.setValue(value);
		},
		
    	getValue: function(){
    	    var value = this.attr('value');    	    
    	    if(this.isVisualMode) {
	            if(has("ie") && ((value.charAt(0) == LRO) || (value.charAt(0) == RLO)))
	                value = value.substring(1);
	
	            if (this.focusNode.style.direction == "rtl")
	               	value = this.reverseText(value); 
       	    }    		
    	    return value;
    	},
    	
    	setValue: function(newValue){
            if(this.isVisualMode && has("ie")) {
                if (this.dir == "rtl")
                	this.focusNode.value = RLO + newValue;
                else
                	this.focusNode.value = LRO + newValue;
            }
    	},
    	
	getDisplayedValue: function() {
    	    var value = this.attr('displayedValue');
    	    if(this.isVisualMode) {
	        if(has("ie") && ((value.charAt(0) == LRO) || (value.charAt(0) == RLO)))
	           value = value.substring(1);
	
	        if (this.focusNode.style.direction == "rtl")
	        	value = this.reverseText(value); 
    	    }    		
    	    return value;
	},

	setDisplayedValue: function(value) {
	    if(this.isVisualMode) {
		if (this.focusNode.style.direction == "rtl") {
		   value = this.reverseText(value);
		   if(has("ie"))
			value = RLO + value;
		   } 
		   else if(has("ie"))
			value = LRO + value;
		}			
		this.attr('displayedValue', value);
	},
	hasOnlyEnglishChars: function(text) {
		for(var i = 0;i < text.length; i++){
			var ch = text.charAt(i);
			if (!(ch>='A' && ch <='Z') && !(ch>='a' && ch <='z'))
				return false
		}
		return true;
	},
	hasOnlyBidiChars: function(text) {
		for(var i = 0;i < text.length;i++){
			var ch = text.charAt(i);
			if ((ch>='A' && ch <='Z') || (ch>='a' && ch <='z'))
				return false
		}
		return true;
	}		
	});
});
