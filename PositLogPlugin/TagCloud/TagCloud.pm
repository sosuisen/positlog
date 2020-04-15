package PositLogPlugin::TagCloud::TagCloud;

# --------------------------------------------------------
# TagCloud.pm:
#      module for showing tag cloud
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
	return "TagCloud.css";
}

sub clearCache{
    return "No cache.";
}

sub getSprites{
		my ($self, $sourceID, $argsptr, $templateptr) = @_;

		my %result;

		my $args = $$argsptr;
		my $template = $$templateptr;

		my $pageid = $self->{srcpageid};

    my @argsArray = split(/,/, $args);

		my $maxnumber = 10;
		if (scalar(@argsArray) >= 1) {
				if($argsArray[0] ne ""){
						$maxnumber = $argsArray[0];
				}
		}
		my $spritecolor = "#000000";
		if (scalar(@argsArray) >= 2) {
				if($argsArray[1] ne ""){
						$spritecolor = $argsArray[1];
				}
		}

		my $targetpage = "";
		if (scalar(@argsArray) >= 3) {
				if($argsArray[2] ne ""){
						$targetpage = $argsArray[2];
				}
		}

		my $sortby = "dictionary";
		if (scalar(@argsArray) >= 4) {
				if($argsArray[3] ne ""){
						$sortby = $argsArray[3];
						if($sortby ne "dictionary" && $sortby ne "created_time" && $sortby ne "modified_time" && $sortby ne "count"){
								$sortby = "dictionary";
						}
				}
		}

		my $maxfontsize = 200;
		if (scalar(@argsArray) >= 5) {
				if($argsArray[4] ne ""){
						$maxfontsize = scalar($argsArray[4]);
				}
		}

		my $minfontsize = 70;
		if (scalar(@argsArray) >= 6) {
				if($argsArray[5] ne ""){
						$minfontsize = scalar($argsArray[5]);
				}
		}
		my $secondfontsize = int($maxfontsize * 0.9);

		if($maxfontsize < $minfontsize){
				$maxfontsize = $minfontsize;
		}
		if($secondfontsize < $minfontsize){
				$secondfontsize = $minfontsize;
		}



		my $tags = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "tags.dat")};
		if($@){
				$result{"error"} = "TagCloud.pm: Cannot read " . $PositLogConfig::adminpath . "tags.dat";
				$result{"modified"} = -1;
				return \%result;
		}

		my $newContents = "<div class='tagcloud_contents'>";
		my $maxsize = 0;
		my $secondsize = 0;

		my $pageGroups = "";
		if($targetpage =~ /^pg/){
				$pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
				if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }
		}

		foreach my $tag (keys %$tags){
				my $size = 0;
				foreach my $pid (keys %{$tags->{$tag}{"pages"}}){
						if($targetpage eq ""){
								$size += scalar(keys %{$tags->{$tag}{"pages"}{$pid}});
						}
						elsif($targetpage =~ /^pg/ && $pageGroups->{$targetpage}{"pages"}{$pid} == 1){
								$size += scalar(keys %{$tags->{$tag}{"pages"}{$pid}});
						}
						elsif($targetpage eq $pid){
								$size += scalar(keys %{$tags->{$tag}{"pages"}{$pid}});
						}
				}

				$tags->{$tag}{"size"} = $size;
				if(scalar($maxsize) < scalar($size)){
						$maxsize = $size;
				}
				if(scalar($secondsize) < scalar($size) && $size != $maxsize){
						$secondsize = $size;
				}
		}
		foreach my $tag (keys %$tags){
				my $size = scalar($tags->{$tag}{"size"});
				if(scalar($secondsize) < $size && $size != $maxsize){
						$secondsize = $size;
				}
		}
 
		my $counter = 0;
		
		my @tagArray;
		foreach my $tag (sort {$tags->{$b}{"size"} cmp $tags->{$a}{"size"}} (keys %$tags)){
				if($tags->{$tag}{"size"} == 0){
						next;
				}
				push(@tagArray, $tag);
				$counter++;
				if($counter >= $maxnumber){
						last;
				}
		}

		$spritecolor =~ /\s*\#(\w\w)(\w\w)(\w\w)/i;
		my $red = hex(scalar($1));
		my $green = hex(scalar($2));
		my $blue = hex(scalar($3));
		my $newColor = "";


		my $sizeRed = scalar($red) + int((256-scalar($red)) / 4);
		my $sizeGreen = scalar($green) + int((256-scalar($green)) / 4);
		my $sizeBlue = scalar($blue) + int((256-scalar($blue)) / 4);
		my $sizeColor = "rgb($sizeRed, $sizeGreen, $sizeBlue);";

		my @sortedTags;
		if($sortby eq "dictionary"){
				@sortedTags = sort {$a cmp $b} (@tagArray);
		}
		elsif($sortby eq "created_time"){
				@sortedTags = sort {$tags->{$b}{"created_time"} cmp $tags->{$a}{"created_time"}} (@tagArray);
		}
		elsif($sortby eq "modified_time"){
				@sortedTags = sort {$tags->{$b}{"modified_time"} cmp $tags->{$a}{"modified_time"}} (@tagArray);
		}
		elsif($sortby eq "count"){
				@sortedTags = sort {$tags->{$b}{"size"} <=> $tags->{$a}{"size"}} (@tagArray);
		}

		foreach my $tag (@sortedTags){
				my $fontsize = 100;

				if(scalar($tags->{$tag}{"size"}) == scalar($maxsize)){
						$fontsize = $maxfontsize;
						$newColor = "rgb($red, $green, $blue);";
				}
				else{
						$fontsize = $tags->{$tag}{"size"} / $secondsize * $secondfontsize;
						my $newRed = scalar($red) + int((256-scalar($red)) / 3 * ($secondsize - $tags->{$tag}{"size"}) / $secondsize);
						my $newGreen = scalar($green) + int((256-scalar($green)) / 3  * ($secondsize - $tags->{$tag}{"size"}) / $secondsize);
						my $newBlue = scalar($blue) + int((256-scalar($blue)) / 3  * ($secondsize - $tags->{$tag}{"size"}) / $secondsize);
						$newColor = "rgb($newRed, $newGreen, $newBlue);";
				}
				if($fontsize < $minfontsize){
						$fontsize = $minfontsize;
				}
				my $utftag = $tag;
#				utf8::decode($utftag);
				my $tagenc = $tag;
				$tagenc =~ s/([^\w ])/'%' . unpack('H2', $1)/eg;
				$tagenc =~ tr/ /+/;

				my $tagurl = $PositLogConfig::cgipath . "tag/" . $tagenc;
				if($PositLogConfig::mod_rewrite == 0){
						$tagurl = $PositLogConfig::cgipath . "tag.cgi?tag=" . $tagenc;
				}
				$newContents .= "<span class='tagname' style='font-size:" . $fontsize . "%;'>" . "<a href='" . $tagurl . "' style='color:" . $newColor . "'>" . $utftag . "</a>";
				if($tags->{$tag}{"size"} != 1){
						$newContents .= "<span style='font-size:" . $minfontsize . "%; color:" . $sizeColor . "'>" . $tags->{$tag}{"size"} . "</span>";
				}
				$newContents .= "</span> ";
		}

		my $seemoreurl = $PositLogConfig::cgipath . "tag.cgi?sortby=" .$sortby . "&page=" . $targetpage;
		if($PositLogConfig::mod_rewrite == 0){
				$seemoreurl = $PositLogConfig::cgipath . "tag.cgi?sortby=" . $sortby. "&page=" . $targetpage;
		}
		$newContents .= "  &nbsp;&nbsp;<a href='" . $seemoreurl . "'><span style='color:" . $sizeColor . "'>(See more ...)</span></a>";

		$newContents .= "</div>";

		$template =~ s/\[\[plugin\]\]/$newContents/;

		if(!eval{Storable::lock_nstore \$template, $PositLogConfig::datapath . $pageid . "/static/" . $sourceID.".spr"}) {
				$result{"error"} = "TagCloud.pm: Cannot write " . $pageid . "/static/" . $sourceID .  ".spr";
				$result{"modified"} = -1;
				return \%result;
		}

		$result{"error"} = "";
		$result{"modified"} = -1;
		return \%result;
}

1;
