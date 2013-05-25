function toStringWgs84(la, lo)
{
    var latitude = la;
    var longitude = lo;
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


function toStringText(la, lo)
{
    var latitude = la;
    var longitude = lo;
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

var base="http://rzr.online.fr/geo/";

function set(la, lo)
{
    if (  document.getElementById("la").value != la ) {
	document.getElementById("la").value = la;
    } 
    if ( document.getElementById("lo").value != lo ) {
	document.getElementById("lo").value = lo;
    }

    var text = "wgs84:"+toStringWgs84(la, lo);
    text = toStringText( la , lo );
    document.getElementById("wgs").value = text;

    var url =  base + la + "," + lo;
    document.getElementById("webView").src = url;
}


function successCallback(position) 
{

    document.getElementById("locationInfo").innerHTML 
	= "Latitude: " +  position.coords.latitude 
	+ "<br>Longitude: " + position.coords.longitude
    ;
    
    set( position.coords.latitude, position.coords.longitude );    
}

function errorCallback(error) 
{
    var errorInfo = document.getElementById("locationInfo");

    switch (error.code) 
    {
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

function oneShotFunc() 
{
    if (navigator.geolocation) 
    {
	navigator.geolocation.getCurrentPosition
	(successCallback, errorCallback, {maximumAge: 60000});
    } 
    else 
    {
	document.getElementById("locationInfo").innerHTML =
            "Geolocation is not supported.";
    }
}


function watchFunc() 
{
    if (navigator.geolocation) 
    {
	watchId = navigator.geolocation.watchPosition(successCallback,
						      errorCallback);
    } 
    else 
    {
	document.getElementById("locationInfo").innerHTML = "Geolocation is not supported.";
    }
}