define([
	"dojo/_base/declare",
	"gridx/modules/dnd/Column",
	"./Avatar"
], function(declare, Column, Avatar){

	return declare([Column], {
		avatar: Avatar
	});
});
