define(["doh/runner",
	"dojox/io/windowName",
	"dojo/io/iframe",
	"dojo/_base/sniff",
	"dojo/_base/lang"], function(doh, windowName, iframe, has, lang){
	// summary: 
	// 		A DOH plugin send out the report by mail.
	var originDOH = {
		_handleFailure: doh._handleFailure,
		_testFinished: doh._testFinished
	};

	/*
	 * report = {
	 *   buildVersion: "20120420-0428",
	 *   browser: "chrome",
	 *   browserVersion: "18",
	 *   groups: {
	 *     "idx/oneui/form/CheckBox": {
	 *       tests:{
	 *         "../test/test_CheckBox.html?..": {
	 *           success: true,
	 *           elapsed: 11
	 *         }
	 *       }
	 *     }
	 *   }
	 * }
	 */

	report = {
		groups: {}
	};
	
	doh._testFinished = function(group, fixture, success){
		originDOH._testFinished.apply(doh, arguments);

		var elapsed = fixture.endTime-fixture.startTime;
		this.debug((success ? "PASSED" : "FAILED"), "test:", fixture.name, elapsed, 'ms');
		report.groups[group] = report.groups[group] || {};
		report.groups[group].tests = report.groups[group].tests || {};
		report.groups[group].tests[fixture.name] = lang.mixin(report.groups[group].tests[fixture.name], {success: success, elapsed: elapsed});
	};
	
	doh._report = function(){
		// summary:
		//		Overwrite doh.runner._report to send a mail at the end.
		var logWriterURL = "http://localhost:8088/DOHReportWriter";
		
		this.debug(this._line);
		this.debug("| TEST SUMMARY:");
		this.debug(this._line);
		this.debug("\t", this._testCount, "tests in", this._groupCount, "groups");
		this.debug("\t", this._errorCount, "errors");
		this.debug("\t", this._failureCount, "failures");
		
		var version = /\/builds\/([^\/]*)\//.exec(window.location.href);
		var browser = "Unknown_Browser";
		var browserVersion = "Unknown_Version";
		var content;
		if(has("chrome")){
			browser = "Chrome";
			browserVersion = has("chrome");
			//content = dojo.byId("logBody").innerText;
		}
		else if(has("ff")){
			browser = "FireFox";
			browserVersion = has("ff");
			//content = dojo.byId("logBody").textContent;
		}
		else if(has("ie")){
			browser = "IE";
			browserVersion = has("ie");
			//content = dojo.byId("logBody").innerText;
		}
		
		version = (version && version.length && version.length > 0) ? version[1] : "dojo_log";
		
		report.buildVersion = version;
		report.browser = browser;
		report.browserVersion = browserVersion;
		
		//windowName.send("POST", {
		//	url: logWriterURL,
		//	content: {
		//		reportContent: dojo.toJson(report),
		//		buildVersion: version,
		//		browser: browser,
		//		browserVersion: browserVersion
		//	}
		//});
		var fn = dojo.create("form", {
			id: "hidden_form",
			method: "POST"
		}, window.document.body);
		iframe.send({
			url: logWriterURL,
			method: "POST",
			form: "hidden_form",
			content: {
				buildVersion: version,
				browser: browser,
				browserVersion: browserVersion,
				reportContent: dojo.toJson(report)
			}
		});
	};
});
