/*

Copyright (c) 2013 Mapo developpers and contributors <mapo.tizen@gmail.com>

This file is part of Mapo.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

 */


/*
 * Application Global variables
 */

var map;
var isOnline = false;

/*
 * Schedule
 */

function log(message) {
	if (!false) console.log("# " + message);
}


/*
 * Link Manager
 */

function getOSMLink(lat, lon) {
	var url = 
		"http://www.openstreetmap.org/?&zoom=10&layers=mapnik&lat=${lat}&lon=${lon}";
	url = url.replace("${lon}", lon);
	url = url.replace("${lat}", lat);
	return url;
}

function goToOSM() {
	if (isOnline) {
		var appControl = new tizen.ApplicationControl(
				"http://tizen.org/appcontrol/operation/view", getOSMLink($(
						"#lat").val(), $("#lon").val()), null);
		var appControlReplyCallback = {
			onsuccess : function(data) {
				for ( var i = 0; i < data.length; i++) {
					console.log("#" + i + " key:" + data[i].key);
					for ( var j = 0; j < data[i].value.length; j++) {
						console.log("   value#" + j + ":" + data[i].value[j]);
					}
				}
			},
			onfailure : function() {
				console.log('The launch application control failed');
			}
		}
		tizen.application.launchAppControl(appControl, null, function() {
			console.log("launch internet application control succeed");
		}, function(e) {
			console.log("launch internet application control failed. reason: "
					+ e.message);
		}, appControlReplyCallback);
	} else {
		alert("Please connect your application online in the settings"
				+ " if you want to open a browser")
	}
}

function updateLinks(lat, lon) {
	$('#OSMLink').attr('href', getOSMLink(lat, lon));
}


/*
 * Map Manager
 */

function getMapSize() {
	var viewHeight = $(window).height();
	var viewWidth = $(window).width();
	var header = $("div[data-role='header']:visible:visible");
	var footer = $("div[data-role='footer']:visible:visible");
	var navbar = $("div[data-role='navbar']:visible:visible");
	var content = $("div[data-role='content']:visible:visible");
	var contentHeight = viewHeight - header.outerHeight()
			- navbar.outerHeight() - footer.outerHeight();
	var contentWidth = viewWidth - 30;
	return [ contentWidth, contentHeight ];
}

function setMapSize() {
	var mapSize = getMapSize();
	$('#myMap').css("width", mapSize[0]);
	$('#myMap').css("height", mapSize[1]);
}

function chargeMap(lat, lon) {
	map = new OpenLayers.Map('myMap', {
		projection : 'EPSG:3857',
		layers : [ new OpenLayers.Layer.OSM("OpenStreetMap"),
		           new OpenLayers.Layer.Google("Google Streets",
		        		   {numZoomLevels : 20}),
		           new OpenLayers.Layer.Google("Google Physical",
		        		   {type : google.maps.MapTypeId.TERRAIN}),
		           new OpenLayers.Layer.Google("Google Hybrid",
		        		   {type : google.maps.MapTypeId.HYBRID,numZoomLevels : 20}),
		           new OpenLayers.Layer.Google("Google Satellite",
		        		   {type : google.maps.MapTypeId.SATELLITE,numZoomLevels : 22})
				 ],
		center : new OpenLayers.LonLat(lon, lat).transform('EPSG:4326', 'EPSG:3857'),
		zoom : 7
	});
	map.addControl(new OpenLayers.Control.LayerSwitcher());
}


/*
 * Transformation Manager
 */

function fromLatLonToDMS(lat, lon) {
	var latitude = lat;
	var longitude = lon;
	var text="";
	var NS="";
	if (latitude >= 0) {
		NS += "N";
	} else {
		latitude = -latitude;
		NS += "S";
	}
	var d = parseInt(latitude);
	var m = parseInt((latitude - d) * 60);
	var s = parseInt((latitude-d)*60*60 - 60*m);
	text += NS+" "+d+"° "+m+"' "+s+"\"  ";

	var EW="";
	if (longitude >= 0) {
		EW += "E";
	} else {
		EW += "W";
		longitude = -longitude;
	}
	var d = parseInt(longitude);
	var m = parseInt((longitude - d) * 60);
	var s = parseInt((longitude-d)*60*60 - 60*m);
	text += EW+" "+d+"° "+m+"' "+s+"\"";
	// text = NS+" "+d+"° "+m+"' "+s+"\"  "+EW+" "+d+"° "+m+"' "+s+"\"";
	return text;
}

