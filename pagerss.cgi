#!/usr/bin/perl

# --------------------------------------------------------
# pagerss.cgi
#      CGI script for generating the rss file of a page.
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

BEGIN{
		push(@INC, './extlib');
}
use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve lock_nstore);
use PositLogAuth;
use PositLogConfig;
use PositLogParam;
use Time::Local;
use Walrus::RSS;

use utf8;

my $siteurl = $PositLogConfig::site;

chop $siteurl;

my $serializedData = "pagerss";
my $maxnumber = 10;

my $CGI = new CGI;

my $modifiedsince = $ENV{HTTP_IF_MODIFIED_SINCE};

if($modifiedsince	=~ /(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun), )?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}|\d{2}) (\d{2}):(\d{2})(?::(\d{2}))? (UT|GMT|[ECMP][SD]T|[ZAMNY]|[+-]\d{4})/){
		# Thanks to Walrus-san!
		my %monthes = qw(Jan 1 Feb 2 Mar 3 Apr 4 May 5 Jun 6 Jul 7 Aug 8 Sep 9 Oct 10 Nov 11 Dec 12);
		my %timezones = (
				UT=>'+0000', GMT=>'+0000', EST=>'-0500', EDT=>'-0400', CST=>'-0600', CDT=>'-0500', MST=>'-0700', MDT=>'-0600',
				PST=>'-0800', PDT=>'-0700', Z=>'+0000', A=>'-0100', M=>'-1200', N=>'+0100', Y=>'+1200'
				);
		my ($wday, $day, $month, $year, $hour, $min, $sec, $timezone) = ($1, $2, $3, $4, $5, $6, $7, $8);
		$year = ($year < 70) ? $year + 2000 : ($year < 1000) ? $year + 1900 : $year;
		$month = $monthes{$month};
		$timezone = ($timezone =~ /[A-Z]/) ? $timezones{$timezone} : $timezone;
		$timezone = ($timezone =~ /([+-])(\d{2})(\d{2})/) ? $1 . $2 * 3600 + $3 * 60 : 0;
		
		my $now = time();
		my $offset = scalar($timezone) - timegm(localtime($now)) + timegm(gmtime($now));

		my $time   = ($7) ? &Time::Local::timegm($sec, $min, $hour, $day, $month - 1, $year) - $offset
				: &Time::Local::timelocal($sec, $min, $hour, $day, $month - 1, $year) - $offset;
		my ($sec, $min, $hour, $day, $month, $year, $wday) = localtime($time);
		$wday = (qw(Sun Mon Tue Wed Thu Fri Sat))[$wday];
		$modifiedsince = sprintf('%04d%02d%02d%02d%02d%02d', $year + 1900, $month + 1, $day, $hour, $min, $sec);
}



my $pageid = $CGI->param("load");

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }


# Check page group
if($pageid =~ /^(pg.+)_latest$/ || $pageid eq "all_latest"){
		my $pgid = "";
		if($pageid =~ /^(.+)_latest$/){
				$pgid = $1;
		}
		my $pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
		if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }

		if(!exists($pageGroups->{$pgid})){
				print $CGI->header(-charset => 'utf-8');
				my $out = "<html><head><title>PositLog: Page group not found</title></head><body style='background-color: #efecde;'><h1 style='background-color: #dfdcce; color: #000000; padding: 5px; font-size: 18px;'>Page group not found</h1></body></html>";
				print $out;
				exit(0);
		}
		my $latestpid = "";
		my $latesttime = 0;
		foreach my $pid (keys %{$pageGroups->{$pgid}{pages}}){
				if($latesttime < scalar($pages->{$pid}{created_time})){
						$latesttime = scalar($pages->{$pid}{created_time});
						$latestpid = $pid;
				}
		}
		if($latestpid ne ""){
				$pageid = $latestpid;
		}
}
elsif($pageid =~ /^(pg.+)$/){
  # Group page
}

my $urlSpriteid = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/dynamic/". $serializedData  . ".dat")} or {};
my $authObj = new PositLogAuth($PositLogConfig::adminpath, "public", "", $pages);

my $permissionLevel = $authObj->getPermissionLevel($pageid);
if($permissionLevel < $PositLogParam::USERLEVEL_READ){
		print "Content-type: text/plain\n\n";
		print "Permission denied.\n";
		exit(0);
}

