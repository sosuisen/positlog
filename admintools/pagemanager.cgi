#!/usr/bin/perl

# --------------------------------------------------------
# pagemanager.cgi
#      cgi for PositLog user management
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(../);
use strict;
use CGI qw(-debug :standard);
use CGI::Cookie;
use Storable qw(lock_retrieve lock_nstore); # is default library (upper perl 5.8)
use PositLogAuth;
use PositLogConfig;
use PositLogParam;
use File::Copy;
use Encode;

# I18n
eval 'use lang::lang_' . $PositLogConfig::language . ';';
sub MESSAGE{
		no strict "refs"; my ($NAME) = @_; my $INAME = ${ "lang::lang_" . $PositLogConfig::language . "::" . $NAME }; utf8::decode($INAME); $INAME;
}

my $adminpath = "../" . $PositLogConfig::adminpath;
my $datapath = "../" . $PositLogConfig::datapath;

sub deepCopy {
  my $ref = shift;
  if (ref $ref eq 'HASH') {
    my %hash = ();
    scalar keys %$ref;
    while (my($k, $v) = each %$ref) {
      $hash{$k} = &deepCopy($v);
    }
    return \%hash;
  }elsif (ref $ref eq 'ARRAY') {
    my @array = ();
    push @array, &deep_copy($_) for (@$ref);
    return \@array;
  }
  $ref;
}

# CGI parameters are already URL decoded.
my $CGI = new CGI;

# Administration command
my $command = $CGI->param("command");

my $newpagetitle = $CGI->param("newpagetitle");

my $pageid = $CGI->param("page");
my @pageidlist = $CGI->param("pageidlist");

my $listcounter = $CGI->param("listcounter");


my $index = $CGI->param("index");

my $pagegroupid = $CGI->param("pagegroupid");
if($index ne ""){
    $command = $CGI->param("command_" . $index);
}


#--------------------------------------
# Authentication
#--------------------------------------

my $loginid = $CGI->param("loginid");
my $loginpass = $CGI->param("loginpass");

if($loginid eq ""){
		# Read temporal cookie
		$loginid = $CGI->cookie("loginid") || "";
		$loginpass = $CGI->cookie("loginpass") || "";
}

if($loginid eq "public"){
		$loginid = "";
}

my $cookieUser = new CGI::Cookie(
		-path => "$PositLogConfig::cgipath",
		-name => "loginid",
		-value => "$loginid",
		);
my $cookiePass = new CGI::Cookie(
		-path => "$PositLogConfig::cgipath",
		-name => "loginpass",
		-value => "$loginpass",
		);

print $CGI->header(-charset => 'utf-8', -cookie => [$cookieUser,$cookiePass]); 

