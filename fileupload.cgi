#!/usr/bin/perl

# --------------------------------------------------------
# fileupload.cgi
#      cgi for PositLog file uploader
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use CGI qw(-debug :standard);
use CGI::Cookie;
use Storable qw(lock_retrieve lock_nstore);   # is default module (upper perl 5.8)
use File::Basename; # is default module
use PositLogAuth;
use PositLogConfig;

# --------------------------------------------------------

my $width = 0;
my $height = 0;
my $basename = "";
my $errormsg = "";

sub getSize{
    if($basename =~ /^.+\.(jpg|jpeg)$/i){
				my ($file) = @_;
				my($i) = 2;
				my($t, $m, $c, $l);
				while (1) {
						$t = substr($file, $i, 4); $i += 4;
						($m, $c, $l) = unpack("a a n", $t);
						if ($m ne "\xFF") { $width = $height = 0; last; }
						elsif ((ord($c) >= 0xC0) && (ord($c) <= 0xC3)) {
								$height = unpack("n", substr($file, $i+1, 2));
								$width = unpack("n", substr($file, $i+3, 2));
								last;
						} else {
								$t = substr($file, $t, ($l - 2)); $i += $l - 2;
						}
				}
		}
    elsif($basename =~ /^.+\.(gif)$/i){
				my ($file) = @_[0];
				$width = unpack("v", substr($file, 6, 2));
				$height= unpack("v", substr($file, 8, 2));
		}
    elsif($basename =~ /^.+\.(png)$/i){
				my ($file) = @_[0];
				$width = unpack("N", substr($file, 16, 4));
				$height = unpack("N", substr($file, 20, 4));
		}

}

# parameters are already URL decoded.
my $CGI = new CGI;
my $filename = $CGI->upload('fileselector');

my $BODY = "";

		
my $HEADER = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'
		  'http://www.w3.org/TR/html4/loose.dtd'>
<html lang='" . $PositLogConfig::language . "'>
<head>
<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>
<meta http-equiv='Content-Script-Type' content='text/javascript'>
<meta http-equiv='Pragma' content='no-cache'>
<meta http-equiv='Cache-Control' content='no-cache, no-store, must-revalidate, max-age=0'>
<meta http-equiv='Cache-Control' content='post-check=0, pre-check=0'>
<meta http-equiv='Expires' content='Thu, 01 Dec 1994 16:00:00 GMT'>
<title>PositLog File Uploader</title>
<script type='text/javascript'>
<!--
function checkSelector(){
    if(document.getElementById('fileselector').value == ''){
				return false;
    }
    else {
				return true;
    }
}
// -->
</script>
</head>";
		
# This line must be put after $CGI->upload('fileselector');
print $CGI->header(-charset => 'utf-8'); 

# Read temporal cookie
my $loginid = $CGI->cookie("loginid") || "";
my $loginpass = $CGI->cookie("loginpass") || "";
my $pageid = $CGI->cookie("pageid") || "";

if($loginid eq ""){
   $loginid = $CGI->param("loginid") || "";
}
if($loginpass eq ""){
    $loginpass = $CGI->param("loginpass") || "";
}
if($pageid eq ""){
    $pageid = $CGI->param("pageid") || "";
}

# true or ""
my $fromapplet = $CGI->param("fromapplet") || "";

my $pages = eval{ Storable::lock_retrieve($PositLogConfig::adminpath . "pages.dat")};
if($@){ warn "Cannot read " . $PositLogConfig::adminpath . "pages.dat"; exit(0); }
my $authObj = new PositLogAuth($PositLogConfig::adminpath, $loginid, $loginpass, $pages);

my $permissionLevel = $authObj->getPermissionLevel($pageid);
if($permissionLevel < $PositLogParam::USERLEVEL_ATTACH_FILE){
    if($fromapplet eq "true"){
        print "Permission denied";
    }
    else{
        $BODY = "<body>";
        $BODY .= "<p>You cannot upload files.</p>\n";
        $BODY .= "<form>";
        $BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
        $BODY .=  "</form>";
        $BODY .= "</body>\n";
        my $FOOTER = "</html>";
        print $HEADER . $BODY . $FOOTER;
    }
    exit(0);
}


