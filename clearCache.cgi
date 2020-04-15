#!/usr/bin/perl

# --------------------------------------------------------
# clearCache.cgi:
#      cgi for clearing cache of dynamic sprites
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

BEGIN{
		push(@INC, './extlib');
}
use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve lock_nstore);   # is default library (upper perl 5.8)
use PositLogAuth;
use PositLogConfig;

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8'); # HTTP header

my $pageid = $CGI->param("pageid");

my $sourceID = $CGI->param("sourceID");

my $plugin = $CGI->param("plugin");
$plugin =~ /^(.+?),(.+?)$/is;
my $pluginName = $1;
my $args = $2;

# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass);
my $permissionLevel = $authObj->getPermissionLevel($pageid);
if($permissionLevel < $PositLogParam::USERLEVEL_SUPER){
		print "Permission denied\n";
    exit(0);
}

if (-f "./PositLogPlugin/" . $pluginName . "/" . $pluginName . ".pm"){
		my $result = "";
		$result = eval 'use ' . 'PositLogPlugin::' . $pluginName . '::' . $pluginName . ';' . 'PositLogPlugin::' . $pluginName . '::' . $pluginName . '::clearCache("' . $pageid . '","' . $sourceID . '","' . $args . '")';
		print $result . "\n";
}
else{
		print "Invalid plugin name\n";
    exit(0);
}
