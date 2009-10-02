/**
 * Ext JS Library 2.2.1
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */
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
    
    // Store documents id contained in the docBar
    docBar = [];
    
    // Data connection
    Fdl.connect({
        url: window.location.pathname
    });
    
    // Tree node expanding (cache folders)
    var expandFolder = function(n){
        if (!n.hasChildNodes()) {
            var c = Fdl.ApplicationManager.getCollection(n.attributes.collection);
            if (c.isAlive()) {
                var sf = c.getSubFolders();
                for (var i = 0; i < sf.length; i++) {
                    var doc = sf[i];
                    n.appendChild(createTreeNode(doc, false));
                }
            }
            else {
                var t = 'ERROR:' + Fdl.getLastErrorMessage();
            }
        }
    }
    
    // Tree node updating (reload folders)
    updateNode = function(n){
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        var c = Fdl.ApplicationManager.getCollection(n.attributes.collection);
        if (c.isAlive()) {
            var sf = c.getSubFolders();
            for (var i = 0; i < sf.length; i++) {
                var doc = sf[i];
                n.appendChild(createTreeNode(doc, false));
            }
        }
        else {
            var t = 'ERROR:' + Fdl.getLastErrorMessage();
        }
        return n;
    }
    
    // Create an Ext TreeNode from Fdl.Collection 
    var createTreeNode = function(collection, isRoot){
        return new Ext.tree.TreeNode({
            collection: collection.id,
            text: collection.getTitle(),
            expandable: collection.getProperty('haschildfolder'),
            expanded: isRoot,
            icon: collection.getIcon({
                width: 20
            }),
            draggable: !isRoot,
            listeners: {
                expand: function(n){
                    expandFolder(n);
                },
                click: function(n, e){
                    Fdl.ApplicationManager.displayDocument(n.attributes.collection, 'view', e);
                }
            }
        });
    };
    
    // Create workspace by getting first returned workspace from search
    var sd = new Fdl.SearchDocument();
    wr = sd.search({
        famid: 'WORKSPACE'
    });
    
    workspace = null;
    
    if (wr.length > 0) {
        workspace = wr[0];
    };
    
    // Set a tree to be able to receive document drops
    function installDocumentDropOnTree(tree){
    
        tree.dropZone.onNodeDrop = function(nodedata, source, e, data){
        
            var n = nodedata.node;
            
            var targetId = n.attributes.collection;
            if (source.dragData.documentId) {
                //console.log('Drop from Desktop on Tree');
                var desktopdrop = true;
                var document = Fdl.ApplicationManager.getDocument(source.dragData.documentId);
            }
            else {
                if (source.dragData.selections) {
                    //console.log('Drop from Grid on Tree');
                    var document = Fdl.ApplicationManager.getDocument(source.dragData.selections[0].data.id);
                }
                else {
                    if (source.dragData.node.attributes.collection) {
                        //console.log('Drop from Tree on Tree');
                        var treedrop = true;
                        var document = Fdl.ApplicationManager.getDocument(source.dragData.node.attributes.collection);
                    }
                }
            }
            
            document.moveTo({
                folderId: targetId
            });
            
            if (treedrop) {
                // Actualize from where we drop
                if (source.dragData.node && source.dragData.node.parentNode && source.dragData.node.getOwnerTree()) {
                    updateNode(source.dragData.node.parentNode).expand();
                }
            }
            
            if (desktopdrop) {
                updateDesktop();
            }
            
            // Actualize to where we drop
            if (n.ownerTree) {
                updateNode(n).expand();
            }
            
            return true;
            
        };
    };
    
    
    // Init the tree folder	
    var home = Fdl.getHomeFolder();
    
    if (home.isAlive()) {
        var home_node = createTreeNode(home, true);
        expandFolder(home_node);
    }
    else {
        var t = 'ERROR:' + Fdl.getLastErrorMessage();
    }
    
    var homeTree = new Ext.tree.TreePanel({
        title: 'Personnel',
        loader: new Ext.tree.TreeLoader(),
        //rootVisible: false,
        lines: false,
        autoScroll: true,
        root: home_node,
        enableDrop: true,
        ddGroup: 'documentDD'
    });
    
    // Handle search expanding and tree content
    expandSearch = function(n){
    
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        
        if (!n.hasChildNodes()) {
            var s = new Fdl.SearchDocument();
            var sr = s.search({
                famid: 'REPORT',
                filter: 'owner=' + Fdl.user.id
            });
            for (var i = 0; i < sr.length; i++) {
                var search = sr[i];
                n.appendChild(new Ext.tree.TreeNode({
                    collection: search.getProperty('id'),
                    text: search.getTitle(),
                    icon: search.getIcon({
                        width: 20
                    }),
                    expandable: search.getProperty('haschildfolder'), // Expandable only if has child
                    listeners: {
                        expand: function(n){
                            expandFolder(n);
                        },
                        click: function(n, e){
                            // Handle display of a folder content
                            Fdl.ApplicationManager.displayDocument(n.attributes.collection, 'view', e);
                        }
                    }
                }));
            }
        }
    };
    
    
    // Reload desktop content and display
    updateDesktop = function(){
    
        // Get desktop document
        var c = new Fdl.getDesktopFolder();
        var p = c.getContent();
        
        var data = new Array();
        
        for (var i = 0; i < p.length; i++) {
            var doc = p[i];
            data.push([doc.getProperty('id'), doc.getTitle(), Ext.util.Format.ellipsis(doc.getTitle(), 15), doc.getIcon({
                width: 32
            }), doc.getProperty('ownername'), doc.getProperty('fromtitle'), doc.getProperty('mdate')]);
        }
        
        var store = new Ext.data.Store({
            data: data,
            reader: new Ext.data.ArrayReader({
                id: 'id'
            }, ['id', 'title', 'shorttitle', 'icon', 'ownername', 'fromtitle', 'mdate'])
        });
        
        // Set up icons view
        var iconView = new Ext.DataView({
            itemSelector: 'div.icon-wrap',
            style: 'overflow:auto;',
            height: '100%',
            multiSelect: true,
            store: store,
            tpl: new Ext.XTemplate('<tpl for=".">', '<div class="icon-wrap" id="{id}">', '<div class="icon"><img ext:qtip="<b>titre : {title}</b>' +
            '<br/>auteur : {ownername}<br/>famille : {fromtitle}' +
            '<br/>dernière modif. : {mdate}' +
            '" src="{icon}" class="icon-img"></div>', '<span style="color:silver;">{shorttitle}</span></div>', '</tpl>'),
            listeners: {
                click: function(dataview, index, node, e){
                    Fdl.ApplicationManager.displayDocument(node.id, 'view', node);
                }
            }
        });
        
        // Generate utils shortcuts, for now only trash
        var utilData = new Array();
        
        var myTrash = Fdl.ApplicationManager.getDocument('OUR_MYTRASH');
        
        utilData.push([myTrash.getProperty('name'), myTrash.getProperty('id'), myTrash.getProperty('title'), myTrash.getIcon({
            width: 32
        })]);
        
        // Set up shortcuts view
        var utilView = new Ext.DataView({
            itemSelector: 'div.util-wrap',
            style: 'overflow:auto;position:absolute;bottom:0;right:0;',
            store: new Ext.data.Store({
                data: utilData,
                reader: new Ext.data.ArrayReader({
                    id: 'id'
                }, ['name', 'id', 'title', 'icon'])
            }),
            tpl: new Ext.XTemplate('<tpl for=".">', '<div class="util-wrap" id="{name}">', '<div class="icon"><img ext:qtip="<b>titre : {title}</b>" src="{icon}" class="icon-img" style="width:32px;"></div>', '<span style="color:silver;">{title}</span></div>', '</tpl>'),
            listeners: {
                click: function(dataview, index, node, e){
                    switch (node.id) {
                    
                        case 'OUR_MYTRASH':
                            
                            var c = Fdl.ApplicationManager.getCollection('OUR_MYTRASH');
                            
                            var cv = new Fdl.CollectionView({
                                collection: c
                            });
                            
                            var view = cv.viewCollection();
                            
                            trashWin = new Ext.Window({
                                title: c.getTitle(),
                                constrain: true,
                                width: 400,
                                height: 560,
                                resizable: false,
                                collapsible: true,
                                autoScroll: true,
                                layout: 'fit',
                                items: [view],
                                renderTo: Ext.getCmp('center').body
                            });
                            
                            // Handle drop
                            var dropTarget = new Ext.dd.DropTarget(trashWin.body, {
                                ddGroup: 'documentDD',
                                notifyDrop: function(ddSource, e, data){
                                    var document = Fdl.ApplicationManager.getDocument(ddSource.dragData.documentId);
                                    document.remove();
                                    cv.update(true);
                                    updateDesktop();
                                    return (true);
                                }
                            });
                            
                            trashWin.show(e);
                            
                            break;
                    }
                    
                }
            }
        });
        
		var center = Ext.getCmp('center');
       	center.removeAll();
        center.add(iconView);
        center.add(utilView);
        center.doLayout();
        
        var dropTarget = new Ext.dd.DropTarget(Ext.get('OUR_MYTRASH'), {
            ddGroup: 'documentDD',
            notifyDrop: function(ddSource, e, data){
                var document = Fdl.ApplicationManager.getDocument(ddSource.dragData.documentId);
                document.remove();
                // TODO Update open window if applicable                                 
                updateDesktop();
                return (true);
            }
        });
        
        var dragZone = new DocumentDragZone(iconView, {
            containerScroll: true,
            ddGroup: 'documentDD'
        });
        
    }
    
    // Create SimpleFile from the form in the import block (id:'create_simple_file')
    createSimpleFile = function(){
        var form = Ext.getDom('create_simple_file');
        var document = Fdl.createDocument({
            familyId: 'SIMPLEFILE'
        });
        
        document.save();
        
        document.save({
            form: form,
            callback: function(doc){
                var c = new Fdl.getDesktopFolder();
                c.insertDocument({
                    id: doc.getProperty('id')
                });
                updateDesktop();
                Fdl.ApplicationManager.addDocument(doc);
            }
        });
        
        form.reset();
    };
    
    function getFamilyCreation() {
	var sfam = Fdl.getParameter({
            id: 'OUR_NEW_FAMILIES'
        });
	var rfam=[];
	if (sfam){
	    for (var i=0;i<sfam.length;i++) {
		rfam.push({
                    id: sfam[i],
                    img: Fdl.ApplicationManager.getDocument(sfam[i]).getIcon({
                        width: 32
                    }),
                    title: Fdl.ApplicationManager.getDocument(sfam[i]).getTitle()
                });
	    }
	    

	    
	}
	return rfam;
    }

    function createWorkspacePanel(workspace){
    
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

                            Fdl.ApplicationManager.displaySearch(v,null,{
								windowName: 'simplesearch'
							});                            
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
            }, {
                region: 'center',
                bodyStyle: 'background:url(ECM/Images/our.desktop.jpg);z-index:0;', /* Assign z-index to center desktop panel for z-index drop patch to work. Patch is in extjs/user/override.js. */
                anchor: '100% 100%',
                id: 'center',
                items: [],
				border: false
            }, {
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
                items: [new Ext.app.SearchField({
                    width: 140
                })],
                docs: getFamilyCreation(),
                tpl: new Ext.XTemplate('<tpl for="docs">', '<div id="{id}" class="fav clickable" style="height:60px;width:160px;"><div><img src={img} style="float:left;margin: 5px;" /></div><div style="line-height:30px;text-transform:capitalize;font-weight:bold;">{title}</div></div>', '</tpl>'),
                
                afterRender: function(){
                    Ext.Window.prototype.afterRender.apply(this, arguments);
                    this.tpl.overwrite(this.body, this);
                    this.body.on({
                        click: {
                            delegate: 'div.clickable',
                            stopEvent: true,
                            fn: function(e, t){
                                Fdl.ApplicationManager.displayDocument(t.id, 'create', t);
                            }
                        }
                    });
                }
                
            }]
        });
    }
    
    var workspacePanel = createWorkspacePanel(workspace);
    var tab = [];
	tab.push(workspacePanel);
	
	for (var i = 1 ; i < wr.length ; i++)
	{
		if(wr[i])
		{
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
                text: Fdl.getUser().getDisplayName(),
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
    
    Ext.get('loading').remove();
    
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
    
    updateDesktop();
    
    function addTreeToPanel(panel){
    
        var mask = new Ext.LoadMask(panel.body, {
            msg: 'Chargement...'
        });
        mask.show();
        
        var workspaceTree = new Ext.Panel({
            title: 'Plan de classement',
            bodyStyle: 'padding:10px;',
            html: "<p>Vous n'avez aucun espace de travail défini.</p>"
        });
        
        if (workspace) {
        
            var workspace_node = createTreeNode(workspace, true);
            expandFolder(workspace_node);
            
            workspaceTree = new Ext.tree.TreePanel({
                title: 'Plan de classement',
                loader: new Ext.tree.TreeLoader(),
                lines: false,
                autoScroll: true,
                root: workspace_node,
                enableDD: true,
                ddGroup: 'documentDD',
                listeners: {
                    afterrender: function(panel){
                        installDocumentDropOnTree(panel);
                    }
                }
            });
            
        }
        
        panel.add(workspaceTree);
        
        search_node = new Ext.tree.TreeNode({
            text: 'Rapports',
            expandable: true,
            expanded: true,
            listeners: {
                expand: function(n){
                    expandSearch(n);
                },
                click: function(n, e){
                    Fdl.ApplicationManager.displayDocument(n.attributes.collection, 'view', e);
                }
            }
        });
        
        expandSearch(search_node);
        
        updateSearch = function(){
            expandSearch(search_node);
        };
        
        panel.add(new Ext.tree.TreePanel({
            title: 'Rapports',
            loader: new Ext.tree.TreeLoader(),
            rootVisible: false,
            lines: false,
            autoScroll: true,
            root: search_node
        }));
        
        // Create families tree
        var ourfam = Fdl.ApplicationManager.getDocument('OUR_FAMILIES');
        if (ourfam.isAlive()) {
            var family_node = createTreeNode(ourfam, true);
            expandFolder(family_node);
        }
       var familyTree = new Ext.tree.TreePanel({
            title: 'Par famille',
            loader: new Ext.tree.TreeLoader(),
            rootVisible: false,
            lines: false,
            autoScroll: true,
	    
           root: family_node,
            enableDD: false,
            ddGroup: 'documentDD'
        });
        
        panel.add(ecm.getOnefamGrid("ONEFAM"));
//       panel.add(familyTree);
        panel.doLayout();
        
        mask.hide();
    }
    
    
    
    var dropTarget = new Ext.dd.DropTarget(Ext.getCmp('center').body, {
        ddGroup: 'documentDD',
        notifyDrop: function(source, e, data){
        
            if (source.dragData.documentId) {
                // Drop from Desktop on Desktop
                var document = Fdl.ApplicationManager.getDocument(source.dragData.documentId);
                return true;
            }
            else {
                if (source.dragData.selections) {
                    // Drop from Grid on Desktop
                    var document = Fdl.ApplicationManager.getDocument(source.dragData.selections[0].data.id);
                    var fromId = source.dragData.grid.collectionId;
                }
                else {
                    if (source.dragData.node.attributes.collection) {
                        //console.log('Drop from Tree on Desktop');
                        var treedrop = true;
                        var document = Fdl.ApplicationManager.getDocument(source.dragData.node.attributes.collection);
                    }
                }
            }
            
            document.moveTo({
                fromFolderId: fromId,
                folderId: Fdl.getDesktopFolder().id
            });
            if (source.dragData.grid) {
            	 if (source.dragData.grid.ownerCt && source.dragData.grid.ownerCt.collectionView) {
               		source.dragData.grid.ownerCt.collectionView.update();
            	 }
            }
            
            if (treedrop) {
                // Actualize from where we drop
                if (source.dragData.node && source.dragData.node.parentNode && source.dragData.node.getOwnerTree()) {
                    updateNode(source.dragData.node.parentNode).expand();
                }
            }
            
            updateDesktop();
            
            return (true);
            
        },
        notifyEnter: function(source, e, data){
            //console.log('Notify Enter');            
            if (e.ctrlKey) {
                //console.log('Ctrl Key down on enter');
            }
        },
        notifyOut: function(source, e, data){
            //console.log('Notify Out');
        }
    });
    
    installDocumentDropOnTree(homeTree);
    
    taskBar = new Ext.ux.TaskBar({});
    ecm.initializeGadgets();
});

