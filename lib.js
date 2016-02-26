/*

Copyright (c) 2013 Mapo developers and contributors <mapo.tizen@gmail.com>

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

var web = "http://notabug.org/tizen/mapo";

// The map of the application
var map = null;
// The boolean which provide the connection state of the application
var isReady = true;

var isLog = false;

var isOnline = navigator.onLine;

var isLoaded = false;

var isDownloaded = false;
/*
 * Recording Global Variable
 */
// Directory where the recording document is placed
var docDir;
// Name of the recording document
var doc;
// The file where the records are placed
var file;
// Boolean which provide the information if a file has been recorded
var fileRecorded = false;

var url_openlayers = "http://openlayers.org/api/OpenLayers.js";

var url_gmaps = "http://maps.google.com/maps/api/js?v=3.2&sensor=false";

var url_gmaps = 'http://maps.googleapis.com/maps/api/js?v=3.2&signed_in=true&callback=handleLoadedGmaps';
/*
 * General Manager
 */

/**
 * Quit the application
 */
function exit() {
	tizen.application.getCurrentApplication().exit();
}

/**
 * Show a message
 * 
 * @param message
 */
function log(message) {
	if (isLog) {
		console.log("# " + message);
		var element = document.getElementById("console");
		element.innerHTML += "<pre>" + message + "</pre>";
	}
}

// upstream: https://gist.github.com/kamranzafar/3136584#comment-1244934
function toast(message) {
	var $toast = $('<div class="ui-loader ui-overlay-shadow ui-body-e ui-corner-all"><h3>'
			+ message + '</h3></div>');

	$toast.css({
		display : 'block',
		background : '#fff',
		opacity : 0.90,
		position : 'fixed',
		padding : '7px',
		'text-align' : 'center',
		width : '270px',
		left : ($(window).width() - 284) / 2,
		top : $(window).height() / 2 - 20
	});

	var removeToast = function() {
		$(this).remove();
	};

	$toast.click(removeToast);

	$toast.appendTo($.mobile.pageContainer).delay(2000);
	$toast.fadeOut(400, removeToast);
}

function handleError(message) {
	message = "error: " + message;
	log(message);
	toast(message);
	return message;

}

function handleException(e) {
	return handleError(e.name);
}

function handleSuccess() {
	return log("success: ");
}
/*
 * Storage Manager
 */

/**
 * Store the coordinates values in the local storage
 */
function storeData() {
	localStorage.setItem('lat', $('#lat').val());
	localStorage.setItem('lon', $('#lon').val());
	localStorage.setItem('dms', $('#dms').val());
}

/**
 * Store the settings values in the local storage
 */
function storeSettings() {
	log("#{ storeSettings: " + isOnline);
	localStorage.setItem('connection', $('#switchOnline').val());
	localStorage.setItem('energySaving', $('#switchEnergy').val());
	localStorage.setItem('timeout', $('#selectorTimeout').val());
	localStorage.setItem('downloaded', isDownloaded);
	log("#} storeSettings: " + isOnline);

}

function store() {
	var i = 0;
	var r = $.Deferred();
	storeData();
	storeSettings();
	for (i = 0; i < localStorage.length; i++) {
		log(i + " -- " + localStorage.key(i) + " : "
				+ localStorage.getItem(localStorage.key(i)));
	}
	r.resolve();
	return r;
}

/**
 * Store the data before quitting the application
 */
function quit() {
	log("#{ exit");
	store().done(exit);
	log("#} exit");
}

/*
 * Set Manager
 */

/**
 * Modify the latitude value
 * 
 * @param lat :
 *            new latitude value
 */
function setLat(lat) {
	if (document.getElementById("lat").value !== lat) {
		document.getElementById("lat").value = lat;
	}
}

/**
 * Modify the longitude value
 * 
 * @param lon :
 *            new longitude value
 */
function setLon(lon) {
	if (document.getElementById("lon").value !== lon) {
		document.getElementById("lon").value = lon;
	}
}

/*
 * Link Manager
 */

/**
 * Get the OpenStreetMap link with the corresponding latitude and longitude
 * 
 * @returns url
 */
