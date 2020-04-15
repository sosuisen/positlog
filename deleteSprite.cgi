#!/usr/bin/perl

# --------------------------------------------------------
# deleteSprite.cgi:
#      cgi for deleting Sprite
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(./extlib);

use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve);			# is default library (upper perl 5.8)
use PositLogAuth;
use PositLogConfig;
use PositLogLink;
use PositLogParam;
use JSON;

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8'); # HTTP header

my $public_password = $CGI->param("public_password");
my $pageid = $CGI->param("pageid");

my $itemIDs = $CGI->param("ids");

my $linkingCommand = $CGI->param("linking");

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

my $tags = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "tags.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "tags.dat"; exit(0); }

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }
my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages);

if($authObj->isAdminUser){
		$loginid = "admin";
}
my $permissionLevel = $authObj->getPermissionLevel($pageid);
if($permissionLevel < $PositLogParam::USERLEVEL_EDIT){
		print "Permission denied\n";
    exit(0);
}

my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
if($@){ print "Cannot read sprites.dat.\n"; exit(0); }

my $groupsHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/groups.dat")} or {};
if($groupsHash eq ""){
		%$groupsHash = ();
}

my @itemList = split( /;/ , $itemIDs );
if($#itemList == 0){
		push(@itemList, $itemIDs);
}

# Pre-process
foreach my $itemID (@itemList){
		# Expand group
		if($itemID =~ /^grp.+$/){
				if($groupsHash->{$itemID}){
						foreach my $id (keys %{$groupsHash->{$itemID}{items}}){
								push(@itemList, $id);
						}
				}
				next;
		}

    # Validate
		if($spritesHash->{$itemID}){
				my @tryArray;
				push(@tryArray, $itemID);
				
				if($itemID =~ /^(.+)_(.+)_arrow$/){
						push(@tryArray,$1);
						push(@tryArray,$2);
				}
				
				foreach my $tryid (@tryArray){
						my ($result, $errormsg) = $authObj->canEditItem($spritesHash, $pageid, $tryid, $public_password);
						if($result != 1){
								print $errormsg;
								exit(0);
						}
				}
		}
		else{
				print "Invalid sprite: $itemID\n";
				exit(0);
		}
}


if($linkingCommand ne ""){
		my @commandList = split(/;/, $linkingCommand);
		PositLogLink::execCommand($spritesHash, \@commandList);
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

foreach my $itemID (@itemList){
		if (-f $PositLogConfig::datapath . $pageid . "/static/" . $itemID.".spr"){
				unlink $PositLogConfig::datapath . $pageid . "/static/" . $itemID.".spr";
		}

		my @deleteArray = ($itemID);
		my %replaceHash;
		while(@deleteArray){
				my $item = pop(@deleteArray);
				foreach my $gid (keys %$groupsHash){
						if(exists $groupsHash->{$gid}{items}{$item}){
								delete $groupsHash->{$gid}{items}{$item};
								if(exists $replaceHash{$gid}){
										$groupsHash->{$gid}{items}{$replaceHash{$gid}} = {};
								}
								if(scalar(keys %{$groupsHash->{$gid}{items}}) == 1){
										# Delete group if it contains only one item
										push(@deleteArray, $gid);
										my @tmpArray = (keys %{$groupsHash->{$gid}{items}});
										$replaceHash{$gid} = $tmpArray[0];
										delete $groupsHash->{$gid};
								}
						}
				}
		}

		foreach my $tag (keys %{$spritesHash->{$itemID}{tags}}){
				delete $tags->{$tag}{pages}{$pageid}{$itemID};

				if(scalar(keys %{$tags->{$tag}{pages}{$pageid}}) == 0){
						delete $tags->{$tag}{pages}{$pageid};
				}
				if(scalar(keys %{$tags->{$tag}{pages}}) == 0){
						delete $tags->{$tag};
				}
		}

		delete $spritesHash->{$itemID};
}


if(!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
		warn "Cannot write the sprite list.\n"; exit(0);
}

if(!eval{Storable::lock_nstore $groupsHash, $PositLogConfig::datapath . $pageid . "/groups.dat"}){
		warn "Cannot write groups.dat.\n";	exit(0);
}

my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
$pages->{$pageid}{modified_time} = $time;

if (!eval{Storable::lock_nstore $pages, $PositLogConfig::adminpath . "pages.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "pages.dat";
		exit(0);
}

if(!eval{Storable::lock_nstore $tags, $PositLogConfig::adminpath . "tags.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "tags.dat";
		exit(0);
}


print "succeed\n";
