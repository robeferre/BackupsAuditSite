define(["dojo/_base/declare", "dojo/has", "dojox/grid/EnhancedGrid"], function(declare, has , grid){

	return declare("idx.bidi.visual.EnhancedGridVisBidi",[grid],{
		isVisualMode: false,
        dir: 'ltr',

		postCreate: function(){
        	             
			if (this.structure) {
				for (var s = 0; s < this.structure.length; s++) {
					var view = this.structure[s];
					for (var v = 0; v < view.length; v++) {
						var cell = view[v];
						if (cell.name)
							cell.name = "<bdo dir='" + this.dir + "'>" + cell.name + "</bdo>";
						if (cell.formatter)
							cell.userFormatterStored = cell.formatter;
							cell.formatter = function (item, rowIndx, cellObj){
								if (cellObj._props.userFormatterStored)
									item = cellObj._props.userFormatterStored.apply(item, [item, rowIndx, cellObj]);
								if ( typeof(item) == "string" && this.grid.isVisualMode) {
									return "<bdo dir='" + this.grid.dir + "'>" + item + "</bdo>";
								}
								return item;
							}
					}
					if (view.field){
						if (view.formatter)
							view.userFormatterStored = view.formatter;
							view.formatter = function (item, rowIndx, cellObj){
								if (cellObj._props.userFormatterStored)
									item = cellObj._props.userFormatterStored.apply(item, [item, rowIndx, cellObj]);
								if ( typeof(item) == "string" && this.grid.isVisualMode) {
									return "<bdo dir='" + this.grid.dir + "'>" + item + "</bdo>";
								}
								return item;
							}
					}
					if (view.name)
							view.name = "<bdo dir='" + this.dir + "'>" + view.name + "</bdo>";
				}
			}
			this.inherited(arguments);    
			
		}

	});
}); 