function getLink(provider) {
	var lat = $("#lat").val();
	var lon = $("#lon").val();
	var url;
	switch (provider) {
	case 'OSM':
		url = "http://www.openstreetmap.org/?&zoom=10&layers=mapnik&lat=${lat}&lon=${lon}";
		break;
	case 'GM':
		url = "http://maps.google.com/maps?&z=10&ll=${lat},${lon}";
		break;
	case 'HERE':
		url = "http://maps.nokia.com/${lat},${lon},16,0,0,normal.day";
		break;
	case 'bing':
		url = "http://www.bing.com/maps/?v=2&style=r&lvl=13&cp=48.11~${lat}~${lon}&style=r&lvl=4";
		break;
	case 'wigle':
		url = "https://wigle.net/map?maplat=${lat}&maplon=${lon}&mapzoom=12&startTransID=20010000-00000&endTransID=20170000-00000";
		break;
	default:
		url = "http://www.openstreetmap.org/?&zoom=10&layers=mapnik&lat=${lat}&lon=${lon}";
		break;
	}
	url = url.replace("${lon}", lon);
	url = url.replace("${lat}", lat);
	return url;
}

/**
 * Use the Internet Application Control to go to OSM link with the browser
 */
function goToURL(provider) {
	var i = 0;
	var j = 0;
	if (isOnline) {
		var appControl = new tizen.ApplicationControl(
				"http://tizen.org/appcontrol/operation/view",
				getLink(provider), null);
		var appControlReplyCallback = {
			onsuccess : function(data) {
				for (i = 0; i < data.length; i++) {
					log("#" + i + " key:" + data[i].key);
					for (j = 0; j < data[i].value.length; j++) {
						log("   value#" + j + ":" + data[i].value[j]);
					}
				}
			},
			onfailure : function() {
				log('The launch application control failed');
			}
		}
		tizen.application.launchAppControl(appControl, null, function() {
			log("launch internet application control succeed");
		}, function(e) {
			log("launch internet application control failed. reason: "
					+ e.message);
		}, appControlReplyCallback);
	} else {
		handleError("Please connect your application online in the settings"
				+ " if you want to open a browser")
	}
}

/**
 * update links TODO: check if needed ?
 */
// function updateLinks() {
// $('#OSMLink').attr('href', getOSMLink());
// }
/*
 * Map Manager
 */

/**
 * get the size of the map (width, height) according to the dimension of the
 * screen
 * 
 * @returns [ width, height ]
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

/**
 * Modify the dimension of the map according to getMapSize()
 */
function setMapSize(size) {
	size = getMapSize();
	$('#myMap').css("width", size[0]);
	$('#myMap').css("height", size[1]);
}

function initIcon() {
	var size = new OpenLayers.Size(21, 25);
	var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);

	return new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png',
			size, offset);
}

function loadTrace(data) {
	var i = 0;
	log("loadTrace data : " + data['dates'][0]);
	var icon = initIcon();

	log("tab lons = " + data['lons']);
	log("tab lats = " + data['lats']);
	log("tab dates = " + data['dates']);

	for (i = 0; i < data['dates'].length; i++) {
		var lon = parseFloat(data['lons'][i]);
		var lat = parseFloat(data['lats'][i]);
		var date = data['dates'][i];
		log("data['dates'][" + i + "] = " + date);
		log("data['lons'][" + i + "] = " + lon);
		log("data['lat'][" + i + "] = " + lat);
		log("lat before : " + lat);
		log("lon before : " + lon);
		var lonlat = new OpenLayers.LonLat(lon, lat).transform('EPSG:4326',
				'EPSG:3857');
		var mark = new OpenLayers.Marker(lonlat, icon);
		trace.addMarker(mark);
	}
	map.addLayer(trace);
}

/**
 * Load the OpenLayers map with different OpenStreetMap and Google maps' layers
 * TODO: check if needed ?
 */
function loadMap() {
	log("#{ loadMap: " + OpenLayers);

	if (OpenLayers === null) {
		log("error: OpenLayers " + isDownloaded);
		return;
	}

	var latCenter = $("#lat").val();
	var lonCenter = $("#lon").val();
	var zoom = $("#zoom").val();
	var layers = [ new OpenLayers.Layer.OSM("OpenStreetMap") ];

	log("# is gmaps available ? " + gmaps + "/" + gmaps);
	if (gmaps !== null) {
		var array = [ new OpenLayers.Layer.Google("Google Satellite", {
			type : google.maps.MapTypeId.SATELLITE,
			numZoomLevels : 22,
		})

		, new OpenLayers.Layer.Google("Google Physical", {
			type : google.maps.MapTypeId.TERRAIN
		}), new OpenLayers.Layer.Google("Google Hybrid", {
			type : google.maps.MapTypeId.HYBRID,
			numZoomLevels : 20
		}),

		new OpenLayers.Layer.Google("Google Streets", {
			numZoomLevels : 20
		}) ];
		// layers = array.concat(layers);
		layers = layers.concat(array);

	}
	log("# add ui " + layers);
	map = new OpenLayers.Map('myMap', {
		projection : 'EPSG:3857',
		layers : layers,
		center : new OpenLayers.LonLat(lonCenter, latCenter).transform(
				'EPSG:4326', 'EPSG:3857'),
		zoom : zoom,
	});
	map.addControl(new OpenLayers.Control.LayerSwitcher());

	if (fileRecorded) { // TODO : Data vide : data([0])?.length!=0 or
		// fileRecorded

		// var trace = new OpenLayers.Layer.Markers( "Latest recorded trace"
		// );
		// map.removeLayer(trace);

		var markers = map.getLayersByName("Last recorded trace");
		if (markers.length != 0) {
			var previousTrace = markers[0];
			log("trace = " + previousTrace.name);
			previousTrace.destroy();
		}

		trace = new OpenLayers.Layer.Markers("Last recorded trace");
		// readFile().done(loadTrace);
		readFile();
		// setTimeout(
		// // log("result 0 : "+result[0]);
		// // log("result 1 : "+result[1]);
		// loadTrace
		// , 5000);
	}
	log("#} loadMap: " + OpenLayers);
}

