package PositLogSprites;

# --------------------------------------------------------
# PositLogSprites.pm
#      perl module for retrieving sprites
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(./extlib);

use strict;
use PositLogConfig;
use Storable qw(lock_retrieve lock_nstore);
use JSON; # Sometimes sprites.dat inclues JSON::NotString

sub getAuthorName{
		my($self, $author_id, $public_author,$public_password) = @_;

		utf8::decode($public_author);

		my $authorName = "[public]";
		if($author_id eq "admin"){
				$authorName = "admin";
		}
		else{
				if($author_id eq "public"){
						if($public_password eq ""){
								if($public_author eq "" || $public_author eq "public"){
										$authorName = "[public]";
								}
								else{
										$authorName = '[' . $public_author . ']';
								}
						}
						else{
								if($public_author eq "" || $public_author eq "public"){
										$authorName = "&lt;public&gt;";
								}
								else{
										$authorName = '&lt;' . $public_author . '&gt;';
								}
						}
				}
				else{
						if($self->{users} eq ""){
								$self->{users} = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "users.dat")};
								if($@){	warn "Cannot read " . $PositLogConfig::adminpath . "users.dat";	return ""; }
						}

						if(exists($self->{users}->{$author_id})){
								if($self->{users}->{$author_id}{nickname} ne ""){
										$authorName = $self->{users}->{$author_id}{nickname};
										utf8::decode($authorName);
								}
								else{
										$authorName = "invalid_nickname:" . $author_id;
								}
						}
						else{
								$authorName = "invalid_user:" . $author_id;
						}
				}
		}
		return $authorName;
}


