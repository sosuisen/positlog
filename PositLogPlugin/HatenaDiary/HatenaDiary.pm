package PositLogPlugin::HatenaDiary::HatenaDiary;

# --------------------------------------------------------
# HatenaDiary.pm:
#      module for retrieving sprites from Hatena Diary
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
use Encode qw/from_to/;
use PositLogConfig;

# prefix of serialized associtation data (url, spriteID)
my $prefixOfCacheTable = "HatenaDiary_";

my $hatenaID;

sub getCSS{
		return "hatena_diary_contents.css";
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
		my ($url, $cacheTable, $spritesHash) = @_;
		my %result;

		$result{"error"} = "";

    my $http = new HTTP::Lite;

    my $modifiedtime = "";
		if (exists($cacheTable->{"modified_time"})) {
				$modifiedtime = $cacheTable->{"modified_time"};
		}

		my $urlChanged = 0;
		if(!exists($cacheTable->{"url"}) || $url ne $cacheTable->{"url"}){
				$result{"error"} = "HatenaDiary.pm: url is changed";
				$urlChanged = 1;
		}

    # Check HTTP Status code 304
		if ($modifiedtime ne "" && $urlChanged == 0) {
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

				# HatenaDiary does not return 304,
				# however HatenaDiary RSS can return 304.
						
				# HEAD request
				$http->method('HEAD');
						
				# Timeout 10sec
				eval{
						local $SIG{ALRM} = sub {die "timeout"};
						alarm 10;
						$req = $http->request("http://d.hatena.ne.jp/" . $hatenaID . "/rss");
						alarm 0;
				};
				alarm 0;
				if($@){
						if($@ =~ /timeout/){
								$req = "408";
						}
				}

				if($req =~ /304/gi || $req =~ /408/ || $req =~ /50\d/gi){
						$result{"error"} = "HatenaDiary.pm: Status: " . $req;
						$result{"modified"} = -1;
						return \%result;
				}
    }

    # GET Request
    $http->method('GET');
    # timeout 10sec
    my $req = "";
    eval{
				local $SIG{ALRM} = sub {die "timeout"};
				alarm 10;
				$req = $http->request($url);
				alarm 0;
    };
    alarm 0;

    if($@){
				if($@ =~ /timeout/){
						$result{"error"} = "HatenaDiary.pm: HTTP request timeout" . $url;
						$result{"modified"} = -1;
						return \%result;
				}
				else{
						$result{"error"} = "HatenaDiary.pm: HTTP request error: " . $url;
						$result{"modified"} = -1;
						return \%result;
				}
    }

    my $page =  $http->body();
		if($page eq ""){
				$result{"error"} = "HatenaDiary.pm: No body: " . $url;
				$result{"modified"} = -1;
				return \%result;
		}

		
		$result{"modified"} = 1;
		$result{"page"} = \$page;
		return \%result;
}

