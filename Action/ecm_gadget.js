/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero
 *          General Public License
 */

ecm._iGoogleGadget = new Object();
ecm._iGoogleGadget = {
	userPref : {
		url : 'http://www.gmodules.com/ig/ifr?url=http://www.efattal.fr/google/circulation/module.html&amp;up_city=caen&amp;up_lastMsg=&amp;up_guid=&amp;up_pseudo=&amp;synd=open&amp;w=320&amp;h=270&amp;title=Conditions+de+la+circulation&amp;border=%23ffffff%7C3px%2C1px+solid+%23999999&amp;output=js',
		title : 'Circulation de Caen'
	},
	hasParameters : true,
	width : 300,
	height : 500,
	extview : 'Ext.fdl.gadgetiGoogleView',
	extparam : 'Ext.fdl.gadgetiGoogleParam'
};
ecm._documentListGadget = new Object();
ecm._documentListGadget = {
	userPref : {
		collectionId : 9
	},
	hasParameters : false,
	extview : 'Ext.fdl.gadgetCollection',
	extparam : 'Ext.fdl.gagetCollecrionParam'
};

ecm.clone = function(srcInstance) {
	/*
	 * Si l'instance source n'est pas un objet ou qu'elle ne vaut rien c'est une
	 * feuille donc on la retourne
	 */
	if (typeof (srcInstance) != 'object' || srcInstance == null) {
		return srcInstance;
	}
	/*
	 * On appel le constructeur de l'instance source pour crée une nouvelle
	 * instance de la même classe
	 */
	var newInstance = srcInstance.constructor();
	/*
	 * On parcourt les propriétés de l'objet et on les recopies dans la nouvelle
	 * instance
	 */
	for ( var i in srcInstance) {
		newInstance[i] = ecm.clone(srcInstance[i]);
	}
	/* On retourne la nouvelle instance */
	return newInstance;
};
ecm.addGadget = function(gadget) {
	if (gadget) {
		var cgadget = ecm.clone(gadget);
		var session = ecm.getSession();

		if (!session.gadgets)
			session.gadgets = [];
		if (!cgadget.id) {
			var dt = new Date();
			var idg = dt.format('YmdHisu');
			cgadget.id = idg;
			session.gadgets.push(cgadget);

			ecm.setSession(session);
		}
		var swin = new Ext.fdl.Service( {
			gadget : cgadget
		},context);
//		if (swin)
//			swin.show();
	}
};
ecm.updateSessionGadget = function(gadget) {
	var session = ecm.getSession();
	if (session.gadgets) {
		var gadgets = session.gadgets;
		if (gadget && gadget.id) {
			for ( var i = 0; i < gadgets.length; i++) {
				if (gadgets[i].id == gadget.id) {
					gadgets[i] = gadget;

				}
			}
			ecm.setSession(session);
		}
	}
};

ecm.removeSessionGadget = function(gadget) {
	var session = ecm.getSession();
	if (session.gadgets) {
		var gadgets = session.gadgets;
		if (gadget && gadget.id) {
			for ( var i = 0; i < gadgets.length; i++) {
				if (gadgets[i].id == gadget.id) {
					gadgets.splice(i, 1);
				}
			}
			ecm.setSession(session);
		}
	}
};
ecm.initializeGadgets = function() {
	var session = ecm.getSession();
	console.log('SESSION GADGETS',session.gadgets);
	if (session.gadgets) {
		for ( var i = 0; i < session.gadgets.length; i++) {
			ecm.addGadget(session.gadgets[i]);
		}
	}
};

ecm.listGadgets = function() {
	var d = context.getSearchDocument();
	var dl = d.search( {
		famid : 'GADGET'
	});
	if (!dl)
		Ext.Msg.alert(Fdl.getLastErrorMessage());
	var p = dl.getDocuments();
	if (!p)
		Ext.Msg.alert(Fdl.getLastErrorMessage());
	else {

		var data = new Array();

		for ( var i = 0; i < p.length; i++) {
			var doc = p[i];
			data.push( [ doc.getProperty('id'), doc.getTitle(), doc.getIcon( {
				width : 32
			}) ]);
		}

		var store = new Ext.ux.data.SimplePagingStore( {
			data : data,
			fields : [ 'id', 'title', 'icon' ]
		});

		var pagingBar = new Ext.PagingToolbar( {
			pageSize : 10,
			store : store,
			displayInfo : true,
			displayMsg : 'Documents {0} - {1} de {2}',
			emptyMsg : "Aucun document"
		});

		var grid = new Ext.grid.GridPanel(
				{
					store : store,
					enableDrag : true,

					loadMask : true,
					anchor : '100% 100%',
					stripeRows : true,
					hideHeaders : true,
					renderTo : document.body,
					border : false,
					columns : [
							{
								header : "Ref",
								dataIndex : 'id',
								width : 40,
								sortable : true,
								hidden : true
							},
							{
								header : "Icon",
								dataIndex : 'icon',
								width : 28,
								sortable : true,
								renderer : function render(value, p, record) {
									return String
											.format(
													'<img src="{0}" style="float:left;height:24px;width:24px;" />',
													value);
								}
							}, {
								header : "Title",
								dataIndex : 'title',
								width : 100,
								sortable : true
							} ],

					// customize view config
					viewConfig : {
						forceFit : true,
						enableRowBody : true
					},

					// paging bar on the bottom
					bbar : pagingBar,

					listeners : {
						afterlayout : function(o) {

							// this.ownerCt.setTitle(this.collection.getTitle());
						},

						rowclick : function(grid, rowIndex, eventObject) {

							var id = grid.store.getAt(rowIndex).data.id;

							var document = Fdl.ApplicationManager.context
									.getDocument({id:id,
										reload : true
									});

							var fromid = document.getProperty('fromname');

							console.log('add gadget document', id, document);
							if (document.isAlive()) {
								var wg = {
									extview : document
											.getValue('gad_viewwidget'),
									extparam : document
											.getValue('gad_editwidget'),
									width : parseInt(document
											.getValue('gad_width')),
									hasParameters : (document
											.getValue('gad_editwidget') != null),
									height : parseInt(document
											.getValue('gad_height')),
									userPref : {},
									javascript : document.getValue('gad_javascript')
								};
								var up = document.getArrayValues('gad_t_parameters');
								console.log('up=',up);
								//var up = document.getAttribute('gad_t_parameters').getArrayValues();

								for ( var i = 0; i < up.length; i++) {
									wg.userPref[up[i].gad_idparam] = up[i].gad_valparam;
								}
								console.log('add gadget', wg);
								ecm.addGadget(wg);
								this.ownerCt.close();
							}
						}

					}

				});

		// Load content of store after all is ready
		store.load( {
			params : {
				start : 0,
				limit : 10
			}
		});

		// 'Hack' to remove the refresh button of the paging bar. Does not
		// work...
		// pagingBar.loading.hideParent = true;
		// pagingBar.loading.hide();

		this.grid = grid;

		var serwin = new Ext.Window( {
			layout : 'fit',
			title : 'Choisissez un gadget',
			// closeAction: 'hide',
			width : 270 + 17,
			height : 150 + 25,
			resizable : true,
			plain : true,
			renderTo : Fdl.ApplicationManager.desktopPanel.body,
			constrain : true,
			// cls:'x-fdl-service',
			items : [ grid ],
			shadow : false,
			listeners : {
				move : function(o) {

				},
				close : function(o) {

				}
			}
		});
		serwin.show();

	}
};