/*
 * Refresh Manager
 */

/**
 * Refresh all the application according to the coordinates and the settings
 */
function refresh() {
	log("#{ refresh: " + OpenLayers);
	if (isOnline) {
		isReady = (OpenLayers !== null);
	} else {
		isReady = false;
	}
	log("isReady=" + isReady);
	if (isReady) {
		$('#myMap').empty();
		setMapSize();
		loadMap();
	} else {
		// isOnline = navigator.onLine;
		// $('#switchOnline').val(isOnline ? 'online' : 'offline');
		$('#myMap').empty();
		$('#myMap')
				.html(
						"<p align='center'>"
								+ "Please connect your application online in the settings"
								+ " if you want to load the map</p>");
	}
	// isOffline $('#switchOffline').val() // TODO
	log("#} refresh: " + isReady);
}

/*
 * Initialization Manager
 */

/**
 * Recover in the local storage the coordinates values from the preceding use
 */
function initData() {
	log("#{ initData");
	if (localStorage.getItem('lat') !== null) {
		$('#lat').val(localStorage.getItem('lat'));
	}
	if (localStorage.getItem('lon') !== null) {
		$('#lon').val(localStorage.getItem('lon'));
	}
	if (localStorage.getItem('dms') !== null) {
		$('#dms').val(localStorage.getItem('dms'));
	}
	storeData();
	log("#} initData");
}

/**
 * Recover in the local storage the setting values from the preceding use
 */
function initSettings() {
	log("#{ initSettings: " + isOnline);

	if (null !== localStorage.getItem('connection')) {
		isOnline = (localStorage.getItem('connection') == 'online');
	}
	$('#switchOnline').val(isOnline ? 'online' : 'offline');

	if (localStorage.getItem('energySaving') !== null) {
		$('#switchEnergy').val(localStorage.getItem('energySaving'));
	}
	if (localStorage.getItem('timeout') !== null) {
		$('#selectorTimeout').attr('value', localStorage.getItem('timeout'));
	}
	if (localStorage.getItem('downloaded') !== null) {
		isDownloaded = localStorage.getItem('downloaded');
	}
	storeSettings();
	log("#} initSettings: " + isReady);
}

/*
 * Coordinates transformation Manager
 */

/**
 * Transform the latitude/longitude into DMS coordinate
 * 
 * @param lat :
 *            latitude
 * @param lon :
 *            longitude
 * @returns dms : DMS coordinate
 */
function fromLatLonToDMS(lat, lon) {
	var latitude = lat;
	var longitude = lon;
	var dms = "";
	var NS = "";
	if (latitude >= 0) {
		NS += "N";
	} else {
		latitude = -latitude;
		NS += "S";
	}
	var dLat = parseInt(latitude, 10);
	var mLat = parseInt((latitude - dLat) * 60, 10);
	var sLat = parseInt((latitude - dLat) * 60 * 60 - 60 * mLat, 10);
	dms += NS + " " + dLat + "° " + mLat + "' " + sLat + "\"  ";

	var EW = "";
	if (longitude >= 0) {
		EW += "E";
	} else {
		EW += "W";
		longitude = -longitude;
	}
	var dLon = parseInt(longitude, 10);
	var mLon = parseInt((longitude - dLon) * 60, 10);
	var sLon = parseInt((longitude - dLon) * 60 * 60 - 60 * mLon, 10);
	dms += EW + " " + dLon + "° " + mLon + "' " + sLon + "\"";
	// text = NS+" "+d+"° "+m+"' "+s+"\" "+EW+" "+d+"° "+m+"' "+s+"\"";
	return dms;
}

/**
 * Transform the DMS into latitude/longitude coordinates
 * 
 * @param dms :
 *            DMS coordinate
 * @returns [ lat, lon ] : latitude and longitude coordinates
 */
