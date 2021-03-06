
/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 */

/*global Ext */

Ext.ux.ThemeCombo = Ext.extend(Ext.form.ComboBox, {
    // configurables
     themeDefault: 'Ext Default'
    ,themeAnakeen1: 'Anakeen 1'
    ,themeAnakeen2: 'Anakeen 2'
    ,themeAnakeen3: 'Anakeen 3'
    ,themeUbuntu: 'Human Ubuntu'
    ,themeVar:'theme'
    ,selectThemeText: 'Select Theme'
    ,lazyRender:true
    ,lazyInit:true
    ,cssPath: ''
    
    ,initComponent:function() {

        Ext.apply(this, {
            store: new Ext.data.SimpleStore({
                fields: ['themeFile', {name:'themeName', type:'string'}]
                ,data: [
                     ['lib/ext/resources/css/ext-all.css', this.themeDefault]
                    ,['lib/ui/themes/anakeen1/css/xtheme-anakeentheme.css', this.themeAnakeen1]
                    ,['lib/ui/themes/anakeen2/css/xtheme-anakeentheme.css', this.themeAnakeen2]
                    ,['lib/ui/themes/anakeen3/css/xtheme-anakeen.css', this.themeAnakeen3]
                    ,['lib/ui/themes/human/css/xtheme-human.css', this.themeUbuntu]
                ]
            })
            ,valueField: 'themeFile'
            ,displayField: 'themeName'
            ,triggerAction:'all'
            ,mode: 'local'
            ,forceSelection:true
            ,editable:false
            ,fieldLabel: this.selectThemeText
        }); // end of apply

        this.store.sort('themeName');

        // call parent
        Ext.ux.ThemeCombo.superclass.initComponent.apply(this, arguments);
        
        var session  = ecm.getSession();
        if(session.theme){
        	this.setValue(session.theme);
        }

    } // end of function initComponent
    
    ,setValue:function(val) {
    	Ext.ux.ThemeCombo.superclass.setValue.apply(this, arguments);

        // set theme
        Ext.util.CSS.swapStyleSheet(this.themeVar, this.cssPath + val);
        
        var session  = ecm.getSession();
        if(session.theme != val){
        	session.theme = val ;
        	ecm.setSession(session);
        }

    } // eo function setValue

}); // end of extend

// register xtype
Ext.reg('themecombo', Ext.ux.ThemeCombo);

Ext.fdl.BackgroundComboBox = Ext.extend(Ext.form.ComboBox, {

    valueField: 'url',
    displayField: 'id',
    
    context: null,
    
    // Required to give simple select behaviour
    editable: false,
    forceSelection: true,
    disableKeyFilter: true,
    triggerAction: 'all',
    mode: 'local',
    
    /**
     * @cfg {String} filter Filtering expression to restrict family search on server. Defaults to null.
     */
    filter: null,
    
    tpl: '<tpl for="."><div style="background-image:url({purl});background-repeat:no-repeat;height:80px;" class="x-combo-list-item" ></div></tpl>',
    
    toString: function(){
        return 'Ext.fdl.BackgroundComboBox';
    },
    
    initComponent: function(){
    
        Ext.fdl.BackgroundComboBox.superclass.initComponent.call(this);
        
        if (!this.store) {
        
            var bg = ecm.getBackgrounds(130);
            
            delete bg.evalDebugTime ; //Clean this line when evalDebugTime is removed
            
            var data = [];
                        
            for (var i in bg) {
                data.push({
                    url: context.url + i,
                    purl: bg[i],
                    id: ''
                });
            }
            
            this.store = new Ext.data.JsonStore({
                data: data,
                fields: ['url', 'purl', 'id']
            });
            
        }
        
        this.on({
            render: {
                scope: this,
                fn: function(){
                
                }
            },
            select: {
                fn: function(combo, record, index){
                    this.backgroundSelect(record.get('url'));
                }
            }
        
        });
        
        var session  = ecm.getSession();
        if(session.bg){
        	this.backgroundSelect(session.bg);
        }
        
    },
    
    backgroundSelect: function(url){
        Fdl.ApplicationManager.desktopPanel.body.setStyle('background-image', 'url('+url+')');
        var session  = ecm.getSession();
        if(session.bg != url){
        	session.bg = url ;
        	ecm.setSession(session);
        }
    }
    
});

//register xtype
Ext.reg('backgroundcombo', Ext.fdl.BackgroundComboBox);


// Code to measure execution time
globalStart = new Date();

// Code to measure execution time
start = new Date();

// Data connection
var context = new Fdl.Context({
    url: window.location.pathname
});