# -----------------------------------
# Parse entry of Hatena Diary
# If you can use CPAN and XML module, it's better.
# -----------------------------------
sub parsePage{
		my($pageptr) = @_;

    # Parse day contents 
    my @contentsArray = ();
    foreach my $day ($$pageptr =~ /(<div class="day">.*?<!-- google_ad_section_end -->.*?<\/div>)/gis){
				$day .= "</div>";
				from_to($day, "euc-jp", "utf8");

        # Footnote
				$day =~ s/" href="(\/$hatenaID\/.+?#.+?)"/" href="http:\/\/d.hatena.ne.jp$1"/gis;

        # Hatena id
				$day =~ s/<a href="\/$hatenaID\//<a href="http:\/\/d.hatena.ne.jp\/$hatenaID\//gis;

				$day =~ s/src="(\/images.*?$hatenaID\/)/src="http:\/\/d.hatena.ne.jp$1/gis;
				
				$day =~ s/\<\!\-\- google\_ad\_section\_end \-\-\>//gi;
				$day =~ s/\<\!\-\- google\_ad\_section\_start \-\-\>//gi;

				push(@contentsArray, $day);
    }

    # Parse comment
    my @commentArray = ();
    foreach my $comment ($$pageptr =~ /(<div class="comment">.*?<\/div>.*?)<div class="refererlist">/gis) {
				from_to($comment, "euc-jp", "utf8");
				$comment =~ s/href="\/(.*?)\//href="http:\/\/d.hatena.ne.jp\/$1\//gis;
				push(@commentArray, $comment);
    }

    # Parse trackback
    my @trackbackArray = ();
    foreach my $tb ($$pageptr =~ /(<div class="refererlist">.*?<\/div>.*?<\/div>)/gis) {
				from_to($tb, "euc-jp", "utf8");
				$tb =~ s/href="\/(.*?)\//href="http:\/\/d.hatena.ne.jp\/$1\//gis;
				push(@trackbackArray, $tb);
    }

		my $newContents = "";

    while(@contentsArray) {
				$newContents .= "<div class='hatena_diary_contents'>";
				$newContents .= shift(@contentsArray);
				$newContents .= shift(@commentArray);
				$newContents .= shift(@trackbackArray);
				$newContents .= "</div>";
    }
		return \$newContents;
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
				$result{"error"} = "HatenaDiary.pm: invalid number of arguments";
				$result{"modified"} = -1;
				return \%result;
		}

    my $url = $argsArray[0];

    $url =~ /http:\/\/d.hatena.ne.jp\/(.*?)\//i;
    $hatenaID = $1;


		# Check cache
    my $usecache = "";
    if(scalar(@argsArray) >= 2){
				$usecache = $argsArray[1];
    }

    my $cacheTable = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/dynamic/". $prefixOfCacheTable.$sourceID.".dat")} or {};

		if(exists($cacheTable->{"modified_time"}) && $usecache eq "usecache"){
				$result{"error"} = "HatenaDiary.pm: usecache";
				$result{"modified"} = -1;
				return \%result;
		}

    my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
		if ($@) {
				$result{"error"} = "HatenaDiary.pm: Cannot retrieve " . $pageid . "/sprites.dat";
				$result{"modified"} = -1;
				return \%result;
		}

		# Get page
		my $pageresult = getPage($url, $cacheTable, $spritesHash);
		$result{"error"} = $pageresult->{"error"};
		if($pageresult->{"modified"} == -1){
				$result{"modified"} = -1;
				return \%result;
		}

		# Get contents
    my $newContents = parsePage($pageresult->{"page"});
		if($$newContents eq ""){
				$result{"error"} = "HatenaDiary.pm: Cannot get contents";
				$result{"modified"} = -1;
				return \%result;
		}

		utf8::decode($$newContents);
		$template =~ s/\[\[plugin\]\]/$$newContents/;

    # Change modified time
    my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
    my $modifiedtime = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
		$spritesHash->{$sourceID}{"modified_time"} = $modifiedtime;

		$cacheTable->{"modified_time"} = $modifiedtime;

		$cacheTable->{"url"} = $url;

		# Save sprite
		if(!eval{Storable::lock_nstore \$template, $PositLogConfig::datapath . $pageid . "/static/" . $sourceID.".spr"}) {
				$result{"error"} = "HatenaDiary.pm: Cannot write " . $pageid . "/static/" . $sourceID . ".spr";
				$result{"modified"} = -1;
				return \%result;
		}

		# Save sprite properties
		if(!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
				$result{"error"} = "HatenaDiary.pm: Cannot write sprites.dat.";
				$result{"modified"} = -1;
				return \%result;
		}

		# Save cache table
		if (!eval{Storable::lock_nstore $cacheTable, $PositLogConfig::datapath . $pageid . "/dynamic/" . $prefixOfCacheTable.$sourceID.".dat";}) {
				$result{"error"} = "HatenaDiary.pm: Cannot write cache table\n";
				$result{"modified"} = -1;
				return \%result;
		}

    $result{"modified"} = 1;
    return \%result;
}

1;
