dojo.provide("idx.tests.form.module");

try{
	var userArgs = "?" + window.location.search.match(/[\?&](dojo|mode)=[^&]*/g).join("").substring(1);
	doh.registerUrl("idx.tests.form.test_ComboLink", dojo.moduleUrl("idx", "tests/form/test_ComboLink.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.form.test_DropDownLink", dojo.moduleUrl("idx", "tests/form/test_DropDownLink.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.form.test_DropDownSelect", dojo.moduleUrl("idx", "tests/form/test_DropDownSelect.html"+userArgs), 999999);
	doh.registerUrl("idx.tests.form.test_Link", dojo.moduleUrl("idx", "tests/form/test_Link.html"+userArgs), 999999);
 	// having trouble with robot tests
	//	doh.registerUrl("idx.tests.form.robot.test_Link", dojo.moduleUrl("idx", "tests/form/robot/test_Link.html"+userArgs), 999999);

	doh.registerUrl("idx.tests.form.test_CheckBox", dojo.moduleUrl("idx","tests/form/test_CheckBox.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_CheckBoxBidi", dojo.moduleUrl("idx","tests/form/test_CheckBoxBidi.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_CheckBoxList", dojo.moduleUrl("idx","tests/form/test_CheckBoxList.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_CheckBoxSelect", dojo.moduleUrl("idx","tests/form/test_CheckBoxSelect.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_ComboBox", dojo.moduleUrl("idx","tests/form/test_ComboBox.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_Select", dojo.moduleUrl("idx","tests/form/test_Select.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_TriStateCheckBox", dojo.moduleUrl("idx","tests/form/test_TriStateCheckBox.html"+userArgs));
	
	doh.registerUrl("idx.tests.form.test_TextBox", dojo.moduleUrl("idx","tests/form/test_TextBox.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_DateTimeTextBox", dojo.moduleUrl("idx","tests/form/test_DateTimeTextBox.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_FilteringSelect", dojo.moduleUrl("idx","tests/form/test_FilteringSelect.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_Slider", dojo.moduleUrl("idx","tests/form/test_Slider.html"+userArgs));
	doh.registerUrl("idx.tests.form.test_NumberTextBox", dojo.moduleUrl("idx","tests/form/test_NumberTextBox.html"+userArgs));
	//doh.registerUrl("idx.tests.form.test_FileInput", dojo.moduleUrl("idx","tests/form/test_FileInput.html"+userArgs));
	//doh.registerUrl("idx.tests.form.test_FormLayout", dojo.moduleUrl("idx","tests/form/test_FormLayout.html"+userArgs));
}catch(e){
	doh.debug(e);
}
