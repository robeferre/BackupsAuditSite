define([
	"dojo/_base/declare",
	"gridx/support/GotoPagePane",
	"dojo/text!../../templates/GotoPagePane.html",
	"dojo/sniff"
], function(declare, GotoPagePane, goToTemplate, sniff){

	return declare(GotoPagePane, {
		templateString: goToTemplate,
		
		postCreate: function(){
			var t = this;
			if(sniff('ie') < 9){
				t.connect(t.domNode, 'onkeydown', '_onKeyDown');
			}

			setTimeout(function(){
				t.okBtn = t.dialog.buttons[0];
				t._updateStatus();
			}, 10);
		}
	});
});
