default:all

package?=mapo
wgt?=${package}.wgt
all?=${wgt} \
 tmp/512x512.png \
 tmp/480x854/gmaps.png tmp/480x854/openlayers-gmaps.png tmp/screenshot.jpg \
 #eol

all: ${all} package

icon.png: docs/logo.png Makefile
	convert -resize 117x117! $< $@

docs/screenshot.png: docs/logo.png
	echo cp $< $@

tmp/screenshot.jpg: docs/screenshot.png
	convert $< $@

tmp/117x177/%: %
	mkdir -p ${@D}
	convert -resize '117x117!' $< $@

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
	rm -rf .package tmp
	rm -vf *~

check: ${package}.wgt
	unzip -t $<

package: ${wgt}

${package}.wgt: Makefile distclean
	@rm -f $@.tmp
	zip -r9 $@.tmp . -x "tmp/*" "docs/*" *.git* *.sign* ".*" $< && \
  mv $@.tmp $@


deploy: ${wgt} check
	sdb install $<
	sdb shell pkgcmd -l grep -i "\"${package}\""
