dojo.provide("idxx.tests.bidi.module");

try{
	var userArgs = "?" + window.location.search.match(/[\?&](dojo|mode)=[^&]*/g).join("").substring(1);
	doh.registerUrl("idx.tests.visual.test_TextBoxVisBidi", dojo.moduleUrl("idx", "tests/visual/test_TextBoxVisBidi.html"+userArgs),999999);		
	doh.registerUrl("idx.tests.visual.test_ComboBoxBidi", dojo.moduleUrl("idx", "tests/visual/test_ComboBoxVisBidi.html"+userArgs),999999);
	doh.registerUrl("idx.tests.visual.test_EditorVisBidi", dojo.moduleUrl("idx", "tests/visual/test_EditorVisBidi.html"+userArgs),999999);
}catch(e){

	doh.debug(e);
	
}
