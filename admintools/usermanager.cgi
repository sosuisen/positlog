#!/usr/bin/perl

# --------------------------------------------------------
# usermanager.cgi:
#      cgi for PositLog user management
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(../);
use strict;
use CGI qw(-debug :standard);
use CGI::Cookie;
use Storable qw(lock_retrieve lock_nstore);   # is default library (upper perl 5.8)
use PositLogAuth;
use PositLogConfig;
use PositLogParam;

# I18n
eval 'use lang::lang_' . $PositLogConfig::language . ';';
sub MESSAGE{
		no strict "refs"; my ($NAME) = @_; my $INAME = ${ "lang::lang_" . $PositLogConfig::language . "::" . $NAME }; utf8::decode($INAME); $INAME;
}

my $adminpath = "../" . $PositLogConfig::adminpath;

# CGI parameters are already URL decoded.
my $CGI = new CGI;

# Administration command
my $command = $CGI->param("command");

my $listcounter_user = $CGI->param("listcounter_user");
my $listcounter_usergroup = $CGI->param("listcounter_usergroup");

my $userid = $CGI->param("userid");
my $nickname = $CGI->param("nickname");
my $usergroupid = $CGI->param("usergroupid");
my $password = $CGI->param("password");

my $newusergroupname = $CGI->param("newusergroupname");
my @useridlist = $CGI->param("useridlist");

# Postfix is added to "command",  "userid", "usergroupid", "password" parameter name
# when parameter is sent by using identified <input> element 
# e.g.) <input type='hidden' name='command_1' id='command_1'>
# "index" parameter is set in order to remove this postfix.
my $index = $CGI->param("index");
if($index ne ""){
    $command = $CGI->param("command_" . $index);
    $userid = $CGI->param("userid_" . $index);
    $nickname = $CGI->param("nickname_" . $index);
    $usergroupid = $CGI->param("usergroupid_" . $index);
    $password = $CGI->param("password_" . $index);
}

