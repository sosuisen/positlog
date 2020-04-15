#!/usr/bin/perl

# --------------------------------------------------------
# PositLog
#
# The position logger for web contents.
#
# positlog.cgi 
#     main cgi for PositLog
#  (tested under perl 5.8.4)
#
# Copyright (c) 2006-2008 Hidekazu Kubota All right reserved
#  <hidekaz@positlog.org> 
#  http://positlog.com/
# --------------------------------------------------------

# --------------------------------------------------------
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
# --------------------------------------------------------

use lib qw(./extlib);

use strict;
# Default library (upper perl 5.8)
use CGI qw(-debug :standard);
use CGI::Cookie;
use Storable qw(lock_retrieve lock_nstore);
# Additional library
use JSON;
# Additional plugins
use PositLogConfig;
use PositLogAuth;
use PositLogSprites;
use PositLogParam;

# I18n
eval 'use lang::lang_' . $PositLogConfig::language . ';';
sub MESSAGE{
		no strict "refs"; my ($NAME) = @_; my $INAME = ${ "lang::lang_" . $PositLogConfig::language . "::" . $NAME }; utf8::decode($INAME); $INAME;
}

my $usegzip = "";
if($PositLogConfig::gzip == 1){
		foreach my $enc ( split( /\s*,\s*/, $ENV{HTTP_ACCEPT_ENCODING} )) {
				$enc =~ s/;.*$//s;
				$usegzip = $enc if ( $enc =~ /^(x-)?gzip$/ );
		}
		if($usegzip ne ""){
				print "Content-Encoding: $usegzip\n";
		}
}

# CSS
my $CSSHEADER = "";

# Set default world position (pixel) 
my $worldTop = 0;
my $worldLeft = 0;

# Parameters are already URL decoded.
my $CGI = new CGI;

my $fromLoginScreen = $CGI->param("fromLoginScreen");

# View position (legacy)
my $arg_vp = $CGI->param("vp");
# View position
my $arg_p = $CGI->param("p");
# Sprite id
my $arg_id = $CGI->param("id");
# Zoom
my $arg_zoom = $CGI->param("z");
# Edge of contents
my $arg_edge = $CGI->param("edge");


my $noscript = $CGI->param("noscript");
if($noscript eq ""){
		$noscript = "false";
}

# "print" is available only in ViewMode.
my $printable = $CGI->param("print");
if($printable eq ""){
		$printable = "false";
}

my $nocss = $CGI->param("nocss");
if($nocss eq ""){
		$nocss = "false";
}

my $forceload = $CGI->param("forceload");

my $spriteslistvisible = "false";

my $pageid = $CGI->param("load");

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0);}

my $pagenotfound = 0;
# Check home page
if($pageid eq ""){
    my $homepageid = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "homepage.dat")} or {};
    if($homepageid ne ""){
				$pageid = $$homepageid;
				if($pageid =~ /^pg/){
						$pageid .= "_latest";
				}
    }
		else{
				$pagenotfound = 1; 
		}
}

my $rsspageid = $pageid;

if(!exists($pages->{$pageid})){
		$pagenotfound = 1;
}

# Check page group
if($pageid =~ /^(pg.+)_latest$/ || $pageid eq "all_latest"){
		my $pgid = "";
		if($pageid =~ /^(.+)_latest$/){
				$pgid = $1;
		}
		my $pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
		if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }

		if(!exists($pageGroups->{$pgid})){
				print $CGI->header(-charset => 'utf-8');
				if($usegzip){
						open(STDOUT,"| $PositLogConfig::gzippath -1 -c");
				}

				my $out = "<html><head><title>PositLog: Page group not found</title></head><body style='background-color: #efecde;'><h1 style='background-color: #dfdcce; color: #000000; padding: 5px; font-size: 18px;'>Page group not found</h1></body></html>";

				print $out;

				exit(0);
		}
		my $latestpid = "";
		my $latesttime = 0;
		foreach my $pid (keys %{$pageGroups->{$pgid}{pages}}){
				if($latesttime < scalar($pages->{$pid}{created_time})){
						$latesttime = scalar($pages->{$pid}{created_time});
						$latestpid = $pid;
				}
		}
		if($latestpid ne ""){
				$pageid = $latestpid;
				$pagenotfound = 0;
		}
}
elsif($pageid =~ /^(pg.+)$/){
  # Group page
}

if($pagenotfound == 1){
		print $CGI->header(-charset => 'utf-8');
		if($usegzip){
				open(STDOUT,"| $PositLogConfig::gzippath -1 -c");
		}

		my $out = "<html><head><title>PositLog: Page not found</title></head><body style='background-color: #efecde;'><h1 style='background-color: #dfdcce; color: #000000; padding: 5px; font-size: 18px;'>Page not found</h1></body></html>";

		print $out;

		exit(0);
}


my $positlogMode = $CGI->param("mode");


# Check available mode
if($positlogMode ne "ViewMode"
   && $positlogMode ne "EditMode"
   && $positlogMode ne "ViewEditMode"
   && $positlogMode ne "Login"
   && $positlogMode ne "Logout"
    ){
    # Default
    $positlogMode = "ViewMode";
}

#-------------------------------------------------------------
# Authentication
#-------------------------------------------------------------
my $loginerror = "";

my $loginid = $CGI->param("loginid");
my $loginpass = $CGI->param("loginpass");

my $pagetitle = $pages->{$pageid}{name}; 
utf8::decode($pagetitle);

