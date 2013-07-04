
var map;
var zoom = 7;
var isOnline = false;

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
			enableHighAccuracy : true,
			timeout : 10000,
			maximumAge : 600000
		});
	} else {
		document.getElementById("location").innerHTML = 
			"Geolocation is not supported by this browser.";
	}
}

function watchLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showLocation, errorLocation);
	} else {
		document.getElementById("location").innerHTML = "Geolocation is not supported.";
	}
}

/*
 * Connection Manager
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

function exit() {
	tizen.application.getCurrentApplication().exit();
}
