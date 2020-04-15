#!/usr/bin/perl

# --------------------------------------------------------
# admintop.cgi:
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
		<link rel='stylesheet' href='" . "../" . $PositLogConfig::admintoolsfilepath . "css/admintop.css' type='text/css'>\n
		<title>PositLog Administration</title>
	</head>
	<body class='top'>
		<a href='./admin.cgi' target='_top'><img src='" . "../" . $PositLogConfig::admintoolsfilepath . "logoadmin.jpg' alt='PositLog' width='320' height='98' border='0' style='margin:3px 7px 7px 7px;'></a>
	</body>
</html>";

print $HTML;