if($filename eq ""){
    $BODY .= q{<body>
<form id="fileuploader" action="./fileupload.cgi" method="POST" onSubmit="return checkSelector();" enctype="multipart/form-data">
<p id="fileuploadermessage">
Please select a file to upload.
</p>
<input type="file" id="fileselector" name="fileselector"><br>
<input type="button" name="cancelbtn"  onclick="top.EDT.uploader.close()" value="Cancel">
<input type="submit" name="uploadbtn" value="Upload">
</form>
</body>};

    my $FOOTER = "</html>";

    print $HEADER . $BODY . $FOOTER;

    exit(0);	
}

if($pageid eq "" || !exists($pages->{$pageid})){
    $BODY = "<body>";
    $BODY .= "<p>Page not found.</p>\n";
    $BODY .= "<form>";
    $BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
    $BODY .=  "</form>";
    $BODY .= "</body>\n";
    my $FOOTER = "</html>";

    print $HEADER . $BODY . $FOOTER;

    exit(0);	
}

my $isImage = 0;
my $saveDir = "/File/";

my $overwritten = 0;

#---------------------------------------------------------
# Upload file
#---------------------------------------------------------

# upload file name

my $totalbyte = 0;

if($filename ne ""){
# MIME type
    my $type = $CGI->uploadInfo($filename)->{'Content-Type'};
    my $buffer;
    my $file;
    my $BUFSZ = 2048;
    my $bytesread;
#    my $file_size = 0;
    while($bytesread = read($filename, $buffer, $BUFSZ)){
				$file .= $buffer;

				$totalbyte += $bytesread;
#				$file_size ++;
				if($totalbyte >= $PositLogConfig::uploadmax){
				    if($fromapplet eq "true"){
				        print "Too large";
				    }
						else{
								$BODY = "<body>";
								$BODY .= "<p>The file size is too large!</p>\n";
				  			$BODY .= "<form>";
								$BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
								$BODY .=  "</form>";
								$BODY .= "</body>\n";
								my $FOOTER = "</html>";
								print $HEADER . $BODY . $FOOTER;
						}
						exit(0);	
				}
    }

    if(! -d $PositLogConfig::datapath . $pageid . "/Image/"){
				if(!mkdir($PositLogConfig::datapath . $pageid . "/Image/", 0755)){
						$BODY = "<body>";
						$BODY .= "<p>Cannot create an image directory.<br>\n";
						$BODY .= "Please check file permission.</p>\n";
						$BODY .= "<form>";
						$BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
						$BODY .=  "</form>";
						$BODY .= "</body>\n";
						my $FOOTER = "</html>";

						print $HEADER . $BODY . $FOOTER;

						exit(0);
				}
    }
    if(! -d $PositLogConfig::datapath . $pageid . "/File/"){
				if(!mkdir($PositLogConfig::datapath . $pageid . "/File/", 0755)){
						$BODY = "<body>";
						$BODY .= "<p>Cannot create a file directory.<br>\n";
						$BODY .= "Please check file permission.</p>\n";
						$BODY .= "<form>";
						$BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
						$BODY .=  "</form>";
						$BODY .= "</body>\n";
						my $FOOTER = "</html>";

						print $HEADER . $BODY . $FOOTER;

						exit(0);
				}
    }

    $filename =~ s/\\/\//gi;
    $basename = basename($filename);

    if($basename =~ /^.+\.(gif|jpg|jpeg|png)$/i){
				$isImage = 1;
				$saveDir = "/Image/";
    }

    if(-f $PositLogConfig::datapath . $pageid . $saveDir .  $basename){
				$overwritten = 1;
    }

    my $success = 1;
    open(OUT, "> $PositLogConfig::datapath" . $pageid . $saveDir .  $basename) or $success = 0;
    if($success != 1){
				$BODY = "<body>";
				$BODY .= "<p>Cannot save the uploaded file.<br>\n";
				$BODY .= "Please check file permission.</p>\n";
				$BODY .= "<form>";
				$BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
				$BODY .=  "</form>";
				$BODY .= "</body>\n";
				my $FOOTER = "</html>";

				print $HEADER . $BODY . $FOOTER;

				exit(0);
    }
    binmode(OUT);
    print(OUT $file);
    close(OUT);
    chmod (0666, "$PositLogConfig::datapath" . $pageid . $saveDir . $basename); 

		if(scalar($isImage) == 1){
				getSize($file);
		}

}

