package PositLogPlugin::cocolog::cocolog;

# --------------------------------------------------------
# cocolog.pm:
#      module for retrieving sprites from cocolog
#      from cocolog
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
use PositLogConfig;

my $prefixOfCacheTable = "cocolog_";

sub getCSS{
	return "cocolog_contents.css";
}

sub clearCache{
    my ($pageid, $sourceID, $args) = @_;

    my $cacheTable = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/dynamic/". $prefixOfCacheTable . $sourceID.".dat")};
		if ($@){
				return "No cache."
		}

		delete $cacheTable->{"modified_time"};

		if(!eval{Storable::lock_nstore $cacheTable, $PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID .".dat";}){
				return "Save error.";
		}
		return "Succeed.";
}

sub getPage{
		my ($url, $rssurl, $cacheTable, $spritesHash) = @_;
		my %result;

		$result{"error"} = "";

    my $http = new HTTP::Lite;

    my $modifiedtime = "";
		if (exists($cacheTable->{"modified_time"})) {
				$modifiedtime = $cacheTable->{"modified_time"};
		}

		my $urlChanged = 0;
		if(!exists($cacheTable->{"url"}) || $url ne $cacheTable->{"url"}){
				$result{"error"} = "cocolog.pm: url is changed";
				$urlChanged = 1;
		}

    # Check HTTP Status code 304
    if ($modifiedtime ne "" && $urlChanged == 0 && $rssurl ne "") {
				my $req = "";
				my $modifiedtime = $cacheTable->{"modified_time"};

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
				$http->add_req_header('If-Modified-Since', $modifiedHTTPdate);

				# HEAD request
				$http->method('HEAD');
				$req = $http->request($rssurl);


				if($req =~ /304/gi || $req =~ /50\d/gi){
						$result{"error"} = "cocolog.pm: Status: " . $req;
						$result{"modified"} = -1;
						return \%result;
				}
    }

    # GET Request
    $http->method('GET');
    my $req = $http->request($url);

    if($@){
				$result{"error"} = "cocolog.pm: HTTP request error: " . $url;
				$result{"modified"} = -1;
				return \%result;
		}

    my $page = $http->body();
		if($page eq ""){
				$result{"error"} = "cocolog.pm: No body: " . $url;
				$result{"modified"} = -1;
				return \%result;
		}

		
		$result{"modified"} = 1;
		$result{"page"} = \$page;
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

    if(scalar(@argsArray) < 1){
				$result{"error"} = "cocolog.pm: invalid number of arguments";
				$result{"modified"} = -1;
				return \%result;
		}
    my $url = $argsArray[0];

    # If $rssurl is not given, cache system is not used.
    my $rssurl = "";
    if(scalar(@argsArray) >= 2){
				$rssurl = $argsArray[1];
    }

    my $cacheTable = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/dynamic/". $prefixOfCacheTable.$sourceID.".dat")} or {};

		if(exists($cacheTable->{"modified_time"}) && $rssurl eq "usecache"){
				$result{"error"} = "cocolog.pm: uscache";
				$result{"modified"} = -1;
				return \%result;
		}

    my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
		if ($@) {
				$result{"error"} = "cocolog.pm: Cannot retrieve " . $pageid . "/sprites.dat";
				$result{"modified"} = -1;
				return \%result;
		}

		# Get page
		my $pageresult = getPage($url, $rssurl, $cacheTable, $spritesHash);
		$result{"error"} = $pageresult->{"error"};
		if($pageresult->{"modified"} == -1){
				$result{"modified"} = -1;
				return \%result;
		}

    # --------------------------------------------------
    # Parse entry of cocolog
    # If you can use CPAN and XML module, it's better.
    # --------------------------------------------------
    my $newContents = "";

    # parse entry
    my @contentsArray = ();
    foreach my $entry (${$pageresult->{"page"}} =~ /(\n\n<h2>.+?<\/h2>.+?<div class=\"entry-top\"><\/div>.+<div class=\"entry-body-bottom\"><\/div>)/gis){
				push(@contentsArray, $entry);
    }

    while(@contentsArray){
				$newContents .= "<div class='cocolog_contents'>";
				$newContents .= shift(@contentsArray);
				$newContents .= "</div></div>";
    }

    # Change modified time
    my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
    my $modifiedtime = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
		$spritesHash->{$sourceID}{"modified_time"} = $modifiedtime;

		$cacheTable->{"modified_time"} = $modifiedtime;

		$cacheTable->{"url"} = $url;

		utf8::decode($newContents);
		$template =~ s/\[\[plugin\]\]/$newContents/;

		# Save sprite
		if(!eval{Storable::lock_nstore \$template, $PositLogConfig::datapath . $pageid . "/static/" . $sourceID.".spr"}) {
				$result{"error"} = "cocolog.pm: Cannot write " . $pageid . "/static/" . $sourceID . ".spr";
				$result{"modified"} = -1;
				return \%result;
		}

		# Save sprite properties
		if(!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
				$result{"error"} = "cocolog.pm: Cannot write sprites.dat.";
				$result{"modified"} = -1;
				return \%result;
		}

		# Save cache table
		if (!eval{Storable::lock_nstore $cacheTable, $PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat";}) {
				$result{"error"} = "cocolog.pm: Cannot write cache table\n";
				$result{"modified"} = -1;
				return \%result;
		}

    $result{"modified"} = 1;
    return \%result;
}

1;
