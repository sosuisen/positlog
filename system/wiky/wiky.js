/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/

	Author:  Stefan Goessner/2005-06
	Web:     http://goessner.net/ 

  Modified by hidekaz:
    Fixed the problem that toJSONString is a member of Obj 
     in the block "for (var xxx in Obj){}".
    Added width and height to the image syntax.
    Added \xB6 after \\.
*/
var Wiky = {
  version: 0.95,
  blocks: null,
  headerfontsize: [300, 200, 150, 120, 90, 75, 60],
  rules: {
    all: [
      "Wiky.rules.pre",
      "Wiky.rules.nonwikiblocks",
      "Wiky.rules.wikiblocks",
      "Wiky.rules.post",
    ],
    pre: [
      { rex:/(\r?\n)/g, tmplt:"\xB6" },  // replace line breaks with '�' ..
    ],
    post: [
      { rex:/(^\xB6)|(\xB6$)/g, tmplt:"" },  // .. remove linebreaks at BOS and EOS ..
      { rex:/@([0-9]+)@/g, tmplt:function($0,$1){return Wiky.restore($1);} }, // resolve blocks ..
      { rex:/\xB6/g, tmplt:"\n" } // replace '�' with line breaks ..
    ],
    nonwikiblocks: [
			{ rex:/<script([^>]*?)>([\s\S]*?)<\/script>/mgi, tmplt:function($0,$1,$2){return ":p]" + Wiky.store("<script" + $1 + ">" + $2 + "</script>") + "[p:";} }, // script
			{ rex:/<object([^>]*?)>([\s\S]*?)<\/object>/mgi, tmplt:function($0,$1,$2){return ":p]" + Wiky.store("<object" + $1 + ">" + $2 + "</object>") + "[p:";} }, // object
			{ rex:/<iframe([^>]*?)>([\s\S]*?)<\/iframe>/mgi, tmplt:function($0,$1,$2){return ":p]" + Wiky.store("<iframe" + $1 + ">" + $2 + "</iframe>") + "[p:";} }, // iframe
			{ rex:/<applet([^>]*?)>([\s\S]*?)<\/applet>/mgi, tmplt:function($0,$1,$2){return ":p]" + Wiky.store("<applet" + $1 + ">" + $2 + "</applet>") + "[p:";} }, // applet
			{ rex:/(\[(?:\{[^\}]+?\})?)\\%/g, tmplt:function($0,$1){return Wiky.store($1+"<span class=\"wikiescaped\">%</span>");} },
			{ rex:/\\%\]/g, tmplt:function(){return Wiky.store("<span class=\"wikiescaped\">%</span>]");} },
      { rex:/\\([%])/g, tmplt:function($0,$1){return Wiky.store($1);} },
      { rex:/\[(?:\{([^}]*)\})?(?:\(([^)]*)\))?%(.*?)%\]/g, tmplt:function($0,$1,$2,$3){return ":p]"+Wiky.store("<pre"+($2?(" lang=\"x-"+Wiky.attr($2)+"\""):"")+Wiky.style($1)+">" + Wiky.apply($3, $2?Wiky.rules.lang[Wiky.attr($2)]:Wiky.rules.code) + "</pre>")+"[p:";} }, //programm code block
			{ rex:/<!--([\s\S]*?)-->/mg, tmplt:function($0,$1){return ":p]" + Wiky.store("<!--" + Wiky.apply($1, Wiky.rules.comment) + "-->") + "[p:";} } // comment
],
wikiblocks: [
  "Wiky.rules.nonwikiinlines",
  "Wiky.rules.escapes",
	"Wiky.rules.shortcuts",
  { rex:/(?:^|\xB6)(={1,6})(.*?)[=]*(?=\xB6|$)/g, tmplt:function($0,$1,$2){ var h=$1.length; return ":p]\xB6<h"+h+" style=\"font-size:"+Wiky.headerfontsize[h]+"%\">"+$2+"</h"+h+">\xB6[p:";} }, // <h1> .. <h6>
  { rex:/\\\\([ \xB6\n])/g, tmplt:"<br />$1" },  // forced line break ..
  { rex:/(^|\xB6)([*01aAiIg]*[\.*])[ ]/g, tmplt:function($0,$1,$2){var state=$2.replace(/([*])/g,"u").replace(/([\.])/,"");return ":"+state+"]"+$1+"["+state+":";}},
  { rex:/(?:^|\xB6);[ ](.*?):[ ]/g, tmplt:"\xB6:l][l:$1:d][d:"},  // ; term : definition
  { rex:/\[(?:\{([^}]*)\})?(?:\(([^)]*)\))?\"/g, tmplt:function($0,$1,$2){return ":p]<blockquote"+Wiky.attr($2,"cite",0)+Wiky.attr($2,"title",1)+Wiky.style($1)+">[p:"; } }, // block quotation start
{ rex:/\"\]/g, tmplt:":p]</blockquote>[p:" }, // block quotation end
{ rex:/\[(\{[^}]*\})?\|/g, tmplt:":t]$1[r:" },  // .. start table ..
{ rex:/\|\]/g, tmplt:":r][t:" },  // .. end table ..
{ rex:/\|\xB6[ ]?\|/g, tmplt:":r]\xB6[r:" },  // .. end/start table row ..
{ rex:/\|/g, tmplt:":c][c:" },  // .. end/start table cell ..
{ rex:/^(.*)$/g, tmplt:"[p:$1:p]" },  // start paragraph '[p:' at BOS .. end paragraph ':p]' at EOS ..
{ rex:/(([\xB6])([ \t\f\v\xB6]*?)){2,}/g, tmplt:":p]$1[p:" },  // .. separate paragraphs at blank lines ..
{ rex:/\[([01AIacdgilprtu]+)[:](.*?)[:]([01AIacdgilprtu]+)\]/g, tmplt:function($0,$1,$2,$3){return Wiky.sectionRule($1==undefined?"":$1,"",Wiky.apply($2,Wiky.rules.wikiinlines),!$3?"":$3);} },
{ rex:/\[[01AIacdgilprtu]+[:]|[:][01AIacdgilprtu]+\]/g, tmplt:"" },  // .. remove singular section delimiters (they frequently exist with incomplete documents while typing) ..
{ rex:/<td>(?:([0-9]*)[>])?([ ]?)(.*?)([ ]?)<\/td>/g, tmplt:function($0,$1,$2,$3,$4){return "<td"+($1?" colspan=\""+$1+"\"":"")+($2==" "?(" style=\"text-align:"+($2==$4?"center":"right")+";\""):($4==" "?" style=\"text-align:left;\"":""))+">"+$2+$3+$4+"</td>";} },
{ rex:/<(p|table)>(?:\xB6)?(?:\{(.*?)\})/g, tmplt:function($0,$1,$2){return "<"+$1+Wiky.style($2)+">";} },
{ rex:/<p>([ \t\f\v\xB6]*?)<\/p>/g, tmplt:"$1" },  // .. remove empty paragraphs ..
],
nonwikiinlines: [
  { rex:/%(?:\{([^}]*)\})?(?:\(([^)]*)\))?(.*?)%/g, tmplt:function($0,$1,$2,$3){return Wiky.store("<code"+($2?(" lang=\"x-"+Wiky.attr($2)+"\""):"")+Wiky.style($1)+">" + Wiky.apply($3, $2?Wiky.rules.lang[Wiky.attr($2)]:Wiky.rules.code) + "</code>");} }, // inline code
{ rex:/%(.*?)%/g, tmplt:function($0,$1){return Wiky.store("<code>" + Wiky.apply($2, Wiky.rules.code) + "</code>");} }
],
wikiinlines: [
  { rex:/\*([^*]+)\*/g, tmplt:"<strong>$1</strong>" },  // .. strong ..
	{ rex:/_([^_;}][^_]*?)_/g, tmplt:"<em>$1</em>" }, // Ignore {_} and {__}
  { rex:/\^([^^]+)\^/g, tmplt:"<sup>$1</sup>" },
  { rex:/~([^~]+)~/g, tmplt:"<sub>$1</sub>" },
  { rex:/\(-(.+?)-\)/g, tmplt:"<del>$1</del>" },
  { rex:/\?([^ \t\f\v\xB6]+)\((.+)\)\?/g, tmplt:"<abbr title=\"$2\">$1</abbr>" },  // .. abbreviation ..
  { rex:/\[(?:\{([^}]*)\})?[Ii]ma?ge?\:([^ ,\]]*)(?:[, ](\d+?)x(\d+?))?\]/g, tmplt:function($0,$1,$2,$3,$4){return Wiky.store("<img"+Wiky.style($1)+" src=\""+$2+"\" alt=\""+$2+"\" title=\""+$2+"\""+($3?"width=\""+$3+"\" ":"")+($4?"height=\""+$4+"\" ":"")+"/>");} },  // wikimedia image style extended
{ rex:/\[(?:\{([^}]*)\})?[Ii]ma?ge?\:([^ ,\]]*)(?:[, ]([^\]]*?))?(?:[, ](\d+?)x(\d+?))?\]/g, tmplt:function($0,$1,$2,$3,$4,$5){return Wiky.store("<img"+Wiky.style($1)+" src=\""+$2+"\" alt=\""+($3?$3:$2)+"\" title=\""+($3?$3:$2)+"\""+($4?"width=\""+$4+"\" ":"")+($5?"height=\""+$5+"\" ":"")+"/>");} },  // wikimedia image style extended
{ rex:/\[([^ ,]+)[, ]([^\]]*)\]/g, tmplt:function($0,$1,$2){return Wiky.store("<a href=\""+$1+"\">"+$2+"</a>");}},  // wiki block style uri's ..
{ rex:/(((http(s?))\:\/\/)?[A-Za-z0-9\._\/~\-:]+\.(?:png|jpg|jpeg|gif|bmp))/g, tmplt:function($0,$1,$2){return Wiky.store("<img src=\""+$1+"\" alt=\""+$1+"\"/>");} },  // simple images .. 
{ rex:/((mailto\:|javascript\:|(news|file|(ht|f)tp(s?))\:\/\/)[A-Za-z0-9\.:_\/~%\-+&#?!=()@\x80-\xB5\xB7\xFF]+)/g, tmplt:"<a href=\"$1\">$1</a>" }  // simple uri's .. 
],
escapes: [
  { rex:/\\([|*_~\^])/g, tmplt:function($0,$1){return Wiky.store($1);} },
  { rex:/\\&/g, tmplt:"&amp;" },
  { rex:/\\>/g, tmplt:"&gt;" },
  { rex:/\\</g, tmplt:"&lt;" }
],
shortcuts: [
  { rex:/(?:^|\xB6)[-]{4}(?:\xB6|$)/g, tmplt:"\xB6<hr/>\xB6" },  // horizontal ruler ..
  { rex:/<!--/g, tmplt:"&#xA7;commentstart:" },  // &mdash; 
  { rex:/-->/g, tmplt:":commentend&#xA7;" },  // &mdash; 
  { rex:/---/g, tmplt:"&#8212;" },  // &mdash; 
  { rex:/--/g, tmplt:"&#8211;" },  // &ndash;
  { rex:/[\.]{3}/g, tmplt:"&#8230;"}, // &hellip;
  { rex:/<->/g, tmplt:"&#8596;"}, // $harr;
  { rex:/<-/g, tmplt:"&#8592;"}, // &larr;
  { rex:/->/g, tmplt:"&#8594;"}, //&rarr;
  { rex:/<=>/g, tmplt:"&#8660;"}, // $hArr;
  { rex:/<=/g, tmplt:"&#8656;"}, // $lArr;
  { rex:/=>/g, tmplt:"&#8658;"}, // $rArr;
  { rex:/&#xA7;commentstart:/g, tmplt:"<!--" },  // &mdash; 
  { rex:/:commentend&#xA7;/g, tmplt:"-->" },  // &mdash; 
],
code: [
  { rex:/&/g, tmplt:"&amp;"},
  { rex:/</g, tmplt:"&lt;"},
  { rex:/>/g, tmplt:"&gt;"},
	{ rex:/\[p:|:p\]/g, tmplt:""}
],
comment: [
	{ rex:/\[p:|:p\]/g, tmplt:""}
],
lang: {}
},

inverse: {
  all: [
    "Wiky.inverse.pre",
    "Wiky.inverse.nonwikiblocks",
    "Wiky.inverse.wikiblocks",
    "Wiky.inverse.post"
  ],
  pre: [
    { rex:/(\r?\n)/g, tmplt:"\xB6" }  // replace line breaks with '�' ..
  ],
  post: [
    { rex:/@([0-9]+)@/g, tmplt:function($0,$1){return Wiky.restore($1);} },  // resolve blocks ..
    { rex:/(\[(?:\{[^\"]+?\})?\")\xB6/g, tmplt:"$1" },  // ie only
    { rex:/\xB6/g, tmplt:"\n" },  // replace '�' with line breaks ..
    { rex:/\n\n\n/g, tmplt:"\n\n" },
    { rex:/^\n/g, tmplt:"" } 
  ],
  nonwikiblocks: [
		{ rex:/<!--([\s\S]*?)-->/mg, tmplt:function($0,$1){return Wiky.store("<!--" + $1 +"-->");} }, // comment
    { rex:/<pre([^>]*)>(.*?)<\/pre>/mgi, tmplt:function($0,$1,$2){return Wiky.store("\xB6["+Wiky.invStyle($1)+Wiky.invAttr($1,["lang"]).replace(/x\-/,"")+"%"+Wiky.apply($2, Wiky.hasAttr($1,"lang")?Wiky.inverse.lang[Wiky.attrVal($1,"lang").substr(2)]:Wiky.inverse.code)+"%]\xB6");} }, //code block
		{ rex:/<script([^>]*?)>([\s\S]*?)<\/script>/mgi, tmplt:function($0,$1,$2){return "\xB6" + Wiky.store("<script" + $1 + ">" + $2 + "</script>") + "\xB6";} }, // script
		{ rex:/<object([^>]*?)>([\s\S]*?)<\/object>/mgi, tmplt:function($0,$1,$2){return "\xB6" + Wiky.store("<object" + $1 + ">" + $2 + "</object>") + "\xB6";} }, // object
		{ rex:/<iframe([^>]*?)>([\s\S]*?)<\/iframe>/mgi, tmplt:function($0,$1,$2){return "\xB6" + Wiky.store("<iframe" + $1 + ">" + $2 + "</iframe>") + "\xB6";} }, // iframe
		{ rex:/<applet([^>]*?)>([\s\S]*?)<\/applet>/mgi, tmplt:function($0,$1,$2){return "\xB6" + Wiky.store("<applet" + $1 + ">" + $2 + "</applet>") + "\xB6";} }, // applet
  ],
  wikiblocks: [
    "Wiky.inverse.nonwikiinlines",
    "Wiky.inverse.escapes",
    "Wiky.inverse.wikiinlines",
    { rex:/<h1.*?>(.*?)<\/h1>/mgi, tmplt:"=$1=" },
    { rex:/<h2.*?>(.*?)<\/h2>/mgi, tmplt:"==$1==" },
    { rex:/<h3.*?>(.*?)<\/h3>/mgi, tmplt:"===$1===" },
    { rex:/<h4.*?>(.*?)<\/h4>/mgi, tmplt:"====$1====" },
    { rex:/<h5.*?>(.*?)<\/h5>/mgi, tmplt:"=====$1=====" },
    { rex:/<h6.*?>(.*?)<\/h6>/mgi, tmplt:"======$1======" },
    { rex:/<(p|table)[^>]+(style=[\"\'].*?[\"\'])[^>]*?>/mgi, tmplt:function($0,$1,$2){return "<"+$1+">"+Wiky.invStyle($2);} },
    { rex:/\xB6{2}<li/mgi, tmplt:"\xB6<li" },  // ie6 only ..
    { rex:/<li class=\"([^\"]*?)\"[^>]*?>([^<]*?)/mgi, tmplt:function($0,$1,$2){return $1.replace(/u/g,"*").replace(/([01aAiIg])$/,"$1.")+" "+$2;}},  // list items ..
    { rex:/<li class=([^>]*?)>([^<]*?)/mgi, tmplt:function($0,$1,$2){return $1.replace(/u/g,"*").replace(/([01aAiIg])$/,"$1.")+" "+$2;}},  // list items (IE)
    { rex:/(^|\xB6)<(u|o)l[^>]*?>\xB6/mgi, tmplt:"$1" },  // only outer level list start at BOL ...
    { rex:/(<\/(?:dl|ol|ul|p)>[ \xB6]*<(?:p)>)/gi, tmplt:"\xB6\xB6" },
    { rex:/<dt>(.*?)(\xB6|<\/dt>[ \f\n\r\t\v]*)<dd>/mgi, tmplt:"; $1: " },
    { rex:/<blockquote([^>]*?)>/mgi, tmplt:function($0,$1){return Wiky.store("\xB6["+Wiky.invStyle($1)+Wiky.invAttr($1,["cite","title"])+"\"");} },
    { rex:/<\/blockquote>/mgi, tmplt:"\"]\xB6" },
    { rex:/<td class=\"?lft\"?>\xB6*[ ]?|<\/tr>/mgi, tmplt:"|" },  // ie6 only ..
    { rex:/\xB6<tr(?:[^>]*?)>/mgi, tmplt:"\xB6" },
    { rex:/<td colspan=\"([0-9]+)\"(?:[^>]*?)>/mgi, tmplt:"|$1>" },
    { rex:/<td(?:[^>]*?)>/mgi, tmplt:"|" },
    { rex:/<table>/mgi, tmplt:"[" },
    { rex:/<\/table>/mgi, tmplt:"]" },
    { rex:/<tr(?:[^>]*?)>\xB6*|<\/td>\xB6*|<tbody>\xB6*|<\/tbody>/mgi, tmplt:"" },
    { rex:/<br\s?\/?>([\s\xB6])?/mgi, tmplt:function($0,$1){return $1==' '?"\\\\ ":"\\\\\n";} },
    { rex:/(<p>|<(d|o|u)l[^>]*>|<\/(dl|ol|ul|p)>|<\/(li|dd)>)/mgi, tmplt:"" },
    "Wiky.inverse.shortcuts"
  ],
  nonwikiinlines: [
    { rex:/<code>(.*?)<\/code>/gi, tmplt:function($0,$1){return Wiky.store("%"+Wiky.apply($1, Wiky.inverse["code"])+"%");} }
  ],
  wikiinlines: [
    { rex:/<strong[^>]*?>(.*?)<\/strong>/mgi, tmplt:"*$1*" },
    { rex:/<b[^>]*?>(.*?)<\/b>/mgi, tmplt:"*$1*" },
    { rex:/<em[^>]*?>(.*?)<\/em>/mgi, tmplt:"_$1_" },
    { rex:/<i[^>]*?>(.*?)<\/i>/mgi, tmplt:"_$1_" },
    { rex:/<sup[^>]*?>(.*?)<\/sup>/mgi, tmplt:"^$1^" },
    { rex:/<sub[^>]*?>(.*?)<\/sub>/mgi, tmplt:"~$1~" },
    { rex:/<del[^>]*?>(.*?)<\/del>/mgi, tmplt:"(-$1-)" },
    { rex:/<abbr title=\"?([^\">]*)\"?>(.*?)<\/abbr>/mgi, tmplt:"?$2($1)?" },
    { rex:/<a href=\"([^\"]*)\"[^>]*?>(.*?)<\/a>/mgi, tmplt:function($0,$1,$2){return $1==$2?$1:"["+$1+","+$2+"]";}},
    { rex:/<img([^>]*)\/?>/mgi, tmplt:function($0,$1){var a=Wiky.attrVal($1,"alt"),h=Wiky.attrVal($1,"src"),t=Wiky.attrVal($1,"title"),s=Wiky.attrVal($1,"style"),width=Wiky.attrVal($1,"width"),height=Wiky.attrVal($1,"height");return s||(t&&h!=t)?("["+Wiky.invStyle($1)+"img:"+h+(t&&(","+t))+((width&&height)?(","+width+"x"+height):"")+"]"):h;}},
  ],
  escapes: [
    { rex:/([|*_~%\^])/g, tmplt:"\\$1" },
    { rex:/<span class=[\'\"]?wikiescaped[\'\"]?>\\%<\/span>/gi, tmplt:"\\%" },
    { rex:/&amp;/g, tmplt:"\\&" },
    { rex:/&gt;/g, tmplt:"\\>" },
    { rex:/&lt;/g, tmplt:"\\<" }
  ],
  shortcuts: [
    { rex:/<hr\/?>/mgi, tmplt:"----" },
    { rex:/&#8211;|\u2013/g, tmplt:"--"},
    { rex:/&#8212;|\u2014/g, tmplt:"---"},
    { rex:/&#8230;|\u2026/g, tmplt:"..."},
    { rex:/&#8596;|\u2194/g, tmplt:"<->"},
    { rex:/&#8592;|\u2190/g, tmplt:"<-"},
    { rex:/&#8594;|\u2192/g, tmplt:"->"},
    { rex:/&#8660;|\u21D4/g, tmplt:"<=>"},
    { rex:/&#8656;|\u21D0/g, tmplt:"<="},
    { rex:/&#8658;|\u21D2/g, tmplt:"=>"}
  ],
  code: [
    { rex:/<span class=[\'\"]?wikiescaped[\'\"]?>%<\/span>/gi, tmplt:"\\%" },
    { rex:/&amp;/g, tmplt:"&"},
    { rex:/&lt;/g, tmplt:"<"},
    { rex:/&gt;/g, tmplt:">"},
  ],
  lang: {}
},

toHtml: function(str) {
  Wiky.blocks = [];
  return Wiky.apply(str, Wiky.rules.all);
},

toWiki: function(str) {
  Wiky.blocks = [];
  return Wiky.apply(str, Wiky.inverse.all);
},

apply: function(str, rules) {
  if (str && rules)
    for (var i in rules) {
			if(i=="toJSONString")
				continue;
      if (typeof(rules[i]) == "string")
        str = Wiky.apply(str, eval(rules[i]));
      else
        str = str.replace(rules[i].rex, rules[i].tmplt);
    }
  return str;
},
store: function(str, unresolved) {
  return unresolved ? "@" + (Wiky.blocks.push(str)-1) + "@"
    : "@" + (Wiky.blocks.push(str.replace(/@([0-9]+)@/g, function($0,$1){return Wiky.restore($1);}))-1) + "@";
},
restore: function(idx) {
  return Wiky.blocks[idx];
},
attr: function(str, name, idx) {
  var a = str && str.split(",")[idx||0];
  return a ? (name ? (" "+name+"=\""+a+"\"") : a) : "";
},
hasAttr: function(str, name) {
  return new RegExp(name+"=").test(str);
},
attrVal: function(str, name) {
	if(str.match(new RegExp("^.*?"+name+"=[\"'](.*?)[\"'].*?$"), "$1")){
		return RegExp.$1;
	}
	else if(str.match(new RegExp(name+"=(.*?)\\s"), "$1")){
		return RegExp.$1;
	}
	else if(str.match(new RegExp(name+"=(.*?)$"), "$1")){
		return RegExp.$1;
	}
	return "";
},
invAttr: function(str, names) {
  var a=[], x;
  for (var i in names){
		if(i=="toJSONString")
			continue;
    if (str.indexOf(names[i]+"=")>=0) 
      a.push(Wiky.attrVal(str, names[i]));
	}
  return a.length ? ("("+a.join(",")+")") : "";
},
style: function(str) {
//  var s = str && str.split(/,|;/), p, style = "";
  // Don't use comma.
	// comma interfares with some values. 
	// e.g. 
  //  color: rgb(0,0,0)
  //  cursor: url(image.cur), text
  var s = str && str.split(/;/), p, style = "";

  for (var i in s) {
		if(i=="toJSONString")
			continue;
    p = s[i].split(":");
    if (p[0] == ">>")       style += "margin-left:4em;";
    else if (p[0] == "<<")  style += "margin-right:4em;";
    else if (p[0] == ">>>") style += "float:right;";
    else if (p[0] == "<<<") style += "float:left;";
//    else if (p[0] == "=") style += "display:block;margin:0 auto;";
    else if (p[0] == ">") style += "text-align:right;";
    else if (p[0] == "<") style += "text-align:left;";
    else if (p[0] == "==") style += "text-align:justify;";
    else if (p[0] == "=") style += "text-align:center;";
    else if (p[0] == "__")  style += "border-bottom:1px solid;";
    else if (p[0] == "_")  style += "text-decoration:underline;";
    else if (p[0] == "b")  style += "border:1px solid;";
    else if (p[0] == "c")  style += "color:"+p[1]+";";
    else if (p[0] == "C")  style += "background:"+p[1]+";";
    else if (p[0] == "fs")  style += "font-size:"+p[1]+";";
    else if (p[0] == "w")  style += "width:"+p[1]+";";
    else                   style += p[0]+":"+p[1]+";";
  }
  return style ? " style=\""+style+"\"" : "";
},
invStyle: function(str) {
	var rex = /style=/i;
  var s = rex.test(str) ? str.replace(/^.*?style=[\"\'](.*?)[\"\'].*?$/i, "$1") : "";
	// For Opera
	s = s.replace(/border-top-color: #000000; border-left-color: #000000; border-right-color: #000000; border-bottom-color: #000000; border-top-width: 1px; border-left-width: 1px; border-right-width: 1px; border-bottom-width: 1px; border-top-style: solid; border-left-style: solid; border-right-style: solid; border-bottom-style: solid(;?)/i, "border:1px solid$1");
	s = s.replace(/border-bottom-color: #000000; border-bottom-width: 1px; border-bottom-style: solid(;?)/i, "border-bottom:1px solid$1");
  var p = s && s.split(";"), pi, prop = [], borderprop = [];
	var borderTop = false, borderRight = false, borderBottom = false, borderLeft = false;
  for (var i in p) {
		if(i=="toJSONString" || p[i]==""){
			continue;
		}
    pi = p[i].split(":");
		pi[0] = pi[0].replace(/^\s+/,"");
		pi[1] = pi[1].replace(/^\s+/,"");
		pi[1] = pi[1].replace(/\s+$/,"");
    if (pi[0].match(/^margin-left$/i) && pi[1]=="4em") prop.push(">>");
    else if (pi[0].match(/^margin-right$/i) && pi[1]=="4em") prop.push("<<");
    else if (pi[0].match(/^float$/i) && pi[1]=="right") prop.push(">>>");
    else if (pi[0].match(/^float$/i) && pi[1]=="left") prop.push("<<<");
    else if (pi[0].match(/^text-align$/i) && pi[1]=="right") prop.push(">");
    else if (pi[0].match(/^text-align$/i) && pi[1]=="left") prop.push("<");
    else if (pi[0].match(/^text-align$/i) && pi[1]=="center") prop.push("=");
    else if (pi[0].match(/^text-align$/i) && pi[1]=="justify") prop.push("==");
    else if (pi[0].match(/^display$/i) && pi[1]=="block") ;
    else if (pi[0].match(/^text-decoration$/i) && pi[1]=="underline") prop.push("_");
    else if (pi[0].match(/^border$/i) && pi[1]=="1px solid") prop.push("b");
    else if (pi[0].match(/^border-top$/i) && pi[1]=="1px solid"){borderprop.push(pi[0]+":"+pi[1]); borderTop=true;}
    else if (pi[0].match(/^border-right$/i) && pi[1]=="1px solid"){borderprop.push(pi[0]+":"+pi[1]);  borderRight=true;}
    else if (pi[0].match(/^border-bottom$/i) && pi[1]=="1px solid"){borderprop.push(pi[0]+":"+pi[1]);  borderBottom=true;}
    else if (pi[0].match(/^border-left$/i) && pi[1]=="1px solid"){borderprop.push(pi[0]+":"+pi[1]);  borderLeft=true;}
    else if (pi[0].match(/^color$/i)) prop.push("c:"+pi[1]);
		else if (pi[0].match(/^background$/i)) prop.push("C:"+pi[1]);
		else if (pi[0].match(/^font-size$/i)) prop.push("fs:"+pi[1]);
		else if (pi[0].match(/^width$/i)) prop.push("w:"+pi[1]);
    else if (pi[0]) prop.push(pi[0]+":"+pi[1]);
  }
	if(borderTop && borderRight && borderBottom && borderLeft)
		prop.push("b");
	else if(!borderTop && !borderRight && borderBottom && !borderLeft)
		prop.push("__");
	else
		prop = prop.concat(borderprop);

//  return prop.length ? ("{" + prop.join(",") + "}") : "";
  return prop.length ? ("{" + prop.join(";") + "}") : "";
},
sectionRule: function(fromLevel, style, content, toLevel) {
  var trf = { p_p: "<p>$1</p>",
    p_u: "<p>$1</p><ul$3>",
    p_o: "<p>$1</p><ol$3>",
    // p - ul
    // ul - p
    u_p: "<li$2>$1</li></ul>",
    u_c: "<li$2>$1</li></ul></td>",
    u_r: "<li$2>$1</li></ul></td></tr>",
    uu_p: "<li$2>$1</li></ul></li></ul>",
    uo_p: "<li$2>$1</li></ol></li></ul>",
    uuu_p: "<li$2>$1</li></ul></li></ul></li></ul>",
    uou_p: "<li$2>$1</li></ul></li></ol></li></ul>",
    uuo_p: "<li$2>$1</li></ol></li></ul></li></ul>",
    uoo_p: "<li$2>$1</li></ol></li></ol></li></ul>",
    // ul - ul
    u_u: "<li$2>$1</li>",
    uu_u: "<li$2>$1</li></ul></li>",
    uo_u: "<li$2>$1</li></ol></li>",
    uuu_u: "<li$2>$1</li></ul></li></ul></li>",
    uou_u: "<li$2>$1</li></ul></li></ol></li>",
    uuo_u: "<li$2>$1</li></ol></li></ul></li>",
    uoo_u: "<li$2>$1</li></ol></li></ol></li>",
    u_uu: "<li$2>$1<ul$3>",
    // ul - ol
    u_o: "<li$2>$1</li></ul><ol$3>",
    uu_o: "<li$2>$1</li></ul></li></ul><ol$3>",
    uo_o: "<li$2>$1</li></ol></li></ul><ol$3>",
    uuu_o: "<li$2>$1</li></ul></li></ul></li></ul><ol$3>",
    uou_o: "<li$2>$1</li></ul></li></ol></li></ul><ol$3>",
    uuo_o: "<li$2>$1</li></ol></li></ul></li></ul><ol$3>",
    uoo_o: "<li$2>$1</li></ol></li></ol></li></ul><ol$3>",
    u_uo: "<li$2>$1<ol$3>",
    // ol - p
    o_p: "<li$2>$1</li></ol>",
    oo_p: "<li$2>$1</li></ol></li></ol>",
    ou_p: "<li$2>$1</li></ul></li></ol>",
    ooo_p: "<li$2>$1</li></ol></li></ol>",
    ouo_p: "<li$2>$1</li></ol></li></ul></li></ol>",
    oou_p: "<li$2>$1</li></ul></li></ol></li></ol>",
    ouu_p: "<li$2>$1</li></ul></li></ul></li></ol>",
    // ol - ul
    o_u: "<li$2>$1</li></ol><ul$3>",
    oo_u: "<li$2>$1</li></ol></li></ol><ul$3>",
    ou_u: "<li$2>$1</li></ul></li></ol><ul$3>",
    ooo_u: "<li$2>$1</li></ol></li></ol></li></ol><ul$3>",
    ouo_u: "<li$2>$1</li></ol></li></ul></li></ol><ul$3>",
    oou_u: "<li$2>$1</li></ul></li></ol></li></ol><ul$3>",
    ouu_u: "<li$2>$1</li></ul></li></ul></li></ol><ul$3>",
    o_ou: "<li$2>$1<ul$3>",
    // -- ol - ol --
    o_o: "<li$2>$1</li>",
    oo_o: "<li$2>$1</li></ol></li>",
    ou_o: "<li$2>$1</li></ul></li>",
    ooo_o: "<li$2>$1</li></ol></li></ol></li>",
    ouo_o: "<li$2>$1</li></ol></li></ul></li>",
    oou_o: "<li$2>$1</li></ul></li></ol></li>",
    ouu_o: "<li$2>$1</li></ul></li></ul></li>",
    o_oo: "<li$2>$1<ol$3>",
    // -- dl --
    l_d: "<dt>$1</dt>",
    d_l: "<dd>$1</dd>",
    d_u: "<dd>$1</dd></dl><ul>",
    d_o: "<dd>$1</dd></dl><ol>",
    p_l: "<p>$1</p><dl>",
    u_l: "<li$2>$1</li></ul><dl>",
    o_l: "<li$2>$1</li></ol><dl>",
    uu_l: "<li$2>$1</li></ul></li></ul><dl>",
    uo_l: "<li$2>$1</li></ol></li></ul><dl>",
    ou_l: "<li$2>$1</li></ul></li></ol><dl>",
    oo_l: "<li$2>$1</li></ol></li></ol><dl>",
    d_p: "<dd>$1</dd></dl>",
    // -- table --
    p_t: "<p>$1</p><table>",
    p_r: "<p>$1</p></td></tr>",
    p_c: "<p>$1</p></td>",
    t_p: "</table><p>$1</p>",
    r_r: "<tr><td>$1</td></tr>",
    r_p: "<tr><td><p>$1</p>",
    r_c: "<tr><td>$1</td>",
    r_u: "<tr><td>$1<ul>",
    c_p: "<td><p>$1</p>",
    c_r: "<td>$1</td></tr>",
    c_c: "<td>$1</td>",
		//                  c_u: "<td>$1<ul>",
              u_t: "<li$2>$1</li></ul><table>",
              o_t: "<li$2>$1</li></ol><table>",
              d_t: "<dd>$1</dd></dl><table>",
              t_u: "</table><p>$1</p><ul>",
              t_o: "</table><p>$1</p><ol>",
              t_l: "</table><p>$1</p><dl>"
						};
  var type = { "0": "decimal-leading-zero",
    "1": "decimal",
    "a": "lower-alpha",
    "A": "upper-alpha",
    "i": "lower-roman",
    "I": "upper-roman",
    "g": "lower-greek" };

  var from = "", to = "", maxlen = Math.max(fromLevel.length, toLevel.length), sync = true, sectiontype = type[toLevel.charAt(toLevel.length-1)], transition;

  for (var i=0; i<maxlen; i++)
    if (fromLevel.charAt(i+1) != toLevel.charAt(i+1) || !sync || i == maxlen-1)
  {
    from += fromLevel.charAt(i) == undefined ? " " : fromLevel.charAt(i);
    to += toLevel.charAt(i) == undefined ? " " : toLevel.charAt(i);
    sync = false;
  }
  transition = (from + "_" + to).replace(/([01AIagi])/g, "o");
  return !trf[transition] ? ("?(" +  transition + ")")  // error string !
    : trf[transition].replace(/\$2/, " class=\"" + fromLevel + "\"")
  .replace(/\$3/, !sectiontype ? "" : (" style=\"list-style-type:" + sectiontype + ";\""))
  .replace(/\$1/, content)
  .replace(/<p><\/p>/, "");
}
}
