package Walrus::RSS;
use strict;
use vars qw($VERSION);
use Time::Local;
use Encode;
use Encode::Guess;

$VERSION = '0.2.1';

sub new {
	my ($class, %hash) = @_;
	my %kcode = ('euc-jp' => 'euc', 'shift_jis' => 'sjis', 'iso-2022-jp' => 'jis', 'utf-8' => 'utf8');
	my $self = {
		version   => $hash{version},
		encoding  => $hash{encoding} ? $hash{encoding} : 'EUC-JP',
		kanjicode => $kcode{lc($hash{encoding})},
		channel   => {},
		channels  => [],
		items     => [],
		parse_num => 0,
		sort_by   => sub { $_[0]->{'dc:date'} },
		uniq_by   => sub { join("\n",$_[0]->{'about'},$_[0]->{'link'},$_[0]->{'title'},$_[0]->{'dc:date'},$_[0]->{'description'}) },
		tgz       => $hash{timezone},
	};
	return bless $self, $class;
}

# Setting channel.
sub channel {
	my ($self, %hash) = @_;
	foreach (keys %hash) {
		$self->{channel}->{$_} = $hash{$_};
	}
	return $self->{channel};
}

# Adding item.
sub add_item {
	my ($self, %hash) = @_;
	push(@{$self->{items}}, \%hash);
	return $self->{items};
}

# Getting RSS string
sub as_string {
	my ($self) = @_;
	my $about  = $self->{channel}->{about};
	$about     = $self->{channel}->{link} unless ($about);
	# get valid items and add about, dc:date elements
	my @items  = grep { $_->{'title'} and $_->{'link'} } @{$self->{items}};
	foreach my $item (@items) {
		$item->{'about'} = $item->{'link'} unless ($item->{'about'});
		$item->{'dc:date'} = $item->{'dc_date'} unless ($item->{'dc:date'});
	}
	# generate rss header and channel
	my $rdf_li = join("\n   ", map { "<rdf:li rdf:resource=\"$_->{about}\" />" } @items);
	my $doc    = <<"EOD";
<?xml version="1.0" encoding="$self->{encoding}" ?>

<rdf:RDF
 xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
 xmlns="http://purl.org/rss/1.0/"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
>

<channel rdf:about="$self->{channel}->{about}">
 <title>$self->{channel}->{title}</title>
 <link>$self->{channel}->{link}</link>
 <description>$self->{channel}->{description}</description>
 <items>
  <rdf:Seq>
   $rdf_li
  </rdf:Seq>
 </items>
</channel>
EOD
	$doc = $self->str_to_encoded($doc);
	# generate item
	foreach my $item (@items) {
		my @elements = map { "<$_>$item->{$_}</$_>" } grep {$item->{$_}} qw(title link description dc:date);
		my $string   = $self->str_to_encoded(join("\n ", @elements));
		$doc .= <<"EOD";
<item rdf:about="$item->{about}">
 $string
</item>
EOD
	}
	# generate rss footer
	$doc .= "</rdf:RDF>\n";
	return $doc;
}

