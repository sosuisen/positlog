#!/usr/bin/perl

# --------------------------------------------------------
# fileloader.cgi:
#      cgi for loading files
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use CGI qw/-debug :standard/;
use Storable qw(lock_retrieve lock_nstore);
use PositLogConfig;
use PositLogAuth;
use PositLogParam;

my $CGI = new CGI;
my $pageid = $CGI->param("page");
my $path = $CGI->param("path");

if($pageid eq "" || $path eq ""){
    exit(0);
}


sub showLoginScreen(){
    my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'\n
   'http://www.w3.org/TR/html4/loose.dtd'>\n
<html lang='" . $PositLogConfig::language . "'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<title>Invalid user</title>\n
	</head>\n";

    my $BODY = "<body onLoad=\"location.href='" . $PositLogConfig::cgipath . "positlog.cgi?load=" . $pageid . "&mode=login'\">\n";
    $BODY .= "<p><a href='" . $PositLogConfig::cgipath . "positlog.cgi?load=" . $pageid . "&mode=login'>Please Login</a>\n</body>\n";

    my $FOOTER = "</html>";
    print "Content-type: text/html\n\n";
    print $HEADER . $BODY . $FOOTER;
    exit(0);
}

my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";
if($loginid eq "" || $loginid eq "public"){
    $loginid = "public";
}

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass);
my $permissionLevel = $authObj->getPermissionLevel($pageid);

if($permissionLevel < $PositLogParam::USERLEVEL_READ){
    &showLoginScreen();
    exit(0);
}

my $fname = $PositLogConfig::datapath . $pageid . $path;
my $type = "";
if($path =~ /^.+\.(gif|jpg|jpeg|png)$/i){
    if($1 eq "jpg"){
				$type = "image/jpeg";
    }
    else{
				$type = "image/" . $1;
    }
}
else{
    $type = "application/octet-stream";
}


open(FILE, $fname) or die;
binmode FILE;
binmode STDOUT;
print "Content-type: " . $type . "\n\n";
print while (<FILE>);
close(FILE);
