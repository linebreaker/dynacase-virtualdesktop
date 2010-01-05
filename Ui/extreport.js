/* extjs widget document for report family */

Ext.fdl.DocumentReport = {

    display: Ext.fdl.DocumentDefaultView.display

};

Ext.fdl.FormDocumentReport = {

    key: this.document.getValue('se_key') ? this.document.getValue('se_key') : (this.config && this.config.key) ? this.config.key : '',
    
    familyIdList: this.document.getValue('se_famid') ? this.document.getValue('se_famid') : new Array(),
    
    tmpDocument: null,
    
    displayEvaluate: function(){
    
        var form = this.getForm().getEl().dom;
        
        if (this.tmpDocument == null) {
        
            //this.document.save();
            
            this.tmpDocument = this.document.cloneDocument({
                temporary: true
            });
            
        }
        
//        var me = this;
                
		console.log('Document Before Save',this.tmpDocument);
				
        this.tmpDocument.save({
            form: form,
            callback: function(doc){
            
                console.log('Document After Save',doc);
                
                me.tmpDocument = doc;
                
                Fdl.ApplicationManager.closeDocument(doc.id);
                Fdl.ApplicationManager.displayDocument(doc.id, 'view', null, {
                    viewToolbar: false
                });
                
            }
        });
    
    },
    
    renderEditToolbar: function(){
    
        var mode = this.document.getProperty('id') ? 'edit' : 'create';
        
        var menu = this.add(new Ext.Toolbar({
            style: 'margin-bottom:-1px;'
        }));
        
        if (mode == 'edit') {
        
            menu.add(new Ext.Button({
                text: 'Sauver',
                scope: this,
                handler: function(){
                
                    var panel = this;
                    
                    var form = this.getForm().getEl().dom;
                    
                    this.document.save({
                        form: form,
                        callback: function(doc){
                        
                            if (panel.tmpDocument) {
                                Fdl.ApplicationManager.closeDocument(panel.tmpDocument.id);
                            }
                            
                            Fdl.ApplicationManager.notifyDocument(doc);
                            
                        }
                    })
                }
            }));
            
            menu.add(new Ext.Button({
                text: 'Evaluer',
                scope: this,
                handler: function(){
                    this.displayEvaluate();
                }
            }));
            
            menu.add(new Ext.Button({
                text: 'Annuler',
                scope: this,
                handler: function(){
                
                    Fdl.ApplicationManager.windows[this.document.id].mode = 'view';
                    Fdl.ApplicationManager.windows[this.document.id].updateDocument(this.document.id);
                    
                }
            }));
            
        }
        
        var fdr = this;
        
        if (mode == 'create') {
        
            menu.add(new Ext.Button({
                text: 'Mémoriser',
                scope: fdr,
                handler: function(){
                
                    Ext.Msg.prompt('Mémoriser', 'Donner un titre au rapport', function(id, value){
                    
                        var form = this.getForm();
                        
                        this.add(new Ext.form.Hidden({
                            name: 'ba_title',
                            value: value
                        }));
                        
                        this.doLayout(); // Needs to be done in order for the hidden field to be included in html
                        var domform = form.getEl().dom;
                        
                        this.document.save();
                        
                        this.document.save({
                            form: domform,
                            callback: function(doc){
                                var c = context.getDesktopFolder();
                                c.insertDocument({
                                    id: doc.getProperty('id')
                                });
                                
                                
                                Fdl.ApplicationManager.displayDocument(doc.id);
                                
                            }
                        });
                        
                        var container = this.ownerCt;
                        container.close();
                        
                    }, fdr);
                    
                }
            }));
            
            menu.add(new Ext.Button({
                text: 'Evaluer',
                scope: this,
                handler: function(){
                    this.displayEvaluate();
                }
            }));
            
            menu.add(new Ext.Button({
                text: 'Annuler',
                scope: this,
                handler: function(){
                    this.ownerCt.close();
                }
            }));
            
        }
        
        return menu;
        
    },
    
    renderColumnPanel: function(id){
    
        var columnPanel = new Ext.Panel({
            layout: 'form'
        });
        
        if (!id) {
            this.columnPanel = new Ext.Panel({
                html: '<p><i>La présentation ne fonctionne que pour les rapports sur une seule famille.</i></p><p><i>La présentation par défaut sera affichée.</i></p>'
            });
            return this.columnPanel;
        }
        
        var familyDocument = context.getDocument({
            id: id
        });
        
        var attributes = familyDocument.getAttributes();
        
        
        
        
        var columns = this.document.getAttribute('rep_tcols');
        
        var values = columns.getArrayValues();
        
        var columnCheck = new Array();
        
        var checked = new Object();
        
        for (v = 0; v < values.length; v++) {
            checked[values[v].rep_lcols] = true;
        }
        
        columnCheck.push({
            inputValue: 'title',
            boxLabel: '<i>Titre</i>',
            name: 'rep_lcols[]',
            checked: checked['title'] ? true : false,
            width: 180
        });
        
        columnCheck.push({
            inputValue: 'mdate',
            boxLabel: '<i>Date de modification</i>',
            name: 'rep_lcols[]',
            checked: checked['mdate'] ? true : false,
            width: 180
        });
        
        columnCheck.push({
            inputValue: 'revision',
            boxLabel: '<i>Révision</i>',
            name: 'rep_lcols[]',
            checked: checked['revision'] ? true : false,
            width: 180
        });
        
        columnCheck.push({
            inputValue: 'ownername',
            boxLabel: '<i>Propriétaire</i>',
            name: 'rep_lcols[]',
            checked: checked['ownername'] ? true : false,
            width: 180
        });
        
        columnCheck.push({
            inputValue: 'labelstate',
            boxLabel: '<i>Etat</i>',
            name: 'rep_lcols[]',
            checked: checked['labelstate'] ? true : false,
            width: 180
        });
        
        for (a in attributes) {
        
            if (attributes[a].type != 'tab' && attributes[a].type != 'frame' && attributes[a].type != 'menu' && attributes[a].type != 'array') {
            
                columnCheck.push({
                
                    hideLabel: true,
                    boxLabel: Ext.util.Format.capitalize(attributes[a].getLabel()),
                    checked: checked[attributes[a].id] ? true : false,
                    name: 'rep_lcols[]',
                    inputValue: attributes[a].id,
                    width: 180
                
                });
                
            }
            
        }
        
        var columnCheckGroup = new Ext.form.CheckboxGroup({
            columns: 3,
            vertical: true,
            items: columnCheck,
            style: 'margin-top:10px;'
        });
        
        columnPanel.add(columnCheckGroup);
        
        this.columnPanel = columnPanel;
        
        return columnPanel;
        
    },
    
    display: function(){
    
        var mode = this.document.getProperty('id') ? 'edit' : 'create';
        
        //this.add(this.getHeader());
        
        this.add(this.renderEditToolbar());
        
        var panel = new Ext.fdl.Requester({
            document: this.document
        });
        
        //        var tabPanel = new Ext.TabPanel({
        //        
        //            border: false,
        //            activeTab: 0,
        //            bodyStyle: 'padding:10px;',
        //            deferredRender: false
        //        
        //        });
        //        
        //        var fdr = this;
        //        
        //        var simpleSearchPanel = new Ext.Panel({
        //			border: false,
        //            layout: 'form',
        //            hidden: false,
        //            bodyStyle: 'padding:5px',
        //            items: [new Ext.fdl.Text({
        //                fieldLabel: 'Mot-clé',
        //                width: 180,
        //                value: this.document.getValue('se_key') ? this.document.getValue('se_key') : (this.config && this.config.key) ? this.config.key : '',
        //                listeners: {
        //                    change: function(field, newValue, oldValue){
        //                        this.ownerCt.ownerCt.ownerCt.key = newValue;
        //                    }
        //                },
        //                name: 'se_key',
        //            }), new Ext.fdl.MultiFamilyComboBox({
        //                fieldLabel: 'Famille',
        //                familyList: this.document.getValue('se_famid'),
        //                listeners: {
        //                    change: function(field, newValue, oldValue){
        //                    
        //                    },
        //                    select: function(combo, record, index){
        //                        fdr.familyIdList.push(record.id);
        //                        fdr.columnPanel.removeAll();
        //                        if (fdr.familyIdList.length == 1) {
        //                            fdr.columnPanel.add(fdr.renderColumnPanel(fdr.familyIdList[0]));
        //                        }
        //                        else {
        //                            fdr.columnPanel.add(new Ext.Panel({
        //                                html: '<p><i>La présentation ne fonctionne que pour les rapports sur une seule famille.</i></p><p><i>La présentation par défaut sera affichée.</i></p>'
        //                            }));
        //                        }
        //                        fdr.columnPanel.doLayout();
        //                    }
        //                },
        //                familyClear: function(id){
        //                    this.ownerCt.ownerCt.ownerCt.familyIdList.remove(id);
        //                    fdr.columnPanel.removeAll();
        //                    if (fdr.familyIdList[0]) {
        //                        fdr.columnPanel.add(fdr.renderColumnPanel(fdr.familyIdList[0]));
        //                    }
        //                    else {
        //                        fdr.columnPanel.add(new Ext.Panel({
        //                            html: '<p><i>La présentation ne fonctionne que pour les rapports sur une seule famille.</i></p><p><i>La présentation par défaut sera affichée.</i></p>'
        //                        }));
        //                    }
        //                    fdr.columnPanel.doLayout();
        //                }
        //            })]
        //        });
        //        
        //        ////////////
        //        var detailSearchPanel = this.detailSearch();        
        //        ////////////
        //        
        //        var criteria = new Ext.Panel({
        //            title: 'Critères',
        //            layout: 'form',
        //            autoHeight: true,
        //            
        //            items: [new Ext.form.RadioGroup({
        //                fieldLabel: 'Critère',
        //                hideLabel: true,
        //                columns: [100, 100],
        //                items: [{
        //                    boxLabel: 'Simple',
        //                    name: 'criteria',
        //                    checked: true,
        //                    listeners: {
        //                        check: function(radio, checked){
        //                            if (checked) {
        //                                //console.log('Simple checked');
        //                                simpleSearchPanel.show();
        //                                detailSearchPanel.hide();
        //                            }
        //                        }
        //                    }
        //                }, {
        //                    boxLabel: 'Détaillé',
        //                    name: 'criteria',
        //                    listeners: {
        //                        check: function(radio, checked){
        //                            if (checked) {
        //                                //console.log('Multiple checked');
        //                                simpleSearchPanel.hide();
        //                                detailSearchPanel.show();
        //                            }
        //                        }
        //                    }
        //                }]
        //            }), simpleSearchPanel, detailSearchPanel]
        //        
        //        });
        //        
        //        if (mode == 'edit') {
        //            criteria.add(new Ext.fdl.Text({
        //                fieldLabel: 'Titre',
        //                width: 180,
        //                name: 'ba_title',
        //                value: this.document.getValue('ba_title'),
        //                allowBlank: false
        //            }));
        //        }
        //        
        //        tabPanel.add(criteria);
        //        
        //        this.columnTabPanel = tabPanel.add(new Ext.Panel({
        //            title: 'Présentation',
        //            autoHeight: true,
        //            //items: [this.getExtInput('rep_tcols')]
        //            items: [this.renderColumnPanel(this.document.getValue('se_famid')[0])]
        //        }));
        //        
        //        tabPanel.add(new Ext.Panel({
        //            title: 'Options',
        //            items: []
        //            //            items: new Ext.fdl.AttributeComboBox({
        //            //                familyId: this.familyIdList[0]
        //            //            })
        //        }));
        
        this.add(panel);
    }
    
}
