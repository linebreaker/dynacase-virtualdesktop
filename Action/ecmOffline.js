/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero
 *          General Public License
 */

var URL_FREEDOM = window.location.pathname;
URL_FREEDOM = URL_FREEDOM.substring(0, URL_FREEDOM.lastIndexOf("/"));
var URL_INSTALL_XPI = URL_FREEDOM + "/offline/Apps/freedomOffline.xpi ";
var URL_INSTALL_WinApps = URL_FREEDOM
		+ "/offline/Apps/freedom_offline_windows.zip ";
var URL_INSTALL_LinApps = URL_FREEDOM
		+ "/offline/Apps/freedom_offline_linux.zip ";
var action;
var fichierVersion = URL_FREEDOM + "/offline/Apps/VERSION";
var fichierRelease = URL_FREEDOM + "/offline/Apps/RELEASE";

var offlineTab = function() {

	var offlineModule = false;

	// test de l'installation du module offline
	if (window.XMLHttpRequest)
		obj = new XMLHttpRequest();
	else if (window.ActiveXObject)
		obj = new ActiveXObject("Microsoft.XMLHTTP"); // Pour Internet
														// Explorer
	if (obj.overrideMimeType)
		obj.overrideMimeType("text/xml"); // Évite un bug de Safari
	obj.open("GET", fichierVersion, false);
	obj.send(null);
	if (obj.readyState == 4 && obj.status == 200) {
		var version = obj.responseText;
		if (window.XMLHttpRequest)
			obj = new XMLHttpRequest();
		else if (window.ActiveXObject)
			obj = new ActiveXObject("Microsoft.XMLHTTP");
		if (obj.overrideMimeType)
			obj.overrideMimeType("text/xml");
		obj.open("GET", fichierRelease, false);
		obj.send(null);
		if (obj.readyState == 4 && obj.status == 200) {
			var release = obj.responseText;
			offlineModule = true;
		}
	}

	Ext.QuickTips.init();

	var btnDl = {
		type : 'tbbutton',
		id : 'btnDownload',
		iconCls : 'iconDl',
		disabled : false,
		tooltip : context._("ecm:Download Freedom Offline"),
		handler : function(btn) {
			var westGrid = Ext.getCmp('westGrid');
			var westGridM = Ext.getCmp('westGridModif');
			var downloadFreedomOff = Ext.getCmp('downloadFreedomOff');
			var dragDropPanel = Ext.getCmp('dragDropPanel');
			console.log('grid' + westGrid.hidden);
			console.log('panel' + downloadFreedomOff.hidden + '  '
					+ downloadFreedomOff.region);
			if (!westGrid.hidden || !dragDropPanel.hidden || !westGridM.hidden) {
				// downloadFreedomOff.region = 'center';
				downloadFreedomOff.show();
				westGrid.hide();
				dragDropPanel.hide();
				westGridM.hide();
			}
		}
	};

	var btnOpenFolder = {
		xtype : 'tbbutton',
		id : 'btnShowOfflineFolder',
		iconCls : 'iconOpenFolder',
		disabled : false,
		tooltip : context._("ecm: view offline containt"),
		handler : function(btn) {
			var westGrid = Ext.getCmp('westGrid');
			var westGridM = Ext.getCmp('westGridModif');
			var downloadFreedomOff = Ext.getCmp('downloadFreedomOff');
			var dragDropPanel = Ext.getCmp('dragDropPanel');
			var dataGrid = createDataGrid(context.getOfflineFolder());
			if (!downloadFreedomOff.hidden || !dragDropPanel.hidden
					|| !westGridM.hidden) {
				downloadFreedomOff.hide();
				westGridM.hide();
				if (dataGrid.length == 0) {
					dragDropPanel.show();
					westGrid.hide();
				} else {
					dragDropPanel.hide();
					westGrid.show();
				}
			} else {
				westGrid.store.loadData( []);
				westGrid.store.loadData(dataGrid);
			}
		}
	};

	var btnmodify = {
		xtype : 'tbbutton',
		id : 'btnmodify',
		iconCls : 'iconModify',
		disabled : false,
		tooltip : context._("ecm:modify offline containt"),
		handler : function(btn) {
			var westGrid = Ext.getCmp('westGrid');
			var westGridM = Ext.getCmp('westGridModif');
			var dataGrid = createDataGrid(context.getOfflineFolder());
			if (!westGridM.hidden) {
				westGrid.show();
				westGridM.hide();
				westGrid.store.loadData(dataGrid);
			} else if (!westGrid.hidden) {
				westGrid.hide();
				westGridM.show();
				westGridM.store.loadData(dataGrid);
			}
		}
	};

	var btnRefresh = {
		xtype : 'tbbutton',
		id : 'btnGoToGears',
		iconCls : 'iconRefresh',
		disabled : false,
		tooltip : context._("ecm:Refresh"),
		handler : function(btn) {
			var westGrid = Ext.getCmp('westGrid');
			var westGridM = Ext.getCmp('westGridModif');
			var dragDropPanel = Ext.getCmp('dragDropPanel');
			var dataGrid = createDataGrid(context.getOfflineFolder());
			if (dataGrid.length == 0) {
				if (!westGrid.hidden) {
					westGrid.hide();
				}
				if (!westGridM.hidden) {
					westGridM.hide();
				}
				dragDropPanel.show();
			} else {
				if (westGrid.hidden) {
					westGridM.hide();
					dragDropPanel.hide();
					westGrid.show();
				}
				westGrid.store.loadData(dataGrid);
			}
		}
	};

	var btnErase = {
		xtype : 'tbbutton',
		id : 'btnErase',
		iconCls : 'icon-delete',
		disabled : false,
		tooltip : context._("ecm:Clear offline folder"),
		handler : function(btn) {
			Ext.Msg
					.confirm(
							'warning',
							context._("ecm:Do you want clear containt ?"),
							function(r) {
								if (r == 'yes') {
									eraseAllOnServer();
									var westGrid = Ext.getCmp('westGrid');
									var westGridM = Ext.getCmp('westGridModif');
									var dragDropPanel = Ext
											.getCmp('dragDropPanel');
									dragDropPanel.show();
									if (!westGrid.hidden) {
										westGrid.hide();
									}
									if (!westGridM.hidden) {
										westGridM.hide();
									}
								}
							});
		}
	};

	if (offlineModule) {
		var items_on_toolbar = [ btnDl, btnOpenFolder, '->', btnmodify,
				btnRefresh, btnErase ];
	} else {
		var items_on_toolbar = [ btnOpenFolder, '->', btnmodify, btnRefresh,
				btnErase ];
	}

	var dataGrid = [];

	// var context = new Fdl.Context({
	// url : URL_FREEDOM
	// });
	//	
	// Fdl.connect({
	// url: URL_FREEDOM
	// });
	var dataGrid = createDataGrid(context.getOfflineFolder());

	var store = new Ext.data.Store( {
		data : dataGrid,
		id : 'westStore',
		reader : new Ext.data.ArrayReader( {
			id : 'id'
		}, [ 'icon', 'title', 'verrou', 'id', 'action1', 'qtip1' ])
	});

	Ext.ToolTip.prototype.onTargetOver = Ext.ToolTip.prototype.onTargetOver
			.createInterceptor(function(e) {
				this.baseTarget = e.getTarget();
			});
	Ext.ToolTip.prototype.onMouseMove = Ext.ToolTip.prototype.onMouseMove
			.createInterceptor(function(e) {
				if (!e.within(this.baseTarget)) {
					this.onTargetOver(e);
					return false;
				}
			});

	var dragDropPanel = new Ext.Panel( {
		xtype : 'panel',
		region : 'north',
		hidden : true,
		id : 'dragDropPanel',
		html : "<div class='divDragDrop'>"
				+ "<p>glisser/déposer des documents.</p>" + "</div>"

	});

	var action = new Ext.ux.grid.RowActions( {
		actions : [ {
			iconIndex : 'action1',
			// iconCls:'icon-lock',
			// tooltip:'verrouiller',
			qtipIndex : 'qtip1'
		}, {
			iconCls : 'icon-delete',
			tooltip : context._("ecm:detach from offline folder")
		} ]
	});
	action.on( {
		action : function(grid, record, action, row, col) {
			var docId = record.data.id;
			// Fdl.connect({
			// url: URL_FREEDOM
			// });
			if (action == "icon-lock") {
				var doc = context.getDocument( {
					id : docId
				});
				if (!doc.lock()) {
					Ext.Msg.alert('Error', context.getLastErrorMessage());
				} else {
					store.loadData( []);
					var dataGrid = createDataGrid(context.getOfflineFolder());
					store.loadData(dataGrid);
				}
			} else if (action == "icon-unlock") {
				var doc = context.getDocument( {
					id : docId
				});
				if (!doc.unlock()) {
					Ext.Msg.alert('Error', context.getLastErrorMessage());
				} else {
					store.loadData( []);
					var dataGrid = createDataGrid(context.getOfflineFolder());
					store.loadData(dataGrid);
				}
			} else if (action == "icon-delete") {
				var d = context.getOfflineFolder();

				if (d.isAlive()) {
					var rs = d.unlinkDocument( {
						id : docId
					});
					if (!rs) {
						Ext.Msg.alert('Error', context.getLastErrorMessage());
					}
					store.loadData( []);
					var dataGrid = createDataGrid(context.getOfflineFolder());
					store.loadData(dataGrid);
				}
			}
		}
	});

	var grid = new Ext.grid.GridPanel( {
		id : 'westGrid',
		xtype : 'grid',
		region : 'center',
		border : false,
		hidden : false,
		enableColumnMove : false,
		enableColumnHide : false,
		// title:'remote directory',
		width : 'auto',
		stripeRows : true,
		store : store,
		// hideHeaders: true,
		columns : [ {
			dataIndex : 'verrou',
			id : 'verrou',
			renderer : verrou_img,
			sortable : true,
			width : 28
		}, {
			dataIndex : 'title',
			id : 'title',
			renderer : title_img,
			sortable : true,
			width : 142
		}, {
			id : 'docId',
			dataIndex : 'docId',
			hidden : true
		}, {
			id : 'action1',
			dataIndex : 'action1',
			hidden : true
		} ],
		autoExpandColumn : 'title',
		/*
		 * onRender: function(){
		 * Ext.grid.GridPanel.prototype.onRender.apply(this, arguments);
		 * this.addEvents("beforetooltipshow"); this.tooltip = new Ext.ToolTip({
		 * renderTo: Ext.getBody(), target: this.view.mainBody, listeners: {
		 * beforeshow: function(qt){ var v = this.getView(); var row =
		 * v.findRowIndex(qt.baseTarget); var cell =
		 * v.findCellIndex(qt.baseTarget); this.fireEvent("beforetooltipshow",
		 * this, row, cell); }, scope: this } }); },
		 */
		listeners : {
			/*
			 * render: function(g) { g.on("beforetooltipshow", function(grid,
			 * row, col) { //grid.tooltip.body.update("Tooltip for (" + row + ", " +
			 * col + ")"); if (col == 0 &&
			 * grid.store.data.items[row].data.verrou !== "0" ){
			 * grid.tooltip.body.update("document verrouillé"); } else if (col ==
			 * 0 && grid.store.data.items[row].data.verrou == "0" ){
			 * grid.tooltip.body.update("document déverrouilé"); } else if (col ==
			 * 1){
			 * grid.tooltip.body.update(grid.store.data.items[row].data.title); }
			 * }); },
			 */
			cellclick : function(grid, rowIndex, columnIndex, e) {
				if (columnIndex == 1) {
					var record = grid.getStore().getAt(rowIndex); // Get the
																	// Record
		var docId = record.data.id;
		Fdl.ApplicationManager.displayDocument(docId, 'view', e);
	}
}
}
	});

	var gridModif = new Ext.grid.GridPanel( {
		id : 'westGridModif',
		xtype : 'grid',
		region : 'north',
		border : false,
		// autoHeight : true,
		height : 200,
		hidden : true,
		// title:'remote directory',
		width : 'auto',
		stripeRows : true,
		store : store,
		// hideHeaders: true,
		columns : [ {
			dataIndex : 'verrou',
			id : 'verrou',
			renderer : verrou_img,
			sortable : true,
			width : 28
		}, {
			dataIndex : 'title',
			id : 'title',
			renderer : title_img,
			sortable : true,
			width : 142
		}, {
			id : 'docId',
			dataIndex : 'docId',
			hidden : true
		}, {
			id : 'action1',
			dataIndex : 'action1',
			hidden : true
		}, action ],
		plugins : [ action ],
		autoExpandColumn : 'title',
		/*
		 * onRender: function(){
		 * Ext.grid.GridPanel.prototype.onRender.apply(this, arguments);
		 * this.addEvents("beforetooltipshow"); this.tooltip = new Ext.ToolTip({
		 * renderTo: Ext.getBody(), target: this.view.mainBody, listeners: {
		 * beforeshow: function(qt){ var v = this.getView(); var row =
		 * v.findRowIndex(qt.baseTarget); var cell =
		 * v.findCellIndex(qt.baseTarget); this.fireEvent("beforetooltipshow",
		 * this, row, cell); }, scope: this } }); },
		 */
		listeners : {
			/*
			 * render: function(g) { g.on("beforetooltipshow", function(grid,
			 * row, col) { //grid.tooltip.body.update("Tooltip for (" + row + ", " +
			 * col + ")"); if (col == 1 && grid.store.data.items[row].data.title !=
			 * 'undefined'){
			 * grid.tooltip.body.update(grid.store.data.items[row].data.title); }
			 * }); },
			 */
			cellclick : function(grid, rowIndex, columnIndex, e) {
				if (columnIndex == 1) {
					var record = grid.getStore().getAt(rowIndex); // Get the
																	// Record
		var docId = record.data.id;
		Fdl.ApplicationManager.displayDocument(docId, 'view', e);
	}
}
}
	});

	var downloadPanel = new Ext.Panel( {
		xtype : 'panel',
		region : 'north',
		hidden : true,
		id : 'downloadFreedomOff',
		title : generTitleDl(),
		html : "<div class='divFO'><ul>" + "<li class='liFO'>"
				+ "<div class='iconDl' ></div>" + "<a href='"
				+ URL_INSTALL_WinApps
				+ "' class='aFO'>"
				+ "application pour Windows"
				+ "</a>"
				+ "</li>"
				+ "<li class='liFO'>"
				+ "<div class='iconDl' ></div>"
				+ "<a href='"
				+ URL_INSTALL_LinApps
				+ "' class='aFO'>"
				+ "application pour Linux"
				+ "</a>"
				+ "</li>"
				+ "<li class='liFO'>"
				+ "<div class='iconDl' ></div>"
				+ "<a href='"
				+ URL_INSTALL_XPI
				+ "' class='aFO'>"
				+ "extension Firefox" + "</a>" + "</li>" + "<ul></div>"

	});

	var centerPanel = new Ext.Panel( {
		region : 'center',
		xtype : 'panel',
		border : false,
		layout : 'fit',
		id : 'centerPanel',
		items : [ grid, gridModif, downloadPanel, dragDropPanel ]
	});

	if (dataGrid.length == 0) {
		grid.hidden = true;
		dragDropPanel.hidden = false;
	}

	var tab = new Ext.Panel( {
		id : 'offlineTab',
		layout : 'border',
		border : false,
		anchor : '100%',
		items : [ {

			region : 'north',
			height : 25,
			xtype : 'toolbar',
			removeTool : function(index) {
				Ext.fly(this.items.get(index).getEl().dom.parentNode).remove();
				this.items.removeAt(index);
			},
			items : items_on_toolbar
		}, centerPanel ],
		listeners : {
			activate : function(tab) {
		
				console.log('Activate');
		
				Ext.getCmp('westGrid').store.loadData( []);
				var dataGrid = createDataGrid(context.getOfflineFolder());
				if (dataGrid.length == 0) {
					var westGrid = Ext.getCmp('westGrid');
					var dragDropPanel = Ext.getCmp('dragDropPanel');
					if (!westGrid.hidden) {
						dragDropPanel.show();
						westGrid.hide();
					}
				} else {
					Ext.getCmp('westGrid').store.loadData(dataGrid);
				}
				
				// dragDrop
				console.log('INSTALL DRAG DROP');
				var offlinedropTarget = new Ext.dd.DropTarget(Ext.getCmp('centerPanel').getEl(), {
					ddGroup : 'docDD',
					notifyDrop : function(source, e, data) {
						if (source.dragData.documentId) {
							// Drop from Desktop on Desktop
							var document = context.getDocument( {
								id : source.dragData.documentId
							});
						} else {
							if (source.dragData.selections) {
								// Drop from Grid on Desktop
								var document = context.getDocument( {
									id : source.dragData.selections[0].data.id
								});
								var fromId = source.dragData.grid.collectionId;
							} else {
								if (source.dragData.node.attributes.collection) {
									// console.log('Drop from Tree on Desktop');
									var treedrop = true;
									var document = context.getDocument( {
										id : source.dragData.node.attributes.collection
									});
								}
							}
						}
						addDoc(document.id);
						Ext.getCmp('westGrid').store.loadData( []);
						var dataGrid = createDataGrid(context.getOfflineFolder());
						Ext.getCmp('westGrid').store.loadData(dataGrid);
	
						return (true);
	
					},
					notifyOver: function(source, e, data) {
						console.log('OVER');
					}
				});
				
			}
		}
	});

	/*
	 * action.on('action', function(grid, record){
	 * 
	 * });
	 */

	function generTitleDl() {
		return ("Freedom Offline v." + version + "." + release);
	}

	function title_img(val, x, store) {
		return '<img src="' + store.data.icon
				+ '" width="15" height="15" align="left">'
				+ '<b style="font-size: 12px;">' + val + '</b><br>';
	}

	function verrou_img(val, x, store) {
		var image;
		if (store.data.verrou == '1') {
			image = '<div class="greenlock"></div>';
		} else if (store.data.verrou == '2') {
			image = '<div class="redlock"></div>';
		}

		return image;
	}

	return tab;
};

