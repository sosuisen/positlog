#!/usr/bin/perl

# --------------------------------------------------------
# userproperty.cgi:
#      cgi for PositLog user property management
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

my $userid = $CGI->param("user");
if($userid eq ""){
		$userid = "public";
}
my $nickname = $CGI->param("nickname");

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
  <form id='loginform' action='userproperty.cgi' method='post'>\n
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
# Generate main page
#---------------------------------------------------------

sub generatePermissionPageList{
		my ($pageArray, $label) = @_;
		my $pagelist = "";
		foreach my $pid (@$pageArray){
				my $ptitle = $pages->{$pid}{name};
				utf8::decode($ptitle);
				$pagelist .= "<a href='./pageproperty.cgi?page=" . $pid . "'>" . $ptitle . "</a>, ";
		}
		if($pagelist ne ""){
				$pagelist = substr($pagelist, 0, length($pagelist)-2);
				return "<div><span class='permittedpagelistheader'>(" . $label . ") </span><span class='permittedpagelist'>" . $pagelist . "</span></div>";
		}
		else{
				return "";
		}

}

sub generateMainPage{
		my ($statusStr) = @_;

		my $BODY = "<body class='admin'>\n";

		$BODY .="<h1 class='usermanagement'>User property manager</h1>\n";

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

		$BODY .="<div class='propertyline1'><span class='propertyheader'>";
		$BODY .= "ID</span><span class='propertyconetnts'>" . $userid;
		$BODY .="</span></div>";

		if($userid ne "public" && $userid ne "admin"){
				$BODY .="<div class='propertyline2'><span class='propertyheader'>";
				my $mynickname = $users->{$userid}{nickname};
				utf8::decode($mynickname);		
				$BODY .= MESSAGE("USERMNG_NICKNAME") . "</span><span class='propertyconetnts'>" . $mynickname;
				$BODY .="</span></div><br>";

				# change nickname
				$BODY .="<p id='howtotext'>" . MESSAGE("ADMIN_CHANGENICKNAMENOTE") . "</p>\n";
				$BODY .= "<form id='form_changenickname' action='./userproperty.cgi' method='POST'>\n";
				$BODY .= "<div class='newusernickname'><input type='text' name='nickname' id='nickname' size='18' tabindex='1'></div>\n"
						. "<div class='newuserbtn'><input type='submit' id='btn_changenickname' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Change nickname' tabindex='2'></div>\n"
						. "<input type='hidden' name='user' value='". $userid . "'>\n"
						. "<input type='hidden' name='command' value='changenickname'>\n"
						. "</form><br>\n";

				my $affl = "";
				foreach my $gid (keys %{$users->{$userid}{groups}}){
						my $gname = $userGroups->{$gid}{name};
						utf8::decode($gname);
						$affl .= "<a href='./usermanager.cgi?usergroupid=" . $gid . "'>" . $gname ."</a>, ";
				}
				if($affl ne ""){
						$affl = substr($affl, 0, length($affl) - 2);
				}
				$BODY .="<div class='propertyline1'><span class='propertyheader'>";
				$BODY .= MESSAGE("USERMNG_GROUPS") . "</span><span class='propertyconetnts'>" . $affl;
				$BODY .="</span></div>";

		}

		my $yourpages = "";
		foreach my $pid (sort {$pages->{$a}{name} cmp $pages->{$b}{name}} keys %{$users->{$userid}{authors}}){
				my $ptitle = $pages->{$pid}{name};
				utf8::decode($ptitle);
				$yourpages .= "<a href='./pageproperty.cgi?page=" . $pid . "'>" . $ptitle . "</a>, ";
		}
		if($yourpages ne ""){
				$yourpages = substr($yourpages, 0, length($yourpages)-2);
				$BODY .= "<br><br>";
				$BODY .= "<h2 class='header'>Your pages</h2>\n<div class='yourpagelist'>" . $yourpages . "</div>\n";
		}

		$BODY .= "<br><br>";

		$BODY .= "<h2 class='header'>Permission level</h2>\n";

		my @readArray;
 		my @editArray;
		my @attachArray;
		my @superArray;
		foreach my $pid (sort {$pages->{$a}{name} cmp $pages->{$b}{name}} (keys %{$users->{$userid}{permissions}})){
				if(scalar($users->{$userid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_READ){
						push(@readArray, $pid);
				}
				elsif(scalar($users->{$userid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_EDIT){
						push(@editArray, $pid);
				}
				elsif(scalar($users->{$userid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_ATTACH_FILE){
						push(@attachArray, $pid);
				}				
				elsif(scalar($users->{$userid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_SUPER){
						push(@superArray, $pid);
				}
		}
		my $uname = $users->{$userid}{nickname};
		utf8::decode($uname);
		my $pagelistRead = generatePermissionPageList(\@readArray, $uname);
		my $pagelistEdit = generatePermissionPageList(\@editArray, $uname);
		my $pagelistAttach = generatePermissionPageList(\@attachArray, $uname);
		my $pagelistSuper = generatePermissionPageList(\@superArray, $uname);


		foreach my $ugid (keys %{$users->{$userid}{groups}}){
				my @readArrayG;
				my @editArrayG;
				my @attachArrayG;
				my @superArrayG;
				foreach my $pid (sort {$pages->{$a}{name} cmp $pages->{$b}{name}} (keys %{$userGroups->{$ugid}{permissions}})){
						if(scalar($userGroups->{$ugid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_READ){
								push(@readArrayG, $pid);
						}
						elsif(scalar($userGroups->{$ugid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_EDIT){
								push(@editArrayG, $pid);
						}
						elsif(scalar($userGroups->{$ugid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_ATTACH_FILE){
								push(@attachArrayG, $pid);
						}				
						elsif(scalar($userGroups->{$ugid}{permissions}{$pid}) == $PositLogParam::USERLEVEL_SUPER){
								push(@superArrayG, $pid);
						}
				}

				my $ugname = $userGroups->{$ugid}{name};
				utf8::decode($ugname);

				my $list = generatePermissionPageList(\@readArrayG, $ugname);
				if($list ne ""){
						$pagelistRead .= $list;
				}
				my $list = generatePermissionPageList(\@editArrayG, $ugname);
				if($list ne ""){
						$pagelistEdit .= $list;
				}
				my $list = generatePermissionPageList(\@attachArrayG, $ugname);
				if($list ne ""){
						$pagelistAttach .= $list;
				}
				my $list = generatePermissionPageList(\@superArrayG, $ugname);
				if($list ne ""){
						$pagelistSuper .= $list;
				}
		}
		

		$BODY .= "<h3 class='permissionlevel'>" . MESSAGE("USERLEVEL_READ") . "</h3>\n";
		$BODY .= $pagelistRead;

		$BODY .= "<h3 class='permissionlevel'>" . MESSAGE("USERLEVEL_EDIT") . "</h3>\n";
		$BODY .= $pagelistEdit;

		$BODY .= "<h3 class='permissionlevel'>" . MESSAGE("USERLEVEL_ATTACH_FILE") . "</h3>\n";
		$BODY .= $pagelistAttach;

		$BODY .= "<h3 class='permissionlevel'>" . MESSAGE("USERLEVEL_SUPER") . "</h3>\n";
		$BODY .= $pagelistSuper;

		return $BODY;
}

#---------------------------------------------------------
# Generate JavaScript
#---------------------------------------------------------

my $ScriptBody = <<__ScriptBody__;
<script type='text/javascript'>
		<!--
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
		<title>PositLog User property manager</title>\n"
		. $ScriptBody
		. "</head>\n";

my $BODY ="";


#---------------------------------------------------------------
# Command Processor
#---------------------------------------------------------------

if($command eq ""){
		$BODY = generateMainPage();
}
elsif($command eq "changenickname"){
    #---------------------------------------------------------
    # Change nickname
    #---------------------------------------------------------

    if($userid eq "public" || $userid eq "admin"){
				print "<div style='text-align: center'>You cannot change the nickname of this id.<br>\n";
				print "<div style='text-align: center'>[ " . $userid . " ]<br>\n";
				print "<a href='./usermanager.cgi'>back</a></div>\n";
				exit(0);
		}

    if($users->{$userid}){
				if($nickname =~ /[\[\]\<\>]/g){
						print "<div style='text-align: center'>This nickname includes invalid characters.<br>\n";
						print "<a href='./userproperty.cgi?user=" . $userid . "'>back</a></div>\n";
						exit(0);
				}

				# save nickname
				$users->{$userid}{nickname} = $nickname;
				if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
						warn "Cannot write" . $adminpath . "users.dat";
						exit(0);
				}
				utf8::decode($nickname);
				
				$BODY .= generateMainPage("Nickname of user '" . $userid . "' has been changed to '" . $nickname . "'.");
    }
		else{
				print "<div style='text-align: center'>User id '" . $userid . "' does not exist.<br>\n";
				print "<a href='./usermanager.cgi'>back</a></div>\n";
				exit(0);
		}

}


$BODY .= "</body>\n";

my $FOOTER = "</html>";

my $out = $HEADER . $BODY . $FOOTER;
utf8::encode($out);
print $out;