# Parse RSS string
sub aggregate {
	my $self    = shift;
	my %args    = @_;
	my @sources = (ref($args{sources}) eq 'ARRAY') ? @{$args{sources}} : $args{sources} ? ($args{sources}) : ();
	my $sort_by = ($args{sort_by}) ? $args{sort_by} : $self->{'sort_by'};
	my $uniq_by = ($args{uniq_by}) ? $args{uniq_by} : $self->{'uniq_by'};
	my $tgz     = ($args{timezone}) ? $args{timezone} : $self->{'tgz'};
	# parse rss
	foreach my $rss (@sources) {
		next unless ($rss);
		$rss = $self->str_to_euc($rss);
		# update channel element
		if ($rss =~ /<channel\b(.*?)>(.*?)<\/channel>/is) {
			my %parsed    = ();
			my $attribute = $1;
			my $channel   = $2;
			$parsed{'about'} = $1 if ($attribute =~ /rdf:about="(.*?)"/i);
			foreach my $tag (qw(title link description dc:date)) {
				if ($channel =~ /<$tag\b.*?>(.*?)<\/$tag>/is) {
					$parsed{$tag} = &sanitize($1);
				}
			}
			$self->{'channels'}->[$self->{'channel_num'}] = \%parsed;
			$self->channel(%parsed) unless (keys(%{$self->{'channel'}}));
		}
		# add_item
		foreach my $item ($rss =~ /<item\b.*?>.*?<\/item>/gis) {
			my %parsed = ();
			$parsed{'about'} = $1 if ($item =~ /<item\b.*?rdf:about="(.*?)".*?>/);
			foreach my $tag (qw(title link description dc:date)) {
				if ($item =~ /<$tag\b.*?>(.*?)<\/$tag>/is) {
					$parsed{$tag} = &sanitize($1);
				}
			}
			if ($parsed{'dc:date'}) {
				my $time = &date_to_time($parsed{'dc:date'});
				my @date = reverse((localtime($time))[0..5]);
				($date[0], $date[1]) = ($date[0] + 1900, $date[1] + 1);
				my $form = $parsed{'dc:date'};
				$form =~ s/(:?Z|[+-]\d{2}:\d{2})$//;
				$form    =~ s/(\d+)/'%0' . length($1) . 'd'/ge;
				$parsed{'dc:date'} = sprintf($form, @date).$tgz;
				$parsed{'Walrus::RSS::Channel'} = $self->{'channel_num'};
			}
			$self->add_item(%parsed);
		}
		$self->{'channel_num'} += 1;
	}
	# make items uniq
	if (defined($uniq_by)) {
		my %uniq_items = ();
		foreach my $num (0..$#{$self->{'items'}}) {
			my $key = $uniq_by->($self->{'items'}->[$num]);
			$uniq_items{$key} = $num unless ($uniq_items{$key});
		}
		my @items = map {$self->{'items'}->[$_]} sort(values(%uniq_items));
		$self->{'items'} = [@items];
	}
	# sort_items
	@{$self->{'items'}} = sort { $sort_by->($b) cmp $sort_by->($a) } @{$self->{'items'}} if (defined($sort_by));
	return $self;
}

sub sanitize {
	my $str = shift;
	# remove tags
	my $re_tag_    = q{[^"'<>]*(?:"[^"]*"[^"'<>]*|'[^']*'[^"'<>]*)*(?:>|(?=<)|$(?!\n))}; #'};
	my $re_comment = '<!(?:--[^-]*-(?:[^-]+-)*?-(?:[^>-]*(?:-[^>-]+)*?)??)*(?:>|$(?!\n)|--.*$)';
	my $re_tag     = qq{$re_comment|<$re_tag_};
	$str =~ s/$re_tag//g;
	# resanitize
	my %unescaped = ('&lt;' => '<', '&gt;' => '>', '&quot;' => '"', '&apos;' => "'", '&copy;' => '(c)', '&amp;' => '&');
	my %escaped   = ('<' => '&lt;', '>' => '&gt;', '"' => '&quot;', '&apos;' => "'", '&' => '&amp;');
	$str =~ s/(&(:?lt|gt|quot|apos|copy|amp);)/$unescaped{$1}/gi;
	$str =~ s/([<>"'&])/$escaped{$1}/g;
	return $str;
}

sub date_to_time {
	my $date = shift;
	if ($date =~ /^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d))?)?(Z|([+-]\d{2}):(\d{2}))?)?)?)?$/) {
		my ($year, $month, $day, $hour, $min, $sec) = ($1, ($2 ? $2 : 1), ($3 ? $3 : 1), $4, $5);
		my $offset = (abs($8) * 60 + $9) * ($8 >= 0 ? 60 : -60) if ($7);
		my $time   = ($7) ? &Time::Local::timegm($sec, $min, $hour, $day, $month - 1, $year) - $offset
		                  : &Time::Local::timelocal($sec, $min, $hour, $day, $month - 1, $year) - $offset;
		return $time;
	}
	return undef;
}

sub str_to_euc {
	my $self = shift;
	my $str  = shift;
#	$self->{'jcode'} = Encode->new() unless($self->{'jcode'});
	return Encode::from_to($str, 'Guess', 'euc-jp');
}

sub str_to_encoded {
	my $self  = shift;
	my $str   = shift;
	my $kcode = $self->{'kanjicode'} or return $str;
#	$self->{'jcode'} = Encode->new() unless($self->{'jcode'});
	$_ = eval "Encode::from_to(\$str, 'Guess',$kcode)";
	return ($@) ? $str : $_;
}

1;
