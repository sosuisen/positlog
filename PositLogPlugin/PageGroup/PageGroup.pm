package PositLogPlugin::PageGroup::PageGroup;

# --------------------------------------------------------
# PageGroup.pm:
#      module for listing page tree
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
		
    my $detail = "false";
		if (scalar(@argsArray) >= 1) {
				if($argsArray[0] eq "true"){
						$detail = "true";
				}
		}

		my $pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
		if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }

		my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
		if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }

		my $authObj = new PositLogAuth($PositLogConfig::adminpath, $self->{loginid}, $self->{loginpass}, $pages, $pageGroups);


		my $newContents = "";
		$newContents .= "<div class='pagetree_contents'>\n<ul>\n";

		foreach my $pagegroupid (keys %{$pageGroups}){
				if($pagegroupid eq "all"){
						next;
				}

				my $pagegrouptitle = $pageGroups->{$pagegroupid}{"name"};
				utf8::decode($pagegrouptitle);
				$newContents .= "<li class='pagetree_groupname'>" . $pagegrouptitle . "<ul>\n";

				my @pageArray;
				my %spriteCount;
				if($detail eq "true"){
						foreach my $pid (keys %{$pageGroups->{$pagegroupid}{"pages"}}){
								my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pid . "/sprites.dat")};
								my @spritesArray = keys %{$spritesHash};
								$spriteCount{$pid} = scalar(@spritesArray);
						}
				}

				@pageArray = sort {$pages->{$a}{"name"} cmp $pages->{$b}{"name"}} (keys %{$pageGroups->{$pagegroupid}{"pages"}});
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
								my $modified_time = $pages->{$pid}{"modified_time"};
								$modified_time =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
								$modified_time = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
								# This is ad-hoc i18n. It will be improbed in version 0.61.
								if($PositLogConfig::language eq "en"){
										$modified_time = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
								}
								$detailedStr = "&nbsp;(" . $modified_time . ",&nbsp;" . $spriteCount{$pid} . " sprites)";
						}
						$newContents .= "<li class='pagelist_line'>" . $linkStr . $pagetitle . "</a>" . $detailedStr . "</li>\n";

				}

				$newContents .= "\n</ul></li>\n";
		}

		$newContents .= "\n</ul></div>";

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
