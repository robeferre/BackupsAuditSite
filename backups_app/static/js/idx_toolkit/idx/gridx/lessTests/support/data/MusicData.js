define([
	'dojo/_base/lang',
	'dojo/date/locale',
	'dijit/form/NumberTextBox',
	'dijit/form/DateTextBox',
	'dijit/form/TimeTextBox',
	'dijit/Editor',
	'dijit/ProgressBar',
	'dojo/_base/Color'
], function(lang, locale, NumberTextBox, DateTextBox, TimeTextBox, Editor, ProgressBar, Color){

	var items = [
//        {"Heard": '', "Progress": '', "Genre":"",	"Artist":"",	"Year": '',	"Album":"",	"Name":"",	"Length":"",	"Track": '',	"Composer":"",	"Download Date":"",	"Last Played":""},
//        {"Heard": '', "Progress": '', "Genre":"",	"Artist":"",	"Year": '',	"Album":"",	"Name":"",	"Length":"",	"Track": '',	"Composer":"",	"Download Date":"",	"Last Played":""},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist B0","Year":2003,"Album":"Album B0","Name":"Song B0","Length":"03:31","Track":4,"Composer":"Composer B0","Download Date":"1923/4/9","Last Played":"04:32:49"},
{"Heard":false,"Progress":0.6,"Genre":"Classic Rock","Artist":"Artist O1","Year":1993,"Album":"Album O1","Name":"Song O1","Length":"03:15","Track":4,"Composer":"Composer O1","Download Date":"1947/12/6","Last Played":"03:47:49"},
{"Heard":true,"Progress":0.7,"Genre":"Jazz","Artist":"Artist Q0","Year":1992,"Album":"Album Q0","Name":"Song Q0","Length":"07:00","Track":8,"Composer":"Composer Q0","Download Date":"1906/3/22","Last Played":"21:56:15"},
{"Heard":true,"Progress":0.3,"Genre":"Progressive Rock","Artist":"Artist R0","Year":1992,"Album":"Album R0","Name":"Song R0","Length":"20:40","Track":5,"Composer":"Composer R0","Download Date":"1994/11/29","Last Played":"03:25:19"},
{"Heard":true,"Progress":0.4,"Genre":"Rock","Artist":"Artist W3","Year":1968,"Album":"Album W3","Name":"Song W3","Length":"08:00","Track":9,"Composer":"Composer W3","Download Date":"1973/9/11","Last Played":"19:49:41"},
{"Heard":true,"Progress":0.87,"Genre":"Jazz","Artist":"Artist P2","Year":1989,"Album":"Album P2","Name":"Song P2","Length":"08:20","Track":5,"Composer":"Composer P2","Download Date":"2010/4/15","Last Played":"01:13:08"},
{"Heard":false,"Progress":0.618,"Genre":"Easy Listening","Artist":"Artist F2","Year":1991,"Album":"Album F2","Name":"Song F2","Length":"05:16","Track":4,"Composer":"Composer F2","Download Date":"2035/4/12","Last Played":"06:16:53"},
{"Heard":true,"Progress":0.141,"Genre":"Progressive Rock","Artist":"Artist N2","Year":1977,"Album":"Album N2","Name":"Song N2","Length":"01:58","Track":6,"Composer":"Composer N2","Download Date":"2032/11/21","Last Played":"08:23:26"},
{"Heard":true,"Progress":1,"Genre":"Classic Rock","Artist":"Artist S3","Year":2004,"Album":"Album S3","Name":"Song S3","Length":"05:04","Track":1,"Composer":"Composer S3","Download Date":"2036/5/26","Last Played":"22:10:19"},
{"Heard":true,"Progress":0,"Genre":"Blues","Artist":"Artist V1","Year":1991,"Album":"Album V1","Name":"Song V1","Length":"08:27","Track":3,"Composer":"Composer V1","Download Date":"1904/4/4","Last Played":"18:28:08"},
{"Heard":true,"Progress":0.123,"Genre":"Easy Listening","Artist":"Artist U1","Year":1991,"Album":"Album U1","Name":"Song U1","Length":"03:23","Track":5,"Composer":"Composer U1","Download Date":"1902/10/12","Last Played":"23:09:23"},
{"Heard":false,"Progress":0.2,"Genre":"World","Artist":"Artist T3","Year":1995,"Album":"Album T3","Name":"Song T3","Length":"04:14","Track":2,"Composer":"Composer T3","Download Date":"2035/2/9","Last Played":"00:11:15"},
{"Heard":true,"Progress":0.3,"Genre":"Classic Rock","Artist":"Artist X3","Year":1968,"Album":"Album X3","Name":"Song X3","Length":"03:27","Track":6,"Composer":"Composer X3","Download Date":"1902/4/7","Last Played":"16:58:08"},
{"Heard":true,"Progress":0.4,"Genre":"Classical","Artist":"Artist M2","Year":2004,"Album":"Album M2","Name":"Song M2","Length":"06:25","Track":6,"Composer":"Composer M2","Download Date":"1904/10/25","Last Played":"06:59:04"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist O2","Year":1989,"Album":"Album O2","Name":"Song O2","Length":"08:22","Track":3,"Composer":"Composer O2","Download Date":"1905/5/22","Last Played":"23:43:08"},
{"Heard":true,"Progress":0.6,"Genre":"Pop and R&B","Artist":"Artist C0","Year":2000,"Album":"Album C0","Name":"Song C0","Length":"04:29","Track":3,"Composer":"Composer C0","Download Date":"1927/11/19","Last Played":"02:34:41"},
{"Heard":true,"Progress":0.5,"Genre":"Pop and R&B","Artist":"Artist B2","Year":1974,"Album":"Album B2","Name":"Song B2","Length":"02:46","Track":1,"Composer":"Composer B2","Download Date":"1927/5/24","Last Played":"13:27:11"},
{"Heard":false,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist Z3","Year":1962,"Album":"Album Z3","Name":"Song Z3","Length":"03:00","Track":10,"Composer":"Composer Z3","Download Date":"1932/7/16","Last Played":"08:15:00"},
{"Heard":true,"Progress":0.5,"Genre":"Classical","Artist":"Artist X1","Year":1957,"Album":"Album X1","Name":"Song X1","Length":"01:33","Track":1,"Composer":"Composer X1","Download Date":"2022/6/9","Last Played":"08:40:19"},
{"Heard":false,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist E2","Year":1977,"Album":"Album E2","Name":"Song E2","Length":"04:41","Track":1,"Composer":"Composer E2","Download Date":"2022/6/6","Last Played":"01:27:11"},
{"Heard":false,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist S1","Year":2004,"Album":"Album S1","Name":"Song S1","Length":"05:26","Track":2,"Composer":"Composer S1","Download Date":"1996/4/7","Last Played":"03:53:26"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist H1","Year":1993,"Album":"Album H1","Name":"Song H1","Length":"03:23","Track":7,"Composer":"Composer H1","Download Date":"1941/4/23","Last Played":"04:52:30"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist A2","Year":1998,"Album":"Album A2","Name":"Song A2","Length":"07:01","Track":4,"Composer":"Composer A2","Download Date":"2019/8/19","Last Played":"12:45:00"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist U3","Year":2004,"Album":"Album U3","Name":"Song U3","Length":"06:57","Track":7,"Composer":"Composer U3","Download Date":"1973/9/24","Last Played":"15:02:49"},
{"Heard":true,"Progress":0.5,"Genre":"World","Artist":"Artist T2","Year":1995,"Album":"Album T2","Name":"Song T2","Length":"05:56","Track":8,"Composer":"Composer T2","Download Date":"2007/10/27","Last Played":"20:23:26"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist Z1","Year":1958,"Album":"Album Z1","Name":"Song Z1","Length":"05:22","Track":1,"Composer":"Composer Z1","Download Date":"1912/6/9","Last Played":"09:30:56"},
{"Heard":false,"Progress":0.9,"Genre":"Classical","Artist":"Artist D2","Year":1992,"Album":"Album D2","Name":"Song D2","Length":"02:14","Track":5,"Composer":"Composer D2","Download Date":"1943/9/16","Last Played":"12:14:04"},
{"Heard":false,"Progress":0.9,"Genre":"Classical","Artist":"Artist Q2","Year":1955,"Album":"Album Q2","Name":"Song Q2","Length":"05:16","Track":1,"Composer":"Composer Q2","Download Date":"1946/10/11","Last Played":"09:14:04"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist G2","Year":1968,"Album":"Album G2","Name":"Song G2","Length":"01:32","Track":1,"Composer":"Composer G2","Download Date":"1967/12/16","Last Played":"23:23:26"},
{"Heard":true,"Progress":0.5,"Genre":"World","Artist":"Artist S0","Year":2005,"Album":"Album S0","Name":"Song S0","Length":"08:00","Track":8,"Composer":"Composer S0","Download Date":"2002/10/10","Last Played":"01:21:34"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist Y3","Year":2005,"Album":"Album Y3","Name":"Song Y3","Length":"05:03","Track":3,"Composer":"Composer Y3","Download Date":"1949/9/13","Last Played":"16:01:53"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist P1","Year":1998,"Album":"Album P1","Name":"Song P1","Length":"05:35","Track":5,"Composer":"Composer P1","Download Date":"2020/5/12","Last Played":"15:25:19"},
{"Heard":true,"Progress":0.5,"Genre":"Pop and R&B","Artist":"Artist D0","Year":2000,"Album":"Album D0","Name":"Song D0","Length":"03:24","Track":5,"Composer":"Composer D0","Download Date":"1962/4/10","Last Played":"19:52:30"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist R2","Year":1996,"Album":"Album R2","Name":"Song R2","Length":"06:29","Track":2,"Composer":"Composer R2","Download Date":"2025/6/27","Last Played":"12:14:04"},
{"Heard":false,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist M1","Year":1978,"Album":"Album M1","Name":"Song M1","Length":"02:07","Track":6,"Composer":"Composer M1","Download Date":"2008/6/9","Last Played":"15:53:26"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist A0","Year":2003,"Album":"Album A0","Name":"Song A0","Length":"01:50","Track":6,"Composer":"Composer A0","Download Date":"2018/8/13","Last Played":"19:21:34"},
{"Heard":false,"Progress":0.9,"Genre":"Classical","Artist":"Artist H2","Year":1957,"Album":"Album H2","Name":"Song H2","Length":"01:15","Track":8,"Composer":"Composer H2","Download Date":"2008/12/29","Last Played":"18:33:45"},
{"Heard":false,"Progress":0.9,"Genre":"Classical","Artist":"Artist T0","Year":2004,"Album":"Album T0","Name":"Song T0","Length":"05:12","Track":5,"Composer":"Composer T0","Download Date":"1906/3/11","Last Played":"17:54:23"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist I1","Year":1968,"Album":"Album I1","Name":"Song I1","Length":"14:59","Track":4,"Composer":"Composer I1","Download Date":"1904/12/18","Last Played":"03:00:00"},
{"Heard":false,"Progress":0.9,"Genre":"Classical","Artist":"Artist G0","Year":1957,"Album":"Album G0","Name":"Song G0","Length":"05:02","Track":7,"Composer":"Composer G0","Download Date":"1907/4/11","Last Played":"17:37:30"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist V3","Year":1997,"Album":"Album V3","Name":"Song V3","Length":"04:51","Track":7,"Composer":"Composer V3","Download Date":"1929/1/24","Last Played":"08:51:34"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist W0","Year":1992,"Album":"Album W0","Name":"Song W0","Length":"03:41","Track":6,"Composer":"Composer W0","Download Date":"1921/3/29","Last Played":"13:38:26"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist N1","Year":1962,"Album":"Album N1","Name":"Song N1","Length":"06:33","Track":3,"Composer":"Composer N1","Download Date":"2019/4/14","Last Played":"16:21:34"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist K1","Year":1993,"Album":"Album K1","Name":"Song K1","Length":"02:26","Track":2,"Composer":"Composer K1","Download Date":"1973/1/5","Last Played":"18:45:00"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist Q1","Year":1978,"Album":"Album Q1","Name":"Song Q1","Length":"03:23","Track":7,"Composer":"Composer Q1","Download Date":"1938/6/17","Last Played":"10:04:41"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist F0","Year":1968,"Album":"Album F0","Name":"Song F0","Length":"01:23","Track":1,"Composer":"Composer F0","Download Date":"2015/2/12","Last Played":"00:39:23"},
{"Heard":true,"Progress":0.5,"Genre":"Pop and R&B","Artist":"Artist B4","Year":2000,"Album":"Album B4","Name":"Song B4","Length":"04:28","Track":2,"Composer":"Composer B4","Download Date":"1933/3/16","Last Played":"21:00:00"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist K2","Year":1993,"Album":"Album K2","Name":"Song K2","Length":"02:40","Track":8,"Composer":"Composer K2","Download Date":"2012/10/6","Last Played":"04:10:19"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist S2","Year":1993,"Album":"Album S2","Name":"Song S2","Length":"04:38","Track":7,"Composer":"Composer S2","Download Date":"1917/9/28","Last Played":"09:42:11"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist U2","Year":2003,"Album":"Album U2","Name":"Song U2","Length":"03:03","Track":2,"Composer":"Composer U2","Download Date":"1946/8/23","Last Played":"06:30:56"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist H0","Year":1977,"Album":"Album H0","Name":"Song H0","Length":"04:29","Track":2,"Composer":"Composer H0","Download Date":"2035/8/13","Last Played":"17:17:49"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist V2","Year":1969,"Album":"Album V2","Name":"Song V2","Length":"05:11","Track":2,"Composer":"Composer V2","Download Date":"1993/6/13","Last Played":"03:28:08"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist R1","Year":1992,"Album":"Album R1","Name":"Song R1","Length":"06:40","Track":4,"Composer":"Composer R1","Download Date":"1996/8/31","Last Played":"03:39:23"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist X2","Year":1993,"Album":"Album X2","Name":"Song X2","Length":"02:53","Track":1,"Composer":"Composer X2","Download Date":"2004/5/23","Last Played":"22:49:41"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist W2","Year":1992,"Album":"Album W2","Name":"Song W2","Length":"02:16","Track":5,"Composer":"Composer W2","Download Date":"1959/10/10","Last Played":"10:21:34"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist E0","Year":1968,"Album":"Album E0","Name":"Song E0","Length":"04:38","Track":6,"Composer":"Composer E0","Download Date":"1997/6/25","Last Played":"20:57:11"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist K0","Year":1969,"Album":"Album K0","Name":"Song K0","Length":"03:04","Track":4,"Composer":"Composer K0","Download Date":"1901/5/3","Last Played":"10:27:11"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist Z0","Year":1968,"Album":"Album Z0","Name":"Song Z0","Length":"02:10","Track":2,"Composer":"Composer Z0","Download Date":"1926/6/26","Last Played":"16:52:30"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist J1","Year":1968,"Album":"Album J1","Name":"Song J1","Length":"05:57","Track":2,"Composer":"Composer J1","Download Date":"1977/6/30","Last Played":"08:00:56"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist D1","Year":1997,"Album":"Album D1","Name":"Song D1","Length":"06:38","Track":3,"Composer":"Composer D1","Download Date":"1997/12/14","Last Played":"01:13:08"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist A4","Year":1993,"Album":"Album A4","Name":"Song A4","Length":"03:33","Track":6,"Composer":"Composer A4","Download Date":"2016/4/6","Last Played":"18:28:08"},
{"Heard":true,"Progress":0.5,"Genre":"Pop and R&B","Artist":"Artist C2","Year":2000,"Album":"Album C2","Name":"Song C2","Length":"03:52","Track":1,"Composer":"Composer C2","Download Date":"1906/9/20","Last Played":"21:16:53"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist L0","Year":1993,"Album":"Album L0","Name":"Song L0","Length":"02:54","Track":4,"Composer":"Composer L0","Download Date":"1914/5/21","Last Played":"22:55:19"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist I2","Year":2005,"Album":"Album I2","Name":"Song I2","Length":"04:42","Track":6,"Composer":"Composer I2","Download Date":"1913/1/27","Last Played":"13:49:41"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist A3","Year":1996,"Album":"Album A3","Name":"Song A3","Length":"02:44","Track":1,"Composer":"Composer A3","Download Date":"2006/3/2","Last Played":"18:28:08"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist Y2","Year":"","Album":"Album Y2","Name":"Song Y2","Length":"05:41","Track":9,"Composer":"Composer Y2","Download Date":"2023/7/1","Last Played":"23:00:56"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist J2","Year":1962,"Album":"Album J2","Name":"Song J2","Length":"06:21","Track":7,"Composer":"Composer J2","Download Date":"1921/12/8","Last Played":"16:55:19"},
{"Heard":true,"Progress":0.5,"Genre":"Classical","Artist":"Artist D4","Year":2004,"Album":"Album D4","Name":"Song D4","Length":"01:32","Track":2,"Composer":"Composer D4","Download Date":"1976/5/5","Last Played":"15:42:11"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist F4","Year":1996,"Album":"Album F4","Name":"Song F4","Length":"05:18","Track":3,"Composer":"Composer F4","Download Date":"1912/10/25","Last Played":"07:01:53"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist Z2","Year":1990,"Album":"Album Z2","Name":"Song Z2","Length":"02:57","Track":12,"Composer":"Composer Z2","Download Date":"1909/8/12","Last Played":"03:16:53"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist G1","Year":1998,"Album":"Album G1","Name":"Song G1","Length":"06:58","Track":3,"Composer":"Composer G1","Download Date":"1979/5/27","Last Played":"21:22:30"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist Y1","Year":1968,"Album":"Album Y1","Name":"Song Y1","Length":"02:26","Track":3,"Composer":"Composer Y1","Download Date":"1989/6/5","Last Played":"04:24:23"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist C4","Year":1978,"Album":"Album C4","Name":"Song C4","Length":"07:23","Track":1,"Composer":"Composer C4","Download Date":"1949/6/29","Last Played":"01:24:23"},
{"Heard":true,"Progress":0.5,"Genre":"World","Artist":"Artist B3","Year":1995,"Album":"Album B3","Name":"Song B3","Length":"02:07","Track":6,"Composer":"Composer B3","Download Date":"2001/12/27","Last Played":"10:46:53"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist D3","Year":1977,"Album":"Album D3","Name":"Song D3","Length":"03:51","Track":9,"Composer":"Composer D3","Download Date":"1994/10/6","Last Played":"18:00:00"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist L1","Year":1996,"Album":"Album L1","Name":"Song L1","Length":"04:24","Track":4,"Composer":"Composer L1","Download Date":"1926/1/4","Last Played":"00:02:49"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist C3","Year":2004,"Album":"Album C3","Name":"Song C3","Length":"06:12","Track":8,"Composer":"Composer C3","Download Date":"1938/7/16","Last Played":"00:56:15"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist G4","Year":1993,"Album":"Album G4","Name":"Song G4","Length":"04:39","Track":3,"Composer":"Composer G4","Download Date":"2029/2/25","Last Played":"21:14:04"},
{"Heard":true,"Progress":0.5,"Genre":"Classical","Artist":"Artist E3","Year":1957,"Album":"Album E3","Name":"Song E3","Length":"02:59","Track":2,"Composer":"Composer E3","Download Date":"1978/10/15","Last Played":"11:54:23"},
{"Heard":true,"Progress":0.5,"Genre":"Rock","Artist":"Artist F3","Year":1996,"Album":"Album F3","Name":"Song F3","Length":"04:09","Track":8,"Composer":"Composer F3","Download Date":"1906/1/5","Last Played":"20:20:38"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist J0","Year":1958,"Album":"Album J0","Name":"Song J0","Length":"07:35","Track":4,"Composer":"Composer J0","Download Date":"1953/5/20","Last Played":"10:24:23"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist H4","Year":2004,"Album":"Album H4","Name":"Song H4","Length":"06:18","Track":1,"Composer":"Composer H4","Download Date":"1908/7/24","Last Played":"16:38:26"},
{"Heard":true,"Progress":0.5,"Genre":"Blues","Artist":"Artist L2","Year":1993,"Album":"Album L2","Name":"Song L2","Length":"05:43","Track":4,"Composer":"Composer L2","Download Date":"1971/2/24","Last Played":"01:01:53"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist E4","Year":1978,"Album":"Album E4","Name":"Song E4","Length":"06:43","Track":4,"Composer":"Composer E4","Download Date":"1955/2/12","Last Played":"01:49:41"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist R4","Year":"","Album":"Album R4","Name":"Song R4","Length":"06:41","Track":7,"Composer":"Composer R4","Download Date":"1961/12/22","Last Played":"23:40:19"},
{"Heard":false,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist P0","Year":1991,"Album":"Album P0","Name":"Song P0","Length":"04:29","Track":9,"Composer":"Composer P0","Download Date":"1943/9/1","Last Played":"15:59:04"},
{"Heard":true,"Progress":0.5,"Genre":"Pop and R&B","Artist":"Artist Q4","Year":1974,"Album":"Album Q4","Name":"Song Q4","Length":"03:22","Track":2,"Composer":"Composer Q4","Download Date":"2013/12/5","Last Played":"09:59:04"},
{"Heard":true,"Progress":0.5,"Genre":"Classical","Artist":"Artist T4","Year":1965,"Album":"Album T4","Name":"Song T4","Length":"03:06","Track":7,"Composer":"Composer T4","Download Date":"2032/12/26","Last Played":"07:49:41"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist G3","Year":1962,"Album":"Album G3","Name":"Song G3","Length":"07:05","Track":1,"Composer":"Composer G3","Download Date":"2032/12/25","Last Played":"07:30:00"},
{"Heard":false,"Progress":0.9,"Genre":"Classical","Artist":"Artist M4","Year":1965,"Album":"Album M4","Name":"Song M4","Length":"04:45","Track":4,"Composer":"Composer M4","Download Date":"2017/1/6","Last Played":"05:54:23"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist I3","Year":2004,"Album":"Album I3","Name":"Song I3","Length":"06:31","Track":1,"Composer":"Composer I3","Download Date":"1988/6/13","Last Played":"09:22:30"},
{"Heard":true,"Progress":0.5,"Genre":"Easy Listening","Artist":"Artist U0","Year":2003,"Album":"Album U0","Name":"Song U0","Length":"01:44","Track":1,"Composer":"Composer U0","Download Date":"1923/10/17","Last Played":"14:09:23"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist Y0","Year":1992,"Album":"Album Y0","Name":"Song Y0","Length":"06:47","Track":4,"Composer":"Composer Y0","Download Date":"1996/11/14","Last Played":"00:36:34"},
{"Heard":true,"Progress":0.5,"Genre":"Classic Rock","Artist":"Artist S4","Year":1968,"Album":"Album S4","Name":"Song S4","Length":"04:10","Track":7,"Composer":"Composer S4","Download Date":"2008/3/1","Last Played":"14:48:45"},
{"Heard":true,"Progress":0.5,"Genre":"World","Artist":"Artist H3","Year":1995,"Album":"Album H3","Name":"Song H3","Length":"03:59","Track":9,"Composer":"Composer H3","Download Date":"2021/5/21","Last Played":"11:45:56"},
{"Heard":false,"Progress":0.5,"Genre":"Blues","Artist":"Artist U4","Year":2005,"Album":"Album U4","Name":"Song U4","Length":"04:50","Track":1,"Composer":"Composer U4","Download Date":"2020/1/13","Last Played":"08:23:26"},
{"Heard":true,"Progress":0.5,"Genre":"Classical","Artist":"Artist K4","Year":1992,"Album":"Album K4","Name":"Song K4","Length":"02:59","Track":3,"Composer":"Composer K4","Download Date":"1986/5/4","Last Played":"20:54:23"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist N0","Year":1958,"Album":"Album N0","Name":"Song N0","Length":"04:54","Track":8,"Composer":"Composer N0","Download Date":"1900/8/15","Last Played":"04:01:53"},
{"Heard":true,"Progress":0.5,"Genre":"Jazz","Artist":"Artist W1","Year":1989,"Album":"Album W1","Name":"Song W1","Length":"09:39","Track":6,"Composer":"Composer W1","Download Date":"1907/3/5","Last Played":"23:29:04"},
{"Heard":true,"Progress":0.5,"Genre":"Progressive Rock","Artist":"Artist O4","Year":1978,"Album":"Album O4","Name":"Song O4","Length":"05:02","Track":3,"Composer":"Composer O4","Download Date":"1992/3/28","Last Played":"00:22:30"}
	];

	var textDecorator = function(){
		return [
			"<div dojoType='dijit.form.TextBox' class='gridxHasGridCellValue' style='width: 100%;'></div>",
			"<button>Button</button>",
			"<a href='www.google.com'>Google</a>"
		].join('');
	};

	var linkDecorator = function(data, rowId, rowIndex){
		return ["<a href='http://www.google.com.hk/search?q=", encodeURI(data), "'>[Google]  ", data, "</a><br />",
			"<a href='http://bing.com/search?q=", encodeURI(data), "'>[Bing]  ", data, "</a><br />",
			"<a href='http://search.yahoo.com/search?p=", encodeURI(data), "'>[Yahoo]  ", data, "</a>"
		].join('');
	};

	var progressDecorator = function(){
		return [
			"<div data-dojo-type='dijit.ProgressBar' data-dojo-props='maximum: 1' class='gridxHasGridCellValue' style='width: 100%;'></div>"
		].join('');
	};

	var timeDecorator = function(){
		return [
			"<div dojoType='dijit.form.TimeTextBox' dojoAttachPoint='timeBox' class='gridxHasGridCellValue' style='width: 100%;'></div>"
		].join('');
	};

	var setDate = function(storeData){
		var res = locale.parse(storeData, {
			selector: 'date',
			datePattern: 'yyyy/M/d'
		});
		console.log('from ', storeData, ' to ', res);
		return res;
	};

	var getDate = function(d){
		res = locale.format(d, {
			selector: 'date',
			datePattern: 'yyyy/M/d'
		});
		console.log('from ', d, ' to ', res);
		return res;
	};

	var setTime = function(storeData){
		var res = locale.parse(storeData, {
			selector: 'time',
			timePattern: 'hh:mm:ss'
		});
		console.log('from ', storeData, ' to ', res);
		return res;
	};

	var getTime = function(d){
		res = locale.format(d, {
			selector: 'time',
			timePattern: 'hh:mm:ss'
		});
		console.log('from ', d, ' to ', res);
		return res;
	};

	return {
		getData: function(size){
			size = size === undefined ? 100 : size;
			var data = {
				identifier: 'id', 
				label: 'id', 
				items: []
			};
			for(var i = 0; i < size; ++i){
				var item = items[i % items.length];
				data.items.push(lang.mixin({
					id: i,
					order: i + 1,
					Color: new Color([Math.sin(i) * 100, Math.cos(i) * 100, i * i]).toHex()
				}, item));
			}
			return data;
		},

		layouts: [
			[
				{id: 'id', field: 'id', name: 'Identity', width: '80px'},
				{id: 'order', field: 'order', name: 'Order', width: '80px'},
				{id: 'Genre', field: 'Genre', name: 'Genre', width: '100px', alwaysEditing: true},
				{id: 'Artist', field: 'Artist', name: 'Artist', width: '120px'},
				{id: 'Year', field: 'Year', name: 'Year', width: '80px'},
				{id: 'Album', field: 'Album', name: 'Album', width: '160px'},
				{id: 'Name', field: 'Name', name: 'Name', width: '80px'},
				{id: 'Length', field: 'Length', name: 'Length', width: '80px'},
				{id: 'Track', field: 'Track', name: 'Track', width: '80px'},
				{id: 'Composer', field: 'Composer', name: 'Composer', width: '160px'},
				{id: 'Download Date', field: 'Download Date', name: 'Download Date', width: '160px'},
				{id: 'Last Played', field: 'Last Played', name: 'Last Played', width: '120px'},
				{id: 'Heard', field: 'Heard', name: 'Heard', width: '80px'}
			],
			[
				{id: 'id', field: 'id', name: 'Identity', dataType: 'number'},
				{id: 'Genre', field: 'Genre', name: 'Genre', dataType: 'enum', enumOptions: ['a', 'b', 'c']},
				{id: 'Artist', field: 'Artist', name: 'Artist', dataType: 'enum', enumOptions: ['d', 'e', 'f']},
				{id: 'Album', field: 'Album', name: 'Album', dataType: 'string'},
				{id: 'Name', field: 'Name', name: 'Name', dataType: 'string'},
				{id: 'Year', field: 'Year', name: 'Year', dataType: 'number'},
				{id: 'Length', field: 'Length', name: 'Length', dataType: 'string'},
				{id: 'Track', field: 'Track', name: 'Track', dataType: 'number'},
				{id: 'Composer', field: 'Composer', name: 'Composer', dataType: 'string'},
				{id: 'Download Date', field: 'Download Date', name: 'Download Date', dataType: 'date'},
				{id: 'Last Played', field: 'Last Played', name: 'Last Played', dataType: 'time'},
				{id: 'Heard', field: 'Heard', name: 'Heard', dataType: 'boolean'}
			],
			[
				{id: 'Genre', field: 'Genre', name: 'Genre', dataType: 'string'},
				{id: 'Artist', field: 'Artist', name: 'Artist', dataType: 'string'},
				{id: 'Year', field: 'Year', name: 'Year', dataType: 'number'},
				{id: 'Album', field: 'Album', name: 'Album', dataType: 'string'},
				{id: 'Name', field: 'Name', name: 'Name', dataType: 'string'},
				{id: 'Length', field: 'Length', name: 'Length', dataType: 'string'},
				{id: 'Track', field: 'Track', name: 'Track', dataType: 'number'},
				{id: 'Composer', field: 'Composer', name: 'Composer', dataType: 'string'},
				{id: 'Download Date', field: 'Download Date', name: 'Download Date', dataType: 'date'},
				{id: 'Last Played', field: 'Last Played', name: 'Last Played', dataType: 'time'},
				{id: 'Heard', field: 'Heard', name: 'Heard', dataType: 'boolean'}
			],
			[
				{ field: "id", name:"Index", dataType:"number", width: '100px'},
				{ field: "Genre", name:"Genre", width: '100px', 
					decorator: textDecorator, 
					widgetsInCell: true,
					navigable: true
				},
				{ field: "Artist", name:"Artist (editable)", width: '20%', 
					decorator: linkDecorator,
					navigable: true,
					editable: true
				},
				{ field: "Year", name:"Year (editable)", dataType:"number", width: '100px', 
					editable: true, 
					editor: NumberTextBox
				},
				{ field: "Album", name:"Album (editable)", width: '100px',
					editable: true,
					editor: Editor
				},
				{ field: "Name", name:"Name", width: '100px'},
				{ field: "Length", name:"Length", width: '100px'},
				{ field: "Track", name:"Track", width: '100px'},
				{ field: "Composer", name:"Composer", dataType:"boolean", width: '100px'},
				{ field: "Progress", name:"Progress", dataType:"number", width: '100px',
					decorator: progressDecorator,
					widgetsInCell: true
				},
				{ field: "Download Date", name:"Date (editable)", width: '100px', 
					dataType:"date", 
					storePattern: 'yyyy/M/d',
					formatter: 'MMMM d, yyyy',
					editable: true, 
					editor: DateTextBox
				},
				{ field: "Last Played", name:"Last Played (editable)", width: '100px', 
					dataType:"time",
					storePattern: 'HH:mm:ss',
					formatter: 'hh:mm a',

//                    navigable: true,
//                    decorator: timeDecorator,
//                    widgetsInCell: true,
//                    setCellValue: function(gridData, storeData, cellWidget){
//                        var t = locale.parse(storeData, {
//                            selector: 'time',
//                            timePattern: 'HH:mm:ss'
//                        });
//                        cellWidget.timeBox.set('value', t);
//                    },

					editable: true,
					editor: TimeTextBox
				}
			],			
			[
				{id: 'id', field: 'id', name: 'Identity'},
				{id: 'Year', field: 'Year', name: 'Year'},
				{id: 'Length', field: 'Length', name: 'Length'},
				{id: 'Track', field: 'Track', name: 'Track'},
				{id: 'Download Date', field: 'Download Date', name: 'Download Date'},
				{id: 'Last Played', field: 'Last Played', name: 'Last Played'},
				{id: 'Heard', field: 'Heard', name: 'Heard'}
			],
			[
				{id: 'id', field: 'id', name: 'Identity', width: '120px'},
				{id: 'Genre', field: 'Genre', name: 'Genre', width: '180px', sortable: 'ascend'},
				{id: 'Artist', field: 'Artist', name: 'Artist', width: '220px', sortable: 'descend'},
				{id: 'Year', field: 'Year', name: 'Year', width: '100px', sortable: false},
				{id: 'Album', field: 'Album', name: 'Album', width: '260px'},
				{id: 'Name', field: 'Name', name: 'Name', width: '160px'},
				{id: 'Length', field: 'Length', name: 'Length', width: '120px'},
				{id: 'Track', field: 'Track', name: 'Track', width: '120px'},
				{id: 'Composer', field: 'Composer', name: 'Composer', width: '360px'},
				{id: 'Download Date', field: 'Download Date', name: 'Download Date', width: '260px'},
				{id: 'Last Played', field: 'Last Played', name: 'Last Played', width: '220px'},
				{id: 'Heard', field: 'Heard', name: 'Heard', width: '80px'}
			],
			[
				{id: 'id', field: 'id', name: 'Identity'},
				{id: 'Name', field: 'Name', name: 'Name'},
				{id: 'Year', field: 'Year', name: 'Year'}
			],
			[
				{id: 'id', field: 'id', name: 'Identity'},
				{id: 'Genre', field: 'Genre', name: 'Genre'},
				{id: 'Artist', field: 'Artist', name: 'Artist'}
			],
			[
				{id: 'id', field: 'id', name: 'Identity'},
				{id: 'Album', field: 'Album', name: 'Album'},
				{id: 'Composer', field: 'Composer', name: 'Composer'}
			],
			[
				{id: 'id', field: 'id', name: 'Identity', width: '100px'},
				{id: 'Name', field: 'Name', name: 'Name', width: '100px'},
				{id: 'Year', field: 'Year', name: 'Year', width: '100px'},
				{id: 'Genre', field: 'Genre', name: 'Genre'},
				{id: 'Artist', field: 'Artist', name: 'Artist'},
				{id: 'Album', field: 'Album', name: 'Album'},
				{id: 'Composer', field: 'Composer', name: 'Composer'}
			]
		]
	};
});