sub getContents{
		my($self, $sid) = @_;

		# Set temporal author_name data for PARAM.author
		my $authorName = $self->getAuthorName($self->{sprites}{$sid}{author_id}, $self->{sprites}{$sid}{public_author}, $self->{sprites}{$sid}{public_password});
		$self->{sprites}{$sid}{author_name} = $authorName;

		my $spriteContents = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $self->{srcpageid} . "/static/" . $sid .".spr")} or "";
		if($spriteContents ne ""){
				my $z = $self->{sprites}{$sid}{zIndex};
				if($z < 10){
						$z = 500000;
				}
				$self->{spriteshtml} .= "\n\n<div class='" . $self->{classname} . "' id='" . $sid . "' ";
				$self->{spriteshtml} .= "style='left:" . $self->{sprites}{$sid}{left} . "px; top:" . $self->{sprites}{$sid}{top} . "px; width:" . $self->{sprites}{$sid}{width} . "px; z-index:" . $z . "; " . $self->{style} . "'>";
				my $regionWidth = scalar($self->{sprites}{$sid}{width}) - 2;
				$self->{spriteshtml} .= "<div class='region' style='width:" . $regionWidth . "px;'>";
				$self->{spriteshtml} .= "<div class='contents' style='border-width:" . $self->{sprites}{$sid}{borderWidth} . "px; border-style:" . $self->{sprites}{$sid}{borderStyle} . ";";
				if($self->{sprites}{$sid}{borderColor} ne ""){
						$self->{spriteshtml} .= " border-color:" . $self->{sprites}{$sid}{borderColor} . ";";
				}						
				$self->{spriteshtml} .= "	padding:" . $self->{sprites}{$sid}{padding} . "px; ";
				if($self->{sprites}{$sid}{color} ne ""){
						$self->{spriteshtml} .= "color:" . $self->{sprites}{$sid}{color} . ";";
				}
				if($self->{sprites}{$sid}{bgColor} ne ""){
						$self->{spriteshtml} .= "background-color:" . $self->{sprites}{$sid}{bgColor} . ";";
				}

				$self->{spriteshtml} .= 	"'>";

				my $utf8Contents = $$spriteContents;
				utf8::decode($utf8Contents);
				$self->{spriteshtml} .= $utf8Contents;
				$self->{spriteshtml} .= "</div>";

				$self->{spriteshtml} .= "<div class='info'>";

				if(scalar($self->{sprites}{$sid}{display_tag})){
						my $tagStr = "";
						foreach my $tag (keys %{$self->{sprites}{$sid}{tags}}){
								my $utftag = $tag;
								my $tagenc = $tag;
								$tagenc =~ s/([^\w ])/'%' . unpack('H2', $1)/eg;
								$tagenc =~ tr/ /+/;
								
								if($PositLogConfig::mod_rewrite == 1){
										$tagStr .= "<a href='./tag/" . $tagenc . "' rel='tag'>" . $utftag . "</a>, ";
								}
								else{
										$tagStr .= "<a href='./tag.cgi?tag=" . $tagenc . "'>" . $utftag . "</a>, ";
								}
						}
						chop($tagStr);
						chop($tagStr);
						if($tagStr ne ""){
								$self->{spriteshtml} .= "<span class='tag'>";
								$self->{spriteshtml} .= $tagStr;
								$self->{spriteshtml} .= "</span><br>";
						}
				}

			if(scalar($self->{sprites}{$sid}{display_author})){
						$self->{spriteshtml} .= "<span class='author'";
						$self->{spriteshtml} .= " style='display:block;'>";

						$self->{spriteshtml} .= $authorName;
						$self->{spriteshtml} .= "</span>";
				}

				if(scalar($self->{sprites}{$sid}{display_created_time})){
						$self->{spriteshtml} .= "<span class='time'";
						$self->{spriteshtml} .= " style='display:block;'>";

						my $ctime = $self->{sprites}{$sid}{created_time};
						$ctime =~ /^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/i;
						my $timeStr = $1 . "/" . $2 . "/" . $3 . " " . $4 . ":" . $5 . ":" .$6;
						# This is ad-hoc i18n. It will be improbed in version 0.61.
						if($PositLogConfig::language eq "en"){
								$timeStr = $2 . "/" . $3 . "/" . $1 . " " . $4 . ":" . $5 . ":" .$6;
						}
						$self->{spriteshtml} .= $timeStr;
						$self->{spriteshtml} .= "</span>";
				}

				if(!scalar($self->{sprites}{$sid}{display_uri}) && $self->{positlogMode} eq "EditMode"){
						if($self->{sprites}{$sid}{src} ne ""){
								$self->{spriteshtml} .= "<span class='uri'";
								$self->{spriteshtml} .= " style='display:block;'>";
								my $linkStr = "";
								my @srcArray = split(/,/, $self->{sprites}{$sid}{src});
								if($PositLogConfig::mod_rewrite == 1){
										$linkStr = "<a href='./" . $srcArray[0] . ".html#id_" . $srcArray[1] . "'>src</a>";
								}
								else{
										$linkStr = "<a href='./positlog.cgi?load=" . $srcArray[0] . "#id_" . $srcArray[1] . "'>src</a>";
								}
								$self->{spriteshtml} .= $linkStr;
								$self->{spriteshtml} .= "</span>";
						}
				}
				elsif(scalar($self->{sprites}{$sid}{display_uri})){
						$self->{spriteshtml} .= "<span class='uri'";
						$self->{spriteshtml} .= " style='display:block;'>";
						my $linkStr = "";
						if($self->{sprites}{$sid}{src} ne ""){
								my @srcArray = split(/,/, $self->{sprites}{$sid}{src});
								if($PositLogConfig::mod_rewrite == 1){
										$linkStr = "<a href='./" . $srcArray[0] . ".html#id_" . $srcArray[1] . "'>src</a>&nbsp;&nbsp;<a href='./" . $self->{srcpageid} . ".html#id_" . $sid . "'>link</a>";
								}
								else{
										$linkStr = "<a href='./positlog.cgi?load=" . $srcArray[0] . "#id_" . $srcArray[1] . "'>src</a>&nbsp;&nbsp;<a href='./positlog.cgi?load=" . $self->{srcpageid} . "#id_" . $sid . "'>link</a>";
								}
						}
						else{
								if($PositLogConfig::mod_rewrite == 1){
										$linkStr = "<a href='./" . $self->{srcpageid} . ".html#id_" . $sid . "'>link</a>";
								}
								else{
										$linkStr = "<a href='./positlog.cgi?load=" . $self->{srcpageid} . "#id_" . $sid . "'>link</a>";
								}
						}

						$self->{spriteshtml} .= $linkStr;
						$self->{spriteshtml} .= "</span>";
				}

				$self->{spriteshtml} .= "</div>";

				$self->{spriteshtml} .= "</div>";

				$self->{spriteshtml} .= "<span class='plugin' style='display:none;'>";
				my $plugin = $self->{sprites}{$sid}{plugin};
				if($plugin ne ""){
						utf8::decode($plugin);
						$self->{spriteshtml} .= $plugin;
				}
				$self->{spriteshtml} .= "</span>\n";

				$self->{spriteshtml} .= "</div>\n";
		}
		else{
				delete $self->{sprites}{$sid};
				if(!eval{Storable::lock_nstore $self->{sprites}, $PositLogConfig::datapath . $self->{srcpageid} . "/sprites.dat"}){
						warn "Cannot write sprites.dat.\n";;
				}
		}

}