sub showLoginScreen{
    my ($clearid, $mode) = @_;

    # $mode
    #  EditMode : Go to EditMode. If the user is not permitted to edit, showLoginScreen again.
    #  ViewEditMode : Go to ViewMode. If the user is permitted to edit, go to EditMode.

    if($clearid eq "clearid"){
				$loginid = "";
    }

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
<html lang='" . $PositLogConfig::language ."'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<meta http-equiv='Content-Style-Type' content='text/css'>\n
		<link rel='stylesheet' href='" . $PositLogConfig::admintoolsfilepath . "css/logincheck.css' type='text/css'>\n
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
		<title>PositLog : Login</title>\n
	</head>\n";

    my $BODY = "<body onLoad=\"(document.getElementById('loginid')).focus()\">\n
  <div id='logintop'>\n
  <div id='login'>\n
  <h1>Login to <a href='./positlog.cgi?load=" . $pageid . "'>" . $pagetitle . "</a></h1>\n
  <form id='loginform' action='positlog.cgi?load=" . $pageid . "&amp;mode=" . $mode . "' method='post'>\n
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
    <p id='submitarea'>\n" . $loginerror . 
    "<br/><input type='submit' id='submitbtn' value='Login' tabindex='4'><br>\n
	</p>\n
    <input type='hidden' name='mode' id='mode' value='" . $mode . "'>\n
    <input type='hidden' name='load' id='load' value='" . $pageid . "'>\n
    <input type='hidden' name='fromLoginScreen' id='fromLoginScreen' value='1'>\n
  </form>\n
  </div>\n
  <div id='admin'>
  <a href='". $PositLogConfig::admintoolscgipath . "admin.cgi'>Administration</a>\n
  </div>\n
  <div id='copyright'>\n
  Powered by <a href='" . $PositLogConfig::positloghome . "'>PositLog</a>\n
  </div>\n
  </div>\n
</body>\n";

    my $FOOTER = "</html>";

		my $out = $HEADER . $BODY . $FOOTER;
		utf8::encode($out);

		print $out;
}


if($loginid eq ""){
    # Read temporal cookie
    $loginid = $CGI->cookie("loginid") || "";
    $loginpass = $CGI->cookie("loginpass") || "";
    if($loginid eq "" || $loginid eq "public"){
				$loginid = "public";
				$loginpass = "";
    }
}
elsif($loginid eq "public"){
    $loginpass = "";
}

if($positlogMode eq "Logout"){
    $positlogMode = "ViewMode";

    # Logout and Show View Screen
    $loginid = "public";
    $loginpass = "";
}

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages);

my $authError = $authObj->getErrorMsg;
if($authError ne ""){
		warn $authError;
}

