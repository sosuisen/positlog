#!/usr/bin/perl

# --------------------------------------------------------
# saveSprite.cgi:
#      cgi for saving sprites
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------


use lib qw(./extlib);

use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve lock_nstore);   # is default library (upper perl 5.8)
use JSON;
use PositLogAuth;
use PositLogConfig;
use PositLogLink;
use PositLogParam;

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8');

my $pageid = $CGI->param("pageid");

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
my $loginid = $CGI->cookie("loginid") || "public";
my $loginpass = $CGI->cookie("loginpass") || "";

my $saveObjArrayJSON = $CGI->param("saveObj");
my $saveObjArray = [];
if($saveObjArrayJSON ne ""){
		$saveObjArray = from_json($saveObjArrayJSON);
}

my $groupObjJSON = $CGI->param("groupObj");
my $groupObj = {};
if($groupObjJSON ne ""){
		$groupObj = from_json($groupObjJSON);
}

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
if($@){	print "Cannot read sprites.dat.\n"; exit(0); }

my $public_password = "";
my $public_author = "";

foreach my $saveObj (@$saveObjArray){
		my $linkingCommand = $saveObj->{linkCommand};
		$public_password = $saveObj->{public_password};
		$public_author = $saveObj->{public_author};
		$public_author =~ tr/+/ /;
		$public_author =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;
		my $spriteID = $saveObj->{id};

    # Create new sprite if needed
		if(!exists($spritesHash->{$spriteID})){
				$spritesHash->{$spriteID}{author_id} = $loginid;
				$spritesHash->{$spriteID}{created_time} = $saveObj->{createdtime};
				$spritesHash->{$spriteID}{public_password} = "";
		}


		my $srcID = $saveObj->{srcid};
		my $sprite_plugin = $saveObj->{pluginEnc};
		$sprite_plugin =~ tr/+/ /;
		$sprite_plugin =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;

    # $contents can be "". This means not to change contents.
		my $contents = $saveObj->{innerHTMLPost};
		$contents =~ tr/+/ /;
		$contents =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;

		my $attachedfilename = $saveObj->{attachedfilenamepost};
		$attachedfilename =~ tr/+/ /;
		$attachedfilename =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;

		my $displayTime = $saveObj->{showTimeFlag};
		my $displayAuthor = $saveObj->{showAuthorFlag};
		my $displayUri = $saveObj->{showUriFlag};
		my $displayTag = $saveObj->{showTagFlag};


		my ($result, $errormsg) = $authObj->canEditItem($spritesHash, $pageid, $spriteID, $public_password);
		if($result != 1){
				print $errormsg;
				exit(0);
		}

		if($spritesHash->{$spriteID}{author_id} eq "public"){
				if($spritesHash->{$spriteID}{public_password} eq ""){
						if($public_password ne ""){
								my $salt="zi";
								$spritesHash->{$spriteID}{public_password} = crypt($public_password, $salt);
						}
				}

				$public_author =~ s/^\<(.+)\>$/$1/;
				$public_author =~ s/^&lt;(.+)&gt;$/$1/;
				$public_author =~ s/^\[(.+)\]$/$1/;
				$spritesHash->{$spriteID}{public_author} = $public_author;
		}


# Save properties
		$spritesHash->{$spriteID}{left} = $saveObj->{left};
		$spritesHash->{$spriteID}{top} = $saveObj->{top};
		$spritesHash->{$spriteID}{width} = $saveObj->{width};
		$spritesHash->{$spriteID}{height} = $saveObj->{height};
		$spritesHash->{$spriteID}{zIndex} = $saveObj->{zIndex};

		$spritesHash->{$spriteID}{borderWidth} = $saveObj->{borderWidth};
		$spritesHash->{$spriteID}{borderStyle} = $saveObj->{borderStyle};
		$spritesHash->{$spriteID}{padding} = $saveObj->{padding};
		$spritesHash->{$spriteID}{borderColor} = $saveObj->{borderColor};
		$spritesHash->{$spriteID}{bgColor} = $saveObj->{bgColor};
		$spritesHash->{$spriteID}{color} = $saveObj->{color};

		$spritesHash->{$spriteID}{src} = $saveObj->{src};

# Link
		if($linkingCommand ne ""){
				my @commandList = split(/;/, $linkingCommand);
				my $result = PositLogLink::execCommand($spritesHash, \@commandList);
		}

		my $isDrawing = 0;
		if($contents =~ /^<canvas.+?><\/canvas><script type=['"]text\/javascript['"]>\n<!--\nPLG.draw(.+?);\n\/\/ -->\n<\/script>$/){
				$isDrawing = 1;
		}

# HTML or plain text processing
		if($permissionLevel >= $PositLogParam::USERLEVEL_SUPER || $isDrawing){
				# nop
				# All HTML description is available.
		}
		elsif($permissionLevel < $PositLogParam::USERLEVEL_SUPER){
				# Describe Tag check

				#
				#
				#
				#
				#

				if($attachedfilename ne "" && $permissionLevel >= $PositLogParam::USERLEVEL_ATTACH_FILE){
						my $filepath = "";
						if($PositLogConfig::filesecure == 1){
								$filepath = "./";
						}
						else{
								$filepath = $PositLogConfig::datapath;
						}

						$attachedfilename =~ /^(.+?)\((.+?)\)$/i;
						my $filename = $1;
						my $option = $2;

						if($filename =~ /^.+?\.(gif|jpg|jpeg|png)$/i){
								$option =~ /^(.+?)x(.+?)$/i;
								my $imgwidth = $1;
								my $imgheight = $2;
								$contents = "<img alt=\"" . $attachedfilename . "\" src=\"" . $filepath . $pageid . "/Image/" .  $filename . "\" width=\"" .$imgwidth . "\" height=\"" . $imgheight . "\" class=\"attachedimage\">" . $contents;
						}
						else
						{
								$contents = "<a class=\"attachedfile\" title=\"" . $attachedfilename . "\" href=\"" . $filepath . $pageid . "/File/" .  $filename . "\">" . $filename . "</a>" . $contents;
						}
				}
		}

# Change modified time
		my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
		my $time = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
		$spritesHash->{$spriteID}{modified_time} = $time;
		
		if($spritesHash->{$spriteID}{created_time} eq ""){
				$spritesHash->{$spriteID}{created_time} = $time;
		}

		$pages->{$pageid}{modified_time} = $time;



		# Tags

		my $sprite_tag = $saveObj->{tag};
		$sprite_tag =~ tr/+/ /;
		$sprite_tag =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;
		utf8::decode($sprite_tag);
		my @newTags = split(/,/, $sprite_tag);

		my @oldTags = keys %{$spritesHash->{$spriteID}{tags}};
		my $tagModified = 0;
		foreach my $tag (@oldTags){
				my @match = grep( /^$tag$/, @newTags );
				if(scalar(@match) == 0){
						$tagModified = 1;
						delete $spritesHash->{$spriteID}{tags}{$tag};

						delete $tags->{$tag}{pages}{$pageid}{$spriteID};
						if(scalar(keys %{$tags->{$tag}{pages}{$pageid}}) == 0){
								delete $tags->{$tag}{pages}{$pageid};
						}
						if(scalar(keys %{$tags->{$tag}{pages}}) == 0){
								delete $tags->{$tag};
						}
				}
		}

		foreach my $tag (@newTags){
				if($tag =~ /^\s+$/gi || $tag eq ""){
						next;
				}
				if(!exists($tags->{$tag})){
						$tags->{$tag}{created_time} = $time;
				}
				if(scalar(@oldTags) == scalar(@newTags)
					 && $tagModified == 0){
						# not modified
				}
				else{
						$tags->{$tag}{modified_time} = $time;
				}
				$spritesHash->{$spriteID}{tags}{$tag} = 1;
				$tags->{$tag}{pages}{$pageid}{$spriteID} = 1;
		}


# Change display mode

# This is safer than $spritesHash->{$spriteID}{display_created_time} = scalar($displayTime);
		if(scalar($displayTime)){
				$spritesHash->{$spriteID}{display_created_time} = 1;
		}
		else{
				$spritesHash->{$spriteID}{display_created_time} = 0;
		}
		
		if(scalar($displayAuthor)){
				$spritesHash->{$spriteID}{display_author} = 1;
		}
		else{
				$spritesHash->{$spriteID}{display_author} = 0;
		}

		if(scalar($displayUri)){
				$spritesHash->{$spriteID}{display_uri} = 1;
		}
		else{
				$spritesHash->{$spriteID}{display_uri} = 0;
		}

		if(scalar($displayTag)){
				$spritesHash->{$spriteID}{display_tag} = 1;
		}
		else{
				$spritesHash->{$spriteID}{display_tag} = 0;
		}

# Save plugin and metadata
		if($permissionLevel >= $PositLogParam::USERLEVEL_SUPER || $isDrawing){
				$spritesHash->{$spriteID}{plugin} = $sprite_plugin;
		}

# Save .spr
		if($contents ne ""){
				if(!eval{Storable::lock_nstore \$contents, $PositLogConfig::datapath . $pageid . "/static/" . $spriteID . ".spr"}){ warn "Cannot write " . $spriteID . ".spr.\n"; exit(0); }
		}
}

my $groupsHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/groups.dat")} or {};
if($groupsHash eq ""){
		%$groupsHash = ();
}

foreach my $gid (keys %$groupObj){
		if($gid =~ /^spr/ || $gid =~ /^grp/){
				$groupsHash->{$gid}{author_id} = $loginid;
				if($loginid eq "public"){
						$groupsHash->{$gid}{public_author} = $public_author;
						my $salt="zi";
						$groupsHash->{$gid}{public_password} = crypt($public_password, $salt);
				}
				foreach my $id (keys %{$groupObj->{$gid}}){
						if($id =~ /^spr/ || $id =~ /^grp/){
								$groupsHash->{$gid}{items}{$id} = {};
						}
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

if(!eval{Storable::lock_nstore $groupsHash, $PositLogConfig::datapath . $pageid . "/groups.dat"}){
		warn "Cannot write groups.dat.\n";	exit(0);
}

if(!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
		warn "Cannot write sprites.dat.\n"; exit(0);
}

if(!eval{Storable::lock_nstore $pages, $PositLogConfig::adminpath . "pages.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "pages.dat";
		exit(0);
}

if(!eval{Storable::lock_nstore $tags, $PositLogConfig::adminpath . "tags.dat"}){
		warn "Cannot write " . $PositLogConfig::adminpath . "tags.dat";
		exit(0);
}

print "saved\n";

