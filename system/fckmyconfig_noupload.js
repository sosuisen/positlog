FCKConfig.ToolbarSets["PositLogDefault"] = [
	['ShowBlocks','-','RemoveFormat'],
	['Undo','Redo','-','Find','Replace'],
	['OrderedList','UnorderedList','-','Outdent','Indent','Blockquote'],
	['JustifyLeft','JustifyCenter','JustifyRight','JustifyFull'],
	['Bold','Italic','Underline','StrikeThrough','Subscript','Superscript','-','TextColor','BGColor'],
	['Link','Unlink'],
	['Table','Rule','SpecialChar'],
	['FontSize','FontFormat','Style']
] ;


FCKConfig.ToolbarSets["PositLogSuper"] = [
	['ShowBlocks','Source','-','RemoveFormat'],
	['Undo','Redo','-','Find','Replace'],
	['OrderedList','UnorderedList','-','Outdent','Indent','Blockquote'],
	['JustifyLeft','JustifyCenter','JustifyRight','JustifyFull'],
	['Bold','Italic','Underline','StrikeThrough','Subscript','Superscript','-','TextColor','BGColor'],
	['Link','Unlink'],
	['Table','Rule','SpecialChar'],
	['FontSize','FontFormat','Style']
] ;


FCKConfig.StartupFocus	= true;

FCKConfig.FontSizes		= '60%;75%;90%;100%;120%;150%;200%;300%' ;


//FCKConfig.SkinPath = FCKConfig.BasePath + 'skins/positlog/' ;
FCKConfig.SkinPath = '../../fckskins/positlog/' ;


FCKConfig.StylesXmlPath	= '' ;
FCKConfig.CustomStyles = 
{
	'Yellow Marker'	: { Element : 'span', Styles : { 'background-color' : 'yellow', 'padding' : '2px', 'font-weight' : 'bold'} },
	'Red Marker'	: { Element : 'span', Styles : { 'background-color' : '#900000', 'color' : 'white', 'padding' : '2px', 'font-weight' : 'bold'} },
	'Green Marker'	: { Element : 'span', Styles : { 'background-color' : '#009000', 'color' : 'white', 'padding' : '2px', 'font-weight' : 'bold'  } },
	'Blue Marker'	: { Element : 'span', Styles : { 'background-color' : '#000090', 'color' : 'white', 'padding' : '2px', 'font-weight' : 'bold' } }
};

FCKConfig.FontFormats	= 'p;h1;h2;h3;h4;pre;address;div';
FCKConfig.CoreStyles = 
{
	// Basic Inline Styles.
	'Bold'			: { Element : 'b', Overrides : 'strong' },
	'Italic'		: { Element : 'i', Overrides : 'em' },
	'Underline'		: { Element : 'u' },
	'StrikeThrough'	: { Element : 'strike' },
	'Subscript'		: { Element : 'sub' },
	'Superscript'	: { Element : 'sup' },
	
	// Basic Block Styles (Font Format Combo).
	'p'				: { Element : 'p' },
	'div'			: { Element : 'div' },
	'pre'			: { Element : 'pre' },
	'address'		: { Element : 'address' },
//	'h1'			: { Element : 'h1' },
//	'h2'			: { Element : 'h2' },
//	'h3'			: { Element : 'h3' },
//	'h4'			: { Element : 'h4' },
	'h5'			: { Element : 'h5' },
	'h6'			: { Element : 'h6' },

	'h1' : 
	{ 
		Element		: 'h1', 
		Styles		: { 'font-size' : '300%' }
	},

	'h2' : 
	{ 
		Element		: 'h2', 
		Styles		: { 'font-size' : '200%' }
	},

	'h3' : 
	{ 
		Element		: 'h3', 
		Styles		: { 'font-size' : '150%' }
	},

	'h4' : 
	{ 
		Element		: 'h4', 
		Styles		: { 'font-size' : '120%' }
	},


	// Other formatting features.
	'FontFace' : 
	{ 
		Element		: 'span', 
		Styles		: { 'font-family' : '#("Font")' }, 
		Overrides	: [ { Element : 'font', Attributes : { 'face' : null } } ]
	},
	
	'Size' :
	{ 
		Element		: 'span', 
		Styles		: { 'font-size' : '#("Size","fontSize")' }, 
		Overrides	: [ { Element : 'font', Attributes : { 'size' : null } } ]
	},
	
	'Color' :
	{ 
		Element		: 'span', 
		Styles		: { 'color' : '#("Color","color")' }, 
		Overrides	: [ { Element : 'font', Attributes : { 'color' : null } } ]
	},
	
	'BackColor'		: { Element : 'span', Styles : { 'background-color' : '#("Color","color")' } }
};

FCKConfig.FlashUpload = false;
FCKConfig.LinkUpload = false;


FCKConfig.LinkBrowserWindowWidth	= FCKConfig.ScreenWidth * 0.4 ;
FCKConfig.LinkBrowserWindowHeight	= FCKConfig.ScreenHeight * 0.6 ;
//FCKConfig.LinkUploadAllowedExtensions	= ".(7z|aiff|asf|avi|bmp|csv|doc|fla|flv|gif|gz|gzip|jpeg|jpg|mid|mov|mp3|mp4|mpc|mpeg|mpg|ods|odt|pdf|png|ppt|pxd|qt|ram|rar|rm|rmi|rmvb|rtf|sdc|sitd|swf|sxc|sxw|tar|tgz|tif|tiff|txt|vsd|wav|wma|wmv|xls|xml|zip|js)$" ;			// empty for all
FCKConfig.LinkUploadAllowedExtensions	= "" ;			// empty for all

FCKConfig.ImageBrowserWindowWidth  = FCKConfig.ScreenWidth * 0.4 ;
FCKConfig.ImageBrowserWindowHeight = FCKConfig.ScreenHeight * 0.6 ;
FCKConfig.ImageUploadAllowedExtensions	= ".(jpg|gif|jpeg|png)$" ;		// empty for all


FCKConfig.Keystrokes = [
	[ CTRL + 65 /*A*/, true ],
	[ CTRL + 67 /*C*/, true ],
	[ CTRL + 68 /*D*/, true ],
	[ CTRL + 69 /*E*/, true ],
	[ CTRL + 70 /*F*/, true ],
	[ CTRL + 78 /*N*/, true ],
	[ CTRL + 80 /*P*/, true ],
	[ CTRL + 83 /*S*/, true ],
	[ CTRL + 88 /*X*/, true ],
	[ CTRL + 86 /*V*/, 'Paste' ],
	[ CTRL + 88 /*X*/, 'Cut' ],
	[ CTRL + 90 /*Z*/, 'Undo' ],
	[ CTRL + 89 /*Y*/, 'Redo' ],
	[ CTRL + SHIFT + 90 /*Z*/, 'Redo' ]
] ;

FCKConfig.EnterMode = 'br' ;			// p | div | br
FCKConfig.ShiftEnterMode = 'p' ;	// p | div | br
