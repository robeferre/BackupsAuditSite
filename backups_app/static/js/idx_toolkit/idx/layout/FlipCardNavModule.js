define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom-geometry",
	"dojo/query",
	"dojo/touch",
	"dojo/on",
	"dojo/keys",
	"dijit/focus",
	"dijit/a11y",
	"gridx/core/_Module",
	"idx/layout/_FlipCardUtils"
], function(kernel, declare, lang, array, event, domConstruct, domClass, domStyle, domAttr, domGeometry, 
            query, touch, on, keys, focus, a11y, _Module, _FlipCardUtils){
	kernel.experimental('gridx/modules/FlipCardNavModule');

/*=====
		// buttonColumnWidth: String
		//		Width of the drill-down column. Same format as column width in column definition.
		buttonColumnWidth: '20px',

		// buttonColumnArgs: Object
		//		The drill-down column can be customized by providing extra column definition parameters here.
		buttonColumnArgs: null
	});

=====*/

	var transitionDuration = 1000;

	function moveNodes(bn, tmpBn){
		while(bn.childNodes.length){
			tmpBn.appendChild(bn.firstChild);
		}
	}

	var nextLevelButtonColumnId = '__nextLevelButton__';

	return declare(_Module, {
		name: "FlipCardNavModule",

		buttonColumnWidth: '20px',
		
		rootNavId: '', //sync to root layer id
		rootNavName: '__ROOT__',

		constructor: function(){
			var t = this,
				g = t.grid,
				focus = g.focus,
				n = t._tmpBodyNode = document.createElement('div'),
				cn = t._contextNode = document.createElement('div'),
				wrapper1 = t._wrapper1 = document.createElement('div'),
				wrapper2 = t._wrapper2 = document.createElement('div'),
				underlay = t._underlay = document.createElement('div');
			
			domClass.add(n, 'gridxBody');
			domClass.add(cn, 'gridxLayerContext');
			domClass.add(wrapper1, 'gridxLayerWrapper');
			domClass.add(wrapper2, 'gridxLayerWrapper');
			domClass.add(underlay, 'gridxLayerUnderlay');
			t._parentStack = [];
			// t.connect(cn, touch.press, 'up');
			t.connect(cn, touch.press, 'stack');
			//a11y
			t.connect(cn, "keydown", lang.hitch(t, function(evt){
				if(evt.keyCode == keys.ENTER){
					t.stack(evt);
				}
			}));
			function updateColumnWidth(node){
				var columnId = node.getAttribute('colid');
				var headerNode = g.header.getHeaderNode(columnId);
				node.style.width = headerNode.style.width;
				node.style.minWidth = headerNode.style.minWidth;
				node.style.maxWidth = headerNode.style.maxWidth;
			}
			t.aspect(g.columnWidth, 'onUpdate', function(){
				query('.gridxCell', wrapper1).forEach(updateColumnWidth);
				query('.gridxCell', wrapper2).forEach(updateColumnWidth);
				query('.gridxCell', underlay).forEach(updateColumnWidth);
				if(cn.firstChild){
					cn.style.height = cn.firstChild.offsetHeight + 'px';
				}
			});

			var w = t.arg('buttonColumnWidth');
			var col = t._col = lang.mixin({
				id: nextLevelButtonColumnId,
				headerStyle: 'text-align:center;',
				style: function(cell){
					return 'text-align:center;' + (cell.model.hasChildren(cell.row.id) ? 'cursor:pointer;' : '');
				},
				rowSelectable: false,
				sortable: false,
				filterable: false,
				editable: false,
				padding: false,
				ignore: true,
				declaredWidth: w,
				width: w,
				decorator: function(data, rowId){
					if(t.model.hasChildren(rowId)){
						return '<div class="gridxLayerHasChildren"></div>';
					}
					return '';
				}
			}, t.arg('buttonColumnArgs') || {});
			t._onSetColumns();
			t.aspect(g, 'setColumns', '_onSetColumns');
			t.aspect(g, 'setStore', function(){
				t._parentStack = [];
				wrapper1.innerHTML = wrapper2.innerHTML = underlay.innerHTML = '';
				if(cn.firstChild){
					cn.removeChild(cn.firstChild);
					cn.style.height = 0;
					g.vLayout.reLayout();
				}
			});

			function onDrillDown(e){
				if(e.columnId == nextLevelButtonColumnId){
					if(query(".gridxLayerHasChildren", e.cellNode).length > 0){
						g.focus.focusArea('header');
						setTimeout(function(){
							t.down(e.rowId, e);
						}, 0);
					}else{
						//blur the focus
						// setTimeout(lang.hitch(t, function(){
							// domClass.remove(e.cellNode, "gridxCellFocus gridxLayerCellFocus");
						// }), 100);
					}
				}
			}
			if(g.touch){
				t.aspect(g, 'onCellTouchStart', onDrillDown);
			}
			t.aspect(g, 'onCellMouseDown', onDrillDown);
			t.aspect(g, 'onCellKeyDown', lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ENTER){
					onDrillDown.apply(this, arguments);
				}
			}));
			
			focus.registerArea({
				name: 'layerContext',
				priority: 0,
				focusNode: t._contextNode,
				scope: t,
				doFocus: t._doFocus,
				onFocus: t._onFocus,
				doBlur: t._doBlur,
				onBlur: t._onBlur,
				connects: [
					// t.aspect(g, 'onHeaderKeyDown', '_onKey'),
					t.connect(t._contextNode, 'onkeydown', '_onKey'),
					t.connect(t._contextNode, 'onblur', '_doBlur')
				]
			});
			
			// t.aspect(g, 'onHeaderKeyDown', '_onKey');
		},
		
		_clearTabNodes: function(e){
			var t = this;
			//clear
			array.forEach(t._tabNavNodes, function(node){
				domClass.remove(node, "gridxCellFocus gridxLayerCellFocus");
			}, t);
		},
		
		_doBlur: function(e){
			var t = this;
			
			t._clearTabNodes(e);
			
			return true;
		},
	
		_onBlur: function(e){
			if(e && e.target){
				var node = e.target;
				//TODO
				return node;
			}
		},
		
		_doFocus: function(e){
			var t = this;
			
			t._tabNavNodes = query('td.gridxCell', t._contextNode);
			
			if(t._tabNavNodes && t._tabNavNodes.length > 0){
				t._moveFocus(0, 0);
			}
			
			return true;
		},
	
		_onFocus: function(e){
			if(e && e.target){
				var node = e.target;
				//TODO
				return node;
			}
		},
		
		_onKey: function(e){
			if(!this.grid._isCtrlKey(e) && !e.shiftKey && !e.altKey){
				var ltr = this.grid.isLeftToRight(),
					nextKey = ltr ? keys.RIGHT_ARROW : keys.LEFT_ARROW,
					prevKey = ltr ? keys.LEFT_ARROW : keys.RIGHT_ARROW,
					downKey = ltr ? keys.DOWN_ARROW : keys.UP_ARROW,
					upKey = ltr ? keys.UP_ARROW : keys.DOWN_ARROW;
				if(e.keyCode == nextKey || e.keyCode == downKey){
					this._moveFocus(1);
					event.stop(e);
				}else if(e.keyCode == prevKey || e.keyCode == upKey){
					this._moveFocus(-1);
					event.stop(e);
				}
			}
		},
	
		_moveFocus: function(dif, index){
			var t = this;
			
			//clear
			t._clearTabNodes();
			
			var idx = (t._curTabNavIdx + dif + t._tabNavNodes.length) % t._tabNavNodes.length;
			if(typeof index == "number"){
				idx = index;
			}
			if(t._tabNavNodes[idx]){
				focus.focus(t._tabNavNodes[idx]);
				domClass.add(t._tabNavNodes[idx], "gridxLayerCellFocus");
				t._curTabNavIdx = idx;
			}
		},
		
		_cloneParentRowNode: function(pNode){
			var clonedNode = pNode.cloneNode(true);
			query('td.gridxCell', clonedNode).forEach(function(subNode){
                domClass.remove(subNode, "gridxCellFocus gridxLayerCellFocus");
                
                if(domAttr.get(subNode,'colid') == nextLevelButtonColumnId){
                    //TODO
                }
                domAttr.set(subNode, "tabIndex", 0);
            });
            
            return clonedNode;
		},

		_mockRowNode: function(sampleNode, content){
			var t = this,
				mockRoot;
			if(sampleNode){
				mockRoot = sampleNode.cloneNode(true);
				domAttr.set(mockRoot, {
	                parentid:'', rowindex:'',rowid:'',visualindex:''
	            });
	            query('td.gridxCell', mockRoot).forEach(function(subNode){
	            	domClass.remove(subNode, "gridxCellFocus gridxLayerCellFocus");
	                if(domAttr.get(subNode,'colid') == nextLevelButtonColumnId){
	                    return;
	                }
	                domAttr.set(subNode, {
	                	tabIndex: 0,
	                    innerHTML: content || t.rootNavName
	                });
	            });
			}else{
				mockRoot = domConstruct.create('div', {});
				domClass.add(mockRoot, 'gridxRow');
			}
			
            return mockRoot;
		},
		
		
		preload: function(){
			this.grid.vLayout.register(this, '_contextNode', 'headerNode', 10);
		},

		onReady: function(){},
		onFinish: function(){},

		down: function(id, e){
			e && event.stop(e);
			
			var t = this,
				m = t.model,
				g = t.grid,
				focus = g.focus;
			
			if(!t._lock && m.hasChildren(id) && String(m.parentId(id)) === String(m.layerId())){
				t._lock = 1;
				var g = t.grid,
					bn = g.bodyNode,
					// w = bn.offsetWidth,
					h = bn.offsetHeight,
					tmpBn = t._tmpBodyNode,
					wrapper1 = t._wrapper1,
					wrapper2 = t._wrapper2,
					underlay = t._underlay,
					parentRowNode = g.body.getRowNode({ rowId: id }),
					pos = domGeometry.position(parentRowNode),
					refPos = domGeometry.position(t._contextNode);
					
					
				var	cloneParent = t._cloneParentRowNode(parentRowNode);

				domClass.add(parentRowNode, 'gridxLayerLoading');

				wrapper2.appendChild(cloneParent);
				underlay.appendChild(t._mockRowNode(cloneParent, "   "));
				t._parentStack.push(cloneParent);
				cloneParent._pos = g.vScroller.position();
				t._bodyScrollTop = bn.scrollTop;
				moveNodes(bn, tmpBn);

				// bn.style.left = w + 'px';
				bn.style.top = (-h + pos.h) + 'px';
				bn.style.zIndex = 1;
				// tmpBn.style.left = 0;
				tmpBn.style.top = 0;
				tmpBn.style.zIndex = -1;
				wrapper1.style.zIndex = -1;
				wrapper2.style.top = (pos.y - refPos.y) + 'px';
				wrapper2.style.zIndex = 2;
				underlay.style.height = (pos.y - refPos.y) + 'px';
				underlay.style.zIndex = 1;
				
				g.vScrollerNode.style.zIndex = 9999;

				m.setLayer(id);
				t._refresh(function(){
					domClass.remove(parentRowNode, 'gridxLayerLoading');
					wrapper2.style.zIndex = 9999;
					underlay.style.zIndex = 9990;
					g.vScroller.scroll(0);
					domClass.add(wrapper1, 'gridxLayerVSlide');
					domClass.add(wrapper2, 'gridxLayerVSlide');
					domClass.add(underlay, 'gridxLayerVSlide');
					// bn.style.left = 0;
					// tmpBn.style.left = -w + 'px';
					// wrapper1.style.left = -w + 'px';
					bn.style.top = 0;
                    tmpBn.style.top = -10*h + 'px';
					wrapper1.style.top = 0 + 'px';
					wrapper2.style.top = 0 + 'px';
					underlay.style.height = 0 + 'px';
				}, {
					isDown: true,
					rowId: id,
					parentRowNode: cloneParent
				});
			}
		},
		
		stack: function(){
		    var t = this,
                m = t.model,
                g = t.grid,
				focus = g.focus;
           
            if(!t._lock && m.isId(m.layerId())){
                t._lock = 1;
                var g = t.grid,
                    bn = g.bodyNode,
                    tmpBn = t._tmpBodyNode,
                    h = bn.offsetHeight,
                    wrapper1 = t._wrapper1,
                    wrapper2 = t._wrapper2,
                    underlay = t._underlay,
                    contextNode = t._contextNode,
                    currentParentRowNode = t._parentStack[t._parentStack.length - 1],
                    parentId = currentParentRowNode.getAttribute('rowid');
                   
                //build mock root node 
                var mockRoot = t._mockRowNode(currentParentRowNode, t.rootNavName); 
                
                for(var i = t._parentStack.length -2; i > -1; i--){
                    domConstruct.place(t._parentStack[i], wrapper1, 'first');
                }
                domConstruct.place(mockRoot, wrapper1, 'first');
                
                t._bodyScrollTop = bn.scrollTop;

                var offsetHeights = 0;
                array.forEach(t._parentStack, function(itemNode){
                    var itemId = domAttr.get(itemNode,'rowid');
                    t.connect(itemNode, touch.press, lang.hitch(t, 'up', itemId));
                    //a11y
					t.connect(itemNode, "keydown", lang.hitch(t, function(id, evt){
						if(evt.keyCode == keys.ENTER){
							t.up(id, evt);
						}
					}, itemId));
                    
                    offsetHeights += itemNode.offsetHeight;
                });
                t.connect(mockRoot, touch.press, lang.hitch(t, 'up', t.rootNavId));
                //a11y
				t.connect(mockRoot, "keydown", lang.hitch(t, function(id, evt){
					if(evt.keyCode == keys.ENTER){
						t.up(id, evt);
					}
				}, t.rootNavId));

                offsetHeights += mockRoot.offsetHeight; 
                
                domClass.add(contextNode, 'gridxLayerContextVSize');
                domStyle.set(contextNode, {
                    height: offsetHeights + 'px'
                });
                setTimeout(function(){
                    domClass.remove(contextNode, 'gridxLayerContextVSize');
                    t._lock = 0;
                }, transitionDuration);
                
                g.focus.focusArea('layerContext');
            }
		},
		
		up: function(id, e){
			e && event.stop(e);
			var t = this,
				m = t.model,
                g = t.grid,
				focus = g.focus;
				
			if(!t._lock && m.isId(m.layerId())){
				t._lock = 1;
				var g = t.grid,
					bn = g.bodyNode,
					tmpBn = t._tmpBodyNode,
					// w = bn.offsetWidth,
					h = bn.offsetHeight,
					wrapper1 = t._wrapper1,
					wrapper2 = t._wrapper2,
					underlay = t._underlay,
					contextNode = t._contextNode;
				
				var currentParentRowNode, parentId, pos, refPos;

				if(id == t.rootNavId){
					currentParentRowNode = null;
    				parentId = '';
    				pos = domGeometry.position(t._parentStack[0]);
    				refPos = domGeometry.position(contextNode);

					// wrapper2.appendChild(t._mockRowNode(t._parentStack[0], t.rootNavName));

					t._parentStack = [];
				}else{
					var tempParentStack = [];
	    			for(var i = 0; i <= t._parentStack.length-1; i++){
	    			     var itemNode = t._parentStack[i];
	    			     var itemId = domAttr.get(itemNode,'rowid');
	    			     tempParentStack.push(itemNode);
	    			     if(itemId == id){
	    			         break;
	    			     }
	                }
	                
	    			currentParentRowNode = tempParentStack[tempParentStack.length - 1];
    				parentId = currentParentRowNode.getAttribute('rowid');
    				pos = domGeometry.position(currentParentRowNode);
    				refPos = domGeometry.position(contextNode);
	    			
	    			t._parentStack = [];	
	    			for(var i = 0; i <= tempParentStack.length-1; i++){
	                     t._parentStack.push(tempParentStack[i].cloneNode(true));
	                }
	    			
	    			var currentParentRowNodeClone = t._parentStack[t._parentStack.length - 1];

	                wrapper2.appendChild(currentParentRowNodeClone);
	                underlay.appendChild(t._mockRowNode(currentParentRowNodeClone, "   "));
				}
    			

				t._bodyScrollTop = bn.scrollTop;
				moveNodes(bn, tmpBn);

				// bn.style.left = -w + 'px';
				bn.style.top = (-h + pos.h) + 'px';
				bn.style.zIndex = 0;
				// tmpBn.style.left = 0;
				tmpBn.style.top = 0;
				tmpBn.style.zIndex = -1;
				// wrapper1.style.top = pos.h + 'px';
				wrapper1.style.zIndex = -1;
				// wrapper2.style.left = -w + 'px';
				wrapper2.style.top = (pos.y - refPos.y) + 'px';
				wrapper2.style.zIndex = 2;
				underlay.style.height = (pos.y - refPos.y) + 'px';
				underlay.style.zIndex = 1;
				g.vScrollerNode.style.zIndex = 9999;
				

                // console.log(m.treePath(m.layerId()));
				m.setLayer(id);
				t._refresh(function(){
					//clear the mockup nodes
					while(wrapper1.childNodes.length){
						wrapper1.removeChild(wrapper1.firstChild);
					}
					wrapper2.style.zIndex = 9999;
					underlay.style.zIndex = 9990;

					domClass.add(wrapper1, 'gridxLayerVSlide');
					domClass.add(wrapper2, 'gridxLayerVSlide');
					domClass.add(underlay, 'gridxLayerVSlide');
					// bn.style.left = 0;
					// tmpBn.style.left = w + 'px';
					bn.style.top = 0;
                    tmpBn.style.top = -10*h + 'px';
					// wrapper1.style.top = 0 + 'px';
					// wrapper2.style.left = 0;
					wrapper2.style.top = 0 + 'px';
					underlay.style.height = 0 + 'px';
					
					// domClass.add(contextNode, 'gridxLayerContextVSize');
                    // domStyle.set(contextNode, {
                        // height: pos.h + 'px'
                    // });
                    // setTimeout(function(){
                        // domClass.remove(contextNode, 'gridxLayerContextVSize');
                    // }, transitionDuration);
                    
				}, {
                    isUp: true,
                    rowId: id,
                    parentRowNode: currentParentRowNode
                })
			}
		},

		//Private--------------------------------------------------------------------
		_onSetColumns: function(){
			var g = this.grid,
				col = this._col;
			col.index = g._columns.length;
			g._columns.push(col);
			g._columnsById[col.id] = col;
		},

		_onTransitionEnd: function(){
			var t = this,
				m = t.model,
				g = t.grid,
				mainNode = g.mainNode,
				bn = g.bodyNode,
				tmpBn = t._tmpBodyNode,
				// w = bn.offsetWidth,
				h = bn.offsetHeight,
				contextNode = t._contextNode,
				wrapper1 = t._wrapper1,
				wrapper2 = t._wrapper2,
				underlay = t._underlay;
			if(t._lock){
				mainNode.removeChild(tmpBn);
				mainNode.removeChild(wrapper1);
				contextNode.appendChild(wrapper2);
				contextNode.appendChild(underlay);
				contextNode.style.height = wrapper2.offsetHeight + 'px';
				domClass.remove(tmpBn, 'gridxSlideRefresh');
				domClass.remove(bn, 'gridxSlideRefresh');
				domClass.remove(wrapper1, 'gridxLayerHSlide gridxLayerVSlide');
				domClass.remove(wrapper2, 'gridxLayerHSlide gridxLayerVSlide');
				domClass.remove(underlay, 'gridxLayerHSlide gridxLayerVSlide');
				
				while(wrapper1.childNodes.length){
					wrapper1.removeChild(wrapper1.firstChild);
				}
				while(underlay.childNodes.length){
					underlay.removeChild(underlay.firstChild);
				}
				
				var tmp = t._wrapper1;
				t._wrapper1 = t._wrapper2;
				t._wrapper2 = tmp;
				

				// wrapper1.style.left = 0;
				wrapper1.style.left = 0;
				wrapper1.style.zIndex = '';
				wrapper1.style.top = 0;
				wrapper2.style.left = 0;
				wrapper2.style.zIndex = '';
				wrapper2.style.top = 0;
				underlay.style.left = 0;
				underlay.style.zIndex = '';
				underlay.style.top = 0;
				bn.style.paddingTop = 0;
				bn.style.zIndex = '';
				tmpBn.style.paddingTop = 0;
				tmpBn.style.zIndex = '';
				g.vScrollerNode.style.zIndex = '';

				g.vLayout.reLayout();
				for(var i = 0; i < tmpBn.childNodes.length; ++i){
					var rowId = tmpBn.childNodes[i].getAttribute('rowid');
					if(m.isId(rowId)){
						g.body.onUnrender(rowId);
					}
				}
				tmpBn.innerHTML = '';
				g.body._skipUnrender = 0;
				t._lock = 0;
			}
		},

		_refresh: function(callback, args){
			var t = this,
				g = t.grid,
				bn = g.bodyNode,
				tmpBn = t._tmpBodyNode,
				frag = document.createDocumentFragment();
			
			
			frag.appendChild(tmpBn);
			frag.appendChild(t._wrapper1);
			frag.appendChild(t._wrapper2);
			frag.appendChild(t._underlay);
			g.mainNode.appendChild(frag);
			tmpBn.scrollTop = t._bodyScrollTop;
			tmpBn.style.paddingTop = t._wrapper1.offsetHeight + 'px';
			bn.style.paddingTop = t._wrapper2.offsetHeight + 'px';
			t._contextNode.style.height = 0;
			//temparary disable paging
			t._paging = g.view.paging;
			g.view.paging = 0;
			g.vLayout.reLayout();
			if(args.isDown){
				query('.gridxLayerHasChildren', args.parentRowNode).
					removeClass('gridxLayerHasChildren').
					addClass('gridxLayerLevelUp');
			}else if(args.parentRowNode){
				// query('.gridxLayerLevelUp', args.parentRowNode).
					// removeClass('gridxLayerLevelUp').
					// addClass('gridxLayerHasChildren');
			}
			t.onReady(args);
			g.body._skipUnrender = 1;
			if(args.isDown){
				g.vScroller._lock = 1;
			}
			focusEnabled = g.focus.enabled;
			g.focus.enabled = 0;
			g.body.refresh().then(function(){
				g.vScroller._lock = 0;
				g.view.paging = t._paging;
				setTimeout(function(){
					domClass.add(bn, 'gridxSlideRefresh');
					domClass.add(tmpBn, 'gridxSlideRefresh');
					if(g.vScroller._scrollable){
						g.vScroller._scrollable.scrollTo({x: 0});
					}
					callback();
					setTimeout(function(){
						t._onTransitionEnd();
						g.vLayout.reLayout();
						g.focus.enabled = focusEnabled;
						g.body._focusCellRow = 0;
						g.body._focusCellCol = 0;
						g.focus.focusArea('body');
						t.onFinish(args);
					}, transitionDuration);
				}, 10);
			});
		}
	});
});
