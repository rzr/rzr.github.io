Subject: mapo
Description: Basic HTML5 application that uses Tizen API (GPS)
URL: https://gitorious.org/mapo/mapo
Licence: GPL-2.0+
Contact: Philippe Coval <rzr(a)gna.org


### TODO ###

* TODO [#A] : nicer UI/UX
* TODO [#B] : map sources selection (mapstraction)
* TODO [#B] : convert la,lo to wgs (ie google url to wgs)
* TODO [#B] : bookmarks
* TODO [#C] : share position (mail, im, social)
* TODO [#C] : support more platforms : FireFoxOS, Asha, Ubuntu, bb10, gnome
* TODO [#C] : load navicore input bookmarks
* TODO [#C] : 3D globe and trace curves


### NOTES ###

Select maps source ie :

<select>
<option value="http://www.openstreetmap.org/?&zoom=10&layers=B00FTF&lat={la}&lon={lo}">OpenStreetMap</option>
<option value="http://maps.google.com/maps?&z={z}&ll=${icbm}">
Google maps
</option>
<!--
$s = "http://www.wikimapia.org/#y=" . $la . "&x=" . $lo . "&z=13&l=2&m=a&v=2";
printLink( $s , "Wikimapia" );

$s = "http://maps.nokia.com/";
$s= $s . $la . "," . $lo . ",16,0,0,normal.day";
printLink( $s , "nokia" );

$s = "http://www.bing.com/maps/?&lvl=20&sty=b&cp="; //48.128854~-1.638889"
$s = $s . $la . "~" . $lo ;
printLink( $s , "bing" );

$s = "http://www.multimap.com/map/browse.cgi?&scale=5000&icon=x&lat=" . $la . "&lon=" . $lo ;
printLink( $s , "Multimap" );

$s = "http://www.flickr.com/map?&fLat=" . $la . "&fLon=" . $lo;
printLink( $s , "Flickr" );

$s = "http://maps.google.com/maps?&z=" . $z . "&ll=" . $icbm ;
printLink( $s , "Google"  );

$s = "http://wigle.net/gps/gps/Map/onlinemap/?lat1=" . $la . "&lon1=" . $lo ;
printLink( $s , "Wigle" );

 $s = "http://geourl.org/near?lat=" . $la . "&long=" . $lo ;
 printLink( $s , "GeoURL" );


 $s = "http://maps.yahoo.com/maps_result?&lat=" . $la . "&lon=" . $lo ;
 printLink( $s , "yahoo" );

 $s = "http://www.frappr.com/eracket&z=16&t=0&cx=" . $la . "&cy=" . $lo ;
 printLink( $s , "frappr");

 $s="http://games.ww7.be/tools/formsgeneration/test_map_location_input.php?__map_latitude=$la&__map_longitude=$lo&__map_zoom=18&__map_map_type=Hybrid";
 printLink( $s , "form");

 $s="http://www.flashearth.com/?&z=12.1&r=0&src=2&lat=" . $la . "&lon=" . $lo ;
 printLink( $s , "swf");
 $s="http://games.ww7.be/tools/formsgeneration/test_map_location_input.php?__map_latitude=$la&__map_longitude=$lo&__map_zoom=18&__map_map_type=Hybrid";
 printLink( $s , "form");

 $s="http://www.flashearth.com/?&z=12.1&r=0&src=2&lat=" . $la . "&lon=" . $lo ;
 printLink( $s , "swf");

 $s="http://www.InformationFreeway.org/?" . "&zoom=12&layers=0B00F000" . "&lat=" . $la . "&lon=" . $lo ;
 printLink( $s , "way");


if ( ! isset($icbm)) {
   if ( isset($geo)) { $icbm=$geo; }
   else if ( isset( $la) && isset($lo)) { $icbm="" . $la ."," . $lo; }
}

$la = preg_replace( '/(.*),.*/' , '$1' , $icbm );
$lo = preg_replace( '/.*,(.*)/' , '$1' , $icbm );


function decimalToAngle( $u )
{
 $d = floor( $u );
 $s = ( $u - $d ) * 60. * 60.;
 $m = floor( $s / 60 );
 $s = floor( $s - 60 * $m );
 $t = "" . $d . "d" . $m . "m" . $s . "s";
 return $t;
}


function decimalToCoord( $lo , $la )
{
        $t="";

        $t = $t . ( ( $lo < 0 ) ? "S" : "N"  );
        if ( $lo < 0 ) { $lo = - ($lo) ; }
        $t = $t . decimalToAngle( $lo );

        $t = $t . ( ( $la < 0 ) ? "W" : "E" );
        if ( $la < 0 ) { $la=-($la);}
        $t = $t . decimalToAngle( $la );
        
        return $t;
}


$coord = decimalToCoord( $la , $lo );

-->
