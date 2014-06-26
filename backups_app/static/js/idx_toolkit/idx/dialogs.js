/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["idx/main",
        "dojo/_base/lang",
        "dojo/json",
        "dojo/dom-style",
		"dojo/dom-class",
        "dojo/i18n", // i18n.getLocalization
        "idx/resources",
		"idx/widget/ModalDialog",
        "idx/widget/ConfirmationDialog",
        "dojo/i18n!./nls/base",
        "dojo/i18n!./nls/dialogs"],
        function(iMain,
				 dLang,
				 dJson,
				 dDomStyle,
				 dDomClass,
				 dI18n,
				 iResources,
				 ModalDialog,
				 ConfirmationDialog) 
{
/**
 * @name idx.dialogs
 * @namespace Provides convenient functions to show/hide common dialogs.
 */
	var iDialogs = dLang.getObject("dialogs", true, iMain);
	var _nlsResources = dI18n.getLocalization("idx", "dialogs");

/**
 * @public
 * @function
 * @name idx.dialogs.info
 * @description Shows an information dialog with a specified message,
 *	optionally with a callback and a custom label for OK button.
 * @param {String} s Specifies the message.
 * @param {Function} cb Specifies a callback function called when OK button is clicked.
 * @param {String} labelOk Specifies a custom label for OK button.
 */
	iMain.info = iDialogs.info = function(s, cb, labelOk){
		var res = iResources.getResources("idx/dialogs");
		labelOk = (labelOk || res.close);
		var args = {type: "information", text: res.information, closeButtonLabel: labelOk, 
			showCancel: true, title: res.information, iconClass: "idxSignIcon idxInformIcon"};
		if(dLang.isObject(s)){
			args = dLang.mixin(args, s);
		}else{
			args.info = s;
		}
		showSimpleDialog(args, cb);
	};
	
/**
 * @public
 * @function
 * @name idx.dialogs.warn
 * @description Shows a warning dialog with a specified message,
 *	optionally with a callback and a custom label for OK button.
 * @param {String} s Specifies the message.
 * @param {Function} cb Specifies a callback function called when OK button is clicked.
 * @param {String} labelOk Specifies a custom label for OK button.
 */
	iMain.warn = iDialogs.warn = function(s, cb, labelOk){
		var res = iResources.getResources("idx/dialogs");
		labelOk = (labelOk || res.close);
		var args = {type: "warning", text: res.warning, closeButtonLabel: labelOk, 
			showCancel: true, title: res.warning, iconClass: "idxSignIcon idxWarnIcon"};
		if(dLang.isObject(s)){
			args = dLang.mixin(args, s);
		}else{
			args.info = s;
		}
		showSimpleDialog(args, cb);
	};
	
/**
 * @public
 * @function
 * @name idx.dialogs.error
 * @description Shows an error dialog with a specified error string or object,
 *	optionally with a callback and a custom label for OK button.
 *	When an error object is specified, it may include the following properties:
 *	<ul>
 *	<li>summay: short description</li>
 *	<li>detail: long description</li>
 *	<li>moreContent: additional information</li>
 *	<li>messageId: message ID</li>
 *	<li>messageRef: reference</li>
 *	<li>messageTimeStamp: timestamp</li>
 *	</ul>
 * @param {String|Object} error Specifies the error string or object.
 * @param {Function} cb Specifies a callback function called when OK button is clicked.
 * @param {String} labelOk Specifies a custom label for OK button.
 */
	iMain.error = iDialogs.error = function(error, cb, labelOk){
		var res = iResources.getResources("idx/dialogs");
		labelOk = (labelOk || res.close);
		if(dLang.isObject(error)){
			if(error.moreContent){
				showErrorDialog(dLang.mixin(error, {
					type: "error", 
					text: error.summary,
					info: [{
						title: error.detailTabLabel || _nlsResources.idxErrorDialog_detailTabLabel || "Fix this problem",
						content: error.detail
					},{
						title: error.moreTabLabel || _nlsResources.idxErrorDialog_moreTabLabel || "Get more help",
						content: error.moreContent
					}],
					messageId: error.messageId || "",
					messageRef: error.messageRef || "",
					messageTimeStamp: error.messageTimeStamp || "",
					closeButtonLabel: labelOk, 
					showCancel: true, 
					title: res.error
				}), cb);
			}else if(error.detail){
				showSimpleDialog({type: "error", text: error.summary, info: error.detail, closeButtonLabel: labelOk, 
					showCancel: true, title: res.error}, cb);
			}
		}else if(dLang.isString(error)){
			showSimpleDialog({type: "error", text: res.error, info: error, closeButtonLabel: labelOk, 
				showCancel: true, title: res.error}, cb);
		}
	};
	
/**
 * @public
 * @function
 * @name idx.dialogs.confirm
 * @description Shows a confirmation dialog with a specified message,
 *	optionally with callbacks and custom labels for OK and Cancel buttons.
 * @param {String} s Specifies the message.
 * @param {Function} cbOk Specifies a callback function called when OK button is clicked.
 * @param {Function} cbCancel Specifies a callback function called when Cancel button is clicked.
 * @param {String} labelOk Specifies a custom label for OK button.
 * @param {String} labelCancel Specifies a custom label for Cancel button.
 */
	iMain.confirm = iDialogs.confirm = function(s, cbOk, cbCancel, labelOk, labelCancel){
		var res = iResources.getResources("idx/dialogs");
		var args = {type: "warning", text: res.confirmation, buttonLabel: labelOk, cancelButtonLabel: labelCancel, 
			showCancel: true, title: res.confirmation, iconClass: "idxSignIcon idxWarnIcon"};
		if(dLang.isObject(s)){
			args = dLang.mixin(args, s);
		}else{
			args.info = s;
		}
		showConfirmDialog(args, cbOk, cbCancel);
	};
	
/**
 * @public
 * @function 
 * @name idx.dialogs.showProgressDialog
 * @description Shows a progress dialog with a specified message,
 *	optionally with duration for automatic pop-down.
 * @param {String} s Specifies the message.
 * @param {Number} msec Specifies duration for automatic pop-down in milliseconds.
 */
	iMain.showProgressDialog = iDialogs.showProgressDialog = function(s, msec, action, actionLabel){
		var res = iResources.getResources("idx/dialogs");
		var dialog = iDialogs._progressDialog;
		dialog && dialog.destroy && dialog.destroy();
		var args = {type: "information", text: res.information};
		
		dialog = iMain._progressDialog = iDialogs._progressDialog = new ModalDialog(dLang.mixin(args, dLang.isObject(s) ? s : {"info": s || res.loading}, {
			type: "progress",
			title: res.progress,
			text: (dLang.isObject(s) ? s.text : (s || res.loading)),
			style: "min-width:100px; min-height:150px; max-width: 600px;", 
			className: "idxProgressDialog",
			info: '<table class="idxSimpleIconContainer"><tbody>' +
			'<tr><td valign="top"><div class="idxSignIcon dijitContentPaneLoading" dojoattachpoint="iconNode" style=""></div></td></tr>' +
			'<tr><td class="idxSimpleIconText" dojoattachpoint="textNode">' + res.loading + '</td></tr>' +
			'</tbody></table>',
			showActionBar: action,
			closeButtonLabel: actionLabel || "Cancel",
			iconClass: "idxSignIcon dijitContentPaneLoading"
		}));
		dialog._onKey = function(){};
		dialog.startup();
		
		dialog.show();
		if(msec){
			setTimeout(iDialogs.hideProgressDialog, msec);
		}
	};
	
/**
 * @public
 * @function
 * @name idx.dialogs.hideProgressDialog
 * @description Hides a progress dialog shown by showProgressDialog().
 */
	iMain.hideProgressDialog = iDialogs.hideProgressDialog = function(){
		if(iDialogs._progressDialog){
			iDialogs._progressDialog.hide();
		}
	};
	
	var showSimpleDialog = iMain.showSimpleDialog = iDialogs.showSimpleDialog = function(args, cbCancel){
		var dialog = iDialogs._simpleDialog;
		dialog && dialog.destroy && dialog.destroy();
		
		dialog = iMain._simpleDialog = iDialogs._simpleDialog = new ModalDialog(dLang.mixin(args, {style:"min-width:350px; min-height:90px; max-width: 600px;"}));
		dialog.startup();
		showDialog(dialog, args, null, cbCancel);
	};
	
	var showConfirmDialog = iMain.showConfirmDialog = iDialogs.showConfirmDialog = function(args, cbOk, cbCancel){
		var dialog = iDialogs._confirmDialog;
		dialog && dialog.destroy && dialog.destroy();
		
		dialog = iMain._confirmDialog = iDialogs._confirmDialog = new ConfirmationDialog(dLang.mixin(args, {style:"min-width:350px; min-height:90px; max-width: 600px;"}));
		dialog.startup();
		showDialog(dialog, args, cbOk, cbCancel);
	};
	
	var showErrorDialog = function(args, cbCancel){
		var dialog = iDialogs._errorDialog;
		dialog && dialog.destroy && dialog.destroy();
		
		dialog = iMain._errorDialog = iDialogs._errorDialog = new ModalDialog(dLang.mixin(args, {style:"width:350px;"}));
		dialog.startup();
		showDialog(dialog, args, null, cbCancel);
	};
	
	var showDialog = function(dialog, args, cbOk, cbCancel){
		//dialog.showCancelNode(args.showCancel);
		cbOk && (dialog.onExecute = function(){
			dialog.hide();
			if(dLang.isFunction(cbOk)){
				cbOk.apply(iDialogs, arguments);
			}
		});
		cbCancel && (dialog.onCancel = function(){
			dialog.hide();
			if(dLang.isFunction(cbCancel)){
				cbCancel.apply(iDialogs, arguments);
			}
		});
		//dialog.set(args);
		dialog.show();
	};
	
	return iDialogs;
}
);