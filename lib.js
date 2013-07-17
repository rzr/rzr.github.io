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

var map;
var isOnline = false;
var recording = false;
var recordingFrequency;
var energySaving = false;

/*
 * WGS Manager
 */
function toStringWgs84(lat, lon) {
	var latitude = lat;
	var longitude = lon;
	var text = "";
	{
		if (longitude > 0) {
			text += "E";
		} else {
			text += "W";
			longitude = -longitude;
		}
		var u = longitude;
		var d = parseInt("" + u, 10);
		var s = (u - d) * 60 * 60;
		var m = (s / 60.);
		m = parseInt("" + m, 10);
		s = (s - 60 * m);
		s = parseInt("" + s, 10);
		text += "" + d + "d" + m + "m" + s + "s";
	}
	// text += "\n";
	{
		if (latitude > 0) {
			text += "N";
		} else {
			latitude = -latitude;
			text += "S";
		}
		var u = latitude;
		var d = parseInt("" + u, 10);
		var s = (u - d) * 60 * 60;
		var m = (s / 60.);
		m = parseInt("" + m, 10);
		s = (s - 60 * m);
		s = parseInt("" + s, 10);
		text += "" + d + "d" + m + "m" + s + "s";
	}
	return text;
}

function toStringText(lat, lon) {
	var latitude = lat;
	var longitude = lon;
	var text = "";
	{
		if (longitude > 0) {
			text += "E";
		} else {
			text += "W";
			longitude = -longitude;
		}
		var u = longitude;
		var d = parseInt("" + u, 10);
		var s = (u - d) * 60 * 60;
		var m = (s / 60.);
		m = parseInt("" + m, 10);
		s = (s - 60 * m);
		s = parseInt("" + s, 10);
		text = d + " ° " + text + " D " + m + " m " + s + " s ";
	}
	// text += "\n";
	{
		if (latitude > 0) {
			text += "N";
		} else {
			latitude = -latitude;
			text += "S";
		}
		var u = latitude;
		var d = parseInt("" + u, 10);
		var s = (u - d) * 60 * 60;
		var m = (s / 60.);
		m = parseInt("" + m, 10);
		s = (s - 60 * m);
		s = parseInt("" + s, 10);
		text = d + " ° " + text + " D " + m + " m " + s + " s ";
	}
	return text;
}

function setWGS(lat, lon) {
	var text = "wgs84:" + toStringWgs84(lat, lon);
	var text = toStringText(lat, lon);
	document.getElementById("wgs").value = text;
}

/*
 * Link Manager
 */
function getOSMLink(lat, lon) {
	var url = "http://www.openstreetmap.org/?&zoom=10&layers=mapnik&lat=${lat}&lon=${lon}";
	url = url.replace("${lon}", lon);
	url = url.replace("${lat}", lat);
	return url;
}

function getGMLink(lat, lon) {
	var url = "http://maps.google.com/maps?&z=10&ll=${lat},${lon}";
	url = url.replace("${lon}", lon);
	url = url.replace("${lat}", lat);
	return url;
}

function updateLinks(lat, lon) {
	$('#OSMLink').val(getOSMLink(lat, lon));
	$('#GMLink').val(getGMLink(lat, lon));
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
	var contentHeight = viewHeight-header.outerHeight()-navbar.outerHeight()-footer.outerHeight();
	var contentWidth = viewWidth-30;
	return [contentWidth, contentHeight];
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
				new OpenLayers.Layer.Google("Google Streets", {
					numZoomLevels : 20
				}), new OpenLayers.Layer.Google("Google Physical", {
					type : google.maps.MapTypeId.TERRAIN
				}), new OpenLayers.Layer.Google("Google Hybrid", {
					type : google.maps.MapTypeId.HYBRID,
					numZoomLevels : 20
				}), new OpenLayers.Layer.Google("Google Satellite", {
					type : google.maps.MapTypeId.SATELLITE,
					numZoomLevels : 22
				}) ],
		center : new OpenLayers.LonLat(lon, lat)

		.transform('EPSG:4326', 'EPSG:3857'),
		zoom : 7
	});
	map.addControl(new OpenLayers.Control.LayerSwitcher());
}

/*
 * Latitude/Lontitude Manager
 */