function setDMS(lat, lon) {
	$('#dms').val(fromLatLonToDMS(lat, lon));
}

function fromDMSToLatLon(dms){
	var re = 
		/^([NS])\s*([0-9.-]+)\s*°\s*([0-9.-]+)\s*\'\s*([0-9.-]+)\s*\"\s*([EW])\s*([0-9.-]+)\s*°\s*([0-9.-]+)\s*\'\s*([0-9.-]+)\s*\"\s*$/;
	if (re.test(dms)) {
		var lat = parseFloat(RegExp.$2)+parseFloat(RegExp.$3)/60+parseFloat(RegExp.$4)/(60*60);
		if(RegExp.$1=='S'){
			lat=-lat;
		}
		var lon = parseFloat(RegExp.$6)+parseFloat(RegExp.$7)/60+parseFloat(RegExp.$8)/(60*60);
		if(RegExp.$5=='W'){
			lon=-lon;
		}
		return [ lat, lon ];
	} else {
		alert("Coordinate DMS invalid : "+$('#dms').val());
		
		//$('#locationInfo').html("Coordinate DMS invalid : "+$('#dms').val());
		return;
	}
}

function setLatLon(dms){
	var coordinates = fromDMSToLatLon(dms);
	setLat(coordinates[0]);
	setLon(coordinates[1]);
}

function validateDMS(dms){
	var re = 
		/^([NS])\s*([0-9.-]+)\s*°\s*([0-9.-]+)\s*\'\s*([0-9.-]+)\s*\"\s*([EW])\s*([0-9.-]+)\s*°\s*([0-9.-]+)\s*\'\s*([0-9.-]+)\s*\"\s*$/;
	if (re.test(dms)) {
		return true;
	} else {
		return false;
	}
}

function validateLatOrLon(latOrLon){
	if(/[0-9.-]+$/.test(latOrLon)){
		return true;
	} else {
		return false;
	}
}

function changeLat(){
	var lat = $('#lat').val();
	//lat = lat.toFixed(6);
	var lon = $('#lon').val();
	//lon = lon.toFixed(6);
	if(validateLatOrLon(lat)){
		setDMS(lat, lon);
		storeData();
	} else {
		alert("Latitude coordinate invalid : "+lat);
		initData();
	}
}

function changeLon(){
	var lat = $('#lat').val();//.toFixed(6);
	var lon = $('#lon').val();//.toFixed(6);
	if(validateLatOrLon(lon)){
		setDMS(lat, lon);
		storeData();
	} else {
		alert("Lontitude coordinate invalid : "+lon);
		initData();
	}
}

function changeDMS(){
	var dms = $('#dms').val();
	if(validateDMS(dms)){
		setLatLon(dms)
		storeData();
	} else {
		alert("DMS coordinate invalid : "+dms);
		initData();
	}
}


/*
 * Coordinates Manager
 */
function setLat(lat) {
	if (document.getElementById("lat").value != lat) {
		//lat = lat.toFixed(6);
		document.getElementById("lat").value = lat;
	}
}

function setLon(lon) {
	if (document.getElementById("lon").value != lon) {
		//lon = lon.toFixed(6);
		document.getElementById("lon").value = lon;
	}
}


/*
 * General Manager
 */

function set() {
	var lat = $('#lat').val();
	var lon = $('#lon').val();
	setLat(lat);
	setLon(lon);
	setDMS(lat, lon);
	updateLinks(lat, lon);
	$('#myMap').empty();
	if (isOnline) {
		setMapSize();
		chargeMap(lat, lon);
	} else {
		$('#myMap').html(
				"<p align='center'>" +
				"Please connect your application online in the settings" +
				" if you want to charge the map</p>");
	}
}

function refresh() {
	if (isOnline && !navigator.onLine) {
		$('#switchOnline').val('offline').slider('refresh');
		isOnline = false;
		alert("Connection lost");
	}
	set();
}


