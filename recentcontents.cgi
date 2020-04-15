#!/usr/bin/perl

# --------------------------------------------------------
# recentcontents.cgi
#      cgi for showing new contents on PositLog 
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
use PositLogParam;
use Walrus::RSS;
use JSON; # Sometimes sprites.dat inclues JSON::NotString

use utf8;

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


# type =  page | sprite
my $type = $CGI->param("type");

# filter = id | nickname
my $filter = $CGI->param("filter");

# nickname for filtering
my $filtervalue = $CGI->param("filtervalue");

# command = login | logout
my $command = $CGI->param("command");

my $pagegroupid = $CGI->param("pagegroupid");
if($pagegroupid eq ""){
		$pagegroupid = "all";
}

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
		<link rel='stylesheet' href='" . $PositLogConfig::admintoolsfilepath . "css/logincheck.css' type='text/css'>\n
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
  <form id='loginform' action='recentcontents.cgi' method='post'>\n
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
    <input type='hidden' name='type' value='$type'>\n
    </p>\n
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
				my $mypageid = $$homepageid;
				$homepagetitle = $pages->{$mypageid}{name};
				if($mypageid =~ /^pg/){
						$mypageid .= "_latest";
				}
				utf8::decode($homepagetitle);
				$homepagelink = $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $mypageid,
		}
		
		$rss = new Walrus::RSS(
				version => '1.0',
				encoding => 'utf-8',
				);

		$rss->channel(
				title => $homepagetitle,
				link => $homepagelink,
				about => $homepagelink
				);
}


#---------------------------------------------------------
# Generate Pages List 
#---------------------------------------------------------