my $subadmingroup = $CGI->param("subadmingroup_check");
if($subadmingroup ne "1"){
    $subadmingroup = 0;
}
else{
    $subadmingroup = 1;
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
if($@){	warn "Cannot read " . $adminpath . "users.dat";	exit(0); }
my $adminAuth = eval{ Storable::lock_retrieve($adminpath . "key.dat")};
if($@){ warn "Cannot read " . $adminpath . "key.dat"; exit(0); }
my $userGroups = eval{ Storable::lock_retrieve($adminpath . "usergroups.dat")};
if($@){ warn "Cannot read " . $adminpath . "usergroups.dat"; exit(0); }
my $pages = eval{ Storable::lock_retrieve($adminpath . "pages.dat")};
if($@){	warn "Cannot read " . $adminpath . "pages.dat";	exit(0); }


my $authObj = new PositLogAuth($adminpath, $loginid, $loginpass, $pages, "", $users, $userGroups, $adminAuth);

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
  <form id='loginform' action='usermanager.cgi' method='post'>\n
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


#---------------------------------------------------------
# Generate user groups list
#---------------------------------------------------------

sub generateUserGroupList{
    my $BODY ="<h2 class='header'>List</h2>\n";
    my $groupcounter = 0;

		my @userGroupList = sort {$userGroups->{$a}{name} cmp $userGroups->{$b}{name}} (keys %$userGroups);

		$BODY .= "<form id='usergrouplistform' action='./usermanager.cgi' onSubmit='return deleteUserGroups()' method='POST'>\n";
		$BODY .= "<div class='itemline_header'><div class='number'>&nbsp;</div><div class='groupname'>Group name</div><div class='groupid'>ID</div>";
		if(scalar(@userGroupList) > 1){
				$BODY .= "<input type='submit' name='btn_deleteusergroups' value='Delete checked user groups' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)' >\n";
		}
		$BODY .= "</div>";

    foreach my $ugid (@userGroupList){
				$groupcounter++;

				my $usergroupname = $userGroups->{$ugid}{name};
				utf8::decode($usergroupname);

				my $groupclass = "itemline1";
				if($groupcounter % 2 == 0){
						$groupclass = "itemline2";
				}

				my $groupcounterStr = sprintf("%03d", $groupcounter);
				$BODY .= "<div class='" . $groupclass . "'>\n"
						. "<div class='number'>";
				$BODY .= $groupcounterStr . ".";
				$BODY .= "</div>"
						. "<div class='groupname'><a href='./usermanager.cgi?usergroupid=" . $ugid . "'>"
						. "<span id='usergroupid_" . $groupcounter . "'>"
						. $usergroupname . "</span></a>\n"
						. "</div>\n"

						. "<div class='groupid'>"
						. $ugid
						. "</div>\n";
				
				if($ugid ne "all"){
						$BODY .= "<div class='deletecheck'><input type='checkbox' name='usergroupdeletecheck_" . $groupcounter . "' value='" . $ugid  . "'>delete</div>\n";
				}
				
				$BODY .= "</div>\n\n";

    }
		$BODY .= "<input type='hidden' name='listcounter_usergroup' id='listcounter_usergroup' value='" . $groupcounter . "'>\n"
				. "<input type='hidden' name='command' value='deleteusergroups'>\n";

		$BODY .= "</form>\n\n";

    return $BODY;
}



#---------------------------------------------------------
# Generate Users List 
#---------------------------------------------------------

sub generateUserList{
		my @userList = keys %{$userGroups->{$usergroupid}{users}};

    my $BODY ="";
		my $btnStr = "";
		
		my $usergroupname = $userGroups->{$usergroupid}{name};
		utf8::decode($usergroupname);


		if($usergroupid ne "all"){

				$BODY .= "<form id='configurationform' name='configurationform' action='./usermanager.cgi' method='POST'>\n";
				$BODY .= "<input type='hidden' name='command' value='changeconfiguration'>\n";
				$BODY .= "<input type='hidden' name='usergroupid' value='" . $usergroupid . "'>\n";

				$BODY .= "<div class='propertyline'><span class='propertyheader'>&nbsp;</span><span class='propertycontents'><input type='submit' name='btn_configuration' value='Change configuration' class='applybtn'  onmouseout='btnAreaMouseOut(this)' onmouseover='btnAreaMouseOver(this)' tabindex='1'></span></div>\n";

				$BODY .="<div class='propertyline1'><span class='propertyheader'>";
				$BODY .= "ID</span><span class='propertyconetnts'>" . $usergroupid;
				$BODY .="</span></div>";

				$BODY .="<div class='propertyline2'><span class='propertyheader'>";
				$BODY .= MESSAGE("USERMNG_GROUPNAME") . "</span>";
				$BODY .= "<input type='text' class='fieldL' name='newusergroupname' id='newusergroupname' value='" .  $usergroupname . "' size='24' tabindex='2'> &nbsp;";
				$BODY .="</div>";

				my $checked = "";
				$BODY .="<div class='propertyline1'>";
				if(scalar($userGroups->{$usergroupid}{subadmingroup}) eq ""){$checked = "";}
				elsif(scalar($userGroups->{$usergroupid}{subadmingroup}) == 1){$checked = "checked";}
				else{$checked = "";}
				$BODY .="<div class='propertyheader'>" . MESSAGE("USERMNG_SUBADMINGROUP") . "</div>";
				$BODY .= "<input type='checkbox' name='subadmingroup_check' id='subadmingroup_check' value='1' $checked>&nbsp;&nbsp;";
				$BODY .="</div>\n";

				$BODY .="</form>\n\n";
		}

		if($usergroupid eq "all"){
				$BODY .= "<h3 class='header'>Create new user</h3>\n";
		}
		else{
				$BODY .= "<h3 class='header'>Add new user</h3>\n";				
		}

		# Add new user to this group

		$btnStr = " into ". $usergroupname;

		$BODY .= "<ul id='howtotext'><li>" . MESSAGE("USERMNG_CREATENEWUSERNOTE") . "</ul>";

		$BODY .= "<form id='form_newuser' action='./usermanager.cgi' onSubmit='return addNewUser()' method='post'>\n"
				. "<div class='newusername'>New user id<br><input type='text' name='userid_newuser' id='userid_newuser' size='18' tabindex='3'></div>\n"
				. "<div class='newusernickname'>Nickname<br><input type='text' name='nickname_newuser' id='nickname_newuser' size='18' tabindex='4'></div>\n"
				. "<div class='newuserpass'>Password<br><input maxlength='8'  type='password' name='password_newuser' id='password_newuser' size='10' tabindex='5'></div>\n"
				. "<div class='newuserpass'>(re-enter)<br><input maxlength='8' type='password' name='password2_newuser' id='password2_newuser' size='10' tabindex='6'></div><br clear='left'>\n"
				. "<div class='newbtn'><br><input type='submit' id='btn_newuser' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Add this user" . $btnStr ."' tabindex='7' ></div>\n";

    $BODY .= "<input type='hidden' name='command_newuser' value='addnewuser'>\n"
				. "<input type='hidden' name='index' value='newuser'>\n"
				. "<input type='hidden' name='usergroupid_newuser' value='" . $usergroupid . "'>"
				. "</form><br clear='left'><br>\n\n";

		# Add user to this group
		if($usergroupid ne "all"){
				$BODY .= "<h3 class='header'>Add from users list</h3>\n";

				my $allUserList = $userGroups->{all}{users};
				
				my $length = scalar(keys %$allUserList);
				if($length > 20){
						$length = 20;
				}

				$BODY .= "<form id='form_adduserstogroup' action='./usermanager.cgi' onSubmit='return addSelectedUsersToGroup()'  method='POST'>\n<select id='useridlist' multiple size='3' name='useridlist' onmousedown='this.size=" . $length . ";'>\n";
				foreach my $auser (sort {$a cmp $b} (keys %$allUserList)){
						if($auser eq "public" || $auser eq "admin"){
								next;
						}
						if(!exists($userGroups->{$usergroupid}{users}{$auser})){
								$BODY .= "<option value='" . $auser . "'>" . $auser . "</option>\n";
						}
				}
				$BODY .= "</select>\n";
				$BODY .= "<input type='submit' id='btn_adduserstogroup' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Add selected users to " . $usergroupname ."' >\n";
				$BODY .= "<input type='hidden' name='command' value='adduserstogroup'>";
				$BODY .= "<input type='hidden' name='usergroupid' value='" . $usergroupid . "'>";
				$BODY .= "</form><br>";
		}

		# Users List
		$BODY .= "<h2 class='header'>List</h2>\n";
		
		$BODY .= "<form id='userlistform' action='./usermanager.cgi' onSubmit='return deleteUsers()' method='POST'>\n";
		
		$BODY .= "<div class='itemline_header'><div class='number'>&nbsp;</div><div class='userid'>ID</div><div class='nickname'>Nickname</div>";
		if($usergroupid eq "all"){
				$BODY .= "<input type='submit' name='btn_deleteusers' value='Delete checked users from this PositLog' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'>\n";
		}
		else{
				$BODY .= "<input type='submit' name='btn_deleteusers' value='Exclude checked users from this group' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'>\n";
		}
		$BODY .= "</div>";

		my $tmpBODY = "";

		if($usergroupid eq "all"){
				$tmpBODY .= "<div class='itemline1'>\n"
						. "<div class='number'>001.</div>"
						. "<div class='userid'><a href='./userproperty.cgi?user=admin'><span>admin</span>\n"
						. "</div></a></div>";
				$tmpBODY .= "<div class='itemline2'>\n"
						. "<div class='number'>002.</div>"
						. "<div class='userid'><a href='./userproperty.cgi?user=public'><span>public</span>\n"
						. "</div></a></div>";
		}

    my $usercounter = 0;
    foreach my $uid (sort {$a cmp $b} @userList){
				if($uid eq "public" || $uid eq "admin"){
						next;
				}
				$usercounter++;
				my $userclass = "itemline1";
				if(($usercounter + 2) % 2 == 0){
						$userclass = "itemline2";
				}

				my $usercounterStr = sprintf("%03d", $usercounter + 2);

				my $nickname = $users->{$uid}{nickname};
				utf8::decode($nickname);				

				$tmpBODY .= "<div class='" . $userclass . "'>\n"
						. "<div class='number'>"
						. $usercounterStr . "</div>"
						. "<div class='userid'><a href='./userproperty.cgi?user=" . $uid  . "'><span id='userid_" . $usercounter . "'>" . $uid . "</span>\n"
						. "</a></div>"

						. "<div class='nickname'>"
						. $nickname
						. "</div>"

						. "<div class='deletecheck'><input type='checkbox' name='userdeletecheck_" . $usercounter . "' value='" . $uid  . "'>";
				if($usergroupid eq "all"){
						$tmpBODY .= "delete</div>\n";
				}
				else{
						$tmpBODY .= "exclude</div>\n";
				}
				$tmpBODY .= "</div>\n\n";
    }


		$BODY .= $tmpBODY;
		$BODY .= "<input type='hidden' id='usergroupid' name='usergroupid' value='" . $usergroupid . "'>\n";
		$BODY .= "<input type='hidden' name='listcounter_user' id='listcounter_user' value='" . $usercounter . "'>\n";
		$BODY .= "<input type='hidden' name='command' value='deleteusers'>\n";

		$BODY .= "</form>";


		$BODY .= "<br style='clear:left'>";

		# Permission level

		if($usergroupid ne "all"){
				$BODY .= "<h2 class='header'>Permission level</h2>\n";

				my @readArray;
				my @editArray;
				my @attachArray;
				my @superArray;
				foreach my $pid (sort {$pages->{$a}{name} cmp $pages->{$b}{name}} (keys %{$userGroups->{$usergroupid}{permissions}})){
						if(scalar($userGroups->{$usergroupid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_READ){
								push(@readArray, $pid);
						}
						elsif(scalar($userGroups->{$usergroupid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_EDIT){
								push(@editArray, $pid);
						}
						elsif(scalar($userGroups->{$usergroupid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_ATTACH_FILE){
								push(@attachArray, $pid);
						}				
						elsif(scalar($userGroups->{$usergroupid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_SUPER){
								push(@superArray, $pid);
						}
				}

				$BODY .= "<h3 class='header'>" . MESSAGE("USERLEVEL_READ") . "</h3>\n";
				$BODY .= generatePermissionPageList(\@readArray);
				$BODY .= "<h3 class='header'>" . MESSAGE("USERLEVEL_EDIT") . "</h3>\n";
				$BODY .= generatePermissionPageList(\@editArray);
				$BODY .= "<h3 class='header'>" . MESSAGE("USERLEVEL_ATTACH_FILE") . "</h3>\n";
				$BODY .= generatePermissionPageList(\@attachArray);
				$BODY .= "<h3 class='header'>" . MESSAGE("USERLEVEL_SUPER") . "</h3>\n";
				$BODY .= generatePermissionPageList(\@superArray);
		}

    return $BODY;
}


#---------------------------------------------------------
# Generate main page
#---------------------------------------------------------

sub generatePermissionPageList{
		my ($pageArray) = @_;
		my $pagelist = "";
		foreach my $pid (@$pageArray){
				my $ptitle = $pages->{$pid}{name};
				utf8::decode($ptitle);
				$pagelist .= "<a href='./pageproperty.cgi?page=" . $pid . "'>" . $ptitle . "</a>, ";
		}
		if($pagelist ne ""){
				$pagelist = substr($pagelist, 0, length($pagelist)-2);
				return "<div class='permittedpagelist'>" . $pagelist . "</div><br>";
		}
		else{
				return "";
		}
}


sub generateMainPage{
		my ($statusStr) = @_;

		my $BODY = "<body class='admin'>\n";

    #---------------------------------------------------------
    # User management
    #---------------------------------------------------------

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
    if($usergroupid ne "") {
				#---------------------------
				# Manage user group members
				#---------------------------
				if($usergroupid eq "all"){
						$BODY .= "<h1 class='usermanagement'>All users</h1>\n";
				}
				else{
						my $usergroupname = $userGroups->{$usergroupid}{name};
						utf8::decode($usergroupname);
						$BODY .= "<h1 class='usermanagement'>User group configuration</h1>\n";
				}

				$BODY .= "<span class='usernamearea'>".  $usernamestr . "</span><br>";

				$BODY .="<p><span class='statusarea'>" . $statusStr . "</span></p>";

				$BODY .= generateUserList();
    }
    else{
				#---------------------------
				# Manage user groups
				#---------------------------
				$BODY .= "<h1 class='usermanagement'>User groups</h1>\n";
				$BODY .= "<span class='usernamearea'>".  $usernamestr . "</span><br>";

				$BODY .="<p><span class='statusarea'>" . $statusStr . "</span></p>";

				# Create new group
				$BODY .= "<h3 class='header'>Create new usergroup</h3>\n";

				$BODY .= "<ul id='howtotext'><li>" . MESSAGE("USERMNG_CREATENEWUSERGROUPNOTE") . "</ul>";
				$BODY .= "<form id='form_newusergroup' action='./usermanager.cgi' onSubmit='return addNewUserGroup()' method='post'>\n"
						. "<div class='newusername'><input type='text' name='newusergroupname' id='newusergroupname' size='18' tabindex='8'></div>\n"
						. "<div class='newbtn'><input type='submit' id='btn_newgroup' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Create this group'  tabindex='9'></div>\n";
				
				$BODY .= "<input type='hidden' name='command_newgroup' value='addnewusergroup'>\n"
						. "<input type='hidden' name='index' value='newgroup'>\n"
						. "</form><br>\n\n";

				# Show user group list
				
				$BODY .= generateUserGroupList();
    }
		
		return $BODY;
}



#---------------------------------------------------------
# Generate JavaScript
#---------------------------------------------------------

my $ScriptBody = <<__ScriptBody__;
<script type='text/javascript'>
		<!--
		function addNewUserGroup(){
		if(document.getElementById('newusergroupname').value == ''){alert('Please enter a user group name.');return false;}

		return true;
}

function addSelectedUsersToGroup(){
		var selection = document.getElementById('useridlist');

		var selected = false;
		for(i=0; i<selection.options.length; i++){
				if(selection.options[i].selected){
						selected = true;
				}
		}

		if(!selected){
				alert('Please select one or more user ids.');
				return false;
		}

		return true;
}

function addNewUser(){
		if(document.getElementById('userid_newuser').value == ''){
				alert('Please enter user id.');
				return false;
		}
		
		var passElm = document.getElementById("password_newuser");
		var passElm2 = document.getElementById("password2_newuser");
		if(passElm.value == ''){alert('Please enter password.');return false;}
		if(passElm.value != passElm2.value){alert('Two passwords are different. Please re-enter passwords.');return false;}
		else{return true;}
}

function changeNickname(){
		if(document.getElementById('userid_changenickname').value == ''){
				alert('Please enter user id.');
				return false;
		}

		if(document.getElementById('nickname_changenickname').value == ''){
				alert('Please enter nickname.');
				return false;
		}

		return true;
}



function deleteUsers(){
		var deleteUserList = "";

    var reg = new RegExp("^userdeletecheck_", "i");
		
		var counter = 1;
		for(var i=0; i<document.forms["userlistform"].elements.length; i++){
				if (document.forms["userlistform"].elements[i].name.match(reg)){
						if(document.forms["userlistform"].elements[i].checked){
								deleteUserList += document.getElementById("userid_" + counter).innerHTML + ", ";
						}
						counter++;
				}
		}

		var prefix = "Exclude ";
		var postfix = " from this group";
		if(document.getElementById('usergroupid').value == 'all'){
				prefix = "Delete ";
				postfix = " ";
		}

		var mes = prefix;

		if(deleteUserList == ""){
				alert('Please check one or more user ids.');
				return false;
		}
		else{
				if(window.confirm(mes + deleteUserList.substr(0, deleteUserList.length-2) + postfix + '?')){
						return true;
				}
		}

		return false;
}


function deleteUserGroups(){
		var deleteUserGroupList = "";

    var reg = new RegExp("^usergroupdeletecheck_", "i");

		var counter = 2;
		for(var i=0; i<document.forms["usergrouplistform"].elements.length; i++){
				if ((document.forms["usergrouplistform"].elements[i].name.match(reg))){
						if(document.forms["usergrouplistform"].elements[i].checked){
								deleteUserGroupList += document.getElementById("usergroupid_" + counter).innerHTML + ", ";
						}
						counter ++;
				}
		}

		var mes = "Delete user groups: ";
		if(counter == 2){
				mes = "Delete user group: ";
		}

		if(deleteUserGroupList == ""){
				alert('Please check one or more user group names.');
				return false;
		}
		else{
				if(window.confirm(mes + deleteUserGroupList.substr(0, deleteUserGroupList.length-2) + ' ?')){
						return true;
				}
		}

		return false;
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
		<title>PositLog User manager</title>\n"
		. $ScriptBody
		. "</head>\n";

my $BODY ="";


#---------------------------------------------------------------
# Command Processor
#---------------------------------------------------------------

if($command eq ""){
		$BODY = generateMainPage();
}
elsif($command eq "changeconfiguration"){
		$userGroups->{$usergroupid}{name} = $newusergroupname;
		$userGroups->{$usergroupid}{subadmingroup} = $subadmingroup;
				
		if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
				warn "Cannot write " . $adminpath . "usergroups.dat";
				exit(0);
		}

		$BODY .= generateMainPage("User group configurations have been changed.");
}
elsif($command eq "addnewuser"){
    #---------------------------------------------------------
    # Create a new user
    #---------------------------------------------------------

    if(exists($users->{$userid})){
				print "<div style='text-align: center'>User id '" . $userid . "' already exists.<br>\n";
				print "<a href='./usermanager.cgi?usergroupid=" . $usergroupid . "'>back</a></div>\n";
				exit(0);
    }

    if($userid =~ /[^a-zA-Z0-9\_\-\@]/){
				print "<div style='text-align: center'>This id includes invalid characters.<br>\n";
				print "<a href='./usermanager.cgi?usergroupid=" . $usergroupid . "'>back</a></div>\n";
				exit(0);
		}

    if($userid eq "public" || $userid eq "admin"){
				print "<div style='text-align: center'>You cannot use this id.<br>\n";
				print "<div style='text-align: center'>[ " . $userid . " ]<br>\n";
				print "<a href='./usermanager.cgi?usergroupid=" . $usergroupid . "'>back</a></div>\n";
				exit(0);
		}
		
    if($password =~ /[^a-zA-Z0-9\^\~\_\!\#\%\&\(\)\*\+\-\/\.\:\;\<\=\>\'\"\\\?\@\[\]\^\`\{\|\}]/){
				print "<div style='text-align: center'>This password includes invalid characters.<br>\n";
				print "<a href='./usermanager.cgi?usergroupid=" . $usergroupid . "'>back</a></div>\n";
				exit(0);
    }

    if($nickname =~ /[\[\]\<\>]/g){
				print "<div style='text-align: center'>This nickname includes invalid characters.<br>\n";
				print "<a href='./usermanager.cgi?usergroupid=" . $usergroupid . "'>back</a></div>\n";
				exit(0);
    }

    if($nickname eq ""){
				$users->{$userid}{nickname} = $userid;
    }
    else{
				$users->{$userid}{nickname} = $nickname;
    }

    my $salt="ry";
    my $cryptpass = crypt($password, $salt);
    $users->{$userid}{password} = $cryptpass;

		$userGroups->{$usergroupid}{users}{$userid} = 1;
		$users->{$userid}{groups}{$usergroupid} = 1;

		# user must be added to "all" user group
		$userGroups->{all}{users}{$userid} = 1;
		$users->{$userid}{groups}{all} = 1;

		# save user
    if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
				warn "Cannot write" . $adminpath . "users.dat";
				exit(0);
		}

		if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
				warn "Cannot write " . $adminpath . "usergroups.dat";
				exit(0);
		}

		if($usergroupid ne ""){
				my $usergroupname = $userGroups->{$usergroupid}{name};
				utf8::decode($usergroupname);
				$BODY .= generateMainPage("User '" . $userid . "' has been added to '" .$usergroupname . "' user group.");
		}
		else{
				$BODY .= generateMainPage("User '" . $userid . "' has been added to 'All' user group.");
		}
}
elsif($command eq "adduserstogroup"){
    #---------------------------------------------------------
    # Add users to a group
    #---------------------------------------------------------

		if($usergroupid ne ""){
				my $addedlist = "";
				my $alllist = "";
				my $usercount = 0;

				foreach my $newid (@useridlist){
						if(!exists($userGroups->{$usergroupid}{users}{$newid})){
								$userGroups->{$usergroupid}{users}{$newid} = 1;
								$users->{$newid}{groups}{$usergroupid} = 1;
								$addedlist .= $newid . ", ";
								$usercount++;
								$alllist .= $newid . ", ";
						}
				}

				if($alllist ne ""){
						$alllist = substr($alllist, 0, length($alllist)-2);
				}

				if($addedlist ne ""){
						$addedlist = substr($addedlist, 0, length($addedlist)-2);
				}

				if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
						warn "Cannot write" . $adminpath . "users.dat";
						exit(0);
				}
				
				if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
						warn "Cannot write " . $adminpath . "usergroups.dat";
						exit(0);
				}

				my $usergroupname = $userGroups->{$usergroupid}{name};
				utf8::decode($usergroupname);
				if($usercount == 1){
						$BODY .= generateMainPage("User '" . $addedlist . "' has been added to '" .$usergroupname . "' user group.");
				}
				elsif($usercount > 1){
						$BODY .= generateMainPage("Users '" . $addedlist . "' have been added to '" .$usergroupname . "' user group.");
				}
				else{
						$BODY .= generateMainPage("No user has been added to '" .$usergroupname . "' user group.");
				}
		}

}
elsif($command eq "addnewusergroup"){
    #---------------------------------------------------------
    # Create a new group
    #---------------------------------------------------------

		# generate new usergroupID
		my $newusergroupid = "";
		my @alpha = ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
		do{
				my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst);
				($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
				my $createtime = sprintf("%02d%02d%02d", $year+1900-2000, $mon+1, $mday);
				my $rand = int (rand(52));
				my $rand2 = int (rand(52));
				$newusergroupid = "ug" . $createtime . $alpha[$rand] . $alpha[$rand2];
    }while(exists($userGroups->{$newusergroupid}));

    if($newusergroupname eq "All"){
				print "<div style='text-align: center'>You can not use this name.<br>\n";
				print "<div style='text-align: center'>[ all ]<br>\n";
				print "<a href='./usermanager.cgi'>back</a></div>\n";
				exit(0);
		}

		$userGroups->{$newusergroupid}{name} = $newusergroupname;

		if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
				delete $userGroups->{$newusergroupid};
				warn "Cannot write " . $adminpath . "usergroups.dat";
				exit(0);
		}
		$usergroupid = "";
		utf8::decode($newusergroupname);
		$BODY .= generateMainPage("User group '" . $newusergroupname . "' has been created.");

}
elsif($command eq "deleteusergroups"){
    #---------------------------------------------------------
    # Delete user groups
    #---------------------------------------------------------
		my $deleteUserGroupNameList = "";

		my $pages = eval{ Storable::lock_retrieve($adminpath . "pages.dat")};
		if($@){ warn "Cannot read " . $adminpath . "pages.dat"; };
		for(my $i=1; $i < $listcounter_usergroup+1; $i++){
				my $gid = $CGI->param("usergroupdeletecheck_" . $i);
				if($gid ne ""){
						if(exists($userGroups->{$gid})){
								# Delete from page configuration
								my @pageList = keys	%{$userGroups->{$gid}{permissions}};
								foreach my $pageid (@pageList){
										delete $pages->{usergroups}{scalar($userGroups->{$gid}{permissions}{$pageid})}{$gid};
								}

								foreach my $uid (keys %{$userGroups->{$gid}{users}}){
										delete $users->{$uid}{groups}{$gid};
								}


								my $gname = $userGroups->{$gid}{name};
								utf8::decode($gname);
								delete $userGroups->{$gid};
								$deleteUserGroupNameList .= "User group '" . $gname . "' has been deleted.<br>\n";
						}
				}
		}
		if(!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}){
				warn "Cannot write " . $adminpath . "pages.dat";
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

		$BODY .= generateMainPage($deleteUserGroupNameList);

}
elsif($command eq "deleteusers" && $usergroupid ne ""){
		my $deleteUserIdList = "";

		#---------------------------------------------------------
		# Exclude users
		#---------------------------------------------------------
		if($usergroupid ne "all"){
				for(my $i=1; $i < $listcounter_user+1; $i++){
						my $id = $CGI->param("userdeletecheck_" . $i);
						if($id ne ""){
								if(exists($userGroups->{$usergroupid}{users}{$id})){
										my $usergroupname = $userGroups->{$usergroupid}{name};
										utf8::decode($usergroupname);
										$deleteUserIdList .= "User '" . $id . "' has been excluded from '" .  $usergroupname . "'.<br>\n";
										delete $userGroups->{$usergroupid}{users}{$id};
								}
						}
						delete $users->{$id}{groups}{$usergroupid};
				}

				if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
						warn "Cannot write" . $adminpath . "users.dat";
						exit(0);
				}

				if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
						warn "Cannot write " . $adminpath . "usergroups.dat";
						exit(0);
				}
		}
		#---------------------------------------------------------
		# Delete users
		#---------------------------------------------------------
		else{
				my $pages = eval{ Storable::lock_retrieve($adminpath . "pages.dat")};
				if($@){ warn "Cannot read " . $adminpath . "pages.dat"; };

				for(my $i=1; $i < $listcounter_user+1; $i++){
						my $id = $CGI->param("userdeletecheck_" . $i);
						if($id ne ""){
								$deleteUserIdList .= "User '" . $id . "' has been deleted from PositLog, ";

								# delete from user groups
								my @userGroupList = keys %{$users->{$id}{groups}};
								foreach my $groupid (@userGroupList){
										if(exists($userGroups->{$groupid}{users}{$id})){
												delete $userGroups->{$groupid}{users}{$id};
										}
								}
								$deleteUserIdList = substr($deleteUserIdList, 0, length($deleteUserIdList)-2) . "'.<br>\n";

								my @pageList = keys	%{$users->{$id}{permissions}};
								foreach my $pageid (@pageList){
										delete $pages->{users}{scalar($users->{$id}{permissions}{$pageid})}{$id};
								}
								# delete from users
								if(exists($users->{$id})){
										delete $users->{$id};
								}
						}
				}

				if(!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}){
						warn "Cannot write " . $adminpath . "pages.dat";
						exit(0);
				}										

				if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
						warn "Cannot write" . $adminpath . "users.dat";
						exit(0);
				}
				
				if(!eval{Storable::lock_nstore $userGroups, $adminpath . "usergroups.dat"}){
						warn "Cannot write " . $adminpath . "usergroups.dat";
						exit(0);
				}
		}

		$BODY .= generateMainPage($deleteUserIdList);

}


$BODY .= "</body>\n";

my $FOOTER = "</html>";

my $out = $HEADER . $BODY . $FOOTER;
utf8::encode($out);
print $out;