Ext.onReady(function(){
			
	end = new Date();    
    //console.log('Execution when Ext.onReady() : ' + (end - start) + ' ms.');
    start = new Date();

    // Necessary to Ext
    Ext.BLANK_IMAGE_URL = 'lib/ext/resources/images/default/s.gif';
    
    // Init the quicktips singleton
    // Apply global properties.
    Ext.QuickTips.init();
    
    Ext.apply(Ext.QuickTips.getQuickTip(), {
        showDelay: 0,
        dismissDelay: 0,
        hideDelay: 0,
        trackMouse: true,
        mouseOffset: [15, -30]
    });
    
    // TODO parameter for basket (link/move), parameter for all (link/move)
    var defaultDrag = context.getParameter({
    	id: 'ECM_DEFAULT_DROP'
    });
    
    var basketDrag = context.getParameter({
    	id: 'ECM_BASKET_DROP'
    });
    
    // Change global default configurations.
    Ext.fdl.Collection.documentContextMenu = "EXTUI:default-context-menu.xml";
    Ext.fdl.Collection.selectionContextMenu = "EXTUI:default-selection-context-menu.xml";
    Ext.fdl.CollectionContainer.prototype.collectionMenu = "EXTUI:default-collection-menu.xml";
    
    Ext.fdl.Collection.defaultDragBehaviour = defaultDrag;
    
    /** Drag & Drop overrides for ECM. If extui is updated, this will need to be updated as well. */
    
    Ext.fdl.Collection.dragBehaviour = function(fromCol, overCol, dSel, overDoc){
    	
    	if (this.notifyDocumentDragOver(null,fromCol, overCol, dSel, overDoc)) {
        	    		
    		
        	if(fromCol && fromCol.getProperty('name') == 'OUR_MYTRASH'){
        		if (Ext.fdl.KeyBoard.keys[16] && Ext.fdl.KeyBoard.keys[17]){
        			return 'link';
        		} else if (Ext.fdl.KeyBoard.keys[17]) {
        			return 'duplicate';
        		} else if (Ext.fdl.KeyBoard.keys[16]) {
                    return 'move';
                } else {
                	return 'restore' ;
                }
        	} else if(overCol && overCol.getProperty('name') == 'OUR_MYTRASH'){
        		if (Ext.fdl.KeyBoard.keys[16] && Ext.fdl.KeyBoard.keys[17]){
        			return 'link';
        		} else if (Ext.fdl.KeyBoard.keys[17]) {
        			return 'duplicate';
        		} else if (Ext.fdl.KeyBoard.keys[16]) {
                    return 'move';
                } else {
                	return 'delete' ;
                }
        	} else if(!fromCol || (fromCol.isCollection &&fromCol.isSearch())){
        		// Behaviour when we are dragging from nothing or from a search
        		if (Ext.fdl.KeyBoard.keys[17] && !Ext.fdl.KeyBoard.keys[16]) {
        			return 'duplicate';
        		} else {
        			return 'link';
        		}
        	} else {
        		// Behaviour when we are dragging from a folder
        		if (Ext.fdl.KeyBoard.keys[16] && Ext.fdl.KeyBoard.keys[17]){
        			return 'link';
        		} else if (Ext.fdl.KeyBoard.keys[17]) {
        			return 'duplicate';
        		} else if (Ext.fdl.KeyBoard.keys[16]) {
                    return 'move';
                } else {
                	if((overDoc && overDoc.getProperty('fromname')=='BASKET') || (overCol && overCol.getProperty('fromname')=='BASKET')){
                		return basketDrag;
                	} else {
                		return this.defaultDragBehaviour ;
                	}
                }
        	}
            
        }
        
        return false ;
    	
    };
    
    Ext.fdl.Collection.dragTemplate = function(fromCol, overCol, dSel, overDoc){
    	
		//console.log('DRAGTEMPLATE',fromCol,overCol,dSel, overDoc, Ext.fdl.KeyBoard.keys);
	
        var l = dSel.count();
        var fDoc = dSel.context.getDocument({
            id: dSel.selectionItems[0],
            useCache: true
        });
        
        var object = '';
        
        var target = '';
        
        if (overDoc && overDoc.isCollection() && overDoc.isFolder()) {
            target = this.context._("eui::infolder") +' <b>' + overDoc.getTitle() + '</b>';
        }
        
        if (l > 1) {
            object = '<div>' + l + ' documents' + '</div>';
        }
        else {
            object = '<img src=' +
            fDoc.getIcon({
                width: 16
            }) +
            ' style="width:16px;margin-right:2px;float:left;" />' +
            '<div style="margin-left:18px;">' +
            fDoc.getTitle() +
            '</div>';
        }
        
        var behaviour = this.dragBehaviour(fromCol, overCol, dSel, overDoc);
        
        var action = '';
        
        switch (behaviour){
        	case 'duplicate':
        		action = this.context._("eui::Duplicate");
        	break;
        	case 'link':
        		action = this.context._("eui::Link");
        	break;
        	case 'move':
        		action = this.context._("eui::Move");
        	break;
        	case 'restore':
        		action = this.context._("eui::Restore");
        	break;
        	case 'delete':
        		action = this.context._("eui::Delete");
        	break;
        }
                
        return this.dragTemplateFormat(action,object,target);
        
    },
    
    Ext.fdl.Collection.notifyDocumentDragOver = function(dragWid, fromCol, overCol, dragSel, overDoc){
		    	
		//console.log('dragWid',dragWid,'fromCol',fromCol,'overCol',overCol,'dragSel',dragSel,'overDoc',overDoc);
        if ((overCol && overCol.isCollection() && overCol.isFolder() && ((overCol != fromCol) || (Ext.fdl.KeyBoard.keys[17] && (!Ext.fdl.KeyBoard.keys[16])) )) // overCol is a folder and (is different from source folder or action is cloning)
        	|| (overDoc && overDoc.isCollection() && overDoc.isFolder())
        	|| (overCol && overCol.getProperty('name') == 'OUR_MYTRASH' && !(fromCol && fromCol.getProperty('name') == 'OUR_MYTRASH'))) { // OR overDoc is a folder
            return true;
        }
        
        return false;
        
    },
    
    Ext.fdl.Collection.notifyDocumentDrop = function(dragWid, dragCol, dropCol, dragSel, dropDoc){
    	
    	//console.log('Before Document Drop Allowed and Processed', dragWid, dragCol, dropCol, dragSel, dropDoc );
		
		if(!this.notifyDocumentDragOver(dragWid, dragCol, dropCol, dragSel, dropDoc)){
			return true;
		}
		
		//console.log('Document Drop Allowed and Processed', dragWid, dragCol, dropCol, dragSel, dropDoc );
		        
        var targetCol;
        if (dropDoc && dropDoc.isCollection() && dropDoc.isFolder()) {
            targetCol = dropDoc;
        }
        else {
            targetCol = dropCol;
        }
        
        var context = targetCol.context;
        
        var g = context.createGroupRequest();
        
        g.addRequest({
            drop: g.getDocument({
                id: targetCol.id
            })
        });
        
		if (dragSel.collectionId) {
			g.addRequest({
				drag: g.getDocument({
					id: dragSel.collectionId
				})
			});
		}
		
		var dragColModified = false ;
		
		var behaviour = this.dragBehaviour(dragCol, dropCol, dragSel, dropDoc);
        
        switch (behaviour){
        	
        	case 'delete':
        	
        		if(dragSel.mainSelector == 'all' || dragSel.selectionItems.length != 1){
        		    Ext.Msg.alert(context._("ecm::warning"), context._("ecm::Delete for multiple selection is not implemented."));
        			return true;
        		} else {
        			
        			var doc = context.getDocument({
        				id: dragSel.selectionItems[0]
        			});
        			
        			doc.remove();
        			
        			dragColModified = true;

        		}
        	
        	break;
        	case 'restore':
        	
        		if(dragSel.mainSelector == 'all' || dragSel.selectionItems.length != 1){
        		    Ext.Msg.alert(context._("ecm::warning"), context._("ecm::Restore for multiple selection is not implemented."));
        			return true;
        		} else {
        			
        			var doc = context.getDocument({
        				id: dragSel.selectionItems[0]
        			});
        			
        			doc.restore();
        			
        			g.addRequest({
	                	a: g.get('drag').callMethod('moveDocuments', {
	                    	selection: dragSel,
	                    	targetIdentificator: targetCol.id
	                	})
	            	});
	            	dragColModified = true;
        			
        		}
        	break;
        	case 'duplicate':
        		
				if(dragSel.mainSelector == 'all' || dragSel.selectionItems.length != 1){
        			    Ext.Msg.alert(context._("ecm::warning"), context._("ecm::Duplicate for multiple selection must be implemented."));
        			return true;
        		} else {
        			g.addRequest({
        				doc: g.getDocument({
        					id: dragSel.selectionItems[0]
        				})
        			});
        			g.addRequest({
        				clone: g.get('doc').callMethod('cloneDocument', {
        					linkFolder: false
        				})
        			});
        			g.addRequest({
        				insert: g.get('clone').callMethod('moveto', {
        					folderId: targetCol.id
        				})
        			});
        			if(targetCol.id == dragCol.id){
        				dragColModified = true;
        			}
        		}
        	
        	
        	break;
        	case 'link':
        		
        		g.addRequest({
        	        a: g.get('drop').callMethod('insertDocuments', {
            	        selection: dragSel
            	    })
            	});
        	
        	
        	break;
        	case 'move':
        		
				g.addRequest({
                	a: g.get('drag').callMethod('moveDocuments', {
                    	selection: dragSel,
                    	targetIdentificator: targetCol.id
                	})
            	});
            	dragColModified = true;
        	
        	break;
        }
			
        
        g.addRequest({
            c: g.get('drop').callMethod('getContent')
        });
		if (dragColModified) {
			g.addRequest({
				d: g.get('drag').callMethod('getContent')
			});
		}
        
        var r = g.submit();
        
        //console.log('R',r);
        
		var modifiedDocObj = {};
		if (dragCol) {
			modifiedDocObj[dragCol.id] = dragCol;
		}
		
		if (targetCol) {
			modifiedDocObj[targetCol.id] = targetCol;
		}
		
        if (dragWid.reload && dragColModified) {
			if (r.get('drag').getProperty('id') == dragWid.collection.getProperty('id')) {
				dragWid.documentList = r.get('d');
				dragWid.content = dragWid.documentList.getDocuments();
				dragWid.collection = r.get('drag');
				//console.log('Problem : collection should have a count here', r.get('drag'), r.get('drag').count());
				dragWid.reload(false, modifiedDocObj);
			} else {
				dragWid.reload(true, modifiedDocObj);
			}
        }
		
		//console.log('DROP WIDGET',this,this.collection, this.collection.isSearch());
        
        // Test if this drop widget is not the same than drag widget
        if (dragWid != this && this.collection && (!this.collection.isSearch() || this.collection.getProperty('name')=='OUR_MYTRASH')){
			// If this drop widget is representing the collection in which drop was done
        	if (r.get('drop').getProperty('id') == this.collection.getProperty('id')) {
				this.documentList = r.get('c');
				this.content=this.documentList.getDocuments();
				this.collection = r.get('drop');
				this.reload(false,modifiedDocObj);
			} else {
				this.reload(true,modifiedDocObj);
			}
            
        }
        
        return true;
        
    };
    
    // Fdl.ApplicationManager will represent global ecm application behaviour
    // TODO Rename more appropriately but take care because Fdl.ApplicationManager was used in many places
    Fdl.ApplicationManager = new Ext.fdl.Interface({
        
		context: context,
        // These are ecm new specific properties to handle window positioning
        windows: {},
        createWindows: {},
        windowX: 0,
        windowY: 0,
		    
    	searchWindows: {},
        
        // Store documents id contained in the docBar
        docBar: {}
    
    });
    
    Fdl.ApplicationManager.openUrl= function(url,title) {
    	var mapwin = new Ext.fdl.Window({
            layout: 'fit',
            title: title,
            closeAction: 'hide',          
            width: 400 + 17,
            height: 450 + 25,
            resizable: true,
            maximizable: true,
            renderTo: Fdl.ApplicationManager.desktopPanel.body,
            constrain: true,
            html: '<iframe style="width:100%;height:100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"   src="'+url+'")></iframe>'
        });
        
        
        mapwin.show();
    };
    
    // Override onOpenDocument method to give ecm appropriate behavior (handling of windows and docbar)
    Fdl.ApplicationManager.onOpenDocument = function(wid, id, mode, config){
        	
    	var me = this ;
    	    	
    	var latest=true;
    	if (config && config.latest === false) latest=false;
        var vdocument = this.context.getDocument({
            id: id,
			contentStore: true,
			latest: latest,
			getUserTags: true
        });
        if (vdocument.id) {
        	id=vdocument.id;
        } else {
        	Ext.Msg.alert(this.context._("eui::missing right"),this.context._("eui::You have no right to access this document"));
        }
        if ((mode=='create'&&!this.createWindows[id]) || (mode!='create'&&!this.windows[id])) {
                	
        	if (!config) config={};
        	//config.targetRelation='Fdl.ApplicationManager.onOpenDocument(null,%V%,"view")';
        	config.targetUrl='Fdl.ApplicationManager.openUrl("%V%","%L% : %TITLE%")';

        
        	
        	var winClose = function(win){
        		win.publish('closedocument', win.fdlId, mode);
        	}
        	
            var win = new Ext.fdl.Window({
                mode: mode,
                context: this.context,
                
                x: this.windowX % 100 + 25,
                y: this.windowY % 100 + 25,
                
                mode: mode,
                config: config,
                
                renderTo: Fdl.ApplicationManager.desktopPanel.body,
                
                listeners: {
                    show: function(win){
                        if (!win.loaded) { 
                        	
                            	win.updateDocumentId(id,config);
                            
                        }
                        win.loaded = true;
                    },
                    close: winClose,
                    afterlayout: function(win, layout){
                        // Adjust maximum size to container size
                        var max = Fdl.ApplicationManager.desktopPanel.getHeight();
                        if (win.getHeight() + win.getPosition(true)[1] > max) {
                            win.setHeight(max - win.getPosition(true)[1]);
                        }
                    },
                    minimize: function(win){
                        win.hide();
                    }
                },
                
                onDocumentModified: function(newDoc,prevId){
                	                               	
                	var subId ;
                	if(newDoc.id){
                		subId = newDoc.id;
                	} else {
                		subId = newDoc.getProperty('fromid');
                	}
                	
                	if(mode=='create'){
                		
                		me.windows[subId] = me.createWindows[id]
                		delete me.createWindows[id];
                		
                		if(me.docBar['create-'+id]){
	                		me.docBar['create-'+id].updateDocument(newDoc);
	                		me.docBar[subId] = me.docBar['create-'+id];
	                		delete me.docBar['create-'+id];
	                			                		
	                		win.un('close',winClose);
	                		
	                		win.on('close',function(){
	                			//console.log('Rewritted close');
	                			win.publish('closedocument', subId);
	                		});
	                		
	                	}
                		
                	} else {
                	
	                	if(subId != prevId){
	                		
	                		//console.log('ID CHANGED', subId, prevId);
	                		
	                		// Update window array
	                		me.windows[subId] = me.windows[prevId];
		                	delete me.windows[prevId];	                	
	                		
		                	// Update docbar array
	                		me.docBar[subId] = me.docBar[prevId];
	                		delete me.docBar[prevId];
	                		
	                	}
	                	
	                	if(me.docBar[subId]){
	                		me.docBar[subId].updateDocument(newDoc);
	                	}
	                	
	                	win.fdlId = subId;
	                	
                	}
                	
                	
                	if(!me.blockecmmodify){
                		this.publish('ecmmodifydocument',newDoc,prevId);
                		me.blockecmmodify = true;
                	}
                	
                	(function(){
                		me.blockecmmodify = false;
                	}).defer(50);
                	
                }
                
            });
            
            win.fdlId = id ;
            
            win.show();
            
            this.windowX = this.windowX + 25;
            this.windowY = this.windowY + 25;
            
            if(mode=='create'){
            	this.createWindows[id] = win;
            } else {
            	this.windows[id] = win;
            }
            
            var doc = win.document;
            
            if(!doc){
            	return;
            }
            
            // Attributes set to be used when rendering the taskbar button
            win.taskIcon = doc.getIcon({
                width: 18
            });
            
            if(mode == 'create'){
            	win.taskTitle = doc.getProperty('fromtitle');
            } else {
            	win.taskTitle = this.context._("eui::Creation :")+ ' ' + doc.getTitle();
            }
            
            if ((mode=='create'&&!this.docBar['create-'+id]) || (mode!='create'&&!this.docBar[id])) {
            	var button = taskBar.addTaskButton(win);
            	button.updateDocument = function(doc){
            		if (doc.getProperty('id')) {
            			button.setText(Ext.util.Format.ellipsis(doc.getTitle(),15));
	                    button.setTooltip('<b>titre : ' + doc.getTitle() + '</b>' +
	                    '<br/>propriétaire : ' +
	                    doc.getProperty('ownername') +
	                    '<br/>famille : ' +
	                    doc.getProperty('fromtitle') +
	                    '<br/>dernière modif. : ' +
	                    doc.getProperty('mdate'));
            		}
                };                
                button.subscribe('modifydocument',function(fdldoc){
                	if(id == fdldoc.id){
                		button.updateDocument(fdldoc);
                	}
                });
                button.updateDocument(doc);    
                
                if(mode=='create'){
                	this.docBar['create-'+id] = button;
                } else {
                	this.docBar[id] = button;
                }
                //console.log('DOCBAR SUBSCRIPT AT ID ', id, this.docBar);
            }
            
        } else {
        	if(mode=='create'){
        		this.createWindows[id].show();
       		 	this.createWindows[id].toFront();
			} else {
        		this.windows[id].show();
        		this.windows[id].toFront();
			}
        }
                
    };
    
    Fdl.ApplicationManager.onCloseDocument = function(id,mode){
    
    	if(mode=='create'){
    		if (this.docBar['create-'+id]) {
	            taskBar.removeTaskButton(this.docBar['create-'+id]);
	            this.docBar['create-'+id] = null;
	        }
    		this.createWindows[id] = null;
    	} else {
	        if (this.docBar[id]) {
	            taskBar.removeTaskButton(this.docBar[id]);
	            this.docBar[id] = null;
	        }
	        this.windows[id] = null;
    	}
        
        
    };
    
    Fdl.ApplicationManager.onOpenSearch = function(wid, filter, config){
        //console.log('FILTER', filter);
        Fdl.ApplicationManager.displaySearch(null, filter, config);
    };
    
    /**
     * DisplaySearch
     * @param {String} key
     * @param {Object} searchConfig
     * @param {Object} widgetConfig {pageSize,windowTitle,windowName}
     */
    Fdl.ApplicationManager.displaySearch = function(key, searchConfig, widgetConfig){
    
        var d = context.getSearchDocument();
        
        d.key = key ;
        if(d.key){
        	d.withHighlight = true;
        }
        
        if (searchConfig) {
            
            var filter = new Fdl.DocumentFilter({
                key: key
            });        
       
            filter = Ext.apply(filter, searchConfig);
            
            d.filter = filter;
        
        } else {
            d.filter = [];
        }
        
        if (!widgetConfig || !widgetConfig.pageSize) {
            var pageSize = 10;
        }
        else {
            var pageSize = widgetConfig.pageSize;
        }
        
        if (!widgetConfig || !widgetConfig.windowTitle) {
            if (key) {
                var windowTitle = Fdl.ApplicationManager.context._("ecm::Search :") + key;
            }
            else {
                if (searchConfig.family) {
                	
                	var family = this.context.getDocument({
                        id: searchConfig.family,
                        useCache: true
                    });
                	
                    var windowTitle = Fdl.ApplicationManager.context._("ecm::Search :") + family.getTitle();
                                        
                    // Display state in title when appropriate
                    if(searchConfig.criteria && searchConfig.criteria.length == 1 && searchConfig.criteria[0].operator == '=' && searchConfig.criteria[0].left == 'state'){
                    	var state = searchConfig.criteria[0].right ;
                    	if(family.hasWorkflow()){
                    		// TODO A getWorkflow() method should be implemented.
                    		var workflow = this.context.getDocument({
                    			id: family.getProperty('wid'),
                    			useCache: true,
                    			needWorkflow: true
                    		});
                    		// TODO Workflow should have something to get state label given a state identifier
                    		var states = workflow.getStates();
                    		windowTitle += ' (' + states[state].label + ')';
                    	}
                    	//console.log('We made a search about egality of state property, we will want to display the state in title');
                    }
                }
                else {
                    var windowTitle = Fdl.ApplicationManager.context._("ecm::Search");
                }
            }
        }
        else {
            var windowTitle = widgetConfig.windowTitle;
        }
        
        if (!widgetConfig || !widgetConfig.windowName) {
            var windowName = null;
        }
        else {
            var windowName = widgetConfig.windowName;
        }
        
        if (windowName && this.searchWindows[windowName]) {
        
            var _x = this.searchWindows[windowName].getPosition(true)[0];
            var _y = this.searchWindows[windowName].getPosition(true)[1];
            
            this.searchWindows[windowName].close();
            this.searchWindows[windowName] = null;
        }
        else {
            var _x = this.windowX % 100 + 25;
            var _y = this.windowY % 100 + 25;
            
            this.windowX = this.windowX + 25;
            this.windowY = this.windowY + 25;
        }
        
        var window = new Ext.fdl.Window({
            x: _x,
            y: _y,
            title: windowTitle,
            
            width: 440,
            height: 560,
            
            autoScroll: true,
            
            renderTo: Fdl.ApplicationManager.desktopPanel.body,
            listeners: {
                show: function(window){
                
                    if (!Fdl.ApplicationManager.docBar[window.id]) {
                        Fdl.ApplicationManager.docBar[window.id] = taskBar.addTaskButton(window);
                    }
                    
                    window.updateDocument(d);
                    
                    // Adjust maximum size to container size
                    var container = Fdl.ApplicationManager.desktopPanel.body;
                    var max = container.getHeight();
                    if (this.getHeight() > max) {
                        this.setHeight(max);
                    }
                    
                    if(family){
			        	window.subscribe('ecmmodifydocument',function(fdlDoc,prevId){
			        		//console.log('SUBSCRIBED',fdlDoc.getProperty('mdate'),window.documentPanel.collectionPanel);
			        		
			        		
			        		
//			        		var date = new Date().add(Date.SECOND,-20);
//			        		var dateFormat = date.format('d/m/Y H:i:s');
//			        		console.log('NOW',dateFormat);
			        		
			        		if(fdlDoc.getProperty('fromid') == family.id){
			        			if(window && window.documentPanel && window.documentPanel.collectionPanel){
			        				
			        				var mdate = fdlDoc.getProperty('mdate');
			        				
			        				var day = mdate.substring(0,2);
									var month = mdate.substring(3,5);
									var year = mdate.substring(6,10);
									var hour = mdate.substring(11);
									
									mdate = year+'-'+month+'-'+day+' '+hour;
									
									var reloaddate = window.documentPanel.collectionPanel.reloadDate;
									
									if(!reloaddate || reloaddate < mdate){
			        								        				
			        					window.documentPanel.collectionPanel.reload();
			        				
									}
			        			}
			        		}
			        	});
			        }
                    
                    
                },
                close: function(){
                	
                	window.removeSubscriptionsFor('ecmmodifydocument');
                	
                    if (Fdl.ApplicationManager.docBar[window.id]) {
                        taskBar.removeTaskButton(Fdl.ApplicationManager.docBar[window.id]);
                    }
                },
                minimize: function(){
                    window.hide();
                },
                afterrender: function(win){
                
                    // Adjust maximum size to container size
                    var container = Fdl.ApplicationManager.desktopPanel.body;
                    var max = container.getHeight();
                    if (win.getHeight() + win.getPosition(true)[1] > max) {
                        win.setHeight(max - win.getPosition(true)[1]);
                    }
                    
                    win.mask = new Ext.LoadMask(win.body, {
                        msg: Fdl.ApplicationManager.context._("ecm::Loading...")
                    });
                    win.mask.show();
                    
                //			panel.viewNotes();
                //			setTimeout(function () {panel.viewNotes();},1000);
                }
            }
        });
        
        if (windowName) {
            this.searchWindows[windowName] = window;
        }        
        		
		// Attributes set to be used when rendering the taskbar button
        window.taskTitle = windowTitle;
        
        window.show();
        
    };
    
    // Create workspace by getting first returned workspace from search
    var sd = context.getSearchDocument();
    wr = sd.search({
        famid: 'WORKSPACE'
    }).getDocuments();
    
    workspace = null;
    
    if (wr.length > 0) {
        workspace = wr[0];
    }
    else {
        Ext.Msg.alert(context._("ecm::warning"), context._("ecm::No workspace"));
    };
    
    end = new Date();    
    //console.log('Execution time before homeTreeCollection : ' + (end - start) + ' ms.');
    start = new Date();
    
    // Home TreePanel
    var homeTreeCollection = new Ext.fdl.GridCollection({
        title: Fdl.ApplicationManager.context._("ecm::Personnal Space"),
        
        header: false,
        hideHeaders: false,
        filterColumns: false,
        
        //defaultDragBehaviour: 'link',
        
        columns: [{
        		dataIndex: 'icon',
        		width: 30,
        		sortable: false,
        		renderer: function(value, metaData, record, rowIndex, colIndex, store){
               
		        	if (record.get('_fdldoc')) { // There is a problem on sorting when this is not tested, and it is strange.
		        		if (this.dataIndex == 'icon') {
		        			return String.format('<img src="{0}" style="height:15px;width:15px;" />', record.get('_fdldoc').getIcon({
		        				width: 15
		        			}));
		        		}
		        	}
		        	
		        }
        	},{
        		dataIndex: 'title',
        		sortable: true
        	}        	
        ],
        
        collection: context.getBasketFolder({
            contentStore: true,
            contentConfig: {
                slice: 'ALL'
            }
        }),
        
        listeners: {
            render: function(grid) {
            	// Remove completely grid headers.
                grid.getView().el.select('.x-grid3-header').setStyle('display','none');
            }                
        }
            
    });
    var homeTree = homeTreeCollection;
    // EO Home TreePanel
    
    end = new Date();    
    //console.log('Execution time before desktopCollection : ' + (end - start) + ' ms.');
    start = new Date();
    
    Fdl.ApplicationManager.desktopPanel = new Ext.fdl.IconCollection({
		id: 'ecm-center',
		region: 'center',
		usePaging: false,
        collection: Fdl.ApplicationManager.context.getDesktopFolder({
            contentStore: true,
            contentConfig: {
                slice: 'ALL'
            }
        }),
        useTrash: Fdl.ApplicationManager.context.getDocument({
            id: 'OUR_MYTRASH'
        }),
        bodyStyle: {
            "background-image": "url(" + Fdl.ApplicationManager.context.url + "ECM/Images/our.desktop.jpg" + ")"
        }
    });
        
    end = new Date();    
    //console.log('Execution time before desktopPanel : ' + (end - start) + ' ms.');
    start = new Date();
        
    // Reload desktop content and display
    updateDesktop = function(){
        Fdl.ApplicationManager.desktopPanel.reload();
    };
    
    end = new Date();    
    //console.log('Execution time after desktopPanel : ' + (end - start) + ' ms.');
    start = new Date();
    
    // Create SimpleFile from the form in the import block (id:'create_simple_file')
    createSimpleFile = function(){
        var form = Ext.getDom('create_simple_file');
        var document = context.createDocument({
            familyId: 'SIMPLEFILE'
        });
        
        document.save();
        
        document.save({
            form: form,
            callback: function(doc){
                var c = context.getDesktopFolder();
                c.insertDocument({
                    id: doc.getProperty('id')
                });
                updateDesktop();
                Fdl.ApplicationManager.addDocument(doc);
            }
        });
        
        form.reset();
    };
    
    createWorkspacePanel = function(workspace){
    
        var workspacePanel = new Ext.Panel({
            title: (workspace) ? workspace.getTitle() : 'Indéfini',
            closable: true,
            layout: 'border',
            border: false,
            items: [{
                region: 'west',
                layout: 'border',
                xtype: 'panel',
                width: 200,
                split: true,
                useSplitTips: true,
                minSize: 200,
                maxSize: 300,
                defaults: {},
                border: false,
                items: [{
                    xtype: 'toolbar',
                    region: 'north',
                    margins: '0 0 0 0',
                    autoHeight: true,
                    items: [{
                        text: Fdl.ApplicationManager.context._("ecm::Search :"),
                        xtype: 'tbtext'
                    }, new Ext.app.SearchField({
                        width: 134,
                        
                        validationEvent: false,
                        validateOnBlur: false,
                        trigger1Class: 'x-form-clear-trigger',
                        trigger2Class: 'x-form-search-trigger',
                        hideTrigger1: true,
                        hasSearch: false,
                        
                        onTrigger1Click: function(){
                            if (this.hasSearch) {
                                this.el.dom.value = '';
                                this.triggers[0].hide();
                                this.hasSearch = false;
                            }
                        },
                        
                        onTrigger2Click: function(){
                            var v = this.getRawValue();
                            
                            this.onTrigger1Click();
                            
                            this.hasSearch = true;
                            this.triggers[0].show();
                            if (v != '') {
//                                Fdl.ApplicationManager.displaySearch(v, {
//                                    criteria: [{
//                                        operator: '~*',
//                                        left: 'svalues',
//                                        right: v
//                                    }]                                
//                                }, {
//                                    windowName: 'simplesearch'
//                                });
                                Fdl.ApplicationManager.displaySearch(v, //{
//                                    criteria: [{
//                                        operator: '~*',
//                                        left: 'svalues',
//                                        right: v
//                                    }]                                
                                /* }, */null, {
                                    windowName: 'simplesearch'
                                });
                            }
                            else {
                                Fdl.ApplicationManager.displayDocument('REPORT', 'create');
                            }
                        }
                    })]
                }, {
                    xtype: 'panel',
                    region: 'center',
                    border: false,
                    margins: '5 5 0 5',
                    layout: 'accordion',
                    bodyCssClass: 'x-border-layout-ct', // To herit the proper background color
                    listeners: {
                        afterrender: function(panel){
                            treePanel = panel;
                        }
                    }
                }, {
                    id: 'south-tabpanel',
                    xtype: 'tabpanel',
                    region: 'south',
                    margins: '5 5 5 5',
                    activeTab: 0,
                    
                    height: 200,
                    items: [homeTree//, 
                         /*  {
                        title: 'Import',
                        html: '<form id="create_simple_file" enctype="multipart/form-data" method="post" style="height:100%;width:100%;background-image:url(\'Images/our_import.png\');background-repeat:no-repeat;background-position:center;" ><input type="file" name="sfi_file" onchange="this.form.style.backgroundImage=\'url(Images/loading.gif)\';createSimpleFile();this.form.style.backgroundImage=\'url(Images/our_import.png)\';" onclick="event.stopPropagation();return false;" style="font-size:200pt;opacity:0;"/></form>',
                        disabled: false,
                        hideLabel:true,
                        hideMode:'display',
                        hidden:true,
                        tabTip: testDragDropUpload() ? 'Importez un fichier depuis votre système' : 'Installez le plugin firefox dragdropupload pour activer cette fonctionalité'
                    }, */]
                
                }]
            },
            Fdl.ApplicationManager.desktopPanel
            ]
        });
        
        if(testOffline()){
            Ext.getCmp('south-tabpanel').add( {
                title: 'Offline',
                layout: 'fit',
                //hidden:true,
                disabled:!testOffline(),
                tabTip: 'Après avoir téléchargé une des applications, travailler en mode déconnecté.',
                listeners: {
                    activate: function(panel){
                        if(!panel.loaded){
                            panel.add(offlineTab());
                        }
                        panel.loaded = true;
                    }
                }
            });
            Ext.getCmp('south-tabpanel').doLayout();
        }
        
        return workspacePanel;
        
    };   
    
    var workspacePanel = createWorkspacePanel(workspace);
    var tab = [];
    tab.push(workspacePanel);
    
    end = new Date();    
    //console.log('Execution time after createWorkspacePanel : ' + (end - start) + ' ms.');
    start = new Date();
    
    for (var i = 1; i < wr.length; i++) {
        if (wr[i]) {
            tab.push({
                title: wr[i].getTitle(),
                closable: true
            });
        }
    }
    
    end = new Date();    
    //console.log('Execution time before tabs : ' + (end - start) + ' ms.');
    start = new Date();
    
    // Main Tab display
    var tabs = new Ext.ux.InlineToolbarTabPanel({
    //var tabs = new Ext.TabPanel({
        region: 'center',
        border: false,
        activeTab: 0,
        resizeTabs: true,
        minTabWidth: 120,
        tabWidth: 150,
        enableTabScroll: true,
        width: 200,
        height: 250,
        headerToolbar: true,
        toolbar: {
            items: [{
                xtype: 'tbfill'
            }, {
            	text: Fdl.ApplicationManager.context._("ecm::New"),
            	icon: 'lib/ui/icon/page_add.png',
            	menu: {
            		style: {
            			overflow: 'visible' // For the Combo popup
	            	},
	            	items: [{
	            		xtype: 'familycombobox',
	            		allOption: false,
	            		control: 'icreate',
	            		iconCls: 'no-icon',
	            		selectOnFocus: true,
	            		width: 135,
	            		emptyText: '',
	            		getListParent: function() {
		                    return this.el.up('.x-menu');
		                },
	            		context: Fdl.ApplicationManager.context,
	            		familySelect: function(id){
	            			this.reset();
	            			this.ownerCt.ownerCt.hideMenu();
	            			var me = this;
	            			(function(){
	            			    me.publish('opendocument',null,id,'create');
	            			}).defer(10);	            			
	            		}
	            	},{
                        xtype: 'menuseparator',
                        style: {
                            width: 155
                        }
                    }],
	            	// See removeAll in Ext JS API for reference.
		          	removeNewFamilies: function(autoDestroy){
	        			this.initItems();
						var item, rem = [], items = [];
						this.items.each(function(i){
						   rem.push(i);
						});
						for (var i = 2, len = rem.length; i < len; ++i){
						   item = rem[i];
						   this.remove(item, autoDestroy);
						   if(item.ownerCt !== this){
						       items.push(item);
						   }
						}
						return items;
	        		}
            	},
            	getNewFamilies: function(){
            		
	            	var sfam = context.getParameter({
			        	id: 'ECM_NEW_FAMILIES'
			        });
			        
			        var rfam = [];
			        
			        if (sfam) {			        	
			        	// Create Group Request.
			        	var g = context.createGroupRequest();
			        	
			            for (var i = 0; i < sfam.length; i++) {			            
			            	if(sfam[i]){
			            		
			            		var famId = sfam[i];
			            		
			            		var request = {};
			            		request[famId] = g.getDocument({
			            			id: famId
			            		});
			            		
			            		g.addRequest(request);
			            					                
			            	}			                                
			            }
			            
			            var r = g.submit();
			            
			            // Extract families from group request.
			            for (var i = 0; i < sfam.length; i++) {			            
			            	if(sfam[i]){
			            		
			            		var famId = sfam[i];
				                var fam = r.get(famId);
				                if(fam){
				                	if(fam.control('icreate')){
						                rfam.push({
						                    id: famId,
						                    img: fam.getIcon({
						                        width: 32
						                    }),
						                    title: fam.getTitle()
						                });
				                	}
				                }
			                
			            	}			                                
			            }
			            
			            
			        }
			        			        
			        return rfam;
		
		        },
		        // Returns true if new family has be added, false elsewhere.
        		setNewFamilies: function(id){
        			
        			var newFamilies = context.getParameter({
			            //id: 'OUR_NEW_FAMILIES'
			        	id: 'ECM_NEW_FAMILIES'
			        });
			        
			        var newFamily = context.getDocument({
			        	id : id,
			        	useCache: true
			        });			        
			        
			        if(newFamilies.indexOf(newFamily.id) == -1 && newFamilies.indexOf(newFamily.getProperty('name')) == -1 ){
				        newFamilies.push(newFamily.getProperty('name'));
				        if(newFamilies.length > 10){
				        	newFamilies.shift();
				        }
	        			
	        			if (!Fdl.ApplicationManager.context.setParameter({
					        id: 'ECM_NEW_FAMILIES',
					        value: JSON.stringify(newFamilies)
					    })) {
					    Ext.Msg.alert(context._("ecm::Error on set families"));
					    }
					    
					    return true ;
					    
			        } else {			        	
			        	return false ;
			        }
        		},
        		updateMenu: function(){
        			
        			var button = this;
        			
        			(function(){
        				
        				button.menu.removeNewFamilies();
        				
	        			var newFamilies = button.getNewFamilies();
	        			for( var i = 0, l = newFamilies.length ; i < l ; i++ ){
	        				var newFamily = newFamilies[i];
	        				button.menu.add({
	        					text: Ext.util.Format.capitalize(newFamily.title),
	        					icon: newFamily.img,
	        					_fdlid: newFamily.id,
	        					handler: function(button){
	        						button.publish('opendocument',null,button._fdlid,'create');
	        					}
	        				});
	        			}
	        				        			
        			}).defer(10);
        		},
        		focusFamilyComboBox: function(){
        			// FIXME It is strange we need to delay by 500 ms for the combobox to properly gain focus. If small values are chosen or if focus is not delayed, field seems to gain focus (focused css is applied), but cursor is not waiting for user input inside the field.
        			this.menu.items.first().focus(true,400);
        		},
        		listeners: {
        			afterrender: function(button){
        				this.subscribe('opendocument',function(wid,id,mode,config){
        					if(mode == 'create'){
	        					if(button.setNewFamilies(id)){
	        						button.updateMenu();
	        					}
        					}
        				});
        			},
        			menushow: function(button,menu){
        				if(!button.loaded){
        					button.updateMenu() ;
        				}
        				button.loaded = true;
        				button.focusFamilyComboBox();
        			}
        		}
            }, {
            	xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: Fdl.ApplicationManager.context.resizeImage('ECM/Images/ecm.png',16),
                text: Fdl.ApplicationManager.context._("ecm::Dynacase ECM"),
                menu: {
	            	style: {
		                overflow: 'visible'
		            },
	            	items:[{
		                cls: 'x-btn-text-icon',
		                icon: 'ECM/Images/our.gadget.png',
		                text: Fdl.ApplicationManager.context._("ecm::Gadgets"),
		                handler: function(){
		                    ecm.listGadgets();
		                }
		            },{
		                text: Fdl.ApplicationManager.context._("ecm::Desktop"),
		                icon: 'lib/ui/icon/application_edit.png',
		                menu: {
			            	style: {
				                overflow: 'visible'     // For the Combo popup
				            },
			            	items:[{
			                    //xtype: 'tbbutton',
			                    cls: 'x-btn-text-icon',
			                    icon: 'lib/ui/icon/arrow_refresh.png',
			                    text: Fdl.ApplicationManager.context._("ecm::Refresh desktop"),
			                    handler: function(){
			                        updateDesktop();
			                    }
			                },{
		                        xtype: 'menuseparator',
		                        style: {
		                            width: 155
		                        }
		                    }, {
				            	xtype: 'themecombo',
				            	iconCls: 'no-icon',
				            	selectOnFocus: true,
				                width: 135,
				                getListParent: function() {
				                    return this.el.up('.x-menu');
				                },
				                emptyText: Fdl.ApplicationManager.context._("ecm::Select Theme")
				            }, {
				            	xtype: 'backgroundcombo',
				            	iconCls: 'no-icon',
				            	selectOnFocus: true,
				                width: 135,
				                getListParent: function() {
				                    return this.el.up('.x-menu');
				                },
				                emptyText: Fdl.ApplicationManager.context._("ecm::Select Background")
				            }]
		            	}
		            }]
            	}
            }, {
                xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: 'ECM/Images/our.identity.png',
                text: context.getUser().getDisplayName(),
                handler: function(){
                //Ext.Msg.alert('Utilisateur', 'Pas encore implémenté');
                },
                menu: {
                	items: [{
		                cls: 'x-btn-text-icon',
		                icon: 'ECM/Images/our.logout.png',
		                text: Fdl.ApplicationManager.context._("ecm::Logout"),
		                handler: function(){
		                    window.location.href = '?app=AUTHENT&action=LOGOUT&SeenBefore=1&logout=Y';
		                }
		            }]
                }
            }]
        },
        items: tab
    });
    
    end = new Date();    
    //console.log('Execution time before viewport : ' + (end - start) + ' ms.');
    start = new Date();
    
    var viewport = new Ext.Viewport({
        layout: 'border',
        items: [tabs, {
            region: 'south',
            xtype: 'panel',
            height: 30,
            // Html to receive taskbar from markup
            html: '<div id="ux-taskbar"><div id="ux-taskbuttons-panel"></div><div class="x-clear"></div></div>'
        }]
    
    });
    
    end = new Date();    
    //console.log('Execution time before addTreeToPanel() : ' + (end - start) + ' ms.');
    start = new Date();
    
    addTreeToPanel(treePanel);
    
    end = new Date();    
    //console.log('Execution time after addTreeToPanel() : ' + (end - start) + ' ms.');
    start = new Date();
    
    function addTreeToPanel(panel){
    
        var workPanel = new Ext.Panel({
        
            layout: 'fit',
            title: Fdl.ApplicationManager.context._("ecm::folder tree"),
            collapsed: false,
            listeners: {
                afterrender: function(me){
                
                    if (!me.loaded) {
                    
                        (function(){
                        
                            if (!me.loadMask) {
                                me.loadMask = new Ext.LoadMask(me.body, {
                                    msg: Fdl.ApplicationManager.context._("ecm::Loading...")
                                });
                            }
                            me.loadMask.show();
                            
                            var workspaceTree = new Ext.Panel({
                                bodyStyle: 'padding:10px;',
                                html: "<p>Vous n'avez aucun espace de travail défini.</p>"
                            });
                            
                            if (workspace) {
                                me.workspaceTreeCollection = new Ext.fdl.TreeCollection({
                                    collection: workspace
                                });
                                var workspaceTree = me.workspaceTreeCollection;
                            }
                            
                            workspaceTree.border = false;
                            
                            me.add(workspaceTree);
                            
                            me.doLayout();
                            
                            me.loadMask.hide();
                        }).defer(1);
                        
                    }
                    
                    me.loaded = true;
                    
                }
            },
            tools: [{
                id: 'refresh',
                handler: function(e, el, panel){
                    if (panel.loaded) {
                        panel.loadMask.show();
                        panel.workspaceTreeCollection.reload();
                        panel.loadMask.hide();
                    }
                }
            }]
        });
        
        panel.add(workPanel);
        
        var searchPanel = new Ext.Panel({
            layout: 'fit',
            title: Fdl.ApplicationManager.context._("ecm::Searches"),
            collapsed: true,
            listeners: {
                expand: function(me){
                
                    if (!me.loaded) {
                    
                        (function(){
                        
                            if (!me.loadMask) {
                                me.loadMask = new Ext.LoadMask(me.body, {
                                    msg: Fdl.ApplicationManager.context._("ecm::Loading...")
                                });
                            }
                            me.loadMask.show();
                            
                            // Search TreePanel
                            var search = context.getSearchDocument({
                                filter: new Fdl.DocumentFilter({
                                    family: 'REPORT',
                                    criteria: [{
                                        operator: '=',
                                        left: 'owner',
                                        right: context.getUser().id
                                    }]
                                })
                            });
                            me.searchTreeCollection = new Ext.fdl.TreeCollection({
                                rootVisible: false,
                                search: search
                            });
                            var searchTree = me.searchTreeCollection;
                            // EO Search TreePanel
                            
                            searchTree.border = false;
                            
                            updateSearch = function(){
                                searchTreeCollection.reload();
                            };
                            
                            me.add(searchTree);
                            
                            me.doLayout();
                            
                            me.loadMask.hide();
                        }).defer(1);
                        
                    }
                    
                    me.loaded = true;
                    
                }
            },
            tools: [{
                id: 'refresh',
                handler: function(e, el, panel){
                    if (panel.loaded) {
                        panel.loadMask.show();
                        panel.searchTreeCollection.reload();
                        panel.loadMask.hide();
                    }
                }
            }]
        });
        
        panel.add(searchPanel);
        
        
        //panel.add(ecm.getOnefamGrid("ONEFAM"));
        
        var familyPanel = new Ext.Panel({
            layout: 'fit',
            title: Fdl.ApplicationManager.context._("ecm::family management"),
            collapsed: true,
            listeners: {
                expand: function(me){
                
                    if (!me.loaded) {
                    
                        (function(){
                        
                            if (!me.loadMask) {
                                me.loadMask = new Ext.LoadMask(me.body, {
                                    msg: Fdl.ApplicationManager.context._("ecm::Loading...")
                                });
                            }
                            me.loadMask.show();
                            
                            var famPanel = new Ext.fdl.FamilyTreePanel({
                                context: context
                            });
                            famPanel.border = false;
                            
                            me.add(famPanel);
                            me.doLayout();
                            
                            me.loadMask.hide();
                            
                        }).defer(1);
                        
                    }
                    
                    me.loaded = true;
                    
                }
            },
            tools: [{
                id: 'refresh',
                handler: function(e, el, panel){
                    panel.removeAll();
                    panel.loaded = false;
                    panel.fireEvent('expand', panel);
                }
            }]
        });
        
        panel.add(familyPanel);
        
        panel.doLayout();
        
    }
    
    taskBar = new Ext.ux.TaskBar({});
    ecm.initializeGadgets();
    
    end = new Date();    
    //console.log('Execution time before viewport.render() : ' + (end - start) + ' ms.');
    start = new Date();
        
    viewport.render(Ext.getBody());
       
    Ext.get('loading').fadeOut({
    	remove:true
    });
    
    // Code to measure execution time
    end = new Date();    
    //console.log('Execution time (ecm.js only) : ' + (end - start) + ' ms.');
    start = new Date();
    
    globalEnd = new Date();
    //console.log('freedom ecm','Execution time (ecm.js only) : ' + (globalEnd - globalStart) + ' ms.');

});