function fromDMSToLatLon(dms) {
	var re = /^([NS])\s*([0-9.\-]+)\s*°\s*([0-9.\-]+)\s*\'\s*([0-9.\-]+)\s*\"\s*([EW])\s*([0-9.\-]+)\s*°\s*([0-9.\-]+)\s*\'\s*([0-9.\-]+)\s*\"\s*$/;
	if (re.test(dms)) {
		var lat = (parseFloat(RegExp.$2) + parseFloat(RegExp.$3) / 60 + parseFloat(RegExp.$4)
				/ (60 * 60)).toFixed(6);
		if (RegExp.$1 == 'S') {
			lat = -lat;
		}
		lat = lat.toString();
		setLat(lat);

		var lon = (parseFloat(RegExp.$6) + parseFloat(RegExp.$7) / 60 + parseFloat(RegExp.$8)
				/ (60 * 60)).toFixed(6);
		if (RegExp.$5 == 'W') {
			lon = -lon;
		}
		lon = lon.toString();
		setLon(lon);
	}
}

/*
 * Coordinates Manager
 */

/**
 * Modify the DMS value using the transformation's function fromLatLonToDMS
 */
function setDMS() {
	$('#dms').val(fromLatLonToDMS($("#lat").val(), $("#lon").val()));
}

/**
 * Modify the latitude and longitude values using the transformation's function
 * fromDMSToLatLon
 */
function setLatLon() {
	var coordinates = fromDMSToLatLon($('#dms').val());
}

/**
 * Validate or not the DMS coordinate according to the form of the regular
 * expression
 * 
 * @param dms :
 *            DMS coordinates
 * @returns Validation
 */
function validateDMS(dms) {
	var re = /^([NS])\s*([0-9.\-]+)\s*°\s*([0-9.\-]+)\s*\'\s*([0-9.\-]+)\s*\"\s*([EW])\s*([0-9.\-]+)\s*°\s*([0-9.\-]+)\s*\'\s*([0-9.\-]+)\s*\"\s*$/;
	if (re.test(dms)) {
		return true;
	} else {
		return false;
	}
}

/**
 * Validate or not the latitudes and longitudes coordinates according to the
 * form of the regular expression
 * 
 * @param latOrLon
 * @returns Validation
 */
function validateLatOrLon(latOrLon) {
	if (/^[0-9.\-]+$/.test(latOrLon)) {
		return true;
	} else {
		return false;
	}
}

/**
 * Function called when the latitude value changes Calculate the new DMS
 * coordinate
 */
function changeLat() {
	var lat = $('#lat').val();
	if (validateLatOrLon(lat)) {
		$('#lat').val(parseFloat($('#lat').val()).toFixed(6).toString());
		setDMS();
		storeData();
	} else {
		handleError("Latitude coordinate invalid : " + lat);
		initData();
	}
}

/**
 * Function called when the longitude value changes Calculate the new DMS
 * coordinate
 */
function changeLon() {
	var lon = $('#lon').val();
	if (validateLatOrLon(lon)) {
		$('#lon').val(parseFloat($('#lon').val()).toFixed(6).toString());
		setDMS();
		storeData();
	} else {
		handleError("Lontitude coordinate invalid : " + lon);
		initData();
	}
}

/**
 * Function called when the DMS value changes Calculate the new latitude and
 * longitude coordinates
 */
function changeDMS() {
	var dms = $('#dms').val();
	if (validateDMS(dms)) {
		setLatLon();
		storeData();
	} else {
		alert("DMS coordinate invalid : " + dms);
		initData();
	}
}

/*
 * Location Manager
 */

/**
 * Function called when the getCurrentPosition succeded Refresh the application
 */
function handleShowLocation(position) {
	var lat = position.coords.latitude.toFixed(6).toString();
	var lon = position.coords.longitude.toFixed(6).toString();
	setLat(lat);
	setLon(lon);
	refresh();
}

/**
 * Function called when the getCurrentPosition failed Show the error
 * 
 * @param error
 */
function handleErrorLocation(error) {
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

/**
 * Get the current position according to the GPS' device
 */
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(handleShowLocation,
				handleErrorLocation, {
					enableHighAccuracy : $('#switchEnergy').val() == 'off'
				});
	} else {
		document.getElementById("locationInfo").innerHTML = "Geolocation is not supported by this browser.";
	}
}

/*
 * Recording manager
 */

/**
 * Function called when the file resolution succeded Create the recording file
 * in the corresponding directory
 * 
 * @param dir :
 *            directory where the file is placed
 */
