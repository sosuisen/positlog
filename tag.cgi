#!/usr/bin/perl

# --------------------------------------------------------
# tag.cgi
#      cgi for listing tags on PositLog 
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(./extlib);

use strict;
use CGI qw(-debug :standard);
use CGI::Cookie;
use Storable qw(lock_retrieve);
use PositLogAuth;
use PositLogConfig;
use Walrus::RSS;
use JSON; # Sometimes sprites.dat inclues JSON::NotString

my $siteurl = $PositLogConfig::site;
chop $siteurl;

my $CSSHEADER = "";

my $CGI = new CGI;

# max display number
my $maxnumber = $CGI->param("max");
if($maxnumber eq ""){
    $maxnumber = 15;
}

my $style = $CGI->param("style");

my $sortby = $CGI->param("sortby");
if($sortby ne "dictionary" && $sortby ne "created_time" && $sortby ne "modified_time" && $sortby ne "count"){
		$sortby = "dictionary";
}

# pageid or pagegroup
my $targetpage = $CGI->param("page");

# filter = id | nickname
my $filter = $CGI->param("filter");

# nickname for filtering
my $filtervalue = $CGI->param("filtervalue");

my $tag = $CGI->param("tag");

my $utftag = $tag;

utf8::decode($utftag);

# command = login | logout
my $command = $CGI->param("command");


#--------------------------------------
# Authentication
#--------------------------------------

my $loginid = $CGI->param("loginid");
my $loginpass = $CGI->param("loginpass");

if($loginid eq ""){
# Read temporal cookie
    $loginid = $CGI->cookie("loginid") || "";
    $loginpass = $CGI->cookie("loginpass") || "";
}

if($loginid eq "public"){
    $loginid = "";
}

if($command eq "logout"){
    $loginid = "";
    $loginpass = "";
}

my $cookieUser = new CGI::Cookie(
    -path => "$PositLogConfig::cgipath",
    -name => "loginid",
    -value => "$loginid",
    );
my $cookiePass = new CGI::Cookie(
    -path => "$PositLogConfig::cgipath",
    -name => "loginpass",
    -value => "$loginpass",
    );

if($style eq "rss"){
		print "Content-type: application/xml\n\n";
}
else{
		print $CGI->header(-charset => 'utf-8', -cookie => [$cookieUser,$cookiePass]); 
}

my $tags = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "tags.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "tags.dat"; exit(0); }

my $users = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "users.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "users.dat"; exit(0); }
my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }
my $pageGroups = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pagegroups.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pagegroups.dat"; exit(0); }

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages, $pageGroups, $users);

if($command eq "login"){
		my $checked = "";
		my $savedpass = "";
		if($loginid eq ""){
				$loginid = $CGI->cookie("savedloginid");
				$savedpass = $CGI->cookie("savedloginpass");
				if($loginid ne ""){
						$checked = "checked";
				}
		}

    my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'\n
   'http://www.w3.org/TR/html4/loose.dtd'>\n
<html lang='" . $PositLogConfig::language . "'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<meta http-equiv='Content-Style-Type' content='text/css'>\n
		<link rel='stylesheet' href='" . $PositLogConfig::cgipath . $PositLogConfig::admintoolsfilepath . "css/logincheck.css' type='text/css'>\n
		<script type='text/javascript'>
		<!--
		function saveOnClick()
		{
				theDay = new Date();
				theDay.setTime(theDay.getTime() + (30 * 1000 * 60 * 60 * 24));
				var box = document.getElementById('saveaccount');
				var loginid = document.getElementById('loginid').value;
				var loginpass = document.getElementById('loginpass').value;
				if(loginid == '' || loginpass == ''){
						box.checked = false;
						alert('Please enter user name and password')
						return;
				}
				if(!box.checked){
						loginid = '';
						loginpass = '';
				}
				var cs='savedloginid='+loginid+';';
				cs+=' path=" . $PositLogConfig::cgipath . ";';
				if(box.checked)
				{
						cs+=' expires='+theDay.toGMTString()+';';
				}
				document.cookie=cs;

				cs='savedloginpass='+loginpass+';';
				cs+=' path=" . $PositLogConfig::cgipath . ";';
				if(box.checked)
				{
						cs+=' expires='+theDay.toGMTString()+';';
				}
				document.cookie=cs;
		}
		// -->
		</script>
		<title>PositLog Administration : Login</title>\n
	</head>\n";

    my $BODY = "<body onLoad='document.loginform.loginid.focus()'>\n
  <div id='logintop'>\n
  <div id='login'>\n
  <h1>Login to Positlog Administration</h1>\n
  <form id='loginform' action='tag.cgi' method='post'>\n
    <p>\n
      user name<br>\n
      <input type='text' name='loginid' id='loginid' value='" . $loginid . "' size='20' tabindex='1'>\n
    </p>\n
    <p>\n
      password<br>\n
      <input type='password' name='loginpass' id='loginpass' value='" . $savedpass . "' size='20' tabindex='2'>\n
    </p>\n
    <p id='saveaccount-label'>\n
    Save my user name and password&nbsp;&nbsp;<input type='checkbox' name='saveaccount' id='saveaccount' onclick='saveOnClick();' value='1' " . $checked . ">\n
    </p>\n
    <p id='submitarea'>\n<span style='color:red; font-size:12px;'>" . $authObj->getErrorMsg . 
    "</span><br/><input type='submit' id='submitbtn' value='Login' tabindex='4'>\n
    </p>\n
		<input type='hidden' name='tag' value='$utftag'></td>\n
  </form>\n
  </div>\n
  <div id='copyright'>\n
  Powered by <a href='" . $PositLogConfig::positloghome . "'>PositLog</a>\n
  </div>\n
  </div>\n
</body>\n";

    my $FOOTER = "</html>";
		print $HEADER . $BODY . $FOOTER;
    exit(0);

}


