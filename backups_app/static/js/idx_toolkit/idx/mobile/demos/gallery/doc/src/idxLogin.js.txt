define(["dijit/registry",
	 "dojox/mobile",
	 "dojox/mobile/parser",
	 "dojox/mobile/Button",
	 "dojox/mobile/ContentPane",
	 "dojox/mobile/Heading",
	 "dojox/mobile/ScrollableView",
	 "idx/mobile/Login"],
  function(_registry){
  	show_login = null, registry = null;
	
	return {
		init: function(){
			registry = _registry;
			
			show_login = function(){
				registry.byId("logindialog").show();
			}
			
			handle_login = function(dialog, name, password){
				// for demo, handle various special user name values
				switch(name){
					case 'f-immediate':
						dialog.showMessage("The user name or password is not correct. Please enter a valid user name and password.");
						break;
						
					case 's-immediate':
						dialog.hide();
						console.log("(immediate) Login successful, name='" + name + "', password='" + password + "''");
						break;
						
					case 'f-slow':
						setTimeout(function(){
							dialog.showMessage("(slow asynchronous) The user name '" + name + "' or password is not correct. Please enter a valid user name and password.");
						}, 4000);
						break;
					
					case 's-slow':
						setTimeout(function(){
							dialog.hide();
							console.log("(slow asynchronous) Login successful, name='" + name + "', password='" + password + "''");
						}, 4000);
						break;
						
					case 'f-fast':
						setTimeout(function(){
							dialog.showMessage("(fast asynchronous) The user name '" + name + "' or password is not correct. Please enter a valid user name and password.");
						}, 100);
						break;
					
					case 's-fast':
					default:
						setTimeout(function(){
							dialog.hide();
							console.log("(fast asynchronous) Login successful, name='" + name + "', password='" + password + "''");
						}, 100);
						break;
				}
			}
		}
	};
});
