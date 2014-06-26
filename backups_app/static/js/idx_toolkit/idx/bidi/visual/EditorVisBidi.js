/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
define(["dojo/_base/declare", "dojo/has", "dojo/_base/lang", "dojo/_base/window", "dojo/keys", "dijit/_editor/RichText", "dijit/Editor", "./EditorVisBidi"], function(declare, has, lang, win, keys, richText, editor){
	/**
	 * @name idx.bidi.visual.EditorVisBidi
	 * @class idx.bidi.visual.EditorVisBidi is implemented according requirements for IBM Visual Data Widgets <b><a href="https://w3-connections.ibm.com/communities/service/html/communityview?lang=en_US&communityUuid=dca0e714-6eee-4f05-ba6d-13d845546ac1"></a></b>.
	 * It is a composite widget which enhanced dijit.Editor with additional support for Visual text layout.
	 * @augments dijit.Editor
	 */
	return declare("idx.bidi.visual.EditorVisBidi",[richText,editor],{
		LRO: "\u202d",
		RLO: "\u202e",
		isVisualMode: false,
		isTextReversed:false,
		dir:"ltr",


		postCreate:function(){
			this.dir = this.dir.toLowerCase();
			this.inherited(arguments);
			this._savedPushBoundaries = null;
			this._selectionLength = 0;
			if(this.isTextReversed) {
				this.contentDomPreFilters.push(lang.hitch(this, "_reverseNodes"));
				this.contentDomPostFilters.push(lang.hitch(this, "_reverseNodes"));		
			}
		},
		_adjustCursorOnPushTyping: function(offset) {
			return;
		 /*try{	
			if(has("ie")){
				var b=win.withGlobal(this.window,dijit.getBookmark);
				var selection = dijit.range.getSelection(this.window);
				if(b && b.mark && !lang.isArray(b.mark) && selection){
					if(selection.rangeCount)
						range = selection.getRangeAt(0);
				
					if(range)
						b.mark = range.cloneRange();
					else
						b.mark = win.withGlobal(this.window,dijit.getBookmark);

					if(selection.removeAllRanges){
						selection.removeAllRanges();
						r = dijit.range.create(this.window);
						var container = dijit.range.getIndex(b.mark.startContainer,this.editNode).o;
						node = dijit.range.getNode(container,this.editNode);
						if(offset == null)
							offset = b.mark.startOffset-1;
						
						if(node){
							r.setStart(node,offset);
							r.setEnd(node,offset);
							selection.addRange(r);
						}
					}			
				}
			} else if (dojo.global.getSelection){
				var selection = dojo.global.getSelection();
				if(selection.removeAllRanges){
					var selectionRange = selection.getRangeAt(0);
					if(offset == null)
						offset = selectionRange.startOffset - 1;
					
					selectionRange.setStart(selectionRange.startContainer, offset);
					selectionRange.setEnd(selectionRange.endContainer, offset);	
					selection.removeAllRanges();
					selection.addRange(selectionRange);
				}
			}
		 }catch(e){}*/	
		},
		_getCursorPos: function() {
		 var cursorPos = null;
		 try{	
			if(has("ie")){
					var b=win.withGlobal(this.window,dijit.getBookmark);
					var selection = dijit.range.getSelection(this.window);
					if(b && b.mark && !lang.isArray(b.mark) && selection){
						if(selection.rangeCount)
							range = selection.getRangeAt(0);
					
						if(range)
							b.mark = range.cloneRange();
						else
							b.mark = win.withGlobal(this.window,dijit.getBookmark);					

						if(b.mark){
							var container = dijit.range.getIndex(b.mark.startContainer,this.editNode).o;
							node = dijit.range.getNode(container,this.editNode);
							if(node)
								cursorPos = {
									container : node,
									leftBound : b.mark.startOffset,
									rightBound : b.mark.endOffset
								};
						}				
					}
			} else if (win.global.getSelection){
				var selection = win.global.getSelection();
				if(selection){
					var selectionRange = selection.getRangeAt(0);
					if(selectionRange)
						cursorPos = {
							container : selectionRange.startContainer,
							leftBound : selectionRange.startOffset,
							rightBound : selectionRange.endOffset
						};
				}
			}
		 }catch(e){}
		 return cursorPos;
		},
		onKeyPress: function(e){
			if(this.isVisualMode){
				try{		
					var eKey = (has("ie")) ? e.keyCode : e.charCode;
					this._isKeyboardLayerRtl = null;
					this._isKeyUpDone = false;	
					//
					if(((eKey > 64) && (eKey < 91)) || ((eKey > 96) && (eKey < 123)))
						this._isKeyboardLayerRtl = false;
					else if((eKey > 1487) && !((eKey > 1631) && (eKey < 1642)))
						this._isKeyboardLayerRtl = true;
					else if((eKey != 32) && this._isKeyboardLayerRtl && 
							(((eKey > 47) && (eKey < 58)) || ((eKey > 1631) && (eKey < 1642)))) 
					{		
						this._isKeyboardLayerRtl = false;					
					}

					var curPos = win.withGlobal(this.window,"_getCursorPos", this, []);			
					if (this._isKeyboardLayerRtl != null) {			
						if ((this._isKeyboardLayerRtl != (this.dir.toLowerCase() == "rtl")) && (this._savedPushBoundaries == null)) {			
							this._savedPushBoundaries = curPos;					
						}
						
						if (this._isKeyboardLayerRtl == (this.dir.toLowerCase() == "rtl")) {
							if ((this._savedPushBoundaries != null) && (curPos.leftBound == this._savedPushBoundaries.leftBound)) {			
								var positionToJump = (this._savedPushBoundaries.rightBound) ? this._savedPushBoundaries.rightBound : null;					
								win.withGlobal(this.window,"_adjustCursorOnPushTyping", this, [positionToJump]);
							}
							this._savedPushBoundaries = null;					
						}					
					}
			
					if(this._isKeyboardLayerRtl != null) {
						if(curPos && (curPos.rightBound != undefined))
							this._selectionLength = Math.abs(curPos.rightBound - curPos.leftBound);
						else
							this._selectionLength = 0;				
					}
					
					if(this._isOverWriteMode() && (this._isKeyboardLayerRtl != null) &&
						((this.dir.toLowerCase() == "rtl") != this._isKeyboardLayerRtl))
						{
							win.withGlobal(this.window,"_adjustCursorOnPushTyping", this, [null]);
						}
				 }catch(e){}	
			}
			
			this.inherited(arguments);
			
		},
		onKeyUp: function(e){
			this.inherited(arguments);
			if(!this.isVisualMode)
				return;

		  try{	
			if(!this._isKeyUpDone && (this._isKeyboardLayerRtl != null) && !e.ctrlKey &&
				((this.dir.toLowerCase() == "rtl") != this._isKeyboardLayerRtl))
			{		
				win.withGlobal(this.window,"_adjustCursorOnPushTyping", this, [null]);
				
				if (this._savedPushBoundaries != null) {
					if (this._isOverWriteMode()) {
						var curPos = win.withGlobal(this.window,"_getCursorPos", this, []);
						if(this._savedPushBoundaries.leftBound > 0 && (this._savedPushBoundaries.leftBound > curPos.leftBound))
							this._savedPushBoundaries.leftBound -= 1;				
					}
					else
						this._savedPushBoundaries.rightBound += (this._selectionLength != 0)?(1 - this._selectionLength):1;
				}		
			}
			this._isKeyUpDone = true;
			var key = e.keyCode, ks = keys;	
			switch(key) {
				case ks.LEFT_ARROW:
				case ks.RIGHT_ARROW:
					if (this._savedPushBoundaries != null) {
						var cursorPos = win.withGlobal(this.window,"_getCursorPos", this, []);
						if((cursorPos == null) || (cursorPos.container != this._savedPushBoundaries.container)
							|| (cursorPos.rightBound > this._savedPushBoundaries.rightBound) 
							|| (cursorPos.leftBound < this._savedPushBoundaries.leftBound)) {
							
							this._savedPushBoundaries = null;
						}
					}
					break;
				case ks.UP_ARROW:
				case ks.DOWN_ARROW:
					if (this._savedPushBoundaries != null) {
						var cursorPos = win.withGlobal(this.window,"_getCursorPos", this, []);
						if((cursorPos == null) || (cursorPos.container != this._savedPushBoundaries.container))
							this._savedPushBoundaries = null;
					}
					break;
				case ks.HOME:
				case ks.END:
				case ks.PAGE_UP:
				case ks.PAGE_DOWN:
				case ks.ENTER:
					this._savedPushBoundaries = null; 
					break;
			}
		  }catch(e){}	
		},
		onKeyDown:function(e){
			if(has("ie") && (65 <= e.keyCode && e.keyCode <= 90))
				return;
			

			var key = e.keyCode, ks = keys;	
			if(this.isVisualMode && (key == ks.BACKSPACE || key == ks.DELETE) && (this._savedPushBoundaries != null)) {
				if (this._savedPushBoundaries.leftBound == this._savedPushBoundaries.rightBound) {
					this._savedPushBoundaries = null;			
				}
				if (this._savedPushBoundaries != null) {
					var cursorPos = win.withGlobal(this.window,"_getCursorPos", this, []);				
					if((cursorPos != null) && (cursorPos.rightBound != undefined))
						this._selectionLength = Math.abs(cursorPos.rightBound - cursorPos.leftBound);
					else
						this._selectionLength = 0;
					
					if ((this._savedPushBoundaries.leftBound > 0) && (this._savedPushBoundaries.rightBound > 0)) {						
						if((key == ks.BACKSPACE) && (this._selectionLength == 0) 
							&& (this._savedPushBoundaries.leftBound == cursorPos.leftBound)) {
							
							this._savedPushBoundaries.leftBound -= 1;
						}
			
						this._savedPushBoundaries.rightBound -= (this._selectionLength != 0) ? (this._selectionLength) : 1;			
					}
					else if (this._selectionLength > 0) {			
						var pushSegmentLength = Math.abs(this._savedPushBoundaries.rightBound - this._savedPushBoundaries.leftBound);				
						if(this._selectionLength >= pushSegmentLength)
							this._savedPushBoundaries = null;		
					}
				}
			}
			
			this.inherited(arguments);
				
			if((key == keys.SHIFT) && e.ctrlKey){
				this.dir = ((this.dir.toLowerCase()=="rtl")?"ltr":"rtl");
				if(this.focusNode.style.direction != this.dir) {			
					this.focusNode.style.direction = this.dir;
					this._savedPushBoundaries = null;			
				}
			}
		},
		_onMouseUp: function(e){
			if((this._savedPushBoundaries != null) && (this._savedPushBoundaries.leftBound > 0) 
				&& (this._savedPushBoundaries.rightBound > 0)) 
			{
				var cursorPos = win.withGlobal(this.window,"_getCursorPos", this, []);		
				if((cursorPos == null) || (cursorPos.container != this._savedPushBoundaries.container)
					|| (cursorPos.rightBound > this._savedPushBoundaries.rightBound) 
					|| (cursorPos.leftBound < this._savedPushBoundaries.leftBound)) {
					
					this._savedPushBoundaries = null;
				}
			}	

			this.inherited(arguments);
		},
		_onPaste: function(e){	
			this._savedPushBoundaries = null;
		},
		_onCut: function(e){
			if (this._savedPushBoundaries != null) {
				var cursorPos = win.withGlobal(this.window,"_getCursorPos", this, []);				
				if((cursorPos != null) && (cursorPos.rightBound != undefined))
					this._selectionLength = Math.abs(cursorPos.rightBound - cursorPos.leftBound);
				else
					this._selectionLength = 0;

				if (this._selectionLength > 0) {		
					if ((this._savedPushBoundaries.leftBound < cursorPos.leftBound) &&
						(this._savedPushBoundaries.rightBound > cursorPos.rightBound)) 
					{				
						this._savedPushBoundaries.rightBound -= (this._selectionLength);							
					}
					else {
						this._savedPushBoundaries = null;		
					}
				}
			}
		},
		_onBlur: function(e){
			this.inherited(arguments);
			if(this.isVisualMode)
				this._savedPushBoundaries = null;
		},
		onLoad: function(html){
			this.inherited(arguments);
			if(this.isVisualMode) {
				this.editNode.style.unicodeBidi="bidi-override";
				this.connect(this.editNode, "onmouseup", this._onMouseUp);
				this.connect(this.editNode, "oncut", this._onCut);
				this.connect(this.editNode, "onpaste", this._onPaste);

				if(this.document.createStyleSheet) {
					var oStyleSheet = this.document.styleSheets[this.document.styleSheets.length-1];		
					oStyleSheet.addRule("p","{unicode-bidi: bidi-override}");
					oStyleSheet.addRule("li","{unicode-bidi: bidi-override}");
					oStyleSheet.addRule("div","{unicode-bidi: bidi-override}");
					oStyleSheet.addRule("blockquote","{unicode-bidi: bidi-override}");		
				} else if(has("mozilla")) {	
					this.document.styleSheets[0].insertRule("div,ul>li,ol>li,blockquote {unicode-bidi: bidi-override}",0);
				}
			}
		},
		_doSymSwap: function(symbol){
			switch(symbol)
			{
				case "(":
					symbol = ")";break;
				case ")":
					symbol = "(";break;
				case "{":
					symbol = "}";break;
				case "}":
					symbol = "{";break;
				case "[":
					symbol = "]";break;
				case "]":
					symbol = "[";break;                
				case "<": 
					symbol = ">";break;
				case ">":
					symbol = "<";break;                             
			}
			return symbol;
		},

		_reverseText: function(text){
			var len = text.length;
			if (len < 2)
				return text;

			var ret = "";
			for ( var i = 0; i < len; i++) {
				ret += this._doSymSwap(text.charAt(len - i - 1));
			}
			return ret;           
		},
		_reverseNodes: function(first){
			try{
				var len = first.childNodes.length;		
				if (len > 0) {
					for (var i = 0; i < len; i++) { 
						this._reverseNodes(first.childNodes[i]);
					}
				} else {
					if (first.nodeType == 1) {
						tagName = first.tagName.toLowerCase();
						if ((tagName != "style") && (tagName != "script") && (tagName != "br")) {
							first.innerHTML = this._reverseText(first.innerHTML);
						}
					} else if (first.nodeType == 3) {
						first.nodeValue = this._reverseText(first.nodeValue);
					}
				}
			} catch (e) {}
			
			return first;
		},
		_isOverWriteMode: function() {
			return ((has("ie")) ? document.queryCommandValue("OverWrite") : false);
		}
});
});