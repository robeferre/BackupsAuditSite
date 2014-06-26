if(window.parent && window.parent.test_dir){
	document.documentElement.dir = window.test_dir = window.parent.test_dir;
}

function test_alert(message){
	var popup = window.open("", "", "width=400, height=200");
	popup.document.write(message);
	if(window.test_dir){
		popup.document.documentElement.dir = window.test_dir;
	}
}
