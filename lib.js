function toStringWgs84(lat, lon){
	var latitude = lat;
	var longitude = lon;
	var text = "";
	{
		if (longitude > 0) {
			text += "E";
		} else {
			text += "W";
			longitude = - longitude;
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
			latitude = - latitude;
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


function toStringText(lat, lon){
	var latitude = lat;
	var longitude = lon;
	var text = "";
	{
		if (longitude > 0) {
			text += "E";
		} else {
			text += "W";
			longitude = - longitude;
		}
		var u = longitude;
		var d = parseInt("" + u, 10);
		var s = (u - d) * 60 * 60;
		var m = (s / 60.);
		m = parseInt("" + m, 10);
		s = (s - 60 * m);
		s = parseInt("" + s, 10);
		text =  d + " ° " + text +  " D " + m + " m " + s + " s "; 
	}
	//text += "\n";
	{
		if (latitude > 0) {
			text += "N";
		} else {
			latitude = - latitude;
			text += "S";
		}
		var u = latitude;
		var d = parseInt("" + u, 10);
		var s = (u - d) * 60 * 60;
		var m = (s / 60.);
		m = parseInt("" + m, 10);
		s = (s - 60 * m);
		s = parseInt("" + s, 10);
		text =  d + " ° " + text +  " D " + m + " m " + s + " s "; 
	}
	return text;
}


function getUrl() {
	var url = $("input[name='mapChoice']:checked").attr('value');
	return url;
}

function set(lat, lon){
	var url = getUrl();
	if (  document.getElementById("lat").value != lat ) {
		document.getElementById("lat").value = lat;
	} 
	if ( document.getElementById("lon").value != lon ) {
		document.getElementById("lon").value = lon;
	}

	var text = "wgs84:"+toStringWgs84(lat, lon);
	text = toStringText( lat , lon );
	document.getElementById("wgs").value = text;

	url = url.replace( "${lon}" , lon );
	url = url.replace( "${lat}" , lat );

	document.getElementById("link" ).value =  url ;
	
	$(".map").attr("src", url );
}

function showLocation(position){
	document.getElementById("location").innerHTML=
			"Latitude:"+position.coords.latitude+
		"<br>Longitude: "+position.coords.longitude;
	set(position.coords.latitude, position.coords.longitude);
}

function errorLocation(error){
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

function getLocation(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition (showLocation, errorLocation, {enableHighAccuracy : true, timeout:10000, maximumAge:600000});
	}
	else {
		document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
	}
}


function watchLocation(){
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showLocation, errorLocation);
	}
	else {
		document.getElementById("location").innerHTML = "Geolocation is not supported.";
	}
}

function exit(){
		tizen.application.getCurrentApplication().exit();
}


function refresh()
{
	set( document.getElementById("lat").value , document.getElementById("lon").value ) ;
}
