package PositLogAuth;

# --------------------------------------------------------
# PositLogAuth.pm
#      perl module for authentication
#  (tested under perl 5.8.4)
#
# This file is part of PositLog.
# --------------------------------------------------------

use strict;
use PositLogConfig;
use PositLogParam;
use Storable qw(lock_retrieve lock_nstore);

sub getErrorMsg{
    my $self = shift;
    return $self->{errormsg};
}

sub isAdminUser{
    my $self = shift;
    return scalar($self->{adminUser});
}

sub isValidUser{
		my $self = shift;
    return scalar($self->{validUser});
}

sub isPublicUser{
    my $self = shift;
    return scalar($self->{publicUser});
}

sub isAuthor{
    my $self = shift;
    my $pageid = shift;

		$self->{errormsg} = "";

		if($self->{users} eq ""){
				$self->{users} = eval{ Storable::lock_retrieve($self->{adminpath} . "users.dat")};
				if($@){	$self->{errormsg} = "Cannot read " . $self->{adminpath} . "users.dat";	return -1; }
		}
		if(exists($self->{users}->{$self->{loginid}}{authors}{$pageid})){
				return 1;
		}
		else{
				return 0;
		}
}

sub isSubadmin{
    my $self = shift;
    my $pageid = shift;

		$self->{errormsg} = "";

		my $subadmin = 0;


		if($self->{users} eq ""){
				$self->{users} = eval{ Storable::lock_retrieve($self->{adminpath} . "users.dat")};
				if($@){	$self->{errormsg} = "Cannot read " . $self->{adminpath} . "users.dat";	return -1; }
		}
		if($self->{userGroups} eq ""){
				$self->{userGroups} = eval{ Storable::lock_retrieve($self->{adminpath} . "usergroups.dat")};
				if($@){	$self->{errormsg} = "Cannot read " . $self->{adminpath} . "usergroups.dat";	return -1; }
		}
		foreach my $ugid (keys %{$self->{users}->{$self->{loginid}}{groups}}){
				if($ugid eq "all"){
						next;
				}
				if(exists($self->{userGroups}->{$ugid}{permissions}{$pageid})){
						my $level = scalar($self->{userGroups}->{$ugid}{permissions}{$pageid});
						if($level >= $PositLogParam::USERLEVEL_EDIT){
								if(exists($self->{userGroups}->{$ugid}{subadmingroup})){
										if(scalar($self->{userGroups}->{$ugid}{subadmingroup}) == 1){
												return 1;
										}
								}
						}
				}
    }
		
		return 0;
}

sub getPermissionLevel{
    my $self = shift;		
		my $pageid = shift;

		$self->{errormsg} = "";

		if(scalar($self->{publicUser}) != 1 
			 && scalar($self->{validUser}) != 1
			 && scalar($self->{adminUser}) != 1
				){
				$self->{errormsg} = "Invalid user.";
				return 0;
		}

		if(scalar($self->{adminUser}) == 1){
				return $PositLogParam::USERLEVEL_SUPER;
		}

		if($self->{users} eq ""){
				$self->{users} = eval{ Storable::lock_retrieve($self->{adminpath} . "users.dat")};
				if($@){	$self->{errormsg} = "Cannot read " . $self->{adminpath} . "usergroups.dat";	return -1; }
		}

		my $maxLevel = -1;
		if(exists($self->{users}->{public}{permissions}{$pageid})){
				$maxLevel = scalar($self->{users}->{public}{permissions}{$pageid});
		}
		if(exists($self->{users}->{$self->{loginid}}{permissions}{$pageid})){
				my $level = scalar($self->{users}->{$self->{loginid}}{permissions}{$pageid});
				if($level > $maxLevel){
						$maxLevel = $level;
				}
		}

		if($self->{userGroups} eq ""){
				$self->{userGroups} = eval{ Storable::lock_retrieve($self->{adminpath} . "usergroups.dat")};
				if($@){	$self->{errormsg} = "Cannot read " . $self->{adminpath} . "usergroups.dat";	return -1; }
		}
		foreach my $ugid (keys %{$self->{users}->{$self->{loginid}}{groups}}){
				if($ugid eq "all"){
						next;
				}
				if(exists($self->{userGroups}->{$ugid}{permissions}{$pageid})){
						my $level = scalar($self->{userGroups}->{$ugid}{permissions}{$pageid});
						if($level > $maxLevel){
								$maxLevel = $level;
						}
				}
    }
		$self->{permissionLevel} = $maxLevel;

		return $maxLevel;
}

