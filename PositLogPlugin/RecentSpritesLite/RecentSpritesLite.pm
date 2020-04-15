package PositLogPlugin::RecentSpritesLite::RecentSpritesLite;

# --------------------------------------------------------
# RecentSpritesLite.pm:
#      module for listing recent sprites
#  (tested under perl 5.8.4)
#
# Copyright (c) 2006-2007 Hidekazu Kubota All right reserved
#  <hidekaz@positlog.org> 
#  http://positlog.com/
# --------------------------------------------------------

# --------------------------------------------------------
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use Storable qw(lock_retrieve lock_nstore);
use PositLogConfig;

sub getCSS{
	return "RecentSpritesLite.css";
}

sub clearCache{
    return "No cache.";
}

sub getSprites{
		my ($self, $sourceID, $argsptr, $templateptr) = @_;

		my %result;

		my $args = $$argsptr;
		my $template = $$templateptr;

		my $srcpageid = $self->{srcpageid};
		my $dstpageid = $self->{dstpageid};

    my @argsArray = split(/,/, $args);
    my $maxnumber = 10;
		if (scalar(@argsArray) >= 1) {
				$maxnumber = $argsArray[0];
		}
    my $maxlength = 30;
		if (scalar(@argsArray) >= 2) {
				$maxlength = $argsArray[1];
		}

		my $sortby = "modified_time";
		if (scalar(@argsArray) >= 3) {
				$sortby = $argsArray[2];
				if($sortby ne "created_time" && $sortby ne "modified_time"){
						$sortby = "modified_time";
				}
		}


    my %timeSpriteid = ();

		my $users = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "users.dat")};
		if($@){
				$result{"error"} = "RecentSpritesLite.pm: Cannot read " . $PositLogConfig::adminpath . "users.dat"; 
				$result{"modified"} = -1;
				return \%result;
		}

		my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $dstpageid . "/sprites.dat")};
		if($@){
				$result{"error"} = "RecentSpritesLite.pm: Cannot read " . $dstpageid . "/sprites.dat";
				$result{"modified"} = -1;
				return \%result;
		}

		my $newContents = "";
		$newContents .= "<div class='recentspritelite_contents'>\n<ol>\n";
		my $counter = 0;

		my @spritesArray;
		if($sortby eq "modified_time"){
				@spritesArray = sort { ($spritesHash->{$b}->{"modified_time"}) <=> ($spritesHash->{$a}->{"modified_time"}) } (keys %$spritesHash);
		}
		elsif($sortby eq "created_time"){
				@spritesArray = sort { ($spritesHash->{$b}->{"created_time"}) <=> ($spritesHash->{$a}->{"created_time"}) } (keys %$spritesHash);
		}

    for my $sid (@spritesArray){
				if($sid eq $sourceID){
						next;
				}
				my $time;
				if($sortby eq "modified_time"){
						my $tmpdate = $spritesHash->{$sid}{"modified_time"};
						$tmpdate =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
						$time = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
						# This is ad-hoc i18n. It will be improbed in version 0.61.
						if($PositLogConfig::language eq "en"){
								$time = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
						}
				}
				elsif($sortby eq "created_time"){
						my $tmpdate = $spritesHash->{$sid}{"created_time"};
						$tmpdate =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
						$time = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
						# This is ad-hoc i18n. It will be improbed in version 0.61.
						if($PositLogConfig::language eq "en"){
								$time = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
						}
				}

				my $author_id = $spritesHash->{$sid}{"author_id"};
				my $public_author = $spritesHash->{$sid}{"public_author"};
				my $public_password = $spritesHash->{$sid}{"public_password"};

				my $authorName = "";
				if($author_id eq "admin"){
						$authorName .= "admin";
				}
				else{
						if($author_id eq "public"){
								if($public_password eq ""){
										if($public_author eq "" || $public_author eq "public"){
												$authorName .= "[public]";
										}
										else{
												utf8::decode($public_author);
												$authorName .= '[' . $public_author . ']';
										}
								}
								else{
										if($public_author eq "" || $public_author eq "public"){
												$authorName .= "&lt;public&gt;";
										}
										else{
												utf8::decode($public_author);
												$authorName .= '&lt;' . $public_author . '&gt;';
										}
								}

						}
						else{
								$authorName .= $users->{$author_id}{"nickname"};
								utf8::decode($authorName)
						}
				}

				my $singleContents = "no contents";
				my $contents = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $dstpageid . "/static/" . $sid . ".spr")} or "";
				if($contents ne ""){
						$singleContents = $$contents;
				}
				utf8::decode($singleContents);

				my $replaceStr = "";
				if($sid =~ /_link$/i){
						$replaceStr = "(Arrow)";
				}
				elsif($singleContents =~ /^<canvas/i){
						$replaceStr = "(Drawing)";
				}
				elsif($singleContents =~ /<img/i){
						if($singleContents =~ /alt\s*?=['"]['"]/i){
								if($singleContents =~ /src\s*?=['"].*\/(.+?)['"]/i){
										$replaceStr = $1 . "&nbsp;(Image)";
								}
								else{
										$replaceStr = "(Image)";
								}
						}
						elsif($singleContents =~ /alt\s*?=['"](.+?)['"]/i){
								$replaceStr = $1 . "&nbsp;(Image)";
						}
						elsif($singleContents =~ /src\s*?=['"].*\/(.+?)['"]/i){
								$replaceStr = $1 . "&nbsp;(Image)";
						}
						else{
								$replaceStr = "(Image)";
						}
				}
				$singleContents =~ s/<\/p>/&nbsp;/gis;
				$singleContents =~ s/<.+?>//gis;
				$singleContents =~ s/[\n\r]//gis;
				$singleContents = substr($singleContents, 0, $maxlength);

				my $tryContents = $singleContents;
				$tryContents =~ s/&nbsp;//gis;
				if($tryContents eq "" && $replaceStr =~ /^\(.+\)$/){
						$newContents .= "<li class='recentspritelite_line" . ($counter % 2 + 1) . "'><span class='recentspritelite_header'>" . "<a href='#id_" . $sid . "'>" . $time . "&nbsp;&nbsp;&nbsp;&nbsp;" . $authorName . "</a>&nbsp;" . $replaceStr . "</span></li>\n";
				}
				else{
						if($tryContents eq ""){
								$singleContents = $replaceStr;
						}
						$newContents .= "<li class='recentspritelite_line" . ($counter % 2 + 1) . "'><span class='recentspritelite_header'>" . "<a href='#id_" . $sid . "'>" . $time . "&nbsp;&nbsp;&nbsp;&nbsp;" . $authorName . "</a></span><div class='recentspritelite_body'>" . $singleContents . "</div></li>\n";}

				$counter ++;
				if($counter >= $maxnumber){
						last;
				}
		}
		$newContents .= "\n</ol></div>";

		$template =~ s/\[\[plugin\]\]/$newContents/;

		if(!eval{Storable::lock_nstore \$template, $PositLogConfig::datapath . $srcpageid . "/static/" . $sourceID.".spr"}) {
				$result{"error"} = "RecentSpritesLite.pm: Cannot write " . $srcpageid . "/static/" . $sourceID .  ".spr";
				$result{"modified"} = -1;
				return \%result;
		}

		$result{"error"} = "";
		$result{"modified"} = -1;
		return \%result;
}

1;
