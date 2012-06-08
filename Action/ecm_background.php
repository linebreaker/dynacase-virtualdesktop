<?php
/*
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @package ECM
*/

function ecm_background(&$action)
{
    $size = getHttpVars("size", 100);
    //http://local8/freedom/resizeimg.php?size=100&img=http%3A//local8/freedom/ECM/Images/backgrounds/aurora.jpg
    $pubdir = $action->GetParam("CORE_PUBDIR");
    $imgdir = "ECM/Images/backgrounds";
    $pubdir.= "/$imgdir";
    
    $tfiles = array();
    if ($handle = opendir($pubdir)) {
        $resize = sprintf("./resizeimg.php?size=%d&img=%s/", $size, $imgdir);
        /* Ceci est la façon correcte de traverser un dossier. */
        $tpdfdoc = array();
        while (false !== ($file = readdir($handle))) {
            if (($file != "") && ($file[0] != ".")) {
                // HERE HERE HERE
                $tfiles["$imgdir/$file"] = $resize . $file;
            }
        }
        
        closedir($handle);
    }
    //foreach ($tfiles as $f) print "<img src='$f'>";
    $action->lay->noparse = true; // no need to parse after - increase performances
    $action->lay->template = json_encode($tfiles);
}
?>
