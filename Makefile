all: icon.png docs/screenshot.png tmp/512x512.png

icon.png: docs/screenshot.png Makefile
	convert "$<" -resize '117x117>' -gravity center -background none -extent '117x117' "$@"

docs/screenshot.png: docs/logo.png
	cp -av $< $@

tmp/512x512.png: docs/logo.png
	mkdir -p ${@D}
	convert "$<" -resize '512x512>' -gravity center -background none -extent '512x512' "$@"

clean:
	rm -rfv tmp *~

distclean: clean
	rm -rf *.wgt