sub generatePagesList{
    my %pageidModifiedTime = ();

    my $homepageid = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "homepage.dat")} or {};
		my $homepid = "";
    if($homepageid ne ""){
				$homepid = $$homepageid;
				if($homepid =~ /^pg/){
						$homepid .= "_latest";
				}
    }

    my $myBody = "";
    if($homepid ne ""){
				$myBody = "<h1 class='recent'>Recently modified pages&nbsp;&nbsp;(<a href='./positlog.cgi?load=" . $homepid . "'>Home</a>)</h1>\n";
    }
    else{
				$myBody = "<h1 class='recent'>Recently modified pages</h1>\n";
    }


    if(!$authObj->isValidUser && !$authObj->isAdminUser){
				$myBody .= "<p class='recentcontrols'><a href='./recentcontents.cgi?command=login&type=page'>[Login]</a> <a href='./recentcontents.cgi?type=sprite'>[Recent Sprites]</a></p>";
    }
    else{
				$myBody .= "<p class='recentcontrols'><a href='./recentcontents.cgi?command=logout&type=page'>[Logout]</a> <a href='./recentcontents.cgi?type=sprite'>[Recent Sprites]</a></p>";
    }

    $myBody .= "<form class='recentcontrols' action='./recentcontents.cgi' method='POST'>"
				. "<select name='max'>"
				. "<option value='$maxnumber'>Most recent $maxnumber</option>"
				. "<option value='15'>Most recent 15</option>"
				. "<option value='30'>Most recent 30</option>"
				. "<option value='50'>Most recent 50</option>"
				. "<option value='100'>Most recent 100</option>"
				. "</select>"
				. "<input type='submit' value='Change'>\n"
				. "<input type='hidden' name='type' value='page'>"
				. "</form>";
    

    foreach my $pid (keys %{$pageGroups->{$pagegroupid}{pages}}){
				if($pid eq "." || $pid eq ".." || $pid eq ".htaccess" || $pid eq ".htpasswd" ){
						next;
				}

				if($pid =~ "^pg"){
						next;
				}

				my $permissionLevel = $authObj->getPermissionLevel($pid);
				if($permissionLevel < $PositLogParam::USERLEVEL_READ){
						next;
				}
				$pageidModifiedTime{$pid} = $pages->{$pid}{modified_time};
    }

    my @pageList2 = ();
    while((my $key, my $value) = each %pageidModifiedTime){
				push (@pageList2, {pid => $key, modified_time => $value});
    }

		my $counter = 0;
    # sort pages by modified_time
    $myBody .= "\n";
		foreach my $tmppid (sort { $pageidModifiedTime{$b} <=> $pageidModifiedTime{$a} } (keys %pageidModifiedTime)){
				my $tmpdate = $pageidModifiedTime{$tmppid};
				$tmpdate =~ /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/i;
				my $modifiedTime = "$1/$2/$3&nbsp;&nbsp;$4:$5:$6";
				# This is ad-hoc i18n. It will be improbed in version 0.61.
				if($PositLogConfig::language eq "en"){
						$modifiedTime = "$2/$3/$1&nbsp;&nbsp;$4:$5:$6";
				}
				my $modifiedTime2 = "$1-$2-$3T$4:$5:$6+09:00";

				my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $tmppid . "/sprites.dat")};
				if($@){ warn $@; print "Cannot read the sprite list of $tmppid: $@\n"; exit(0); }

				my @sortedSid = sort {$spritesHash->{$b}{modified_time} <=> $spritesHash->{$a}{modified_time}} (keys %$spritesHash);
				my $latestsid = $sortedSid[0];

				my $singleContents = "no contents";
				my $contents = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $tmppid . "/static/" . $latestsid . ".spr")} or "";
				if($contents ne ""){
						my $utfcontents = $$contents;
						utf8::decode($utfcontents);
						$singleContents = $utfcontents;
				}

				if($singleContents !~ /^<canvas.+?><\/canvas><script type=['"]text\/javascript['"]>\n<!--\nPLG.draw(.+?);\n\/\/ -->\n<\/script>$/s){
						$singleContents =~ s/<script.+?<\/script>//gis;
				}

				if($style eq "rss"){
						if($singleContents =~ /^<canvas/i){
								$singleContents = "Cannot display this drawing.";
						}

						$singleContents = "<![CDATA[ $singleContents ]]>";

						my $ptitle = $pages->{$tmppid}{name};
						utf8::decode($ptitle);

						$rss->add_item(
								title => $ptitle,
								link => $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $tmppid. "&amp;id=" . $latestsid,
								description => $singleContents,
								dc_date => $modifiedTime2,
								);

				}
				else{
						my $ptitle = $pages->{$tmppid}{name};
						utf8::decode($ptitle);

						$myBody .= "<div class='recentcontentsline'>" . $modifiedTime . "&nbsp;&nbsp;&nbsp;&nbsp;<a href='./positlog.cgi?load=" . $tmppid . "'>" . $ptitle . "</a>&nbsp;&nbsp;&nbsp;&nbsp;";

						my $sprite_type  =$spritesHash->{$latestsid}{type};
						if($sprite_type eq "dynamic"){
								my $sourceSprite = $spritesHash->{$latestsid}{plugin_source};
								if($sourceSprite ne ""){
										my $sprite_plugin  =$spritesHash->{$sourceSprite}{plugin};
										if($sprite_plugin =~ /^(.+?),(.+?);(.+?)$/is){
												my $pluginName = $1;
												# import css of dynamic sprites
												if (-f "./PositLogPlugin/" . $pluginName . "/" . $pluginName . ".pm"){
														my $cssfile = eval 'use ' . "PositLogPlugin::" . $pluginName . "::" . $pluginName .';' . "PositLogPlugin::" . $pluginName . "::" . $pluginName . q/::getCSS()/;
														if($cssfile ne ""){
																$CSSHEADER .= "		<link rel='stylesheet' href='" .  $PositLogConfig::cgipath . "PositLogPlugin/" . $pluginName . "/" . $cssfile ."' type='text/css'>\n";
														}
												}
										}
								}
						}


						$myBody .= "(<a href='./positlog.cgi?load=" . $tmppid . "&id=" . $latestsid . "'>" . $latestsid . "</a>)<br>\n";
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



#---------------------------------------------------------
# Generate Sprites List 
#---------------------------------------------------------

sub generateSpritesList{
    my %pageidspriteidModifiedTime = ();

    my $homepageid = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "homepage.dat")} or {};
    my $myBody = "";
    if($homepageid ne ""){
				my $homepid = $$homepageid;
				if($homepid =~ /^pg/){
						$homepid .= "_latest";
				}
				$myBody = "<h1 class='recent'>Recently modified sprites&nbsp;&nbsp;(<a href='./positlog.cgi?load=" . $homepid. "'>Home</a>)</h1>\n";
    }
    else{
				$myBody = "<h1 class='recent'>Recently modified sprites</h1>\n";
    }

    my $pageCounter = 0;
    my $spriteCounter = 0;

    my $availablePageCounter = 0;
    my $availableSpriteCounter = 0;

    my $filteredSpriteCounter = 0;

    foreach my $pid (keys %{$pageGroups->{$pagegroupid}{pages}}){
				if($pid eq "." || $pid eq ".." || $pid eq ".htaccess" || $pid eq ".htpasswd"){
						next;
				}

				my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $pid . "/sprites.dat")};
				if($@){ warn $@; print "Cannot read the sprite list of $pid: $@\n"; exit(0); }

				$pageCounter ++;
				$spriteCounter += scalar(keys %$spritesHash);

				my $permissionLevel = $authObj->getPermissionLevel($pid);
				if($permissionLevel < $PositLogParam::USERLEVEL_READ){
						next;
				}

				$availablePageCounter ++;
				foreach my $keyID (keys %$spritesHash){
						if($keyID =~ /_link$/){
								next;
						}
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

    
    if(!$authObj->isValidUser && !$authObj->isAdminUser){
				$myBody .= "<p class='recentcontrols'><a href='./recentcontents.cgi?command=login&type=sprite'>[Login]</a> <a href='./recentcontents.cgi?type=page'>[Recent Pages]</a>";
    }
    else{
				$myBody .= "<p class='recentcontrols'><a href='./recentcontents.cgi?command=logout&type=sprite'>[Logout]</a> <a href='./recentcontents.cgi?type=page'>[Recent Pages]</a>";
    }

    $myBody .= "&nbsp;&nbsp;&nbsp;&nbsp;(Total pages : $pageCounter) (Total sprites: $spriteCounter)\n";

    if($filter eq "nickname") {
				utf8::decode($filtervalue);
				$myBody .= "<br>Number of sprites filtered by nickname [$filtervalue] : $filteredSpriteCounter";
    }
    elsif($filter eq "id") {
				$myBody .= "<br>Number of sprites filtered by id [$filtervalue] : $filteredSpriteCounter";
    }

    $myBody .= "</p>";

    $myBody .= "<form class='recentcontrols' action='./recentcontents.cgi' method='POST'>\n"
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
				. "<input type='hidden' name='type' value='sprite'></td>\n"
				. "</tr>"
				. "</table>"
				. "</form>\n";


    my @pageList2 = ();
    while ((my $key, my $value) = each %pageidspriteidModifiedTime){
				push (@pageList2, {pidsid => $key, modified_time => $value});
    }

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


				if($singleContents !~ /^<canvas.+?><\/canvas><script type=['"]text\/javascript['"]>\n<!--\nPLG.draw(.+?);\n\/\/ -->\n<\/script>$/){
						$singleContents =~ s/<script.+?<\/script>//gis;
				}


				if($style eq "rss"){
						my $abst = $singleContents;
						$abst =~ s/<br\s?\/?>/\n/gis;
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
								link => $siteurl . $PositLogConfig::cgipath . "positlog.cgi?load=" . $tmppid. "&amp;id=" . $tmpsid,
								description => $singleContents,
								dc_date => $modifiedTime2,
								);
				}
				else{
						my $spritesHash = eval{Storable::lock_retrieve($PositLogConfig::datapath . $tmppid . "/sprites.dat")};
						if($@){ warn $@; print "Cannot read the sprite list of $tmppid: $@\n"; exit(0); }

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
						$myBody .= "<a href='./positlog.cgi?load=" . $tmppid . "&id=" . $tmpsid . "'>" . $tmpsid . "</a>&nbsp;&nbsp;&nbsp;&nbsp;in <a href='./positlog.cgi?load=" . $tmppid . "'>" . $ptitle . "</a><br>\n";

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

   if($type eq "page" || $type eq ""){
				$myBODY .= &generatePagesList();
    }
    elsif($type eq "sprite"){
				$myBODY .= &generateSpritesList();
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
$HEADER .=  "		<link rel='stylesheet' href='" . $PositLogConfig::admintoolsfilepath . "css/positlogadmin.css' type='text/css'>\n";

$HEADER .= "		<link rel='alternate' title='RSS' href='" . $PositLogConfig::cgipath . "recentcontents.cgi?type=" . $type . "&pagegroupid=" . $pagegroupid . "&style=rss' type='application/rss+xml'/>\n";


$HEADER .="	<title>PositLog Recent Contents</title>\n
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