my $users = eval{ Storable::lock_retrieve($adminpath . "users.dat")};
if($@){ warn "Cannot read " . $adminpath . "users.dat"; exit(0); }
my $userGroups = eval{ Storable::lock_retrieve($adminpath . "usergroups.dat")};
if($@){ warn "Cannot read " . $adminpath . "usergroups.dat"; exit(0); }
my $adminAuth = eval{ Storable::lock_retrieve($adminpath . "key.dat")};
if($@){ warn "Cannot read " . $adminpath . "key.dat"; exit(0); }
my $pages = eval{ Storable::lock_retrieve($adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $adminpath . "pages.dat"; exit(0); }
my $pageGroups = eval{ Storable::lock_retrieve($adminpath . "pagegroups.dat")};
if($@){ warn "Cannot read " . $adminpath . "pagegroups.dat"; exit(0); }

my $authObj = new PositLogAuth($adminpath, $loginid, $loginpass, $pages, $pageGroups, $users, $userGroups, $adminAuth);

if(!$authObj->isAdminUser){
		my $checked = "";
		my $savedpass = "";
		if($loginid eq ""){
				$loginid = $CGI->cookie("savedloginid");
				$savedpass = $CGI->cookie("savedloginpass");
				if($loginid ne ""){
						$checked = "checked";
				}
		}
		
		my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'\n
   'http://www.w3.org/TR/html4/loose.dtd'>\n
<html lang='ja-JP'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<meta http-equiv='Content-Style-Type' content='text/css'>\n
		<link rel='stylesheet' href='" . "../" . $PositLogConfig::admintoolsfilepath . "css/logincheck.css' type='text/css'>\n
		<script type='text/javascript'>
		<!--
		function saveOnClick()
		{
				theDay = new Date();
				theDay.setTime(theDay.getTime() + (30 * 1000 * 60 * 60 * 24));
				var box = document.getElementById('saveaccount');
				var loginid = document.getElementById('loginid').value;
				var loginpass = document.getElementById('loginpass').value;
				if(loginid == '' || loginpass == ''){
						box.checked = false;
						alert('Please enter user id and password')
						return;
				}
				if(!box.checked){
						loginid = '';
						loginpass = '';
				}
				var cs='savedloginid='+loginid+';';
				cs+=' path=" . $PositLogConfig::cgipath . ";';
				if(box.checked)
				{
						cs+=' expires='+theDay.toGMTString()+';';
				}
				document.cookie=cs;

				cs='savedloginpass='+loginpass+';';
				cs+=' path=" . $PositLogConfig::cgipath . ";';
				if(box.checked)
				{
						cs+=' expires='+theDay.toGMTString()+';';
				}
				document.cookie=cs;
		}
		// -->
		</script>
		<title>PositLog Administration : Login</title>\n
	</head>\n";

	my $BODY = "<body onLoad='document.getElementById(\"loginid\").focus()'>\n
  <div id='logintop'>\n
  <div id='login'>\n
  <h1>Login to PositLog Administration</h1>\n
  <form id='loginform' action='pagemanager.cgi' method='post'>\n
    <p>\n
      user id<br>\n
      <input type='text' name='loginid' id='loginid' value='" . $loginid . "' size='20' tabindex='1'>\n
    </p>\n
    <p>\n
      password<br>\n
      <input type='password' name='loginpass' id='loginpass' value='" . $savedpass . "' size='20' tabindex='2'>\n
    </p>\n
    <p id='saveaccount-label'>\n
    Save my user id and password&nbsp;&nbsp;<input type='checkbox' name='saveaccount' id='saveaccount' onclick='saveOnClick();'  tabindex='3' value='1' " . $checked . ">\n
    </p>\n
    <p id='submitarea'>\n<span style='color:red; font-size:12px;'>" . $authObj->getErrorMsg . 
    "</span><br/><input type='submit' id='submitbtn' value='Login' tabindex='4'>\n
    </p>\n
  </form>\n
  </div>\n
  <div id='copyright'>\n
  Powered by <a href='" . $PositLogConfig::positloghome . "' target='_top'>PositLog</a>\n
  </div>\n
  </div>\n
</body>\n";

		my $FOOTER = "</html>";

		print $HEADER . $BODY . $FOOTER;
		exit(0);
}

my $newpagegroupname = $CGI->param("newpagegroupname");
my $pagegroupname = "";
if($pagegroupid ne ""){
		$pagegroupname = $pageGroups->{$pagegroupid}{name};
		utf8::decode($pagegroupname);
}


#---------------------------------------------------------
# Generate User Group List
#---------------------------------------------------------

sub generatePageGroupList{

		my $BODY ="<h2 class='header'>List</h2>\n";

		my $homepid = eval{ Storable::lock_retrieve($adminpath . "homepage.dat")};

		my $groupcounter = 0;

		my @pageGroupList = sort {$pageGroups->{$a}{name} cmp $pageGroups->{$b}{name}} (keys %$pageGroups);

		$BODY .= "<form id='listform' name='listform' action='./pagemanager.cgi' onSubmit='return deletePageGroups()' method='POST'>\n";
		$BODY .= "<div class='itemline_header'><div class='number'>&nbsp;</div><div class='groupname'>Group name</div><div class='groupid'>ID</div>";
		if(scalar(@pageGroupList) > 1){
				$BODY .= "<input type='submit' name='btn_deletepagegroups' value='Delete checked page groups' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)' >\n";
		}
		$BODY .= "</div>";

		foreach my $pgid (@pageGroupList){
				my $pgname = $pageGroups->{$pgid}{name};
				utf8::decode($pgname);
				$groupcounter++;

				my $groupclass = "itemline1";
				if($groupcounter % 2 == 0){
						$groupclass = "itemline2";
				}

				my $groupcounterStr = sprintf("%03d", $groupcounter);
				$BODY .= "<div class='" . $groupclass . "'>\n" . "<div class='number'>";

				$BODY .= $groupcounterStr . ".";

				$BODY .= "</div>"
					. "<div class='groupname'><a href='./pagemanager.cgi?pagegroupid=" . $pgid . "'>"
						. "<span id='pagegroupid_" . $groupcounter . "'>"
						. $pgname . "</span></div></a>\n"

						. "<div class='groupid'>"
						. $pgid
						. "</div>\n";

				if ($pgid ne "all") {
						$BODY .= "<div class='deletecheck'><input type='checkbox' name='pagegroupdeletecheck_" . $groupcounter . "' value='" . $pgid  . "'>delete</div>\n";

						if($homepid eq "" || $$homepid ne $pgid){
								$BODY .= "<input type='button' class='changehomebtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Set home' onclick='changeHomepage(". $groupcounter . ")'>\n";
								$BODY .= "<input type='hidden' name='homepageid_" . $groupcounter . "' value='" . $pgid . "'>";
						}
						else{
								$BODY .= "<span style='color:red'>Homepage</span>";
						}
				}
				$BODY .= "</div>\n\n";
		}
		$BODY .= "<input type='hidden' name='listcounter' id='listcounter' value='" . $groupcounter . "'>\n"
				. "<input type='hidden' id='pagecommand' name='command' value='deletepagegroups'>\n";

		$BODY .= "</form>\n\n";
		return $BODY;
}


#---------------------------------------------------------
# Generate page list 
#---------------------------------------------------------

sub generatePageList{
		my $homepid = eval{ Storable::lock_retrieve($adminpath . "homepage.dat")};

		my $BODY = "<h2 class='header'>List</h2>\n";

    $BODY .= "<form id='listform' name='listform' action='./pagemanager.cgi' method='POST' onSubmit='return deletePages()'>\n";

    $BODY .= "<div class='itemline_header'><div class='number'>&nbsp;</div><div class='pagename'>Title</div><div class='pageid'>ID</div><div class='pageauthor'>Author</div><div class='pageopen'>&nbsp;</div><div class='pageedit'>&nbsp;</div>";

    if($pagegroupid eq "all"){
				$BODY .= "<input type='submit' name='btn_deletepages' value='Delete checked pages from PositLog' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'>\n";
    }
    else{
				$BODY .= "<input type='submit' name='btn_deletepagegroups' value='Exclude checked pages from this group' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)' >\n";
    }
		$BODY .= "</div>";

    my %pagetitlePageid;
    my @pageTitleList;

    my $pagecounter = 0;
    foreach my $pid (sort {$pages->{$a}{name} cmp $pages->{$b}{name}} keys %{$pageGroups->{$pagegroupid}{pages}}) {
				if($pid =~ /^pg/){
						next;
				}
				my $ptitle = $pages->{$pid}{name};
				utf8::decode($ptitle);

				my $pageauthor = $pages->{$pid}{author_id};

				$pagecounter++;

				my $pageclass = "itemline1";
				if($pagecounter % 2 == 0){
						$pageclass = "itemline2";
				}

				my $pagecounterStr = sprintf("%03d", $pagecounter);
				$BODY .= "<div class='" . $pageclass . "'>\n"
						. "<div class='number'>"
						. $pagecounterStr . "</div>"
						. "<div class='pagename'><a href='./pageproperty.cgi?page=" . $pid  . "'><span class='pagename' id='pagename_" . $pagecounter . "'>" . $ptitle . "</span></a>\n"
						. "</div>\n"

						. "<div class='pageid'>"
						. $pid
						. "</div>\n"

						. "<div class='pageauthor'>"
						. $pageauthor
						. "</div>\n";

				if($PositLogConfig::mod_rewrite == 0){
						$BODY .= "<div class='pageopen'>" . "<a href='../positlog.cgi?load=" . $pid  . "' target='_top'>open</a></div>\n";
				}
				else{
						$BODY .= "<div class='pageopen'>" . "<a href='../" . $pid  . ".html' target='_top'>open</a></div>\n";
				}

				$BODY .= "<div class='pageedit'>" . "<a href='../positlog.cgi?load=" . $pid  . "&amp;mode=EditMode' target='_top'>edit</a></div>\n";

				if($pid =~ /^pg/){
						$BODY .= "<div class='deletecheck'><input type='checkbox' style='display:none' name='pagedeletecheck_" . $pagecounter . "'></div>\n";
				}
				else{
						if($pagegroupid eq "all"){
								$BODY .= "<div class='deletecheck'><input type='checkbox' name='pagedeletecheck_" . $pagecounter . "' value='" . $pid  . "'>delete</div>\n";
						}
						else{
								$BODY .= "<div class='deletecheck'><input type='checkbox' name='pagedeletecheck_" . $pagecounter . "' value='" . $pid  . "'>exclude</div>\n";
						}
				}

				$BODY .= "<input type='button' class='duplicatebtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Duplicate' onclick='duplicatePage(" . $pagecounter . ")'>\n";
				$BODY .= "<input type='hidden' name='duplicateid_" . $pagecounter . "' value='" . $pid . "'>";

				if($homepid eq "" || $$homepid ne $pid){
						$BODY .= "<input type='button' class='changehomebtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Set home' onclick='changeHomepage(" . $pagecounter . ")'>\n";
						$BODY .= "<input type='hidden' name='homepageid_" . $pagecounter . "' value='" . $pid . "'>";
				}
				else{
						$BODY .= "<span style='color:red'>Homepage</span>";
				}
				

				$BODY .= "</div>\n\n";
    }

    $BODY .= "<input type='hidden' name='listcounter' id='listcounter' value='" . $pagecounter . "'>\n";
    $BODY .= "<input type='hidden' id='pagegroupid' name='pagegroupid' value='" . $pagegroupid . "'>\n";
    $BODY .= "<input type='hidden' id='pagecommand' name='command' value='deletepages'>\n";


    $BODY .= "</form>";

    return $BODY;
}



#---------------------------------------------------------
# Generate JavaScript
#---------------------------------------------------------

my $ScriptBody = <<__ScriptBody__;
<script type='text/javascript'>
<!--

function addNewPage(){
		if(document.getElementById('newpagetitle').value == ''){alert('Please enter a page name.');return false;}

		return true;
}

function addNewPageGroup(){
		if(document.getElementById('newpagegroupname').value == ''){alert('Please enter a page group name.');return false;}

		return true;
}


function addSelectedPagesToGroup(){
		var selection = document.getElementById('pageidlist');

		var selected = false;
		for(i=0; i<selection.options.length; i++){
				if(selection.options[i].selected){
						selected = true;
				}
		}

		if(!selected){
				alert('Please select one or more pages.');
				return false;
		}

		return true;
}

function deletePages(){
		var deletePageList = "";

    var reg = new RegExp("^pagedeletecheck_", "i");

		var counter = 1;
		for(var i=0; i<document.forms["listform"].elements.length; i++){
				if (document.forms["listform"].elements[i].name.match(reg)){
						if(document.forms["listform"].elements[i].checked){
								deletePageList += document.getElementById("pagename_" + counter).innerHTML + ", ";
						}
						counter++;
				}
		}

		var prefix = "Exclude ";
		var postfix = " from this group";
		if(document.getElementById('pagegroupid').value == 'all'){
				prefix = "Delete ";
				postfix = " ";
		}
		var mes = prefix;

		if(deletePageList == ""){
				alert('Please check one or more page names.');
				return false;
		}
		else{
				if(window.confirm(mes + deletePageList.substr(0, deletePageList.length-2) + postfix + '?')){
						return true;
				}
		}
		return false;
}

function deletePageGroups(){
		if(document.getElementById("pagecommand").value == "changehomepage"){
				return true;
		}

		var deletePageGroupList = "";

    var reg = new RegExp("^pagegroupdeletecheck_", "i");

		var counter = 2;
		for(var i=0; i<document.forms["listform"].elements.length; i++){
				if ((document.forms["listform"].elements[i].name.match(reg))){
						if(document.forms["listform"].elements[i].checked){
								deletePageGroupList += document.getElementById("pagegroupid_" + counter).innerHTML + ", ";
						}
						counter ++;
				}
		}

		var mes = "Delete page groups: ";
		if(counter == 2){
				mes = "Delete page group: ";
		}

		if(deletePageGroupList == ""){
				alert('Please check one or more page group names.');
				return false;
		}
		else{
				if(window.confirm(mes + deletePageGroupList.substr(0, deletePageGroupList.length-2) + ' ?')){
						return true;
				}
		}

		return false;
}

function changeHomepage(index){
		document.getElementById("pagecommand").value = "changehomepage";
		document.getElementById("listcounter").value = index;
		document.listform.submit();
}

function duplicatePage(index){
		document.getElementById("pagecommand").value = "duplicatepage";
		document.getElementById("listcounter").value = index;
		document.listform.submit();
}

function btnAreaMouseOver(elm){
		elm.style.backgroundColor = "#ffd0d0";
}

function btnAreaMouseOut(elm){
		elm.style.backgroundColor = "#ffffff";
}

// -->
</script>
__ScriptBody__

#---------------------------------------------------------
# Generate HTML
#---------------------------------------------------------

my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'\n
   'http://www.w3.org/TR/html4/loose.dtd'>\n
<html lang='" . $PositLogConfig::language . "'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<meta http-equiv='Content-Style-Type' content='text/css'>\n
		<link rel='stylesheet' href='" . "../" . $PositLogConfig::admintoolsfilepath . "css/positlogadmin.css' type='text/css'>\n
		<meta http-equiv='Content-Script-Type' content='text/javascript'>
		<title>PositLog Page manager</title>\n"
		. $ScriptBody
		. "</head>\n";

my $BODY ="";

sub duplicateDirectory{
		my ($srcpath, $dstpath) = @_;

		if(-d $srcpath){
				opendir( DIR, $srcpath);
				my @List = readdir( DIR );
				closedir( DIR );
				foreach my $item (@List){
						if($item eq "." || $item eq ".."){
								next;
						}
						utf8::decode($item);
						if(-d $srcpath . "/" . $item){
								if(!mkdir($dstpath . "/" . $item, 0755)){
										return -1;
								}								
								my $result = duplicateDirectory($srcpath . "/" . $item, $dstpath . "/" . $item);
								if($result == -1){
										return -1;
								}
						}
						elsif(-f $srcpath . "/" . $item){
								my $result = copy($srcpath . "/" . $item, $dstpath . "/" . $item);
								if($result == 0){
										return -1;
								}
						}
				}
		}
		else{
				return -1;
		}

		return 1;
}

sub deleteDirectory{
		my ($path) = @_;

		if(-d $path){
				opendir( DIR, $path);
				my @List = readdir( DIR );
				closedir( DIR );
				foreach my $item (@List){
						if($item eq "." || $item eq ".."){
								next;
						}
						utf8::decode($item);
						if(-d $path . "/" . $item){
								deleteDirectory($path . "/" . $item);
						}
						elsif(-f $path . "/" . $item){
								if(0 == unlink($path . "/" . $item)){
										print "<div style='text-align: center'>Error! : Cannot delete" . $path . "/" . $item . "<br>\n";
										print "<a href='./pagemanager.cgi'>back</a></div>\n";
										exit(0);
								}
						}
				}
				if(0 == rmdir($path)){
						print "<div style='text-align: center'>Error! : Cannot delete" . $path . "<br>\n";
						print "<a href='./pagemanager.cgi'>back</a></div>\n";
						exit(0);
				}
		}
}

sub deletePageInfo{
    my ($pid) = @_;

		my $tags = eval{ Storable::lock_retrieve($adminpath . "tags.dat")};
		if($@){ warn "Cannot read " . $adminpath . "tags.dat"; exit(0); }


		# Delete from users
		foreach my $level (keys %{$pages->{$pid}{users}}){
				foreach my $uid (keys %{$pages->{$pid}{users}{$level}}){
						delete $users->{$uid}{permissions}{$pid};
				}
		}

		# Delete from user groups
		foreach my $level (keys %{$pages->{$pid}{usergroups}}){
				foreach my $ugid (keys %{$pages->{$pid}{usergroups}{$level}}){
						delete $userGroups->{$ugid}{permissions}{$pid};
				}
		}

		# Delete from tags
		foreach my $tag (keys %$tags){
				delete $tags->{$tag}{pages}{$pid};
				if(scalar(keys %{$tags->{$tag}{pages}}) == 0){
						delete $tags->{$tag};
				}
		}

		# Delete from authors
		delete $users->{$pages->{$pid}{author_id}}{authors}{$pid};


		if(-f $datapath . $pid  . "/sprites.dat"){
				if(0 == unlink($datapath . $pid  . "/sprites.dat")){
						print "<div style='text-align: center'>Error! : Cannot delete the sprite list.<br>\n";
						print "<a href='./pagemanager.cgi'>back</a></div>\n";
						exit(0);
				}
		}

		if(-f $datapath . $pid  . "/groups.dat"){
				if(0 == unlink($datapath . $pid  . "/groups.dat")){
						print "<div style='text-align: center'>Error! : Cannot delete the group list.<br>\n";
						print "<a href='./pagemanager.cgi'>back</a></div>\n";
						exit(0);
				}
		}

		if($pid ne "" && $pid ne "/" && $pid ne "./"){
				deleteDirectory($datapath . $pid);
		}

		if(!eval{Storable::lock_nstore $tags, $adminpath . "tags.dat"}){
				warn "Cannot write " . $adminpath . "tags.dat";
				exit(0);
		}

}

sub createNewPage{
    my ($newpageid, $title) = @_;
		if(!mkdir($datapath . $newpageid, 0755)){
				print "Cannot create a page directory '" . $datapath . $newpageid . "'.\n";
				print "Please check file permission.\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		if(!mkdir($datapath . $newpageid ."/static", 0755)){
				print "Cannot create a static sprite directory in '" . $newpageid . "'.\n";
				print "Please check file permission.\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		if(!mkdir($datapath . $newpageid ."/dynamic", 0755)){
				print "Cannot create a dynamic sprite directory in '" . $newpageid . "'.\n";
				print "Please check file permission.\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		if(!mkdir($datapath . $newpageid ."/Image", 0755)){
				print "Cannot create Image directory in '" . $newpageid . "'.\n";
				print "Please check file permission.\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		if(!mkdir($datapath . $newpageid ."/File", 0755)){
				print "Cannot create File directory in '" . $newpageid . "'.\n";
				print "Please check file permission.\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		my %spritesHash;
		if(!eval{Storable::lock_nstore \%spritesHash, $datapath . $newpageid . "/sprites.dat"}){
				print "Cannot create the sprite list.\n";
				print "Please check the file permission.<br>\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		if($authObj->isAdminUser){
				$pages->{$newpageid}{author_id} = "admin";
				$users->{admin}{authors}{$newpageid} = 1;
		}
		else{
				$pages->{$newpageid} = $loginid;
				$users->{$loginid}{authors}{$newpageid} = 1;
		}

		$pages->{$newpageid}{name} = $title;

		$pages->{$newpageid}{sprite_autolink} = 0;
		$pages->{$newpageid}{sprite_html} = 0;
		$pages->{$newpageid}{editor_type} = $PositLogParam::RICH_EDITOR;
		$pages->{$newpageid}{page_type} = "map";
		$pages->{$newpageid}{page_bgcolor} = "ffffff";
		$pages->{$newpageid}{footer_bgcolor} = "ffffff";
		$pages->{$newpageid}{background_image} = "";
		my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
		my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
		$pages->{$newpageid}{created_time} = $time;
		$pages->{$newpageid}{modified_time} = $time;

		if($pagegroupid ne ""){
				$pages->{$newpageid}{groups}{$pagegroupid} = 1;
				$pageGroups->{$pagegroupid}{pages}{$newpageid} = 1;
		}
		$pages->{$newpageid}{groups}{all} = 1;
		$pageGroups->{all}{pages}{$newpageid} = 1;

		$pages->{$newpageid}{users}{$PositLogParam::USERLEVEL_READ}{public} = 1;
		$users->{public}{permissions}{$newpageid} = $PositLogParam::USERLEVEL_READ;
		$pages->{$newpageid}{users}{$PositLogParam::USERLEVEL_SUPER}{admin} = 1;
		$users->{admin}{permissions}{$newpageid} = $PositLogParam::USERLEVEL_SUPER;

		if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
				warn "Cannot write " . $adminpath . "users.dat";
				exit(0);
		}
		if(!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}){
				warn "Cannot write " . $adminpath . "pages.dat";
				exit(0);
		}
		if(!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}){
				warn "Cannot write " . $adminpath . "pagegroups.dat";
				exit(0);
		}

}

