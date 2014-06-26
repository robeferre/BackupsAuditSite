/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang",
        "dojox/rpc/Rest",
        "dojox/data/JsonRestStore"
       ], 
       function(dojo_lang,dojox_rpc_rest,dojox_data_jsonreststore){
	/**
  	 * @name idx.app.registry
 	 * @class Class that wraps all the JSON UI
 	 * registry. Most often, this registry is a
 	 * file that resides inside the war (registry.json).
 	 */
    var idx_app_registry = dojo_lang.getObject("idx.app.registry", true);

	/**
   	 * URL for JSON registry of all remote UI metadata including URLs
   	 * @public
   	 * @field	
   	 * @type {String}
   	 * @name idx.app.registry.href
   	 * @default "./data/registry.json"
   	 */
	idx_app_registry.href = "./data/registry.json";
	
	/**
   	 * Data from JSON registry of all remote UI metadata including URLs
   	 * @public
   	 * @field	
   	 * @type Object
   	 * @name idx.app.registry.data
   	 * @default null
   	 */
	idx_app_registry.data = null; 
	
	/**
	 * Data accessor. Returns data. If not loaded, the first
	 * loads it synchronously.
	 * @public
   	 * @name idx.app.registry.getData
   	 * @function
	 * @returns {Object} data
	 */
	idx_app_registry.getData = function() {
		if( idx_app_registry.data == null )
			idx_app_registry.load();
		return idx_app_registry.data;		
	};
	
	/**
	 * Load method
	 * Fetches registry data synchronously
	 * from well known location specified
	 * in idx_app_registry.href, which caller can set.
	 * @public
	 * @function
	 * @name idx.app.registry.load
	 */
	idx_app_registry.load = function() { 
    	
    	var MN = "idx.app.registry.load";

		var svc = dojox_rpc_rest( idx_app_registry.href,true);
		var storeArgs = { service : svc, allowNoTrailingSlash: true, syncMode: true } ;// synchronous
		var store = new dojox_data_jsonreststore(storeArgs);
		
		store.fetch({	
			onComplete: function (data) {
                // For IE we need to remove the __parent field from each object in the returned data otherwise dojo.forEach calls may fail
			    // to iterate arrays due to cycles in the object graph. Create a deep copy of the data, ignoring private fields such as __parent.
			    var copyWithoutInternalFields = function(obj) {
			        var ret = obj;
                    if(dojo_lang.isArray(obj)) {
                        var copyObj = [];
                        for(var field in obj) {
                            if(dojo_lang.isString(field) && field.charAt(0) == "_") {
                                // skip private fields
                                continue;
                            }
                            copyObj.push(copyWithoutInternalFields(obj[field]));
                        }
                        ret = copyObj;
                    }
                    else if(dojo_lang.isObject(obj)) {
                        var copyObj = {};
			            for(var field in obj) {
                            if(field.charAt(0) == "_") {
                                // skip private fields
                                continue;
                            }
                            copyObj[field] = copyWithoutInternalFields(obj[field]);
			            }
			            ret = copyObj;
			        }
			        return ret;
			    };
				idx_app_registry.data = copyWithoutInternalFields(data);				
				//console.info(MN,"Read success!","data:",idx_app_registry.data); //tmp
			},
			onError: function(errData, request) {				
				console.error(MN+" "+errData.message);
				console.dir(errData);
				alert(MN+" "+errData.message);
			}
		});
	};

	// return the object
	return idx_app_registry;
});