#---------------------------------------------------------
# Prepare RSS
#---------------------------------------------------------
my $rss;
if($style eq "rss"){
		my $homepagetitle = "No title";
		my $homepagelink = "None";
    my $homepageid = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "homepage.dat")} or {};
    if($homepageid ne "") {
				my $hpid = $$homepageid;
				if($hpid =~ /^pg/){
						$hpid .= "_latest";
				}
				$homepagetitle = $pages->{$hpid}{name};
				utf8::decode($homepagetitle);
				$homepagelink = $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $hpid,
		}
		
		$rss = new Walrus::RSS(
				version => '1.0',
				encoding => 'utf-8',
				);
		
		$rss->channel(
				title => $homepagetitle . "-" . $utftag,
				link => $homepagelink,
				about => $homepagelink
				);
}

sub generateTagList{
    my %pageidspriteidModifiedTime = ();

		my $myBody = "";

    my $homepageid = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "homepage.dat")} or {};
		my $homestr = "";
    if($homepageid ne ""){
				my $hpid = $$homepageid;
				if($hpid =~ /^pg/){
						$hpid .= "_latest";
				}
				$homestr = "[<a href='" . $PositLogConfig::cgipath . "positlog.cgi?load=" . $hpid. "'>Home</a>]&nbsp;";
		}

		my %tagcount;
		foreach my $atag (keys %{$tags}){
				my $spriteCounter = 0;
				foreach my $pid (keys %{$tags->{$atag}{pages}}){
						if($targetpage eq ""){
								$spriteCounter += scalar(keys %{$tags->{$atag}{pages}{$pid}});
						}
						elsif($targetpage =~ /^pg/ && $pageGroups->{$targetpage}{pages}{$pid} == 1){
								$spriteCounter += scalar(keys %{$tags->{$atag}{pages}{$pid}});
						}
						elsif($targetpage eq $pid){
								$spriteCounter += scalar(keys %{$tags->{$atag}{pages}{$pid}});
						}
				}
				if($spriteCounter > 0){
						$tagcount{$atag} = $spriteCounter;
				}
		}

		my @sortedTags;

		if($sortby eq "dictionary"){
				$myBody .= "<h1 class='recent'>Tag list</h1>\n";
				@sortedTags = sort {$a cmp $b} (keys %tagcount);
				$homestr .= "[Sort by alphabetical order]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=count&page=$targetpage'>Sort by count</a>]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=modified_time&page=$targetpage'>Sort by modified time</a>]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=created_time&page=$targetpage'>Sort by created time</a>]";
		}
		elsif($sortby eq "created_time"){
				$myBody .= "<h1 class='recent'>Tag list (Sorted by created time)</h1>\n";
				@sortedTags = sort {$tags->{$b}{created_time} cmp $tags->{$a}{created_time}} (keys %tagcount);
				$homestr .= "[<a href='" . $PositLogConfig::cgipath . "tag.cgi?page=$targetpage'>Sort by alphabetical order</a>]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=count&page=$targetpage'>Sort by count</a>]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=modified_time&page=$targetpage'>Sort by modified time</a>]&nbsp;[Sort by created time]";
		}
		elsif($sortby eq "modified_time"){
				$myBody .= "<h1 class='recent'>Tag list (Sorted by modified time)</h1>\n";
				@sortedTags = sort {$tags->{$b}{modified_time} cmp $tags->{$a}{modified_time}} (keys %tagcount);
				$homestr .= "[<a href='" . $PositLogConfig::cgipath . "tag.cgi?page=$targetpage'>Sort by alphabetical order</a>]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=count&page=$targetpage'>Sort by count</a>]&nbsp;[Sort by modified time]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=created_time&page=$targetpage'>Sort by created time</a>]";
		}
		elsif($sortby eq "count"){
				$myBody .= "<h1 class='recent'>Tag list (Sorted by count)</h1>\n";
				@sortedTags = sort {$tagcount{$b} <=> $tagcount{$a}} (keys %tagcount);
				$homestr .= "[<a href='" . $PositLogConfig::cgipath . "tag.cgi?page=$targetpage'>Sort by alphabetical order</a>]&nbsp;[Sort by count]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=modified_time&page=$targetpage'>Sort by modified time</a>]&nbsp;[<a href='" . $PositLogConfig::cgipath . "tag.cgi?sortby=created_time&page=$targetpage'>Sort by created time</a>]";
		}

		$myBody .= "<br><p class='recentcontrols'>$homestr";

    $myBody .= "\n";

    $myBody .= "<br>";

    my $counter = 0;

		$myBody .= "<div class='tagline1'><div class='tagname'>Tag</div><div class='tagcount' style='font-size:100%'>Count</div><div class='tagmodified' style='font-size:100%'>Modified time</div><div class='tagcreated' style='font-size:100%'>Created time</div></div>\n";
		foreach my $atag (@sortedTags){

				my $createdTime = $tags->{$atag}{created_time};
				$createdTime =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
				$createdTime = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
				# This is ad-hoc i18n. It will be improbed in version 0.61.
				if($PositLogConfig::language eq "en"){
						$createdTime = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
				}
				my $modifiedTime = $tags->{$atag}{modified_time};
				$modifiedTime =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
				$modifiedTime = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
				# This is ad-hoc i18n. It will be improbed in version 0.61.
				if($PositLogConfig::language eq "en"){
						$modifiedTime = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
				}
				my $utfatag = $atag;
#				utf8::decode($utfatag);
				my $tagenc = $atag;
				$tagenc =~ s/([^\w ])/'%' . unpack('H2', $1)/eg;
				$tagenc =~ tr/ /+/;
				
				if($counter % 2 == 0){
						$myBody .= "<div class='tagline2'>";
				}
				else{
						$myBody .= "<div class='tagline1'>";
				}
	
				my $tagurl = $PositLogConfig::cgipath . "tag/" . $tagenc;
				if($PositLogConfig::mod_rewrite == 0){
						$tagurl = $PositLogConfig::cgipath . "tag.cgi?tag=" . $tagenc;
				}
				$myBody .= "<div class='tagname'><a href='" . $tagurl . "'>" . $utfatag . "</a></div><div class='tagcount'>" . $tagcount{$atag} . "</div><div class='tagmodified'>" . $modifiedTime . "</div><div class='tagcreated'>" . $createdTime . "</div></div>\n";

				$counter ++;
    }

    $myBody .= "\n";

    return $myBody;
}