/*
 * Location Manager
 */
function showLocation(position) {
	set();
}

function errorLocation(error) {
	var errorInfo = document.getElementById("locationInfo");
	switch (error.code) {
	case error.PERMISSION_DENIED:
		errorInfo.innerHTML = "User denied the request for Geolocation.";
		break;
	case error.POSITION_UNAVAILABLE:
		errorInfo.innerHTML = "Location information is unavailable.";
		break;
	case error.TIMEOUT:
		errorInfo.innerHTML = "The request to get user location timed out.";
		break;
	case error.UNKNOWN_ERROR:
		errorInfo.innerHTML = "An unknown error occurred.";
		break;
	}
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showLocation, errorLocation,
				{enableHighAccuracy : $('#switchEnergy').val() == 'off'});
	} else {
		document.getElementById("locationInfo").innerHTML = 
			"Geolocation is not supported by this browser.";
	}
}


/*
 * Recording manager
 */

var docDir;
var doc;
var file;

function onResolveSuccess(dir) {
	docDir = dir;
	var dateFile = new Date();
	doc = 'MAPO_' + dateFile + ".txt";
	doc = doc.replace(/ /g, "-");
	doc = doc.replace(/:/g, "-");
	doc = doc.replace("-GMT+0900-(KST)", "");
	docDir.createFile(doc);
	$('#locationInfo').html("Course recording in the file : " + doc);
}

function onResolveError(e) {
	console.log('message: ' + e.message);
}

function resolveFile() {
	try {
		file = docDir.resolve(doc);
	} catch (exc) {
		console.log('Could not resolve file: ' + exc.message);
		// Stop in case of any errors
		return;
	}
}

function onRecordError(e) {
	var msg = '';
	switch (e.code) {
	case FileError.QUOTA_EXCEEDED_ERR:
		msg = 'QUOTA_EXCEEDED_ERR';
		break;
	case FileError.NOT_FOUND_ERR:
		msg = 'NOT_FOUND_ERR';
		break;
	case FileError.SECURITY_ERR:
		msg = 'SECURITY_ERR';
		break;
	case FileError.INVALID_MODIFICATION_ERR:
		msg = 'INVALID_MODIFICATION_ERR';
		break;
	case FileError.INVALID_STATE_ERR:
		msg = 'INVALID_STATE_ERR';
		break;
	default:
		msg = 'Unknown Error';
		break;
	}
	console.log('Error: ' + msg);
}

function writeToStream(fileStream) {
	try {
		var dateRecord = new Date();
		var lat = $("#lat").val();
		var lon = $("#lon").val();
		fileStream.write(dateRecord + ";lat:" + lat + ";lon:" + lon + "\r");
		fileStream.close();
	} catch (exc) {
		console.log('Could not write to file: ' + exc.message);
	}
}

function writeRecord() {
	try {
		file.openStream(
		// open for appending
		'a',
		// success callback - add textarea's contents
		writeToStream,
		// error callback
		onRecordError);
	} catch (exc) {
		console.log('Could not write to file: ' + exc.message);
	}
}

function readFromStream(fileStream) {
	try {
		console.log('File size: ' + file.fileSize);
		var contents = fileStream.read(fileStream.bytesAvailable);
		fileStream.close();
		console.log('file contents:' + contents);
	} catch (exc) {
		console.log('Could not read from file: ' + exc.message);
	}
}

function readRecord() {
	try {
		file.openStream(
		// open for reading
		'r',
		// success callback - add textarea's contents
		readFromStream,
		// error callback
		onRecordError);
	} catch (exc) {
		console.log('Could not write to file: ' + exc.message);
	}
}

function recordLocation(position) {
	if ($('#switchRecord').val() == "start") {
		set();
		resolveFile();
		writeRecord();
		readRecord();
	}
}

function errorPosition(error) {
	$('#switchRecord').val('stop').slider('refresh');
	var errorInfo = document.getElementById("locationInfo");
	switch (error.code) {
	case error.PERMISSION_DENIED:
		errorInfo.innerHTML = "User denied the request for Geolocation.";
		break;
	case error.POSITION_UNAVAILABLE:
		errorInfo.innerHTML = "Location information is unavailable.";
		break;
	case error.TIMEOUT:
		errorInfo.innerHTML = "The request to get user location timed out.";
		break;
	case error.UNKNOWN_ERROR:
		errorInfo.innerHTML = "An unknown error occurred.";
		break;
	}
}

