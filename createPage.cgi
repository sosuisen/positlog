#!/usr/bin/perl

# --------------------------------------------------------
# createPage.cgi:
#      cgi for creating new PositLog page
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve lock_nstore);   # is default library (upper perl 5.8)
use PositLogConfig;
use PositLogAuth;
use PositLogParam;


sub deepCopy {
  my $ref = shift;
  if (ref $ref eq 'HASH') {
    my %hash = ();
    scalar keys %$ref;
    while (my($k, $v) = each %$ref) {
      $hash{$k} = &deepCopy($v);
    }
    return \%hash;
  }elsif (ref $ref eq 'ARRAY') {
    my @array = ();
    push @array, &deep_copy($_) for (@$ref);
    return \@array;
  }
  $ref;
}


my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8');  # HTTP header

my $pageid = $CGI->param("pageid"); # id of current page
my $newpagetitle = $CGI->param("newpagetitle"); # title of new page

my $newleft = $CGI->param("left");
my $newtop = $CGI->param("top");


# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";


my $users = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "users.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "users.dat"; exit(0); }
my $userGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "usergroups.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "usergroups.dat"; exit(0); }
my $adminAuth = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "key.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "key.dat"; exit(0); }
my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }
my $pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages, $pageGroups, $users, $userGroups);

if($authObj->isAdminUser){
		$loginid = "admin";
}
my $permissionLevel = $authObj->getPermissionLevel($pageid);
if($loginid eq "" || $loginid eq "public"){
		if($permissionLevel >= $PositLogParam::USERLEVEL_EDIT
				&& scalar($pages->{$pageid}{create_page}) == 1){
				# nop
		}
		else{
				print "Permission denied\n";
				exit(0);
		}
}
elsif($permissionLevel < $PositLogParam::USERLEVEL_EDIT){
		print "Permission denied\n";
    exit(0);
}


my $newpageid = "";

# generate new pageID
my @alpha = ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
do{
		my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst);
		($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
		my $createtime = sprintf("%02d%02d%02d", $year+1900-2000, $mon+1, $mday);
		my $rand = int (rand(52));
		my $rand2 = int (rand(52));
		$newpageid = $createtime . $alpha[$rand] . $alpha[$rand2];
}
while(exists($pages->{$newpageid}));


if(!mkdir($PositLogConfig::datapath . $newpageid, 0755)){
		print "Cannot create a page directory '" . $PositLogConfig::datapath . $newpageid . "'.\n";
		exit(0);
}

if(!mkdir($PositLogConfig::datapath . $newpageid ."/static", 0755)){
		print "Cannot create a static sprite directory in '" . $newpageid . "'.\n";
		exit(0);
}

if(!mkdir($PositLogConfig::datapath . $newpageid ."/dynamic", 0755)){
		print "Cannot create a dynamic sprite directory in '" . $newpageid . "'.\n";
		exit(0);
}

if(!mkdir($PositLogConfig::datapath . $newpageid ."/Image", 0755)){
		print "Cannot create Image directory in '" . $newpageid . "'.\n";
		print "<a href='./pagemanager.cgi'>back</a></div>\n";
		exit(0);
}

if(!mkdir($PositLogConfig::datapath . $newpageid ."/File", 0755)){
		print "Cannot create File directory in '" . $newpageid . "'.\n";
		exit(0);
}


my %spritesHash;
if(!eval{Storable::lock_nstore \%spritesHash, $PositLogConfig::datapath . $newpageid . "/sprites.dat"}){
		print "Cannot create the sprite list.\n";
		exit(0);
}

# Copy properties
$pages->{$newpageid} = deepCopy($pages->{$pageid});


# "public" cannot be an author.
if($loginid eq "" || $loginid eq "public"){
		$pages->{$newpageid}{author_id} = "admin";
		$users->{admin}{authors}{$newpageid} = 1;
}
else{
		$pages->{$newpageid}{author_id} = $loginid;
		$users->{$loginid}{authors}{$newpageid} = 1;
}

