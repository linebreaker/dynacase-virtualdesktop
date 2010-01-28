
/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 */

// Code to measure execution time
start = new Date();

// Data connection
var context = new Fdl.Context({
    url: window.location.pathname
});

// TODO Think about javascript error managing in ecm and extui
//	window.onerror = function(msg, url, line){
//		Ext.Msg.alert('Javascript Error', '<b>Message : </b>' + msg + '<br/>' + '<b>Url : </b>' + url + '<br/>' + '<b>Line : </b>' + line);
//	};

Ext.onReady(function(){

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
    
    // Fdl.ApplicationManager will represent global ecm application behaviour
    // TODO Rename more appropriately but take care because Fdl.ApplicationManager was used in many places
    Fdl.ApplicationManager = new Ext.fdl.Interface({
        context: context,
        // These are ecm new specific properties to handle window positioning
        windows: {},
        windowX: 0,
        windowY: 0,
        
        // Store documents id contained in the docBar
        docBar: {}
    
    });
    
    // Override onOpenDocument method to give ecm appropriate behavior (handling of windows and docbar)
    Fdl.ApplicationManager.onOpenDocument = function(wid, id, mode, config){
    
        if (!this.windows[id]) {
        
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
                        win.updateDocumentId(id);
                    },
                    close: function(win){
                        win.publish('closedocument', id);
                    },
                    afterlayout: function(win, layout){
                        // Adjust maximum size to container size
                        var max = Fdl.ApplicationManager.desktopPanel.getHeight();
                        if (win.getHeight() + win.getPosition(true)[1] > max) {
                            win.setHeight(max - win.getPosition(true)[1]);
                        }
                    }
                }
            });
            
            win.show();
            
            this.windowX = this.windowX + 25;
            this.windowY = this.windowY + 25;
            
            this.windows[id] = win;
            
            var doc = win.document;
            
            // Attributes set to be used when rendering the taskbar button
            win.taskIcon = doc.getIcon({
                width: 18
            });
            win.taskTitle = doc.getTitle();
            
            if (!this.docBar[id]) {
                this.docBar[id] = taskBar.addTaskButton(win);
                if (doc.getProperty('id')) {
                    this.docBar[id].setTooltip('<b>titre : ' + doc.getTitle() + '</b>' +
                    '<br/>auteur : ' +
                    doc.getProperty('ownername') +
                    '<br/>famille : ' +
                    doc.getProperty('fromtitle') +
                    '<br/>dernière modif. : ' +
                    doc.getProperty('mdate'));
                }
                
            }
            
        }
        
    };
    
    Fdl.ApplicationManager.onCloseDocument = function(id){
    
        if (this.docBar[id]) {
            taskBar.removeTaskButton(this.docBar[id]);
            this.docBar[id] = null;
        }
        this.windows[id] = null;
        
    };
    
    Fdl.ApplicationManager.onOpenSearch = function(wid, filter, config){
        console.log('FILTER', filter);
        Fdl.ApplicationManager.displaySearch(null, filter, config);
    }
    
    /**
     * DisplaySearch
     * @param {String} key
     * @param {Object} searchConfig
     * @param {Object} widgetConfig {pageSize,windowTitle,windowName}
     */
    Fdl.ApplicationManager.displaySearch = function(key, searchConfig, widgetConfig){
    
        var d = context.getSearchDocument();
        
        var filter = new Fdl.DocumentFilter({
            key: key
        });
        
        if (searchConfig) {
            filter = Ext.apply(filter, searchConfig);
        }
        
        d.filter = filter;
        
        if (!widgetConfig || !widgetConfig.pageSize) {
            var pageSize = 10;
        }
        else {
            var pageSize = widgetConfig.pageSize;
        }
        
        if (!widgetConfig || !widgetConfig.windowTitle) {
            if (key) {
                var windowTitle = 'Recherche : ' + key;
            }
            else {
                var windowTitle = 'Recherche';
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
                show: function(){
                
                    window.updateDocument(d);
                    
                    // Adjust maximum size to container size
                    var container = Fdl.ApplicationManager.desktopPanel.body;
                    var max = container.getHeight();
                    if (this.getHeight() > max) {
                        this.setHeight(max)
                    }
                    
                },
                afterrender: function(win){
                
                    // Adjust maximum size to container size
                    var container = Fdl.ApplicationManager.desktopPanel.body;
                    var max = container.getHeight();
                    if (win.getHeight() + win.getPosition(true)[1] > max) {
                        win.setHeight(max - win.getPosition(true)[1]);
                    }
                    
                    win.mask = new Ext.LoadMask(win.body, {
                        msg: "En cours de chargement..."
                    });
                    win.mask.show();
                    
                //			panel.viewNotes();
                //			setTimeout(function () {panel.viewNotes();},1000);
                },
            }
        });
        
        if (windowName) {
            this.searchWindows[windowName] = window;
        }
        
        // Note for later
        // Highlights were implemented like this in previous versions of ecm
        //            // customize view config
        //            viewConfig: {
        //                forceFit: true,
        //                enableRowBody: true,
        //                getRowClass: function(record, rowIndex, p, store){
        //                    (searchConfig.withHighlight) ? p.body = '<p style="margin:3px;">' + record.data.highlight + '</p>' : null;
        //                    return 'x-grid3-row-expanded';
        //                    
        //                }
        //                
        //            },
        
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
        Ext.Msg.alert('freedom ecm', 'No workspace');
    };
    
    // Home TreePanel
    var homeTreeCollection = new Ext.fdl.TreeCollection({
        title: 'Personnel',
        collection: context.getHomeFolder({
            contentStore: true
        })
    });
    var homeTree = homeTreeCollection.display();
    // EO Home TreePanel
    
    Fdl.ApplicationManager.desktopCollection = new Ext.fdl.IconCollection({
        collection: context.getDesktopFolder({
            contentStore: true
        }),
        useTrash: context.getDocument({
            id: 'OUR_MYTRASH'
        }),
        bodyStyle: {
            "background-image": "url(" + context.url + "ECM/Images/our.desktop.jpg" + ")"
        }
    });
    
    Fdl.ApplicationManager.desktopPanel = Fdl.ApplicationManager.desktopCollection.display();
    Fdl.ApplicationManager.desktopPanel.region = 'center';
    
    // Reload desktop content and display
    updateDesktop = function(){
        Fdl.ApplicationManager.desktopCollection.reload();
    };
    
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
    
    getFamilyCreation = function(){
    
        var sfam = context.getParameter({
            id: 'OUR_NEW_FAMILIES'
        });
        var rfam = [];
        if (sfam) {
            for (var i = 0; i < sfam.length; i++) {
            
                var fam = context.getDocument({
                    id: sfam[i],
                    useCache: true
                });
                
                rfam.push({
                    id: sfam[i],
                    img: fam.getIcon({
                        width: 32
                    }),
                    title: fam.getTitle()
                });
            }
            
            
            
        }
        return rfam;
    }
    
    createWorkspacePanel = function(workspace){
    
        return new Ext.Panel({
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
                        text: 'Chercher : ',
                        xtype: 'tbtext'
                    }, new Ext.app.SearchField({
                        width: 140,
                        
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
                                Fdl.ApplicationManager.displaySearch(v, {
                                    criteria: [{
                                        operator: '~*',
                                        left: 'svalues',
                                        right: v
                                    }]
                                
                                }, {
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
                    listeners: {
                        afterrender: function(panel){
                            treePanel = panel;
                        }
                    }
                }, {
                    xtype: 'tabpanel',
                    region: 'south',
                    margins: '5 5 5 5',
                    activeTab: 0,
                    height: 200,
                    items: [homeTree, {
                        title: 'Import',
                        html: '<form id="create_simple_file" enctype="multipart/form-data" method="post" style="height:100%;width:100%;background-image:url(\'Images/our_import.png\');background-repeat:no-repeat;background-position:center;" ><input type="file" name="sfi_file" onchange="this.form.style.backgroundImage=\'url(Images/loading.gif)\';createSimpleFile();this.form.style.backgroundImage=\'url(Images/our_import.png)\';" onclick="event.stopPropagation();return false;" style="font-size:200pt;opacity:0;"/></form>',
                        disabled: !testDragDropUpload(),
                        tabTip: testDragDropUpload() ? 'Importez un fichier depuis votre système' : 'Installez le plugin firefox dragdropupload pour activer cette fonctionalité'
                    }, offlineTab()]
                
                }]
            }, Fdl.ApplicationManager.desktopPanel, {
                region: 'east',
                xtype: 'panel',
                id: 'create-document',
                title: 'Créer',
                collapsible: true,
                collapsed: true,
                animCollapse: false,
                width: 180,
                minSize: 180,
                closable: false,
                resizable: false,
                layout: 'fit',
                frame: true,
//                items: [new Ext.app.SearchField({
//                    width: 140
//                })],
                tpl: new Ext.XTemplate('<tpl for="docs">', '<div id="{id}" class="fav clickable" style="height:60px;width:160px;"><div><img src={img} style="float:left;margin: 5px;" /></div><div style="line-height:30px;text-transform:capitalize;font-weight:bold;">{title}</div></div>', '</tpl>'),
                
                afterRender: function(){
                    Ext.Window.prototype.afterRender.apply(this, arguments);
                },
                
                listeners: {
                    expand: function(me){
						
						(function(){
						if (!me.loaded) {
						
							me.docs = getFamilyCreation();
							
							me.tpl.overwrite(me.body, me);
							me.body.on({
								click: {
									delegate: 'div.clickable',
									//stopEvent: true,
									fn: function(e, t){
										Fdl.ApplicationManager.displayDocument(t.id, 'create', t);
									}
								}
							});
							
						}
						
						me.loaded = true;
						
						}).defer(10);
                        
                    }
                }
            
            }]
        });
    }
    
    var workspacePanel = createWorkspacePanel(workspace);
    var tab = [];
    tab.push(workspacePanel);
    
    for (var i = 1; i < wr.length; i++) {
        if (wr[i]) {
            tab.push({
                title: wr[i].getTitle(),
                closable: true
            })
        }
    }
    
    // Main Tab display
    var tabs = new Ext.ux.InlineToolbarTabPanel({
        region: 'center',
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
                xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: 'lib/ui/icon/arrow_refresh.png',
                text: 'Actualiser le Bureau',
                handler: function(){
                    updateDesktop();
                }
            }, {
                xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: 'ECM/Images/our.gadget.png',
                text: 'Gadgets',
                handler: function(){
                    ecm.listGadgets();
                }
            }, {
                xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: 'ECM/Images/our.help.png',
                text: 'Aide',
                handler: function(){
                    open('?sole=Y&app=CORE&action=HELPVIEW&appname=FREEDOM', 'download_frame');
                }
            }, {
                xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: 'ECM/Images/our.identity.png',
                text: context.getUser().getDisplayName(),
                handler: function(){
                //Ext.Msg.alert('Utilisateur', 'Pas encore implémenté');
                }
            }, {
                xtype: 'tbbutton',
                cls: 'x-btn-text-icon',
                icon: 'ECM/Images/our.logout.png',
                text: 'Déconnexion',
                handler: function(){
                    window.location.href = '?app=AUTHENT&action=LOGOUT&SeenBefore=1&logout=Y';
                }
            }]
        },
        items: tab
    });
    
    var viewport = new Ext.Viewport({
        layout: 'border',
        renderTo: Ext.getBody(),
        items: [tabs, {
            region: 'south',
            xtype: 'panel',
            height: 30,
            // Html to receive taskbar from markup
            html: '<div id="ux-taskbar"><div id="ux-taskbuttons-panel"></div><div class="x-clear"></div></div>'
        }],
        listeners: {
            afterrender: function(vp){
            }
        }
    
    });
    
    addTreeToPanel(treePanel);
    
    function addTreeToPanel(panel){
    
        var workspaceTree = new Ext.Panel({
            title: 'Plan de classement',
            bodyStyle: 'padding:10px;',
            html: "<p>Vous n'avez aucun espace de travail défini.</p>"
        });
        
        if (workspace) {
            var workspaceTreeCollection = new Ext.fdl.TreeCollection({
                title: 'Plan de classement',
                collection: workspace
            });
            var workspaceTree = workspaceTreeCollection.display();
        }
        
        panel.add(workspaceTree);
        
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
        var searchTreeCollection = new Ext.fdl.TreeCollection({
            title: 'Rapports',
            rootVisible: false,
            search: search
        });
        var searchTree = searchTreeCollection.display();
        // EO Search TreePanel
        
        updateSearch = function(){
            searchTreeCollection.reload();
        };
        
        panel.add(searchTree);
        
        //panel.add(ecm.getOnefamGrid("ONEFAM"));
        panel.add(new Ext.fdl.FamilyTreePanel({
            context: context
        }));
        
        panel.doLayout();
        
    }
    
    taskBar = new Ext.ux.TaskBar({});
    ecm.initializeGadgets();
    
    Ext.get('loading').remove();
    
    // Code to measure execution time
    end = new Date();
    
    console.log('Execution time (ecm.js only) : ' + (end - start) + ' ms.');
    //Ext.Msg.alert('freedom ecm','Execution time (ecm.js only) : ' + (end - start) + ' ms.');

});

/**
 * Test if Drag Drog Upload Plugin for Firefox is installed.
 * Documentation for Plugin : http://www.teslacore.it/wiki/index.php?title=DragDropUpload
 */
function testDragDropUpload(){
    return true; // Since the method given in documentation does not work, we return always true for now
    return window["_dragdropupload"];
}

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
}
ecm.setSession = function(v){
    ecm.session = v;
    if (!context.setParameter({
        id: 'OUR_SESSION',
        value: JSON.stringify(ecm.session)
    })) {
        Ext.Msg.alert('No ecm_session');
    }
    return ecm.session;
}

ecm.getOnefamGrid = function(appid){

    var famsearches = context.retrieveData({
        app: 'ECM',
        action: 'GETASSOCIATEDSEARCHES',
        appid: appid
    });
    console.log(famsearches);
    
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
}


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
}

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
