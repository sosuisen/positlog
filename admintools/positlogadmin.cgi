#!/usr/bin/perl

# --------------------------------------------------------
# positlogadmin.cgi:
#      cgi for PositLog administration
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

my $CGI = new CGI;

#--------------------------------------
# Print headers
#--------------------------------------

# administration command
my $command = $CGI->param("command");

# changepassword
my $newpassword = $CGI->param("newpassword");
my $newnickname = $CGI->param("newnickname");

#

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

if($command eq "logout"){
		$loginid = "";
		$loginpass = "";
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

#--------------------------------------
# Initialization
#--------------------------------------

my $adminpath = "../" . $PositLogConfig::adminpath;

if(! -d $adminpath){
		print "Admin directory : ' " . $adminpath . " ' does not exist.\n";
		exit(0);
}

if(! -f $adminpath . "dataversion.dat"){
		my $version = $PositLogParam::dataversion;
		if(!eval{Storable::lock_nstore \$version, $adminpath . "dataversion.dat"}){
				print "Cannot create dataversion.dat in $adminpath.<br>";
				print "Please check the file permission.";
				exit(0);
		}
}

if(! -f $adminpath . "tags.dat"){
		my %tags = ();
		if(!eval{Storable::lock_nstore \%tags, $adminpath . "tags.dat"}){
				print "Cannot create tags.dat in $adminpath.<br>";
				print "Please check the file permission.";
				exit(0);
		}
}

if(! -f $adminpath . "users.dat"){
		my %users = ();
		$users{public}{groups}{all} = 1;
		$users{public}{password} = "";
		$users{public}{nickname} = "public";
		$users{admin}{groups}{all} = 1;
		$users{admin}{password} = "";
		$users{admin}{nickname} = "admin";
		if(!eval{Storable::lock_nstore \%users, $adminpath . "users.dat"}){
				print "Cannot create users.dat in $adminpath.<br>";
				print "Please check the file permission.";
				exit(0);
		}
}

if(! -f $adminpath . "usergroups.dat"){
		my %usergroups;
		$usergroups{all}{name} = "All";
		$usergroups{all}{users}{public} = 1;
		$usergroups{all}{users}{admin} = 1;
		if(!eval{Storable::lock_nstore \%usergroups, $adminpath . "usergroups.dat"}){
				print "Cannot create usergroups.dat in $adminpath.<br>";
				print "Please check the file permission.";
				exit(0);
		}
}

if(! -f $adminpath . "pages.dat"){
		my %pages = ();
    if(!eval{Storable::lock_nstore \%pages, $adminpath . "pages.dat"}){
				print "Cannot create pages.dat in $adminpath.<br>";
				print "Please check the file permission.";
				exit(0);
		}
}


if(! -f $adminpath . "pagegroups.dat"){
		my %pagegroups;
		$pagegroups{all}{name} = "All";
    if(!eval{Storable::lock_nstore \%pagegroups, $adminpath . "pagegroups.dat"}){
				print "Cannot create pagegroups.dat in $adminpath.<br>";
				print "Please check the file permission.";
				exit(0);
		}
}


#--------------------------------------
# Authentication
#--------------------------------------

my $users = eval{ Storable::lock_retrieve($adminpath . "users.dat")};
if($@){ warn  "Cannot read " . $adminpath . "users.dat"; exit(0); }
if(exists($users->{""})){
		delete $users->{""};
		warn "Delete invalid user.";
		if(!eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
				warn "Cannot write " . $adminpath . "users.dat.";
				exit(0);
		}
}

my $pages = eval{ Storable::lock_retrieve($adminpath . "pages.dat")};
if($@){ warn  "Cannot read " . $adminpath . "pages.dat"; exit(0); }
if(exists($pages->{""})){
		delete $pages->{""};
		warn "Delete invalid page.";
		if(!eval{Storable::lock_nstore $pages, $adminpath . "pages.dat"}){
				warn "Cannot write " . $adminpath . "pages.cgi.";
				exit(0);
		}
}

my $adminAuth = eval{ Storable::lock_retrieve($adminpath . "key.dat")};
if($@){ warn  "Cannot read " . $adminpath . "key.dat"; exit(0); }

my $authObj = new PositLogAuth($adminpath, $loginid, $loginpass, "", "", $users, "", $adminAuth);


if(!$authObj->isValidUser && !$authObj->isAdminUser){
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
		function saveOnClick(){
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
  <form name='loginform' id='loginform' action='positlogadmin.cgi' method='post'>\n
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

my $statusStr = "";

#--------------------------------------
# Change password
#--------------------------------------

if($command eq "changepassword"){
    if($newpassword =~ /[^a-zA-Z0-9\^\~\_\!\#\%\&\(\)\*\+\-\/\.\:\;\<\=\>\'\"\\\?\@\[\]\^\`\{\|\}]/){
				print "<div style='text-align: center'>The password includes invalid characters.<br>";
				print "<a href='./positlogadmin.cgi'>back</a></div>";
				exit(0);
    }

    my $salt="ry";
    my $cryptpass = crypt($newpassword, $salt);
    $users->{$loginid}{password} = $cryptpass;

    if(eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
				$statusStr = "<p style='color:red;'>The password has been changed.</p>";
		}
		else{
				$statusStr = "<p style='color:red;'>Cannot write users.cgi.</p>";
		}
}
elsif($command eq "changenickname"){
    if($newnickname =~ /[\[\]\<\>]/g){
				print "<div style='text-align: center'>The nickname includes invalid characters.<br>";
				print "<a href='./positlogadmin.cgi'>back</a></div>";
				exit(0);
    }

    $users->{$loginid}{nickname} = $newnickname;

    if(eval{Storable::lock_nstore $users, $adminpath . "users.dat"}){
				$statusStr = "<p style='color:red;'>The nickname has been changed.</p>";
		}
		else{
				$statusStr = "<p style='color:red;'>Cannot save the authentication data.</p>";
		}
}


#---------------------------------------------------------
# Generate JavaScript
#---------------------------------------------------------

my $ScriptBody = <<__ScriptBody__;
<script type='text/javascript'>
		<!--

		function changePassword(){
		var passElm = document.getElementById("newpassword");
		var passElm2 = document.getElementById("newpassword2");
		if(passElm.value == ''){
				alert('Please enter a password.');
				return false;
		}
		if(passElm.value != passElm2.value){
				alert('Two passwords are different. Please re-enter passwords.');
				return false;
		}
		else{
				return true;
		}
}

function btnAreaMouseOver(elm){
		elm.style.backgroundColor = "#ffd0d0";
}

function btnAreaMouseOut(elm){
		elm.style.backgroundColor = "#ffffff";
}

function addNewPage(){
		if(document.getElementById('newpagetitle').value == ''){alert('Please enter a page name.');return false;}
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
		<title>PositLog Administration</title>\n"
		. $ScriptBody

		. "</head>\n";

my $BODY ="";
$BODY = "<body class='admin'>\n";
if($authObj->isAdminUser){
		$BODY .="<h1 class='header'>PositLog Administration</h1>\n";

		$BODY .= "<span class='usernamearea'>You are the '<a href='./userproperty.cgi?user=admin'>admin</a>' user. </span><br><br><br>\n";


		# Create new page
		$BODY .="<h2 class='header'>Create new page</h2>\n";
		$BODY .= "<ul id='howtotext'><li>" . MESSAGE("PAGEMNG_CREATENEWPAGENOTE") . "</ul>";
		$BODY .= "<form id='form_newpage' action='./pagemanager.cgi' onSubmit='return addNewPage()' method='post'>\n"
				. "<div class='newpagename'><input type='text' name='newpagetitle' id='newpagetitle' size='24' tabindex='1'></div>\n"
				. "<div class='newbtn'><input type='submit' id='btn_newpage' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Create this page'  tabindex='2'></div>\n";
		$BODY .= "<input type='hidden' name='command' value='addnewpage'>\n";
		$BODY .= "<input type='hidden' name='pagegroupid' value='all'>\n"
				. "</form><br>\n\n";


		# Create new user 
		$BODY .="<h2 class='header'>Create new user</h2>\n";
		
		$BODY .= "<ul id='howtotext'><li>" . MESSAGE("USERMNG_CREATENEWUSERNOTE"). "</ul>";

		$BODY .= "<form id='form_newuser' action='./usermanager.cgi' onSubmit='return addNewUser()' method='post'>\n"
				. "<div class='newusername'>New user id<br><input type='text' name='userid_newuser' id='userid_newuser' size='18' tabindex='3'></div>\n"
				. "<div class='newusernickname'>Nickname<br><input type='text' name='nickname_newuser' id='userid_newuser' size='18' tabindex='4'></div>\n"
				. "<div class='newuserpass'>Password<br><input maxlength='8'  type='password' name='password_newuser' id='password_newuser' size='10' tabindex='5'></div>\n"
				. "<div class='newuserpass'>(re-enter)<br><input maxlength='8' type='password' name='password2_newuser' id='password2_newuser' size='10' tabindex='6'></div>\n"
				. "<br clear='left'><div class='newbtn'><br><input type='submit' id='btn_newuser' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Create this user'  tabindex='7'></div>\n";
		
		$BODY .= "<input type='hidden' name='command_newuser' value='addnewuser'>\n"
				. "<input type='hidden' name='index' value='newuser'>\n"
				. "<input type='hidden' name='usergroupid_newuser' value='all'>"
				. "</form><br><br>\n\n";


}
else{
		my $uname = $users->{$loginid}{nickname};
		utf8::decode($uname);
		$BODY .= "<span class='usernamearea'>You are " . $uname . " (id: <a href='./userproperty.cgi?user=$loginid'>$loginid</a>). </span><br>\n";

		$BODY .="<p><span class='statusarea'>" . $statusStr . "</span></p>";

		# change nickname
		$BODY .="<h2 class='header'>Change your nickname</h2>\n";

		$BODY .="<ul id='howtotext'><li>" . MESSAGE("ADMIN_CHANGENICKNAMENOTE") . "</ul>\n";
		$BODY .= "<form id='form_changenickname' action='./positlogadmin.cgi' method='POST'>\n";
		$BODY .= "<div class='NewUserNameArea'>Nickname<br><input type='text' name='newnickname' id='newnickname' size='18' tabindex='1'></div>\n"
				. "<div class='NewUserBtnArea'><br><input type='submit' id='btn_changenickname' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Change nickname' tabindex='2'></div>\n"
				. "<input type='hidden' name='command' value='changenickname'>\n"
				. "</form>\n";

		# change password
		$BODY .="<h2 class='header'>Change your password</h2>\n";

		$BODY .="<ul id='howtotext'><li>" . MESSAGE("ADMIN_CHANGEPASSWORDNOTE") . "</ul>\n";
		$BODY .= "<form id='form_changepassword' onSubmit='return changePassword()' action='./positlogadmin.cgi' method='POST'>\n"
				. "<div class='NewUserPassArea'>New Password<br><input maxlength='8'  type='password' name='newpassword' id='newpassword' size='10' tabindex='3'></div>\n"
				. "<div class='NewUserPassArea'>(re-enter)<br><input maxlength='8' type='password' name='newpassword2' id='newpassword2' size='10' tabindex='4'></div>\n"
				. "<div class='NewUserBtnArea'><br><input type='submit' id='btn_changepassword' class='applybtn'  onmouseout='btnAreaMouseOut(this)'   onmouseover='btnAreaMouseOver(this)'  value='Change password' tabindex='5'></div>\n"
				. "<input type='hidden' name='command' value='changepassword'>\n"
				. "</form>\n";

}

my $FOOTER = "</body></html>";

my $out = $HEADER . $BODY . $FOOTER;
utf8::encode($out);
print $out;
