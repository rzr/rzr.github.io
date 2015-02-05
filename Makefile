icon.png: docs/screenshot.png Makefile
	convert -resize 117x117! $< $@

docs/screenshot.png: docs/logo.png
	cp -av $< $@