function getPosition() {
	navigator.geolocation.getCurrentPosition(recordLocation, errorPosition,
			{enableHighAccuracy : $('#switchEnergy').val() == 'off'});
}

function record() {
	if (navigator.geolocation) {
		if ($('#switchRecord').val() == "start") {
			tizen.filesystem.resolve('documents', onResolveSuccess,
					onResolveError, 'rw');
			getPosition();
			var intervalID = setInterval(getPosition, $('#selectorTimeout')
					.val() * 1000);
			// alert($('#selectorTimeout').val());
		} else {
			clearInterval(intervalID);
			$('#locationInfo').html("Course recorded in the file : " + doc);
		}
	} else {
		document.getElementById("locationInfo").innerHTML = 
			"Geolocation is not supported.";
	}
}


/*
 * Contact Manager
 */

function createContact() {
	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/social/add",
			null,
			"vnd.tizen.item.type/vnd.tizen.contact", // null for the emulator
			null,
			[
			 new tizen.ApplicationControlData(
					 "http://tizen.org/appcontrol/data/social/item_type",
					 [ "contact" ]),
			 new tizen.ApplicationControlData(
					 "http://tizen.org/appcontrol/data/social/email",
					 [ "mapo.tizen+"+
					   toStringWgs84(
							   $('#lat').val(), $('#lon').val()) + "@gmail.com" ]),
			 new tizen.ApplicationControlData(
					 "http://tizen.org/appcontrol/data/social/url",
					 [ getOSMLink($("#lat").val(), $("#lon").val()) ])
			]);
	tizen.application.launchAppControl(appControl, null, 
			function() {console.log("launch service succeeded");},
			function(e) {console.log(
					"launch service failed. Reason: " +e.name);});
}


/*
 * Email Manager
 */

function sendEmail() {
	if (isOnline) {
		var message =
			"This is the position I want to show you from Mapo:" +
			"\nLatitute="+$("#lat").val()+
			"\nLongitude = "+$("#lon").val()+
			"\nIf you prefer in WGS 84, here it is: "+$('#wgs').val()+
			"\nYou can see this position on OpenStreetMap: "+$('#OSMLink').val()+
			"\nConnect you on Mapo for more details!";
		var appControl = new tizen.ApplicationControl(
				"http://tizen.org/appcontrol/operation/send", // compose or send
				"mailto:", null, null, 
				[
				 new tizen.ApplicationControlData(
						 "http://tizen.org/appcontrol/data/subject", [ "Mapo" ]),
				 new tizen.ApplicationControlData(
						 "http://tizen.org/appcontrol/data/text", [ message ]),
				 new tizen.ApplicationControlData(
						 "http://tizen.org/appcontrol/data/to", 
						 [ "mapo.tizen@gmail.com" ])
				// TODO tizen.mapo@spamgourmet.com
// new tizen.ApplicationControlData(
//	"http://tizen.org/appcontrol/data/path",
// ["images/image1.jpg"])
				]);
		tizen.application.launchAppControl(appControl, null,
				function() {console.log("launch service succeeded");}, 
				function(e) {
					console.log("launch service failed. Reason: " + e.name);});
	} else {
		alert("Please connect your application online in the settings"
				+ " if you want to send an email");
	}
}

// function sendBluetooth(){
// var appControl = new tizen.ApplicationControl(
// "http://tizen.org/appcontrol/operation/pick",
// null,
// "image/jpeg",
// null);
//
// var appControlReplyCallback = {
// // callee sent a reply
// onsuccess: function(data) {
// for (var i = 0; i < data.length; i++) {
// if (data[i].key == "http://tizen.org/appcontrol/data/selected") {
// console.log('Selected image is ' + data[i].value[0]);
// }
// }
// },
// // callee returned failure
// onfailure: function() {
// console.log('The launch application control failed');
// }
// }
//
// tizen.application.launchAppControl(
// appControl,
// null,
// function() {console.log("launch application control succeed"); },
// function(e) {console.log("launch application control failed. reason: " +
// e.message); },
// appControlReplyCallback );

