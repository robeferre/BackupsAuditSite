require([
	'dojo/parser',
	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-style',
	'dojo/dom-class',
	'dojo/dom-geometry',
	'dojo/dom-construct',
	'dojo/topic',
	'dojo/on',
	'dojo/aspect',
	'dojo/_base/connect',
	"dojo/_base/event", // event.stop
	'dojo/store/Memory',
	'dijit/registry',
	"com/ibm/init/ready",
	"com/ibm/vis/widget/VisControl",
	"com/ibm/vis/interaction/ChangeEffects", 
	"com/ibm/vis/interaction/ChangeEffect",
	"com/ibm/vis/interaction/EffectTarget"
], function(parser, dom, domAttr, domStyle, domClass, domGeometry, domConstruct, topic, on, aspect, connect, event, Memory, registry, 
		ready, VisControl, ChangeEffects, ChangeEffect, EffectTarget){

	var rootNode = dom.byId("rave_population_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	/*
	flipcard.topicPublisherStub({sourcedata: rawData}, "welcome_center", "detail");
	flipcard.topicPublisherStub({title:rawData.country, trend:rawData.trend.populationTrend}, "welcome_population");
	
	flipcardItem.processFlip();
	*/
	
	var pos = domGeometry.position(rootNode);
	
	ready(function(){
        parser.parse(rootNode);
        var vizJSON = {
		  "data": [
		    {
		      "id": "data",
		      "fields": [
		        {
		          "id": "date",
		          "label": "TimeLine",
		          "categories": [
						"Q1",
						"Q2",
						"Q3",
						"Q4"
					]
		        },
		        {"id": "values", "label": "Population"}
		      ],
		      "rows": [
		        [ 0, 50 ],
		        [ 1, 100 ],
		        [ 2, 80 ],
		        [ 3, 150 ]
		      ]
		    }
		  ],
		  "copyright": "(C) Copyright IBM Corp. 2011",
		  "grammar": [
		    {
		      "coordinates": {
		        "dimensions": [
		          {"axis": {}},
		          {"axis": {"minorStyle": {"fill": "navy"}}}
		        ]
		      },
		      "elements": [
		        {
		          "type": "line",
		          "position": [
		            {"field": {"$ref": "values"}},
		            {"field": {"$ref": "date"}}
		          ],
		          "style": {
		            "fill": "navy",
		            "stroke": {"width": 2},
		            "outline": {
		              "a": 0.5,
		              "b": 255,
		              "g": 255,
		              "r": 255
		            }
		          }
		        },
		        {
		          "type": "point",
		          "position": [
		            {"field": {"$ref": "values"}},
		            {"field": {"$ref": "date"}}
		          ],
		          "color": [
		            {"id": "colorId", "field": {"$ref": "values"}}
		          ],
		          "style": {"outline": "navy", "size": 20}
		        }
		      ]
		    }
		  ],
		  
		  "legendPosition": "bottom",
		  	"legends": [
			    {
			    "bounds": {
			        "width": "100%",
			        "height": "20%"
			      },
			      "content": [
			        {"text": [ " legend " ]},
			        {"layout": {
			            "flow": "horizontal",
			            "method": "stagger",
			            "reverse": false
			          }
			       	}
			      ],
			      "style": {"fill": "white"}
			    }
			  ],
		  	"size": {"width": 600.0, "height":350.0},
		  "version": "1.2"
		};
        
        var widget = registry.byId("rave_population_container_visControl");
        widget.initRenderer().then(function(w){
            widget.setSpecification(vizJSON);
        });
        
        var signal = aspect.after(flipcard, "topicProcess", function(rev_data){
			// rev_data.title
			
			vizJSON.legends[0].content[0].text = [rev_data.title.replace(/\n/g, "\t")];
			
			var squr = Math.sqrt(parseInt(rev_data.size.w*rev_data.size.h));
			for(var i = 0; i < vizJSON.data[0].rows.length; i++){
				vizJSON.data[0].rows[i][1] += squr + parseInt(Math.random()*squr/3)-(squr/6);
			}
			
			
			var effects = widget.getChangeEffects();
			var effect = effects.makeTransitionEffect(1000);
			//Transition, Fade-in, Fade-out, Fly-in, Grow, Reveal
			effects.setChangeEffect(effect, ChangeEffects.DEFAULT);
	    	widget.setSpecification(vizJSON);
		}, true);
		
		
		var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			vizJSON.size = {"width": size.w-50, "height": size.h-50};
			
			var effects = widget.getChangeEffects();
			var effect = effects.makeTransitionEffect(1000);
			//Transition, Fade-in, Fade-out, Fly-in, Grow, Reveal
			effects.setChangeEffect(effect, ChangeEffects.DEFAULT);
	    	widget.setSpecification(vizJSON);
		}, true);
        
    });
});