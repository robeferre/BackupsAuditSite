var utils = {};

utils.testF = function(text){
	alert(text);	
}

utils.switchToHebrewKeyboard = function(robot, node) {
	robot.keyPress(null,100,{alt:true,shift:true});
	robot.keyPress(dojo.keys.BACKSPACE,100,{});
	robot.typeKeys("t",100,300);  
	var i = 0;
	utils.testF("error1 " + node.value);
	while ((node.value != "א") && (i < 100)){
		robot.keyPress(null,100,{alt:true,shift:true});
		robot.typeKeys("t",100,300);
		i++;
	}
	utils.testF("error2 " + node.value);
	if (node.value != "א")
		utils.testF("error " + node.value);
	else
		utils.testF("Hebrew!!!");
	alert ("end");
	robot.sequence(function(){
		utils.testF("error3 " + node.value);
		doh.is("ltr","ltr","Direction of latin input");
		utils.testF("error4 " + node.value);
		
	}, 300);
}

utils.turnAutoPushON = function(robot, textBox) {
	if (!textBox.autoPush)
			doh.robot.keyPress(dojo.keys.NUMPAD_DIVIDE,200,{alt: true});
	robot.sequence(function(){
		if (!textBox.autoPush)
			textBox.autoPush = true;
	}, 300);
	
}
utils.turnAutoPushOFF = function(robot, textBox) {
	if (textBox.autoPush)
		doh.robot.keyPress(dojo.keys.NUMPAD_DIVIDE,200,{alt: true});
	robot.sequence(function(){
		if (textBox.autoPush)
			textBox.autoPush = false;
	}, 300);


}


