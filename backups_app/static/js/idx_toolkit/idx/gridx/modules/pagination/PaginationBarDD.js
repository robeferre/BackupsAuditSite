define([
	"dojo/_base/declare",
	"gridx/modules/pagination/PaginationBarDD",
	"idx/form/FilteringSelect",
	"idx/form/Select"
], function(declare, PaginationBarDD, FilteringSelect, Select){

	return declare(PaginationBarDD, {
		stepperClass: FilteringSelect,

		sizeSwitchClass: Select,

		stepperProps: {
			fieldWidth: '55px'
		}
	});
});