/**
 * Test if Drag Drog Upload Plugin for Firefox is installed.
 * Documentation for Plugin : http://www.teslacore.it/wiki/index.php?title=DragDropUpload
 */
function testDragDropUpload(){
    return true; // Since the method given in documentation does not work, we return always true for now
   // return window["_dragdropupload"];
};

/**
 * Test if Drag Drog Upload Plugin for Firefox is installed.
 * Documentation for Plugin : http://www.teslacore.it/wiki/index.php?title=DragDropUpload
 */
function testOffline(){
	return offlineInstalled || false;
//	var version=context.retrieveFile("offline/Apps/VERSION");
//    return (version != false); // Verify version
};
var ecm = new Object();
ecm.getSession = function(config){
    if ((!ecm.session) || (config && config.reset)) {
    
        ecm.session = context.getParameter({
            id: 'OUR_SESSION'
        });
        if ((!ecm.session) || (typeof ecm.session != 'object')) {
            ecm.session = new Object();
        }
    }
    return ecm.session;
};
ecm.setSession = function(v){
    ecm.session = v;
    if (!context.setParameter({
        id: 'OUR_SESSION',
        value: JSON.stringify(ecm.session)
    })) {
        Ext.Msg.alert(context._("ecm::No ecm_session"));
    }
    return ecm.session;
};

