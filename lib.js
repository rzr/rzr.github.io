var zoom = 3;
var isOnline = false;

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
	//text += "\n";
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
	//text += "\n";
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

function getUrl() {
	var url = $("input[name='provider']:checked").attr('value');
	return url;
}

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

function setGoogleMaps(lat, lon) {
	map = new OpenLayers.Map('myMap', {
		projection : 'EPSG:3857',
		layers : [ new OpenLayers.Layer.Google("Google Streets", // the default
		{
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
		// Google.v3 uses web mercator as projection, so we have to
		// transform our coordinates
		.transform('EPSG:4326', 'EPSG:3857'),
		zoom : 5
	});
	map.addControl(new OpenLayers.Control.LayerSwitcher());
}

function setOpenLayers(lat, lon) {
	var map = new OpenLayers.Map("myMap"); // Add a map object
	map.addLayer(new OpenLayers.Layer.OSM()); // Add the default layer OSM
	var mapProjection = map.getProjectionObject();
	var sphereProjection = new OpenLayers.Projection("EPSG:4326");
	var coord = new OpenLayers.LonLat(lon, lat); // longitude/latitude coordinates
	coord.transform(sphereProjection, mapProjection);
	map.setCenter(coord, zoom);
}

function set(lat, lon) {
	var provider = $('input[type=radio][name=provider]:checked').attr('id');
	var url = getUrl();
	if (document.getElementById("lat").value != lat) {
		document.getElementById("lat").value = lat;
	}
	if (document.getElementById("lon").value != lon) {
		document.getElementById("lon").value = lon;
	}

	var text = "wgs84:" + toStringWgs84(lat, lon);
	text = toStringText(lat, lon);
	document.getElementById("wgs").value = text;

	url = url.replace("${lon}", lon);
	url = url.replace("${lat}", lat);
	document.getElementById("link").value = url;

	$('#myMap').empty();

	if (isOnline) {

		var mapSize = getMapSize();
		$('#myMap').css("width", mapSize[0]);
		$('#myMap').css("height", mapSize[1]);

		switch (provider) {
		case 'googlemaps':
			setGoogleMaps(lat, lon);
			break;
		case 'openstreetmap':
			setOpenLayers(lat, lon);
			break;
		}
	} else {
		$('#myMap').html(
			"<p align='center'>Please connect your application online<br/>" +
			"if you want to charge the map</p>");
	}

}

function showLocation(position) {
//	document.getElementById("location").innerHTML = "<p>Latitude : "
//			+ position.coords.latitude + "<br>" + "Longitude : "
//			+ position.coords.longitude + "</p>";
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
		document.getElementById("location").innerHTML=
			"Geolocation is not supported by this browser.";
	}
}

function watchLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showLocation, errorLocation);
	} else {
		document.getElementById("location").innerHTML=
			"Geolocation is not supported.";
	}
}

function refresh() {
	$('#myMap').empty();
	set(document.getElementById("lat").value,
			document.getElementById("lon").value);
}

function switchOnline() {
	if (isOnline) {
		isOnline = false;
		refresh();
	} else {
		isOnline = true;
		refresh();
	}
}

function exit() {
	tizen.application.getCurrentApplication().exit();
}
