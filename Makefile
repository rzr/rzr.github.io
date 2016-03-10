#! /usr/bin/make -f

default: all

package?=mapo
version?=0.0.0
wgt?=${package}-${version}.wgt
archive?=${package}-${version}.zip

all?=${wgt} \
 tmp/512x512.png \
 tmp/480x854/gmaps.png tmp/480x854/openlayers-gmaps.png tmp/screenshot.jpg \
 #eol

all: ${all} package dist

icon.png: docs/logo.png Makefile
	convert -resize 117x117! $< $@

docs/logo.png:
	sleep 5 ; import $@

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
	rm -f *.wgt *.zip

clean:
	rm -rf .package tmp
	rm -vf *~

check: index.html wgt
	webtidy $<
	unzip -t ${wgt}

package: ${wgt}

wgt: ${wgt}

${wgt}: Makefile distclean
	@rm -f $@.tmp
	zip -r9 $@.tmp . -x "tmp/*" "docs/*" *.git* *.sign* ".*" "*.zip" "*.wgt" -x Makefile $< && \
  mv $@.tmp $@

archive: ${archive}

${archive}: img
	@rm -f $@.tmp
	zip -r9 $@.tmp . -x "tmp/*" "docs/*" *.git* *.sign* ".*" "*.zip" "*.wgt" -x Makefile $< && \
  mv $@.tmp $@


manifest.webapp:Makefile
	sed -e "s|\"version\": \".*\"|\"version\": \"${version}\"|g" -i $@

deploy: ${wgt} check
	sdb install $< 
	sdb shell pkgcmd -l grep -i "\"${package}\""

tizen-1.0/deploy: ${wgt}
	sdb push $< /tmp/
	sdb shell pkgcmd -i -t wgt -p /tmp/${<}
	echo "press confirm on device"

setup/debian:
	which webtidy || sudo apt-get install make git zip libhtml-tidy-perl.


dist: distclean wgt archive
img: docs/logo.png Makefile
	@mkdir -p img/icons
	convert -resize 16x16! $< img/icons/logo-16.png
	convert -resize 48x48! $< img/icons/logo-48.png
	convert -resize 60x60! $< img/icons/logo-60.png
	convert -resize 128x128! $< img/icons/logo-128.png

run: index.html
	firefox index.html
