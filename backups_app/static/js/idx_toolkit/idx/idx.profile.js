var profile = (function(){
	
	var isTest = function(filename, mid){
			return /\/tests\//.test(filename) ||
				/\/demos\//.test(filename) ||
				/lessTests/.test(mid);
		},
		
		isCopyOnly = function(filename, mid){
			var list = {
				"idx/idx.profile":1,
				"idx/package.json":1
			};
			return (mid in list) ||
				isTest(filename, mid) ||
				/(png|jpg|jpeg|gif|tiff)$/.test(filename);
		},

		ignore = function(filename, mid){
			return /idx\/themes\/oneuiLess/.test(mid) ;
		},
		isAMD = function(filename, mid){
			return !isTest(filename, mid) &&
				!isCopyOnly(filename, mid) &&
				/\.js$/.test(filename) &&
				!/oneuiLess/.test(mid);
		};

	return {
		resourceTags:{
			test: isTest,
			copyOnly: isCopyOnly,
			amd: isAMD,
			ignore: ignore
		}
	};
})();