function handleResolveSuccess(dir) {
	docDir = dir;
	var date = new Date();
	var dateFile = "" + date.getFullYear().toString() + "-"
			+ date.getMonth().toString() + "-" + date.getDate().toString()
			+ "-" + date.getHours().toString() + "-"
			+ date.getMinutes().toString() + "-" + date.getSeconds().toString();
	dateFile = (new Date).getTime();
	// log(dateFile);
	doc = 'mapo-' + dateFile + ".csv.txt";
	docDir.createFile(doc);
	$('#locationInfo').html("Track recording in file:<br/>" + doc);
}

/**
 * Function called when the file resolution failed Show the error
 * 
 * @param e :
 *            error
 */
function handleResolveError(e) {
	handleError('resolve: ' + e.message);
}

/**
 * Resolve the file
 */
function resolveFile() {
	try {
		file = docDir.resolve(doc);
	} catch (exc) {
		log('Could not resolve file: ' + exc.message);
		// Stop in case of any errors
		return;
	}
}

/**
 * Function called when the record failed, writing or reading Show the error
 * 
 * @param e :
 *            error
 */
function handleRecordError(e) {
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
	handleError(msg);
}

/**
 * Function called when the writing succeeded Add the position at the end of the
 * file
 * 
 * @param fileStream :
 *            Stream to write
 */
function writeToStream(fileStream) {
	try {
		var date = (new Date).getTime();
		var lat = $("#lat").val();
		var lon = $("#lon").val();
		var line = "" + date + ";" + lat + ";" + lon + "\n";
		fileStream.write(line);
		fileStream.close();
	} catch (exc) {
		handleError('io: could not write to file: ' + exc.message);
	}
}

/**
 * Try to write the record into the file
 */
function writeRecord() {
	try {
		file.openStream(
		// open for appending
		'a',
		// success callback - add textarea's contents
		writeToStream,
		// error callback
		handleRecordError);
	} catch (exc) {
		handleError('io: could not write to file: ' + exc.message);
	}
}

/**
 * Function called when the reading succeded
 * 
 * @param fileStream :
 *            Stream to read
 */
function readFromStream(fileStream) {
	try {
		log('File size: ' + file.fileSize);
		var contents = fileStream.read(fileStream.bytesAvailable);
		fileStream.close();
		log('file contents: ' + contents);
	} catch (exc) {
		handleError('io: Could not read from file: ' + exc.message);
	}
}

/**
 * Try to read the file
 */
function readRecord() {
	try {
		file.openStream(
		// open for reading
		'r',
		// success callback - add textarea's contents
		readFromStream,
		// error callback
		handleRecordError);
	} catch (exc) {
		handleError('io: Could not write to file: ' + exc.message);
	}
}

/**
 * Function called when getPosition got successfully the position Resolve the
 * file, write and read the records
 * 
 * @param position
 */
function handleRecordPosition(position) {
	if ($('#switchRecord').val() == "start") {
		handleShowLocation(position);
		resolveFile();
		writeRecord();
		readRecord();
	}
}

/**
 * Function called when getPosition failed to get the position Show the error
 * 
 * @param error
 */