sub canEditItem{
		my ($self, $hash, $pageid, $itemid, $public_password) = @_;

		my $authorid = $hash->{$itemid}{author_id};

		if($authorid eq "public"){
				my $cryptpass = $hash->{$itemid}{public_password};
				if($cryptpass ne "" && !$self->{adminUser} && !$self->isAuthor($pageid) && !$self->isSubadmin($pageid)){
						my $salt="zi";
						my $cryptpass2 = crypt($public_password, $salt);
						if($cryptpass ne $cryptpass2){
								return (0, "invalid_public_password\n");
						}
				}
		}
		elsif($authorid eq "admin"){
				if($self->{adminUser}){
						return (1, "");
				}
				else{
						return (0, "Permission denied\n");
				}
		}
		elsif($authorid ne $self->{loginid} && !$self->{adminUser} && !$self->isAuthor($pageid) && !$self->isSubadmin($pageid)){
				return (0, "Permission denied\n");
		}

		return (1, "");
}

sub canCreatePage{
    my $self = shift;
		my $pageid = shift;

		$self->{errormsg} = "";

		if(scalar($self->{adminUser}) == 1){
				return 1;
		}

		if(scalar($self->{validUser}) == 1){
				if($self->{permissionLevel} < 0){
						$self->getPermissionLevel($pageid);
				}
				if($self->{permissionLevel} >= $PositLogParam::USERLEVEL_EDIT){
						return 1;
				}
				else{
						return 0;
				}
		}
		elsif(scalar($self->{publicUser}) == 1){
				if($self->{pages} eq ""){
						$self->{pages} = eval{ Storable::lock_retrieve($self->{adminpath} . "pages.dat")};
						if($@){	$self->{errormsg} = "Cannot read " . $self->{adminpath} . "pages.dat";	return -1; }
				}

				if(scalar($self->{pages}->{$pageid}{create_page}) == 1){
						return 1;
				}
				else{
						return 0;
				}
		}
}

sub new{
    my $pkg = shift;

		my $adminpath = shift;

		my $loginid = shift;
		my $loginpass = shift;
		my $_pages = shift;
		my $_pageGroups = shift;
		my $_users = shift;
		my $_userGroups = shift;
		my $_adminAuth = shift;

		my $hash = {
				"adminpath" => $adminpath,
				"loginid" => $loginid,
				"loginpass" => $loginpass,
				
				"adminUser" => 0,
				"validUser" => 0,
				"publicUser" => 0,

				"errormsg" => "",

				"pages" => "",
				"pageGroups" => "",
				"users" => "",
				"userGroups" => "",
				"adminAuth" => "",

				"permissionLevel" => -1,
		};

		if($_pages ne ""){
				$hash->{pages} = $_pages;
		}
		if($_pageGroups ne ""){
				$hash->{pageGroups} = $_pageGroups;
		}
		if($_users ne ""){
				$hash->{users} = $_users;
		}
		if($_userGroups ne ""){
				$hash->{userGroups} = $_userGroups;
		}
		if($_adminAuth ne ""){
				$hash->{adminAuth} = $_adminAuth;
		}

    if($loginid eq "public" || $loginid eq ""){
				$hash->{loginid} = "public";
				$hash->{adminUser} = 0;
				$hash->{validUser} = 0;
				$hash->{publicUser} = 1;
				return bless $hash, $pkg;
    }

		if($hash->{adminAuth} eq ""){
				$hash->{adminAuth} = eval{ Storable::lock_retrieve($adminpath . "key.dat")};
				if($@){ $hash->{errormsg} = "Cannot read " . $adminpath . "key.dat"; return bless $hash, $pkg; }
		}

    if(exists($hash->{adminAuth}->{$loginid})){
				my $cryptpass = $hash->{adminAuth}->{$loginid}{password};
				my $salt="lc";
				my $cryptpass2 = crypt($loginpass, $salt);
				if($cryptpass eq $cryptpass2){
						$hash->{adminUser} = 1;
						$hash->{validUser} = 1;
						$hash->{publicUser} = 0;
        }
				else{
						$hash->{errormsg} = "Permission denied.";
        }
				return bless $hash, $pkg;
    }

		$hash->{users} = eval{ Storable::lock_retrieve($adminpath . "users.dat")};
		if($@){	$hash->{errormsg} = "Cannot read " . $adminpath . "users.dat";	return bless $hash, $pkg; }

    if(exists($hash->{users}->{$loginid})){
				my $cryptpass = $hash->{users}->{$loginid}{password};
				my $salt="ry";
				my $cryptpass2 = crypt($loginpass, $salt);
				if($cryptpass eq $cryptpass2){
						$hash->{adminUser} = 0;
						$hash->{validUser} = 1;
						$hash->{publicUser} = 0;
        }
				else{
						$hash->{errormsg} = "Permission denied.";
        }
				return bless $hash, $pkg;
    }

		$hash->{errormsg} = "Invalid user.";
		return bless $hash, $pkg;
}

1;
