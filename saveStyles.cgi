#!/usr/bin/perl

# --------------------------------------------------------
# saveStyles.cgi:
#      cgi for saving styles of Sprite 
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

my $public_password = $CGI->param("public_password");
my $pageid = $CGI->param("pageid");

my $mode = $CGI->param("mode");
my $itemID = $CGI->param("id");
my $left = $CGI->param("left");
my $top = $CGI->param("top");
my $width = $CGI->param("width");
my $height = $CGI->param("height");
my $zIndex = $CGI->param("zIndex");

my $marginHashJSON = $CGI->param("margin");
my $marginHash = {};
# Be careful that JSON.pm (v2.0) does not accept "".
if($marginHashJSON ne ""){
		$marginHash = from_json($marginHashJSON);
}

my $adjustedTopHashJSON = $CGI->param("adjustedTop");
my $adjustedTopHash = {};
if($adjustedTopHashJSON ne ""){
		$adjustedTopHash = from_json($adjustedTopHashJSON);
}

# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }
my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages);

my $permissionLevel = $authObj->getPermissionLevel($pageid);
if($permissionLevel < $PositLogParam::USERLEVEL_EDIT){
		print "Permission denied\n";
    exit(0);
}

my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
if($@){	print "Cannot read sprites.dat.\n"; exit(0); }

my $groupsHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/groups.dat")} or {};
if($groupsHash eq ""){
		%$groupsHash = ();
}


my @itemList;
if($mode eq "single"){
		push(@itemList, $itemID);
}
elsif($mode eq "multiple"){
		@itemList = split( /;/ , $itemID );
}
else{
		print "Invalid mode\n";
		exit(0);
}

foreach my $itemID (@itemList){
		if($itemID =~ /^spr/){
				if(!$spritesHash->{$itemID}){
						print "Invalid sprite: $itemID\n";
						exit(0);
				}
		}
		elsif($itemID =~ /^grp/){
				if($groupsHash->{$itemID}){
						foreach my $id (keys %{$groupsHash->{$itemID}{items}}){
								push(@itemList, $id);
						}
				}
				else{
						print "Invalid group: $itemID\n";
						exit(0);
				}
				next;
		}

		my ($result, $errormsg) = $authObj->canEditItem($spritesHash, $pageid, $itemID, $public_password);
		if($result != 1){
				print $errormsg;
				exit(0);
		}

}


# save styles
if($mode eq "single"){
		$spritesHash->{$itemID}{left} = scalar($left);
		$spritesHash->{$itemID}{top} = scalar($top);
		$spritesHash->{$itemID}{width} = scalar($width);
		$spritesHash->{$itemID}{height} = scalar($height);
		$spritesHash->{$itemID}{zIndex} = scalar($zIndex);
}
elsif($mode eq "multiple"){
		foreach my $id (@itemList){
				if($id =~ /^spr/){
						$spritesHash->{$id}{left} = scalar($left) + scalar($spritesHash->{$id}{left});
						$spritesHash->{$id}{top} = scalar($top) + scalar($spritesHash->{$id}{top});
				}
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

# Set margin
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


# change modified time
my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
#$spritesHash->{$itemID}{modified_time} = $time;
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
