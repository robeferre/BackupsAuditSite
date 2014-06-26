dojo.provide("idx.tests.widget.module");

try{
	var userArgs = "?" + window.location.search.match(/[\?&](dojo|mode)=[^&]*/g).join("").substring(1);
	doh.registerUrl("idx.tests.widget.test_SingleMessage", dojo.moduleUrl("idx","tests/widget/test_SingleMessage.html"+userArgs), 999999);
	//doh.registerUrl("idx.tests.widget.test_Toaster", dojo.moduleUrl("idx","tests/widget/test_Toaster.html"+userArgs), 999999);
	//doh.registerUrl("idx.tests.widget.test_ToasterBidi", dojo.moduleUrl("idx","tests/widget/test_ToasterBidi.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_HoverHelp", dojo.moduleUrl("idx", "tests/widget/test_HoverHelp.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_EditController", dojo.moduleUrl("idx", "tests/widget/test_EditController.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_Banner", dojo.moduleUrl("idx", "tests/widget/test_Banner.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_ECMBreadcrumb", dojo.moduleUrl("idx", "tests/widget/test_ECMBreadcrumb.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_MaximizeMixin", dojo.moduleUrl("idx", "tests/widget/test_MaximizeMixin.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_ResizeHandle", dojo.moduleUrl("idx", "tests/widget/test_ResizeHandle.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_TypeAhead", dojo.moduleUrl("idx", "tests/widget/test_TypeAhead.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_ModalDialog", dojo.moduleUrl("idx","tests/widget/test_ModalDialog.html"+userArgs), 999999);
	//doh.registerUrl("idx.tests.widget.test_ErrorDialog", dojo.moduleUrl("idx", "tests/widget/test_ErrorDialog.html"+userArgs), 999999);
	//doh.registerUrl("idx.tests.widget.test_SimpleIconDialog", dojo.moduleUrl("idx", "tests/widget/test_SimpleIconDialog.html"+userArgs), 999999);
	
	//doh.registerUrl("idx.tests.widget.test_CheckBoxTreeRobot", dojo.moduleUrl("idx","tests/widget/robot/test_CheckBoxTreeRobot.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.widget.test_CheckBoxTree", dojo.moduleUrl("idx","tests/widget/test_CheckBoxTree.html"+userArgs, 999999));
	doh.registerUrl("idx.tests.widget.test_Dialog", dojo.moduleUrl("idx", "tests/widget/test_Dialog.html"+userArgs));
	doh.registerUrl("idx.tests.widget.test_HoverHelpTooltip", dojo.moduleUrl("idx", "tests/widget/test_HoverHelpTooltip.html"+userArgs), 30000);
	doh.registerUrl("idx.tests.widget.test_Menu", dojo.moduleUrl("idx", "tests/widget/test_Menu.html"+userArgs), 30000);
	doh.registerUrl("idx.tests.widget.test_MenuBar", dojo.moduleUrl("idx", "tests/widget/test_MenuBar.html"+userArgs), 30000);
	doh.registerUrl("idx.tests.widget.test_MenuDialog", dojo.moduleUrl("idx", "tests/widget/test_MenuDialog.html"+userArgs), 30000);
	doh.registerUrl("idx.tests.widget.test_MenuHeading", dojo.moduleUrl("idx", "tests/widget/test_MenuHeading.html"+userArgs), 30000);
}catch(e){
	doh.debug(e);
}
