<?php
/**
 * Ecm interface
 *
 * @author Anakeen 2009
 * @version $Id:  $
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 * @package FREEDOM
 * @subpackage ECM
 */
 /**
 */



include_once("FDL/Class.Doc.php");

function ecm(&$action)  {
  
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
}