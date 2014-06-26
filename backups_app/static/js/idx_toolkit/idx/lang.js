define([
	"dojo/_base/lang",
	"idx/main"
], function(dLang, iMain) {

/**
 * @name idx.lang
 * @namespace Provides convenient functions for string and number.
 */
	var iLang = dLang.getObject("lang", true, iMain);
	
/**
 * @public
 * @function
 * @name idx.lang.startsWith
 * @description Tests whether a string starts with a prefix or not.
 * @param {String} all
 * @param {String} part
 * @returns {Boolean}
 */
	iMain.startsWith = iLang.startsWith = function(/*string*/ all, /*string*/ part){
		//	summary:
		//		Return true if string "all" starts with "part"
		return (dLang.isString(all) && dLang.isString(part) && all.indexOf(part) === 0); // Boolean
	};
	
/**
 * @public
 * @function
 * @name idx.lang.endsWith
 * @description Tests whether a string ends with a suffix or not.
 * @param {String} all
 * @param {String} part
 * @returns {Boolean}
 */
	iMain.endsWith = iLang.endsWith = function(/*string*/ all, /*string*/ part){
		//	summary:
		//		Return true if string "all" ends with "part"
		return (dLang.isString(all) && dLang.isString(part) && all.lastIndexOf(part) === all.length - part.length); // Boolean
	};
	
/**
 * @public
 * @function
 * @name idx.lang.equalsIgnoreCase
 * @description Compares two strings ignoring case.
 * @param {String} s1
 * @param {String} s2
 * @returns {Boolean}
 */
	iMain.equalsIgnoreCase = iLang.equalsIgnoreCase = function(/*string*/ s1, /*string*/ s2){
		//	summary:
		//		Return true if string "s1" equals to "ss" with ignoring case
		return (dLang.isString(s1) && dLang.isString(s2) && s1.toLowerCase() === s2.toLowerCase()); // Boolean
	};
	
/**
 * @public
 * @function
 * @name idx.lang.isNumber
 * @description Tests whether the parameter is Number or not.
 * @param {Number} n
 * @returns {Boolean}
 */
	iMain.isNumber = iLang.isNumber = function(/*number*/ n){
		//	summary:
		//		Return true if it it a Number
		return (typeof n == "number" && isFinite(n)); // Boolean
	};
	
/**
 * @public
 * @function
 * @name idx.lang.getByteLengthInUTF8
 * @description Obtains the number of bytes for a UTF-8 encoded string 
 * @param {String} s
 * @returns {Number}
 */
	iMain.getByteLengthInUTF8 = iLang.getByteLengthInUTF8 = function(/*string*/ s){
		// summary:
		//		Return byte length for UTF-8 encoded string
		if(!s){
			return null;
		}
		var encoded = encodeURIComponent(s); // "abc%E3%81%82%E3%81%84%E3%81%86" for "abcあいう"
		encoded = encoded.replace(/%[0-9A-F][0-9A-F]/g, "*"); // abc********* (%FF -> *)
		return encoded.length;
	};
	
	return iLang;

});