if($modifiedsince ne "" && $modifiedsince > $pages->{$pageid}{modified_time}){
		print "Status: 304 Not Modified\n\n";
		exit(1);
}

if (exists($urlSpriteid->{modified_time})){
		if(scalar($urlSpriteid->{modified_time}) > ($pages->{$pageid}{modified_time})){
				# use cache
				print "Content-type: application/xml\n\n";
				print $urlSpriteid->{rss};
				exit(1);
		}
}

my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")};
if($@){
		warn $@;
		print "Content-type: text/plain\n\n";
		print "Cannot read the sprite list.\n";
		exit(0);
}

my $counter = 0;

my $rss = new Walrus::RSS(
		version => '1.0',
		encoding => 'utf-8',
		);

for my $sid (sort { ($spritesHash->{$b}->{modified_time}) <=> ($spritesHash->{$a}->{modified_time}) } (keys %$spritesHash)){
		
		my $tmpdate = $spritesHash->{$sid}{modified_time};
		$tmpdate =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
		my $modifiedTime = "$1-$2-$3T$4:$5:$6+09:00";

		my $author_id = $spritesHash->{$sid}{author_id};
		my $public_author = $spritesHash->{$sid}{public_author};
		my $public_password = $spritesHash->{$sid}{public_password};

		my $singleContents = "no contents";
		my $contents = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/static/" . $sid . ".spr")} or "";
		if($contents ne ""){
				$singleContents = $$contents;
		}
		else{
				next;
		}
		utf8::decode($singleContents);

		my $abst = $singleContents;
		$abst =~ s/<br\s?\/?>/\n/gis;
		$abst =~ s/&amp;/&/gis;
		$abst =~ s/<.+?>//gis;

		my $header = "";
		if($abst =~ /^(.+?)。.*?$/s){
				$header = $1;
		}
		if($abst =~ /^(.+?)．.*?$/s){
				my $tmpheader = $1;
				if($header eq "" || length($header) > length($tmpheader)){
						$header = $tmpheader;
				}
		}

		if($abst =~ /^(.+?)[\n\r]/s){
				my $tmpheader = $1;
				if($header eq "" || length($header) > length($tmpheader)){
						$header = $tmpheader;
				}
		}


		if($header eq "" || length($header) > 30){
				if($abst =~ /^(.+?)、.*?$/s){
						if(length($1) <= 30){
								$header = $1;
						}
				}
				if($abst =~ /^(.+?)，.*?$/s){
						if(length($1) <= 30){
								my $tmpheader = $1;
								if($header eq "" || length($header) > length($tmpheader)){
										$header = $tmpheader;
								}
						}
				}
		}

		if($header eq "" || length($header) > 30){
				$header = substr($abst, 0, 30);
		}

		$header =~ s/&/&amp;/gis;

		if($singleContents =~ /^<canvas/i){
				$header = "Drawing";
				$singleContents = "Cannot display this drawing.";
		}

		if($singleContents =~ /^<img/i){
				if($singleContents =~ /src\s*?=['"].*\/(.+?)['"]/i){
						
						$header = $1;
				}
				else{
						$header = "Image file";
				}
		}

		$singleContents = "<![CDATA[ $singleContents ]]>";

		$rss->add_item(
				title => $header,
				link => $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $pageid. "&amp;id=" . $sid,
				description => $singleContents,
				dc_date => $modifiedTime,
				);

		$counter ++;
		if($counter >= $maxnumber){
				last;
		}
}

my $pagetitle = $pages->{$pageid}{name};
utf8::decode($pagetitle);

$rss->channel(
		title => $pagetitle,
		link => $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $pageid,
		about => $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $pageid,
		);


my $output = $rss->as_string;
utf8::encode($output);
print "Content-type: application/xml\n\n";
print $output;


my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime(time);
my $modifiedtime = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);


$urlSpriteid->{rss} = $output;
$urlSpriteid->{modified_time} = $modifiedtime;

if(!eval{Storable::lock_nstore $urlSpriteid, $PositLogConfig::datapath . $pageid . "/dynamic/" . $serializedData . ".dat"}) { print "Cannot write dynamic sprite table.";}



1;
