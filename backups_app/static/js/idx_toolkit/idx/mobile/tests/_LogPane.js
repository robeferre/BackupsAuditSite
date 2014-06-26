/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/fx",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojox/mobile/Container" ],
        function(declare,
        		 _fx,
        		 domClass,
        		 domConstruct,
        		 Container){

	/**
	 * Creates a new log pane.
	 * @name idx.mobile.tests._LogPane
	 * @class The LogPane widget is a pane presenting a log of messages for viewing
	 * by the user. This is only intended for use in test files.
	 * </p>
	 * @augments dojox.mobile.Container
	 * @example
	 * var about = new idx.mobile._LogPane({
	 * 		 
	 */
	return declare("idx.mobile.tests._LogPane", [Container],
	/** @lends idx.mobile.tests._LogPane.prototype */
	{
		/**
		 * The maximum number of messages to retain in the log. Once the maximum
		 * number is shown, each new message will cause the oldest message to be
		 * dropped from the display.
		 * @type string
		 */
		maxShown: 10,
		
		/**
		 * A placeholder string to be displayed when there are no messages.
		 */
		placeHolder: null,
		
		/**
		 * True if the pane should hide when there are no messages.
		 */
		hideWhenEmpty: false,
		
		buildRendering: function(){
			// create a container node and reparent any content into it
			this.containerNode = domConstruct.create("div");
			if(this.srcNodeRef){
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
				}
			}
			
			this.inherited(arguments);			
			this.domNode.appendChild(this.containerNode);
			domClass.add(this.domNode, "mblIdxLogPane");
			
			if(this.placeHolder){
				this._placeholderNode = domConstruct.create("div", { className: "mblIdxLogPlaceholder" }, this.containerNode, "first");
				this._placeholderNode.innerHTML = this.placeHolder;
			}else if(this.hideWhenEmpty){
				this.domNode.style.display = "none";
			}
		},
		
		addMessage: function(text){
			var msg = domConstruct.create("div", { className: "mblIdxLogItem" }, this.containerNode, "first");
			_fx.animateProperty({
				node: msg,
				duration:2000,
				properties: {
					backgroundColor: { start: '#ffff44', end: '#ffffff' }
				}
			}).play();
			
			msg.innerHTML = text + ' <span class="mblIdxLogTime">(' + new Date().toISOString().match(/T(.*)Z/)[1] + ')</span>';
			this._trim();
			this.domNode.style.display = "block";
		},
		
		_clear: function(){
			while(this.containerNode.firstChild && (this.containerNode.firstChild !== this._placeholderNode)){
				this.containerNode.removeChild(this.containerNode.firstChild);
			}
			
			if(this._placeholderNode){
				this._placeholderNode.style.display = "block";
			}else if(this.hideWhenEmpty){
				this.domNode.style.display = "none";
			}
		},
		
		_trim: function(){
			if(this._placeholderNode){
				this._placeholderNode.style.display = "none";
			}
			
			var lastchild = this.containerNode.firstChild,
				more = this.maxShown - 1;
			
			while(lastchild && more-- && (lastchild.nextSibling !== this._placeholderNode)){
				lastchild = lastchild.nextSibling;
			}
			
			while(lastchild && lastchild.nextSibling && (lastchild.nextSibling !== this._placeholderNode)){
				this.containerNode.removeChild(lastchild.nextSibling);
			}
		}
	});
});