#---------------------------------------------
# generateSprites()
# $max : maximum number of generating trees
# $order : unimplemented
# $filter : uninplemented
#---------------------------------------------
sub generateSprites{
    my ($self, $positlogMode, $srcpageid, $dstpageid, $loginid, $loginpass, $classname, $style, $max, $order, $filter) = @_;
		$self->{positlogMode} = $positlogMode;
		$self->{srcpageid} = $srcpageid;
		$self->{dstpageid} = $dstpageid;
		$self->{loginid} = $loginid;
		$self->{loginpass} = $loginpass;
		$self->{classname} = $classname;
		$self->{style} = $style;
		$self->{max} = $max;

		$self->{sprites} = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $self->{srcpageid} . "/sprites.dat")} or {};
		if($self->{sprites} eq "") {
				print "Cannot read " . $PositLogConfig::datapath . $self->{srcpageid} . "/sprites.dat";
				return "";
		}

		my @rootIDs;
		my $CSSHEADER = "";


		# Load plugins
		foreach my $sid (keys %{$self->{sprites}}) {
				my $sprite_plugin = $self->{sprites}{$sid}{plugin};
				$sprite_plugin =~ s/&amp;/&/gis;
				if($sprite_plugin =~ /^(.+?),(.*?);(.+?)$/is){
						my $pluginName = $1;
						my $pluginOption = $2;
						my $template = $3;
						utf8::decode($template);
						# Import dynamic sprites
						if (-f "./PositLogPlugin/" . $pluginName . "/" . $pluginName . ".pm"){
								# Load plugin
								my $result = eval 'use ' . "PositLogPlugin::" . $pluginName . "::" . $pluginName . ';' . "PositLogPlugin::" . $pluginName . "::" . $pluginName . q/::getSprites($self, $sid, \$pluginOption, \$template)/;
								if($result->{error} ne ""){
										warn $result->{error};
								}
								if($result->{modified} != -1){
										$self->{sprites} = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $self->{srcpageid} . "/sprites.dat")} or {};										
								}

								# Add plugin CSS
								my $cssfile = eval 'use ' . "PositLogPlugin::" . $pluginName . "::" . $pluginName .';' . "PositLogPlugin::" . $pluginName . "::" . $pluginName . q/::getCSS()/;
								if($cssfile ne ""){
										$CSSHEADER .= "		<link rel='stylesheet' href='" .  $PositLogConfig::cgipath . "PositLogPlugin/" . $pluginName . "/" . $cssfile ."' type='text/css'>\n";
								}
						}
				}
		}


		my $counter = 0;
		foreach my $sid (sort {$self->{sprites}{$b}{created_time} <=> $self->{sprites}{$a}{created_time}} keys %{$self->{sprites}}){
				if(scalar($self->{max}) == -1 || $counter < scalar($self->{max})){
						getContents($self, $sid);
				}
				if(scalar($self->{max}) != -1){
						$counter = $counter+1;
				}
		}

		$self->{spritescss} = \$CSSHEADER;
}

sub getHash{
		my $self = shift;
		return $self->{sprites};
}

sub getCss{
		my $self = shift;
		return $self->{spritescss};
}

sub getHtml{
		my $self = shift;
		return \($self->{spriteshtml});
}

sub new{
		my $pkg = shift;
		my $hash = {
				positlogMode   => undef,
				srcpageid   => undef,
				dstpageid   => undef,
				loginid => undef,
				loginpass => undef,
				classname => undef,
				style => undef,
				max => undef,
				order => undef,
				filter => undef,

				sprites => {},

				spriteshtml => "",
				spritescss => undef,

				users => ""
		};
		bless $hash,$pkg;
}

1;
