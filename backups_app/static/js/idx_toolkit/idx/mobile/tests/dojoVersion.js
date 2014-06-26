/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/*
 * This module loads dojo.js, and provides two main extra features:
 *  
 *  1) The path to the dojo directory is specified here, so that
 *     individual files don't need to know it. Each file simply
 *     loads this file by relative path, and dojo.js is then
 *     loaded by a full relative path to the dojo directory.
 *     This means that the path to the dojo directory can be
 *     changed once -- here -- and all the files that use this
 *     loader will automatically pick up the new location.
 *     
 *  2) Additional dojo-config settings are included to register
 *     the IDX library as a dojo package and to configure certain
 *     loading and configuration options, including the aliases
 *     that provide backward compatibility support for widgets
 *     that have recently been moved. Any settings supplied via
 *     data-dojo-config (or djConfig) on the <script> tag that
 *     loaded this file are mixed in with these additional
 *     settings and the resulting config passed to dojo.js.
 *     
 * To use this module, load it via a <script> tag before any dojo
 * functions are required, and pass any desired dojo-config settings
 * in using data-dojo-config="" on the <script> tag. Other script
 * modules dependent upon dojo may then be loaded, and script that
 * uses dojo included in the page. Use require(....) as usual to
 * load/access the specific dojo modules that are needed.
 */

// dojoPath is the relative path from the parent of the 'idx' directory to the
// parent of the 'dojo' directory. It should not begin with '/' but should end
// with '/' (unless it is '' because the two parents are the same directory),
// and it may contain '/'s and '..'s as needed.
var dojoPath = '../dojo_idt/',

// dojoConfig contains the default dojo-config settings that should be used.
// Any settings supplied by data-dojo-config (or djConfig) on the <script> tag
// that loads this file will be mixed in before it is supplied to dojo.js.
	dojoConfig = {
		tlmSiblingOfDojo: false,
		parseOnLoad: true,
		async: true,
		has: {
			"dojo-debug-messages": true
		},
		aliases: [
		    ["idx/oneui/form/CheckBox", "idx/form/CheckBox"],
			["idx/oneui/form/CheckBoxList", "idx/form/CheckBoxList"],
			["idx/oneui/form/CheckBoxSelect", "idx/form/CheckBoxSelect"],
			["idx/oneui/form/ComboBox", "idx/form/ComboBox"],
			["idx/oneui/form/CurrencyTextBox", "idx/form/CurrencyTextBox"],
			["idx/oneui/form/DateTextBox", "idx/form/DateTextBox"],
			["idx/oneui/form/TimeTextBox", "idx/form/TimeTextBox"],
			["idx/oneui/form/NumberSpinner", "idx/form/NumberSpinner"],
			["idx/oneui/form/NumberTextBox", "idx/form/NumberTextBox"],
			["idx/oneui/form/RadioButtonSet", "idx/form/RadioButtonSet"],
			["idx/oneui/form/FilteringSelect", "idx/form/FilteringSelect"],
			["idx/oneui/form/Select", "idx/form/Select"],
			["idx/oneui/form/Textarea", "idx/form/Textarea"],
			["idx/oneui/form/TextBox", "idx/form/TextBox"],
			["idx/oneui/form/TriStateCheckBox", "idx/form/TriStateCheckBox"],
			["idx/oneui/form/VerticalSlider", "idx/form/VerticalSlider"],
			["idx/oneui/form/HorizontalSlider", "idx/form/HorizontalSlider"],
			 
			["idx/oneui/CheckBoxTree", "idx/widget/CheckBoxTree"],
			["idx/oneui/Dialog", "idx/widget/Dialog"],
			["idx/oneui/Header", "idx/app/Header"],
			["idx/oneui/HoverHelpTooltip", "idx/widget/HoverHelpTooltip"],
			["idx/oneui/HoverCard", "idx/widget/HoverCard"],
			["idx/oneui/Menu", "idx/widget/Menu"],
			["idx/oneui/MenuBar", "idx/widget/MenuBar"],
			["idx/oneui/MenuDialog", "idx/widget/MenuDialog"],
			["idx/oneui/MenuHeading", "idx/widget/MenuHeading"],
			 
			["idx/oneui/layout/HighLevelTemplate", "idx/app/HighLevelTemplate"],
			["idx/oneui/layout/ToggleBorderContainer", "idx/layout/ToggleBorderContainer"],
			 
			["idx/oneui/messaging/ConfirmationDialog", "idx/widget/ConfirmationDialog"],
			["idx/oneui/messaging/ModalDialog", "idx/widget/ModalDialog"],
			["idx/oneui/messaging/SingleMessage", "idx/widget/SingleMessage"],
			["idx/oneui/messaging/Toaster", "idx/widget/Toaster"],
			["idx/gridx/Grid", "gridx/Grid"]
		],
		packages: [
		    {name: "dojo", location: "./" },
	  	    {name: "dijit", location: "../dijit" },
	  	    {name: "dojox", location: "../dojox" },
	  	    {name: "gridx", location: "../gridx" },
	  	    {name: "idx", location: "../../ibmjs/idx" },
	  	    {name: "ibm", location: "../../ibmjs/ibm" },
	  	    {name: "doh", location: "../util/doh/" },
	  	    {name: "doh/robot", location: "../util/doh/robot" },
	  	    {name: "internal/dijit", location: "../dijit"},
	  	    {name: "internal/dojo", location: "../dojo"},
	  	    {name: "internal/dojox/robot", location: "../dojox/robot"}
	  	]
	};

var locale = (navigator.language || navigator.userLanguage).toLowerCase();
if(locale == "pt"){
	dojoConfig.locale = "pt-pt";
}

// now load dojo.js...
(function(){
	// we now locate the script tag that loaded this file, and use it to:
	//  * get the relative path, so we can build the path to dojo.js;
	//  * insert a script tag loading dojo.js immediately after it,
	//     so that it is the next script tag to be processed;
	//  * mix any dojo-config settings in to our default config
	var scripts = document.getElementsByTagName("script");
	for(var i = 0; i < scripts.length; i++){
		var src = scripts[i].getAttribute("src");
		if(src && src.match(/dojoVersion\.js/)){
			// this would appear to be our own <script> tag
			var node = scripts[i],
				dojopath = src.replace("dojoVersion\.js", "../../../" + dojoPath + "dojo/dojo.js"),
				conf = node.getAttribute("data-dojo-config") || node.getAttribute("djConfig"),
				importStatement = "<scr" + "ipt type='text/javascript' src='" + dojopath + "'></script>";
			
			// mix any dojo config into our dojoConfig object
			if(conf){
				var obj = eval("({ " + conf + " })");
				for(var key in obj){
					dojoConfig[key] = obj[key];
				}
			}
				
			try{
				// try writing the new script tag directly to the document
				document.write(importStatement);
			}catch(e){
				// if that failed, try inserting the new script tag into the DOM
				var parent = node.getParentNode(),
					nextchild = node.getNextSibling(),
					scriptnode = document.createElement("script");
				
				scriptnode.type = "text/javascript";
				scriptnode.src = dojopath;
				
				// insert the new node immediately after this script tag
				if(nextchild){
					parent.insertBefore(scriptnode, nextchild);
				}else{
					parent.appendChild(scriptnode);
				}
			}
			
			// exit the loop here
			break;
		}
	}
})();