function handleErrorPosition(error) {
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

/**
 * Get the recording position
 */
function getPosition() {
	navigator.geolocation.getCurrentPosition(handleRecordPosition,
			handleErrorPosition, {
				enableHighAccuracy : $('#switchEnergy').val() == 'off'
			});
}

/**
 * Function called when the record of a trace has been launched Record the
 * position whith a timeout predefined in the settings
 */
function record() {
	if (navigator.geolocation) {
		var intervalID;
		if ($('#switchRecord').val() == "start") {

			tizen.filesystem.resolve('documents', handleResolveSuccess,
					handleResolveError, 'rw');
			getPosition();
			intervalID = setInterval(getPosition,
					$('#selectorTimeout').val() * 1000);
		} else {
			clearInterval(intervalID);
			$('#locationInfo').html("Trace recorded in the file:<br/>" + doc);
			fileRecorded = true;
		}
	} else {
		document.getElementById("locationInfo").innerHTML = "Geolocation is not supported.";
	}
}

/**
 * Extract from a file composed by the last recorded trace all the dates,
 * latitudes and lontitudes and place its in data TODO: test if parse CSV as
 * "date,la,lo\n"
 */
function readFile() {
	// var deferred = $.Deferred();
	try {
		file = docDir.resolve(doc);
		log('File size: ' + file.fileSize);
	} catch (exceptionResolve) {
		log('error: Could not resolve file: ' + exceptionResolve.message);
		// Stop in case of any errors
		return;
	}
	try {
		file.readAsText(
		// success callback - display the contents of the file
		function(contents) {

			// log('File contents:' + contents);
			var lines = contents.split("\n");
			var re = /^([0-9.:\-]+),([0-9.\-]+),([0-9.\-]+)$/;

			var data = [];

			var dates = [];
			var lats = [];
			var lons = [];
			var iData = 0;

			for (var iLines = 0; iLines < lines.length; iLines++) {

				if (re.test(lines[iLines])) {
					log("line " + iLines + ": " + lines[iLines]);
					var parts = lines[iLines].split(";");
					for (var iParts = 0; iParts < parts.length; iParts++) {
						log("	part " + iParts + ": " + parts[iParts]);
						if ((iParts % 3) == 0) {
							dates[iData] = parts[iParts];
							log("		date " + iData + ": " + dates[iData]);
						} else if ((iParts % 3) == 1) {
							lats[iData] = parts[iParts];
							log("		lat " + iData + ": " + lats[iData]);
						} else {
							lons[iData] = parts[iParts];
							log("		lon " + iData + ": " + lons[iData]);
						}
					}
					iData++;
				}
			}
			data['dates'] = dates;
			data['lats'] = lats;
			data['lons'] = lons;

			log("readfile data" + data['dates'][0]);
			loadTrace(data);
		},
		// error callback
		handleRecordError);
	} catch (exceptionRead) {
		handleError("io: readAsText() exception:" + exceptionRead.message);
	}
	// deferred.resolve();
	// return deferred; // [data, referred]
}

/*
 * Social Manager
 */

/**
 * Use the Email Application Control to share a position by Email
 */
function sendEmail() {
	if (isOnline) {
		var message = "This is the position I want to show you from Mapo:"
				+ "\nLatitude=" + $("#lat").val() + "\nLongitude = "
				+ $("#lon").val() + "\nIf you prefer in DMS, here it is: "
				+ $('#dms').val()
				+ "\nYou can see this position on OpenStreetMap: "
				+ getLink('OSM') + "\nConnect you on Mapo for more details!";

		var appControl = new tizen.ApplicationControl(
				"http://tizen.org/appcontrol/operation/compose", null, null,
				null, [
						new tizen.ApplicationControlData(
								"http://tizen.org/appcontrol/data/subject",
								[ "Mapo" ]),
						new tizen.ApplicationControlData(
								"http://tizen.org/appcontrol/data/text",
								[ "mapo.tizen@gmail.com" ]),
						new tizen.ApplicationControlData(
								"http://tizen.org/appcontrol/data/text",
								[ message ]) ]);
		tizen.application.launchAppControl(appControl, "tizen.email",
				function() {
					log("launch service succeeded");
				}, function(e) {
					handleError("launch service failed. Reason: " + e.name);
				})
	} else {
		alert("Please connect your application online in the settings"
				+ " if you want to send an email");
	}
}
// TODO: check
// var appControl = new tizen.ApplicationControl(
// "http://tizen.org/appcontrol/operation/send", // compose or send
// "mailto:", null, null,
// [
// new tizen.ApplicationControlData(
// "http://tizen.org/appcontrol/data/subject", [ "Mapo" ]),
// new tizen.ApplicationControlData(
// "http://tizen.org/appcontrol/data/text", [ message ]),
// new tizen.ApplicationControlData(
// "http://tizen.org/appcontrol/data/to",
// [ "mapo.tizen@gmail.com" ])
// 
// // TODO tizen.mapo@spamgourmet.com
// // new tizen.ApplicationControlData(
// // "http://tizen.org/appcontrol/data/path",
// // ["images/image1.jpg"])
// ]);
// tizen.application.launchAppControl(appControl, null,
// function() {log("launch service succeeded");},
// function(e) {
// log("launch service failed. Reason: " + e.name);});

// TODO: check
function sendBluetooth() {
	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/bluetooth/pick", null,
			"image/jpeg", // "image/jpeg"
			null, []);

	tizen.application.launchAppControl(appControl, "tizen.bluetooth",
			function() {
				log("launch service succeeded");
			}, function(e) {
				handleError("launch service failed. Reason: " + e.name);
			});

	// var appControlReplyCallback = {
	// // callee sent a reply
	// onsuccess: function(data) {
	// for (var i = 0; i < data.length; i++) {
	// if (data[i].key == "http://tizen.org/appcontrol/data/selected") {
	// log('Selected image is ' + data[i].value[0]);
	// }
	// }
	// },
	// // callee returned failure
	// onfailure: function() {
	// log('The launch application control failed');
	// }
	// }
	//
	// tizen.application.launchAppControl(
	// appControl,
	// null,
	// function() {log("launch application control succeed"); },
	// function(e) {log("launch application control failed. reason:
	// "+e.message); },
	// appControlReplyCallback );

	// tizen.application.launch("tizen.bluetooth",
	// function(){log("launch service succeeded");},
	// function(e){log("launch service failed. Reason: " + e.name);});

	// var appControl = new
	// tizen.ApplicationControl("http://tizen.org/appcontrol/operation/bluetooth/pick",
	// "Phone/Images/image16.jpg");
	// tizen.application.launchAppControl(appControl, null,
	// function(){log("launch service succeeded");},
	// function(e){log("launch service failed. Reason: " + e.name);});
}

