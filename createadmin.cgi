#!/usr/bin/perl

# --------------------------------------------------------
# createadmin.cgi:
#      cgi for creating administrator for PositLog
#  (tested under perl 5.8.4)
# --------------------------------------------------------

# --------------------------------------------------------
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_nstore);   # is default library (upper perl 5.8)
use PositLogConfig;

# I17n
eval 'use lang::lang_' . $PositLogConfig::language . ';';
sub MESSAGE{
		no strict "refs"; my ($NAME) = @_; ${ "lang::lang_" . $PositLogConfig::language . "::" . $NAME };
}


my $CGI = new CGI;
my $user = $CGI->param("loginid");
my $password = $CGI->param("loginpass");
my $command = $CGI->param("command");

print $CGI->header(-charset => 'utf-8'); # HTTP header

my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'\n
   'http://www.w3.org/TR/html4/loose.dtd'>\n
<html lang='" . $PositLogConfig::language . "'>\n
	<head>\n
		<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>\n
		<meta http-equiv='Content-Style-Type' content='text/css'>\n
		<link rel='stylesheet' href='" . $PositLogConfig::admintoolsfilepath . "css/logincheck.css' type='text/css'>\n
                <meta http-equiv='Content-Script-Type' content='text/javascript'>
		<title>PositLog Administration</title>\n"
	. "</head>\n";

my $BODY = "<body>\n";

if (! -f $PositLogConfig::adminpath . "key.dat")
{
	if($user ne "" && $password ne "" && $command eq "create")
	{
		if($user =~ /[^a-zA-Z0-9\_\-\@]/)
		{
			print "<div style='text-align: center'>Administrator's name includes invalid characters.<br>\n";
			print "<a href='./createadmin.cgi'>back</a></div>\n";
			exit(0);
		}
		if($password =~ /[^a-zA-Z0-9\_\!\#\%\&\(\)\*\+\-\/\.\:\;\<\=\>\'\"\\\?\@\[\]\^\`\{\|\}]/)
		{
			print "<div style='text-align: center'>The password includes invalid characters.<br>\n";
			print "<a href='./createadmin.cgi'>back</a></div>\n";
			exit(0);
		}
		if(length($password) > 8)
		{
			print "<div style='text-align: center'>The password is too long.<br>\n";
			print "<a href='./createadmin.cgi'>back</a></div>\n";
			exit(0);

		}

		my %admin = {};
		my $salt = "lc";
		$admin{$user}{"password"} = crypt($password, $salt);
		if(!eval{Storable::lock_nstore \%admin, $PositLogConfig::adminpath . "key.dat"})
		{
			print "Cannot create administration user.\n";
			print "Please check file permission.\n";
			exit(0);
		}
		$BODY .= "<div id='logintop'>\n
  <div id='login'>\n
  <p style='color:red; font-size:18px'>\n
  Succeed!<br>
  <a href='" . $PositLogConfig::admintoolscgipath . "admin.cgi'>Next, please login to PositLog Administration.</a>
  </p></div></div>\n";

	}
	else
	{
		$BODY .= "<div id='logintop'>\n
  <div id='login'>\n
  <h1>Create administrator for PositLog</h1>\n";

		if($user eq "" && $command eq "create")
		{
			$BODY .= "<p style='color:red; font-size:12px;'>Error!&nbsp;&nbsp;&nbsp;Please enter the name of administrator."
		}
		if($password eq "" && $command eq "create")
		{
			$BODY .= "<p style='color:red; font-size:12px;'>Error!&nbsp;&nbsp;&nbsp;Please enter the password for administrator."
		}

		$BODY .= "<form id='loginform' action='createadmin.cgi' method='post'>\n
    <p class='availablechar'>\n" . MESSAGE("CREATEADMIN_IDNOTE") . "    </p>\n
    <p>\n
      <input type='text' name='loginid' id='loginid' value='' size='20' tabindex='1'>\n
    </p>\n
    <p class='availablechar'>\n" . MESSAGE("CREATEADMIN_PASSWORDNOTE") . "    </p>\n
    <p>\n
      <input type='password' name='loginpass' id='loginpass' value='' maxlength='8' size='10' tabindex='2'>\n
      <input type='hidden' name='command' id='command' value='create'>\n
    </p>\n
    <p><input type='submit' id='submitbtn' value='Create' tabindex='3'></p>\n
  </form>\n
  </div>\n
  </div>\n";
	}
}
else
{	
	$BODY .= "<p>Administrator already exists.<br>Please delete key.dat under your adminpath if you want to change administrator's name and password.</p>"
}

$BODY .= "</body>\n";

my $FOOTER = "</html>";

print $HEADER . $BODY . $FOOTER;



