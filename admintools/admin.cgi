#!/usr/bin/perl

# --------------------------------------------------------
# admin.cgi:
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(../);
use strict;
use CGI qw(-debug :standard);

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8');

my $HTML = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'
   'http://www.w3.org/TR/html4/loose.dtd'>
<html lang='ja'>
	<head>
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>
		<title>PositLog Administration</title>
	</head>
  <frameset rows='110,*' framepadding='0' framespacing='0' border='0'>
		<frame src='./admintop.cgi' name='admintop' scrolling='no'>
		<frameset cols='170,*' framepadding='0' framespacing='0' border='0'>
			<frame src='./adminnavi.cgi' name='adminnavi' scrolling='no'>
			<frame src='./positlogadmin.cgi' name='admin'>
		</frameset>
	</frameset>
  <noframes>
		This page uses frame.
  </noframes>
</html>";

print $HTML;