// tizen.application.launch("tizen.bluetooth",
// function(){console.log("launch service succeeded");},
// function(e){console.log("launch service failed. Reason: " + e.name);});

// var appControl = new
// tizen.ApplicationControl("http://tizen.org/appcontrol/operation/bluetooth/pick",
// "Phone/Images/image16.jpg");
// tizen.application.launchAppControl(appControl, null,
// function(){console.log("launch service succeeded");},
// function(e){console.log("launch service failed. Reason: " + e.name);});
// }

// function sendMessage(){
// var message = "This is the position I want to show you from
// Mapo:\nLatitute="+
// $("#lat").val()+"\nLongitude = "+$("#lon").val()+
// "\nIf you prefer in WGS 84, here it is: "+$('#wgs').val()+
// "\nYou can see this position on OpenStreetMap: "+$('#OSMLink').val()+
// "\nOr on Google Maps: "+$('#GMLink').val()+
// "\nConnect you on Mapo for more details about this application!";
// var appControl = new
// tizen.ApplicationControl("http://tizen.org/appcontrol/operation/compose",
// tizen.smsmessages,
// null,
// null,
// [
// new tizen.ApplicationControlData("http://tizen.org/appcontrol/data/text",
// ["lol"])
// ]
// );
// tizen.application.launchAppControl(appControl, null,
// function(){console.log("launch service succeeded");},
// function(e){console.log("launch service failed. Reason: " + e.name);});
// }


/*
 * Storage Manager
 */

function storeData(){
	localStorage.setItem('lat', $('#lat').val());
	localStorage.setItem('lon', $('#lon').val());
	localStorage.setItem('dms', $('#dms').val());
}

function storeSettings() {
	localStorage.setItem('connection', $('#switchOnline').val());
	localStorage.setItem('energySaving', $('#switchEnergy').val());
	localStorage.setItem('timeout', $('#selectorTimeout').val());
}

function initData(){
	if (localStorage.getItem('lat') != null) {
		$('#lat').val(localStorage.getItem('lat'));
	}
	if (localStorage.getItem('lon') != null) {
		$('#lon').val(localStorage.getItem('lon'));
	}
	if (localStorage.getItem('dms') != null) {
		$('#dms').val(localStorage.getItem('dms'));
	}
	storeData();
}

function initSettings() {
	if (localStorage.getItem('connection') == 'online') {
		$('#switchOnline').val(localStorage.getItem('connection'));
	}
	if (localStorage.getItem('energySaving') != null) {
		$('#switchEnergy').val(localStorage.getItem('energySaving'));
	}
	if (localStorage.getItem('timeout') != null) {
		$('#selectorTimeout').attr('value', localStorage.getItem('timeout'));
	}
	storeSettings();
}

function init(){
	initData();
	initSettings();
	refresh();
}

function quit() {
	storeData();
	storeSettings();
	for ( var i = 0; i < localStorage.length; i++) {
		log(i+" -- "+localStorage.key(i)+" : "+localStorage.getItem(localStorage.key(i)));
	}
	setTimeout(
		function() {tizen.application.getCurrentApplication().exit();}, 2000);
}


/*
 * Settings Manager
 */

function switchOnline() {
	if (!isOnline) {
		if (navigator.onLine) {
			isOnline = true;
		} else {
			$('#switchOnline').val('offline');
			$('#switchOnline').slider('refresh');
			alert("Can not connect");
		}
	} else {
		isOnline = false;
	}
	refresh();
}

function swipePage() {
	$('div.ui-page').live("swipeleft",
			function() {
				var nextpage = $(this).next('div[data-role="page"]');
				// swipe using id of next page if exists
				if (nextpage.length > 0) {
					$.mobile.changePage(nextpage,
							{transition : "slide", reverse : false});
	}});
	$('div.ui-page').live("swiperight", 
			function() {
				var prevpage = $(this).prev('div[data-role="page"]');
				// swipe using id of next page if exists
				if (prevpage.length > 0) {
					$.mobile.changePage(prevpage,
							{transition : "slide", reverse : true});
	}});
}