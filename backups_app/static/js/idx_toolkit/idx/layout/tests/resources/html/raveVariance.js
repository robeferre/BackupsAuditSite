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

	var rootNode = dom.byId("rave_variance_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	var pos = domGeometry.position(rootNode);
	
	ready(function(){
        parser.parse(rootNode);
        var vizJSON = {
			"copyright": "(C) Copyright IBM Corp. 2013",
			"version": "1.2",
			"data": [{
				"id": "dDelimitedFileSource",
				"fields": [
					{
						"id": "fCategories",
						"label": "TimeLine",
						"categories": [
							"Jan",
							"Feb",
							"Mar",
							"Apr",
							"May",
							"Jun",
							"Jul",
							"Aug",
							"Sep",
							"Oct",
							"Nov",
							"Dec"
						]
					},
					{
						"id": "fValues",
						"label": "trend"
					}
				],
				"rows": [
					[0,0],
					[1,2],
					[2,4],
					[3,5],
					[4,7],
					[5,8],
					[6,5],
					[7,3],
					[8,6],
					[9,6],
					[10,10],
					[11,12]
				]
			}],
			"grammar": [{
				"coordinates": {"dimensions": [
					{"axis": {"title": [{"$ref": "fValues"}]}},
					{"axis": {"title": [{"$ref": "fCategories"}]}}
				]},
				"elements": [{
					"type": "interval",
					"data": {"$ref": "dDelimitedFileSource"},
					"position": [
						{"field": {"$ref": "fValues"}},
						{"field": {"$ref": "fCategories"}}
					],
					"tooltip": [
			            {"content": [ {"$ref": "fValues"} ]}
			          ],
			          "style": {
			            "fill": {
			              "type": "linear",
			              "angle": 180.0,
			              "colors": [
			                {
			                  "color": {"b": 150, "g": 57, "r": 1},
			                  "offset": 0.0
			                },
			                {
			                  "color": {
			                    "a": 0.2,
			                    "b": 0,
			                    "g": 0,
			                    "r": 0
			                  },
			                  "offset": 1.0
			                }
			              ]
			            },
			            "width": "80%",
			            "cornerRadius": "10",
			            "outline": {"a": 0.0, "b": 0, "g": 0, "r": 0}
			          }
				}],
				"style": {
			        "fill": {
			          "type": "linear",
			          "angle": 135.0,
			          "colors": [
			            {
			              "color": {"b": 255, "g": 221, "r": 221},
			              "offset": 0.0
			            },
			            {
			              "color": {"b": 255, "g": 255, "r": 255},
			              "offset": 1.0
			            }
			          ]
			        },
			        "stroke": {"width": 0.5},
			        "cornerRadius": "10",
			        "outline": {"b": 0, "g": 0, "r": 0}
			      }
			}],
			"legendPosition": "right",
		  	"legends": [
			    {
			    "bounds": {
			        "width": "20%",
			        "height": "50%"
			      },
			      "content": [
			        {"text": [ " legend " ]}
			        
			      ],
			      "style": {"fill": "white"}
			    }
			  ],
		  	"size": {"width": 600.0, "height":350.0}
		};
        
        var widget = registry.byId("rave_variance_container_visControl");
        widget.initRenderer().then(function(w){
            widget.setSpecification(vizJSON);
        });
        
        var signal = aspect.after(flipcard, "topicProcess", function(rev_data){
			// rev_data.title
			
			vizJSON.legends[0].content[0].text = [rev_data.title];
			
			for(var i = 0; i < vizJSON.data[0].rows.length; i++){
				vizJSON.data[0].rows[i][1] += parseInt(rev_data.value) + parseInt(Math.random()*30)-15;
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