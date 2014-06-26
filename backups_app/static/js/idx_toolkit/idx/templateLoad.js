define(["dojo/has"],function(has){
	var hasMobile = has("mobile"),
		hasDesktop = has("desktop"),
		widgetTemplatesMap = {
			"idx/form/TextBox": {
				"mobile": "dojo/text!./mobileTemplates/TextBox.html",
				"desktop": "dojo/text!./templates/TextBox.html"
			}
		}
		
	return function(widgetClass, platform){
			var hasWidgetForDesktop = has(widgetClass.replace(/\//g, "_") + "_desktop"),
				hasWidgetForMobile = has(widgetClass.replace(/\//g, "_") + "_mobile"),
				desktopTemplate = widgetTemplatesMap[widgetClass][platform],
				template = hasWidgetForDesktop ? 
					desktopTemplate : 
					(hasWidgetForMobile ? 
						"" : 
						(hasDesktop ? 
							desktopTemplate : 
							(hasMobile ? "" : desktopTemplate)
						)
					);
				
			return template;
				
			
		};
})