sub generateSpritesList{
    my %pageidspriteidModifiedTime = ();

		my $tagurl = $PositLogConfig::cgipath . "tag/";
		if($PositLogConfig::mod_rewrite == 0){
				$tagurl = $PositLogConfig::cgipath . "tag.cgi";
		}
    my $myBody = "<h1 class='recent'>About \"$utftag\"&nbsp; <a href='" . $tagurl . "'>(list)</a></h1>\n";


    my $pageCounter = 0;
    my $spriteCounter = 0;

    my $availablePageCounter = 0;
    my $availableSpriteCounter = 0;

    my $filteredSpriteCounter = 0;

    foreach my $pid (keys %{$tags->{$utftag}{pages}}){
				$pageCounter ++;
				$spriteCounter += scalar(keys %{$tags->{$utftag}{pages}{$pid}});
				my $permissionLevel = $authObj->getPermissionLevel($pid);
				if($permissionLevel < $PositLogParam::USERLEVEL_READ){
						next;
				}
				$availablePageCounter ++;

				my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $pid . "/sprites.dat")};
				if($@){ warn $@; print "Cannot read " . $PositLogConfig::datapath . $pid . "/sprites.dat\n"; exit(0); }

				foreach my $keyID (keys %{$tags->{$utftag}{pages}{$pid}}){
						$availableSpriteCounter ++;
						if($filter eq "id" && $authObj->isAdminUser){
								if($spritesHash->{$keyID}{author_id} eq $filtervalue){
										$pageidspriteidModifiedTime{$pid . ":" . $keyID} = $spritesHash->{$keyID}{modified_time};
										$filteredSpriteCounter ++;
								}
						}
						elsif($filter eq "nickname"){
								if($users->{$spritesHash->{$keyID}{author_id}}{nickname} eq $filtervalue){
										$pageidspriteidModifiedTime{$pid . ":" . $keyID} = $spritesHash->{$keyID}{modified_time};
										$filteredSpriteCounter ++;
								}
						}
						else{
								$pageidspriteidModifiedTime{$pid . ":" . $keyID} = $spritesHash->{$keyID}{modified_time};
								$filteredSpriteCounter ++;
						}
				}
    }

    my $homepageid = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "homepage.dat")} or {};
		my $homestr = "";
    if($homepageid ne ""){
				my $hpid = $$homepageid;
				if($hpid =~ /^pg/){
						$hpid .= "_latest";
				}
				$homestr = "[<a href='" . $PositLogConfig::cgipath . "positlog.cgi?load=" . $hpid. "'>Home</a>]&nbsp;";
		}

    if(!$authObj->isValidUser && !$authObj->isAdminUser){
				$myBody .= "<br><p class='recentcontrols'>$homestr [<a href='" . $PositLogConfig::cgipath . "tag.cgi?command=login&tag=$tag'>Login</a>]";
    }
    else{
				my $tagenc = $tag;
				$tagenc =~ s/([^\w ])/'%' . unpack('H2', $1)/eg;
				$tagenc =~ tr/ /+/;
				$myBody .= "<br><p class='recentcontrols'>$homestr [<a href='" . $PositLogConfig::cgipath ."tag.cgi?command=logout&tag=$tagenc'>Logout</a>]";
    }

    $myBody .= "&nbsp;&nbsp;&nbsp;&nbsp;(Number of $utftag: $spriteCounter)\n";

    if($filter eq "nickname") {
				utf8::decode($filtervalue);
				$myBody .= "<br>Number of $utftag filtered by nickname [$filtervalue] : $filteredSpriteCounter";
    }
    elsif($filter eq "id") {
				$myBody .= "<br>Number of $utftag filtered by id [$filtervalue] : $filteredSpriteCounter";
    }

    $myBody .= "</p>";

    $myBody .= "<form class='recentcontrols' action='" . $PositLogConfig::cgipath . "tag.cgi' method='POST'>\n"
				. "<table><tr>"

				. "<td>\n"
				. "<select name='max'>\n"
				. "<option value='$maxnumber'>Most recent $maxnumber</option>\n"
				. "<option value='15'>Most recent 15</option>\n"
				. "<option value='30'>Most recent 30</option>\n"
				. "<option value='50'>Most recent 50</option>\n"
				. "<option value='100'>Most recent 100</option>\n"
				. "</select>\n"
				. "</td></tr>"

				. "<tr><td>"
				. "<select name='filter'>\n";

    if($filter eq "id"){
				$myBody .= "<option value='id'>Filter by ID</option>\n";
    }
    elsif($filter eq "nickname"){
				$myBody .= "<option value='nickname'>Filter by nickname</option>\n";
    }
    else{
				$myBody .= "<option value=''>No filter</option>\n";
    }
    
    $myBody .= "<option value=''>No filter</option>\n";

    if($authObj->isAdminUser){
				$myBody .= "<option value='id'>Filter by ID</option>\n";
    }

    $myBody .= "<option value='nickname'>Filter by nickname</option>\n"

				. "</select>\n"
				. "</td>\n"
				. "<td>"
				. ": <input type='text' name='filtervalue' value=''>\n"
				. "</td>\n"
				. "</tr>"
				. "<tr>"
				. "<td><input type='submit' value='Change'>\n"
				. "<input type='hidden' name='tag' value='$utftag'></td>\n"
				. "</tr>"
				. "</table>"
				. "</form>\n";


    # sort pages by modified_time
    $myBody .= "\n";
    my $counter = 0;
		foreach my $pidsid (sort { $pageidspriteidModifiedTime{$b} <=> $pageidspriteidModifiedTime{$a} } (keys %pageidspriteidModifiedTime)){
				my $tmpdate = $pageidspriteidModifiedTime{$pidsid};
				$tmpdate =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
				my $modifiedTime = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
				# This is ad-hoc i18n. It will be improbed in version 0.61.
				if($PositLogConfig::language eq "en"){
						$modifiedTime = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
				}
				my $modifiedTime2 = "$1-$2-$3T$4:$5:$6+09:00";
				my @tmpArray = split(/:/, $pidsid);
				my $tmppid = $tmpArray[0];
				my $tmpsid = $tmpArray[1];
				my $singleContents = "no contents";

				my $contents = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $tmppid . "/static/" . $tmpsid . ".spr")} or "";
				if($contents ne ""){
						my $utfcontents = $$contents;
						utf8::decode($utfcontents);
						$singleContents = $utfcontents;
				}
				my $newpath = $PositLogConfig::cgipath . $PositLogConfig::datapath;
				if($singleContents !~ /$newpath/){
						$singleContents =~ s/$PositLogConfig::datapath/$newpath/g;
						$singleContents =~ s/\/\/$PositLogConfig::datapath/$newpath/g;
				}

				if($singleContents !~ /^<canvas.+?><\/canvas><script type=['"]text\/javascript['"]>\n<!--\nPLG.draw(.+?);\n\/\/ -->\n<\/script>$/){
						$singleContents =~ s/<script.+?<\/script>//gis;
				}

				if($style eq "rss"){
						my $abst = $singleContents;
						$abst =~ s/<br>/\n/gis;
						$abst =~ s/&amp;/&/gis;
						$abst =~ s/<.+?>//gis;
						utf8::decode($abst);
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
						if($header eq ""){
								if($singleContents =~ /<(.+?)\s.+?>/is){
										$header = $1;
								}
								elsif($singleContents =~ /<(.+?)>/is){
										$header = $1;
								}
						}

						$header =~ s/&/&amp;/gis;
						
						if($singleContents =~ /^<canvas/i){
								$header = "Drawing";
								$singleContents = "Cannot display this drawing.";
						}

						$singleContents = "<![CDATA[ $singleContents ]]>";

						utf8::decode($header);

						my $ptitle = $pages->{$tmppid}{name};
						utf8::decode($ptitle);
						$rss->add_item(
								title => $header . " in " . $ptitle,
								link => $siteurl . "./positlog.cgi?load=" . $tmppid. "#id_" . $tmpsid,
								description => $singleContents,
								dc_date => $modifiedTime2,
								);
				}
				else{
						my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $tmppid . "/sprites.dat")};
						if($@){ warn $@; print "Cannot read the sprite list.\n"; exit(0); }

						my $sprite_type  = $spritesHash->{$tmpsid}{type};
						if($sprite_type eq "dynamic"){
								my $sourceSprite = $spritesHash->{$tmpsid}{plugin_source};
								if($sourceSprite ne ""){
										my $sprite_plugin  =$spritesHash->{$sourceSprite}{plugin};

										if($sprite_plugin =~ /^(.+?),(.+?);(.+?)$/is){
												my $pluginName = $1;
												# import dynamic sprites
												if (-f "./PositLogPlugin/" . $pluginName . "/" . $pluginName . ".pm"){
														my $cssfile = eval 'use ' . "PositLogPlugin::" . $pluginName . "::" . $pluginName .';' . "PositLogPlugin::" . $pluginName . "::" . $pluginName . q/::getCSS()/;
														if($cssfile ne ""){
																$CSSHEADER .= "		<link rel='stylesheet' href='" .  $PositLogConfig::cgipath . "PositLogPlugin/" . $pluginName . "/" . $cssfile ."' type='text/css'>\n";
														}
												}
										}
								}
						}
						my $ptitle = $pages->{$tmppid}{name};
						utf8::decode($ptitle);
						$myBody .= "<div class='recentcontentsline'>" . $modifiedTime . "&nbsp;&nbsp;";
						$myBody .= "<a href='" . $PositLogConfig::cgipath . "positlog.cgi?load=" . $tmppid . "#id_" . $tmpsid . "'>" . $tmpsid . "</a>&nbsp;&nbsp;&nbsp;&nbsp;in <a href='" . $PositLogConfig::cgipath . "positlog.cgi?load=" . $tmppid . "'>" . $ptitle . "</a><br>\n";

						foreach my $atag (keys %{$spritesHash->{$tmpsid}{tags}}){
								my $utfatag = $atag;
								utf8::decode($utfatag);
								my $tagenc = $atag;
								$tagenc =~ s/([^\w ])/'%' . unpack('H2', $1)/eg;
								$tagenc =~ tr/ /+/;

								my $tagurl = $PositLogConfig::cgipath . "tag/" . $tagenc;
								if($PositLogConfig::mod_rewrite == 0){
										$tagurl = $PositLogConfig::cgipath . "tag.cgi?tag=" . $tagenc;
								}
								$myBody .= "[<a href='" . $tagurl . "'>" . $utfatag . "</a>] ";
						}
						$myBody .= "<br>\n";

						$myBody .= "<div class='recentcontents'>";
						
						$myBody .= "<div>" . $singleContents . "</div></div></div>\n";

				}

				$counter ++;
				if($counter >= $maxnumber){
						last;
				}
    }
    $myBody .= "\n";

    return $myBody;
}