function sendMessage() {
	var message = "This is the position I want to show you from Mapo:"
			+ "\nLatitude=" + $("#lat").val() + "\nLongitude = "
			+ $("#lon").val() + "\nIf you prefer in DMS, here it is: "
			+ $('#dms').val()
			+ "\nYou can see this position on OpenStreetMap: " + getLink('OSM')
			+ "\n" + "\n\nURL: " + web;
	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/compose", null, null, null,
			[
					new tizen.ApplicationControlData(
							"http://tizen.org/appcontrol/data/messagetype",
							[ "sms" ]),
					new tizen.ApplicationControlData(
							"http://tizen.org/appcontrol/data/text",
							[ message ]) ]);
	tizen.application.launchAppControl(appControl, "tizen.messages",
			function() {
				log("launch service succeeded");
			}, function(e) {
				handleError("launch service failed. Reason: " + e);
			});
}

/*
 * Settings Manager
 */
function settings() {
	var url = "http://tizen.org/appcontrol/operation/setting";
	var id = "com.samsung.setting";
	var appControl = new tizen.ApplicationControl(url);
	tizen.application.launchAppControl(appControl, id, handleSuccess,
			handleException);
}

function settingsLocation() {
	var url = "http://tizen.org/appcontrol/operation/setting/location";
	var id = "org.tizen.setting-location";
	var appControl = new tizen.ApplicationControl(url);
	tizen.application.launchAppControl(appControl, id, handleSuccess,
			handleException);
}

/*
 * Caller Manager : may not be needed
 */
function call() {
	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/dial", null, null);
	tizen.application.launchAppControl(appControl, "tizen.phone", function() {
		log("launch appControl succeeded");
	}, function(e) {
		log("error: launch appControl failed. Reason: " + e.name);
	}, null);
}

// TODO:
// function caller(){
// var appControl = new tizen.ApplicationControl(
// "http://tizen.org/appcontrol/operation/call",
// null,
// null,
// null,
// [
// new
// tizen.ApplicationControlData("http://tizen.org/appcontrol/data/call/type",[
// "voice" ])
// ]
// );
// tizen.application.launchAppControl(appControl,"tizen.call",
// function(){log("launch appControl succeeded");},
// function(e){log("launch appControl failed. Reason: " + e.name);},
// null);
// }

/*
 * Contact Manager
 */

/**
 * Use the Contact Application Control to add a contact with the corresponding
 * position
 */
function createContact() {
	log("#{ createContact");
	var addressbook = tizen.contact.getDefaultAddressBook();

	var groups = addressbook.getGroups();
	var idMapo = "-1";
	for (var i = 0; i < groups.length; i++) {
		log(groups[i].name);
		if (groups[i].name == 'Mapo') {
			idMapo = groups[i].id;
		}
	}

	var group;
	if (idMapo != "-1") {
		group = addressbook.getGroup(idMapo);
		log('Group already exists ' + group.id);
	} else {
		group = new tizen.ContactGroup('Mapo');
		addressbook.addGroup(group);
		log('Group added with id ' + group.id);
	}
	// TODO: edit contact is present

	var contact = new tizen.Contact({
		emails : [ new tizen.ContactEmailAddress("mapo.tizen@gmail.com") ],
		urls : [ new tizen.ContactWebSite(getLink('OSM'), 'HOMEPAGE') ],
		notes : [ 'Position: lat=' + $("#lat").val() + ' lon='
				+ $("#lon").val() ],
		organizations : [ new tizen.ContactOrganization({
			name : "Mapo"
		}) ],
		groupIds : [ group.id ]
	});
	addressbook.add(contact);

	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/social/edit",
			null,
			"vnd.tizen.item.type/vnd.tizen.contact",
			null,
			[
					new tizen.ApplicationControlData(
							"http://tizen.org/appcontrol/data/social/item_type",
							[ "person" ]),
					new tizen.ApplicationControlData(
							"http://tizen.org/appcontrol/data/social/item_id",
							[ contact.personId ]) ]);
	tizen.application.launchAppControl(appControl, null, function() {
		log("contact: launch service succeeded");
	}, function(e) {
		handleError("contact: launch service failed. Reason: " + e);
	});
	log("#} createContact");
}

/*
 * Calendar Manager
 */