#---------------------------------------------------------
# Generate HTML
#---------------------------------------------------------
if($fromapplet eq "true"){
		my $filepath = "";
		if($PositLogConfig::filesecure == 1){
				$filepath = "./";
		}
		else{
				$filepath = $PositLogConfig::cgipath . $PositLogConfig::dataurl;
		}

		if($permissionLevel < $PositLogParam::USERLEVEL_SUPER 
			 && scalar($pages->{$pageid}{editor_type}) == $PositLogParam::SIMPLE_EDITOR){
				if(scalar($isImage) == 1){
						print "<img alt='" . $basename . "(" . $width . "x" . $height . ")' title='" . $basename . "(" . $width . "x" . $height . ")' src='" . $filepath . $pageid . "/Image/" . $basename . "' width='" . $width . "' height='" . $height . "' class='attachedimage'>";
				}
				else{
						print "<a title='" . $basename . "(" . $totalbyte . ")' class='attachedfile' href='" . $filepath . $pageid . "/File/" . $basename . "'>" . $basename . "</a>";
				}
    }
		else{
				if(scalar($isImage) == 1){
						print "<img src='" . $filepath . $pageid . "/Image/" . $basename . "' alt='" . $basename . "' title='" . $basename . "' width='" . $width . "' height='" . $height . "'>";
				}
				else{
						print "<a href='" . $filepath . $pageid . "/File/" . $basename . "'>" . $basename . "</a>";
				}
		}

    exit(0);
}


my $canHtml = 0;
if($permissionLevel >= $PositLogParam::USERLEVEL_SUPER){
    $canHtml = 1;
}

my $insertHtml = "";

if($canHtml == 1){
		my $filepath = "";
		if($PositLogConfig::filesecure == 1){
				$filepath = "./";
		}
		else{
#				$filepath = $PositLogConfig::dataurl;
				$filepath = $PositLogConfig::cgipath . $PositLogConfig::dataurl;
		}
		if(scalar($isImage) == 1){
				$insertHtml = "<img src=\\'" . $filepath . $pageid . "/Image/" . $basename . "\\' width=\\'" . $width . "\\' height=\\'" . $height . "\\'>";
		}
		else{
				$insertHtml = "<a href=\\'" . $filepath . $pageid . "/File/" . $basename . "\\'>" . $basename . "</a>";
		}
}
else{
		if(scalar($isImage) == 1){
				$insertHtml = "filename;" . $basename . ";". $width . "x". $height;
		}
		else{
				$insertHtml = "filename;" . $basename . ";". $totalbyte;
		}
}

if($overwritten == 1){
    $BODY = q{<body onLoad="top.EDT.uploader.insert('} . $insertHtml . q{');">};
    $BODY .= "<p>$basename is overwritten.</p>\n";
    $BODY .= "<form>";
    $BODY .= "<input type='button' name='cancelbtn'  onclick='top.EDT.uploader.close()' value='Close'>";
    $BODY .=  "</form>";
}
else{
    $BODY = q{<body onLoad="top.EDT.uploader.insert('} . $insertHtml . q{'); top.EDT.uploader.close()">};
}

$BODY .= "</body>\n";

my $FOOTER = "</html>";

print $HEADER . $BODY . $FOOTER;


