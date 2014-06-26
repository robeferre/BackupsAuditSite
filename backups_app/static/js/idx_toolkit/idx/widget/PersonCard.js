define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/_base/array",
	"dojo/_base/html",
	"dojo/_base/xhr",
	"dojo/io/script",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dojo/has!dojo-bidi?../bidi/widget/PersonCard",
	"dojo/text!./templates/PersonCard.html"
], function(dojo_declare, dojo_lang, has, dojo_array, dojo_html, dojo_xhr, dojo_io_script, dijit_Widget, dijit_TemplatedMixin, bidiExtension, templateString){

/**
 * @name idx.widget.PersonCard
 * @class Person card rendering properties fetched from profile service or given as value attribute.
 * @augments dijit._Widget
 * @augments dijit._TemplatedMixin
 */
var baseClassName = has("dojo-bidi")? "idx.widget.PersonCard_" : "idx.widget.PersonCard";
var PersonCard = dojo_declare("idx.widget.PersonCard", [dijit_Widget, dijit_TemplatedMixin],
/** @lends idx.widget.PersonCard# */
{

	baseClass: "idxPersonCard",
	templateString: templateString,

	/**
	 * URL for profile service.
	 * 
	 * @type String
	 * @default ""
	 */
	url: "",

	/**
	 * JSONP callback name for profile service.
	 * 
	 * @type String
	 * @default ""
	 */
	jsonp: "",

	/**
	 * HTTP Method for profile service. Effective only when "jsonp" is omitted.
	 * 
	 * @type String
	 * @default "POST"
	 */
	method: "POST",

	/**
	 * Specifies the list of properties to render.
	 * Dotted notation specifies sub-property for a nested object property.
	 * 
	 * @type Array
	 * @default ["photo", "fn", "title", "adr.work", "tel.work", "email.internet"]
	 */
	spec: ["photo", "fn", "title", "adr.work", "tel.work", "email.internet"],

	/**
	 * Qeury parameters for profile service.
	 * 
	 * @type Object
	 * @default null
	 */
	query: null,

	/**
	 * Properties to render.
	 * 
	 * @type Object
	 * @default null
	 */
	value: null,

	/**
	 * Text to be rendered for "sametime.awareness" when sametime client is not available.
	 * 
	 * @type String
	 * @default "&nbsp;"
	 */
	placeHolder: "&nbsp;",

	_setQueryAttr: function(query) {
		this.query = query;
		this.containerNode.innerHTML = ""; // clear content
		if(query && this.url){
			this._load = (this._load || dojo_lang.hitch(this, this._setValueAttr));
			if(this.jsonp){
				dojo_io_script.get({url: this.url, jsonp: this.jsonp, content: query, load: this._load});
			}else if(this.method){
				dojo_xhr(this.method, {url: this.url, content: query, load: this._load},
					this.method.toUpperCase() == "POST");
			}
		}
	},

	_setValueAttr: function(value){
		this.value = value;
		if ( this.containerNode )
			this.containerNode.innerHTML = ""; // clear content
		if(value && this.spec){
			dojo_array.forEach(this.spec, function(prop){
				this.render(prop, value);
			}, this);
			// Add Clear Div to solve the image with float, avoid the height uncalculate
			dojo_html.create("div", {"class": "idxClearFloat"}, this.containerNode);
		}
	},

	/**
	 * Renders a property.
	 * This method can be overridden to implement custom rendering for specific properties.
	 * 
	 * @param {String} prop
	 *  Property name.
	 * @param {Object} value
	 *  Object containing properties.
	 */
	render: function(prop, value){
		var type = prop.split(".")[0];
		var className = this.baseClass + type.charAt(0).toUpperCase() + type.substring(1);
		if(prop == "photo"){
			var alt = (dojo_lang.getObject("fn", false, value) || "");
			value = dojo_lang.getObject(prop, false, value);
			dojo_html.create("img", {src: value, "class": className, alt: alt}, this.containerNode);
		}else if(prop == "email.internet"){
			value = dojo_lang.getObject(prop, false, value);
			dojo_html.create("a", {href: "mailto:" + value, innerHTML: value},
				dojo_html.create("div", {"class": className}, this.containerNode));
		}else if(prop == "sametime.awareness"){
			if(window && window["sametime_loadAwareness"]){
				value = dojo_lang.getObject("email.internet", false, value);
				dojo_html.create("a", {userId: value, "class": "awareness", innerHTML: "&nbsp;",
					href: "javascript:;", role: "link", wairole: "link"},
					dojo_html.create("div", {"class": className}, this.containerNode));
				sametime_loadAwareness();
			}else{
				dojo_html.create("div", {"class": className, innerHTML: this.placeHolder}, this.containerNode);
			}
		}else{
			value = dojo_lang.getObject(prop, false, value);
			if(type == "adr"){
				var adr = (value.locality || "");
				if(value.region){
					if(adr){
						adr += ", ";
					}
					adr += value.region;
				}
				value = adr + " " + (value.country_name || "");
			}
			else if(type == "fn"){
					//rearrange first and last name
					var last = value.substring(0, value.indexOf(","));
					var first = value.substring(value.indexOf(",")+1);
					value = first + " " + last;
					value = value.replace(/^\s*/, '').replace(/\s*$/, '');//trim leading and trailing spaces
			}
			dojo_html.create("div", {innerHTML: value, "class": className}, this.containerNode);
		}
	}

});
return has("dojo-bidi")? dojo_declare("idx.widget.PersonCard",[PersonCard,bidiExtension]) : PersonCard;
});