function addDoc(docId) {

	// Fdl.connect({
	// url: URL_FREEDOM
	// });
	var d = context.getOfflineFolder();
	if (d.isAlive()) {
		var rs = d.insertDocument( {
			id : docId
		});
		if (!rs) {
			Ext.Msg.alert('Error', context.getLastErrorMessage());
		}
		var westGrid = Ext.getCmp('westGrid');
		var dataGrid = createDataGrid(context.getOfflineFolder());
		var dragDropPanel = Ext.getCmp('dragDropPanel');
		westGrid.store.loadData( []);
		if (westGrid.hidden) {
			dragDropPanel.hide();
			westGrid.show();
		}
		westGrid.store.loadData(dataGrid);
	}

}

function createDataGrid(docIdContainer) {
	var hostName = window.location.hostname;
	var dataArray = new Array();
	var resume = '';
	// Fdl.connect({
	// url: URL_FREEDOM
	// });
	var u = context.getUser( {
		reset : true
	});
	var info = u.getInfo();
	var myName = info.firstname + " " + info.lastname;
	var d = docIdContainer;
	if (d.isAlive()) {
		var dl = d.getContent( {
			completeProperties : true
		});
		if (dl) {
			var p = dl.getDocuments();
			for ( var i = 0; i < p.length; i++) {
				var doc = p[i];
				var access;
				var iconActionPath;
				var qtipAction;
				var lineArray = new Array();

				var lock = doc.getProperty("locked");
				var locker = doc.getProperty("locker");
				if (lock === 0) {
					access = '0';
					iconActionPath = "icon-lock";
					qtipAction = context._("ecm:tolock");
				} else if (lock !== 0 && myName == locker) {
					access = '1';
					iconActionPath = "icon-unlock";
					qtipAction = context._("ecm:toUnlock");
				} else if (lock !== 0 && myName != locker) {
					access = '2';
					iconActionPath = "icon-other-lock";
					qtipAction = context._("ecm:impossible. Locked by another user");
				}
				lineArray.push(doc.getIcon());
				lineArray.push(doc.getTitle());
				lineArray.push(access);
				lineArray.push(doc.getProperties().id);
				lineArray.push(iconActionPath);
				lineArray.push(qtipAction);
				dataArray.push(lineArray);
			}
		}
	}

	return dataArray;
}

function eraseAllOnServer() {

	// Fdl.connect({
	// url: URL_FREEDOM
	// });
	var d = context.getOfflineFolder();

	if (d.isAlive()) {
		var good=d.unlinkAllDocuments();

		if (!good) {
			Ext.Msg.alert('Error', context.getLastErrorMessage());
		}
		Ext.getCmp('westGrid').store.loadData( []);
			
		
	}

}