if($positlogMode eq "Login"){
    if($loginid eq "public"){
				$loginid = "";
    }
    print $CGI->header(-charset => 'utf-8');
		if($usegzip){
				open(STDOUT,"| $PositLogConfig::gzippath -1 -c");
		}

    &showLoginScreen("", "ViewEditMode");
    exit(0);
}
elsif($positlogMode eq "EditMode" || $positlogMode eq "ViewEditMode" || $positlogMode eq "ViewMode"){
    if($authObj->isPublicUser || !$authObj->isValidUser){
				# public user
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

    if(!$authObj->isPublicUser && !$authObj->isValidUser){
				print $CGI->header(-charset => 'utf-8');
				if($usegzip){
						open(STDOUT,"| $PositLogConfig::gzippath -1 -c");
				}
				if($fromLoginScreen == 1){
						$loginerror = "<span style='color:red; font-size:12px;'>You don't have permission.</span>";
				}
				&showLoginScreen("", $positlogMode);
				exit(0);
    }
		else{
				print $CGI->header(-charset => 'utf-8', -cookie => [$cookieUser,$cookiePass]);
				if($usegzip){
						open(STDOUT,"| $PositLogConfig::gzippath -1 -c");
				}
		}
}

#-------------------------------------------------------------
# Permission
#-------------------------------------------------------------

my $permissionLevel = $authObj->getPermissionLevel($pageid);
$authError = $authObj->getErrorMsg;
if($authError ne ""){
		warn $authError;
}

if($permissionLevel < $PositLogParam::USERLEVEL_READ){
		if($fromLoginScreen == 1){
				$loginerror = "<span style='color:red; font-size:12px;'>You don't have permission.</span>";
		}
    &showLoginScreen("clearid", $positlogMode);
    exit(0);
}

if($positlogMode eq "EditMode" && $permissionLevel < $PositLogParam::USERLEVEL_EDIT){
		if($fromLoginScreen == 1){
				$loginerror = "<span style='color:red; font-size:12px;'>You don't have permission.</span>";
		}
    &showLoginScreen("clearid", $positlogMode);
    exit(0);
}

if($positlogMode eq "ViewEditMode"){
		if($permissionLevel >= $PositLogParam::USERLEVEL_EDIT){
				$positlogMode = "EditMode";
		}
		else{
				$positlogMode = "ViewMode";
		}
}

if($positlogMode eq "EditMode"){
		$printable = "false";
}

#-------------------------------------------------------------
# Load Page
#-------------------------------------------------------------

my $bodycolor = "#" . $pages->{$pageid}{page_bgcolor};
my $footercolor = "#" . $pages->{$pageid}{footer_bgcolor};
my $pageType = $pages->{$pageid}{page_type};
if(!$pageType){
		$pageType = "document";
}

my $sprite_autolink = scalar($pages->{$pageid}{sprite_autolink});

my $publish = $pages->{$pageid}{publish};
if($publish == ""){
		$publish = 0;
}


# ---------------------------
#    Generate HTML BODY
# ---------------------------

# Check user agent
my $useragent = $ENV{'HTTP_USER_AGENT'};

# wzero3 [es] opera as mobile:  Mozilla/4.0 (compatible; MSIE 6.0; Windows CE; SHARP/WS007SH; PPC; 480x640) Opera 8.60 [ja]

# Pocket Internet Explorer: MSIE 4.01; Windows CE;
if($useragent =~ /MSIE 4.01; Windows CE;/){
		$noscript = "true";
}
# Windows mobile 6.0
if($useragent =~ /MSIE 6.0; Windows CE;/){ 
		if($useragent !~ /Opera 8\./){
				$noscript = "true";
		}
}
if($useragent =~ /Opera 8\./){
		$spriteslistvisible = "true";
}
my $BODYELM = "<body id='positlogbody' ";
if($noscript ne "true" && $nocss ne "true"){
		$BODYELM .= "onLoad='bodyOnLoad()' ";
}
$BODYELM .= "style='background-color:" . $bodycolor . ";'>\n\n";

my $BODY = "";

if($noscript ne "true" &&  $nocss ne "true"){
		$BODY .= "<noscript><div id='javascriptalert'>Welcome to " . $pagetitle . ". It appears your browser does not support JavaScript. Please visit the <a href='./positlog.cgi?load=" . $pageid . "&amp;noscript=true'>no-script page</a> or the <a href='./positlog.cgi?load=" . $pageid . "&amp;nocss=true'>plain page</a>.</div></noscript>";
}

$BODY .= "<div id='zoomingcenter' style='display:none'></div>";

$BODY .= "<div id='procanime' style='display:none'></div>";

$BODY .= "<div id='forcecancelmark' style='display:none'></div>";

# Add controlpanel
if($positlogMode eq "EditMode"){
    $BODY .= "<div id='controlpanel'>";
    $BODY .= "<div id='controlpanel_bar1'>";
    $BODY .= "<span id='controlresult'></span>";
		$BODY .= "<span id='controlinfo'>";
    $BODY .= "<span id='about'><span id='copyrightinfo' style='cursor:pointer; padding: 0px 3px 0px 3px;' onclick='EDT.showCopyright()' onmouseover='EDT.copyrightOnMouseOver()' onmouseout='EDT.copyrightOnMouseOut()'>PositLog " . $PositLogParam::version . "</span> <span id='pageinfo'></span>";
		$BODY .= "<span id='helparea'><a href='" . $PositLogConfig::helpurl . "' title='About' target='_blank'><span id='helpbtn'>HELP</span></a></span></span>";

    if($authObj->isAdminUser){
				$BODY .= "<span id='idarea'>&nbsp;&nbsp;<span id='yourid'>admin</span>'s ID</span>";
    }
		else{
				$BODY .= "<span id='idarea'>&nbsp;&nbsp;ID [<span id='yourid'>$loginid</span>]</span>";
    }

		$BODY .= "<span id='cp_auth' style='display:none'><span id='cp_publicauthorlabel'>". MESSAGE("CONTROLPANEL_AUTHOR") . "&nbsp;</span><input type='text' size='12' id='cp_publicauthor'><span id='cp_publicpasslabel'>&nbsp;" . MESSAGE("CONTROLPANEL_PASSWORD") . "&nbsp;</span><input type='password' size='8' id='cp_publicpass'>";
		$BODY .= "</span>";

		$BODY .= "</span>";
		$BODY .= "</div>";

		$BODY .= "<div id='controlpanel_bar2'>";
		$BODY .= "<div id='newspritebtn' title='Create new sprite'></div>";
    if($authObj->canCreatePage($pageid)){
				$BODY .= "<div id='newpagebtn' title='Create new page'></div>";
    }

# The trouble is that the admin id is displayed in ViewMode
# because positlogadmin.cgi leaves id_cookie.
# $adminUser = 0 and $loginid = admin's id in ViewMode
# after logging into positlogadmin.cgi by admin's id.
# Consequetly, $loginid is displayed in only EditMode.
    
    if($authObj->isAdminUser || $authObj->isAuthor($pageid)){
				$BODY .= "<div id='propertybtn' title='Open property page'></div>";
    }

		$BODY .= "<div id='arrowbtn' title='Arrow tool'></div>";

		$BODY .= "<div id='drawingbtn' title='Drawing tool'></div>";

		$BODY .= "<div id='directdropbtn' title='Direct drop mode' style='display:none'></div>";

		$BODY .= "<button id='revertpropertybtn' style='display:none'>" . MESSAGE("CONTROLPANEL_REVERTCHANGES") . "</button>";

    if($authObj->isAdminUser || $authObj->isAuthor($pageid)){
				$BODY .= "<button id='savehomebtn' onclick='EDT.saveHomePosition()'>" . MESSAGE("CONTROLPANEL_SAVEHOME") . "</button>";
		}

		$BODY .= "</div>";		


		$BODY .= "<div id='controlpanel_bar3'>";

		$BODY .= "<div id='spriteproperty0' class='spriteproperty' style='display:none;'>";
		$BODY .= "<div id='propertylabel' style='display:none;'></div>";
		$BODY .= "</div>";		

    $BODY .= "<div id='spriteproperty5'  class='spriteproperty' style='display:none;'>";
    $BODY .= "<input id='showuri' type='checkbox' value='1'>";
    $BODY .= "<div id='propertyuri' title='URI'></div>";
		$BODY .= "</div>";		

    $BODY .= "<div id='spriteproperty6'  class='spriteproperty' style='display:none;'>";
		$BODY .= "<input id='showtime' type='checkbox' value='1'>";
    $BODY .= "<div id='propertytime' title='Date'></div>";
		$BODY .= "</div>";		

    $BODY .= "<div id='spriteproperty7'  class='spriteproperty' style='display:none;'>";
		$BODY .= "<input id='showauthor' type='checkbox' value='1'>";
    $BODY .= "<div id='propertyauthor' title='Author'></div>";
		$BODY .= "<button id='cp_unlockpass'>" . MESSAGE("CONTROLPANEL_PASSWORDUNLOCK") . "</button>";
		$BODY .= "</div>";		

    $BODY .= "<div id='spriteproperty8'  class='spriteproperty' style='display:none;'>";
		$BODY .= "<input id='showtag' type='checkbox' value='1'>";
		$BODY .= "<div id='taglabel'>". MESSAGE("CONTROLPANEL_TAG") . "</div>";
		$BODY .= "<form id='tagarea' onsubmit='EDT.view.saveTags(); return false;'><input type='text' size='20' id='tagfield'></form>";
		$BODY .= "</div>";		

    $BODY .= "<div id='spriteproperty9'  class='spriteproperty' style='display:none;'>";
    $BODY .= "<input id='uploaderbtn' class='btn-close' style='display:none' type='button' value='upload'>";
    $BODY .= "<input id='fileclearbtn' style='display:none' type='button' value='clear'>";
    $BODY .= "<div id='uploadedfilename' style='display:none'></div>";
    $BODY .= "<input id='pluginbtn' class='btn-close' style='display:none' type='button' value='plugin'>";
    $BODY .= "<div id='cp_pluginname' style='display:none'></div>";
		$BODY .= "</div>";

		$BODY .= "</div>";


		$BODY .= "<div id='controlpanel_bar4'>";

    $BODY .= "<div id='spriteproperty1'  class='spriteproperty' style='display:none;'>";
    $BODY .= "<div id='textcolorbtn' title='Text color'></div>";
    $BODY .= "<div id='bgcolorbtn' title='Background color'></div>";
    $BODY .= "<div id='linecolorbtn' title='Line color'></div>";
    $BODY .= "<div id='drawcolorbtn' title='Drawing color'></div>";
		$BODY .= "</div>";

		$BODY .= "<div id='spriteproperty2'  class='spriteproperty' style='display:none;'>";
    $BODY .= "<div id='propertystylelabel'></div>";
    $BODY .= "<select id='styleselector'></select>";
    $BODY .= "<select id='linestyleselector'></select>";
		$BODY .= "</div>";

		$BODY .= "<div id='spriteproperty3'  class='spriteproperty' style='display:none;'>";
    $BODY .= "<div id='propertywidthlabel'></div><select id='widthselector'></select>";
    $BODY .= "<select id='linewidthselector'></select>";
#		$BODY .= "<button id='undodrawingbtn'>" . MESSAGE("CONTROLPANEL_UNDODRAWING") . "</button>";
		$BODY .= "</div>";

		$BODY .= "<div id='spriteproperty4'  class='spriteproperty' style='display:none;'>";
    $BODY .= "<div id='propertypaddinglabel'></div><select id='paddingselector'></select>";
		$BODY .= "</div>";

		$BODY .= "</div>";

		$BODY .= "</div>\n\n";
}

# ---------------------------
# Generate sprites
# ---------------------------

my $SPRITESBODY = "";

# Retrieve sprites in a template page
my $tempSpritesHash = "";
my $templatepid = $pages->{$pageid}{template_pageid};
if(exists($pages->{$templatepid})){
#		my $tempPermissionLevel = $authObj->getPermissionLevel($templatepid);
#		if($tempPermissionLevel >= $PositLogParam::USERLEVEL_READ){
				my $tempSpritesObj = new PositLogSprites();
				my $spritestyle = "visibility:hidden";
				if($noscript eq "true" || $nocss eq "true" || $printable eq "true"){
						$spritestyle = "visibility:visible";
				}
				my $result = $tempSpritesObj->generateSprites($positlogMode, $templatepid, $pageid, $loginid, $loginpass,"sprite",$spritestyle,-1,"","");
				if($result ne "") {
						# Get hash for exporting
						$tempSpritesHash = $tempSpritesObj->getHash();

						# Get HTML
						my $TEMPBODY_ = $tempSpritesObj->getHtml();
						$SPRITESBODY .= $$TEMPBODY_;

						# Get CSS
						if($nocss ne "true"){
								my $CSS_  = $tempSpritesObj->getCss();
								$CSSHEADER .= $$CSS_;
						}
				}
#		}
}

# Retrieve sprites in a page
my $spritesObj = new PositLogSprites();
my $spritestyle = "visibility:hidden";
if($noscript eq "true" || $nocss eq "true" || $printable eq "true"){
		$spritestyle = "visibility:visible";
}
my $result = $spritesObj->generateSprites($positlogMode, $pageid, $pageid, $loginid, $loginpass,"sprite",$spritestyle,-1,"","");
if($result eq "") {
		my $out = "Cannot get sprites.\n";

		print $out;

    exit(0);
}

# Get hash for exporting
my $spritesHash = $spritesObj->getHash();

# Get HTML
my $BODY_ = $spritesObj->getHtml();
$SPRITESBODY .= $$BODY_;

if($noscript eq "true" || $nocss eq "true"){
		$SPRITESBODY =~ s/<script.*?>[\s\S]+?<\/script>//gi;
}

# Get CSS
if($nocss ne "true"){
		my $CSS_  = $spritesObj->getCss();
		$CSSHEADER .= $$CSS_;
}

my $BODY2 = "";
# Add extra HTMLs
if($noscript ne "true" && $nocss ne "true"){
		$BODY2 .= "\n<div id='worldframe'></div>";

		# drawcanvas should be the end of spriteslist in order to be shown at the end of sprites
		# when $noscript eq "true" and JavaScript is OFF.
		$BODY2 .= "<canvas id='drawcanvas' style='z-index:1; left: 0px; top: 0px;' width='200' height='200'></canvas>";
}

# End of spriteslist
$BODY2 .= "</div>";

if($positlogMode eq "EditMode"){
		$BODY2 .= "\n<div id='dropframe' style='display:none'></div>";
}

#if($positlogMode eq "EditMode"){
		$BODY2 .= "<div id='screenmask' style='display:none;'></div>";
#}

# End of spritesworld
$BODY2 .= "\n</div>";


# -----------------------------------
#    Generate HTML HEADER 
# -----------------------------------

my $HEADER1 = qq{<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html lang="$PositLogConfig::language">
<head>
		<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
		<meta http-equiv="Content-Style-Type" content="text/css">
		<meta http-equiv="Content-Script-Type" content="text/javascript">\n};



my %spritesHashExport;
my @recentSprites;
my %groupsHashExport;

if($noscript ne "true" && $nocss ne "true"){
    foreach my $keyID (sort {$spritesHash->{$b}{created_time} <=> $spritesHash->{$a}{created_time}} (keys %$spritesHash)) {
				if($keyID ne ""){
						push(@recentSprites, $keyID);
						if(scalar(@recentSprites) >= 5){
								last;
						}
				}
		}

		if($tempSpritesHash ne ""){
				foreach my $keyID (keys %{$tempSpritesHash}){
						if($keyID ne ""){
								$spritesHashExport{$keyID}{template} = 1;
								if(scalar($publish) == 1){
										if($tempSpritesHash->{$keyID}{margin_s}){
												$spritesHashExport{$keyID}{margin_s} = $tempSpritesHash->{$keyID}{margin_s};
										}
								}
								
								if($tempSpritesHash->{$keyID}{inlink}){
										$spritesHashExport{$keyID}{inlink} = $tempSpritesHash->{$keyID}{inlink};
								}

								if($tempSpritesHash->{$keyID}{outlink}){
										$spritesHashExport{$keyID}{outlink} = $tempSpritesHash->{$keyID}{outlink};
								}

								my $utfAuthor = $tempSpritesHash->{$keyID}{author_name};
								utf8::decode($utfAuthor);
								$spritesHashExport{$keyID}{author} = $utfAuthor;
								$spritesHashExport{$keyID}{created_time} = $tempSpritesHash->{$keyID}{created_time};
								if(exists($tempSpritesHash->{$keyID}{src})){
										$spritesHashExport{$keyID}{src} = $tempSpritesHash->{$keyID}{src};
								}

								if($positlogMode eq "EditMode"){

										my $utfTag = "";
										foreach my $tag (keys %{$tempSpritesHash->{$keyID}{tags}}){
												$utfTag .= $tag . ", ";
										}
										if($utfTag ne ""){
												chop($utfTag);
												chop($utfTag);
												$spritesHashExport{$keyID}{tag} = $utfTag;
										}
										$spritesHashExport{$keyID}{display}{author} = $tempSpritesHash->{$keyID}{display_author};
										$spritesHashExport{$keyID}{display}{created_time} = $tempSpritesHash->{$keyID}{display_created_time};
										$spritesHashExport{$keyID}{display}{uri} = $tempSpritesHash->{$keyID}{display_uri};
										$spritesHashExport{$keyID}{display}{tag} = $tempSpritesHash->{$keyID}{display_tag};
								}


								if(!exists($spritesHashExport{$keyID})){
										# $spritesHashExport{$keyID} cannot be empty
										$spritesHashExport{$keyID}{1} = 1;
								}
						}
				}
		}

		foreach my $keyID (keys %{$spritesHash}){
				if($keyID ne ""){
						if(scalar($publish) == 1){
								if($spritesHash->{$keyID}{margin_s}){
										$spritesHashExport{$keyID}{margin_s} = $spritesHash->{$keyID}{margin_s};
								}
						}
						
						if($spritesHash->{$keyID}{inlink}){
								$spritesHashExport{$keyID}{inlink} = $spritesHash->{$keyID}{inlink};
						}

						if($spritesHash->{$keyID}{outlink}){
								$spritesHashExport{$keyID}{outlink} = $spritesHash->{$keyID}{outlink};
						}

						my $utfAuthor = $spritesHash->{$keyID}{author_name};
						utf8::decode($utfAuthor);
						$spritesHashExport{$keyID}{author} = $utfAuthor;
						$spritesHashExport{$keyID}{created_time} = $spritesHash->{$keyID}{created_time};
						if(exists($spritesHash->{$keyID}{src}) && $spritesHash->{$keyID}{src} ne  ""){
								$spritesHashExport{$keyID}{src} = $spritesHash->{$keyID}{src};
						}


						if($positlogMode eq "EditMode"){
								my $utfTag = "";
								foreach my $tag (keys %{$spritesHash->{$keyID}{tags}}){
										$utfTag .= $tag . ", ";
								}
								if($utfTag ne ""){
										chop($utfTag);
										chop($utfTag);
										$spritesHashExport{$keyID}{tag} = $utfTag;
								}
								$spritesHashExport{$keyID}{display}{author} = $spritesHash->{$keyID}{display_author};
								$spritesHashExport{$keyID}{display}{created_time} = $spritesHash->{$keyID}{display_created_time};
								$spritesHashExport{$keyID}{display}{uri} = $spritesHash->{$keyID}{display_uri};
								$spritesHashExport{$keyID}{display}{tag} = $spritesHash->{$keyID}{display_tag};
						}

						if(!exists($spritesHashExport{$keyID})){
								# $spritesHashExport{$keyID} cannot be empty
								$spritesHashExport{$keyID}{1} = 1;
						}
				}
		}

		my $groupsHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/groups.dat")};
		foreach my $gid (keys %$groupsHash){
				$groupsHashExport{$gid} = $groupsHash->{$gid}{items};
				if(scalar($publish) == 1){
						if($groupsHash->{$gid}{margin_s}){
								$groupsHashExport{$gid}{margin_s} = $groupsHash->{$gid}{margin_s};
						}
				}
		}
}



my $worldWidth = "100%";
my $worldHeight = "100%";
my $minLeft = 1000000;
my $minTop = 1000000;

my $SPRITESLIST = "";
# attention!! 
#if($noscript eq "true" || $pageType eq "document" || $spriteslistvisible eq "true"){
if($spriteslistvisible eq "true" || $noscript eq "true" || $printable eq "true"){
		my $maxRight = -1000000;
		my $maxBottom = -1000000;
		if($tempSpritesHash ne ""){
				foreach my $sid (keys %{$tempSpritesHash}){
						my $x = $tempSpritesHash->{$sid}{left};
						if($minLeft > $x){
								$minLeft = $x;
						}
						$x += $tempSpritesHash->{$sid}{width};
						if($maxRight < $x){
								$maxRight = $x;
						}
						my $y = $tempSpritesHash->{$sid}{top};
						if($minTop > $y){
								$minTop = $y;
						}
						$y += $tempSpritesHash->{$sid}{height};
						if($maxBottom < $y){
								$maxBottom = $y;
						}
				}
		}
		foreach my $sid (keys %{$spritesHash}){
				my $x = $spritesHash->{$sid}{left};
				if($minLeft > $x){
						$minLeft = $x;
				}
				$x += $spritesHash->{$sid}{width};
				if($maxRight < $x){
						$maxRight = $x;
				}
				my $y = $spritesHash->{$sid}{top};
				if($minTop > $y){
						$minTop = $y;
				}
				$y += $spritesHash->{$sid}{height};
				if($maxBottom < $y){
						$maxBottom = $y;
				}
		}

		$worldWidth = $maxRight - $minLeft;
		if($minLeft > 0){
				$minLeft = 0;
				$worldWidth = $maxRight;
		}
		else{
				$minLeft = -$minLeft;
		}
		$minLeft += 30;
		$worldWidth += 60;
		$worldHeight = $maxBottom - $minTop;
		if($minTop > 0){
				$minTop = 0;
				$worldHeight = $maxBottom;
		}
		else{
				$minTop = -$minTop;
		}
		$minTop += 30;
		$worldHeight += 60;

		$worldWidth .= "px";
		$worldHeight .= "px";

#		$SPRITESLIST .= "\n<div id='spriteslist' style='left:" . $minLeft . "px; top:" . $minTop . "px;";
		$SPRITESLIST .= "\n<div id='spriteslist' style='left:0px; top:0px;";
}
elsif($nocss eq "true"){
		$SPRITESLIST .= "\n<div id='spriteslist' style='left:0px; top:0px;";
}
else{
		$SPRITESLIST .= "\n<div id='spriteslist' style='left:0px; top:0px; visibility:hidden;";
}

$SPRITESLIST .= "'>";

if($noscript eq "true" || $printable eq "true"){
		$SPRITESBODY =~ s/(<div class='sprite'.*?left:)(.*?)(px.*?>)/$1 . (scalar($2) + scalar($minLeft)) .  $3/egi;
		$SPRITESBODY =~ s/(<div class='sprite'.*?top:)(.*?)(px.*?>)/$1 . (scalar($2) + scalar($minTop)) .  $3/egi;
}


# add spritesworld (root node of sprites)
my $borderTop = "0px";
# background-color is needed for changing mouse cursor in spritesworld area on IE6
my $SPRITESWORLD = "";
$SPRITESWORLD .= "\n\n<div id='spritesworld' style='z-index: 0; left: 0px; top: " . $worldTop . "px; width:" . $worldWidth . "; height:" . $worldHeight ."; border-top:" . $borderTop .  ";";

if($nocss ne "true"){
		my $background_image = $pages->{$pageid}{'background_image'};
		if($background_image ne ""){
				$SPRITESWORLD .= "background-image:url(\"" . $PositLogConfig::bgimagesurl . $background_image . "\");";
		}
		else{
				$SPRITESWORLD .= "background-image:url(\"" . $PositLogConfig::systempath . "images/transbg.gif\");";
		}
}
$SPRITESWORLD .= "background-position:0px 0px;";

$SPRITESWORLD .= "'>";



if($noscript ne "true" && $nocss ne "true"){
		$HEADER1 .= "\n\n<script type='text/javascript'>\n<!--\n";
		$HEADER1 .= "var PARAM = new Object(); ";
		if($forceload eq "true"){
				$HEADER1 .= "PARAM.forceload = " . $forceload . "; ";
		}
		$HEADER1 .= "PARAM.printable=" . $printable ."; ";
		if($positlogMode eq "EditMode"){
				$HEADER1 .= "PARAM.editorType=" . $pages->{$pageid}{editor_type} . "; ";
				$HEADER1 .= "PARAM.filesecure=" . $PositLogConfig::filesecure ."; ";
				$HEADER1 .= "PARAM.permissionLevel=" . $permissionLevel . "; ";
				$HEADER1 .= "PARAM.sprite_autolink=" . $sprite_autolink ."; ";
				$HEADER1 .= "PARAM.create_page=" . $authObj->canCreatePage($pageid) ."; ";

				if($pages->{$pageid}{editor_type} == $PositLogParam::RICH_EDITOR){
						$HEADER1 .= "PARAM.FCKUPLOADURL='" . $PositLogConfig::fckuploadurl ."'; ";
						$HEADER1 .= "PARAM.FCKCONNECTOR='" . $PositLogConfig::fckconnector ."'; ";
						$HEADER1 .= "PARAM.FCKUPLOADER='" . $PositLogConfig::fckuploader ."'; ";
				}
				
				$HEADER1 .= "PARAM.ADMINTOOLSCGIPATH='" . $PositLogConfig::admintoolscgipath ."'; ";
#				$HEADER1 .= "PARAM.HELPURL='" . $PositLogConfig::helpurl ."'; ";
		}
		if(exists($pages->{$pageid}{homeposition}) && $printable ne "true"){
				$HEADER1 .= "PARAM.homeposition=" . $pages->{$pageid}{homeposition} . "; ";
		}
		else{
				$HEADER1 .= "PARAM.homeposition=''; ";
		}
		$HEADER1 .= "PARAM.mod_rewrite=" . $PositLogConfig::mod_rewrite ."; ";

		my $spritesHashJSON = JSON::to_json(\%spritesHashExport);
		$HEADER1 .= "PARAM.sprites=" . $spritesHashJSON . "; ";
		my $groupsHashJSON = JSON::to_json(\%groupsHashExport);
		if($groupsHashJSON eq ""){
				$groupsHashJSON = "{}";
		}
		$HEADER1 .= "PARAM.groups=" . $groupsHashJSON. "; ";
		my $recentSpritesJSON = JSON::to_json(\@recentSprites);
		$HEADER1 .= "PARAM.recentSprites=" . $recentSpritesJSON . "; ";
		$HEADER1 .= "PARAM.pageid='" . $pageid ."'; ";
		if($arg_vp ne ""){
				$HEADER1 .= "\nPARAM.vp='" . $arg_vp ."'";
		}
		if($arg_zoom ne ""){
				$HEADER1 .= "\nPARAM.zoom='" . $arg_zoom ."'";
		}
		$HEADER1 .= "\nPARAM.p='" . $arg_p ."'; ";
		$HEADER1 .= "PARAM.id='" . $arg_id ."'; ";
		$HEADER1 .= "PARAM.edge='" . $arg_edge ."'; ";
		$HEADER1 .= "PARAM.positlogMode='" . $positlogMode ."'; ";
		$HEADER1 .= "PARAM.ROOTURL='" . $PositLogConfig::rooturl ."'; ";
		$HEADER1 .= "PARAM.SYSTEMPATH='" . $PositLogConfig::systempath ."'; ";
		$HEADER1 .= "PARAM.CGIFILEPATH='" . $PositLogConfig::cgipath ."'; ";
		$HEADER1 .= "PARAM.DATAFILEPATH='" . $PositLogConfig::datapath ."'; ";

		$HEADER1 .= "PARAM.page_type='" . $pageType ."'; ";
		$HEADER1 .= "PARAM.publish=" . $publish . "; ";
		$HEADER1 .= "PARAM.language='" . $PositLogConfig::language . "'; ";
		$HEADER1 .= "PARAM.currentversion=" . $PositLogParam::version . "; ";

		if($authObj->isAdminUser){
				$HEADER1 .= "PARAM.author='admin'; ";
		}
		else{
				$HEADER1 .= "PARAM.author='" . $loginid . "'; ";
		}

		$HEADER1 .= "\n// -->\n</script>\n";

		# This css is needed for smooth scroll of fixed element when 'fixed' is emulated by using style.setExpression.
		$HEADER1 .= "<!--[if lt IE 7]><style type='text/css'> body { background: url(null) fixed; } </style> <![endif]-->\n";

		# This css is needed for hide overflowed looooooong word on IE6
		$HEADER1 .= "<!--[if lt IE 7]><style type='text/css'> #spritesworld div.sprite div.region { overflow: hidden; } </style> <![endif]-->\n";

		# excanvas.js is emulation of canvas element.
		$HEADER1 .= "<!--[if IE]><script type='text/javascript' src='" . $PositLogConfig::systempath . "excanvas.js'></script><![endif]-->\n";

#		$HEADER1 .= "<script language='javascript' type='text/javascript' src='system/firebug/firebug.js'></script>";

		# positlog.js is main system script.
		$HEADER1 .= "<script type='text/javascript' src='" .  $PositLogConfig::systempath . "positlog.js' charset='UTF-8'></script>\n";

		if($positlogMode eq "EditMode"){
				$HEADER1 .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "i18n/lang_" . $PositLogConfig::language . ".js' charset='UTF-8'></script>\n";

				if($pages->{$pageid}{editor_type} == $PositLogParam::RICH_EDITOR){
						$HEADER1 .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "fckeditor/fckeditor.js'></script>\n";
				}
				elsif($pages->{$pageid}{editor_type} == $PositLogParam::WIKI_EDITOR){
						$HEADER1 .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "wiky/wiky.js'></script>\n";
						$HEADER1 .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "wiky/wiky.lang.js'></script>\n";
						$HEADER1 .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "wiky/wiky.math.js'></script>\n";
				}
				$HEADER1 .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "edit.js' charset='UTF-8'></script>\n";
		}
}

if($nocss ne "true"){
		my $CSSHEADER2 = "		<link rel='stylesheet' href='" . $PositLogConfig::systempath . "css/positlog.css' type='text/css'>\n";

		$CSSHEADER2 .= "		<link rel='stylesheet' href='" . $PositLogConfig::systempath . "css/wiky/wiky.css' type='text/css'>\n";
		$CSSHEADER2 .= "		<link rel='stylesheet' href='" . $PositLogConfig::systempath . "css/wiky/wiky.lang.css' type='text/css'>\n";
		$CSSHEADER2 .= "		<link rel='stylesheet' href='" . $PositLogConfig::systempath . "css/wiky/wiky.math.css' type='text/css'>\n";

		if($positlogMode eq "EditMode"){
				$CSSHEADER2 .= "		<link rel='stylesheet' href='" . $PositLogConfig::systempath . "css/edit.css' type='text/css'>\n";
		}
		$CSSHEADER = $CSSHEADER2 . $CSSHEADER;
}

my $rssinfo = "		<link rel='alternate' title='RSS' href='" . $PositLogConfig::cgipath . "pagerss.cgi?load=" . $rsspageid . "' type='application/rss+xml'>\n";
if($permissionLevel < $PositLogParam::USERLEVEL_READ){
		# No public permission
		$rssinfo = "";
}

my $HEADER2 = "</head>\n";

$pagetitle = "		<title>" . $pagetitle . "</title>\n";

my $HEADER = $HEADER1 . $CSSHEADER .  $pagetitle . $rssinfo . $HEADER2;


# ---------------------------
#    Generate HTML FOOTER
# ---------------------------

my $FOOTER = "<div id='footer' style='display:none;'>";
$FOOTER .= "<span id='footerbg' style='background-color: $footercolor;'>";

$FOOTER .= "<span id='currentposition'> </span>&nbsp;";

$FOOTER .= "<span id='login'>";

if($positlogMode eq "EditMode"){
		if($PositLogConfig::mod_rewrite == 1){
				$FOOTER .= "<span id='changemode'><a href='./" . $pageid . ".html'>[View]</a></span>";
		}
		else{
				$FOOTER .= "<span id='changemode'><a href='./positlog.cgi?load=" . $pageid . "'>[View]</a></span>";
		}
}
elsif($positlogMode eq "ViewMode"){
		if($permissionLevel >= $PositLogParam::USERLEVEL_EDIT){
				$FOOTER .= "<span id='changemode'><a href='./positlog.cgi?load=" . $pageid . "&amp;mode=EditMode'>[Edit]</a></span>";
		}
#		$FOOTER .= "<a href='./positlog.cgi?load=" . $pageid . "&amp;print=true'>[Print]</a>";
}

if($loginid ne "public"){
    $FOOTER .= "<a href='./positlog.cgi?load=" . $pageid . "&amp;mode=Logout'>[Logout]</a>";
    $FOOTER .= "<a href='" . $PositLogConfig::admintoolscgipath . "admin.cgi'>[Admin]</a>";
}
else{
    $FOOTER .= "<a href='./positlog.cgi?load=" . $pageid . "&amp;mode=Login'>[Login]</a>";
}

$FOOTER .= "&nbsp;";
$FOOTER .= "</span>";
$FOOTER .= "<span id='zoom'> </span></span>";
$FOOTER .= "</div>\n\n";

#$FOOTER .= "<div id='zoomcaption' style='visibility: hidden'>Mouse wheel to zoom</div>";

$FOOTER .= "<canvas id='mapcanvas' width='200' height='200'></canvas>";
$FOOTER .= "<canvas id='viewcanvas' width='200' height='200'></canvas>";

# Set home.gif here.
# Using background-image causes frequent reload of home.gif on IE6.
$FOOTER .= q{<div id='homebtn' style='background-color: #EFECDE;' onmouseover="this.style.backgroundColor='#ffffff'" onmouseout="this.style.backgroundColor='#EFECDE'" onclick="PLG.moveToHomePosition()" title='Back to home position'><img  id='homebtnicon' src='} . $PositLogConfig::systempath . q{/images/home.gif' width='30' height='20'></div>};

$FOOTER .= "<div id='zoomscalerarea'>";
$FOOTER .= "<div id='zoomscaler'></div>";
$FOOTER .= "<div id='zoompointer'></div>";
$FOOTER .= "<div id='x1btn'></div>";

$FOOTER .= "</div>";

my $CLOSE .= "</body>\n</html>";


# Print out

if($noscript eq "true" || $nocss eq "true"){
		my $out = $HEADER . $BODYELM . $BODY . $SPRITESWORLD . $SPRITESLIST . $SPRITESBODY . $BODY2 . $CLOSE;
		utf8::encode($out);

		print $out;
}
else{
		my $out = $HEADER . $BODYELM . $FOOTER . $BODY . $SPRITESWORLD . $SPRITESLIST . $SPRITESBODY. $BODY2 . $CLOSE;
		utf8::encode($out);

		print $out;
}
