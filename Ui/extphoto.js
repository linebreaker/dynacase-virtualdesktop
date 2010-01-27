/* extjs widget document for photo family */

Ext.fdl.DocumentPhoto = {
 
    display: function(){
		
        url = this.document.getDisplayValue('photo_file',{url:true,
            type: 'original'
        });
		
		console.log('URL',url);
		
        var mediaType = 'PNG';
        
        // Generate the text to display for version
        if (this.document.getProperty('version')) {
            var version = '<p>Version : ' + this.document.getProperty('version') + '</p>';
        }
        else {
            var version = '<p>Version non affectée</p>';
        }
        
        var panel = new Ext.Panel({
            layout: 'absolute',
            //height: 500,
            style:'height: 500px;',
	    	autoHeight:false,
            anchor: '100% 100%',
            frame: false
        });
        
        panel.add(this.renderToolbar());
		
        panel.add(new Ext.ux.MediaPanel({
            x: 0,
            y: 50,
            height: '400px',
            anchor: '100% 100%',
            bodyStyle: 'overflow:auto;',
            mediaCfg: {
                mediaType: mediaType,
                url: url,
//		autoSize:true,
                style: {width:'100%'}
            }
        }));
        
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
            this.getHtmlValue('photo_fr_desc', 'p') +
            '<hr/>' +
            this.getHtmlValue('photo_fr_exif', 'p') +
            '</p></td></tr></table>'
        
        }));
        
        this.add(panel);
 
    },

    renderToolbar: function(){
    
        var toolbar = new Ext.Toolbar({
            x: 0,
            y: 0,
            anchor: '100%'
        });
        
        toolbar.add(this.documentToolbarButton());
        
        toolbar.add({
            xtype: 'tbbutton',
            text: 'Photographie',
            menu: [{
                xtype: 'menuitem',
                text: 'Télécharger',
                scope: this,
                handler: function(){
                    var url = this.document.getDisplayValue('photo_file',{url:true,
                        inline: false
                    });
                    open(url, 'download_frame');
                }
            }, {
                xtype: 'menuitem',
                text: 'Modifier',
                scope: this,
                handler: function(){
                    var url = this.document.getAttribute('photo_file').getDavUrl();
                    open(url, 'download_frame');
                },
                disabled: !this.document.getAttribute('photo_file').getDavUrl()
            }, {
                xtype: 'menuitem',
                text: 'Google Maps',
                scope: this,
                handler: function(){
                
                    mapwin = new Ext.Window({
                        layout: 'fit',
                        title: 'GMap ' + this.document.getTitle(),
                        closeAction: 'hide',
                        
                        width: 400 + 17,
                        height: 450 + 25,
                        resizable: true,
                        maximizable: true,
                        renderTo: Fdl.ApplicationManager.desktopPanel.body,
                        constrain: true,
                        html: '<iframe style="width:100%;height:100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://maps.google.fr/?ie=UTF8&amp;ll=' + this.document.getValue('photo_gpslatitudedecimal') + ',' + this.document.getValue('photo_gpslongitudedecimal') + '&amp;z=15&amp;output=embed&q=' + this.document.getValue('photo_gpslatitudedecimal') + ',' + this.document.getValue('photo_gpslongitudedecimal') + '(' + encodeURI(this.document.getTitle()) + ')></iframe>'
                    
                    });
                    
                    
                    mapwin.show();
                    
                },
                disabled: !this.document.getValue('photo_gpslatitudedecimal')
            }]
        });
        
        toolbar.add(new Ext.Toolbar.Fill());
        
        var toolbarStatus = this.documentToolbarStatus();
        for (var i = 0; i < toolbarStatus.length; i++) {
            if (toolbarStatus[i]) {
                toolbar.add(toolbarStatus[i]);
            }
        }
        
        return toolbar;
        
    }
    
};

Ext.fdl.FormDocumentPhoto = {
	
	renderToolbar: Ext.fdl.DocumentDefaultEdit.renderToolbar,
	
	display: Ext.fdl.DocumentDefaultEdit.display
	
};