sub generateMainPage{
    my ($statusStr) = @_;
    my $BODY = "<body class='admin'>\n";

		my $usernamestr = "";
		if($authObj->isAdminUser){
				$usernamestr = "<span class='usernamearea'>You are the '<a href='./userproperty.cgi?user=admin'>admin</a>' user.</span>";
		}
		elsif($loginid eq ""){
				$usernamestr = "<span class='usernamearea'>You are the '<a href='./userproperty.cgi?user=public'>public</a>' user.</span>";
		}
		else{
				$usernamestr = "<span class='usernamearea'>Your id is '<a href='./userproperty.cgi?user=$loginid'>$loginid</a>'.</span>";
		}

    if($pagegroupid ne ""){
				if($pagegroupid eq "all"){
						$BODY .= "<h1 class='pagemanagement'>All pages</h1>";
				}
				else{
						$BODY .= "<h1 class='pagemanagement'>Page group '" . $pagegroupname . "' (" . $pagegroupid . ")</h1>";
				}
				$BODY .= $usernamestr . "<br>";
				$BODY .= "<div class='relatedpages'>";
				
				$BODY .= "[<a href='../positlog.cgi?load=" . $pagegroupid . "_latest' target='_top'>latest</a>]";
				$BODY .= "&nbsp;[<a href='../recentcontents.cgi?type=page&pagegroupid=" . $pagegroupid . "' target='_top'>recent pages</a>]";
				$BODY .= "&nbsp;[<a href='../recentcontents.cgi?type=sprite&pagegroupid=" . $pagegroupid . "' target='_top'>recent sprites</a>]</div>";
		}
		else{
				$BODY .= "<h1 class='pagemanagement'>Page groups</h1>\n";
				$BODY .= $usernamestr . "<br>";
		}

		$BODY .="<p><span class='statusarea'>" . $statusStr . "</span></p>";

    if($pagegroupid ne ""){

				if($pagegroupid ne "all"){
						$BODY .= "<h3 class='header'>Change group name</h5>\n";
						$BODY .= "<ul id='howtotext'><li>" . MESSAGE("PAGEMNG_CREATENEWPAGEGROUPNOTE") . "</ul>";
						$BODY .= "<form id='form_changepagegroupname' action='./pagemanager.cgi' onSubmit='return addNewPageGroup()' method='post'>\n"
								. "<div class='newpagename'><input type='text' name='newpagegroupname' id='newpagegroupname' size='24' tabindex='3'></div>\n"
								. "<div class='newbtn'><input type='submit' id='btn_changegroupname' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Change'  tabindex='4'></div>\n";
						
						$BODY .= "<input type='hidden' name='command_changepagegroupname' value='changepagegroupname'>\n"
								. "<input type='hidden' name='pagegroupid' value='" . $pagegroupid . "'>\n"
								. "<input type='hidden' name='index' value='changepagegroupname'>\n"
								. "</form><br>\n\n";
				}

				# Add a new page
				if($pagegroupid eq "all"){
						$BODY .= "<h3 class='header'>Create new page</h5>\n";
				}
				else{
						$BODY .= "<h3 class='header'>Add new page</h5>\n";
				}

				$BODY .= "<ul id='howtotext'><li>" . MESSAGE("PAGEMNG_CREATENEWPAGENOTE") . "</ul>";

				$BODY .= "<form id='form_newpage' action='./pagemanager.cgi' onSubmit='return addNewPage()' method='post'>\n"
						. "<div class='newpagename'><input type='text' name='newpagetitle' id='newpagetitle' size='24' tabindex='1'></div>\n"
						. "<div class='newbtn'><input type='submit' id='btn_newpage' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Create this page'  tabindex='2'></div>\n";
				$BODY .= "<input type='hidden' name='command' value='addnewpage'>\n";
				$BODY .= "<input type='hidden' name='pagegroupid' value='$pagegroupid'>\n"
						. "</form><br>\n\n";

				# Add page to this group
				if ($pagegroupid ne "all") {
						$BODY .= "<h5 class='pagemanagement'>Add from page list</h5>\n";

						my $length = scalar(keys %$pages);
						if ($length > 20) {
								$length = 20;
						}

						$BODY .= "<form id='form_addpagetogroup' action='./pagemanager.cgi' onSubmit='return addSelectedPagesToGroup()'  method='POST'>\n<select id='pageidlist' multiple size='3' name='pageidlist' onmousedown='this.size=" . $length . ";'>\n";

						my %titleHash;
						foreach my $apage (keys %$pages) {
								# Remove templage pages
								if($apage !~ /^pg/){
										if (!exists($pageGroups->{$pagegroupid}{pages}{$apage})) {
												$titleHash{$apage} = $pages->{$apage}{name};
										}
								}
						}

						foreach my $apage (sort {$titleHash{$a} cmp $titleHash{$b}} (keys %titleHash)) {
								my $ptitle = $titleHash{$apage};
								utf8::decode($ptitle);
								$BODY .= "<option value='" . $apage . "'>" . $ptitle . "</option>\n";
						}
						$BODY .= "</select>\n";
						$BODY .= "<input type='submit' id='btn_addpagestogroup' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Add selected pages to " . $pagegroupname ."' >\n";
						$BODY .= "<input type='hidden' name='command' value='addpagestogroup'>";
						$BODY .= "<input type='hidden' name='pagegroupid' value='" . $pagegroupid . "'>"; # posted parameter is automatically URL encoded
						$BODY .= "</form>";

						$BODY .= "<br style='clear:left'>";
				}

				$BODY .= generatePageList();
		}
		else{
				# Add a new page group
				$BODY .= "<h3 class='header'>Create new page group</h3>\n";

				$BODY .= "<ul id='howtotext'><li>" . MESSAGE("PAGEMNG_CREATENEWPAGEGROUPNOTE") . "</ul>";

				$BODY .= "<form id='form_newpagegroup' action='./pagemanager.cgi' onSubmit='return addNewPageGroup()' method='post'>\n"
						. "<div class='newpagename'><input type='text' name='newpagegroupname' id='newpagegroupname' size='24' tabindex='3'></div>\n"
						. "<div class='newbtn'><input type='submit' id='btn_newgroup' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Create this group'  tabindex='4'></div>\n";
				
				$BODY .= "<input type='hidden' name='command_newgroup' value='addnewpagegroup'>\n"
						. "<input type='hidden' name='index' value='newgroup'>\n"
						. "</form><br>\n\n";

				$BODY .= generatePageGroupList();
    }


    return $BODY;
}


