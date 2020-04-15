#!/usr/bin/perl

# --------------------------------------------------------
# pageproperty.cgi
#      cgi for PositLog page property management
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(../);
use strict;
use CGI qw(-debug :standard);
use CGI::Cookie;
use Storable qw(lock_retrieve lock_nstore);   # is default module (upper perl 5.8)
use File::Basename; # is default module
use PositLogConfig;
use PositLogAuth;
use PositLogParam;

# I18n
eval 'use lang::lang_' . $PositLogConfig::language . ';';
sub MESSAGE{
		no strict "refs"; my ($NAME) = @_; my $INAME = ${ "lang::lang_" . $PositLogConfig::language . "::" . $NAME }; utf8::decode($INAME); $INAME;
}

my $adminpath = "../" . $PositLogConfig::adminpath;
my $datapath = "../" . $PositLogConfig::datapath;
my $bgimagespath = "../" . $PositLogConfig::bgimagespath;
my $bgimagesurl = $PositLogConfig::bgimagesurl;

# parameters are already URL decoded.
my $CGI = new CGI;
my $filename = $CGI->param('background_image_file');

# administration command
my $command = $CGI->param("command");

my $pageid = $CGI->param("page");

my $listcounter;

my $index = $CGI->param("index");
if($index ne ""){
    $command = $CGI->param("command_" . $index);
    $pageid = $CGI->param("page_" . $index);
    $listcounter = $CGI->param("listcounter_" . $index);
    my $listcounterg = $CGI->param("listcounterg_" . $index);
		if($listcounterg ne ""){
				$listcounter = $listcounterg;
		}
}

my $publish = $CGI->param("publish_check");
if($publish ne "1"){
    $publish = 0;
}
else{
    $publish = 1;
}

my $sprite_autolink = $CGI->param("sprite_autolink_check");
if($sprite_autolink ne "1"){
    $sprite_autolink = 0;
}
else{
    $sprite_autolink = 1;
}

my $create_page = $CGI->param("create_page_check");
if($create_page ne "1"){
    $create_page = 0;
}
else{
    $create_page = 1;
}p

my $map_type = $CGI->param("map_type_check");
if($map_type ne "1"){
    $map_type = 0;
}
else{
    $map_type = 1;
}

my $document_type = $CGI->param("document_type_check");
if($document_type ne "1"){
    $document_type = 0;
}
else{
    $document_type = 1;
}

my $page_type = "document";
if(scalar($map_type) == 1){
		$page_type = "map";
}

my $richeditor_type = $CGI->param("richeditor_check");
if($richeditor_type ne "1"){
    $richeditor_type = 0;
}
else{
    $richeditor_type = 1;
}

my $simpleeditor_type = $CGI->param("simpleeditor_check");
if($simpleeditor_type ne "1"){
    $simpleeditor_type = 0;
}
else{
    $simpleeditor_type = 1;
}

my $wikieditor_type = $CGI->param("wikieditor_check");
if($wikieditor_type ne "1"){
    $wikieditor_type = 0;
}
else{
    $wikieditor_type = 1;
}

my $editor_type = $PositLogParam::RICH_EDITOR;
if(scalar($simpleeditor_type) == 1){
		$editor_type = $PositLogParam::SIMPLE_EDITOR;
}
elsif(scalar($wikieditor_type) == 1){
		$editor_type = $PositLogParam::WIKI_EDITOR;
}

my $author_id = $CGI->param("page_author_field");

my $template_pageid = $CGI->param("page_template_field");

my $page_title = $CGI->param("page_title_field");
my $page_max_width = $CGI->param("page_max_width_field");
my $page_max_height = $CGI->param("page_max_height_field");

my $page_bgcolor = $CGI->param("page_bgcolor_field");
my $footer_bgcolor = $CGI->param("footer_bgcolor_field");

my $background_image_clear = $CGI->param("background_image_clear");


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


