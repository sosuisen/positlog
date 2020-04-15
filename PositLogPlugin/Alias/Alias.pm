package PositLogPlugin::Alias::Alias;

# --------------------------------------------------------
# Alias.pm:
#      module for creating alias
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
use PositLogAuth;
use PositLogConfig;
use PositLogParam;

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
		my $loginid = $self->{loginid};
		my $loginpass = $self->{loginpass};

    my $aliasID = $sourceID;

    my @argsArray = split(/,/, $args);

		if (scalar(@argsArray) != 2) {
				$result{"error"} = "Alias.pm: invalid number of arguments";
				$result{"modified"} = -1;
				return \%result;
		}

    my $substancePageID = $argsArray[0];
    my $substanceID = $argsArray[1];

    my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass);
    my $permissionLevel = $authObj->getPermissionLevel($substancePageID);
    if($permissionLevel < $PositLogParam::USERLEVEL_READ){
			$result{"error"} = "Alias.pm: Permission denied";
			$result{"modified"} = -1;
			return \%result;
    }

    # Get sprite
    my $spriteContents = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $substancePageID . "/static/" . $substanceID.".spr")} or "";
		my $newContents = $$spriteContents;
		utf8::decode($newContents);
		$template =~ s/\[\[plugin\]\]/$newContents/;

    my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $substancePageID . "/sprites.dat")};
    if ($@) {
			$result{"error"} = "Alias.pm: Cannot retrieve " . $substancePageID . "/sprites.dat";
			$result{"modified"} = -1;
			return \%result;
    }

    my $spritesHashAlias = eval{Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
    if ($@) {
				$result{"error"} = "Alias.pm: Cannot retrieve " . $pageid . "/sprites.dat";
				$result{"modified"} = -1;
				return \%result;
    }
		if($spritesHashAlias->{$aliasID}{"modified_time"} == $spritesHash->{$substanceID}{"modified_time"}){
				$result{"error"} = "Alias.pm: no change";
				$result{"modified"} = -1;
				return \%result;
		}
    $spritesHashAlias->{$aliasID}{"created_time"} = $spritesHash->{$substanceID}{"created_time"};
    $spritesHashAlias->{$aliasID}{"modified_time"} = $spritesHash->{$substanceID}{"modified_time"};

    $spritesHashAlias->{$aliasID}{"src"} = $substancePageID . "," . $substanceID;

    if (!eval{Storable::lock_nstore $spritesHashAlias, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
				$result{"error"} = "Alias.pm: Cannot write " . $pageid . "/sprites.dat";
				$result{"modified"} = -1;
				return \%result;
    }

    # Save sprite cache
    if($template ne ""){
      if (!eval{Storable::lock_nstore \$template, $PositLogConfig::datapath . $pageid . "/static/" . $aliasID.".spr"}) {
					$result{"error"} = "Alias.pm: Cannot write " . $pageid . "/static/" . $aliasID.".spr";
					$result{"modified"} = -1;
					return \%result;
      }
    }
		
		$result{"error"} = "";
		$result{"modified"} = 1;
		return \%result;
}

1;
