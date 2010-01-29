<?php
/**
 * Ecm interface
 *
 * @author Anakeen 2009
 * @version $Id:  $
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @package FREEDOM
 * @subpackage ECM
 */
 /**
 */



include_once("FDL/Class.Doc.php");
include_once("FDL/Class.SearchDoc.php");


function ecm(&$action)  {
	
    if( $action->getParam('ECM_DEBUG') == 'yes' || (isset($_REQUEST['ecm_debug']) && $_REQUEST['ecm_debug'] == 'yes') ) {
      $action->lay->set('DEBUG', true);
	  error_log('ECM DEBUG TRUE');
    } else {
      $action->lay->set('DEBUG', false);
	  error_log('ECM DEBUG FALSE');
    }
  
  $dbaccess = $action->GetParam("FREEDOM_DB");
  $desktop=getTDoc($dbaccess,'FLDDESKTOP_'.$action->user->id);
  if (! $desktop) {
       
    $desktop = createDoc($dbaccess,"DIR");  
    $desktop->title = _("Desktop");
    $desktop->setTitle($desktop ->title);
    $desktop->setValue("ba_desc", sprintf(_("Desktop of %s"),$action->user->firstname." ".$action->user->lastname));
    $desktop->icon = 'flddesktop.png';
    $desktop->name = 'FLDDESKTOP_'.$action->user->id;
    $desktop->Add();

    $home=$desktop->getHome();
    $home->addFile($desktop->initid);
  }
  $desktop=getTDoc($dbaccess,'FLDOFFLINE_'.$action->user->id);
  if (! $desktop) {
       
    $desktop = createDoc($dbaccess,"DIR");  
    $desktop->title = _("Offline");
    $desktop->setTitle($desktop ->title);
    $desktop->setValue("ba_desc", sprintf(_("Offline folder of %s"),$action->user->firstname." ".$action->user->lastname));
    $desktop->icon = 'fldoffline.png';
    $desktop->name = 'FLDOFFLINE_'.$action->user->id;
    $desktop->Add();

    $home=$desktop->getHome();
    $home->addFile($desktop->initid);
  }
  
   // create first worksapce automatically
   $s=new SearchDoc($dbaccess,"WORKSPACE");
   $count=$s->onlyCount();
   if ($count==0) {
       $w=createDoc($dbaccess,"WORKSPACE",true);
       if ($w) {
           $w->setTitle(_("first workspace"));
           $err=$w->add();
           if ($err=="") {
               $w->postModify();
               $w->refresh();
           }
       }
   
   }
}