#!/usr/bin/perl

# --------------------------------------------------------
# savePageProperties.cgi:
#      cgi for saving page properties
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

my $zoom = $CGI->param("zoom");
if($zoom !~ /^([\d\.]+?)$/is && $zoom ne "birdview"){
		print "Invalid zoom value: $zoom\n";
    exit(0);
}

my $vp = $CGI->param("vp");
$vp =~ /^(-?\d+?),(-?\d+?)$/is;
my $vpX = $1;
my $vpY = $2;

if($vpX eq "" || $vpY eq ""){
		print "Invalid view position value: $vp\n";
    exit(0);
}

# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass);
if(!$authObj->isAdminUser && !$authObj->isAuthor($pageid)){
		print "Permission denied\n";
    exit(0);
}

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }

if($zoom eq "birdview"){
		$zoom = q{"birdview"};
}
$pages->{$pageid}{homeposition} = '{"x":' . $vpX . ',"y":' . $vpY . ',"zoom":' . $zoom . "}";

if (!eval{Storable::lock_nstore $pages, $PositLogConfig::adminpath . "pages.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "pages.dat";
		exit(0);
}

print "saved\n";