function setLat(lat) {
	if (document.getElementById("lat").value != lat) {
		document.getElementById("lat").value = lat;
	}
}

function setLon(lon) {
	if (document.getElementById("lon").value != lon) {
		document.getElementById("lon").value = lon;
	}
}

/*
 * General Manager
 */
function set(lat, lon) {
	setLat(lat);
	setLon(lon);
	setWGS(lat, lon);
	updateLinks(lat, lon);
	
	$('#myMap').empty();
	if (isOnline) {
		setMapSize();
		chargeMap(lat, lon);
	} else {
		$('#myMap').html(
				"<p align='center'>Please connect your application online in the settings"
						+ " if you want to charge the map</p>");
	}
}

function refresh() {
	if (isOnline && !navigator.onLine) {
		$('#switchOnline').val('offline').slider('refresh');
		isOnline = false;
		alert("Connection lost");
	}
	set(document.getElementById("lat").value,
			document.getElementById("lon").value);
}

/*
 * Location Manager
 */
function showLocation(position) {
	set(position.coords.latitude, position.coords.longitude);
}

function errorLocation(error) {
	var errorInfo = document.getElementById("location");
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
		navigator.geolocation.getCurrentPosition(showLocation, errorLocation, {
			enableHighAccuracy : !energySaving,
		});
	} else {
		document.getElementById("location").innerHTML = 
			"Geolocation is not supported by this browser.";
	}
}


/*
 * Recording manager
 */

var docDir;
var doc;
var file;

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
	};
	console.log('Error: ' + msg);
}

function resolveFile(){
	try {
		file = docDir.resolve(doc);
	} catch (exc) {
		console.log('Could not resolve file: ' + exc.message);
		// Stop in case of any errors
		return;
	}
}

function writeToStream(fileStream) {
	try {
		var dateRecord = new Date();
		var lat = $("#lat").val();
		var lon = $("#lon").val();
		fileStream.write(dateRecord+" lat: "+lat+" lon: "+lon+"\r");
		fileStream.close();
	} catch (exc) {
		console.log('Could not write to file: ' + exc.message);
	}
}

function writeRecord(){
	try {
		file.openStream(
				// open for appending
				'a',
				// success callback - add textarea's contents
				writeToStream,
				// error callback
				onRecordError
		);
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

function readRecord(){
	try {
		file.openStream(
				// open for reading
				'r',
				// success callback - add textarea's contents
				readFromStream,
				// error callback
				onRecordError
		);
	} catch (exc) {
		console.log('Could not write to file: ' + exc.message);
	}
}

function onResolveSuccess(dir) {
	docDir = dir;
	var dateFile = new Date();
	doc = 'MAPO_course_'+dateFile+".txt";
	doc = doc.replace(/ /g, "-");
	docDir.createFile(doc);
	alert("Course recording in the file : "+doc);
}

function onResolveError(e) {
	console.log('message: ' + e.message);
}

function recordLocation(position){
	if(recording){
		set(position.coords.latitude, position.coords.longitude);
		resolveFile();
		writeRecord();
		readRecord();
	}
}

function getPosition() {
	navigator.geolocation.getCurrentPosition(recordLocation, errorLocation,
			{enableHighAccuracy : !energySaving});
}

function record() {
	if (navigator.geolocation) {
		if(!recording){
			recording = true;
			setFrequency();
			tizen.filesystem.resolve('documents', onResolveSuccess, onResolveError, 'rw');
			var intervalID = setInterval(getPosition, recordingFrequency);
		}
		else {
			recording = false;
			clearInterval(intervalID);
			alert("Course recorded in the file : "+doc);
		}
	} else {
		document.getElementById("location").innerHTML = "Geolocation is not supported.";
	}
}


/*
 * Settings Manager
 */
function switchOnline() {
	if (!isOnline) {
		if (navigator.onLine) {
			isOnline = true;
		} else {
			$('#switchOnline').val('offline').slider('refresh');
			alert("Can not connect");
		}
	} else {
		isOnline = false;
	}
	refresh();
}

function switchEnergy() {
	if(!energySaving){
		energySaving = true;
	}
	else {
		energySaving = false;
	}
}

function setFrequency(){
	recordingFrequency = $('#sliderFrequency').val()*1000; // From seconds to millisecond
}

function exit() {
	tizen.application.getCurrentApplication().exit();
}
