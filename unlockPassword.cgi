#!/usr/bin/perl

# --------------------------------------------------------
# unlockPassword.cgi:
#      cgi for unlocking public password
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use lib qw(./extlib);

use strict;
use CGI qw(-debug :standard);
use Storable qw(lock_retrieve lock_nstore);   # is default library (upper perl 5.8)
use PositLogConfig;
use PositLogParam;
use PositLogAuth;
use JSON;

my $CGI = new CGI;
print $CGI->header(-charset => 'utf-8'); # HTTP header

my $pageid = $CGI->param("pageid");
my $id = $CGI->param("id");
my $public_password = $CGI->param("public_password");

my @ids = split( /;/ , $id );

# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";

my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass);

my $spritesHash = eval{ Storable::lock_retrieve($PositLogConfig::datapath . $pageid . "/sprites.dat")} or {};
if($spritesHash eq ""){	print "Cannot read sprites.dat.\n"; exit(0); }

if($authObj->isPublicUser){
		foreach my $sid (@ids){
				if($spritesHash->{$sid}{author_id} eq "public"){
						my $cryptpass = $spritesHash->{$sid}{public_password};
						if($cryptpass eq ""){
								print "Permission denied\n";
								exit(0);
						}
						my $salt="zi";
						my $cryptpass2 = crypt($public_password, $salt);
						if($cryptpass ne $cryptpass2){
								print "invalid_public_password\n";
								exit(0);
						}
				}
				else{
						print "Permission denied\n";
						exit(0);
				}
		}
}
elsif($authObj->isAdminUser){
		# nop
}
elsif($authObj->isAuthor($pageid)){
		# nop
}
elsif($authObj->isSubadmin){
		# nop
}
else{
		print "Permission denied\n";
		exit(0);
}

foreach my $sid (@ids){
		$spritesHash->{$sid}{public_password} = "";
}

if(!eval{Storable::lock_nstore $spritesHash, $PositLogConfig::datapath . $pageid . "/sprites.dat"}){
		print "Cannot write sprites.dat.\n"; 
		exit(0);
}

print "unlockpassword\n";
