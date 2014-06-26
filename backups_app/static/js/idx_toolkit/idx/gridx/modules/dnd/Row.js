define([
	"dojo/_base/declare",
	"gridx/modules/dnd/Row",
	"./Avatar"
], function(declare, Row, Avatar){

	return declare([Row], {
		avatar: Avatar
	});
});
