package PositLogPlugin::HatenaAntenna::HatenaAntenna;

# --------------------------------------------------------
# HatenaAntenna.pm:
#      module for retrieving sprites from Hatena Antenna
#
# Copyright (c) 2006-2007 Hidekazu Kubota All right reserved
#  <hidekaz@positlog.org> 
#  http://positlog.com/
# --------------------------------------------------------

# --------------------------------------------------------
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use HTTP::Lite;			# must be locally installed
use Time::Local;
use Storable qw(lock_retrieve lock_nstore);
use Encode qw/encode decode/;
use PositLogConfig;

my $prefixOfCacheTable = "HatenaAntenna_";

sub getCSS{
		return "hatena_antenna_contents.css";
}

sub clearCache{
    my ($pageid, $sourceID, $args) = @_;
		my $cacheTable = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat")};
		if ($@){
				return "No cache."
		}

		delete $cacheTable->{"modified_time"};

		if (!eval{Storable::lock_nstore $cacheTable, $PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat";}) {
				return "Save error.";
		}
		return "Succeed.";
}

sub getRSS{
		my ($rssurl, $cacheTable, $spritesHash) = @_;

		my %result;
		$result{"error"} = "";

		my $modifiedtime = "";
		if(exists($cacheTable->{"modified_time"})){
				$modifiedtime = $cacheTable->{"modified_time"};
		}

		my $urlChanged = 0;
		if(!exists($cacheTable->{"rssurl"}) || $rssurl ne $cacheTable->{"rssurl"}){
				$result{"error"} = "HatenaAntenna.pm: rssurl is changed";
				$urlChanged = 1;
		}


		# Check if sprite is deleted
		my $spriteDeleted = 0;
		foreach my $url (keys %{$cacheTable}) {
				if($url !~ /^rssurl$/ && $url !~ /^modified_time$/ ){
						if(!exists($spritesHash->{$cacheTable->{$url}})){
								$result{"error"} = "HatenaAntenna.pm: some sprites are deleted";
								$spriteDeleted = 1;
						}
				}
		}

		# rss file
		my $rss = "";
		my $httpsuccess = 1;

    # Check HTTP Status code 304
		if ($modifiedtime ne "" && $urlChanged == 0 && $spriteDeleted == 0) {
				$modifiedtime =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/;
				my $sec = $6;	my $min = $5; 	my $hour = $4; 	my $mday = $3; 	my $mon = $2; 	my $year = $1;
				my $modifiedtimeStr = $year . "/" . $mon . "/" . $mday . " " . $hour . ":" . $min . ":" . $sec;
				$sec =~ s/0(\d)/$1/;
				$min =~ s/0(\d)/$1/;
				$hour =~ s/0(\d)/$1/;
				$mday =~ s/0(\d)/$1/;
				$mon =~ s/0(\d)/$1/;
				my $time = timelocal(scalar($sec), scalar($min), scalar($hour), scalar($mday), scalar($mon) - 1, scalar($year));
				my @DoW = qw(Sun Mon Tue Wed Thu Fri Sat);
				my @MoY = qw(Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec);
				my %MonHash = ("Jan" => 1, "Feb" => 2, "Mar" => 3, "Apr" => 4, "May" => 5, "Jun" => 6, "Jul" => 7,  "Aug" => 8,  "Sep" => 9, "Oct" => 10,  "Nov" => 11, "Dec" => 12);
				my ($sec, $min, $hour, $mday, $mon, $year, $wday) = gmtime($time);
				my $modifiedHTTPdate = sprintf("%s, %02d %s %04d %02d:%02d:%02d GMT",
																			 $DoW[$wday],
																			 $mday, $MoY[$mon], $year+1900,
																			 $hour, $min, $sec);
				my $http = new HTTP::Lite;
				$http->add_req_header('If-Modified-Since', $modifiedHTTPdate);

				# HEAD request
				$http->method('GET');
				my $req = $http->request($rssurl) or $httpsuccess = 0;
				if($httpsuccess == 0){
						$result{"error"} = "HatenaAntenna.pm: HTTP request error: " . $rssurl;
						$result{"modified"} = -1;
						return \%result;
				}

				# Check Not Modified or Serve error
				if($req =~ /304/gi || $req =~ /50\d/gi){
						# Load cache
						$result{"error"} = "HatenaAntenna.pm: Status: " . $req;
						$result{"modified"} = -1;
						return \%result;
				}
				else{
						$rss =  $http->body();
				}
    }
		else{
				my $http = new HTTP::Lite;
				$http->method('GET');
				my $req = $http->request($rssurl) or $httpsuccess = 0;

				if ($httpsuccess == 0) {
						$result{"error"} = "HatenaAntenna.pm: HTTP request error: " . $rssurl;
						$result{"modified"} = -1;
						return \%result;
				}
				$rss =  $http->body();
		}

		if($rss eq ""){
				$result{"error"} = "HatenaAntenna.pm: No RSS document";
				$result{"modified"} = -1;
				return \%result;
		}

		$result{"modified"} = 1;
		$result{"rss"} = \$rss;
		return \%result;
}

sub getSprites{
		my ($self, $sourceID, $argsptr, $templateptr) = @_;
		
		my %result;

		my $args = $$argsptr;
		my $template = $$templateptr;

		my $pageid = $self->{srcpageid};
		my $loginid = $self->{loginid};
		my $loginpass = $self->{loginpass};

		my $author_id = $self->{sprites}{$sourceID}{"author_id"};
		my $public_author = $self->{sprites}{$sourceID}{"public_author"};
		my $public_password = $self->{sprites}{$sourceID}{"public_password"};

		my @argsArray = split(/,/, $args);

    my $rssurl = $argsArray[0];
    my $spritecolor = "#ffc0b0";
    if(scalar(@argsArray) >= 2){
				$spritecolor = $argsArray[1];
    }
    
    if($rssurl eq "" || $rssurl !~ /^http/){
				$result{"error"} = "HatenaAntenna.pm: invalid rssurl: " . $rssurl;
				$result{"modified"} = -1;
				return \%result;
		}

		# Retrieve RSS

		my $cacheTable = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat")} or {};
		if ($@) {
				if ((-e $PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat")) {
						$result{"error"} = "HatenaAntenna.pm: Cannot retrieve " . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat";
						$result{"modified"} = -1;
						return \%result;
				}
		}
		
		if($cacheTable eq ""){
				%$cacheTable = ();
		}

		my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
		if ($@) {
				$result{"error"} = "HatenaAntenna.pm: Cannot retrieve " . $pageid . "/sprites.dat";
				$result{"modified"} = -1;
				return \%result;
		}



		my $rssresult = getRSS($rssurl, $cacheTable, $spritesHash);
		$result{"error"} = $rssresult->{"error"};
		if($rssresult->{"modified"} == -1){
				$result{"modified"} = -1;
				return \%result;
		}

		# Change modified time

		my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
		my $modifiedtime = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
		$cacheTable->{"modified_time"} = $modifiedtime;

		$cacheTable->{"rssurl"} = $rssurl;

		my @itemArray;
    foreach my $item (${$rssresult->{"rss"}} =~ /<item.*?>.*?<\/item>/gis) {
				$item =~ /<item rdf:about="(.*?)">/i;
				my $url = $1;

				$item =~ /<title>(.*?)<\/title>/i;
				my $title = $1;

				$item =~ /<dc:date>(.*?)<\/dc:date>/i;
				my $date = $1;
				$date =~ /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\+(.*?)/i;
				my $dateStr = "$1$2$3$4$5$6";

				$item =~ /<link>(.*?)<\/link>/i;
				my $link = $1;

				$item =~ /<description>(.*?)<\/description>/is;
				my $description = $1;

				# make short
				$description = decode("utf-8", $description);
#				my $len = length($description)/2;
				my $len = length($description);
				$description = substr($description, 0, $len);
				$description = encode("utf-8", $description);

				$item = "<div class='hatena_antenna_contents'><div class='title'><a href='$link'>$title</a></div>\n<div class='description'>$description</div></div>";

				push(@itemArray, {"url" => $url, "date" => $dateStr, "contents" => $item});
    }

		# Generate new sprites

    $spritecolor =~ /\s*\#(\w\w)(\w\w)(\w\w)/i;
    my $red = hex(scalar($1));
    my $green = hex(scalar($2));
    my $blue = hex(scalar($3));
    my $newColor = "#ffffff";

		my $xcount = 0;
		my $xoffset = 40;
		my $xdiv = 600 / $xoffset -1;
		my $ycount = 0;
		my $yoffset = 40;
		my $ydiv = 600 / $yoffset -1;

		my $counter = 0;
		foreach my $item (sort {$b->{"date"} cmp $a->{"date"}} @itemArray) {

				my $valueItem = $item->{"contents"};
				my $url = $item->{"url"};

				my $spriteID = "";
				if (!exists($cacheTable->{$url})
						|| !exists($spritesHash->{$cacheTable->{$url}})){

						# Generate new spriteID
						if(exists($cacheTable->{$url})){
								$spriteID = $cacheTable->{$url};
						}
						else{
								my @alpha = ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
								do{
										my $rand0 = int (rand(10));
										my $rand1 = int (rand(26));
										my $rand2 = int (rand(26));
										my $rand3 = int (rand(26));
										my $rand4 = int (rand(26));
										$spriteID = "spr" . $rand0 . $alpha[$rand1] . $alpha[$rand2] . $alpha[$rand3] . $alpha[$rand4];
								}while (exists($spritesHash->{$spriteID}));
						}


						# Set sprite default properties

						$spritesHash->{$spriteID}{"author_id"} = $author_id;
						$spritesHash->{$spriteID}{"public_author"} = $public_author;
						$spritesHash->{$spriteID}{"public_password"} = $public_password;

						$spritesHash->{$spriteID}{"created_time"} = $item->{"date"};
						$spritesHash->{$spriteID}{"modified_time"} = $item->{"date"};

						# Generate layout properties

						my $newleft =	scalar($spritesHash->{$sourceID}{"left"}) + 10;
						my $newtop = scalar($spritesHash->{$sourceID}{"top"}) + 80;
						if ($xcount > $xdiv) {
								$xcount = 0;
								$ycount ++;
								if ($ycount > $ydiv) {
										$ycount = 0;
								}
						}
						$newleft += $xoffset * $xcount;
						$newtop += $yoffset * $ycount;
						$xcount ++;

						if(!$spritesHash->{$spriteID}{"left"}){
								$spritesHash->{$spriteID}{"left"} = $newleft;
						}
						if(!$spritesHash->{$spriteID}{"top"}){
								$spritesHash->{$spriteID}{"top"} = $newtop;
						}
						if(!$spritesHash->{$spriteID}{"width"}){
								$spritesHash->{$spriteID}{"width"} = 150;
						}
						if(!$spritesHash->{$spriteID}{"height"}){
								$spritesHash->{$spriteID}{"height"} = 80;
						}
						if(!$spritesHash->{$spriteID}{"zIndex"}){
							 	$spritesHash->{$spriteID}{"zIndex"}= $spritesHash->{$sourceID}{"zIndex"};
						}

						if(!$spritesHash->{$spriteID}{"borderWidth"}){
								$spritesHash->{$spriteID}{"borderWidth"} = 1;
						}
						if(!$spritesHash->{$spriteID}{"borderStyle"}){
								$spritesHash->{$spriteID}{"borderStyle"} = "solid";
						}
						if(!$spritesHash->{$spriteID}{"padding"}){
								$spritesHash->{$spriteID}{"padding"} = 0;
						}

						# Generate color
						if ($counter == 0) {
								$newColor = "rgb($red, $green, $blue);";
						} elsif ($counter < 5) {
								my $newRed = scalar($red) + int((256-scalar($red))/5);
								my $newGreen = scalar($green) + int((256-scalar($green))/5);
								my $newBlue = scalar($blue) + int((256-scalar($blue))/5);
								$newColor = "rgb($newRed, $newGreen, $newBlue);";
						} elsif ($counter < 10) {
								my $newRed = scalar($red) + int((256-scalar($red))*2/5);
								my $newGreen = scalar($green) + int((256-scalar($green))*2/5);
								my $newBlue = scalar($blue) + int((256-scalar($blue))*2/5);
								$newColor = "rgb($newRed, $newGreen, $newBlue);";
						} elsif ($counter < 20) {
								my $newRed = scalar($red) + int((256-scalar($red))*3/5);
								my $newGreen = scalar($green) + int((256-scalar($green))*3/5);
								my $newBlue = scalar($blue) + int((256-scalar($blue))*3/5);
								$newColor = "rgb($newRed, $newGreen, $newBlue);";
						} elsif ($counter < 30) {
								my $newRed = scalar($red) + int((256-scalar($red))*4/5);
								my $newGreen = scalar($green) + int((256-scalar($green))*4/5);
								my $newBlue = scalar($blue) + int((256-scalar($blue))*4/5);
								$newColor = "rgb($newRed, $newGreen, $newBlue);";
						} else {
								$newColor = "#ffffff";
						}

						$spritesHash->{$spriteID}{"borderColor"} = "#000000";
						$spritesHash->{$spriteID}{"bgColor"} = $newColor;
						$spritesHash->{$spriteID}{"color"} = "#000000";

						$spritesHash->{$spriteID}{"display_created_time"} = 1;
						$spritesHash->{$spriteID}{"display_author"} = 1;
						$spritesHash->{$spriteID}{"display_uri"} = 1;
						$spritesHash->{$spriteID}{"display_tag"} = 1;

						$spritesHash->{$spriteID}{"type"} = "dynamic";
						$spritesHash->{$spriteID}{"plugin_source"} = $sourceID;

						$cacheTable->{$url} = $spriteID;
				}
				else{
						$spriteID = $cacheTable->{$url};
				}
				
				# Save sprite contents
				if (!eval{Storable::lock_nstore \$valueItem, $PositLogConfig::datapath . $pageid . "/static/" . $spriteID . ".spr"}) {
				  $result{"error"} = "HatenaAntenna.pm: Cannot write " . $pageid . "/static/" . $spriteID . ".spr";
					$result{"modified"} = -1;
					return \%result;
    		}

				$spritesHash->{$spriteID}{"created_time"} = $item->{"date"};
				$spritesHash->{$spriteID}{"modified_time"} = $item->{"date"};

				$counter ++;
    }


		# Save sprite properties
		if (!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}) {
				$result{"error"} = "HatenaAntenna.pm: Cannot write sprites.dat.";
				$result{"modified"} = -1;
				return \%result;
		}

		# Save cache table
		if (!eval{Storable::lock_nstore $cacheTable, $PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat";}) {
				$result{"error"} = "HatenaAntenna.pm: Cannot write cache table\n";
				$result{"modified"} = -1;
				return \%result;
		}

    $result{"modified"} = 1;
    return \%result;



}

1;
