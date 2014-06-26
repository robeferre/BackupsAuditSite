define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dijit/registry",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/i18n",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/string",
	"dojo/parser",
	"dojo/query",
	"dojo/keys",
	"gridx/core/_Module",
	"dojo/text!../../templates/FilterBar.html",
	"gridx/modules/Filter",
	"./FilterDialogPane",
	"idx/widget/HoverHelpTooltip",
	"idx/widget/Dialog",
	"idx/widget/ConfirmationDialog",
	"dijit/Dialog",
	"dijit/form/Button",
	"dojo/i18n!../../nls/FilterBar",
	"idx/form/Select",
	"idx/form/TextBox",
	"idx/form/NumberTextBox",
	"idx/form/DateTextBox",
	"idx/form/TimeTextBox",
	"idx/form/ComboBox",
	"dijit/form/RadioButton"
], function(kernel, declare, registry, lang, array, event, i18n,
		dom, domGeo, domAttr, css, string, parser, query, keys, _Module, template,
		F, FilterDialogPane, HoverHelpTooltip,
		Dialog, ConfirmationDialog, DijitDialog, Button){

	/*=====
	var columnDefinitionFilterMixin = {
		// filterable: Boolean
		//		If FALSE, then this column should not occur in the Filter Definition Dialog for future rules.
		//		But this does not influence existing filter rules. Default to be TRUE.
		filterable: true,
	
		// disabledConditions: String[]
		//		If provided, all the listed conditions will not occur in the Filter Definition Dialog for future rules.
		//		But this does not influence existing filter rules. Default to be an empty array.
		disabledConditions: [],
	
		// dataType: String
		//		Specify the data type of this column. Should be one of "string", "number", "date", "time", and "boolean".
		//		Case insensitive. Data type decides which conditions to use in the Filter Definition Dialog.
		dataType: 'date'
		storeDatePattern: ''
		formatter: ''
		dateParsePatter: 'yyyy/MM/dd HH:mm:ss'
		filterArgs: {
			trueLabel: '',
			falseLabel: '',
			valueDijitArgs: {}
		}
		// dataTypeArgs: Object
		//		Passing any other special config options for this column. For example, if the column is of type 'date', but the data
		//		in store is of string type, then a 'converter' function is needed here:
		//		dataTypeArgs: {
		//			useRawData: true,
		//			converter: function(v){
		//				return dojo.date.locale.parse(v, {...});
		//			}
		//		}
		dataTypeArgs: {}
	};
	=====*/
	
	return declare(/*===== "gridx.modules.filter.FilterBar", =====*/_Module, {
		name: 'filterBar',

		forced: ['filter'],

		getAPIPath: function(){
			return {
				filterBar: this
			};
		},

		preload: function(){
			this.nls = lang.mixin(this.grid.nls, i18n.getLocalization('idx.gridx', 'FilterBar', this.grid.lang));
			var rules = this.arg('filterData');
			if(rules){
				this.grid.filter.setFilter(this._createFilterExpr(rules), 1);
			}
		},

		//Public-----------------------------------------------------------
		
		// closeButton: Boolean
		//		TRUE to show a small button on the filter bar for the user to close/hide the filter bar.
		closeButton: true,
	
		// defineFilterButton: Boolean
		//		FALSE to hide the define filter button on the left side (right side for RTL) of the filter bar.
		defineFilterButton: true,
		
		// tooltipDelay: Number
		//		Time in mili-seconds of the delay to show the Filter Status Tooltip when mouse is hovering on the filter bar.
		tooltipDelay: 300,
	
		// maxRuleCount: Integer
		//		Maximum rule count that can be applied in the Filter Definition Dialog.
		//		If <= 0 or not number, then infinite rules are supported.
		maxRuleCount: 0,
		
		// ruleCountToConfirmClearFilter: Integer | Infinity | null
		//		If the filter rule count is larger than or equal to this value, then a confirm dialog will show when clearing filter.
		//		If set to less than 1 or null, then always show the confirm dialog.
		//		If set to Infinity, then never show the confirm dialog.
		//		Default value is 2.
		ruleCountToConfirmClearFilter: 2,
	
	/*=====
		// itemsName: String
		//		The general name of the items listed in the grid.
		//		If not provided, then search the language bundle.
		itemsName: '',

		// filterButtonLabel: String
		//		If not provided, then search the language bundle.
		filterButtonLabel: '',

		// clearButtonLabel: String
		//		If not provided, then search the language bundle.
		clearButtonLabel: '',

		// cancelButtonLabel: String
		//		If not provided, then search the language bundle.
		cancelButtonLabel: '',

		// anyColumnLabel: String
		//		If not provided, then search the language bundle.
		anyColumnLabel: '',

		// removeRuleButtonLabel: String
		//		If not provided, then search the language bundle.
		removeRuleButtonLabel: '',
		
	=====*/

		// condition:
		//		Name of all supported conditions.
		//		Hard coded here or dynamicly generated is up to the implementer. Anyway, users should be able to get this info.
		conditions: {
			string: ['contain','equal','startWith', 'endWith', 'notEqual','notContain', 'notStartWith', 'notEndWith', 'isEmpty'],
			number: ['equal','greater','less','greaterEqual','lessEqual','notEqual','isEmpty'],
			date: ['equal','before','after','range','isEmpty'],
			time: ['equal','before','after','range','isEmpty'],
			'enum': ['equal', 'notEqual', 'isEmpty'],
			'boolean': ['equal','isEmpty']
		},

		load: function(args, startup){
			// summary:
			//	Init filter bar UI
			//Add before and after expression for filter.
			var t = this,
				dn = t.domNode = dom.create('div', {
					innerHTML: string.substitute(template, t),
					'class': 'gridxFilterBar'
				});
			F.before = F.lessEqual;
			F.after = F.greaterEqual;
			parser.parse(dn);
			css.toggle(dn, 'gridxFilterBarHideCloseBtn', !t.arg('closeButton'));
			t.grid.vLayout.register(t, 'domNode', 'headerNode', -1);
			t._initWidgets();
			t._initFocus();
			t.refresh();
			t.connect(dn, 'onclick', 'onDomClick');
			t.connect(dn, 'onmousemove', 'onDomMouseMove');
			t.connect(dn, 'onmouseout', 'onDomMouseOut');
			t.loaded.callback();
		},

		columnMixin: {
			isFilterable: function(){
				// summary:
				//		Check if this column is filterable.
				// return: Boolean
				return this.def().filterable !== false;
			},

			setFilterable: function(filterable){
				// summary:
				//		Set filterable for this column.
				// filterable: Boolean
				//		TRUE for filterable, FALSE for not.
				// return:
				//		column object itself
				this.grid.filterBar._setFilterable(this.id, filterable);
				return this;
			},

			dataType: function(){
				// summary:
				//		Get the data type of this column. Always lowercase.
				// return: String
				return (this.def().dataType || 'string').toLowerCase();
			},

			filterConditions: function(){
				// summary:
				//		Get the available conditions for this column.	
				return this.grid.filterBar._getColumnConditions(this.id);
			}
		},

		onDomClick: function(e){
			if(e.target && e.target.tagName){
				clearTimeout(this._pointTooltipDelay);
				if(domAttr.get(e.target, 'action') === 'clear'){
					this.clearFilter();
				}else if(css.contains(e.target, 'gridxFilterBarCloseBtn') || css.contains(e.target,'gridxFilterBarCloseBtnText')){
					this.hide();
				}else{
					this.showFilterDialog();
				}
			}
		},

		onDomMouseMove: function(e){
			if(e && e.target && (domAttr.get(e.target, 'action') === 'clear' ||
				this.btnFilter === dijit.getEnclosingWidget(e.target))){
				clearTimeout(this._pointTooltipDelay);
				return;
			}
			this._showTooltip(e.clientX);
		},

		onDomMouseOut: function(e){
			//Make sure to not hide tooltip when mouse moves to tooltip itself.
			setTimeout(lang.hitch(this, '_hideTooltip'), 10);
		},

		_createFilterExpr: function(filterData){
			var exps = [];
			array.forEach(filterData.conditions, function(data){
				var type = 'string';
				if(data.colId){
					type = this.grid.column(data.colId).dataType();
					exps.push(this._getFilterExpression(data.condition, data, type, data.colId));
				}else{
					//any column
					var arr = [];
					array.forEach(this.grid.columns(), function(col){
						if(!col.isFilterable()){return;}
						arr.push(this._getFilterExpression(data.condition, data, type, col.id));
					}, this);
					exps.push(F.or.apply(F, arr));
				}
			}, this);
			return (filterData.type === 'all' ? F.and : F.or).apply(F, exps);
		},

		applyFilter: function(filterData){
			// summary:
			//		Apply the filter data.
			var t = this,
				model = t.model,
				filter = t._createFilterExpr(filterData);
			t.filterData = filterData;
			t.grid.filter.setFilter(filter);
			model.when({}).then(function(){
				t._currentSize = model.size();
				t._totalSize = model._cache.size();
				t._buildFilterState();
			});
		},

		confirmToClear: function(){
			var t = this,
				max = t.arg('ruleCountToConfirmClearFilter'),
				data = t.filterData,
				cfmDlg = t._cfmDlg;
			if(data && (data.conditions.length >= max || max <= 0)){
				if(!cfmDlg){
					cfmDlg = t._cfmDlg = t._createConfirmDialog();
				}
				cfmDlg.show();
			}else{
				t._filterDialog.hide();
				t.clearFilter(true);
			}
		},

		_createFilterDialog: function(args){
			var t = this,
				nls = t.nls,
				filterDialogPane = this._filterDialogPane,
				btnFilter = new Button({
					label: t.arg('filterButtonLabel', nls.filterButton),
					onClick: function(){
						filterDialogPane._onSubmit();
					}
				}),
				btnClear = new Button({
					label: t.arg('clearButtonLabel', nls.clearButton),
					onClick: function(){
						filterDialogPane.clear();
						t._filterDialog.hide();
					}
				});
			filterDialogPane._btnFilter = btnFilter;
			filterDialogPane._btnClear = btnClear;
			args.buttons = [btnFilter, btnClear];
			args['class'] = 'gridxFilterDialog gridxFilterDialogOneLine';
			args._onKey = function(){
				DijitDialog.prototype._onKey.apply(this, arguments);
			};
			var dlg = new Dialog(args);
			return dlg;
		},

		_createConfirmDialog: function(){
			var t = this,
				nls = t.nls,
				dlg = new ConfirmationDialog({
					type: "question",
					autofocus: false,
					text: t.arg('clearFilterDialogTitle', nls.clearFilterDialogTitle),
					info: t.arg('clearFilterMsg', nls.clearFilterMsg),
					buttonLabel: t.arg('clearButtonLabel', nls.clearButton),
					cancelButtonLabel: t.arg('cancelButtonLabel', nls.cancelButton)
				});
			dlg.confirm(function(){
				t.clearFilter(true);
			});
			return dlg;
		},

		clearFilter: function(noConfirm){
			if(noConfirm){
				this.filterData = null;
				this.grid.filter.setFilter();
				this._buildFilterState();
			}else{
				this.confirmToClear();
			}
		},

		refresh: function(){
			// summary:
			//		Re-draw the filter bar if necessary with the current attributes.
			// example:
			//		grid.filterBar.closeButton = true;
			//		grid.filterBar.refresh();
			this.btnClose.style.display = this.closeButton ? '': 'none';
			this.btnFilter.domNode.style.display = this.arg('defineFilterButton') ? '': 'none';
			var _this = this;
			this.model.when({}, function(){
				_this._currentSize = _this.model.size();
				_this._totalSize = _this.model._cache.size();
				_this._buildFilterState();
			});
		},

		show: function(){
			// summary:
			//		Show the filter bar. (May add animation later)
			this.domNode.style.display = 'block';
			this.grid.vLayout.reLayout();
			this.onShow();
		},

		hide: function(){
			// summary:
			//		Hide the filter bar. (May add animation later)
			this.domNode.style.display = 'none';
			this.grid.vLayout.reLayout();
			this._hideTooltip();
			this.onHide();
		},

		onUpdateValueField: function(){},

		onShow: function(){},

		onHide: function(){},

		showFilterDialog: function(){
			// summary:
			//		Show the filter define dialog.
			var t = this,
				dlgPane = t._filterDialogPane,
				filterData = t.filterData;
			if(!dlgPane){
				t._filterDialogPane = dlgPane = new FilterDialogPane({
					module: t
				});
				t._filterDialog = t._createFilterDialog({
					autofocus: false,
					title: t.arg('filterDefDialogTitle', t.nls.filterDefDialogTitle),
					'class': 'gridxFilterDialog',
					content: dlgPane
				});
			}
			if(!t._filterDialog.open){
				//Fix #7345: If there exists filterData, it should be set after dlg is shown;
				//If there is no filterData, dlg.setData have to be called before dlg.show(),
				//otherwise, the dlg will not show any condition boxes.
				//TODO: Need more investigation on this to make the logic more reasonable!
				if(!filterData){
					dlgPane.setData(filterData);
				}
				dlgPane.show();
				if(filterData){
					dlgPane.setData(filterData);
				}
			}
		},

		uninitialize: function(){
			this._filterDialog && this._filterDialog.destroyRecursive();
			this.inherited(arguments);
			dom.destroy(this.domNode);
		},

		//Private---------------------------------------------------------------
		_getColumnConditions: function(colId){
			// summary:
			//		Get the available conditions for a specific column. 
			// 		Excluded condtions is defined by col.disabledConditions
			// tag:
			//		private
			// colId: String|Number
			//		The ID of a column.
			// return: String[]
			//		An array of condition names.
			var disabled, type,
				col = this.grid._columnsById[colId];
			if(col){
				disabled = col.disabledConditions || [];
				type = (col.dataType || 'string').toLowerCase();
			}else{
				//any column
				disabled = [];
				type = 'string';
			}
			var ret = this.conditions[type] || this.conditions['string'],
				hash = {};
			array.forEach(disabled, function(name){
				hash[name] = true;
			});
			return array.filter(ret, function(name){
				return !hash[name];
			});
		},

		_setFilterable: function(colId, filterable){
			var col = this.grid._columnsById[colId],
				d = this.filterData;
			if(col && col.filterable != !!filterable){
				col.filterable = !!filterable;
				if(d){
					var len = d.conditions.length;
					d.conditions = array.filter(d.conditions, function(c){
						return c.colId != colId;
					});
					if(len != d.conditions.length){
						this.applyFilter(d);
					}
					if(this._filterDialog.open){
						this._filterDialogPane.setData(d);
					}
				}
			}
		},

		_initWidgets: function(){
			var t = this,
				dn = t.domNode;
			t.btnFilter = registry.byNode(query('.dijitButton', dn)[0]);
			t.btnClose = query('.gridxFilterBarCloseBtn', dn)[0];
			t.connect(t.btnClose, 'onkeydown', '_onCloseKey');
			t.btnClearFilter = query('a[action="clear"]', dn)[0];
			t.statusNode = query('.gridxFilterBarStatus', dn)[0].firstChild;
			t.connect(t.btnClearFilter, 'onkeydown', '_onClearKey');
		},
		
		_buildFilterState: function(){
			// summary:
			//		Build the tooltip dialog to show all applied filters.
			var t = this,
				nls = t.nls;
			if(t.filterData && t.filterData.conditions.length){
				if(this.grid.filter.arg('serverMode')){	//in serverMode filter, we will neglect the totalSize
															//use the summary nls in pagination instead
					t.statusNode.innerHTML = string.substitute(t.arg('hasFilterMessage', nls.summary),
						[t._currentSize]);
				}else{
					t.statusNode.innerHTML = string.substitute(t.arg('hasFilterMessage', nls.filterBarMsgHasFilterTemplate),
						[t._currentSize, t._totalSize, t.arg('itemsName', nls.defaultItemsName)]);
				}
				t.btnClearFilter.style.display = '';
				t._buildTooltip();
			}else{
				t.statusNode.innerHTML = t.arg('noFilterMessage', nls.filterBarMsgNoFilterTemplate);
				t.btnClearFilter.style.display = 'none';
			}
		},

		_buildTooltip: function(){
			if(!this._tooltip){
				this._tooltipAnchor = dom.create('div', {
					style: 'width: 1px; height: 1px; border: none; position: absolute; top: 20px;'
				}, this.domNode);
				this._tooltip = new HoverHelpTooltip({
					position: ['below'],
					showCloseIcon: false
				});
			}
			this._tooltip.set('content', this._buildTooltipContent());
		},

		_buildTooltipContent: function(){
			var t = this,
				g = t.grid,
				nls = t.nls,
				data = t.filterData;
			if(data && data.conditions.length){
				var arr = [
					'<div class="gridxFilterTooltip',
					data.conditions.length === 1 ? ' gridxFilterTooltipSingleRule' : '',
					'"><div class="gridxFilterTooltipTitle">',
					t.arg('statusTipTitleHasFilter', nls.statusTipTitleHasFilter), '</div><div>',
					data.type === 'all' ? t.arg('statusTipHeaderAll', nls.statusTipHeaderAll) :
						t.arg('statusTipHeaderAny', nls.statusTipHeaderAny),
					'</div><table><tr><th>',
					t.arg('statusTipHeaderColumn', nls.statusTipHeaderColumn),
					'</th><th>',
					t.arg('statusTipHeaderCondition', nls.statusTipHeaderCondition),
					'</th></tr>'
				];
				array.forEach(data.conditions, function(d, idx){
					var colName = t.arg('anyColumnLabel', nls.anycolumn);
					if(d.colId){
						colName = g.column(d.colId).name();
					}
					if(g.bidi){
						colName = g.bidi.enforceTextDirWithUcc(d.colId, colName);
					}
					arr.push('<tr><td>', (d.colId ? colName : t.arg('anyColumnOption', nls.anyColumnOption)),
						'</td><td class="gridxFilterTooltipValueCell"><div>',
						t._getRuleString(d.condition, d.value, d.type),
						'<span action="remove-rule" title="',
						t.arg('removeRuleButtonLabel', nls.removeRuleButton),
						'" class="gridxFilterTooltipRemoveBtn"><span class="gridxFilterTooltipRemoveBtnText">x</span></span></div></td></tr>');
				});
				arr.push('</table></div>');
				return arr.join('');
			}
		},

		_showTooltip: function(clientX, delayed){
			var t = this,
				data = t.filterData,
				conditions = data && data.conditions;
			if(conditions && conditions.length){
				if(delayed){
					var pos = domGeo.position(t.domNode);
					t._tooltipAnchor.style.left = (clientX - pos.x) + 'px';
					t._tooltip.open(t._tooltipAnchor);
					if(t._tooltipHandler){
						t._tooltipHandler.remove();
					}
					var tooltipDom = query('.gridxFilterTooltip', HoverHelpTooltip._masterTT.domNode);
					t._tooltipHanlder = tooltipDom.on('click', function(e){
						var tr = e.target;
						while(tr && !/^tr$/i.test(tr.tagName) && tr !== tooltipDom[0]){
							tr = tr.parentNode;
						}
						if(tr && /^tr$/i.test(tr.tagName) && /^span$/i.test(e.target.tagName)){
							//remove the rule
							conditions.splice(tr.rowIndex - 1, 1);
							tr.parentNode.removeChild(tr);
							if(conditions.length == 1){
								tooltipDom.addClass('gridxFilterTooltipSingleRule');
							}
							t.applyFilter(data);
							event.stop(e);
						}else{
							t._tooltip.close();
							t.showFilterDialog();
						}
					});
				}else{
					clearTimeout(t._pointTooltipDelay);
					t._pointTooltipDelay = setTimeout(function(){
						t._showTooltip(clientX, true);
					}, t.arg('tooltipDelay'));
				}
			}
		},

		_hideTooltip: function(){
			var dlg = this._tooltip;
			if(dlg){
				clearTimeout(this._pointTooltipDelay);
				dlg.close();
			}
		},

		_getRuleString: function(condition, value, type){
			var valueString = value;
			if(condition == 'isEmpty'){
				valueString = '';
			}else if(/^date|^time/i.test(type)){
				var f = this._formatDate;
				if(/^time/i.test(type)){
					f = this._formatTime;
				}
				if(condition == 'range'){
					var tpl = this.arg('rangeTemplate', this.nls.rangeTemplate);
					valueString = string.substitute(tpl, [f(value.start), f(value.end)]);
				}else{
					valueString = f(value);
				}
			}
			return this._getConditionDisplayName(condition) + ' ' + valueString;
		},

		_getConditionDisplayName: function(c){
			var k = c.charAt(0).toUpperCase() + c.substring(1);
			return this.arg('condition' + k, this.nls['condition' + k]);
		},

		_getConditionOptions: function(colId){
			var t = this,
				cache = t._conditionOptions = t._conditionOptions || {};
			
			var ret = cache[colId] || (cache[colId] = array.map(t._getColumnConditions(colId), function(s){
				return {
					label: t._getConditionDisplayName(s),
					value: s
				};
			}));
			
			//change on 2013/9/9 add isNotEmpty condition to string type
			//support BTT
			if(t.grid._columnsById[colId]){
				var dt = t.grid._columnsById[colId].dataType || 'string';
				//only serverMode will add isNotEmpty condition to string dataType
				if(t.grid.filter.arg('serverMode') && dt.toLowerCase() === 'string'){
					ret = lang.clone(ret);
					ret.push({
						label: 'is not empty',		//NO nls!
						value: 'isNotEmpty'
					});
				}
			}
			return ret;
		},

		_getFilterExpression: function(condition, data, type, colId){
			//get filter expression by condition,data, column and type
			var col = this.grid._columnsById[colId],
				dc = col.dateParser || this._stringToDate,
				tc = col.timeParser || this._stringToTime,
				converter = {date: dc, time: tc},
				c = data.condition,
				exp,
				isNot = false;
			type = (c == 'isEmpty' || c == 'isNotEmpty') ? 'string' : type; //isEmpty always treat type as string
			if(c == 'range'){
				var startValue = F.value(data.value.start, type),
					endValue = F.value(data.value.end, type), 
					columnValue = F.column(colId, type, converter[type]);
				exp = F.and(F.greaterEqual(columnValue, startValue), F.lessEqual(columnValue, endValue));
			}else{
				if(/^not/.test(c)){
					isNot = true;
					c = c.replace(/^not/g, '');
					c = c.charAt(0).toLowerCase() + c.substring(1);
				}
				exp = F[c](F.column(colId, type, converter[type]), (c == 'isEmpty' || c == 'isNotEmpty') ? null : F.value(data.value, type));
				if(isNot){
					exp = F.not(exp);
				}
			}
			return exp;
		},

		_stringToDate: function(s, pattern){
			pattern = pattern || /(\d{4})\/(\d\d?)\/(\d\d?)/;
			pattern.test(s);
			var d = new Date();
			d.setFullYear(parseInt(RegExp.$1, 10));
			d.setMonth(parseInt(RegExp.$2, 10) - 1);
			return d;
		},

		_stringToTime: function(s, pattern){
			pattern = pattern || /(\d\d?):(\d\d?):(\d\d?)/;
			pattern.test(s);
			var d = new Date();
			d.setHours(parseInt(RegExp.$1, 10));
			d.setMinutes(parseInt(RegExp.$2, 10));
			d.setSeconds(parseInt(RegExp.$3, 10));
			return d;
		},

		_formatDate: function(date){
			//this may be customized by grid layout definition
			var m = date.getMonth() + 1, d = date.getDate();
			return m + '/' + d + '/' + date.getFullYear();
		},

		_formatTime: function(time){
			//this may be customized by grid layout definition
			var h = time.getHours(), m = time.getMinutes();
			if(h < 10){h = '0' + h;}
			if(m < 10){m = '0' + m;}
			return h + ':' + m + ':00';
		},

		_initFocus: function(){
			var focus = this.grid.focus;
			if(focus){
				focus.registerArea({
					name: 'filterbar_btn',
					priority: -0.9,
					focusNode: this.btnFilter.domNode,
					doFocus: this._doFocusBtnFilter,
					scope: this
				});
				focus.registerArea({
					name: 'filterbar_clear',
					priority: -0.8,
					focusNode: this.domNode,
					doFocus: this._doFocusClearLink,
					scope: this
				});
				focus.registerArea({
					name: 'filterbar_close',
					priority: -0.7,
					focusNode: this.btnClose,
					doFocus: this._doFocusBtnClose,
					scope: this
				});
			}
		},

		_doFocusBtnFilter: function(evt){
			this.btnFilter.focus();
			if(evt){event.stop(evt);}
			return true;
		},

		_doFocusClearLink: function(evt){
			if(this.btnClearFilter.style.display != 'none'){
				this.btnClearFilter.focus();
				if(evt){event.stop(evt);}
				return true;
			}
			return false;
		},

		_doFocusBtnClose: function(evt){
			this.btnClose.focus();
			if(evt){event.stop(evt);}
			return true;
		},

		_doBlur: function(){
			return true;
		},

		_onCloseKey: function(evt){
			if(evt.keyCode === keys.ENTER){
				this.hide();
			}
		},

		_onClearKey: function(evt){
			if(evt.keyCode === keys.ENTER){
				this.clearFilter();
			}
		},

		destroy: function(){
			this._filterDialog && this._filterDialog.destroyRecursive();
			this._cfmDlg && this._cfmDlg.destroyRecursive();
			this.btnFilter.destroy();
			dom.destroy(this.btnClose);
			dom.destroy(this.btnClearFilter);
			dom.destroy(this.domNode);
			this.inherited(arguments);
		}
	});
});