// Drag and Drop behaviour
DocumentDragZone = function(view, config){
    this.view = view;
    DocumentDragZone.superclass.constructor.call(this, view.getEl(), config);
};

Ext.extend(DocumentDragZone, Ext.dd.DragZone, {
    // Override dragData
    getDragData: function(e){
        var target = e.getTarget('.icon-wrap');
        if (target) {
            var view = this.view;
            if (!view.isSelected(target)) {
                view.select(target);
                //view.select(target, true);
                //view.onClick(e);
            }
            var selNodes = view.getSelectedNodes();
            var dragData = {
                nodes: selNodes
            };
            if (selNodes.length == 1) {
                dragData.ddel = target;
                dragData.single = true;
                dragData.documentId = target.id;
            }
            // Multiple selection handler
            //            else {
            //                dragData.documentId = [];
            //                var div = document.createElement('div'); // create the multi element drag "ghost"
            //                div.className = 'multi-proxy';
            //                for (var i = 0, len = selNodes.length; i < len; i++) {
            //                    div.appendChild(selNodes[i].firstChild.firstChild.cloneNode(true)); // image nodes only
            //                    if ((i + 1) % 3 == 0) {
            //                        div.appendChild(document.createElement('br'));
            //                    }
            //                    
            //                    dragData.documentId.push(selNodes[i].id);
            //                    
            //                }
            //                var count = document.createElement('div'); // selected image count
            //                count.innerHTML = i + ' documents sélectionnés';
            //                div.appendChild(count);
            //                
            //                dragData.ddel = div;
            //                dragData.multi = true;
            //            }
            
            return dragData;
        }
        return false;
    },
    
    // the default action is to "highlight" after a bad drop
    // but since an image can't be highlighted, let's frame it 
    afterRepair: function(){
        for (var i = 0, len = this.dragData.nodes.length; i < len; i++) {
            Ext.fly(this.dragData.nodes[i]).frame('#8db2e3', 1);
        }
        this.dragging = false;
    },
    
    // override the default repairXY with one offset for the margins and padding
    getRepairXY: function(e){
        if (!this.dragData.multi) {
            var xy = Ext.Element.fly(this.dragData.ddel).getXY();
            xy[0] += 3;
            xy[1] += 3;
            return xy;
        }
        return false;
    }
});