/**
 * Use the Contact Application Control to add an event in the calendar with the
 * corresponding date
 */
function createCalendarEvent() {

	var calendar = tizen.calendar.getDefaultCalendar("EVENT");
	var date = new Date();
	var event = new tizen.CalendarEvent({
		description : "Mapo Event",
		summary : "Mapo",
		startDate : new tizen.TZDate(date.getFullYear().toString(), date
				.getMonth().toString(), date.getDate().toString(), date
				.getHours().toString(), date.getSeconds().toString()),
		duration : new tizen.TimeDuration(1, "HOURS"),
		location : 'Position: lat=' + $("#lat").val() + ' lon='
				+ $("#lon").val()
	});
	calendar.add(event);
	var url = "http://tizen.org/appcontrol/operation/social/edit";
	var appControl = new tizen.ApplicationControl(url, null, null, null, [
			new tizen.ApplicationControlData(
					"http://tizen.org/appcontrol/data/social/item_type",
					[ "event" ]),
			new tizen.ApplicationControlData(
					"http://tizen.org/appcontrol/data/social/item_id",
					[ event.id.uid ]) ]);
	tizen.application.launchAppControl(appControl, "tizen.calendar",
			function() {
				log("success: " + url);
			}, function(e) {
				handleError("launch service failed. Reason: " + e);
			});
}

/*
 * Settings Manager
 */

/**
 * Function called when the online swith is activated or desactived Verify if
 * the the device has a connection before connecting the application
 */
function switchOnline() {
	log("#{ switchOnline: " + isOnline);
	log($('#switchOnline').val());
	isOnline = ("online" === $('#switchOnline').val());
	if (isOnline && !navigator.onLine)
		log("connect system's wifi before");

	if (isOnline) {
		isReady = (null === OpenLayers);
		if (!isReady || (null === gmaps)) {
			download();
		}
	} else {
		isReady = false;
	}
	refresh();
	log("#} switchOnline: " + isOnline);
}

function switchDeveloper() {
	isLog = ("on" === $('#switchDeveloper').val());
	var attribute = (isLog) ? "visible" : "hidden";
	$("#logView").css("visibility", attribute);
	$("#recordView").css("visibility", attribute);

}

/**
 * Use the tactil swipe to change between every pages TODO : blink ?
 */
function swipePage() {
	$('div.ui-page').live("swipeleft", function() {
		var nextpage = $(this).next('div[data-role="page"]');
		// swipe using id of next page if exists
		if (nextpage.length > 0) {
			$.mobile.changePage(nextpage, {
				transition : "slide",
				reverse : false
			});
		}
	});
	$('div.ui-page').live("swiperight", function() {
		var prevpage = $(this).prev('div[data-role="page"]');
		// swipe using id of next page if exists
		if (prevpage.length > 0) {
			$.mobile.changePage(prevpage, {
				transition : "slide",
				reverse : true
			});
		}
	});
}

function handleLoadedGmaps() {
	log("#{ handleLoadedGmaps: + " + google);
	gmaps = google;
	isDownloaded = true;
	refresh();
	log("#} handleLoadedGmaps: + " + isDownloaded);
}

function downloadScriptsBody() {
	log("#{ downloadScriptsBody: " + OpenLayers);
	{
		var element = document.createElement("script");
		element.type = 'text/javascript';
		element.src = url_openlayers;
		document.body.appendChild(element);
	}

	{
		var element = document.createElement("script");
		element.type = 'text/javascript';
		element.src = url_gmaps;
		document.body.appendChild(element);
	}

	log("#} downloadScriptsBody: " + OpenLayers);
}

function download() {
	log("#{ download: " + OpenLayers);
	if (null == OpenLayers) {
		$.getScript(url_openlayers, function() {
			log("download:" + OpenLayers);
			refresh();
			$.getScript(url_gmaps, function() {
				handleLoadedGmaps();
			});
		});
	} else if (null == google) {
		$.getScript(url_gmaps, function() {
			handleLoadedGmaps();
		});
	} else {
		handleLoadedGmaps();
	}
	// isLoaded = true; // TODO?
	log("#} download: " + OpenLayers);
}

function initScripts() {
	log("#{ initScripts: " + OpenLayers);
	log("# isDownloaded=" + isDownloaded);
	if (false === isDownloaded) {
		download();
	} else {
		download();
		refresh();
	}
	log("#} initScripts: " + OpenLayers);
}

/**
 * Initialize the data from the preceding use
 */
function start() {
	log("#{ start: " + OpenLayers);
	initData();
	initSettings();
	initScripts();
	// refresh();
	if (false) { // TODO: buggy flash screen
		swipePage();
	}
	// refresh();
	log("#} start: " + OpenLayers);
}
