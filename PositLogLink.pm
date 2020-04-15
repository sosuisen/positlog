package PositLogLink;

# --------------------------------------------------------
# PositLogLink.pm
#      perl module for linking sprites
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use strict;

my $spritesHash;

sub execCommand
{
		my ($hash, $commandList) = @_;
		$spritesHash = $hash;

		foreach my $command (@$commandList){
				$command =~ /^(.*?),(.*?),(.*?)$/;
				my $cmd = $1;
				my $src = $2;
				my $dst = $3;

				if($cmd eq "link"){
						# link spr
						$spritesHash->{$src}{outlink}{$dst} = 1;
						$spritesHash->{$dst}{inlink}{$src} = 1;
				}
				elsif($cmd eq "unlink"){
						# unlink spr
						delete $spritesHash->{$src}{outlink}{$dst};
						if(scalar keys %{$spritesHash->{$src}{outlink}} == 0){
								delete $spritesHash->{$src}{outlink};
						}
						delete $spritesHash->{$dst}{inlink}{$src};
						if(scalar keys %{$spritesHash->{$dst}{inlink}} == 0){
								delete $spritesHash->{$dst}{inlink};
						}

						
				}
				else{
						return 0;
				}
		}
		return 1;
}


1;
