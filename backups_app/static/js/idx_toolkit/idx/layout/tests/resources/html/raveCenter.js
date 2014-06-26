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

	var rootNode = dom.byId("rave_center_container");
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
		      "id": "dData",
		      "fields": [
		        {
		          "id": "Regions",
		          "label": "Regions",
		          "categories": [
		            "Americas",
		            "Europe",
		            "Asia_AsiaPacific",
		            "Africa"
		          ]
		        },
		        {
		          "id": "Countries",
		          "label": "Conuntries",
		          "categories": [
		            "Nigeria",
		            "Ethiopia",
		            "Egypt",
		            "Democratic Republic of Congo",
		            "South Africa",
		            "China",
		            "India",
		            "Indonesia",
		            "Pakistan",
		            "Bangladesh",
		            "Russia",
		            "Germany",
		            "France",
		            "United Kingdom",
		            "Italy",
		            "United States",
		            "Brazil",
		            "Mexico",
		            "Colombia",
		            "Argentina"
		          ]
		        },
		        {"id": "Population", "label": "Population"},
		        {
		          "id": "Variance",
		          "label": "Variance of Infant Mortality from World Average",
		          "min": -50,
		          "max": 75
		        }
		      ],
		      "rows": [
		        [ 0, 15, 315, -42.33 ],
		        [ 0, 16, 198, -21.12 ],
		        [ 0, 17, 116, -27.78 ],
		        [ 0, 18, 47, -28.23 ],
		        [ 0, 19, 41, -32.63 ],
		        [ 1, 10, 142, -32.87 ],
		        [ 1, 11, 81, -45.19 ],
		        [ 1, 12, 63, -45.3 ],
		        [ 1, 13, 62, -44.02 ],
		        [ 1, 14, 60, -44.94 ],
		        [ 2, 5, 1353, -24.77 ],
		        [ 2, 6, 1258, 11.42 ],
		        [ 2, 7, 244, -14.59 ],
		        [ 2, 8, 179, 27.57 ],
		        [ 2, 9, 152, 11.29 ],
		        [ 3, 0, 166, 59.12 ],
		        [ 3, 1, 86, 37.47 ],
		        [ 3, 2, 83, -14.07 ],
		        [ 3, 3, 69, 71.99 ],
		        [ 3, 4, 50, 7.22 ]
		      ]
		    }
		  ],
		  "copyright": "(C) Copyright IBM Corp. 2011",
		  "grammar": [
		    {
		      "bounds": {"left": "0%", "top": "0%"},
		      "coordinates": {
		        "style": {
		          "fill": {"b": 211, "g": 211, "r": 211},
		          "outline": {"b": 0, "g": 0, "r": 0}
		        }
		      },
		      "elements": [
		        {
		          "type": "interval",
		          "label": [
		            {
		              "content": [ {"$ref": "Countries"} ],
		              "style": {
		                "align": "start",
		                "font": {"family": "Arial", "size": "7pt"},
		                "padding": 2,
		                "valign": "start"
		              }
		            }
		          ],
		          "data": {"$ref": "dData"},
		          "color": [
		            {
		              "field": {"$ref": "Variance"},
		              "mapping": [
		                {"at": "symmetricLower", "color": "green"},
		                {"at": 0, "color": "white"},
		                {"at": "symmetricUpper", "color": "red"}
		              ]
		            }
		          ],
		          "positioning": {
		            "layout": "squarify",
		            "leafOnly": false,
		            "levelLabelStyles": {
		              "internal": [
		                {
		                  "content": [ {"$ref": "Regions"} ],
		                  "style": {
		                    "fill": "black",
		                    "align": "start",
		                    "font": {
		                      "family": "Arial",
		                      "size": "10pt",
		                      "weight": "bold",
		                      "style": "italic"
		                    },
		                    "padding": 6,
		                    "valign": "start"
		                  }
		                },
		                {
		                  "content": [ {"$ref": "Population"} ],
		                  "style": {
		                    "fill": "black",
		                    "align": "end",
		                    "font": {
		                      "family": "Times New Roman",
		                      "size": "8pt",
		                      "weight": "normal"
		                    },
		                    "padding": 4,
		                    "valign": "end"
		                  }
		                }
		              ],
		              "leaf": {
		                "content": [ {"$ref": "Countries"} ],
		                "style": {
		                  "fill": "black",
		                  "align": "middle",
		                  "font": {
		                    "family": "Arial",
		                    "size": "10pt"
		                  },
		                  "padding": 2,
		                  "valign": "middle"
		                }
		              }
		            },
		            "levelStyles": {
		              "internal": [
		                {
		                  "stroke": {"width": 1.5},
		                  "outline": "black"
		                },
		                {
		                  "stroke": {"width": 1.1},
		                  "outline": "black"
		                }
		              ],
		              "leaf": {
		                "stroke": {"width": 0.4},
		                "outline": "white"
		              }
		            },
		            "levels": [
		              {"$ref": "Regions"},
		              {"$ref": "Countries"}
		            ],
		            "method": "treemap",
		            "padding": {
		              "bottom": 15,
		              "left": 15,
		              "right": 90,
		              "top": 15
		            },
		            "size": {"$ref": "Population"}
		          },
		          "tooltip": [
		            {
		              "content": [
		                "Region Of the World: ",
		                {"$ref": "Regions"},
		                "\nCountry: ",
		                {"$ref": "Countries"},
		                "\nPopulation: ",
		                {"$ref": "Population"},
		                "",
		                "\nMortality Rate Variance: ",
		                {"$ref": "Variance"},
		                ""
		              ]
		            }
		          ],
		          "style": {
		            "fill": {"b": 0, "g": 0, "r": 0},
		            "stroke": {"width": 0.5},
		            "outline": {"b": 0, "g": 0, "r": 0},
		            "padding": "2%"
		          }
		        }
		      ]
		    }
		  ],
		  "legends": [
		    {
		    "bounds": {
		        "width": "20%",
		        "height": "100%"
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
		  "size": {"width": 650, "height": 350},
		  "version": "1.3"
		};
        
        var widget = registry.byId("rave_center_container_visControl");
        widget.initRenderer().then(function(w){
            widget.setSpecification(vizJSON);
        });
        
		
		visOnMouseMove = function(dojoEvent) {
		    var interactivity = widget.getInteractivity();
		    var item = interactivity.getTooltipItem(dojoEvent.pageX, dojoEvent.pageY);
		    if (item != null) {
		        var tooltip = item.tooltipText();
		        tooltip && showFloatingTooltip(dojoEvent, tooltip);
		        return;
		    }
		    hideFloatingTooltip();
		}
		connect.connect(widget, "onMouseMove", this, visOnMouseMove);
		
		
		var tooltipDiv = null;
		showFloatingTooltip = function(event, txt) {
		    if (!tooltipDiv) 
		        makeToolTipDiv();
		    tooltipDiv.style.top = (event.pageY + 20)+ "px";
		    tooltipDiv.style.left = (event.pageX)+ "px";
		    tooltipDiv.style.display = "block"; 	
		    tooltipDiv.innerHTML = txt.replace(/\n/g, "<br/>"); 
		}
		
		hideFloatingTooltip = function()  {
		    if (tooltipDiv) 
		        tooltipDiv.style.display = "none";  		
		}
		
		makeToolTipDiv = function() {
		    tooltipDiv = document.createElement("div");
		    tooltipDiv.style.position = "absolute";
		    tooltipDiv.style.backgroundColor = "white";
		    tooltipDiv.style.display = "none";
		    tooltipDiv.style.zIndex = 1000; 
		    document.body.appendChild(tooltipDiv);
		}
        
        
        var zoomin = true;
	    visOnMouseClick = function(dojoEvent) { 
	    	var effects = widget.getChangeEffects();
			var effect = effects.makeTransitionEffect(1000);
			effects.setChangeEffect(effect, ChangeEffects.DEFAULT);
			
			var interactivity = widget.getInteractivity();
		    //axis, coordinates, element, frame, legend, and other
		    var items = interactivity.getItemsAtPointForType(dojoEvent.pageX, dojoEvent.pageY, "element");
		    // var items = interactivity.getItemsAtPointForType(dojoEvent.pageX, dojoEvent.pageY, "coordinates");
		    var value, rows, sceneItem, size;
		    if(items[0]){
		    	value = items[0].aestheticValues();
		    	rows = items[0].getRows();
			    sceneItem = items[0].sceneItem;
			    console.log(sceneItem)
			    size = {w:sceneItem.bounds.width, h:sceneItem.bounds.height};
		    }
		    
		    var item = interactivity.getTooltipItem(dojoEvent.pageX, dojoEvent.pageY);
		    var tooltip = value;
		    if (item != null) {
		        tooltip = item.tooltipText();
		    }
		    
	    	var panZoomAct = interactivity.getPanZoom();
	    	if(zoomin){
			    panZoomAct.scaleAroundCenter(1.6);
	    	}else{
	    		panZoomAct.reset();
		    	// widget.setSpecification(vizJSON);
	    		// flipcard.zoomTimeout && clearTimeout(flipcard.zoomTimeout);
			    // flipcard.zoomTimeout = setTimeout(function(){
			    // }, 1000);
	    	}
		    // panZoomAct.fitToCanvas();
		    zoomin = !zoomin;
		    
		    
		    flipcard.topicPublisherStub({title:tooltip,value:value,size:size}, "ravePopulation");
			flipcard.topicPublisherStub({title:tooltip,value:value,size:size}, "raveVariance");
		}
	    connect.connect(widget, "onClick", visOnMouseClick);
	    
	    
	    var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			vizJSON.size = {"width": size.w-50, "height": size.h-50};
			
			var effects = widget.getChangeEffects();
			var effect = effects.makeTransitionEffect(1000);
			//Transition, Fade-in, Fade-out, Fly-in, Grow, Reveal
			effects.setChangeEffect(effect, ChangeEffects.DEFAULT);
	    	widget.setSpecification(vizJSON);
		}, true);
	    
	    
        
        // vizJSON.data[0].rows = [];
		// var effects = widget.getChangeEffects();
		// var effect = effects.makeTransitionEffect(1000);
		// //Transition, Fade-in, Fade-out, Fly-in, Grow, Reveal
		// effects.setChangeEffect(effect, ChangeEffects.DEFAULT);
    	// widget.setSpecification(vizJSON);
        
    });
    
	
	
});