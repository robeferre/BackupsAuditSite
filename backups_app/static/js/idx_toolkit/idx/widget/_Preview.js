define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/_Preview.html"
], function(declare, lang, domConstruct, _Widget, _TemplatedMixin, templateString){
	
var oneuiRoot = lang.getObject("idx.oneui", true); // for backward compatibility with IDX 1.2

var _Preview = declare("idx.widget._Preview", [_Widget, _TemplatedMixin], {
	templateString: templateString,
	/**
	 * Url of image
	 * @type Url
	 */
	image: "",
	/**
	 * The title of the Preview
	 * @type string
	 */
	title: "",
	content: "",
	_setContentAttr: [{node: "containerNode", type: "innerHTML"}],
	_setImageAttr: function(image){
		if(image){
			domConstruct.create("img", {
				src: image,
				alt: this.title
			}, this.imageNode);
		}
	}
});

oneuiRoot._Preview = _Preview;

return _Preview;

})
