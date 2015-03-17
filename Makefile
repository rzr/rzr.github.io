all: tmp/512x512.jpg tmp/480x854/gmaps.png tmp/480x854/openlayers-gmaps.png

icon.png: docs/logo.png Makefile
	convert -resize 117x117! $< $@

docs/screenshot.png: docs/logo.png
	echo cp $< $@

tmp/512x512.png: docs/logo.png
	mkdir -p ${@D}
	convert -resize '512x512!' $< $@

tmp/512x512.jpg: docs/logo.png
	mkdir -p ${@D}
	convert -resize '512x512!' $< $@

tmp/480x854/gmaps.png: docs/gmaps.png
	mkdir -p ${@D}
	convert -resize '480x854!' $< $@

tmp/480x854/openlayers-gmaps.png: docs/openlayers-gmaps.png
	mkdir -p ${@D}
	convert -resize '480x854!' $< $@

distclean: clean
	rm -f *.wgt

clean:
	rm -f *~
