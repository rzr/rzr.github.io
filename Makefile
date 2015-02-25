icon.png: docs/screenshot.png Makefile
	convert -resize 117x117! $< $@

docs/screenshot.png: docs/logo.png
	cp -av $< $@

tmp/512x512.png: docs/logo.png
	mkdir -p ${@D}
	convert -resize '512x512!' $< $@

distclean: clean
	rm -f *.wgt

clean:
	rm -f *~