sub generateMainPage{
    my $myBODY = "";

		if($tag ne ""){
				$myBODY .= &generateSpritesList();
		}
		else{
				$myBODY .= &generateTagList();
		}

    return $myBODY;
}


#---------------------------------------------------------
# Generate HTML
#---------------------------------------------------------

my $BODY = &generateMainPage();


my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'\n
   'http://www.w3.org/TR/html4/loose.dtd'>\n
<html lang='" . $PositLogConfig::language . "'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<meta http-equiv='Content-Style-Type' content='text/css'>\n
    <meta http-equiv='Content-Script-Type' content='text/javascript'>\n
    <!--[if IE]><script type='text/javascript' src='" . $PositLogConfig::systempath . "excanvas.js'></script><![endif]-->\n";
$HEADER .= "		<script type='text/javascript' src='" .  $PositLogConfig::systempath . "drawingonlist.js' charset='UTF-8'></script>\n";

$CSSHEADER = "		<link rel='stylesheet' href='" .  $PositLogConfig::systempath . "css/positlog.css' type='text/css'>\n" . $CSSHEADER;

$HEADER .= $CSSHEADER;
$HEADER .=  "		<link rel='stylesheet' href='" . $PositLogConfig::cgipath . $PositLogConfig::admintoolsfilepath . "css/positlogadmin.css' type='text/css'>\n";

if($tag ne ""){
		my $tagenc = $tag;
		$tagenc =~ s/([^\w ])/'%' . unpack('H2', $1)/eg;
		$tagenc =~ tr/ /+/;
		$HEADER .= "		<link rel='alternate' title='RSS' href='" . $PositLogConfig::cgipath . "tag.cgi?style=rss&tag=" . $tagenc . "' type='application/rss+xml'/>\n";
}

$HEADER .="	<title>PositLog Tags - $utftag</title>\n
    </head>\n<body class='recent' onLoad='bodyOnLoad()'>\n";


my $FOOTER = "</body></html>";

if($style eq "rss"){
		my $output = $rss->as_string;
		utf8::encode($output);
		print $output;
}
else{
		my $output = $HEADER . $BODY . $FOOTER;
		utf8::encode($output);
		print $output;
}