#---------------------------------------------------------------
# command processor
#---------------------------------------------------------------

if($command eq ""){
		$BODY = generateMainPage();
}
elsif($command eq "changehomepage"){
		# Get current page list
		my $homepageid = $CGI->param("homepageid_" . $listcounter);

		my $homepagetitle = "";
		if(exists($pages->{$homepageid})){
				$homepagetitle = $pages->{$homepageid}{name};
		}
		if(exists($pageGroups->{$homepageid})){
				$homepagetitle = $pageGroups->{$homepageid}{name};
		}
		if($homepagetitle eq ""){
				print "The page does not exist.\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		if (!eval{Storable::lock_nstore \$homepageid, $adminpath . "homepage.dat"}) {
				print "Cannot save the homepage data.\n";
				print "Please check the file permission.<br>\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}
		
		utf8::decode($homepagetitle);
		$BODY .= generateMainPage($homepagetitle . " has been configured to be your homepage.");

}
elsif($command eq "duplicatepage"){
		# Get current page list
		my $srcpageid = $CGI->param("duplicateid_" . $listcounter);
		my $newpageid = "";

    # generate new pageID
		my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);

		my @alpha = ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
		do{
				my $createtime = sprintf("%02d%02d%02d", $year+1900-2000, $mon+1, $mday);
				my $rand = int (rand(52));
				my $rand2 = int (rand(52));
				$newpageid = $createtime . $alpha[$rand] . $alpha[$rand2];
		}
		while(exists($pages->{$newpageid}));

    # Duplicate tags
		my $tags = eval{ Storable::lock_retrieve($adminpath . "tags.dat")};
		if($@){ warn "Cannot read " . $adminpath . "tags.dat"; exit(0); }

		foreach my $tag (keys %$tags){
				$tags->{$tag}{pages}{$newpageid} = deepCopy($tags->{$tag}{pages}{$srcpageid});
		}

    # Duplicate properties
		$pages->{$newpageid} = deepCopy($pages->{$srcpageid});

		$users->{$pages->{$srcpageid}{author_id}}{authors}{$newpageid} = 1;
		
		$pages->{$newpageid}{name} = $pages->{$srcpageid}{name} . "(copy)";

		my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
		$pages->{$newpageid}{created_time} = $time;
		$pages->{$newpageid}{modified_time} = $time;

		foreach my $gid (keys %{$pages->{$newpageid}{groups}}){
				$pageGroups->{$gid}{pages}{$newpageid} = 1;
		}

		foreach my $level (keys %{$pages->{$newpageid}{users}}){
				foreach my $uid (keys %{$pages->{$newpageid}{users}{$level}}){
						$users->{$uid}{permissions}{$newpageid} = $level;
				}
		}

		foreach my $level (keys %{$pages->{$newpageid}{usergroups}}){
				foreach my $ugid (keys %{$pages->{$newpageid}{usergroups}{$level}}){
						$userGroups->{$ugid}{permissions}{$newpageid} = $level;
				}
		}

		if(!mkdir($datapath . $newpageid, 0755)){
				print "Cannot create a page directory '" . $datapath . $newpageid . "'.\n";
				exit(0);
		}

		my $result = duplicateDirectory($datapath . $srcpageid, $datapath . $newpageid);
		if($result != 1){
				warn "Cannot duplicate " . $datapath . $newpageid;
				exit(0);
		}

		if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
				warn "Cannot write " . $adminpath . "users.dat";
				exit(0);
		}
		if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
				warn "Cannot write " . $adminpath . "usergroups.dat";
				exit(0);
		}
		if(!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}){
				warn "Cannot write " . $adminpath . "pages.dat";
				exit(0);
		}
		if(!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}){
				warn "Cannot write " . $adminpath . "pagegroups.dat";
				exit(0);
		}
		if(!eval{Storable::lock_nstore $tags, $adminpath . "tags.dat"}){
				warn "Cannot write " . $adminpath . "tags.dat";
				exit(0);
		}

		my $spritesHash = eval{ Storable::lock_retrieve($datapath . $newpageid . "/sprites.dat")};
		if($@){	print "Cannot read sprites.dat.\n"; exit(0); }
		foreach my $sid (keys %{$spritesHash}){
				my $spriteContents = eval{ Storable::lock_retrieve($datapath . $newpageid . "/static/" . $sid .".spr")} or "";
				
				if($$spriteContents =~ s/$srcpageid\/Image/$newpageid\/Image/g){
						if(!eval{Storable::lock_nstore $spriteContents, $datapath . $newpageid . "/static/" . $sid . ".spr"}){ warn "Cannot rewrite " . $sid . ".spr.\n"; exit(0); }
				}
				if($$spriteContents =~ s/$srcpageid\/File/$newpageid\/File/g){
						if(!eval{Storable::lock_nstore $spriteContents, $datapath . $newpageid . "/static/" . $sid . ".spr"}){ warn "Cannot rewrite " . $sid . ".spr.\n"; exit(0); }
				}
				if($$spriteContents =~ s/$srcpageid\/images/$newpageid\/images/g){
						if(!eval{Storable::lock_nstore $spriteContents, $datapath . $newpageid . "/static/" . $sid . ".spr"}){ warn "Cannot rewrite " . $sid . ".spr.\n"; exit(0); }
				}
				if($$spriteContents =~ s/$srcpageid\/files/$newpageid\/files/g){
						if(!eval{Storable::lock_nstore $spriteContents, $datapath . $newpageid . "/static/" . $sid . ".spr"}){ warn "Cannot rewrite " . $sid . ".spr.\n"; exit(0); }
				}
		}
		if(!eval{Storable::lock_nstore $spritesHash, $datapath . $newpageid . "/sprites.dat"}){
				warn "Cannot write sprites.dat.\n"; exit(0);
		}		

		my $pagetitle = $pages->{$srcpageid}{name};
		utf8::decode($pagetitle);
		$BODY .= generateMainPage($pagetitle . " has been duplicated.");

}
elsif($command eq "addnewpage"){
		#---------------------------------------------------------
		# Add a new page
		#---------------------------------------------------------

		my @pageList = keys %{$pages};

		# generate new pageID
		my $newpageid = "";
		my @alpha = ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
		do{
				my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst);
				($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
				my $createtime = sprintf("%02d%02d%02d", $year+1900-2000, $mon+1, $mday);
				my $rand = int (rand(52));
				my $rand2 = int (rand(52));
				$newpageid = $createtime . $alpha[$rand] . $alpha[$rand2];
    }while(exists($pages->{$newpageid}));

		createNewPage($newpageid, $newpagetitle);

		utf8::decode($newpagetitle);
		$BODY .= generateMainPage("Page '" . $newpagetitle . "' has been created.");

}
elsif($command eq "changepagegroupname"){

		$pageGroups->{$pagegroupid}{name} = $newpagegroupname;
		if(!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}){
				warn "Cannot write " . $adminpath . "pagegroups.dat";
				exit(0);
		}
		$pagegroupname = $newpagegroupname;
		utf8::decode($pagegroupname);
		$BODY .= generateMainPage("Page group name has been changed.");

}
elsif($command eq "addpagestogroup"){
		#---------------------------------------------------------
		# Add pages to a group
		#---------------------------------------------------------

		if ($pagegroupid ne "") {
				my $addedlist = "";
				my $alllist = "";
				my $pagecount = 0;

				foreach my $newid (@pageidlist){
						if (!exists($pageGroups->{$pagegroupid}{pages}{$newid})) {
								$pageGroups->{$pagegroupid}{pages}{$newid} = 1;
								$pages->{$newid}{groups}{$pagegroupid} = 1;

								my $ptitle =  $pages->{$newid}{name};
								utf8::decode($ptitle);								
								$addedlist .= $ptitle . ", ";
								$pagecount++;
								$alllist .= $newid . ", ";
						}
				}

				if($alllist ne ""){
						$alllist = substr($alllist, 0, length($alllist)-2);
				}
				if($addedlist ne ""){
						$addedlist = substr($addedlist, 0, length($addedlist)-2);
				}


				if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
						warn "Cannot write " . $adminpath . "pages.dat";
						exit(0);
				}

				if (!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}) {
						warn "Cannot write " . $adminpath . "pagegroups.dat";
						exit(0);
				}

				if($pagecount == 1){
						$BODY .= generateMainPage("Page '" . $addedlist . "' has been added to '" .$pagegroupname . "' page group.");
				}
				elsif($pagecount > 1){
						$BODY .= generateMainPage("Pages '" . $addedlist . "' have been added to '" .$pagegroupname . "' page group.");
				}
				else{
						$BODY .= generateMainPage("No page has been added to '" .$pagegroupname . "' page group.");
				}
		}
}
elsif($command eq "addnewpagegroup"){
		#---------------------------------------------------------
		# Add a new group
		#---------------------------------------------------------

		# generate new pagegroupID
		my $newpagegroupid = "";
		my @alpha = ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
		do{
				my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst);
				($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
				my $createtime = sprintf("%02d%02d%02d", $year+1900-2000, $mon+1, $mday);
				my $rand = int (rand(52));
				my $rand2 = int (rand(52));
				$newpagegroupid = "pg" . $createtime . $alpha[$rand] . $alpha[$rand2];
    }while (exists($pageGroups->{$newpagegroupid}));

		if ($newpagegroupname eq "All") {
				print "<div style='text-align: center'>You can not use this name.<br>\n";
				print "<a href='./pagemanager.cgi'>back</a></div>\n";
				exit(0);
		}

		$pageGroups->{$newpagegroupid}{name} = $newpagegroupname;

		createNewPage($newpagegroupid, $newpagegroupname);

		# $pageGroups is saved in createNewPage()
#		if (!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.cgi"}) {
#				warn "Cannot write " . $adminpath . "pagegroups.cgi";
#				exit(0);
#		}

		$pagegroupid = "";
		utf8::decode($newpagegroupname);
		$BODY .= generateMainPage("Page group '" . $newpagegroupname . "' has been created.");

}
elsif($command eq "deletepages" && $pagegroupid ne ""){

		my $deletePageNameList = "";

		#---------------------------------------------------------
		# Remove pages from a group
		#---------------------------------------------------------

		if ($pagegroupid ne "all") {

				for (my $i=1; $i < $listcounter+1; $i++) {
						my $id = $CGI->param("pagedeletecheck_" . $i);
						if ($id ne "") {
								if (exists($pageGroups->{$pagegroupid}{pages}{$id})){
										delete $pageGroups->{$pagegroupid}{pages}{$id};
										delete $pages->{$id}{groups}{$pagegroupid};

										my $ptitle =  $pages->{$id}{name};
										utf8::decode($ptitle);
										$deletePageNameList .= "Page '" . $ptitle . "' has been excluded from '" . $pagegroupname . "'.<br>\n";
								}
						}
				}

				if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
						warn "Cannot write " . $adminpath . "pages.dat";
						exit(0);
				}
				if (!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}) {
						warn "Cannot write " . $adminpath . "pagegroups.dat";
						exit(0);
				}
		}
		else {

				#---------------------------------------------------------
				# Delete pages
				#---------------------------------------------------------
				
				for(my $i=1; $i < $listcounter+1; $i++){
						my $pid = $CGI->param("pagedeletecheck_" . $i);
						if($pid ne ""){

								# Delete from page groups
								foreach my $gid (keys %{$pages->{$pid}{groups}}){
										if(exists($pageGroups->{$gid}{pages}{$pid})){
												delete $pageGroups->{$gid}{pages}{$pid};
										}
								}

								deletePageInfo($pid);

								my $ptitle =  $pages->{$pid}{name};
								utf8::decode($ptitle);
								$deletePageNameList .= "Page '" . $ptitle . "' has been deleted from PositLog.<br>\n";

								delete $pages->{$pid};

						}
				}

				if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
						warn "Cannot write " . $adminpath . "pages.dat";
						exit(0);
				}
				if (!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}) {
						warn "Cannot write " . $adminpath . "pagegroups.dat";
						exit(0);
				}
				if (!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}) {
						warn "Cannot write " . $adminpath . "users.dat";
						exit(0);
				}
				if (!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}) {
						warn "Cannot write " . $adminpath . "usergroups.dat";
						exit(0);
				}
		}
		$BODY .= generateMainPage($deletePageNameList);
}
elsif ($command eq "deletepagegroups"){
		#---------------------------------------------------------
    # Delete page groups
    #---------------------------------------------------------

    my $deletePageGroupNameList = "";

    for (my $i=1; $i < $listcounter+1; $i++) {
				my $gid = $CGI->param("pagegroupdeletecheck_" . $i);
				
				if ($gid ne "") {
						if (exists($pageGroups->{$gid})) {
								my $ptitle = $pageGroups->{$gid}{name};
								utf8::decode($ptitle);
								$deletePageGroupNameList .= "Page group '" . $ptitle . "' has been deleted.<br>\n";
								foreach my $pid (keys %{$pageGroups->{$gid}{pages}}){
										delete $pages->{$pid}{groups}{$gid};
								}
								
								# Delete template page
								deletePageInfo($gid);

								delete $pageGroups->{all}{pages}{$gid};
								delete $pages->{$gid};
								delete $pageGroups->{$gid};
						}
				}
		}

		if (!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}) {
				warn "Cannot write " . $adminpath . "users.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
				warn "Cannot write " . $adminpath . "pages.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $pageGroups, $adminpath . "pagegroups.dat"}) {
				warn "Cannot write " . $adminpath . "pagegroups.dat";
				exit(0);
		}

    $BODY .= generateMainPage($deletePageGroupNameList);
}

$BODY .= "</body>\n";

my $FOOTER = "</html>";

my $out = $HEADER . $BODY . $FOOTER;
utf8::encode($out);
print $out;
