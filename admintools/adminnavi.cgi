#!/usr/bin/perl

# --------------------------------------------------------
# adminnavi.cgi:
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(../);
use strict;
use CGI qw(-debug :standard);
use PositLogConfig;

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8');

my $HTML = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'
   'http://www.w3.org/TR/html4/loose.dtd'>
<html lang='ja'>
	<head>
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>
		<meta http-equiv='Content-Style-Type' content='text/css'>
		<link rel='stylesheet' href='" . "../" . $PositLogConfig::admintoolsfilepath . "css/adminnavi.css' type='text/css'>\n
		<title>PositLog Administration</title>
	</head>
	<body>
		<div class='navigator1'><a href='./positlogadmin.cgi' target='admin'>Top</a></div>
<br>
		<div class='navigator1_user'><a href='./usermanager.cgi' target='admin'>User groups</a></div>
		<div class='navigator2_user'><a href='./usermanager.cgi?usergroupid=all' target='admin'>Users</a></div>
<br>
		<div class='navigator1_page'><a href='./pagemanager.cgi' target='admin'>Page groups</a></div>
		<div class='navigator2_page'><a href='./pagemanager.cgi?pagegroupid=all' target='admin'>Pages</a></div>
<br>
		<div class='navigator1'><a href='../recentcontents.cgi' target='_top'>Recent pages</a></div>
<br><br><br>
		<div class='navigator1'><a href='./positlogadmin.cgi?command=logout' target='admin'>Logout</a></div>

<br><br><br><br>
		<div id='copyright'>Powered by</div><div id='copyright2'><a href='". $PositLogConfig::positloghome . "' target='_blank'>PositLog</a></div>

	</body>
</html>";

print $HTML;

