

pages_png = $(patsubst %.png,$(pubdir)/$(appname)/Images/backgrounds/%.png,$(wildcard *.png))

pages_jpg = $(patsubst %.jpg,$(pubdir)/$(appname)/Images/backgrounds/%.jpg,$(wildcard *.jpg))


$(pubdir)/$(appname)/Images/backgrounds: 
	mkdir -p $@

$(pubdir)/$(appname)/Images/backgrounds/%.png: %.png $(pubdir)/$(appname)/Images/backgrounds
	cp $< $@

$(pubdir)/$(appname)/Images/backgrounds/%.jpg: %.jpg $(pubdir)/$(appname)/Images/backgrounds
	cp $< $@

publish: $(pages_png) $(pages_jpg)