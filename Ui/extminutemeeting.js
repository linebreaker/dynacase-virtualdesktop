
/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 */

/* extjs widget document for minute meeting family */

Ext.fdl.DocumentMinuteMeeting = {

    //    display: Ext.fdl.DocumentDefaultView.display
    
    display: function(){
    
        this.alwaysDisplay = true;
        
        this.add(this.renderToolbar());
                
        this.add(new Ext.Panel({
            layout: 'hbox',
            height: 110,
            border: false,
            layoutConfig: {
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                html: "<img src=" +
                this.context.resizeImage(this.context.getParameter({
                    id: 'CORE_LOGOCLIENT'
                }), 80) +
                " style='margin-left:10px;width:80px;' />",
                border: false,
                flex: 2
            }, {
                html: '<h1 style="font-size:180%;text-align:center;">' + this.document.getProperty('fromtitle') + '</h1>' + '<h2 style="font-size:160%;text-align:center;">' + this.document.getTitle() + '</h2>',
                border: false,
                //unstyled: true,
                flex: 4
            }, {
                flex: 2,
                layout: 'fit',
                border: false,
                items: this.add(this.getExtValue('sert_t_file', {
                    hideHeader: true
                })),
                bodyStyle: 'overflow-y:auto;'
            }]
        }));
                
        this.add(new Ext.Panel({
            layout: 'hbox',
            height: 125,
            border: false,
            layoutConfig: {
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                items: [this.getExtValue('sert_ref'), this.getExtValue('sert_catg'), this.getExtValue('sert_redact'), this.getExtValue('sert_client'), this.getExtValue('sert_controller')],
                flex: 1,
                border: false,
                layout: 'form',
                style: 'margin-left:20px;'
            }, {
                items: [this.getExtValue('sert_dater'), this.getExtValue('sert_datecr'), this.getExtValue('sert_date'), this.getExtValue('sert_place'), this.getExtValue('sert_duration')],
                flex: 1,
                border: false,
                layout: 'form',
                style: 'margin-left:20px;'
            }]
        }));
                
        this.add(new Ext.Panel({
            layout: 'form',
            border: false,
            items: this.getExtValue('sert_object'),
            style: 'margin-left:20px;padding-bottom:20px;',
			bodyStyle: 'font-weight:bold;font-size:120%;'
        
        }));
        
        var items = [];
        
        if (this.document.getValue('sert_order')) {
            items.push({
                items: [{
                    html: '<h1 style="font-size:120%;text-align:center;">Ordre du jour</h1>',
                    border: false
                }, this.getExtValue('sert_order')],
                columnWidth: .3,
                border: false,
                style: 'margin-left:20px;'
            });
        }
        
        items.push({
            items: this.getExtValue('sert_t_part', {
                hideHeader: true
            }),
            columnWidth: .7,
            border: false,
            style: 'margin-right:20px;'
        });
        
        this.add(new Ext.Panel({
            layout: 'column',
            border: false,
            items: items
        }));
        
        this.add(new Ext.Panel({
            style: 'margin-left:20px;margin-right:20px;',
            border: false,
            items: this.getExtValue('sert_t_propaction', {
                hideHeader: true
            })
        }));
        
        if (this.document.getValue('sert_report')) {
            this.add(new Ext.Panel({
                html: '<h1 style="font-size:120%;text-align:center;">Compte Rendu</h1>',
                border: false,
				style: 'margin-top:20px;'
            }));
        }
        
        this.add(new Ext.Panel({
            style: 'margin-left:20px;margin-right:20px;',
            border: false,
            items: this.getExtValue('sert_report')
        }));
        
        if (this.document.getValue('sert_synthesis')) {
            this.add(new Ext.Panel({
                html: '<h1 style="font-size:120%;text-align:center;">Synthèse</h1>',
                border: false,
				style: 'margin-top:20px;'
            }));
        }
        
        this.add(new Ext.Panel({
            style: 'margin-left:20px;margin-right:20px;',
            border: false,
            items: this.getExtValue('sert_synthesis')
        }));
        
    }
    
};

Ext.fdl.FormDocumentMinuteMeeting = {

    display: Ext.fdl.DocumentDefaultEdit.display

};