GridDocumentDragZone = function(grid, config){
    GridDocumentDragZone.superclass.constructor.call(this, grid, config);
};
Ext.extend(GridDocumentDragZone, Ext.grid.GridDragZone, {
    getDragData: function(e){
        var retval = GridDocumentDragZone.superclass.getDragData.call(this, e);
        retval.documentId = 'Extra Drag Data';
        return retval;
    }
});

/*
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
    
        ecm.session = Fdl.getParameter({
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
    if (!Fdl.setParameter({
        id: 'OUR_SESSION',
        value: JSON.stringify(ecm.session)
    })) {
        Ext.Msg.alert('No ecm_session');
    }
    return ecm.session;
}

ecm.getOnefamGrid= function(appid) {

    var famsearches=Fdl.retrieveData({app:'ECM',action:'GETASSOCIATEDSEARCHES',
				      appid:appid});
    console.log(famsearches);
     var children = [{
	    text:'First Level Child 1'
	    ,children:[{
		text:'Second Level Child 1'
		,leaf:true,
		listeners: {
                
                click: function(n, e){
                    alert('9');
                }
            }
	    },{
		text:'Second Level Child 2'
		,leaf:true
	    }]
	},{
	    text:'First Level Child 2'
	    ,children:[{
		text:'Second Level Child 1'
		,leaf:true
	    },{
		text:'Second Level Child 2'
		,leaf:true
	    }]
	    
	}];

   
    var afamilies=ecm.getOnefamSearches(famsearches.admin);
    var ufamilies=ecm.getOnefamSearches(famsearches.user);

    var families=afamilies.concat(ufamilies);

        var tree = new Ext.tree.TreePanel({
            title: famsearches.application.label,
            loader: new Ext.tree.TreeLoader(),
            rootVisible: false,
            lines: false,
            autoScroll: true,
	    root:new Ext.tree.AsyncTreeNode({
		expanded:true
		,leaf:false
		,text:'Tree Root'
		,children:families}),
            //root: family_node,
            enableDD: false,
            ddGroup: 'documentDD'
        });

    return tree;
}


ecm.getOnefamSearches= function(searches) { 
    var families=[];
    var sf=[];
    for (var i=0;i<searches.length;i++) {
	sf=[];
	for (var j in searches[i].userSearches) {
	    sf.push({text:searches[i].userSearches[j].title,
		     icon:Fdl.resizeImage(searches[i].userSearches[j].icon,16),
		     documentId:searches[i].userSearches[j].id,
		     leaf:true,
		     listeners: {                
			 click: function(n, e){
			       Fdl.ApplicationManager.displayDocument(n.attributes.documentId);
			 }}});
	}
	for (var j in searches[i].adminSearches) {
	    sf.push({text:searches[i].adminSearches[j].title,
		     icon:Fdl.resizeImage(searches[i].adminSearches[j].icon,16),
		     documentId:searches[i].adminSearches[j].id,
		     leaf:true,
		     listeners: {                
			 click: function(n, e){
			       Fdl.ApplicationManager.displayDocument(n.attributes.documentId);
			 }}});
	}
	for (var j in searches[i].workflow) {
	    sf.push({text:(searches[i].workflow[j].activity)?searches[i].workflow[j].activity:searches[i].workflow[j].label,
		     icon:Fdl.resizeImage('Images/workflow.png',20),
		     documentState:searches[i].workflow[j].state,
		     documentId:searches[i].info.id,		
		     documentTitle:searches[i].info.title,     
		     leaf:true,
		     listeners: {                
			 click: function(n, e){
			     Fdl.ApplicationManager.displaySearch('',{famid:n.attributes.documentId,
								      filter:"state='"+n.attributes.documentState+"'"},
								  {windowName: 'worflow'+n.attributes.documentId+n.attributes.documentState,
								   windowTitle:n.attributes.documentTitle+' '+n.text});
			 }}});
	}

	families.push({text:searches[i].info.title,
		       icon:Fdl.resizeImage(searches[i].info.icon,16),
		       documentId:searches[i].info.id,
		       documentTitle:searches[i].info.title,
		       leaf:(sf.length==0),
		       children:sf,
		       listeners: {                
			   click: function(n, e){
			       Fdl.ApplicationManager.displaySearch('',{famid:n.attributes.documentId},
								    {windowName: 'family'+n.attributes.documentId,
								     windowTitle:n.attributes.documentTitle});
			   }}});
    }
    return families;
}