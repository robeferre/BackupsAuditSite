/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/window",
        "dojo/dom-class",
        "dojo/dom-construct",
		"dojo/i18n",
		"dojo/on",
		"dojo/string",
        "dojox/mobile/Button",
        "dojox/mobile/SimpleDialog",
        "dojox/mobile/TextBox",
        "dojo/i18n!./nls/Login"],
        function(declare,
        		 lang,
        		 _win,
        		 domClass,
        		 domConstruct,
        		 i18n,
        		 on,
        		 string,
        		 Button,
        		 SimpleDialog,
        		 TextBox){

	/**
	 * Creates a new "Login" dialog
	 * @name idx.mobile.Login
	 * @class The Login widget is a dialog enabling the user to log in to an
	 * IBM One UI application in a standard way. It extends dojox/mobile/SimpleDialog
	 * to perform initialisation and configuration.
	 * <p>
	 * To create the dialog, initialise the widget with the required
	 * properties. The appropriate HTML and CSS is created immediately, and
	 * subsidiary dijit components may be created and marshalled, but the dialog
	 * is initially hidden. When the dialog is to be shown, call the show()
	 * method. If the dialog includes a cancel button, this will automatically
	 * hide the dialog when selected. The application may also hide the dialog
	 * if required by calling the hide() method.
	 * </p>
	 * <p>
	 * When the user has entered credentials and presses the "Log In" button, the
	 * "login" event is triggered. The application can connect to the "onLogin" method
	 * which receives an object containing two fields:
	 * <ul>
	 * <li>name: the user name entered</li>
	 * <li>password: the password entered</li>
	 * </ul>
	 * The application should use the supplied credentials to attempt to authenticate
	 * the user. If authentication is successful, the dialog can be dismissed by calling
	 * the hide() method. If authentication is not successful, the application can call
	 * the showMessage() method to display an explanatory message to the user and keep
	 * the dialog visible for them to retry. These responses do not need to be made
	 * synchronously: in some cases the application will need to send an asynchronous
	 * authentication request and then take the appropriate action when it responds.
	 * </p>
	 * @augments dojox.mobile.SimpleDialog
	 * @example
	 * var logindialog = new idx.mobile.Login({ name: "My product", onLogin: function(args){ this.hide(); } });
	 */
	return declare("idx.mobile.Login", [SimpleDialog],
	/** @lends idx.mobile.Login.prototype */
	{
		/**
		 * The product name (required), to a maximum of 90 characters. This may
		 * include simple HTML mark-up (e.g. for special characters or emphasis).
		 * @type string
		 */
		name: "",
		_setNameAttr: { node: "_nameNode", type: "innerHTML" },
		
		/**
		 * If true, the dialog will include a cancel button enabling the user to 
		 * abandon the login attempt. This is appropriate for applications where
		 * login is optional.
		 */
		cancelable: true,
		
		/**
		 * The copyright or other legal information that should be displayed. This
		 * may include simple HTML mark-up (e.g. for special characters or emphasis).
		 * It may also include string substitutions, eg ${copyright}.
		 * @type string
		 */
		legal: "&copy; ${copyright} IBM Corporation.",
		
		/**
		 * The copyright year or years that should be inserted into the legal information.
		 * This may be a single year number or a comma-separated list of year numbers.
		 * The default is '2012'.
		 */
		copyright: "2012",
		
		create: function(){
			if(domClass.contains(_win.doc.documentElement, "dj_phone")){
				// in phone mode we don't want to be centered
				// as we will fill the entire screen
				this.top = 0;
				this.left = 0;
			}
			this.inherited(arguments);
		},

		postMixInProperties: function(){
			this._nls = i18n.getLocalization("idx.mobile", "Login");
			this.inherited(arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			
			// create the standard layout to appear around the supplied content
			var outer = domConstruct.create("div", { className: "mblIdxLoginPane" }, this.domNode ),
				ctr = domConstruct.create("form", { action: "javascript://" }, outer );
			domConstruct.create("div", { className: "mblIdxIbmLogo", title: this._nls.logoIBM }, ctr);
			this._nameNode = domConstruct.create("h1", { className: "mblIdxProductName" }, ctr);
			
			ctr.appendChild(this.containerNode);
			this._messageNode = domConstruct.create("p", { className: "mblIdxAlert" }, ctr);
			
			var edit1 = domConstruct.create("div", { className: "mblIdxEdit" }, ctr),
				edit2 = domConstruct.create("div", { className: "mblIdxEdit" }, ctr),
				buttons = domConstruct.create("div", { className: "mblIdxButtons" }, ctr);
			
			edit1.appendChild((this._nameEditor = new TextBox({ placeHolder: this._nls.promptName })).domNode);
			edit2.appendChild((this._passwordEditor = new TextBox({ placeHolder: this._nls.promptPassword, type: "password" })).domNode);
			buttons.appendChild((this._loginButton = new Button({ label: this._nls.promptLogin, "class": "mblSpecialButton", type: "submit" })).domNode);
			buttons.appendChild((this._cancelButton = new Button({ label: this._nls.promptCancel })).domNode);
			
			domConstruct.create("div", { className: "mblIdxDivider" }, ctr);
			this._legalNode = domConstruct.create("p", { className: "mblIdxLegal" }, ctr);
			domClass.add(this.domNode, "mblIdxLoginDialog");
			
			this.connect(this._cancelButton, "_onClick", "hide");
			this.connect(this._loginButton, "_onClick", "_onLogin");
		},
		
		/**
		 * Display a message to the user on the login panel. For example, if the user
		 * attempts to log in and the credentials are rejected, this method can be
		 * called to display a suitable message to alert the user to the failure and
		 * invite them to retry. The message is cleared when the dialog is dismissed,
		 * or when this method is called again with a new message or with no parameters
		 * to remove the current message.
		 */
		showMessage: function(message){
			this._messageNode.innerHTML = message || "";
		},
		
		hide: function(){
			this.domNode.focus();
			this.inherited(arguments);
			this.showMessage();  // clear any currently displayed message
		},
		
		_setCancelableAttr: function(newvalue){
			this._cancelButton.domNode.style.display = newvalue ? "" : "none";
		},
		
		_refreshLegal: function(){
			// refresh the rendering after an update to legal or copyright properties
			this._legalNode.innerHTML = string.substitute(this.legal, this);
		},
		
		_setLegalAttr: function(newvalue){
			this.legal = newvalue;
			this._refreshLegal();
		},
		
		_setCopyrightAttr: function(newvalue){
			this.copyright = newvalue;
			this._refreshLegal();
		},
		
		/**
		 * Handle pressing the "Log In" button. This method delegates handling to
		 * "onLogin", passing useful parameter values.
		 * @private
		 */
		_onLogin: function(event){
			this.onLogin({ name: this._nameEditor.get("value"), password: this._passwordEditor.get("value") });
			return false;
		},
		
		/**
		 * Handle the user pressing the "Log In" button. The credentials that have been
		 * entered (name, password) are passed as properties of the supplied args object.
		 * The caller should connect to this method, apply the credentials that have been
		 * entered, and either hide the dialog (if login was successful) or show a message
		 * to inform the user of failure and invite them to retry.
		 */		
		onLogin: function(args){
		}
	});
});