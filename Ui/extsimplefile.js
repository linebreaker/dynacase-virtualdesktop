/* Ext View for Simple File family */

Ext.fdl.DocumentSimpleFile = {
    cpage: 0,
    uxm: null,
    display: function(){
        var file = this.document.getAttribute('sfi_file');
        var url = null;
        
        var style = null;
        
        if (this.document.getValue('sfi_mimesys').indexOf('image/', 0) == 0) {
            url = this.document.getAttribute('sfi_file').getUrl({
                type: 'original'
            });
            var mediaType = 'PNG';
            style = {
                width: '100%'
            };
        }
        else {
        
            if (file.hasPDF()) {
            
                url = file.getUrl({
                    type: 'png',
                    width: this.getInnerWidth() - 20 // 20 scrollbar
                });
                url = "Images/loading.gif";
                mediaType = 'PNG';
                style = {
                    width: '100%'
                };
            }
            
            else {
            
                if (this.document.hasWaitingFiles()) {
                
                    url = 'Images/loading.gif';
                    mediaType = 'GIF';
                    style = {'padding-left':'45%','padding-top':'40px'};
                    
                    var check = function(v){
                    
                        v.document.reload();
                        
                        if ((!v.document.hasWaitingFiles()) || (v.document.getAttribute('sfi_file').hasPDF())) {
                            v.switchMode(v.mode);
                            v.doLayout();
                            clearInterval(intervalId);
                        }
                    }
                    
                    var docview = this;
                    var intervalId = setInterval(function(){
                        check(docview);
                    }, 2000);
                    
                }
                else {
                    url = this.document.getIcon({
                        width: 60
                    });
                    mediaType = 'PNG';
                    style = {'padding-left':'45%','padding-top':'40px'};
                }
            }
            
        }
        
        var u = this.document.context.getUser();
        var info = u.getInfo();
        
        // Generate the text to display for version
        if (this.document.getProperty('version')) {
            var version = '<p>Version : ' + this.document.getProperty('version') + '</p>';
        }
        else {
            var version = '<p>Version non affectée</p>';
        }
        
        var panel = new Ext.Panel({
            layout: 'absolute',
            style: 'height: 500px',
            autoHeight: false,
            anchor: '100% 100%',
            frame: false,
            listeners: {
                scope: this,
                bodyresize: function(p, w, h){
                    var uxm = this.items.itemAt(1);
                    if (this.uxm) {
                        if (file.hasPDF()) {
                        
                            url = file.getUrl({
                                type: 'png',
                                page: this.cpage,
                                width: this.getInnerWidth() - 20
                            });
                            
                            //uxm.body.update('<img src="'+url+'">');
                            this.uxm.mediaCfg.url = url;
                            this.uxm.renderMedia();
                        }
                    }
                }
            }
        });
        
        panel.add(this.renderToolbar());
        this.uxm = new Ext.ux.MediaPanel({
            x: 0,
            y: 50,
            height: '400px',
            width: '100%',
            anchor: '100% 100%',
            bodyStyle: 'overflow:auto;',
            mediaCfg: {
                mediaType: mediaType,
                url: url,
                //		autoSize:true,
                style: style
            }
        });
        panel.add(this.uxm);
        
        panel.add(new Ext.Panel({
            xtype: 'panel',
            x: 0,
            y: 25,
            anchor: '100%',
            cls: 'opacity',
            title: 'Créé par ' + this.document.getProperty('ownername') + ', modifié le ' + this.document.getProperty('mdate'),
            collapsible: true,
            collapsed: true,
            titleCollapse: true,
            animCollapse: true,
            html: '<table style="width:100%;font-size:11px;"><tr><td style="width:50%;">' + version + '<p>Auteur : ' + this.document.getProperty('ownername') + '</p><p>Date de création : ' + this.document.getProperty('cdate') + '</p><p>Date de modification : ' + this.document.getProperty('mdate') + '</p></td>' +
            '<td style="width:50%;">' +
            '<p>Titre : ' +
            this.document.getValue('sfi_titlew') +
            '</p><p>Sujet : ' +
            this.document.getValue('sfi_subject') +
            '</p><p>Mots clefs : ' +
            this.document.getValue('sfi_keyword') +
            '</p><p>Description : ' +
            this.document.getValue('sfi_description') +
            '</p></td></tr></table>'
        
        }));
        
        
        this.add(panel);
        
    },
    
    renderToolbar: function(){
    
        var file = this.document.getAttribute('sfi_file');
        var toolbar = new Ext.Toolbar({
            x: 0,
            y: 0,
            anchor: '100%'
        });
        
        toolbar.add(this.documentToolbarButton());
        
        toolbar.add({
            xtype: 'tbbutton',
            text: 'Fichier',
            menu: [{
                xtype: 'menuitem',
                text: 'Télécharger',
                scope: this,
                handler: function(){
                    var url = this.document.getAttribute('sfi_file').getUrl({
                        inline: false
                    });
                    open(url, 'download_frame');
                }
            }, {
                xtype: 'menuitem',
                text: 'Modifier',
                scope: this,
                handler: function(){
                    var url = this.document.getAttribute('sfi_file').getDavUrl();
                    open(url, 'download_frame');
                },
                disabled: !this.document.getAttribute('sfi_file').getDavUrl()
            }, {
                xtype: 'menuitem',
                text: 'PDF',
                scope: this,
                handler: function(){
                    var url = this.document.getAttribute('sfi_file').getUrl({
                        inline: false,
                        type: 'pdf'
                    });
                    open(url, 'download_frame');
                },
                disabled: !this.document.getAttribute('sfi_file').hasPDF()
            }]
        });
        
        toolbar.add(new Ext.Toolbar.Fill());
        if (file.hasPDF()) {
            var prev = new Ext.Button({
                tooltip: 'Page précédente',
                scope: this,
                icon: 'Images/1leftarrow.png',
                disabled: true,
                maxValue: this.document.getValue("sfi_pages"),
                handler: function(o){
                    this.cpage--;
                    if (this.cpage < 0) 
                        this.cpage = 0;
                    if (this.cpage == 0) 
                        o.disable();
                    else 
                        o.enable();
                    if (this.cpage < o.maxValue - 1) 
                        next.enable();
                    else 
                        next.disable();
                    numbers.setValue(this.cpage + 1);
                    url = file.getUrl({
                        type: 'png',
                        page: this.cpage,
                        width: this.getInnerWidth() - 20
                    });
                    
                    this.uxm.mediaCfg.url = url;
                    this.uxm.renderMedia();
                }
            });
            var numbers = new Ext.form.NumberField({
                maxValue: this.document.getValue("sfi_pages"),
                minValue: 1,
                autoWidth: true,
                grow: true,
                allowDecimals: false,
                value: 1,
                scope: this,
                disabled: false,
                listeners: {
                    scope: this,
                    change: function(o){
                        this.cpage = o.getValue() - 1;
                        if (this.cpage < 0) 
                            this.cpage = 0;
                        if (this.cpage > o.maxValue) 
                            this.cpage = o.maxValue - 1;
                        o.setValue(this.cpage + 1);
                        url = file.getUrl({
                            type: 'png',
                            page: this.cpage,
                            width: this.getInnerWidth() - 20
                        });
                        
                        if (this.cpage == 0) 
                            prev.disable();
                        else 
                            prev.enable();
                        if (this.cpage < o.maxValue - 1) 
                            next.enable();
                        else 
                            next.disable();
                        this.uxm.mediaCfg.url = url;
                        this.uxm.renderMedia();
                    },
                    specialkey: function(o){
                        if (this.cpage != (o.getValue() - 1)) {
                            this.cpage = o.getValue() - 1;
                            if (this.cpage < 0) 
                                this.cpage = 0;
                            if (this.cpage > o.maxValue) 
                                this.cpage = o.maxValue - 1;
                            o.setValue(this.cpage + 1);
                            url = file.getUrl({
                                type: 'png',
                                page: this.cpage,
                                width: this.getInnerWidth() - 20
                            });
                            if (this.cpage == 0) 
                                prev.disable();
                            else 
                                prev.enable();
                            if (this.cpage < o.maxValue - 1) 
                                next.enable();
                            else 
                                next.disable();
                            this.uxm.mediaCfg.url = url;
                            this.uxm.renderMedia();
                        }
                    }
                    
                }
            });
            var next = new Ext.Button({
                tooltip: 'Page suivante',
                scope: this,
                icon: 'Images/1rightarrow.png',
                disabled: (this.document.getValue("sfi_pages") < 2),
                handler: function(o){
                    this.cpage++;
                    if (this.cpage >= parseInt(this.document.getValue("sfi_pages")) - 1) {
                        o.disable();
                        this.cpage = parseInt(this.document.getValue("sfi_pages")) - 1;
                    }
                    else 
                        o.enable();
                    
                    if (this.cpage == 0) 
                        prev.disable();
                    else 
                        prev.enable();
                    numbers.setValue(this.cpage + 1);
                    
                    url = file.getUrl({
                        type: 'png',
                        page: this.cpage,
                        width: this.getInnerWidth() - 20
                    });
                    
                    this.uxm.mediaCfg.url = url;
                    this.uxm.renderMedia();
                }
            });
            
            toolbar.add(prev);
            toolbar.add(numbers);
            toolbar.add(new Ext.Panel({
                html: '/' + this.document.getValue("sfi_pages")
            }));
            toolbar.add(next);
            
        }
        var toolbarStatus = this.documentToolbarStatus();
        for (var i = 0; i < toolbarStatus.length; i++) {
            if (toolbarStatus[i]) {
                toolbar.add(toolbarStatus[i]);
            }
        }
        
        return toolbar;
        
    }
    
};

Ext.fdl.FormDocumentSimpleFile = {

    renderToolbar: Ext.fdl.DocumentDefaultEdit.renderToolbar,
    
    display: Ext.fdl.DocumentDefaultEdit.display

}
