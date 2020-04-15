package PositLogPlugin::PageList::PageList;

# --------------------------------------------------------
# PageList.pm:
#      module for listing pages
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
	return "";
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
		
		my $sortby = "dictionary";
		if (scalar(@argsArray) >= 1) {
				$sortby = $argsArray[0];
				if($sortby ne "dictionary" && $sortby ne "created_time" && $sortby ne "modified_time" && $sortby ne "count"){
						$sortby = "dictionary";
				}
		}

    my $pagegroupid = "all";
		if (scalar(@argsArray) >= 2) {
				if($argsArray[1] ne ""){
						$pagegroupid = $argsArray[1];
				}
		}

    my $maxnumber = -1;
		if (scalar(@argsArray) >= 3) {
				if($argsArray[2] ne ""){
						$maxnumber = scalar($argsArray[2]);
				}
		}

    my $detail = "false";
		if (scalar(@argsArray) >= 4) {
				if($argsArray[3] eq "true"){
						$detail = "true";
				}
		}

		my $pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
		if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }

		my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
		if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }

		my $authObj = new PositLogAuth($PositLogConfig::adminpath, $self->{loginid}, $self->{loginpass}, $pages, $pageGroups);

		my @pageArray;
		my %spriteCount;
		if($sortby eq "count" || ($sortby eq "dictionary" && $detail eq "true")){
				foreach my $pid (keys %{$pageGroups->{$pagegroupid}{"pages"}}){
						my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pid . "/sprites.dat")};
						my @spritesArray = keys %{$spritesHash};
						$spriteCount{$pid} = scalar(@spritesArray);
				}
		}

		if($sortby eq "dictionary"){
				@pageArray = sort {$pages->{$a}{"name"} cmp $pages->{$b}{"name"}} (keys %{$pageGroups->{$pagegroupid}{"pages"}});
		}
		elsif($sortby eq "created_time"){
				@pageArray = sort {$pages->{$b}{"created_time"} cmp $pages->{$a}{"created_time"}} (keys %{$pageGroups->{$pagegroupid}{"pages"}});
		}
		elsif($sortby eq "modified_time"){
				@pageArray = sort {$pages->{$b}{"modified_time"} cmp $pages->{$a}{"modified_time"}} (keys %{$pageGroups->{$pagegroupid}{"pages"}});
		}
		elsif($sortby eq "count"){
				@pageArray = sort {$spriteCount{$b} <=> $spriteCount{$a}} (keys %spriteCount);
		}


		my $newContents = "";
		if($sortby eq "dictionary"){
				$newContents .= "<div class='pagelist_contents'>\n<ul>\n";
		}
		else{
				$newContents .= "<div class='pagelist_contents'>\n<ol>\n";
		}
		my $counter = 0;

    for my $pid (@pageArray){
				if($pid =~ /^pg/){
						next;
				}
				my $permissionLevel = $authObj->getPermissionLevel($pid);
				if($permissionLevel < $PositLogParam::USERLEVEL_READ){
						next;
				}

				my $pagetitle = $pages->{$pid}{"name"};
				utf8::decode($pagetitle);

				my $linkStr = "";
				if($PositLogConfig::mod_rewrite == 1){
						$linkStr = "<a href='./" . $pid . ".html'>";
				}
				else{
						$linkStr = "<a href='./positlog.cgi?load=" . $pid . "'>";
				}

				my $detailedStr = "";
				if($detail eq "true"){
						if($sortby eq "dictionary"){
								my $modified_time = $pages->{$pid}{"modified_time"};
								$modified_time =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
								$modified_time = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
								# This is ad-hoc i18n. It will be improbed in version 0.61.
								if($PositLogConfig::language eq "en"){
										$modified_time = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
								}
								$detailedStr = "&nbsp; (" . $modified_time . ",&nbsp;" . $spriteCount{$pid} . " sprites)";
						}
						elsif($sortby eq "created_time"){
								my $created_time = $pages->{$pid}{"created_time"};
								$created_time =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
								$created_time = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
								# This is ad-hoc i18n. It will be improbed in version 0.61.
								if($PositLogConfig::language eq "en"){
										$created_time = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
								}
								$detailedStr = "&nbsp; (" . $created_time . ")";
						}
						elsif($sortby eq "modified_time"){
								my $modified_time = $pages->{$pid}{"modified_time"};
								$modified_time =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
								$modified_time = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
								# This is ad-hoc i18n. It will be improbed in version 0.61.
								if($PositLogConfig::language eq "en"){
										$modified_time = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
								}
								$detailedStr = "&nbsp; (" . $modified_time . ")";
						}
						elsif($sortby eq "count"){
								$detailedStr = "&nbsp; (" . $spriteCount{$pid} . ")";
						}
				}
				$newContents .= "<li class='pagelist_line'>" . $linkStr . $pagetitle . "</a>" . $detailedStr . "</li>\n";

				$counter ++;
				if($maxnumber > 0 && $counter >= $maxnumber){
						last;
				}
		}
		if($sortby eq "dictionary"){
				$newContents .= "\n</ul></div>";
		}
		else{
				$newContents .= "\n</ol></div>";
		}

		$template =~ s/\[\[plugin\]\]/$newContents/;

		if(!eval{Storable::lock_nstore \$template, $PositLogConfig::datapath . $pageid . "/static/" . $sourceID.".spr"}) {
				$result{"error"} = "RecentSpritesLite.pm: Cannot write " . $pageid . "/static/" . $sourceID .  ".spr";
				$result{"modified"} = -1;
				return \%result;
		}

		$result{"error"} = "";
		$result{"modified"} = -1;
		return \%result;
}

1;
