/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/* utility JavaScript for the demo pages */

define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/xhr",
		"dojo/_base/url",
		"dojo/dom-construct",
		"dijit/layout/ContentPane",
		"dijit/form/TextBox"],
		function(declare, lang, xhr, url, domconstruct, ContentPane, TextBox){
				 	
	function sizeIframeToContent(ifnode, fullwidth){
		// NB this will not work cross-domain
		// include 10px fudge factor in case of stray borders/frames
		// NB scrollWidth comes out as "1" on FF, so use parentNode.scrollWidth which, curiously, is set OK
		ifnode.style.width = fullwidth ? "100%" : ((ifnode.contentDocument || ifnode.contentWindow.document).body.parentNode.scrollWidth) + "px";
		ifnode.style.height = ((ifnode.contentDocument || ifnode.contentWindow.document).body.parentNode.scrollHeight + 10) + "px";
	}

 	return declare("idx.demos._PageProxyContentPane", [ContentPane], {
		// pageProxyContentPane is a ContentPane with an extra property, iframesrc,
		// which is the URL which will be loaded into an IFRAME and used as the
		// pane content. Loading is lazy, begun on first show. The IFRAME is sized
		// to the content size (NB this will not work cross-domain).
	 	_onShow: function(){
			this.inherited(arguments);
			
			if(this.iframesrc || this.mobilesrc){
				var basesrc = this.iframesrc || this.mobilesrc,
					src = basesrc,
					mob = !this.iframesrc;
				delete this.iframesrc;
				delete this.mobilesrc;
				
				this._setContent(this.onDownloadStart(), true);
				
				var ifrmholder = this.containerNode;
				
				if(mob){
					ifrmholder = domconstruct.create("div", { style: "display: none;" }, this.containerNode);
					
					if(!this.width){
						this.width = "720";
					}
					if(!this.height){
						this.height = "540";
					}
					if(!this.theme){
						this.theme = "Android";
					}
					
					src = basesrc + "?width=" + this.width + "&height=" + this.height + "&theme=" + this.theme; 
				}
				
				var ifrm = domconstruct.create("iframe", {
					frameBorder: "0",
					scrolling: "no",
					src: src,
					title: this.title,
					style: "width: 1px; height: 1px; " + (mob ? "border: 12px solid #131313; border-radius: 6px;" : "")
				}, ifrmholder);
				
				var onLoadHandler = dojo.hitch(this, function(event){
					// when loading is complete, remove all but the last
					// child node (which will be our IFRAME) and then
					// resize the iframe to the content
					while (this.containerNode.firstChild.nextSibling) {
						this.containerNode.removeChild(this.containerNode.firstChild);
					}
					sizeIframeToContent(event.target || event.srcElement, !mob);
					ifrmholder.style.display = "block";
					ifrm.style.display = "block";
				});
				if(ifrm.addEventListener){
					ifrm.addEventListener("load", onLoadHandler, false);
				}else{
					ifrm.attachEvent("onload", onLoadHandler);
				}
				
				if(mob){
					var panel = domconstruct.create("div", {}, ifrmholder, "first"),
						wpanel = domconstruct.create("p", { "class": "demoSampleNotice" }, panel, "first");
					
					if(this.showControls !== false){					
						var cpanel = domconstruct.create("div", {}, panel, "first");
						
							/*,
								subpanel1 = domconstruct.create("div", { style: "display: inline-block;" }, panel),
								android
							<input type="radio" id="pp_theme_android" data-dojo-type="dijit/form/RadioButton" checked value="Android"/> <label for="pp_theme_android">Android theme</label> <br />
				    		<input type="radio" id="pp_theme_ios" data-dojo-type="dijit/form/RadioButton" value="iPhone"/> <label for="pp_theme_ios">iOS (iPhone/iPad) theme</label>		
						
						</div>
		
						<div style="display: inline-block; width: 200px; position: relative; min-height: 40px; padding: 0 1em;">
		
							<div style="position: absolute; left: 79px; top: 10px; height: 30px; width: 3px; background-color: darkGray;"></div>		
							<span style="float: left; font-size: 9px; padding-bottom: 3px;">smaller screen</span>
							<span style="float: right; font-size: 9px; padding-bottom: 3px;">larger screen</span>
							<div data-dojo-type="dijit/form/HorizontalRule" data-dojo-props="container: 'topDecoration', count: 5" style="clear: both; height: 1px; margin: 0 11px;"></div>
							
							<input id="hslider" type="range" value="3" data-dojo-type="dijit/form/HorizontalSlider" data-dojo-props="minimum: 0, maximum: 4, showButtons: false, discreteValues: 5" />
							
							<div data-dojo-type="dijit/form/HorizontalRule" data-dojo-props="container: 'bottomDecoration', count: 5" style="height: 3px; margin: 0 11px;"></div>
							<span style="position: absolute; right: 126px; text-align: right; font-size: 10px; color: darkGray;"><span style="font-size: 14px;">&larr;</span> &ldquo;phone&rdquo;</span>
							<span style="position: absolute; left: 86px; font-size: 10px; color: darkGray;">&ldquo;tablet&rdquo; <span style="font-size: 14px;">&rarr;</span></span>
							
						</div>
		
						<div style="display: inline-block;">
						
							<input type="radio" id="pp_orientation_portrait" data-dojo-type="dijit/form/RadioButton" checked value="portrait"/> <label for="pp_orientation_portrait">portrait orientation</label> <br />
				    		<input type="radio" id="pp_orientation_landscape" data-dojo-type="dijit/form/RadioButton" value="landscape"/> <label for="pp_orientation_portrait">landscape orientation</label>		
						
						</div>*/
						
						var largest = Math.max(this.width, this.height),
							sz = "Small phone";
						if(largest >= 900){
							sz = "Large tablet";
						}else if (largest >= 700){
							sz = "Medium tablet";
						}else if (largest >= 500){
							sz = "Small tablet";
						}else if (largest >= 400){
							sz = "Large phone";
						}
						
						cpanel.innerHTML = "Theme variant: <b>" + this.theme + "</b>" +
						  ", screen size: <b>" + sz + "</b>" +
						  ", orientation: <b>" + ((this.width > this.height) ? "landscape" : "portrait") + "</b>" +
						  " (<a href='" + ifrm.src + "' target='_new'>view this configuration in a new tab</a>)";
					}
					
					var qrv = 1, addr = new url(window.location.href, basesrc).toString(), l = addr.length;
					(l > 17) && qrv++;
					(l > 32) && qrv++;
					(l > 53) && qrv++;
					(l > 78) && qrv++;
					(l > 106) && qrv++;
					(l > 134) && qrv++;
					(l > 154) && qrv++;
					(l > 192) && qrv++;
					(l > 230) && qrv++;
					(l > 271) && qrv++;
					
					var sz = 36 + (8 * qrv);					
					
					wpanel.innerHTML = "<a href='" + addr + "' target='_new'><img style='float: right; padding-left: 1em;' " +
									   "title='View this sample directly' width='" + sz + "' height='" + sz + "' " +
									   "src='http://api.qrserver.com/v1/create-qr-code/?data=" + addr + "&size=" + sz + "x" + sz + "' /></a>" +
									   "<b>Note:</b> on a desktop browser this sample is designed to give an impression " +
									   "of how IDX One UI mobile would look on a mobile device. Factors such as fonts, " +
									   "pixel ratios, browser features and CSS rendering mean that the effect will not " +
									   "be exactly what is seen on the appropriate device. In particular, <b>the sample may not " +
									   "function or may show substantial differences when viewed using a non-WebKit browser, " +
									   "such as Firefox or Microsoft Internet Explorer</b>. Use of a WebKit browser, such as " +
									   "Google Chrome or Apple Safari, is recommended. If you are viewing this on a mobile " +
									   "device (phone or tablet), you may wish to <a href='" + basesrc + "' target='_new'>view " +
									   "this sample directly</a>. Alternatively, scan the code on the right with your mobile device.";
				}
			}
										
			if(this.textsrc){
				var src = this.textsrc;
				delete this.textsrc;
				
				this._setContent(this.onDownloadStart(), true);

				var dfd = xhr.get({
					url: src,
					handleAs: "text"
				});
				
				dfd.addCallback(dojo.hitch(this, function(data){
					this.destroyDescendants();
					
					var pre = document.createElement("PRE");
					pre.className = "codePage";
					pre.appendChild(document.createTextNode(data));
					this.containerNode.appendChild(pre);
				}));
			}							
		}
	});
			
});