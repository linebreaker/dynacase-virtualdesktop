
famdir=$(pubdir)/families
include $(utildir)/PubRule

pages_fam = $(patsubst %.fam,$(famdir)/%.fam,$(wildcard *.fam))

$(famdir):
	mkdir $@

$(famdir)/%.fam: %.fam $(famdir)
	cp $< $@


publish: $(famdir)  $(pages_fam)