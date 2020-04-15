#!/usr/bin/perl

# --------------------------------------------------------
# groupSprites.cgi:
#      cgi for grouping sprite 
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(./extlib);

use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve lock_nstore);   # is default library (upper perl 5.8)
use PositLogAuth;
use PositLogConfig;
use PositLogParam;
use JSON;

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8');

my $pageid = $CGI->param("pageid");
my $groupid = $CGI->param("groupid");

my $itemsJSON = $CGI->param("items");
# Be careful that JSON.pm (v2.0) does not accept "".
my $itemsHash = {};
if($itemsJSON ne ""){
		$itemsHash = from_json($itemsJSON);
}

my $marginHashJSON = $CGI->param("margin");
my $marginHash = {};
if($marginHashJSON ne ""){
		$marginHash = from_json($marginHashJSON);
}

my $adjustedTopHashJSON = $CGI->param("adjustedTop");
my $adjustedTopHash = {};
if($adjustedTopHashJSON ne ""){
		$adjustedTopHash = from_json($adjustedTopHashJSON);
}

my $public_password = $CGI->param("public_password");
my $public_author = $CGI->param("public_author");

# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }
my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages);

my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
if($@){	print "Cannot read sprites.dat.\n"; exit(0); }

my $groupsHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/groups.dat")} or {};
if($groupsHash eq ""){
		%$groupsHash = ();
}

if($authObj->isAdminUser){
		$loginid = "admin";
}


# Check permission of sprites
foreach my $itemID (keys %$itemsHash){
		my $hash;
		if($itemID =~ /^spr/){
				if(!exists($spritesHash->{$itemID})){
						print "Invalid sprite: $itemID\n";
						exit(0);
				}
				$hash = $spritesHash;
		}
		elsif($itemID =~ /^grp/){
				if(!exists($groupsHash->{$itemID}{items})){
						print "Invalid group: $itemID\n";
						exit(0);
				}
				$hash = $groupsHash;
		}
		else{
				print "Invalid item: ". $itemID . "\n";
				exit(0);
		}

		my ($result, $errormsg) = $authObj->canEditItem($hash, $pageid, $itemID, $public_password);
		if($result != 1){
				print $errormsg;
				exit(0);
		}
}

# Set author
$groupsHash->{$groupid}{author_id} = $loginid;

if($loginid eq "public"){
		$groupsHash->{$groupid}{public_author} = $public_author;
		my $salt="zi";
		$groupsHash->{$groupid}{public_password} = crypt($public_password, $salt);
}

foreach my $id (keys %{$itemsHash}){
		if($id =~ /^spr/ || $id =~ /^grp/){
				$groupsHash->{$groupid}{items}{$id} = {};
		}
}

# Set adjustedTop
foreach my $id (keys %{$adjustedTopHash}){
		my $item;
		if($id =~ /^spr/){
				$item = $spritesHash->{$id};
		}
		elsif($id =~ /^grp/){
				$item = $groupsHash->{$id};
		}
		$item->{top} = $adjustedTopHash->{$id};
}

foreach my $id (keys %{$marginHash}){
		my $item;
		if($id =~ /^spr/){
				$item = $spritesHash->{$id};
		}
		elsif($id =~ /^grp/){
				$item = $groupsHash->{$id};
		}

		if($marginHash->{$id} eq ""){
				delete $item->{margin_s};
		}
		else{
				$item->{margin_s}{elder} = $marginHash->{$id}{elder};
				$item->{margin_s}{pixel} = $marginHash->{$id}{pixel};
				$item->{margin_s}{position} = $marginHash->{$id}{position};
		}
}

###
foreach my $id (keys %{$itemsHash}){
		my $item;
		if($id =~ /^spr/){
				$item = $spritesHash->{$id};
		}
		elsif($id =~ /^grp/){
				$item = $groupsHash->{$id};
		}

		$item->{top} = scalar($itemsHash->{$id}{y});
		delete $groupsHash->{$groupid}{items}{$id}{y};
}


# Change modified time
my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
$pages->{$pageid}{modified_time} = $time;

if(!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
		print "Cannot write sprites.dat.\n";	exit(0);
}

if(!eval{Storable::lock_nstore $groupsHash, $PositLogConfig::datapath . $pageid . "/groups.dat"}){
		print "Cannot write groups.dat.\n";	exit(0);
}

if (!eval{Storable::lock_nstore $pages, $PositLogConfig::adminpath . "pages.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "pages.dat";
		exit(0);
}

print "succeed\n";