$pages->{$newpageid}{name} = $newpagetitle;

my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
$pages->{$newpageid}{created_time} = $time;
$pages->{$newpageid}{modified_time} = $time;

foreach my $gid (keys %{$pages->{$newpageid}{groups}}){
		$pageGroups->{$gid}{pages}{$newpageid} = 1;
}

foreach my $level (keys %{$pages->{$newpageid}{users}}){
		foreach my $uid (keys %{$pages->{$newpageid}{users}{$level}}){
				$users->{$uid}{permissions}{$newpageid} = $level;
		}
}

foreach my $level (keys %{$pages->{$newpageid}{usergroups}}){
		foreach my $ugid (keys %{$pages->{$newpageid}{usergroups}{$level}}){
				$userGroups->{$ugid}{permissions}{$newpageid} = $level;
		}
}

if(!eval{Storable::lock_nstore $users, $PositLogConfig::adminpath . "users.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "users.dat";
		exit(0);
}
if(!eval{Storable::lock_nstore $userGroups, $PositLogConfig::adminpath . "usergroups.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "usergroups.dat";
		exit(0);
}
if(!eval{Storable::lock_nstore $pages, $PositLogConfig::adminpath . "pages.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "pages.dat";
		exit(0);
}
if(!eval{Storable::lock_nstore $pageGroups, $PositLogConfig::adminpath . "pagegroups.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "pagegroups.dat";
		exit(0);
}


my $srcpagetitle = $pages->{$pageid}{name};
# generate link to the src page on the new page
my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
my $createtime = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
my $rand = int (rand(99999999));

my $newSpriteID = "sprite_" . $createtime . "_" . $rand;
my $newContents = "";

if($PositLogConfig::mod_rewrite == 1){
		$newContents = "<a href='" . $PositLogConfig::cgipath . $pageid . ".html'>" . $srcpagetitle . "</a>";
}
else{
		$newContents = "<a href='" . $PositLogConfig::cgipath . "positlog.cgi?load=". $pageid . "'>" . $srcpagetitle . "</a>";
}

if(!eval{Storable::lock_nstore \$newContents, $PositLogConfig::datapath . $newpageid . "/static/" . $newSpriteID . ".spr"}){
		warn "Cannot write " . $newSpriteID . ".spr.\n"; exit(0);
}

my %spritesHash2;

$spritesHash2{$newSpriteID}{author_id} =	$loginid;

$spritesHash2{$newSpriteID}{left} = "20";
$spritesHash2{$newSpriteID}{top} = "20";
$spritesHash2{$newSpriteID}{width} = "120";
$spritesHash2{$newSpriteID}{height} = "20";
$spritesHash2{$newSpriteID}{zIndex} = "500000";

$spritesHash2{$newSpriteID}{borderWidth} = "1";
$spritesHash2{$newSpriteID}{borderStyle} = "solid";
$spritesHash2{$newSpriteID}{padding} = "0";
$spritesHash2{$newSpriteID}{borderColor} = "#a0a0a0";
$spritesHash2{$newSpriteID}{bgColor} = "#ffffff";
$spritesHash2{$newSpriteID}{color} = "#000000";

$spritesHash2{$newSpriteID}{src} = "";

$spritesHash2{$newSpriteID}{public_password} = "";
$spritesHash2{$newSpriteID}{modified_time} = $createtime;
$spritesHash2{$newSpriteID}{created_time} = $createtime;

$spritesHash2{$newSpriteID}{display_created_time} = 0;
$spritesHash2{$newSpriteID}{display_author} = 0;
$spritesHash2{$newSpriteID}{display_uri} = 0;
$spritesHash2{$newSpriteID}{display_tag} = 0;


if(!eval{Storable::lock_nstore \%spritesHash2, $PositLogConfig::datapath . $newpageid . "/sprites.dat"}){
		print "Cannot write sprites.dat.\n";
		exit(0);
}

print "succeed,$newpageid\n";
