<?php

/**
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 */

include_once("FDL/Class.WDoc.php");


# for i18n
define ("i18n","i18n"); # N_("cr_init") N_("cr_redacted")  N_("cr_published") N_("cr_refused") 
define ("cr_init", "cr_init");
define ("cr_redacted", "cr_redacted");
define ("cr_published", "cr_published");
define ("cr_refused", "cr_refused");

// transition name
# for i18n
define ("i18n","i18n"); #N_("Tcr_published") N_("Tcr_redacted") N_("Tcr_retry") N_("Tcr_refused") 
define ("Tcr_published", "Tcr_published");
define ("Tcr_redacted", "Tcr_redacted");
define ("Tcr_refused", "Tcr_refused");
define ("Tcr_retry", "Tcr_retry");


Class WMinuteMeeting extends WDoc {
  var $attrPrefix="WMM";
  var $firstState=cr_init;

  var $transitions=array( Tcr_redacted =>array(),
			  Tcr_published => array(),
			  Tcr_refused =>array(),		  
			  Tcr_retry=>array());

  var $cycle=array(array("e1"=>cr_init,
			 "e2"=>cr_redacted,
			 "t"=>Tcr_redacted),	  
		   array("e1"=>cr_redacted,
			 "e2"=>cr_published,
			 "t"=>Tcr_published),
		   array("e1"=>cr_redacted,
			 "e2"=>cr_refused,
			 "t"=>Tcr_refused),
		   array("e1"=>cr_redacted,
			 "e2"=>cr_init,
			 "t"=>Tcr_retry) );

  /*  public $stateactivity=array("cr_init"=>"cr writting",
			      "cr_redacted"=>"adoption verification"); # _("adoption writting") _("adoption verification")
  */
  
  

}
?>
