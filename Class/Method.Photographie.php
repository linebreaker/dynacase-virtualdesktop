<?php

function postModify() {
  $this->getExif();
  $this->setValue("PHOTO_GOOGLE_LINK",$this->getGoogleMapsUrl());
  $this->miniaturise();
  if ($this->getValue("photo_thumb")) $this->icon=$this->getValue("photo_thumb");
  else $this->icon=$this->getIcon("PHOTO");
  $this->setPhotoTitle();
  }

function setPhotoTitle() {
  if ($this->getValue("photo_title")) $this->setValue("photo_title_cal",$this->getValue("photo_title"));
  else $this->setValue("photo_title_cal",$this->vault_filename("photo_file"));
}

function getExif() {
  $f=$this->vault_filename("photo_file",true);
  $key=array('filesize','mimetype','imagedescription','make','model','xresolution','yresolution','datetime','fnumber','exposuretime','isospeedratings','flash','focallength','datetimeoriginal','datetimedigitized','exifimagewidth','exifimagelength','gpslatituderef','gpslatitude','gpslongituderef','gpslongitude','gpstimestamp');
    
  if ($f) {
    $ex=exif_read_data($f);
    foreach ($ex as $k=>$v) {
      $k=strtolower($k);
      if (in_array($k,$key)) $this->setvalue('photo_'.$k,$v);
    }
  }

  return "";
}

function degree2decimal($degrees,$minutes,$seconds, $direction) {

$seconds=($seconds/60);
$minutes=($minutes+$seconds);
$minutes=($minutes/60);
$decimal=($degrees+$minutes);
//South latitudes and West longitudes need to return a negative result
if (($direction=="S") or ($direction=="W"))
        { $decimal=$decimal*(-1);}
return $decimal;
}
// http://maps.google.com/maps?q=43.34,-1.125833
function _strtonum($str)
{
    $str = preg_replace('`([^+\-*=/\(\)\d\^<>&|\.]*)`','',$str);
    if(empty($str))$str = '0';
    else eval("\$str = $str;");
    return $str;
}
function getGoogleMapsUrl() {
  $l=$this->getTValue("photo_gpslatitude");
  if (count($l) > 0) {
  $lat= $this->degree2decimal($this->_strtonum($l[0]),
		       $this->_strtonum($l[1]),
		       $this->_strtonum($l[2]),
		       $this->getValue("photo_gpslatituderef"));
  $this->setValue("PHOTO_GPSLATITUDEDECIMAL",$lat);
  $l=$this->getTValue("photo_gpslongitude"); 
  $long= $this->degree2decimal($this->_strtonum($l[0]),
		       $this->_strtonum($l[1]),
		       $this->_strtonum($l[2]),
		       $this->getValue("photo_gpslongituderef"));
  $this->setValue("PHOTO_GPSLONGITUDEDECIMAL",$long);
  return sprintf("http://maps.google.com/maps?q=%s,%s",$lat,$long);
  } else return " ";



}

function miniaturise($width=48) {
  $f=$this->vault_filename("photo_file",true);
  if ($f) {
    list($owidth, $oheight) = getimagesize($f);
    $newwidth = $width;
    //$newheight = $oheight * ($width/$owidth);
    $newheight = $width; // same heigth as width
    // chargement
    $thumb = imagecreatetruecolor($newwidth, $newheight);
    $source = imagecreatefromjpeg($f);
    
    // Redimensionnement
    imagecopyresampled($thumb, $source, 0, 0, 0, 0, $newwidth, $newheight, $owidth, $oheight);

    // save in vault
    $tmpfile=uniqid("/var/tmp/thumb").".jpeg";
    if (imagejpeg($thumb,$tmpfile)) {
      $this->storeFile("photo_thumb",$tmpfile);
    }
  }
}
function specRefresh() {
}
?>