
/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 */

/* extjs widget document for photo family */

Ext.fdl.SimpleNote = {
    
    display: function(){
	
	var text = this.document.getValue('note_text') || '';
        
	var color='yellow';
	var nocolor=this.document.getValue('note_color');
	if (nocolor) color=nocolor;
        var note=this.document;
	var ismynote=(note.getProperty('owner')==this.context.getUser().id);
        var panel = new Ext.Panel({
	    //style:'background-color:'+nocolor,
            layout: 'fit',
	    anchor:'100% 100%',
		style: 'padding:10px',
	    
	    items:[{xtype:'panel',  
		    //style:"border:2px solid blue",
		    anchor:'100% 100%',
		    html:'<h2><pre style="min-height:50px;white-space:pre-wrap;" '+(ismynote?'ext:qtip="Cliquez pour modifier la note"':'ext:qtip="Note non modifiable"')+'>'+text+'</pre></h2>'
		   },
		   {xtype:'textarea',  
		    anchor:'100% 100%',
		    //grow:true,
		    fieldLabel:'test',
		    style:'width:100%;height:80%',
		    grow:false,
		    value:text,
		    hidden:true,
		     listeners: {
			 change: function(p,nv,ov) {			     
			     note.setValue('note_text',nv);
			     note.save();
			 },
			 blur: function(p,nv,ov) {
			     var pp=p.ownerCt;
			     if (!pp) return;
			     pp.blursoon=true;
			     setTimeout(function() {	
				 pp.items.itemAt(0).body.update('<h2><pre style="min-height:50px;white-space:pre-wrap;">'+(note.getValue('note_text') || '')+'</pre></h2>');
				 pp.items.itemAt(0).setVisible(true);
				 pp.items.itemAt(1).setVisible(false);
				 pp.items.itemAt(2).setVisible(false);
				 pp.items.itemAt(3).setVisible(false);	
				 setTimeout(function() {			     
				     if (pp) pp.blursoon=false;
				 },5000);     
			     },500);
			     
			 }
		     }},
		   {xtype:'colorpalette',
		    colors:["E4F432","F49F32", "56F432","328DF4","D75968","C61328"],
		    style:'height:50px;display:inline;float:left;width:auto',
		    hidden:true,
		    listeners: {
			select: function(o,c) {			     
			    note.setValue('note_color',c);
			    note.save();
			    o.ownerCt.ownerCt.ownerCt.getEl().dom.style.backgroundColor=c;
			}}},
		   {xtype:'button',
		    text:'Supprimer',
		    style:'float:right;',
		    hidden:true,
		    scope:this,
		      handler: function(o){
			  note.remove();
			  this.window.close();
		      }
		     }		    		    		    
		   ],

            frame: false,
	    scope:this,
	    listeners: (ismynote?{
		render: function(p) {
		    // Append the Panel to the click handler's argument list.
		    // p.getEl().on('click', handlePanelClick.createDelegate(null, [p], true));
		    p.getEl().on('click', function(e) {	
			if (p.blursoon) {			    
			    p.blursoon=false;
			    return;
			}
			if (p.items.itemAt(0).isVisible()) {
			    p.items.itemAt(0).setVisible(false);
			    p.items.itemAt(1).setVisible(true);
			    p.items.itemAt(2).setVisible(true);
			    p.items.itemAt(3).setVisible(true);

			    setTimeout(function() {p.items.itemAt(1).focus();},50);
			}
			
		    });		    
		},
		single: true  // Remove the listener after first invocation
		
		
	    }:{})
	    
        });
     
        this.add(panel);
	
    },

    renderToolbar: function() {}
    
};