my $users = eval{ Storable::lock_retrieve($adminpath . "users.dat")};
if($@){ warn "Cannot read " . $adminpath . "users.dat"; exit(0); }
my $userGroups = eval{ Storable::lock_retrieve($adminpath . "usergroups.dat")};
if($@){ warn "Cannot read " . $adminpath . "usergroups.dat"; exit(0); }
my $pages = eval{ Storable::lock_retrieve($adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $adminpath . "pages.dat"; exit(0); }
my $pageGroups = eval{ Storable::lock_retrieve($adminpath . "pagegroups.dat")};
if($@){ warn "Cannot read " . $adminpath . "pagegroups.dat"; exit(0); }
my $adminAuth = eval{ Storable::lock_retrieve($adminpath . "key.dat")};
if($@){ warn "Cannot read " . $adminpath . "key.dat"; exit(0); }

my $authObj = new PositLogAuth($adminpath, $loginid, $loginpass, $pages, $pageGroups, $users, $userGroups, $adminAuth);

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

# Print HTTP header
# (Set cookies)
print $CGI->header(-charset => 'utf-8', -cookie => [$cookieUser,$cookiePass]); 

if(!$authObj->isAdminUser && !$authObj->isAuthor($pageid)){

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
<html lang='" . $PositLogConfig::language . "'>\n
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
    <p id='submitarea'>\n" . "Permission denied." . 
    "<br/><input type='submit' id='submitbtn' value='Login' tabindex='4'>\n
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


#---------------------------------------------------------
# Generate JavaScript
#---------------------------------------------------------

my $ScriptBody = <<__ScriptBody__;
<script type='text/javascript'>
<!--
function changeBasicinfo(){

    return true;
}


function spriteAutolinkOnClick(){
    var box = document.getElementById('sprite_autolink_check');
    if(box.checked){
				box = document.getElementById('richeditor_check');
				box.checked = false;
				box = document.getElementById('simpleeditor_check');
				box.checked = true;
				box = document.getElementById('wikieditor_check');
				box.checked = false;
    }
}

function pageConfiguration(){
    var pageTitle = document.getElementById('page_title_field').value;
    if(pageTitle == ""){alert("Please enter a page title."); return false;}

		if(document.getElementById('page_author_field')){
				var pageAuthor = document.getElementById('page_author_field').value;
				if(pageAuthor == ""){alert("Please enter a page author."); return false;}
		}

    var reg = new RegExp("^[0-9a-fA-F]{6}\$", "i");
    var pageBgColor = document.getElementById('page_bgcolor_field').value;
    var footerBgColor = document.getElementById('footer_bgcolor_field').value;
    if(!pageBgColor.match(reg)){alert("Please enter the HEX number into the page color field."); return false;}
    if(!footerBgColor.match(reg)){alert("Please enter the HEX number into the footer color field."); return false;}
    return true;
}

function removeUsers(index){
    var removeUserList = "";
    var reg = new RegExp("^userremovecheck_", "i");
    var counter = 1;
    for(var i=0; i<document.forms["userlistform_" + index].elements.length; i++){
				if (document.forms["userlistform_" + index].elements[i].name.match(reg)){
						if(document.forms["userlistform_" + index].elements[i].checked){
								var innerHTML = document.getElementById("userid_" + index + "_" + counter).innerHTML;
								innerHTML = innerHTML.replace(/<.+?>/gi,"");
								innerHTML = innerHTML.replace(/&nbsp;/gi,"");
								removeUserList +=  innerHTML + ", ";
						}
						counter++;
				}
    }
    var mes = "Delete ";
    if(removeUserList == ""){
				alert('Please check one or more items.');
				return false;
    }
    else{
				if(window.confirm(mes + removeUserList.substr(0, removeUserList.length-2) + ' ?')){
						return true;
				}
    }
    return false;
}


function removeUsersG(index){
    var removeUserList = "";
    var reg = new RegExp("^userremovecheckg_", "i");
    var counter = 1;
    for(var i=0; i<document.forms["userlistformg_" + index].elements.length; i++){
				if (document.forms["userlistformg_" + index].elements[i].name.match(reg)){
						if(document.forms["userlistformg_" + index].elements[i].checked){
								var innerHTML = document.getElementById("useridg_" + index + "_" + counter).innerHTML;
								innerHTML = innerHTML.replace(/<.+?>/gi,"");
								innerHTML = innerHTML.replace(/&nbsp;/gi,"");
								removeUserList += innerHTML + ", ";
						}
						counter++;
				}
    }
    var mes = "Delete ";
    if(removeUserList == ""){
				alert('Please check one or more items.');
				return false;
    }
    else{
				if(window.confirm(mes + removeUserList.substr(0, removeUserList.length-2) + ' ?')){
						return true;
				}
    }
    return false;
}


function addPermission(index){
    var selection = document.getElementById('addlist_' + index);
    var selected = false;
    for(i=0; i<selection.options.length; i++){
				if(selection.options[i].selected){
						selected = true;
				}
    }
    if(!selected){
				alert('Please select one or more items.');
				return false;
    }
    return true;
}


function addPermissionG(index){
    var selection = document.getElementById('addlistg_' + index);
    var selected = false;
    for(i=0; i<selection.options.length; i++){
				if(selection.options[i].selected){
						selected = true;
				}
    }
    if(!selected){
				alert('Please select one or more items.');
				return false;
    }
    return true;
}

function documentTypeOnClick(){
		var map = document.getElementById('map_type_check');
		map.checked = false;
}

function mapTypeOnClick(){
    var doc = document.getElementById('document_type_check');
		doc.checked = false;
}

function richEditorOnClick(){
		var box = document.getElementById('simpleeditor_check');
		box.checked = false;
		box = document.getElementById('sprite_autolink_check');
		box.checked = false;
		box = document.getElementById('wikieditor_check');
		box.checked = false;
		box = document.getElementById('richeditor_check');
		box.checked = true;
}

function simpleEditorOnClick(){
		var box = document.getElementById('richeditor_check');
		box.checked = false;
		box = document.getElementById('wikieditor_check');
		box.checked = false;
		box = document.getElementById('simpleeditor_check');
		box.checked = true;
}

function wikiEditorOnClick(){
		var box = document.getElementById('richeditor_check');
		box.checked = false;
		box = document.getElementById('simpleeditor_check');
		box.checked = false;
		box = document.getElementById('sprite_autolink_check');
		box.checked = false;
		box = document.getElementById('wikieditor_check');
		box.checked = true;
}

function btnAreaMouseOver(elm){
    elm.style.backgroundColor = "#ffd0d0";
}

function btnAreaMouseOut(elm){
    elm.style.backgroundColor = "#ffffff";
}

function removeUserOnClick(plevel){
		var elm = document.getElementById("removeuserbtnarea_" + plevel);
		elm.style.display = "block";
}

function removeUserOnClickG(plevel){
		var elm = document.getElementById("removeuserbtnareag_" + plevel);
		elm.style.display = "block";
}

function levelOnChange(){
		document.getElementById("addpermissionarea_10").style.display = "none";
		document.getElementById("addpermissionarea_20").style.display = "none";
		document.getElementById("addpermissionarea_30").style.display = "none";
		document.getElementById("addpermissionarea_40").style.display = "none";

		var elm = document.getElementById("permissionlevel");
		var level = elm.options[elm.selectedIndex].value;
		document.getElementById("addpermissionarea_" + level).style.display = "block";
}

// -->
</script>
__ScriptBody__

#---------------------------------------------------------
# Upload file
#---------------------------------------------------------

# upload file name
my $basename = "";
my $errormsg = "";
if($filename ne ""){
# MIME type
    my $type = $CGI->uploadInfo($filename)->{'Content-Type'};
    my $buffer;
    my $file;
    my $BUFSZ = 2048;
    my $bytesread;
    while($bytesread = read($filename, $buffer, $BUFSZ)){
				$file .= $buffer;
# $file_size ++;
# if($file_size > 300){
#   - insert size checking function - 
# }
    }

    $filename =~ s/\\/\//gi;

    $basename = basename($filename);

    if ( -f $bgimagespath . $basename) {
				$errormsg = "$basename is overwritten.<br>";
    }

    open(OUT, "> $bgimagespath" .  $basename) or exit(0);
    binmode(OUT);
    print(OUT $file);
    close(OUT);
    chmod (0666, "$bgimagespath" . $basename); 
}

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
		 <title>PositLog Page property</title>\n"
		. $ScriptBody
		. "</head>\n";

my $BODY ="";


sub generatePermissionControl{
    my ($addListBODY, $permissionBODY, $titleStr, $permissionLevel) = @_;

    my $length;
    my $glength;

		my @includingUsers;
		my @excludingUsers;
		my @includingUserGroups;
		my @excludingUserGroups;


		foreach my $uid (sort {$users->{$a}{nickname} cmp $users->{$b}{nickname}} keys %$users){
				if(!exists($adminAuth->{$uid}) && $uid ne "admin" && $uid ne "public"){
						if(exists($pages->{$pageid}{users}{$permissionLevel}{$uid})){
								push(@includingUsers, $uid);
						}
						else{
								push(@excludingUsers, $uid);
						}
				}

		}

		foreach my $ugid (sort {$userGroups->{$a}{name} cmp $userGroups->{$b}{name}} keys %$userGroups){
				if($ugid ne "all"){
						if(exists($pages->{$pageid}{usergroups}{$permissionLevel}{$ugid})){
								push(@includingUserGroups, $ugid);
						}
						else{
								push(@excludingUserGroups, $ugid);
						}
				}
		}

		if(exists($pages->{$pageid}{users}{$permissionLevel}{public})){
				unshift(@includingUsers, "public");
		}
		else{
				unshift(@excludingUsers, "public");
		}

    my $length = scalar(@excludingUsers);
    if($length > 20){
				$length = 20;
    }
    elsif($length < 3){
				$length = 3;
    }

    my $glength = scalar(@excludingUserGroups);
    if($glength > 20){
				$glength = 20;
    }
    elsif($glength < 3){
				$glength = 3;
    }

    $$permissionBODY .= "<h3 class='permissionlevel' id='title_$permissionLevel' name='title_$permissionLevel'>$titleStr</h3>\n\n";

    # Current user list
    my $usercounter = 0;

		my $userlistBody = "<h4 class='header'>User list</h4>\n\n";

    $userlistBody .= "<form class='permissionlist' id='userlistform_$permissionLevel' action='./pageproperty.cgi' onSubmit=\"return removeUsers('$permissionLevel')\" method='POST'>\n";
    $userlistBody .= "<div id='removeuserbtnarea_$permissionLevel' style='display:none' class='itemline_sheader'><div class='permissionname'>&nbsp;</div><input type='submit' name='btn_removeusers' value='remove checked users' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'></div>\n";
    $userlistBody .= "<input type='hidden' name='page_$permissionLevel' value='$pageid'>\n";
    $userlistBody .= "<input type='hidden' name='command_$permissionLevel' value='removeusers'>";
    $userlistBody .= "<input type='hidden' name='index' value='$permissionLevel'>\n";

    # admin
		if($permissionLevel eq $PositLogParam::USERLEVEL_SUPER){
				$usercounter++;
				$userlistBody .= "<div class='itemline_s1'>\n"
						. "<div class='permissionname'>"
						. "001" . ".&nbsp;&nbsp;&nbsp;\n"
						. "<span class='userid' id='userid_" . $permissionLevel . "_" . $usercounter . "'><a href='./userproperty.cgi?user=admin'>admin</a></span>\n"
						. "</div>"
						. "<div class='deletecheck'><input type='checkbox' name='userremovecheck_" . $permissionLevel . "_" . $usercounter . "' style='display:none;'>"
						. "</div>\n"
						. "</div>\n";
		}
		
    # Other 
    foreach my $uid (sort {$a cmp $b} @includingUsers){
				$usercounter++;
				my $userclass = "itemline_s1";
				if($usercounter % 2 == 0){
						$userclass = "itemline_s2";
				}
				my $usercounterStr = sprintf("%03d", $usercounter);
				my $uname = $users->{$uid}{nickname};
				utf8::decode($uname);
				$userlistBody .= "<div class='" . $userclass . "'>\n"
						. "<div class='permissionname'>"
						. $usercounterStr . ".&nbsp;&nbsp;&nbsp;\n"
						. "<span  class='userid' id='userid_" . $permissionLevel . '_' . $usercounter . "'><a href='./userproperty.cgi?user=" . $uid . "'>" . $uname . "</a>&nbsp;(" . $uid . ")</span>\n"
						. "</div>"
						. "<div class='deletecheck'><input type='checkbox' name='userremovecheck_" . $permissionLevel . "_" . $usercounter . "' onclick='removeUserOnClick($permissionLevel)' value='" . $uid  . "'>remove"
						. "</div>\n"
						. "</div>\n";
    }
    $userlistBody .= "<input type='hidden' name='listcounter_$permissionLevel' id='listcounter_$permissionLevel' value='" . $usercounter . "'>\n";
    $userlistBody .= "</form><br>\n\n";

		if($usercounter > 0){
				$$permissionBODY .= $userlistBody;
		}

    # Select box
    $$addListBODY .= "<table style='margin:0px; padding:0px; border:0px; display:none' id='addpermissionarea_$permissionLevel'><tr><td valign='top'><form class='permissionform' id='addpermissionform_$permissionLevel' action='./pageproperty.cgi' onSubmit=\"return addPermission('$permissionLevel')\"  method='POST'>\n";
    $$addListBODY .= "<input type='submit' id='btn_$permissionLevel' class='applybtn'  onmouseout='btnAreaMouseOut(this)' onmouseover='btnAreaMouseOver(this)' value='Add selected users'><br>\n";
    $$addListBODY .= "<select id='addlist_$permissionLevel' multiple size='3' name='addlist_$permissionLevel' onmousedown='this.size=" . $length . ";'>\n";
    foreach my $auser (@excludingUsers){
				my $uname = $users->{$auser}{nickname};
				utf8::decode($uname);
				$$addListBODY .= "<option value='" . $auser . "'>" . $uname . " (" . $auser . ")</option>\n";
    }
    $$addListBODY .= "</select>\n";
    $$addListBODY .= "<input type='hidden' name='command_$permissionLevel' value='addusers'>";
    $$addListBODY .= "<input type='hidden' name='page_$permissionLevel' value='$pageid'>\n";
    $$addListBODY .= "<input type='hidden' name='index' value='$permissionLevel'>";
    $$addListBODY .= "</form></td>\n\n";


    # Current group list
    $usercounter = 0;
    my $usergrouplistBody = "<h4 class='header'>User group list</h4>\n\n";

    $usergrouplistBody .= "<form class='permissionlist' id='userlistformg_$permissionLevel' action='./pageproperty.cgi' onSubmit=\"return removeUsersG('$permissionLevel')\" method='POST'>\n";	
    $usergrouplistBody .= "<div id='removeuserbtnareag_$permissionLevel' style='display:none' class='itemline_sheader'><div class='permissionname'>&nbsp;</div>";
    $usergrouplistBody .= "<input type='submit' name='btn_removeusers' value='remove checked user groups' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'></div>\n";
    $usergrouplistBody .= "<input type='hidden' name='page_$permissionLevel' value='$pageid'>\n";
    $usergrouplistBody .= "<input type='hidden' name='command_$permissionLevel' value='removeusers'>";
    $usergrouplistBody .= "<input type='hidden' name='index' value='$permissionLevel'>\n";

    my @groups = sort {$a cmp $b} (@includingUserGroups);
    if(scalar(@groups) == 0){
				$usergrouplistBody .= "&nbsp;"
    }
    foreach my $ugid (@groups){
				$usercounter++;
				my $userclass = "itemline_s1";
				if($usercounter % 2 == 0){
						$userclass = "itemline_s2";
				}
				my $usercounterStr = sprintf("%03d", $usercounter);

				my $ugname = $userGroups->{$ugid}{name};
				utf8::decode($ugname);
				$usergrouplistBody .= "<div class='" . $userclass . "'>\n"
						. "<div class='permissionname'>"
						. $usercounterStr . ".&nbsp;&nbsp;&nbsp;\n"
						. "<span  class='userid' id='useridg_" . $permissionLevel . '_' . $usercounter . "'><a href='./usermanager.cgi?usergroupid=" . $ugid ."'>" . $ugname . "</a>&nbsp;(" . $ugid . ")</span>\n"
						. "</div>"
						. "<div class='deletecheck'><input type='checkbox' name='userremovecheckg_" . $permissionLevel . "_" . $usercounter . "'  onclick='removeUserOnClickG($permissionLevel)'  value='" . $ugid  . "'>remove"
						. "</div>\n"
						. "</div>\n";
    }
    $usergrouplistBody .= "<input type='hidden' name='listcounterg_$permissionLevel' id='listcounterg_$permissionLevel' value='" . $usercounter . "'>\n";
    $usergrouplistBody .= "</form><br>\n\n";

		if($usercounter > 0){
				$$permissionBODY .= $usergrouplistBody;
		}

    # Select box
    $$addListBODY .= "<td valign='top'><form class='permissionform' id='addpermissionformg_$permissionLevel' action='./pageproperty.cgi' onSubmit=\"return addPermissionG('$permissionLevel')\" method='POST'>\n";
    $$addListBODY .= "<input type='submit' id='btn_g_$permissionLevel' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)' value='Add selected user groups'><br>\n";
    $$addListBODY .= "<select id='addlistg_$permissionLevel' multiple size='3' name='addlistg_$permissionLevel' onmousedown='this.size=" . $glength . ";'>\n";
    foreach my $auser (@excludingUserGroups){
				my $ugname = $userGroups->{$auser}{name};
				utf8::decode($ugname);
				$$addListBODY .= "<option value='" . $auser . "'>" . $ugname . " (" . $auser . ")</option>\n";
    }
    $$addListBODY .= "</select>\n";
    $$addListBODY .= "<input type='hidden' name='command_$permissionLevel' value='addusers'>";
    $$addListBODY .= "<input type='hidden' name='page_$permissionLevel' value='$pageid'>\n";
    $$addListBODY .= "<input type='hidden' name='index' value='$permissionLevel'>";
    $$addListBODY .= "</form></td></tr></table>\n\n";

}


sub generateMainPage{
		my ($statusStr) = @_;

		my $BODY = "<body class='admin'>\n";

    my @PageList;


		$BODY .="<h1 class='pagemanagement'>Page property manager</h1>\n";
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
		$BODY .= $usernamestr . "<br>";

		$BODY .="<p><span class='statusarea'>" . $statusStr . "</span></p>";

		if($PositLogConfig::mod_rewrite == 0){
				$BODY .= "<div class='relatedpages'>[<a href='../positlog.cgi?load=" . $pageid . "' target='_top'>Open page</a>]&nbsp;[<a href='../positlog.cgi?load=" . $pageid . "&mode=EditMode' target='_top'>Edit page</a>]&nbsp[<a href='../pagerss.cgi?load=" . $pageid . "' target='_top'>RSS1.0</a>]</div><br>";
		}
		else{
				$BODY .= "<div class='relatedpages'>[<a href='../" . $pageid . ".html' target='_top'>Open page</a>]&nbsp;[<a href='../positlog.cgi?load=" . $pageid . "&mode=EditMode' target='_top'>Edit page</a>]&nbsp[<a href='../pagerss.cgi?load=" . $pageid . "' target='_top'>RSS1.0</a>]</div><br>";
		}

		$BODY .= "<form id='configurationform' name='configurationform' enctype='multipart/form-data' action='./pageproperty.cgi' method='POST' onSubmit='return pageConfiguration()'>\n";

		# Page title
		$BODY .= "<div class='propertyline'><span class='propertyheader'>&nbsp;</span><span class='propertycontents'><input type='submit' name='btn_configuration' value='Change properties' class='applybtn'  onmouseout='btnAreaMouseOut(this)' onmouseover='btnAreaMouseOver(this)'></span></div>\n";

		$BODY .="<div class='propertyline1'><span class='propertyheader'>";
		my $ptitle = $pages->{$pageid}{name};
		utf8::decode($ptitle);
		$BODY .= MESSAGE("PAGEMNG_TITLE") . "</span><span class='propertycontents'>";
		$BODY .="<input type='text' size='30' class='fieldL' name='page_title_field' id='page_title_field' value='" . $ptitle . "'></span>";
		$BODY .="</div>\n\n";

		$BODY .="<div class='propertyline2'><span class='propertyheader'>";
		$BODY .= MESSAGE("PAGEMNG_ID") . "</span><span class='propertycontents'>" . $pageid . "</span>";
		$BODY .="</div>";

		$BODY .="<div class='propertyline1'><span class='propertyheader'>";
		$BODY .= MESSAGE("PAGEMNG_AUTHOR") . "</span>";

		if($authObj->isAdminUser){
				$BODY .= "<input type='text' size='20' class='fieldL' name='page_author_field' id='page_author_field' value='" . $pages->{$pageid}{author_id} . "'>";
		}
		else{
				$BODY .= "<span class='propertycontents'>" . $pages->{$pageid}{author_id} . "</span>";
				$BODY .= "<input type='hidden' name='page_author_field' id='page_author_field' value='" . $pages->{$pageid}{author_id} . "'>";
		}
		$BODY .="</div>";


		$BODY .="<div class='propertyline2'><span class='propertyheader'>";
		$pages->{$pageid}{created_time} =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
		my $createdTime = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
		# This is ad-hoc i18n. It will be improbed in version 0.61.
		if($PositLogConfig::language eq "en"){
				$createdTime = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
		}
		$BODY .= MESSAGE("PAGEMNG_CREATEDDATE") . "</span><span class='propertycontents'>" . $createdTime . "</span>";
		$BODY .="</div>";

		$BODY .="<div class='propertyline1'><span class='propertyheader'>";
		$pages->{$pageid}{modified_time} =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
		my $modifiedTime = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
		# This is ad-hoc i18n. It will be improbed in version 0.61.
		if($PositLogConfig::language eq "en"){
				$modifiedTime = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
		}
		$BODY .= MESSAGE("PAGEMNG_LASTMODIFIEDDATE") . "</span><span class='propertycontents'>" . $modifiedTime . "</span>";
		$BODY .="</div>";

		my $checked = "";

		# Page type
		$BODY .="<div class='propertyline2'>";
		$BODY .="<div class='propertyheader'>" . MESSAGE("PAGEMNG_TYPE") . "</div>";

		my $mapCheck = "";
		my $documentCheck = "";
		if(exists($pages->{$pageid}{page_type})){
				if($pages->{$pageid}{page_type} eq "map"){
						$mapCheck = "checked";
				}
				else{
						$documentCheck = "checked";
				}
		}
		else{
				$documentCheck = "checked";
		}
		$BODY .= "<input type='radio' name='map_type_check' id='map_type_check' onclick='mapTypeOnClick()' value='1' $mapCheck>Map</input> <input type='radio' name='document_type_check' id='document_type_check' value='1' onclick='documentTypeOnClick()' $documentCheck>Document</input>";
		$BODY .="</div>\n\n";

		# Publish mode
		$BODY .="<div class='propertyline1'>";

		if(scalar($pages->{$pageid}{publish}) eq ""){$checked = "";}
		elsif(scalar($pages->{$pageid}{publish}) == 1){$checked = "checked";}
		else{$checked = "";}
		$BODY .="<div class='propertyheader'>" . MESSAGE("PAGEMNG_PUBLISH") . "</div>";
		$BODY .= MESSAGE("PAGEMNG_PUBLISHENABLE") . "&nbsp;<input type='checkbox' name='publish_check' id='publish_check' value='1' $checked>&nbsp;&nbsp;";
		$BODY .="</div>\n\n";

		# Editor type
		my $rchecked = "";
		my $schecked = "";
		my $wchecked = "";
		$BODY .="<div class='propertyline2'>";
		if(scalar($pages->{$pageid}{editor_type}) == $PositLogParam::SIMPLE_EDITOR){$schecked = "checked"; $rchecked = ""; $wchecked = "";}
		elsif(scalar($pages->{$pageid}{editor_type}) == $PositLogParam::RICH_EDITOR){$rchecked = "checked"; $schecked = ""; $wchecked = "";}
		elsif(scalar($pages->{$pageid}{editor_type}) == $PositLogParam::WIKI_EDITOR){$wchecked = "checked"; $schecked = ""; $rchecked = "";}
		else{$rchecked = "checked"; $schecked = ""; $wchecked = "";}
		$BODY .="<div class='propertyheader'>" . MESSAGE("PAGEMNG_EDITORTYPE"). "</div>";
		$BODY .= MESSAGE("PAGEMNG_RICHEDITOR") . "&nbsp;<input type='checkbox' name='richeditor_check' id='richeditor_check' value='1' onclick='richEditorOnClick()' style='margin-right: 20px' $rchecked>";
		$BODY .= MESSAGE("PAGEMNG_SIMPLEEDITOR") . "&nbsp;<input type='checkbox' name='simpleeditor_check' id='simpleeditor_check' value='1' onclick='simpleEditorOnClick()' $schecked>";

		# Sprite autolink
		if(scalar($pages->{$pageid}{sprite_autolink}) == 1){$checked = "checked";}
		else{$checked = "";}
		$BODY .= "&nbsp;(" . MESSAGE("PAGEMNG_AUTOLINK");
		$BODY .="<input type='checkbox' name='sprite_autolink_check' id='sprite_autolink_check' onclick='spriteAutolinkOnClick()' value='1' $checked>&nbsp;)";

		$BODY .= "<span style='margin-left: 20px'>" .MESSAGE("PAGEMNG_WIKIEDITOR") . "</span>&nbsp;<input type='checkbox' name='wikieditor_check' id='wikieditor_check' value='1' onclick='wikiEditorOnClick()' $wchecked>";

		$BODY .="</div>\n\n";


		$BODY .="<div class='propertyline1'>";

		# Create page
		if(scalar($pages->{$pageid}{create_page}) == 1){$checked = "checked";}
		else{$checked = "";}
		$BODY .= "<div class='propertyheader'>" . MESSAGE("PAGEMNG_ALLOWNEWPAGE") . "</div>";
		$BODY .="public <input type='checkbox' name='create_page_check' id='create_page_check' value='1' $checked>&nbsp;&nbsp;" . MESSAGE("PAGEMNG_ALLOWNEWPAGECOMMENT");
		$BODY .="</div>\n\n";


		# Page bgcolor
		$BODY .="<div class='propertyline2'>";
		my $page_bgcolor = 		$pages->{$pageid}{'page_bgcolor'};
		$BODY .="<div class='propertyheader'>" . MESSAGE("PAGEMNG_BGCOLOR") . "</div>";
		$BODY .="#<input class='fieldL' type='text' size='6' maxlength='6' name='page_bgcolor_field' id='page_bgcolor_field' value='$page_bgcolor'>";
		$BODY .="</div>\n\n";

		# Footer bgcolor
		$BODY .="<div class='propertyline1'>";
		my $footer_bgcolor = 		$pages->{$pageid}{'footer_bgcolor'};
		$BODY .="<div class='propertyheader'>" . MESSAGE("PAGEMNG_FOOTERCOLOR") . "</div>";
		$BODY .="#<input class='fieldL' type='text' size='6' maxlength='6' name='footer_bgcolor_field' id='footer_bgcolor_field' value='$footer_bgcolor'>";
		$BODY .="</div>\n\n";

		# Background-image
		$BODY .="<div class='propertyline2'>";
		my $background_image = 		$pages->{$pageid}{'background_image'};
		$BODY .="<div class='propertyheader'>" . MESSAGE("PAGEMNG_BGIMAGE") . "</div>";
		$BODY .="<a href='" . $bgimagesurl . $background_image . "'>";
		$BODY .="$background_image</a>&nbsp;&nbsp;&nbsp;&nbsp;";
		$BODY .= MESSAGE("PAGEMNG_BGIMAGECLEAR") . " <input type='checkbox' name='background_image_clear' id='background_image_clear' value='1'>&nbsp;&nbsp;&nbsp;&nbsp;";
		$BODY .= MESSAGE("PAGEMNG_BGIMAGESELECT") . "&nbsp;&nbsp;<input class='fieldL' type='file' size='30' name='background_image_file' id='background_image_file'>";
		$BODY .="</div>\n\n";

		# Page group
		$BODY .="<div class='propertyline1'>";
		my $affl = "";
		foreach my $gid (sort {$pages->{$a}{name} cmp $pages->{$b}{name}} keys %{$pages->{$pageid}{groups}}){
				my $gname = $pageGroups->{$gid}{name};
				utf8::decode($gname);
				$affl .= "<a href='./pagemanager.cgi?pagegroupid=" . $gid . "'>" . $gname ."</a>, ";
		}
		if($affl ne ""){
				$affl = substr($affl, 0, length($affl) - 2);
		}
		$BODY .= "<div class='propertyheader'>" . MESSAGE("PAGEMNG_GROUPS") . "</div>" . $affl;
		$BODY .="</div>\n\n";

		# Template
		$BODY .="<div class='propertyline2'>";
		$BODY .="<span class='propertyheader'>";
		$BODY .= MESSAGE("PAGEMNG_TEMPLATE") . "</span>";

		$BODY .= "<input type='text' size='20' class='fieldL' name='page_template_field' id='page_template_field' value='" . $pages->{$pageid}{template_pageid} . "'>";
		if(exists($pages->{$pages->{$pageid}{template_pageid}})){
				my $templatepid = $pages->{$pageid}{template_pageid};
				my $templatename = $pages->{$templatepid}{name};
				utf8::decode($templatename);
				if($PositLogConfig::mod_rewrite == 0){
						$BODY .= "&nbsp; (<a href='../positlog.cgi?load=" . $templatepid . "' target='_blank'>" . $templatename . "<\/a>)";
				}
				else{
						$BODY .= "&nbsp; (<a href='../" . $templatepid . ".html' target='_blank'>" . $templatename . "<\/a>)";
				}
		}

		$BODY .="</div>";


		$BODY .= "<input type='hidden' name='page_configuration' value='$pageid'>\n";
		$BODY .= "<input type='hidden' name='command_configuration' value='changeconfiguration'>\n";
		$BODY .= "<input type='hidden' name='index' value='configuration'>\n";
		$BODY .="</form>";

		if(!$authObj->isAdminUser){
				return $BODY;	
		}

		$BODY .="<br style='clear:left'>";

		#-------------------------------------
		# Permissions
		#-------------------------------------

		$BODY .="<h2 class='header' id='title_permission'>Permission level</h2>\n";

    $BODY .= "<table class='permissionselectors'><tr><td valign='top'>";
    $BODY .= "<form class='levelform' id='levelform' action='./pageproperty.cgi' onSubmit=\"false\" method='POST'>\n<select id='permissionlevel' size='4' name='permissionlevel' onchange='levelOnChange()'>\n";
		$BODY .= "<option value='" . $PositLogParam::USERLEVEL_READ . "'>" . MESSAGE("USERLEVEL_READ") . "</option>\n";
		$BODY .= "<option value='" . $PositLogParam::USERLEVEL_EDIT . "'>" . MESSAGE("USERLEVEL_EDIT") . "</option>\n";
		$BODY .= "<option value='" . $PositLogParam::USERLEVEL_ATTACH_FILE . "'>" . MESSAGE("USERLEVEL_ATTACH_FILE") . "</option>\n";
		$BODY .= "<option value='" . $PositLogParam::USERLEVEL_SUPER . "'>" . MESSAGE("USERLEVEL_SUPER") . "</option>\n";
    $BODY .= "</select>\n";		
    $BODY .= "</form></td>";

		my $addListBODY = " ";
		my $permissionBODY = " ";

		generatePermissionControl( \$addListBODY, \$permissionBODY,  MESSAGE("USERLEVEL_READ"), $PositLogParam::USERLEVEL_READ);
		generatePermissionControl( \$addListBODY, \$permissionBODY,  MESSAGE("USERLEVEL_EDIT"), $PositLogParam::USERLEVEL_EDIT);
		generatePermissionControl( \$addListBODY, \$permissionBODY,  MESSAGE("USERLEVEL_ATTACH_FILE"), $PositLogParam::USERLEVEL_ATTACH_FILE);
		generatePermissionControl( \$addListBODY, \$permissionBODY,  MESSAGE("USERLEVEL_SUPER"), $PositLogParam::USERLEVEL_SUPER);

    $BODY .= "<td valign='top'>";
		$BODY .= $addListBODY;
    $BODY .= "</td></tr></table>";

		$BODY .= $permissionBODY;

		$BODY .= "<br><br><br><br>";
		return $BODY;
}


#---------------------------------------------------------------
# command processor
#---------------------------------------------------------------

if($command eq ""){
		$BODY = generateMainPage();
}
elsif($command eq "addusers" && $pageid ne ""){
		my $addedlist = "";
		my @addlist = $CGI->param("addlist_$index");
		foreach my $uid (@addlist){
				if(exists($users->{$uid}{permissions}{$pageid})){
						delete $pages->{$pageid}{users}{scalar($users->{$uid}{permissions}{$pageid})}{$uid};
				}
				$pages->{$pageid}{users}{scalar($index)}{$uid} = 1;
				$users->{$uid}{permissions}{$pageid} = scalar($index);
				$addedlist .= "'" . $uid . "', ";
		}

		my @addlistg = $CGI->param("addlistg_$index");
		foreach my $ugid (@addlistg){
				if(exists($userGroups->{$ugid}{permissions}{$pageid})){
						delete $pages->{$pageid}{usergroups}{scalar($userGroups->{$ugid}{permissions}{$pageid})}{$ugid};
				}
				$pages->{$pageid}{usergroups}{scalar($index)}{$ugid} = 1;
				$userGroups->{$ugid}{permissions}{$pageid} = scalar($index);
				$addedlist .= "'" . $ugid . "', ";
		}

		$addedlist = substr($addedlist, 0, length($addedlist)-2);


		if (!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}) {
				warn "Cannot write " . $adminpath . "users.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}) {
				warn "Cannot write " . $adminpath . "usergorups.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
				warn "Cannot write " . $adminpath . "pages.dat";
				exit(0);
		}

		my $level;
		if($index eq $PositLogParam::USERLEVEL_READ){
				$level = "'" . MESSAGE("USERLEVEL_READ") . "'";
		}
		if($index eq $PositLogParam::USERLEVEL_EDIT){
				$level = "'" . MESSAGE("USERLEVEL_EDIT") . "'";
		}
		if($index eq $PositLogParam::USERLEVEL_ATTACH_FILE){
				$level = "'" . MESSAGE("USERLEVEL_ATTACH_FILE") . "'";
		}
		if($index eq $PositLogParam::USERLEVEL_SUPER){
				$level = "'" . MESSAGE("USERLEVEL_SUPER") . "'";
		}

		if(scalar(@addlist) == 1){
				$BODY = generateMainPage($addedlist . " is added to $level.");
		}
		else{
				$BODY = generateMainPage($addedlist . " are added to $level.");
		}
}
elsif($command eq "removeusers" && $pageid ne ""){
		my $removedList = "";
		my $removeCounter = 0;

		for(my $i=1; $i < $listcounter+1; $i++){
				my $uid = $CGI->param("userremovecheck_" . $index. "_" . $i);
				if($uid ne ""){
						if(exists($pages->{$pageid}{users}{$index}{$uid})){
								delete $users->{$uid}{permissions}{$pageid};
								delete $pages->{$pageid}{users}{$index}{$uid};
								$removedList .= "'" . $uid . "', ";
								$removeCounter++;
						}
				}
				my $ugid = $CGI->param("userremovecheckg_" . $index. "_" . $i);
				if($ugid ne ""){
						if(exists($pages->{$pageid}{usergroups}{$index}{$ugid})){
								delete $userGroups->{$ugid}{permissions}{$pageid};
								delete $pages->{$pageid}{usergroups}{$index}{$ugid};
								$removedList .= "'" . $ugid . "', ";
								$removeCounter++;
						}
				}
		}

		if (!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}) {
				warn "Cannot write " . $adminpath . "users.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}) {
				warn "Cannot write " . $adminpath . "userGroup.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
				warn "Cannot write " . $adminpath . "pages.dat";
				exit(0);
		}

		$removedList = substr($removedList, 0, length($removedList)-2) . "\n";


		my $level;
		if($index eq $PositLogParam::USERLEVEL_READ){
				$level = "'" . MESSAGE("USERLEVEL_READ") . "'";
		}
		if($index eq $PositLogParam::USERLEVEL_EDIT){
				$level = "'" . MESSAGE("USERLEVEL_EDIT") . "'";
		}
		if($index eq $PositLogParam::USERLEVEL_ATTACH_FILE){
				$level = "'" . MESSAGE("USERLEVEL_ATTACH_FILE") . "'";
		}
		if($index eq $PositLogParam::USERLEVEL_SUPER){
				$level = "'" . MESSAGE("USERLEVEL_SUPER") . "'";
		}


		if($removeCounter == 1){
				$BODY = generateMainPage($removedList . " is removed from " . $level . ".");
		}
		elsif($removeCounter > 1){
				$BODY = generateMainPage($removedList . " are removed from " . $level . ".");
		}
		else{
				$BODY = generateMainPage("");
		}

}
elsif($command eq "changeconfiguration"  && $pageid ne ""){

		if($pages->{$pageid}{author_id} ne $author_id){
				if(exists($adminAuth->{$author_id}) || $author_id eq "admin"){
						delete $users->{$pages->{$pageid}{author_id}}{$pageid};
						$pages->{$pageid}{author_id} = "admin";
						$users->{admin}{authors}{$pageid} = 1;
				}
				elsif(exists($users->{$author_id})){
						delete $users->{$pages->{$pageid}{author_id}}{$pageid};
						$pages->{$pageid}{author_id} = $author_id;
						$users->{$author_id}{authors}{$pageid} = 1;
				}
				else{
						print "User '" . $author_id . "' does not exist.<br>\n";
						print "<a href='./pagemanager.cgi'>back</a></div>\n";
						exit(0);
				}
		}

 		if(scalar($pages->{$pageid}{publish}) == 1
			 && scalar($publish) == 0){
				my $spritesHash = eval{ Storable::lock_retrieve($datapath . $pageid . "/sprites.dat")};
				if($@){	print "Cannot read " . $datapath . $pageid . "/sprites.dat\n $@"; exit(0); }
				foreach my $sid (keys %{$spritesHash}){
						delete $spritesHash->{$sid}{margin_s};
				}
				if(!eval{Storable::lock_nstore $spritesHash, $datapath . $pageid . "/sprites.dat"}){
						warn "Cannot write sprites.dat.\n"; exit(0);
				}

				my $groupsHash = eval{ Storable::lock_retrieve($datapath . $pageid . "/groups.dat")} or {};
				if($groupsHash ne ""){
						foreach my $gid (keys %{$groupsHash}){
								delete $groupsHash->{$gid}{margin_s};
						}
						if(!eval{Storable::lock_nstore $groupsHash, $datapath . $pageid . "/groups.dat"}){
								warn "Cannot write groups.dat.\n";	exit(0);
						}
				}
		}
 		$pages->{$pageid}{publish} = $publish;

		$pages->{$pageid}{sprite_autolink} = $sprite_autolink;

		$pages->{$pageid}{create_page} = $create_page;
		$pages->{$pageid}{editor_type} = $editor_type;
		$pages->{$pageid}{page_type} = $page_type;
		$pages->{$pageid}{name} = $page_title;
		$pages->{$pageid}{page_bgcolor} = $page_bgcolor;
		$pages->{$pageid}{footer_bgcolor} = $footer_bgcolor;

		if(scalar($background_image_clear) == 1){
				$pages->{$pageid}{background_image} = "";
		}
		if($basename ne ""){
				$pages->{$pageid}{background_image} = $basename;
		}


		if($pages->{$pageid}{template_pageid} ne $template_pageid){
				if($template_pageid ne "" && !exists($pages->{$template_pageid})){
						print "Page ID '" . $template_pageid . "' does not exist.<br>\n";
						print "<a href='./pagemanager.cgi'>back</a></div>\n";
						exit(0);
				}
				$pages->{$pageid}{template_pageid} = $template_pageid;
		}

		if (!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}) {
				warn "Cannot write " . $adminpath . "users.dat";
				exit(0);
		}
		if (!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}) {
				warn "Cannot write " . $adminpath . "pages.dat";
				exit(0);
		}

		$BODY = generateMainPage("Configurations are changed.<br>$errormsg");
}



$BODY .= "</body>\n";

my $FOOTER = "</html>";

my $out = $HEADER . $BODY . $FOOTER;
utf8::encode($out);
print $out;
