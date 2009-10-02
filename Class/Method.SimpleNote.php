<?php
function postModify() {
  $this->attachToPaste();
  }
function postCreated() {
  $this->attachToPaste();
  }
function postDelete() {
  $this->detachFromPaste();
  }

function attachToPaste() {
  if ($this->getValue("note_pasteid")) {
    $p=new_doc($this->dbaccess,$this->getValue("note_pasteid"),true);
    $noteid=$p->_val2array($p->postitid);
    if (!in_array($this->initid,$noteid)) {
      $noteid[]=$this->initid;
      $p->postitid=$p->_array2val($noteid);
      $p->modify(true,array("postitid"),true);
      $p->addComment(sprintf(_("attach a new note")));
    }  
  }
}


function detachFromPaste() {
  if ($this->getValue("note_pasteid")) {
    $p=new_doc($this->dbaccess,$this->getValue("note_pasteid"),true);
    $noteid=$p->_val2array($p->postitid);
    if (in_array($this->initid,$noteid)) {
      foreach ($noteid as $k=>$v) if ($v==$this->initid) unset($noteid[$k]);
      
      $p->postitid=$p->_array2val($noteid);
      $p->modify(true,array("postitid"),true);
      $p->addComment(sprintf(_("detach note %s"),$this->getTitle()));
    }  
  }
}
?>