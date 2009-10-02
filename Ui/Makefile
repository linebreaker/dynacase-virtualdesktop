
uidir=$(pubdir)/$(appname)/ui
pages_js = $(patsubst %.js,$(uidir)/%.js,$(wildcard *.js))

$(uidir):
	mkdir $@

$(uidir)/%.js: %.js $(uidir)
	cp $< $@


publish: $(uidir)  $(pages_js)