ecm.getBackgrounds= function(size){
    var bgs = context.retrieveData({
        app: 'ECM',
        action: 'ECM_BACKGROUND',
        size:size
    });
    return bgs;
};

ecm.getOnefamGrid = function(appid){

    var famsearches = context.retrieveData({
        app: 'ECM',
        action: 'GETASSOCIATEDSEARCHES',
        appid: appid
    });
    //console.log(famsearches);
    
    var afamilies = ecm.getOnefamSearches(famsearches.admin);
    var ufamilies = ecm.getOnefamSearches(famsearches.user);
    
    var families = afamilies.concat(ufamilies);
    
    var tree = new Ext.tree.TreePanel({
        title: famsearches.application.label,
        loader: new Ext.tree.TreeLoader(),
        rootVisible: false,
        lines: false,
        autoScroll: true,
        root: new Ext.tree.AsyncTreeNode({
            expanded: true,
            leaf: false,
            text: 'Tree Root',
            children: families
        }),
        //root: family_node,
        enableDD: false,
        ddGroup: 'docDD'
    });
    
    return tree;
};


ecm.getOnefamSearches = function(searches){
    var families = [];
    var sf = [];
    for (var i = 0; i < searches.length; i++) {
        sf = [];
        for (var j in searches[i].userSearches) {
            sf.push({
                text: searches[i].userSearches[j].title,
                icon: context.resizeImage(searches[i].userSearches[j].icon, 16),
                documentId: searches[i].userSearches[j].id,
                leaf: true,
                listeners: {
                    click: function(n, e){
                        Fdl.ApplicationManager.displayDocument(n.attributes.documentId);
                    }
                }
            });
        }
        for (var j in searches[i].adminSearches) {
            sf.push({
                text: searches[i].adminSearches[j].title,
                icon: context.resizeImage(searches[i].adminSearches[j].icon, 16),
                documentId: searches[i].adminSearches[j].id,
                leaf: true,
                listeners: {
                    click: function(n, e){
                        Fdl.ApplicationManager.displayDocument(n.attributes.documentId);
                    }
                }
            });
        }
        for (var j in searches[i].workflow) {
            sf.push({
                text: (searches[i].workflow[j].activity) ? searches[i].workflow[j].activity : searches[i].workflow[j].label,
                icon: context.resizeImage('Images/workflow.png', 20),
                documentState: searches[i].workflow[j].state,
                documentId: searches[i].info.id,
                documentTitle: searches[i].info.title,
                leaf: true,
                listeners: {
                    click: function(n, e){
                        Fdl.ApplicationManager.displaySearch('', {
                            family: n.attributes.documentId,
                            criteria: [{
                                operator: '=',
                                left: 'state',
                                right: n.attributes.documentState
                            }]
                        //                            filter: "state='" + n.attributes.documentState + "'"
                        }, {
                            windowName: 'worflow' + n.attributes.documentId + n.attributes.documentState,
                            windowTitle: n.attributes.documentTitle + ' ' + n.text
                        });
                    }
                }
            });
        }
        
        families.push({
            text: searches[i].info.title,
            icon: context.resizeImage(searches[i].info.icon, 16),
            documentId: searches[i].info.id,
            documentTitle: searches[i].info.title,
            leaf: (sf.length == 0),
            children: sf,
            listeners: {
                click: function(n, e){
                    Fdl.ApplicationManager.displaySearch('', {
                        family: n.attributes.documentId
                    }, {
                        windowName: 'family' + n.attributes.documentId,
                        windowTitle: n.attributes.documentTitle
                    });
                }
            }
        });
    }
    return families;
};

Ext.Info = function(){
    var msgCt;
    
    function createBox(t, s){
        return ['<div class="msg">', '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>', '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>', '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>', '</div>'].join('');
    }
    return {
        msg: function(title, format){
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(Fdl.ApplicationManager.desktopPanel.body, {
                    id: 'msg-div'
                }, true);
            }
            msgCt.alignTo(Fdl.ApplicationManager.desktopPanel.body, 't-t', [0, 5]);
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {
                html: createBox(title, s)
            }, true);
            //            m.on('click', function(e,t,o){
            //				console.log('click');
            //                t.ghost("t", {
            //                    remove: true
            //                });
            //            });
            m.slideIn('t').pause(3).ghost("t", {
                remove: true
            });
        }
    };
}();
