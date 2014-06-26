require([
	'dojo/_base/lang',
	'dojo/parser',
	'dojo/dom',
	'dojo/topic',
	'dojo/on',
	"dojo/_base/event", // event.stop
	'dojo/store/Memory',
	'dijit/registry',
	'idx/gridx/tests/support/data/ComputerData',
	'idx/gridx/tests/support/stores/Memory',
	'dijit/form/Button',
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/modules/Focus',
	'gridx/modules/RowHeader',
	'gridx/modules/select/Row',
	'gridx/modules/select/Column',
	'gridx/modules/select/Cell',
	'gridx/modules/VirtualVScroller'
], function(lang, parser, dom, topic, on, event, Memory, registry, dataSource, storeFactory, Button, Grid, Cache, 
		Focus, RowHeader, SelectRow, SelectColumn, SelectCell, VirtualVScroller){

	layout = [
		{id:'country', name: 'Country', field: 'country'},
		{id:'gdp', name: 'GDP', field: 'gdp'},
		{id:'growth', name: 'Growth', field: 'growth'},
		{id:'population', name: 'Population', field: 'population'},
		{id:'area', name: 'Area', field: 'area'},
		{id:'inflation', name: 'Inflation', field: 'inflation'},
		{id:'detail', name: 'Details', field: 'detail',
			decorator: function(){
				//Generate cell widget template string
				return "<a href='javascript:void(0)'>Details</a>";
			}
		}
	];
	
	store = new Memory({
		data: {
			identifier: "country",
			items: [
				{ country: "China", gdp: 5, growth: 6, population: 16, area: 10, inflation: 120, trend: {
					gdpTrend: [5, 6, 8, 9, 10, 12],
					growthTrend: [6, 12, 16, 25, 28, 30],
					populationTrend: [16, 18, 25, 30, 40, 50]
				}},
				{ country: "France", gdp: 2, growth: 9, population: 5, area: 12, inflation: 180, trend: {
					gdpTrend: [2, 6, 8, 10, 10, 12],
					growthTrend: [9, 10, 18, 19, 20, 22],
					populationTrend: [5, 6, 8, 9, 10, 12]
				}},
				{ country: "USA", gdp: 3, growth: 11, population: 1, area: 3, inflation: 280, trend: {
					gdpTrend: [3, 6, 8, 10, 10, 12],
					growthTrend: [11, 15, 18, 19, 20, 22],
					populationTrend: [1, 3, 8, 9, 10, 12]
				}},
				{ country: "Japan", gdp: 8, growth: 3, population: 3, area: 4, inflation: 200, trend: {
					gdpTrend: [8, 9, 10, 15, 16, 19],
					growthTrend: [3, 5, 18, 19, 20, 22],
					populationTrend: [3, 6, 8, 9, 10, 12]
				}},
				{ country: "Korean", gdp: 1, growth: 3, population: 8, area: 5, inflation: 150, trend: {
					gdpTrend: [1, 3, 8, 10, 10, 12],
					growthTrend: [3, 5, 18, 19, 20, 22],
					populationTrend: [8, 9, 12, 12, 15, 19]
				}},
				{ country: "Canada", gdp: 2, growth: 2, population: 8, area: 1, inflation: 150, trend: {
					gdpTrend: [2, 6, 8, 10, 10, 12],
					growthTrend: [2, 10, 18, 19, 20, 22],
					populationTrend: [8, 16, 18, 19, 20, 22]
				}}
			]
		}
	});
	
	if(this.welcome_grid){
		this.welcome_grid.destroy();
	}
	
	this.welcome_grid = new Grid({
		store: store,
		structure: layout,
		cacheClass: Cache,
		autoHeight: true,
		selectRowTriggerOnCell: true,
		modules: [
			Focus,
			RowHeader,
			SelectRow,
			SelectColumn,
			VirtualVScroller
		]
	});
	this.welcome_grid.placeAt('welcome_center_container');
	this.welcome_grid.startup();	

	this.welcome_grid.connect(this.welcome_grid, "onRowClick", lang.hitch(this, function(evt){
		var row = this.welcome_grid.row(evt.rowId);
		
		var encWidget = this.welcome_grid.getParent();
		var rawData = row.rawData();
		encWidget.topicPublisherStub({sourcedata: rawData}, "welcome_center", "detail");
		
		encWidget.topicPublisherStub({title:rawData.country, trend:rawData.trend.populationTrend}, "welcome_population");
		encWidget.topicPublisherStub({title:rawData.country, trend:rawData.trend.growthTrend}, "welcome_growth");
		encWidget.topicPublisherStub({title:rawData.country, trend:rawData.trend.gdpTrend}, "welcome_gdp");
		
		encWidget.topicPublisherStub({title:rawData.country, trend:rawData.trend.growthTrend}, "welcome_growth", "detail");
		
		// event.stop(evt);
	}));
	
	this.welcome_grid.connect(this.welcome_grid, "onCellClick", lang.hitch(this, function(evt){
		if(evt.columnId == "detail"){
			// var detailContent = this.welcome_grid.model.byId(evt.rowId).rawData.detail;
			var encWidget = this.welcome_grid.getParent();
			var flipcardItem = encWidget.getParent();
			flipcardItem.processFlip();
		}
		event.stop(evt);
	}));
	
	setTimeout(lang.hitch(this, function(){
		on.emit(this.welcome_grid.row(0).node(), "click", {
			bubbles: true,
			cancelable: true
		});
	}), 600);
	
});