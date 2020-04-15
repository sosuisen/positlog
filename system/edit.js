//-------------------------------------------------
// edit.js
//
// This file is part of PositLog.
//-------------------------------------------------

//---------------------------
// Globals for edit.js
//---------------------------
var EDT = {};

//------------------------------------------------
// Variables

EDT.loaded = false;
EDT.drawingLoaded = false;

EDT.ctrlKey = false;

// Save mode
EDT.SAVE_NEWBUTTONSPRITE = 0; // Save sprite created by using new button
EDT.SAVE_NEWDROPSPRITE = 1; // Save sprite dropped from desktop
EDT.SAVE_NEWCOMMENTSPRITE = 2; // Save sprite created by using comment button
EDT.SAVE_NEWCLICKSPRITE = 3; // Save sprite created by double clicking
EDT.SAVE_NEWDRAWINGSPRITE = 4; // Save sprite created by drawing
EDT.SAVE_NEWARROWSPRITE = 5; // Save sprite created by drawing
EDT.SAVE_NEWPAGESPRITE = 6; // Save sprite created by using new page button
EDT.SAVE_PASTEDSPRITE = 7; // Save sprite which is pasted from a clip
EDT.SAVE_FROMEDITOR = 8; // Save sprite from editor
EDT.SAVE_PROPERTY = 9; // Save only property

// Editor type
if((PARAM.editorType == PLG.CONST.RICH_EDITOR)
	 && (PLG.browser.opera || PLG.browser.safari2)){
	PARAM.editorType = PLG.CONST.SIMPLE_EDITOR;
}

EDT.currentEditorType = PARAM.editorType;

// Previous mouse down
EDT.prevMouseDownXonWorld = 0;
EDT.prevMouseDownYonWorld = 0;

// Sprite width
EDT.SPRITEWIDTH_MIN = 24;
EDT.DEFAULT_SPRITEWIDTH = 240;
// Menu width
EDT.SPRITEMENUWIDTH_MIN = 100;
EDT.SPRITEMENUWIDTH_MAX = 400;
EDT.LINKMENUWIDTH = 60;

// Comment
EDT.parentOfComment = null;
EDT.commentFlag = false;

// Link
EDT.linkSrcSprite = null;

// Type of tool
EDT.TOOL_NORMAL = 0;
EDT.TOOL_ARROWLINK = 1;
EDT.TOOL_DRAWING = 2;
EDT.currenttool = EDT.TOOL_NORMAL;

EDT.canDrop = false;

EDT.sumOfSpriteMoveX = 0;
EDT.sumOfSpriteMoveY = 0;

EDT.pendownFlag = false;
EDT.pendownFirstFlag = false;
EDT.pensize = 2;
EDT.penColor = "#000000";

EDT.drawRecord = [];
EDT.drawCanvasLeft = Number.MAX_VALUE;
EDT.drawCanvasRight = -Number.MAX_VALUE;
EDT.drawCanvasTop = Number.MAX_VALUE;
EDT.drawCanvasBottom = -Number.MAX_VALUE;

EDT.sprName = {
	"0" : "a",
	"1" : "b",
	"2" : "c",
	"3" : "d",
	"4" : "e",
	"5" : "f",
	"6" : "g",
	"7" : "h",
	"8" : "i",
	"9" : "j",
	"10" : "k",
	"11" : "l",
	"12" : "m",
	"13" : "n",
	"14" : "o",
	"15" : "p",
	"16" : "q",
	"17" : "r",
	"18" : "s",
	"19" : "t",
	"20" : "u",
	"21" : "v",
	"22" : "w",
	"23" : "x",
	"24" : "y",
	"25" : "z"
};

EDT.paddingIndex = {
	"0px" : "0",
	"1px" : "1",
	"2px" : "2",
	"3px" : "3",
	"4px" : "4",
	"6px" : "5",
	"8px" : "6",
	"10px" : "7",
	"12px" : "8",
	"16px" : "9"
};

EDT.borderWidthIndex = {
	"0px" : "0",
	"1px" : "1",
	"2px" : "2",
	"3px" : "3",
	"4px" : "4",
	"6px" : "5",
	"8px" : "6",
	"10px" : "7",
	"12px" : "8",
	"16px" : "9"
};

EDT.lineWidthIndex = {
	"1px" : "0",
	"2px" : "1",
	"3px" : "2",
	"4px" : "3",
	"6px" : "4",
	"8px" : "5",
	"10px" : "6",
	"12px" : "7",
	"16px" : "8",
	"32px" : "9"
};

EDT.borderStyleIndex = {
	"none" : "0",
	"solid" : "1",
	"double" : "2",
	"dotted" : "3",
	"dashed" : "4",
	"groove" : "5",
	"ridge" : "6",
	"inset" : "0",
	"outset" : "8"
};

EDT.lineStyleIndex = {
	"Curve" : "0",
	"CurveReverse" : "1",
	"Straight" : "2"
};

EDT.lineStyleName = {
	"Curve" : MESSAGE.ARROWCURVE,
	"CurveReverse" : MESSAGE.ARROWCURVEREVERSE,
	"Straight" : MESSAGE.ARROWSTRAIGHT
};

EDT.borderStyleName = {
	"none" : "-",
	"solid" : MESSAGE.FRAMESOLID,
	"double" : MESSAGE.FRAMEDOUBLE,
	"dotted" : MESSAGE.FRAMEDOTTED,
	"dashed" : MESSAGE.FRAMEDASHED,
	"groove" : MESSAGE.FRAMEGROOVE,
	"ridge" : MESSAGE.FRAMERIDGE,
	"inset" : MESSAGE.FRAMEINSET,
	"outset" : MESSAGE.FRAMEOUTSET
};

EDT.responseText = {
	"Permission denied" : MESSAGE.PERMISSIONDENIED,
	"unlockpassword" : MESSAGE.EDITOR_PASSWORDUNLOCKED,
	"invalid_public_password" : MESSAGE.EDITOR_INVALIDPASSWORD,
	"succeed" : MESSAGE.SUCCEED,
	"saved" : MESSAGE.SAVED,
	"Too large" : MESSAGE.TOOLARGE
};

EDT.defaultcolor = [
"#000000", "#ffffff", "#e0e0e0", "#c0c0c0", "#a0a0a0", "#808080", "#505050", "#202020",

"#a00000", "#603010", "#000090", "#306060", "#009000", "#306030", "#606030", "#603060",

"#ffc0e0", "#ffd090", "#c0e0f0", "#e0f0f0", "#c0ffc0", "#f0fff0", "#ffffd0", "#f0e0f0",

"#ff0000", "#ffc000", "#0000ff", "#c000ff", "#00ff00", "#00ffff", "#ffff00", "#ff00ff"];

EDT.usercolor = [
"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", ""];

EDT.recentcolor = [
"", "", "", "", "", "", "", ""];


EDT.COLOR_SELECTEDSPRITE = "#2020c0";
EDT.COLOR_FIXEDSPRITE = "#a0a0f0";
EDT.COLOR_FIXEDMULTISPRITES = "#80d080";
EDT.COLOR_SUBMENU = "#efecde";
EDT.COLOR_SUBMENUSELECTED = "#d0d0f0";
EDT.COLOR_GUIDEARROW = "rgba(200,200,240,0.4)";

EDT.editorConfigPath = PARAM.SYSTEMPATH + "fckmyconfig.js";

// ------------------------------------------------
// Methods

EDT.saveHomePosition = function(){
	var vp = PLG.viewPositionX + "," + PLG.viewPositionY;
	var zoom = PLG.zoom;
	if(PLG.zoom != 1 && PLG.zoom == PLG.minimumzoom){
		zoom = "birdview";
	}
	var postdata = "&pageid=" + PARAM.pageid + "&vp=" + vp + "&zoom=" + zoom;

	var savePagePropertiesOnLoaded = function(obj) {
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		$("controlresult").innerHTML = EDT.getResponseText(res);
	};

	PLG.sendRequest(savePagePropertiesOnLoaded, postdata, "POST", PARAM.CGIFILEPATH + "savePageProperties.cgi", true, true);
};

EDT.DROPFRAMEWIDTH = 8;
EDT.showDropFrame = function(){
	var df = $("dropframe");
	if(df.style.display != "block"){
		df.style.display = "block";
		if(PLG.browser.msie || PLG.browser.msie7){
			df.style.filter = "alpha(opacity=50)";
		}
		else{
			df.style.opacity = 0.5;
		}
	}
	df.style.left = "0px";
	var cpH = $("controlpanel").offsetHeight;
	df.style.top =  parseInt(cpH) + "px";
	df.style.width = PLG.getInnerWidth() - EDT.DROPFRAMEWIDTH * 2 + "px";
	df.style.height = PLG.getInnerHeight() - EDT.DROPFRAMEWIDTH * 2 - cpH + "px";
};

EDT.hideDragFrame = function(){
	$("dropframe").style.display = "none";
};

function PLG_onfiledrop(x, y, result){
	var html = new String(result);
	if(EDT.responseText[html]){
		alert(EDT.responseText[html]);
		return;
	}
	var width = 0;
	if(html.match(/width=\'(.+?)\'/)){
		width = parseInt(RegExp.$1);
	}
	var posX = 0;
	var posY = 0;
	if(PLG.browser.msie || PLG.browser.msie7){
		posX = x - window.screenLeft;
		posY = y - window.screenTop;
	}
	else if(PLG.browser.opera){
		posX = x - window.screenLeft;
		posY = y - window.screenTop;
	}
	else{
		posX = x - window.screenX;
		posY = y - window.screenY - (window.outerHeight - PLG.getInnerHeight());
	}

	var rect = {};
	rect.left = PLG.browserXtoWorldX(posX);
	rect.top = PLG.browserYtoWorldY(posY);
	if(width != 0){
		rect.width = parseInt(width) + 4;
	}
	else{
		rect.width = EDT.DEFAULT_SPRITEWIDTH;
	}
	var contents = html;
	EDT.createSprite(EDT.SAVE_NEWDROPSPRITE, contents, EDT.generateNewID("spr", PARAM.sprites), rect);

}

function PLG_getWindowRect(){
	if(PLG.browser.msie || PLG.browser.msie7){
		return window.screenLeft + "," + window.screenTop + "," + document.documentElement.clientWidth + "," + document.documentElement.clientHeight;
	}
	else if(PLG.browser.opera){
		return window.screenLeft + "," + window.screenTop + "," + window.outerWidth + "," + window.outerHeight;
	}
	else{
		var offsetY = window.outerHeight - PLG.getInnerHeight();
		return window.screenX + "," + (window.screenY + offsetY)  + "," + window.outerWidth + "," + (window.outerHeight - offsetY);
	}
}

function PLG_dragEnter(){
	EDT.showDropFrame();
	$("dropframe").style.borderWidth = EDT.DROPFRAMEWIDTH + "px";
	$("dropframe").style.borderStyle = "solid";
	$("dropframe").style.color = "rgb(176,255,116)";
}

function PLG_dragExit(){
	EDT.showDropFrame();
	$("dropframe").style.borderWidth = EDT.DROPFRAMEWIDTH + "px";
	$("dropframe").style.borderStyle = "solid";
	$("dropframe").style.color = "rgb(255,176,116)";
}

EDT.setSpriteInfo = function(spr){
	var id = spr.id;
	var infoElm = PLG.getSpriteInfo(spr);

	if(!infoElm){
		return;
	}

	// Reset
	var region = PLG.getSpriteRegion(spr);
	region.removeChild(infoElm);
	var infoElm = PLG.createElm("div");
	region.appendChild(infoElm);
	if(PLG.browser.msie || PLG.browser.msie7){
		infoElm.style.cssText = "font-size: 80%; left: 0px; right: 0px; margin: 0px; padding: 0px; border: 0px;";
		infoElm.setAttribute("className", "info");
	}
	else{
		infoElm.setAttribute("class", "info");
	}

	// Set tag
	if(PARAM.sprites[id].display.tag == 1){
		var tag = PARAM.sprites[id].tag;
		if(tag !== undefined && tag !== null && tag !== ""){
			var elm = PLG.createElm("span");
			if(PLG.browser.msie || PLG.browser.msie7){
				elm.style.cssText = "display: block; float: right; margin-left: 5px; margin-right: 5px;";
				elm.setAttribute("className", "tag");
			}
			else{
				elm.setAttribute("class", "tag");
			}
			elm.appendChild(document.createTextNode(""));

			var tagArray = tag.split(",");
			var tagStr = "";
			for(var i=0; i<tagArray.length; i++){
				var tag = tagArray[i];
				if(PARAM.mod_rewrite == 1){
					tagStr += "<a href='./tag/" + encodeURIComponent(tag) + "' rel='tag'>" + tag + "</a>, ";
				}
				else{
					tagStr += "<a href='./tag.cgi?tag=" + encodeURIComponent(tag) + "'>" + tag + "</a>, ";
				}
			}
			if(tagStr !== ""){
				tagStr = tagStr.substr(0, tagStr.length - 2);
			}
			elm.innerHTML = tagStr;
			infoElm.appendChild(elm);
			infoElm.appendChild(PLG.createElm("br"));
		}
	}

	// Set author
	if(PARAM.sprites[id].display.author == 1){
		var elm = PLG.createElm("span");
		if(PLG.browser.msie || PLG.browser.msie7){
			elm.style.cssText = "display: block; float: right; margin-left: 5px; margin-right: 5px;";
			elm.setAttribute("className", "author");
		}
		else{
			elm.setAttribute("class", "author");
		}
		elm.appendChild(document.createTextNode(""));
		elm.innerHTML = PARAM.sprites[id].author;
		infoElm.appendChild(elm);
	}

	// Set time
	if(PARAM.sprites[id].display.created_time == 1){
		var elm = PLG.createElm("span");
		if(PLG.browser.msie || PLG.browser.msie7){
			elm.style.cssText = "display: block; float: right; margin-left: 5px; margin-right: 5px;";
			elm.setAttribute("className", "time");
		}
		else{
			elm.setAttribute("class", "time");
		}
		var time = String(PARAM.sprites[id].created_time);
		var timeValue = time.substring(0, 4) + "/" + time.substring(4, 6) + "/" + time.substring(6, 8) + " " + time.substring(8, 10) + ":" + time.substring(10, 12) + ":" + time.substring(12, 14);
		// This is ad-hoc i18n. It will be improved in version 0.61.
		if(PARAM.language == "en"){
			timeValue = time.substring(4, 6) + "/" + time.substring(6, 8) + "/" + time.substring(0, 4) + " " + time.substring(8, 10) + ":" + time.substring(10, 12) + ":" + time.substring(12, 14);
		}
		elm.appendChild(document.createTextNode(timeValue));
		infoElm.appendChild(elm);
	}

	// Set uri
	if(PARAM.sprites[id].display.uri == 1){
		var elm = PLG.createElm("span");
		if(PLG.browser.msie || PLG.browser.msie7){
			elm.style.cssText = "display: block; float: right; margin-left: 5px; margin-right: 5px;";
			elm.setAttribute("className", "uri");
		}
		else{
			elm.setAttribute("class", "uri");
		}
		var uri = "<a href='./positlog.cgi?load=" + PARAM.pageid + "#id_" + id + "'>link</a>";
		if(PARAM.mod_rewrite == 1){
			uri = "<a href='./" + PARAM.pageid + ".html#id_" + id + "'>link</a>";
		}

		elm.appendChild(document.createTextNode(""));
		elm.innerHTML = uri;
		infoElm.appendChild(elm);
	}

	// Set src
	if(PARAM.sprites[id].src){
		var elm = PLG.createElm("span");
		if(PLG.browser.msie || PLG.browser.msie7){
			elm.style.cssText = "display: block; float: right; margin-left: 5px; margin-right: 5px;";
			elm.setAttribute("className", "src");
		}
		else{
			elm.setAttribute("class", "src");
		}
		var srcArray = PARAM.sprites[id].src.split(",");
		var uri = "<a href='./positlog.cgi?load=" + srcArray[0] + "#id_" + srcArray[1] + "'>src</a>";
		if(PARAM.mod_rewrite == 1){
			uri = "<a href='./" + srcArray[0] + ".html#id_" + srcArray[1] + "'>src</a>";
		}
		elm.style.cssText = "display: block; float: right; margin-left: 5px; margin-right: 5px;";
		elm.appendChild(document.createTextNode(""));
		elm.innerHTML = uri;
		infoElm.appendChild(elm);
	}

	if(PLG.browser.msie || PLG.browser.msie7){
		if(infoElm.hasChildNodes()){
			infoElm.style.width = "100%"; // If this style is not set, IE6 and IE7 fail to calculate the offsetHeight of the sprite including <p> element. 
		}
		else{
			infoElm.style.width = "auto";
		}
	}
	
	if(PARAM.sprites[id].isDrawing){
		PLG.setDrawingTitle(spr);
	}

	// Adjust the position of the scaler.
	EDT.view.setSpriteMenu();	

	if(id.match(/_link$/)){
		PLG.showArrowTags(spr);
	}
};

// You can only draw or pick color while modal dialog is opened.
EDT.modalDialogIsOpened = function() {
	if(EDT.editor.mode != EDT.EDITOR_CLOSE || EDT.colorpicker.mode != EDT.PICKER_CLOSE || EDT.uploader.mode != EDT.PICKER_CLOSE || EDT.plugin.mode != EDT.PLUGIN_CLOSE || EDT.drawingtool.mode != EDT.DRAWINGTOOL_CLOSE){
		return true;
	}
	else{
		return false;
	}
};

EDT.showCopyright = function(){
	alert(PLG.copyright + "\nCopyright (c) 2006-2008 Hidekazu Kubota\nhidekaz@positlog.org\nhttp://positlog.com/");
}

EDT.copyrightOnMouseOver = function(){
	$("copyrightinfo").style.color = "#8F8C7E";
}

EDT.copyrightOnMouseOut = function(){
	$("copyrightinfo").style.color = "#ffffff";
}

EDT.getRootID = function(id) {
	if(id.match(/^spr.+$/)){
		if(PARAM.sprites[id].groupid){
			id = PARAM.sprites[id].groupid;
		}
	}
	while(PARAM.groups[id] && PARAM.groups[id].groupid){
		id = PARAM.groups[id].groupid;
	}
	return id;
};

EDT.CurrentDate = function() {
	var d = new Date();
	var year = year = d.getYear();
	if(!PLG.browser.msie && !PLG.browser.msie7){
		year += 1900;
	}
	var month = d.getMonth() + 1;
	if(month.toString().length == 1){
		month = "0" + month.toString();
	}
	var date = d.getDate();
	if(date.toString().length == 1){
		date = "0" + date.toString();
	}
	var hours = d.getHours();
	if(hours.toString().length == 1){
		hours = "0" + hours.toString();
	}
	var minutes = d.getMinutes();
	if(minutes.toString().length == 1){
		minutes = "0" + minutes.toString();
	}
	var seconds = d.getSeconds();
	if(seconds.toString().length == 1){
		seconds = "0" + seconds.toString();
	}

	this.getDate = function() {
		return year.toString() + month.toString() + date.toString() + hours.toString() + minutes.toString() + seconds.toString();
	};

	this.getDateStr = function() {
		return year + "/" + month + "/" + date + " " + hours + ":" + minutes + ":" + seconds;
	};
};

EDT.getResponseText = function(res) {
	var resText = EDT.responseText[res];
	if(resText === undefined){
		return res;
	}
	else{
		return resText;
	}

};

EDT.getMenuWidth = function(width) {
	if(PLG.selection.currentFixed.id.match(/_link$/)){
		return EDT.LINKMENUWIDTH;
	}

	if(!width){
		width = Math.round(PARAM.sprites[PLG.selection.currentFixed.id].width * PLG.zoom);
	}
	var menu = $("spritemenu");
	width = Math.round(width * 2 / 3);
	if(width < EDT.SPRITEMENUWIDTH_MIN){
		width = EDT.SPRITEMENUWIDTH_MIN;
	}
	if(width > EDT.SPRITEMENUWIDTH_MAX){
		width = EDT.SPRITEMENUWIDTH_MAX;
	}
	return width;
};



EDT.reConnectArrow = function(srcPos, dstPos){
	if(PLG.selection.currentFixed !== null){
		var sid = PLG.selection.currentFixed.id;
		if(PARAM.sprites[sid].innerHTML.match(/draw\(\'(.+?)\'\);/i)){
			var drawCommandStr = RegExp.$1;
			var cmdArray = drawCommandStr.split(",");
			var srcid = cmdArray[2];
			var dstid = cmdArray[3];
			var lineColor = cmdArray[4];
			var lineWidth = cmdArray[5];
			var lineStyle = cmdArray[6];
			var oldSrcPos = cmdArray[7];
			var oldDstPos = cmdArray[8];
			if(srcPos === ""){
				srcPos = oldSrcPos;
			}
			if(dstPos === ""){
				dstPos = oldDstPos;
			}
			var drawCommand = "shape,arrow," + srcid + "," + dstid + "," + lineColor + "," + lineWidth + ",Curve," + srcPos + "," + dstPos;
			var contents = "<canvas width='100' height='100' id='" + sid + "_canvas'></canvas><script type='text/javascript'>\n<!--\nPLG.draw('" + drawCommand + "');\n// -->\n</script>";
			PLG.getSpriteContents(PLG.selection.currentFixed).innerHTML = contents;

			EDT.saveFromEditor(PLG.selection.currentFixed, EDT.SAVE_PROPERTY, true);
		}
	}
};


// -------------------------------------------------------------------------------------------------------
// Submenu (Context menu)

EDT.submenu = {};
EDT.submenu.items = [
"sprite-submenu-contextmenu",
"sprite-submenu-cut", 
"sprite-submenu-copy", 
"sprite-submenu-paste", 
"sprite-submenu-alias", 
"sprite-submenu-delete", 
"sprite-submenu-newsprite", 
"sprite-submenu-newpage", 
"sprite-submenu-group", 
"sprite-submenu-ungroup", 
"sprite-submenu-sendtotop", 
"sprite-submenu-sendtobottom"
];

EDT.submenu.selectedItem = "";
EDT.submenu.normalContext = false;
EDT.submenu.mouseX = 0;
EDT.submenu.mouseY = 0;
EDT.submenu.ignoreFlag = false;

EDT.submenu.addItem = function(menu, id, caption) {
	var elm = PLG.createElm("div", id);
	elm.appendChild(document.createTextNode(""));
	elm.innerHTML = caption;
	elm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
		PLG.ignoreMouseUp = true;
	};
	menu.appendChild(elm);
	return elm;
};

EDT.submenu.initialize = function() {
	var submenuElm = PLG.createElm("div", "sprite-submenu");
	submenuElm.style.display = "none";
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		submenuElm.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}
	submenuElm.style.backgroundColor = EDT.COLOR_SUBMENU;
	submenuElm.onmousemove = EDT.submenu.onMouseMove;
	if(PLG.browser.mozes){
		submenuElm.style.MozUserSelect = "none";
	}
	else if(PLG.browser.safari){
		submenuElm.style.KhtmlUserSelect = "none";
	}

	var cutElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-cut", MESSAGE.SUBMENU_CUT);
	cutElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	cutElm.onmouseup = function() {
		EDT.cutSprite();
		EDT.submenu.close();
	};

	var copyElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-copy", MESSAGE.SUBMENU_COPY);
	copyElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	copyElm.onmouseup = function() {
		EDT.copySprite();
		EDT.submenu.close();
	};

	var pasteElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-paste", MESSAGE.SUBMENU_PASTE);
	pasteElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	pasteElm.onmouseup = EDT.pasteSprite;

	var aliasElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-alias", MESSAGE.SUBMENU_ALIAS);
	aliasElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	aliasElm.onmouseup = EDT.aliasSprite;

	var deleteElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-delete", MESSAGE.SUBMENU_DELETE);
	deleteElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	deleteElm.onmouseup = EDT.deleteDialog;


	var newspriteElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-newsprite", MESSAGE.SUBMENU_NEWSPRITE);
	newspriteElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	newspriteElm.onmouseup = EDT.createSpriteFromSubmenu;

	var newpageElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-newpage", MESSAGE.SUBMENU_NEWPAGE);
	newpageElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	newpageElm.onmouseup = EDT.createPageFromSubmenu;

	var groupElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-group", MESSAGE.SUBMENU_GROUP);
	groupElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	groupElm.onmouseup = function() {
		if(PLG.selection.length() > 1){
			EDT.groupSprites();
			EDT.submenu.close();
		}
	};

	var ungroupElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-ungroup", MESSAGE.SUBMENU_UNGROUP);
	ungroupElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	ungroupElm.onmouseup = function() {
		if(PARAM.sprites[PLG.selection.currentFixed.id].groupid && PLG.selection.length() == 1){
			EDT.ungroupSprites();
			EDT.submenu.close();
		}
	};

	var topElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-sendtotop", MESSAGE.SUBMENU_SENDTOTOP);
	topElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	topElm.onmouseup = function() {
		EDT.sendToTop();
	};

	var bottomElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-sendtobottom", MESSAGE.SUBMENU_SENDTOBOTTOM);
	bottomElm.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	bottomElm.onmouseup = function() {
		EDT.sendToBottom();
	};

	var contextElm = EDT.submenu.addItem(submenuElm, "sprite-submenu-contextmenu", MESSAGE.SUBMENU_CONTEXTMENU);
	contextElm.onmousedown = function() {
//		EDT.submenu.normalContext = true;
		PLG.ignoreMouseDown = true;
	};

	$("spriteslist").appendChild(submenuElm);
};

EDT.submenu.onMouseMove = function(e) {
	var x = PLG.mouseXonWorld(e, true) - $("sprite-submenu").offsetLeft;
	var y = PLG.mouseYonWorld(e, true) - $("sprite-submenu").offsetTop;

	for(var i = 0; i < EDT.submenu.items.length; i++){
		if(y > $(EDT.submenu.items[i]).offsetTop 
			 && y < parseInt($(EDT.submenu.items[i]).offsetTop) + parseInt($(EDT.submenu.items[i]).offsetHeight)){
			if(EDT.submenu.selectedItem !== ""){
				$(EDT.submenu.selectedItem).style.backgroundColor = EDT.COLOR_SUBMENU;
			}
			$(EDT.submenu.items[i]).style.backgroundColor = EDT.COLOR_SUBMENUSELECTED;
			EDT.submenu.selectedItem = EDT.submenu.items[i];

			if(EDT.submenu.selectedItem == "sprite-submenu-contextmenu"){
				EDT.submenu.normalContext = true;
			}
			else{
				EDT.submenu.normalContext = false;
			}
			break;
		}
	}
};

EDT.submenu.close = function() {
	// To avoid SAVE_NEWCLICKSPRITE
	if($("sprite-submenu").style.display == "block"){
		EDT.prevMouseDownXonWorld -= 100;
		if(EDT.submenu.selectedItem !== ""){
			$(EDT.submenu.selectedItem).style.backgroundColor = EDT.COLOR_SUBMENU;
		}
		$("sprite-submenu").style.display = "none";
	}
};

EDT.submenu.open = function(e, submenuFlag) {
	if(EDT.currenttool == EDT.TOOL_DRAWING){
		return;
	}

	if(EDT.submenu.ignoreFlag){
		EDT.submenu.ignoreFlag = false;
		return;
	}

	if($("sprite-submenu").style.display == "block"){
		if(EDT.submenu.selectedItem !== ""){
			$(EDT.submenu.selectedItem).style.backgroundColor = EDT.COLOR_SUBMENU;
		}
	}

	EDT.prevMouseDownXonWorld -= 100;
	PLG.setViewPositionFlag = false;

	EDT.submenu.selectedItem = "";

	var submenu = $("sprite-submenu");

	if(submenuFlag){
		submenu.style.left = (PLG.sprLeft(PLG.selection.currentFixed) + $("spritemenu").offsetWidth) + "px"
		submenu.style.top = PLG.sprTop(PLG.selection.currentFixed) - $("spritemenu").offsetHeight + "px"
		submenu.style.display = "block";
		PLG.ignoreMouseDown = true;
	}
	else{
		submenu.style.top = PLG.mouseYonWorld(e, true) + "px";
		// Display submenu to get offsetWidth
		submenu.style.display = "block";
		submenu.style.left = (PLG.mouseXonWorld(e, true) - $("sprite-submenu").offsetWidth) + "px";

		EDT.submenu.mouseX = PLG.mouseXonWorld(e);
		EDT.submenu.mouseY = PLG.mouseYonWorld(e);
	}
	if(submenu.offsetLeft < PLG.browserXtoWorldX(0, true)){
		submenu.style.left = PLG.mouseXonWorld(e, true) + "px";
	}
	if(submenu.offsetLeft + submenu.offsetWidth > PLG.browserXtoWorldX(PLG.getInnerWidth(), true)){
		submenu.style.left = submenu.offsetLeft - submenu.offsetWidth - $("sprite-opensubmenu").offsetWidth + "px";
	}
	if(submenu.offsetTop + submenu.offsetHeight > PLG.browserYtoWorldY(PLG.getInnerHeight(), true)){
		submenu.style.top = submenu.offsetTop - submenu.offsetHeight + "px";
	}
//	if(e || (PLG.browser.msie || PLG.browser.msie7)){
	if(submenuFlag){
		$("sprite-submenu-contextmenu").style.display = "none";
	}
	else{
		$("sprite-submenu-contextmenu").style.display = "block";
	}
	if(PLG.selection.currentFixed && PLG.selection.currentFixed.id.match(/_link$/)){
		$("sprite-submenu-cut").style.display = "none";
		$("sprite-submenu-copy").style.display = "none";
		$("sprite-submenu-paste").style.display = "none";
		$("sprite-submenu-alias").style.display = "none";
		$("sprite-submenu-delete").style.display = "block";
		$("sprite-submenu-newsprite").style.display = "none";
		$("sprite-submenu-newpage").style.display = "none";
		$("sprite-submenu-group").style.display = "none";
		$("sprite-submenu-ungroup").style.display = "none";
		$("sprite-submenu-sendtotop").style.display = "block";
		$("sprite-submenu-sendtobottom").style.display = "block";
	}
	else if(PLG.selection.currentFixed){
		if(PARAM.sprites[PLG.selection.currentFixed.id].template !== undefined && PARAM.sprites[PLG.selection.currentFixed.id].template == 1){
			$("sprite-submenu-cut").style.display = "none";
			$("sprite-submenu-copy").style.display = "block";
			$("sprite-submenu-paste").style.display = "none";
			$("sprite-submenu-alias").style.display = "none";
			$("sprite-submenu-delete").style.display = "none";
			$("sprite-submenu-newsprite").style.display = "none";
			$("sprite-submenu-newpage").style.display = "none";
			$("sprite-submenu-group").style.display = "none";
			$("sprite-submenu-ungroup").style.display = "none";
			$("sprite-submenu-sendtotop").style.display = "none";
			$("sprite-submenu-sendtobottom").style.display = "none";
		}
		else{
			$("sprite-submenu-cut").style.display = "block";
			$("sprite-submenu-copy").style.display = "block";
			$("sprite-submenu-paste").style.display = "none";
			$("sprite-submenu-alias").style.display = "none";
			$("sprite-submenu-delete").style.display = "block";
			$("sprite-submenu-newsprite").style.display = "none";
			$("sprite-submenu-newpage").style.display = "none";
			$("sprite-submenu-group").style.display = "block";
			$("sprite-submenu-ungroup").style.display = "block";
			$("sprite-submenu-sendtotop").style.display = "block";
			$("sprite-submenu-sendtobottom").style.display = "block";
		}
	}
	else{
		$("sprite-submenu-cut").style.display = "none";
		$("sprite-submenu-copy").style.display = "none";
		$("sprite-submenu-paste").style.display = "block";
		$("sprite-submenu-alias").style.display = "block";
		$("sprite-submenu-delete").style.display = "none";
		$("sprite-submenu-newsprite").style.display = "block";
		$("sprite-submenu-newpage").style.display = "block";
		$("sprite-submenu-group").style.display = "none";
		$("sprite-submenu-ungroup").style.display = "none";
		$("sprite-submenu-sendtotop").style.display = "none";
		$("sprite-submenu-sendtobottom").style.display = "none";
	}

	if(PARAM.create_page == 1){
		$("sprite-submenu-newpage").style.color = "#000000";
	}
	else{
		$("sprite-submenu-newpage").style.color = "#a0a0a0";
	}

	var prevY = 0;
	for(var i = 0;i < EDT.submenu.items.length; i++){
		if($(EDT.submenu.items[i]).style.display == "block"){
			$(EDT.submenu.items[i]).style.top = prevY + "px";
			prevY += $(EDT.submenu.items[i]).offsetHeight;
		}
	}
	$("sprite-submenu").style.height = prevY + "px";

	if(PLG.selection.currentFixed && PARAM.sprites[PLG.selection.currentFixed.id].groupid && PLG.selection.length() == 1){
		$("sprite-submenu-ungroup").style.color = "#000000";
	}
	else{
		$("sprite-submenu-ungroup").style.color = "#a0a0a0";
	}

	if(PLG.selection.length() > 1){
		$("sprite-submenu-group").style.color = "#000000";
	}
	else{
		$("sprite-submenu-group").style.color = "#a0a0a0";
	}

	var clip = PLG.getCookie("clip");
	var deleted = "false";

	if(clip !== undefined && clip !== "" && EDT.isValidClip(clip)){
		var clipArray = clip.split("&");
		deleted = clipArray[8];
		$("sprite-submenu-paste").style.color = "#000000";
		if(deleted == "true"){
			$("sprite-submenu-alias").style.color = "#a0a0a0";
		}
		else{
			$("sprite-submenu-alias").style.color = "#000000";
		}
	}
	else{
		$("sprite-submenu-paste").style.color = "#a0a0a0";
		$("sprite-submenu-alias").style.color = "#a0a0a0";
	}
};


// -----------------------------------------------------------------------------------------------
// Selection (See also positlog.js)

PLG.selection.hash = {}; // Contains sprite id and group id
PLG.selection.array = []; // Contains sprite id and group id
PLG.selection.allsprites = {}; // Contains all sprite ids which are
// selected
PLG.selection.currentFixed = null; // is sprite (not group)
PLG.selection.prevFixedID = ""; // is sprite id (not group)
PLG.selection.region = {};
PLG.selection.x = 0;
PLG.selection.y = 0;
PLG.selection.width = 1;
PLG.selection.height = 1;
PLG.selection.fix = function(id, clearFlag) {

	if(this.prevFixedID != id){
		$("tagfield").value = "";
//		EDT.view.setPropertyDirty(false);
		if(EDT.view.isConnectorVisible){
			EDT.view.toggleConnector(false);
		}
	}

	if(id.match(/^spr.+$/)){
		this.current = $(id);
		if(this.isMultiFixed() === 0){
			this.currentFixed = $(id);
		}
	}

	this.prevFixedID = this.currentFixed.id;

	id = EDT.getRootID(id);
	if(!this.hash[id]){
		PLG.selection.add(id);
	}
	this.hash[id].fixed = true;
	if(clearFlag){
		// clear "fixed"
		for(var itemid in this.allsprites){
			if(!itemid.match(/^spr.+$/) && !itemid.match(/^grp.+$/)){
				continue;
			}
			if(this.allsprites[itemid].fixed){
				delete this.allsprites[itemid].fixed;
			}
		}
		for(var i = 0;i < this.array.length; i++){
			if(this.hash[this.array[i]].fixed){
				delete this.hash[this.array[i]].fixed;
			}
		}
	}
	if(id.match(/^spr.+$/)){
		this.allsprites[id].fixed = true;
	}
	else{
		var queue = [];
		queue.push(id);
		while(queue.length > 0){
			var gid = queue.pop();
			for(var itemid in PARAM.groups[gid]){
				if(!itemid.match(/^spr.+$/) && !itemid.match(/^grp.+$/)){
					continue;
				}
				if(itemid.match(/^grp.+$/)){
					queue.push(itemid);
				}
				else{
					this.allsprites[itemid].fixed = true;
				}
			}
		}
	}
};

PLG.selection.isFixed = function(id) {
	if(id.match(/^spr.+$/)){
		if(this.allsprites[id] && this.allsprites[id].fixed){
			return true;
		}
		else{
			return false;
		}
	}
	else if(id.match(/^grp.+$/)){
		if(this.hash[id] && this.hash[id].fixed){
			return true;
		}
		else{
			return false;
		}
	}
	return false;
};

PLG.selection.isMultiFixed = function() {
	var counter = 0;
	for(var i = 0;i < this.array.length; i++){
		if(this.hash[this.array[i]].fixed){
			counter++;
		}
		if(counter > 1){
			return 2;
		}
	}
	return counter;
};

PLG.selection.calcRegion = function() {
	if(this.array.length === 0){
		return;
	}
	var left = Number.MAX_VALUE;
	var right = -Number.MAX_VALUE;
	var top = Number.MAX_VALUE;
	var bottom = -Number.MAX_VALUE;
	for(var i = 0;i < this.array.length; i++){
		var id = this.array[i];
		if(!this.hash[id].fixed){
			continue;
		}
		var region = null;
		var position = null;
		var hash = null;
		if(id.match(/^spr.+$/)){
			hash = PARAM.sprites[id];
		}
		else if(id.match(/^grp.+$/)){
			hash = PARAM.groups[id];
		}
		else{
			continue;
		}

		if(hash === null || hash.x === undefined){
			continue;
		}

		if(hash.x < left){
			left = hash.x;
		}
		if(hash.x + hash.width > right){
			right = hash.x + hash.width;
		}
		if(hash.y < top){
			top = hash.y;
		}
		if(hash.y + hash.height > bottom){
			bottom = hash.y + hash.height;
		}
	}

	this.x = left;
	this.y = top;
	this.width = right - left;
	this.height = bottom - top;
};

PLG.selection.add = function(id) {
	if(id.match(/^spr.+$/)){
		this.current = $(id);
	}
	id = EDT.getRootID(id);
	if(this.hash[id] === undefined){
		this.hash[id] = {};
		this.array.push(id);
		if(id.match(/^spr.+$/)){
			this.allsprites[id] = {};
		}
		else{
			var queue = [];
			queue.push(id);
			while(queue.length > 0){
				var gid = queue.pop();
				for(var itemid in PARAM.groups[gid]){
					if(!itemid.match(/^spr.+$/) && !itemid.match(/^grp.+$/)){
						continue;
					}
					if(itemid.match(/^grp.+$/)){
						queue.push(itemid);
					}
					else{
						this.allsprites[itemid] = {};
					}
				}
			}
		}

		this.calcRegion();

		return this.array.length;
	}
	return false;
};

PLG.selection.remove = function(id) {

	if(id.match(/^spr.+$/)){
		if(this.current && this.current.id == id){
			this.current = null;
		}
		if(this.currentFixed && this.currentFixed.id == id){
			this.currentFixed = null;
		}
	}
	id = EDT.getRootID(id);
	if(this.hash[id] !== undefined){
		var i = 0;
		for(;i < this.array.length; i++){
			if(id == this.array[i]){
				break;
			}
		}
		var a1 = this.array.slice(0, i);
		var a2 = this.array.slice(i + 1);
		this.array = a1.concat(a2);
		delete this.hash[id];

		if(id.match(/^spr.+$/)){
			delete this.allsprites[id];
		}
		else{
			var queue = [];
			queue.push(id);
			while(queue.length > 0){
				var gid = queue.pop();
				for(var itemid in PARAM.groups[gid]){
					if(!itemid.match(/^spr.+$/) && !itemid.match(/^grp.+$/)){
						continue;
					}
					if(itemid.match(/^grp.+$/)){
						queue.push(itemid);
					}
					else{
						delete this.allsprites[itemid];
					}
				}
			}
		}

		this.calcRegion();

		return this.array.length;
	}
	return false;
};

PLG.selection.length = function() {
	return this.array.length;
};

PLG.selection.clear = function() {
	this.hash = null;
	this.hash = {};
	this.array = null;
	this.array = [];
	this.current = null;
	this.currentFixed = null;
	this.allsprites = null;
	this.allsprites = {};
	this.region = null;
	this.region = {};
};


// -----------------------------------------------------------------------------------------------
// View

EDT.view = {};
EDT.view.selectionArray = [];
EDT.view.withMenu = false;

EDT.view.propertySprite = null;

EDT.view.rebuildArrowSprites = function(ids) {
	var idArray = ids.split(",");
	var finished = {};
	for(var i = 0;i < idArray.length; i++){
		var id = idArray[i];
		if(id.match(/^grp+$/)){
			for(var id2 in PARAM.groups[id]){
				if(!id.match(/^spr.+$/) && !id.match(/^grp.+$/)){
					continue;
				}
				idArray.push(id2);
			}
		}
		else{
			if(!PARAM.sprites[id]){
				return;
			}
			if(PARAM.sprites[id].inlink){
				for(var inid in PARAM.sprites[id].inlink){
					if(!inid.match(/^spr.+$/)){
						continue;
					}
					if(!finished[inid + ":" + id] && PARAM.sprites[id].inlink[inid] == 1){
						PLG.drawArrowSprite(inid, id);
						finished[inid + ":" + id] = 1;
					}
				}
			}
			if(PARAM.sprites[id].outlink){
				for(var outid in PARAM.sprites[id].outlink){
					if(!outid.match(/^spr.+$/)){
						continue;
					}
					if(!finished[id + ":" + outid] && PARAM.sprites[id].outlink[outid] == 1){
						PLG.drawArrowSprite(id, outid);
						finished[id + ":" + outid] = 1;
					}
				}
			}
		}
	}
	finished = null;
};

EDT.view.isPropertyDirty = false;
EDT.view.setPropertyDirty = function(dirty){
	if(EDT.currenttool == EDT.TOOL_DRAWING){
		return;
	}

	if(EDT.view.isPropertyVisible){
		if(dirty){
			if(EDT.editor.mode == EDT.EDITOR_CLOSE){
				$("revertpropertybtn").style.display = "block";
			}
			EDT.view.isPropertyDirty = true;
		}
		else{
			$("revertpropertybtn").style.display = "none";
			EDT.view.isPropertyDirty = false;
		}
	}
};

EDT.view.addConnector = function(srcdst, direction, left, top){
	var connector = PLG.createElm("div", "connector-" + srcdst + "-" + direction, "connector");
	connector.style.left =  left + "px";
	connector.style.top = top + "px";
	connector.onmousedown = function(){
		PLG.ignoreMouseDown = true;
		if(srcdst == "src"){
			EDT.reConnectArrow(direction, "");
		}
		else{
			EDT.reConnectArrow("", direction);
		}
	};
	$("spriteslist").appendChild(connector);
}

EDT.view.removeConnector = function(srcdst, direction){
	$("spriteslist").removeChild($("connector-" + srcdst + "-" + direction));
}

EDT.view.isConnectorVisible = false;
EDT.view.toggleConnector = function(visible){
	if(visible && !EDT.view.isConnectorVisible){
		if(PLG.selection.currentFixed !== null){
			var idobj = EDT.getArrowSrcDstFromSpriteID(PLG.selection.currentFixed.id);
			if(idobj !== null){
				var srcid = idobj.src;
				var dstid = idobj.dst;

				var srcContentsHeight = Math.round(PLG.getSpriteContents($(srcid)).offsetHeight);
				var srcHeight = Math.round(PARAM.sprites[srcid].height * PLG.zoom);
				var srcWidth = Math.round(PARAM.sprites[srcid].width * PLG.zoom);
				var srcX = PLG.sprLeft($(srcid));
				var srcY = PLG.sprTop($(srcid));

				var dstContentsHeight = Math.round(PLG.getSpriteContents($(dstid)).offsetHeight);
				var dstHeight = Math.round(PARAM.sprites[dstid].height * PLG.zoom);
				var dstWidth = Math.round(PARAM.sprites[dstid].width * PLG.zoom);
				var dstX = PLG.sprLeft($(dstid));
				var dstY = PLG.sprTop($(dstid));

				EDT.view.addConnector("src", "Top", srcX + srcWidth / 2 - 8, srcY - 8);
				EDT.view.addConnector("src", "Right", srcX + srcWidth - 8, srcY + srcContentsHeight / 2 - 8);
				EDT.view.addConnector("src", "Bottom", srcX + srcWidth / 2 - 8, srcY + srcHeight - 8);
				EDT.view.addConnector("src", "Left", srcX - 8, srcY + srcContentsHeight / 2 - 8);
				EDT.view.addConnector("dst", "Top", dstX + dstWidth / 2 - 8, dstY - 8);
				EDT.view.addConnector("dst", "Right", dstX + dstWidth - 8, dstY + dstContentsHeight / 2 - 8);
				EDT.view.addConnector("dst", "Bottom", dstX + dstWidth / 2 - 8, dstY + dstHeight - 8);
				EDT.view.addConnector("dst", "Left", dstX - 8, dstY + dstContentsHeight / 2 - 8);

			}
		}
		EDT.view.isConnectorVisible = true;
	}
	else if(!visible){
		EDT.view.isConnectorVisible = false;

		EDT.view.removeConnector("src", "Top");
		EDT.view.removeConnector("src", "Right");
		EDT.view.removeConnector("src", "Bottom");
		EDT.view.removeConnector("src", "Left");
		EDT.view.removeConnector("dst", "Top");
		EDT.view.removeConnector("dst", "Right");
		EDT.view.removeConnector("dst", "Bottom");
		EDT.view.removeConnector("dst", "Left");
	}
}

EDT.view.saveTags = function(){
	if(EDT.editor.mode == EDT.EDITOR_CLOSE){
		PLG.selection.clear();
		PLG.state = PLG.STATES.WORKING;
		EDT.view.redraw();
	}
}

EDT.view.isPropertyVisible = false;
EDT.view.toggleProperty = function(visible){
	if(visible){
		if(!EDT.view.isPropertyVisible){
			$("spriteproperty0").style.display = "block";
			$("spriteproperty1").style.display = "block";
			$("spriteproperty2").style.display = "block";
			$("spriteproperty3").style.display = "block";
			$("spriteproperty4").style.display = "block";
			$("spriteproperty5").style.display = "block";
			$("spriteproperty6").style.display = "block";
			$("spriteproperty7").style.display = "block";
			$("spriteproperty8").style.display = "block";
			$("spriteproperty9").style.display = "block";

			$("controlpanel_bar3").style.borderTop = "1px solid #BFBCAE";
			$("controlpanel_bar4").style.borderTop = "1px solid #BFBCAE";
		}
		EDT.view.isPropertyVisible = true;
	}
	else{
		if(EDT.view.isPropertyVisible){
			$("spriteproperty0").style.display = "none";
			$("spriteproperty1").style.display = "none";
			$("spriteproperty2").style.display = "none";
			$("spriteproperty3").style.display = "none";
			$("spriteproperty4").style.display = "none";
			$("spriteproperty5").style.display = "none";
			$("spriteproperty6").style.display = "none";
			$("spriteproperty7").style.display = "none";
			$("spriteproperty8").style.display = "none";
			$("spriteproperty9").style.display = "none";

			$("controlpanel_bar3").style.borderTop = "0px none #000000";
			$("controlpanel_bar4").style.borderTop = "0px none #000000";
		}
		EDT.view.isPropertyVisible = false;

		EDT.colorpicker.close();
		EDT.plugin.close();
		EDT.uploader.close();
		EDT.drawingtool.close();

		PLG.focusedField = "";
	}
};

EDT.view.togglePlugin = function(visible){
	if(visible){
		if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_SUPER){
			$("pluginbtn").style.display = "block";
			$("cp_pluginname").style.display = "block";

			var pluginName = "";
			var pluginStr = PARAM.sprites[PLG.selection.currentFixed.id].plugin;
			if(pluginStr !== undefined && pluginStr !== ""){
				var pluginArray = pluginStr.split(",");
				pluginName = pluginArray[0];
			}
			$("cp_pluginname").innerHTML = pluginName;
		}
	}
	else{
		$("pluginbtn").style.display = "none";
		$("cp_pluginname").style.display = "none";
	}
};

EDT.view.toggleFileUpload = function(visible) {
	if(visible){
		if((EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR || EDT.currentEditorType == PLG.CONST.WIKI_EDITOR) &&  PARAM.permissionLevel >= PLG.CONST.USERLEVEL_ATTACH_FILE){
			$("uploaderbtn").style.display = "block";
			$("uploadedfilename").style.display = "block";

			// Set attched file
			if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
				var imgwidth = 0;
				var imgheight = 0;
				var filesize = 0;
				var attachedfilename = "";
				var attachedTestHtml = PARAM.sprites[PLG.selection.currentFixed.id].innerHTML;
				if(attachedTestHtml.match(/<img.*?src=[\"\'](.+?)[\"\'].*?>/i)){
					attachedfilename = RegExp.$1;
					var pathArray = attachedfilename.split("/");
					attachedfilename = pathArray[pathArray.length - 1];

					if(attachedTestHtml.match(/<img.*?alt=[\"\']?.+?\((.+?)x(.+?)\)[\"\']?.*?>/i)){
						imgwidth = RegExp.$1;
						imgheight = RegExp.$2;
					}
				}

				if(attachedTestHtml.match(/<a.*?class=.?attachedfile.*?>/i)){
					if(attachedTestHtml.match(/<a.*?href=[\"\'](.+?)[\"\'].*?>/i)){
						attachedfilename = RegExp.$1;
						var pathArray = attachedfilename.split("/");
						attachedfilename = pathArray[pathArray.length - 1];
					}

					if(attachedTestHtml.match(/<a.*?title=[\"\']?.+?\((.+?)\)[\"\']?.*?>/i)){
						filesize = RegExp.$1;
					}
				}

				if(attachedfilename !== ""){
					$("fileclearbtn").style.display = "block";
				}

				if(imgwidth !== 0){
					$("uploadedfilename").innerHTML = attachedfilename + "(" + imgwidth + "x" + imgheight + ")";
				}
				else if(filesize !== 0){
					$("uploadedfilename").innerHTML = attachedfilename + "(" + filesize + ")";
				}
			}
		}
	}
	else{
		$("uploaderbtn").style.display = "none";
		$("fileclearbtn").style.display = "none";
		$("uploadedfilename").style.display = "none";
	}
};

EDT.view.refreshMap = function() {
	PLG.leftSprID = "";
	PLG.rightSprID = "";
	PLG.topSprID = "";
	PLG.bottomSprID = "";

	PLG.rebuildWorldEdges();

	PLG.initSmallMap();
	PLG.redrawMapCanvas();
	PLG.redrawViewCanvas();
};

EDT.view.setLinkProperty = function(){
	$("controlpanel_bar3").style.display = "block";

	$("propertylabel").innerHTML = MESSAGE.PROPERTYLABEL_ARROW;
	$("propertylabel").style.display = "block";
	$("textcolorbtn").style.display = "none";
	$("bgcolorbtn").style.display = "none";
	$("linecolorbtn").style.display = "block";
	$("drawcolorbtn").style.display = "none";
	$("propertystylelabel").style.display = "block";
	$("propertystylelabel").innerHTML = MESSAGE.PROPERTYSTYLELABEL;
	$("styleselector").style.display = "none";
	$("propertywidthlabel").style.display = "block";
	$("propertywidthlabel").innerHTML = MESSAGE.PROPERTYWIDTHLABEL;
	$("widthselector").style.display = "none";

	$("linewidthselector").style.display = "block";
	$("linestyleselector").style.display = "block";

	PARAM.sprites[PLG.selection.currentFixed.id].innerHTML.match(/draw\('shape,arrow,(.+?),(.+?),(.+?),(.+?),(.+?),(.+?),(.+?)'\)/);
	var lineWidth = RegExp.$4;
	var lineStyle = RegExp.$5;
	
	if(EDT.view.propertySprite != PLG.selection.currentFixed){
		$("linewidthselector").selectedIndex = EDT.lineWidthIndex[lineWidth + "px"];
		$("linestyleselector").selectedIndex = EDT.lineStyleIndex[lineStyle];
	}

	$("propertypaddinglabel").style.display = "none";
	$("paddingselector").style.display = "none";

	$("taglabel").style.display = "block";
	$("tagarea").style.display = "block";

	$("showauthor").style.display = "none";
	$("showtime").style.display = "none";
	$("showuri").style.display = "none";

	$("showtag").style.display = "block";
	var tag = PARAM.sprites[PLG.selection.currentFixed.id].tag;
	if(tag !== undefined && tag !== null && tag !== ""){
		tag = tag.replace(/&lt;/g, "<");
		tag = tag.replace(/&gt;/g, ">");
		if(EDT.view.propertySprite != PLG.selection.currentFixed){
			tag = tag.replace(/,/g, ", ");
			$("tagfield").value = tag;
		}
	}

	EDT.view.toggleFileUpload(false);
	EDT.view.togglePlugin(false);

	EDT.view.toggleConnector(true);
};

EDT.view.setSpriteProperty = function(){
	$("controlpanel_bar3").style.display = "block";

	if(PARAM.sprites[PLG.selection.currentFixed.id].isDrawing){
		$("propertylabel").innerHTML = MESSAGE.PROPERTYLABEL_DRAWING;
		$("textcolorbtn").style.display = "none";
	}
	else{
		$("propertylabel").innerHTML = MESSAGE.PROPERTYLABEL_NORMAL;
		$("textcolorbtn").style.display = "block";
	}

	$("propertylabel").style.display = "block";

	$("bgcolorbtn").style.display = "block";
	$("linecolorbtn").style.display = "block";
	$("drawcolorbtn").style.display = "none";
	$("propertystylelabel").style.display = "block";
	$("propertystylelabel").innerHTML = MESSAGE.PROPERTYSTYLELABEL;
	$("styleselector").style.display = "block";
	$("propertywidthlabel").style.display = "block";
	$("propertywidthlabel").innerHTML = MESSAGE.PROPERTYWIDTHLABEL;
	$("widthselector").style.display = "block";
	$("linewidthselector").style.display = "none";
	$("linestyleselector").style.display = "none";

	$("propertypaddinglabel").style.display = "block";
	$("propertypaddinglabel").innerHTML = MESSAGE.PROPERTYPADDINGLABEL;
	$("paddingselector").style.display = "block";

	$("taglabel").style.display = "block";
	$("tagarea").style.display = "block";

	if(EDT.view.propertySprite != PLG.selection.currentFixed){
		$("styleselector").selectedIndex = EDT.borderStyleIndex[PARAM.sprites[PLG.selection.currentFixed.id].borderStyle];
		$("widthselector").selectedIndex = EDT.borderWidthIndex[PARAM.sprites[PLG.selection.currentFixed.id].borderWidth + "px"];
		$("paddingselector").selectedIndex = EDT.paddingIndex[PARAM.sprites[PLG.selection.currentFixed.id].padding + "px"];
	}

	$("showauthor").style.display = "block";
	$("showtime").style.display = "block";
	$("showuri").style.display = "block";
	$("showtag").style.display = "block";

	if(EDT.editor.mode != EDT.EDITOR_CLOSE){
		EDT.view.toggleFileUpload(true);
	}
	else{
		EDT.view.toggleFileUpload(false);
	}
	EDT.view.togglePlugin(true)

};

EDT.view.setInfoProperty = function(){
	// Set time
	var time = new String(PARAM.sprites[PLG.selection.currentFixed.id].created_time);
//	$("propertytime").innerHTML = "time";
//	$("propertytime").title = time.substring(0, 4) + "/" + time.substring(4, 6) + "/" + time.substring(6, 8) + " " + time.substring(8, 10) + ":" + time.substring(10, 12) + ":" + time.substring(12, 14);
	var timeValue = time.substring(0, 4) + "/" + time.substring(4, 6) + "/" + time.substring(6, 8) + " " + time.substring(8, 10) + ":" + time.substring(10, 12) + ":" + time.substring(12, 14);
	// This is ad-hoc i18n. It will be improved in version 0.61.
	if(PARAM.language == "en"){
		timeValue = time.substring(4, 6) + "/" + time.substring(6, 8) + "/" + time.substring(0, 4) + " " + time.substring(8, 10) + ":" + time.substring(10, 12) + ":" + time.substring(12, 14);
	}
	$("propertytime").innerHTML = timeValue;


	if(PARAM.sprites[PLG.selection.currentFixed.id].display.created_time){
		$("showtime").checked = true;
	}
	else{
		$("showtime").checked = false;
	}

	// Set author and password
	var authorName = PARAM.sprites[PLG.selection.currentFixed.id].author;
	$("propertyauthor").innerHTML = authorName;

	if(authorName.match(/^&lt;(.+)&gt;$/)){
		$("propertyauthor").innerHTML = RegExp.$1 + "&nbsp;(pass-locked)"
		if(PARAM.author == "public" || PARAM.author == "admin"){
			$("cp_unlockpass").style.display = "block";
		}
	}
	else if(authorName.match(/^\[(.+)\]$/)){
		$("propertyauthor").innerHTML = RegExp.$1 + "&nbsp;(no password)";
		$("cp_unlockpass").style.display = "none";
	}
	else{
		$("cp_unlockpass").style.display = "none";
	}

	if(PARAM.sprites[PLG.selection.currentFixed.id].display.author){
		$("showauthor").checked = true;
	}
	else{
		$("showauthor").checked = false;
	}

	if(PARAM.sprites[PLG.selection.currentFixed.id].display.tag){
		$("showtag").checked = true;
	}
	else{
		$("showtag").checked = false;
	}

	var tag = PARAM.sprites[PLG.selection.currentFixed.id].tag;
	if(tag !== undefined && tag !== null && tag !== ""){
		tag = tag.replace(/&lt;/g, "<");
		tag = tag.replace(/&gt;/g, ">");
		if(EDT.view.propertySprite != PLG.selection.currentFixed){
			tag = tag.replace(/,/g, ", ");
			$("tagfield").value = tag;
		}
	}


	// Set uri
//	var urlArray = location.href.split("?");
//	var newURL = urlArray[0] + "?" + "load=" + PARAM.pageid + "#id_" + PLG.selection.currentFixed.id;
	var newURL = "./positlog.cgi?load=" + PARAM.pageid + "#id_" + PLG.selection.currentFixed.id;
	if(PARAM.mod_rewrite == 1){
		newURL = "./" + PARAM.pageid + ".html#id_" + PLG.selection.currentFixed.id;
	}
	$("propertyuri").innerHTML = "<a href='" + newURL + "'>link</a> ";

	if(PARAM.sprites[PLG.selection.currentFixed.id].display.uri){
		$("showuri").checked = true;
	}
	else{
		$("showuri").checked = false;
	}
};

EDT.view.setSpriteMenu = function(e){
	if(PLG.state == PLG.STATES.SCALING){
		// nop
	}
	if(PLG.selection.currentFixed !== null && PLG.selection.currentFixed.id.match(/_link$/)){
		// nop
	}
	else if(PLG.state == PLG.STATES.FIXED || PLG.state == PLG.STATES.FIXEDSELECTED){
		if(PLG.selection.currentFixed !== null && PARAM.sprites[PLG.selection.currentFixed.id] !== undefined){
			this.withMenu = true;
			var width = EDT.getMenuWidth();
			$("spritemenu").style.width = width + "px";


			if(PARAM.sprites[PLG.selection.currentFixed.id].template !== undefined && PARAM.sprites[PLG.selection.currentFixed.id].template == 1){
				$("sprite-editor").style.display = "none";
				$("sprite-comment").style.display = "block";

				$("sprite-mover").style.left = 22 + "px";
				$("sprite-mover").style.width = (width - 46) + "px";
			}
			else if(PARAM.sprites[PLG.selection.currentFixed.id].isDrawing){
				var scalerElm = $("sprite-scaler");
				scalerElm.style.left = (PLG.sprLeft(PLG.selection.currentFixed) + PLG.sprWidth(PLG.selection.currentFixed) - 18) + "px";
				scalerElm.style.top = (PLG.sprTop(PLG.selection.currentFixed) + PLG.sprHeight(PLG.selection.currentFixed) - 18) + "px";
				scalerElm.style.display = "block";

				$("sprite-editor").style.display = "none";
				$("sprite-comment").style.display = "block";

				$("sprite-mover").style.left = 22 + "px";
				$("sprite-mover").style.width = (width - 46) + "px";
			}
			else{
				var scalerElm = $("sprite-scaler");
				scalerElm.style.left = (PLG.sprLeft(PLG.selection.currentFixed) + PLG.sprWidth(PLG.selection.currentFixed) - 18) + "px";
				scalerElm.style.top = (PLG.sprTop(PLG.selection.currentFixed) + PLG.sprHeight(PLG.selection.currentFixed) - 18) + "px";
				scalerElm.style.display = "block";

				$("sprite-editor").style.display = "block";
				$("sprite-comment").style.display = "block";
				$("sprite-mover").style.left = 46 + "px";
				$("sprite-mover").style.width = (width - 70) + "px";
			}

			var menu = $("spritemenu");
			var x = PLG.sprLeft(PLG.selection.currentFixed);
			var y = PLG.sprTop(PLG.selection.currentFixed) - 20;
			menu.style.left = x + "px";
			menu.style.top = y + "px";

			if(PLG.selection.isMultiFixed() > 1){
				menu.style.backgroundColor = EDT.COLOR_FIXEDMULTISPRITES;
				$("sprite-comment").style.display = "none";
				$("sprite-editor").style.display = "none";

				$("sprite-mover").style.left = "0px";
				$("sprite-mover").style.width = width + "px";
			}
			else if(EDT.getCtrlKey(e)){
				menu.style.backgroundColor = EDT.COLOR_FIXEDMULTISPRITES;
			}
			else{
				menu.style.backgroundColor = EDT.COLOR_FIXEDSPRITE;
			}
			menu.style.display = "block";
		}
		else{
			$("spritemenu").style.display = "none";
			EDT.submenu.close();
			$("sprite-scaler").style.display = "none";
			this.withMenu = false;
		}
	}
	else if(this.withMenu){
		$("spritemenu").style.display = "none";
		EDT.submenu.close();
		$("sprite-scaler").style.display = "none";
		this.withMenu = false;
	}
};

EDT.view.setDrawingToolProperty = function(){
	$("propertylabel").innerHTML = MESSAGE.PROPERTYLABEL_DRAWING;

	$("controlpanel_bar3").style.display = "none";

	$("textcolorbtn").style.display = "none";
	$("bgcolorbtn").style.display = "none";
	$("linecolorbtn").style.display = "none";
	$("drawcolorbtn").style.display = "block";
	$("styleselector").style.display = "none";
	$("widthselector").style.display = "none";

	$("propertywidthlabel").style.display = "none";
	$("linewidthselector").style.display = "none";

	$("propertystylelabel").style.display = "none";
	$("linestyleselector").style.display = "none";

	$("propertypaddinglabel").style.display = "none";
	$("paddingselector").style.display = "none";

	$("cp_unlockpass").style.display = "none";

	$("taglabel").style.display = "none";
	$("tagarea").style.display = "none";

	$("showauthor").style.display = "none";
	$("showtime").style.display = "none";
	$("showuri").style.display = "none";
	$("showtag").style.display = "none";
};

EDT.view.redraw = function(e, clearHistory) {
	if(!clearHistory){
		// Clear frames
		for(var i = 0;i < this.selectionArray.length; i++){
			var regionElm = PLG.getSpriteRegion($(this.selectionArray[i]));
			regionElm.style.border = "0px none black";
			regionElm.style.padding = "1px";
		}
	}
	this.selectionArray = null;
	this.selectionArray = [];

	// Draw frame of selected sprites
	if(PLG.state != PLG.STATES.MOVING && PLG.state != PLG.STATES.MOVINGSELECTED){
		for(var id in PLG.selection.allsprites){
			if(!id.match(/^spr.+$/)){
				continue;
			}
			this.selectionArray.push(id);
			var regionElm = PLG.getSpriteRegion($(id));
			if(PLG.selection.allsprites[id].fixed){
				if(EDT.getCtrlKey(e) || (PLG.selection.isMultiFixed() > 1 && PLG.selection.allsprites[id].fixed)){
					regionElm.style.border = "1px solid " + EDT.COLOR_FIXEDMULTISPRITES;
				}
				else{
					regionElm.style.border = "1px solid " + EDT.COLOR_FIXEDSPRITE;
				}
				regionElm.style.padding = "0px";
			}
			else{
				if(EDT.getCtrlKey(e) || (PLG.selection.isMultiFixed() > 1 && PLG.selection.allsprites[id].fixed)){
					regionElm.style.border = "1px dashed " + EDT.COLOR_FIXEDMULTISPRITES;
				}
				else{
					regionElm.style.border = "1px dashed " + EDT.COLOR_SELECTEDSPRITE;
				}
				regionElm.style.padding = "0px";
			}
		}
	}


	$("cp_publicauthor").style.display = "block";
	$("cp_publicpass").style.display = "block";

	if(PLG.selection.currentFixed === null){
		if(EDT.view.isConnectorVisible){
			EDT.view.toggleConnector(false);
		}
	}

	// Show sprite property
	if(PLG.selection.currentFixed !== null && PARAM.sprites[PLG.selection.currentFixed.id] !== undefined 
		 && PARAM.sprites[PLG.selection.currentFixed.id].template !== undefined && PARAM.sprites[PLG.selection.currentFixed.id].template == 1){
		// nop
	}
	else if(EDT.editor.mode == EDT.EDITOR_OPEN || (PLG.selection.currentFixed !== null && !EDT.isDefaultSprite(PLG.selection.currentFixed))){
		if(EDT.view.propertySprite === null || (EDT.view.propertySprite != PLG.selection.currentFixed)){
			if(EDT.editor.mode == EDT.EDITOR_CLOSE && EDT.view.isPropertyDirty){
				if(EDT.view.propertySprite.id.match(/_link$/)){
					EDT.saveFromEditor(EDT.view.propertySprite, EDT.SAVE_PROPERTY, true);
				}
				else{
					EDT.saveFromEditor(EDT.view.propertySprite, EDT.SAVE_PROPERTY, false);
				}
			}
			EDT.view.revertProperty();
			EDT.view.setPropertyDirty(false);
		}

		if(PLG.selection.currentFixed.id.match(/_link$/)){
			EDT.view.setLinkProperty();
		}
		else{
			EDT.view.setSpriteProperty();
		}
		EDT.view.setInfoProperty();

		EDT.view.toggleProperty(true);

		EDT.view.propertySprite = PLG.selection.currentFixed;
	}
	else if(EDT.currenttool == EDT.TOOL_DRAWING){
		if(EDT.editor.mode == EDT.EDITOR_CLOSE && EDT.view.isPropertyDirty){
			if(EDT.view.propertySprite.id.match(/_link$/)){
				EDT.saveFromEditor(EDT.view.propertySprite, EDT.SAVE_PROPERTY, true);
			}
			else{
				EDT.saveFromEditor(EDT.view.propertySprite, EDT.SAVE_PROPERTY, false);
			}
		}

		EDT.view.setDrawingToolProperty();

		EDT.view.revertProperty();
		EDT.view.setPropertyDirty(false);
		EDT.view.toggleProperty(true);
		EDT.view.propertySprite = null;
	}
	else{
		if(EDT.editor.mode == EDT.EDITOR_CLOSE && EDT.view.isPropertyDirty){
			if(EDT.view.propertySprite.id.match(/_link$/)){
				EDT.saveFromEditor(EDT.view.propertySprite, EDT.SAVE_PROPERTY, true);
			}
			else{
				EDT.saveFromEditor(EDT.view.propertySprite, EDT.SAVE_PROPERTY, false);
			}
		}
		EDT.view.revertProperty();
		EDT.view.setPropertyDirty(false);
		EDT.view.toggleProperty(false);
		EDT.view.propertySprite = null;
	}


	// Menu
	EDT.view.setSpriteMenu(e);


	// Opacity
	if(PLG.state == PLG.STATES.MOVING || PLG.state == PLG.STATES.MOVINGSELECTED){
		for(var id in PLG.selection.allsprites){
			if(!id.match(/^spr.+$/)){
				continue;
			}
			if(PLG.selection.isFixed(id)){
				if(PLG.browser.msie || PLG.browser.msie7){
					$(id).style.filter = "alpha(opacity=50)";
				}
				else{
					$(id).style.opacity = 0.5;
				}
			}
		}
	}

	// Sibling margins
	if(parseInt(PARAM.publish) == 1){
		EDT.clearCanvas();
		if(!PLG.zooming){
			if(PLG.selection.currentFixed !== null){
				var root = EDT.getRootID(PLG.selection.currentFixed.id);
				EDT.drawSiblingMargin(root);
				EDT.drawSiblingMargin(PLG.selection.currentFixed.id);
			}
		}
	}

	$("homebtn").style.top = $("controlpanel").offsetHeight + "px";
};


EDT.view.revertProperty = function() {
	if(EDT.view.propertySprite && EDT.view.isPropertyVisible && EDT.view.isPropertyDirty){
		if(PLG.selection.isFixed(EDT.view.propertySprite.id)){
			if(EDT.view.propertySprite.id.match(/_link$/)){
				EDT.revertSprite(new Array(EDT.view.propertySprite.id), true);
			}
			else{
				EDT.revertSprite(new Array(EDT.view.propertySprite.id), false);
			}
			EDT.view.setPropertyDirty(false);
		}
	}
};


// -----------------------------------------------------------------------------------------------
// Editor dialog

EDT.EDITOR_CLOSE = 0;
EDT.EDITOR_OPEN = 1;

EDT.editor = {};
EDT.editor.mode = EDT.EDITOR_CLOSE;
EDT.editor.canMove = false;
EDT.editor.moveOffsetX = 0;
EDT.editor.moveOffsetY = 0;
EDT.editor.WIDTH = 500;
EDT.editor.height = 0;
EDT.editor.created = false;
EDT.editor.ignoreMove = false;

EDT.editor.create = function(shrinkFlag) {
	EDT.editor.height = Math.round((PLG.getInnerHeight() - $("controlpanel").offsetHeight) / 2);
	var controlPanelHeight = 0;

	var editor = PLG.createElm("form", "editor");

	editor.onsubmit = function() {
		return false;
	};

	// Control panel for editor
	var control1 = PLG.createElm("div", "editor-control");
	control1.onmousedown = function(e) {
		if(!EDT.editor.ignoreMove){
			PLG.disableSelection();
			EDT.editor.moveOffsetX = PLG.mouseXonWorld(e, true) - $("editor").offsetLeft;
			EDT.editor.moveOffsetY = PLG.mouseYonWorld(e, true) - $("editor").offsetTop;
			if($("editorarea")){
				// FCKeditor interferes OnMouseMove.
				$("editorarea").style.visibility = "hidden";
			}
			EDT.editor.canMove = true;
		}
		else{
			EDT.editor.ignoreMove = false;
		}
	}

	// Save btn
	var savebtn = PLG.createElm("div", "editor-savebtn");
	savebtn.style.verticalAlign = "middle";
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		savebtn.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}
	savebtn.onmousedown = function() {
		EDT.saveFromEditor(PLG.selection.currentFixed, EDT.SAVE_FROMEDITOR, true);
	}
	control1.appendChild(savebtn);

	// Close btn
	var closebtn = PLG.createElm("div", "editor-closebtn");
	closebtn.style.verticalAlign = "middle";
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		closebtn.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}
	control1.appendChild(closebtn);
	closebtn.onmousedown = function(){
		EDT.editor.ignoreMove = true;
		EDT.editor.close();
	}

	// Id
	var editorid = PLG.createElm("span", "editor-id");
	editorid.appendChild(document.createTextNode(""));
	editorid.style.width = (EDT.editor.WIDTH - 120).toString() + "px";
	control1.appendChild(editorid);
	editor.appendChild(control1);

	// editor must be under the spriteslist
	// not to display scrollbars when it goes out of the browser
	editor.style.left = "100000px";
	editor.style.top = "100000px";
	$("spriteslist").appendChild(editor);

	// Editor

	if(PARAM.editorType == PLG.CONST.RICH_EDITOR){
		controlPanelHeight = control1.offsetTop + control1.offsetHeight;

		var editorArea = PLG.createElm("div", "editorarea");
		editorArea.style.width = "100%";
		editorArea.style.height = EDT.editor.height + "px";
		editor.appendChild(editorArea);

		var oFCKeditor = new FCKeditor("innereditorarea", "100%", EDT.editor.height);
		oFCKeditor.BasePath = PARAM.SYSTEMPATH + "fckeditor/";
		oFCKeditor.Config["CustomConfigurationsPath"] = EDT.editorConfigPath;

		var serverPath = "/" + PARAM.DATAFILEPATH + PARAM.pageid;
		var virtualPath = PARAM.FCKUPLOADURL + PARAM.pageid;
		if(PARAM.filesecure == 1){
			virtualPath = "./" + PARAM.pageid;
		}
		oFCKeditor.Config["ImageBrowserURL"] = '../filemanager/browser/default/browser.html?Type=Image&Connector=' + PARAM.FCKCONNECTOR + '&ServerPath=' + serverPath + '&VirtualPath=' + virtualPath;
		oFCKeditor.Config["LinkBrowserURL"] = '../filemanager/browser/default/browser.html?Connector=' + PARAM.FCKCONNECTOR + '&ServerPath=' + serverPath + '&VirtualPath=' + virtualPath;
		oFCKeditor.Config["ImageUploadURL"]  = PARAM.FCKUPLOADER + '?Type=Image&ServerPath=' + serverPath + '&VirtualPath=' + virtualPath;
		oFCKeditor.Config["LinkUploadURL"]  = PARAM.FCKUPLOADER + '?ServerPath=' + serverPath + '&VirtualPath=' + virtualPath;

		if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_SUPER){
			oFCKeditor.ToolbarSet = 'PositLogSuper';
		}
		else{
			oFCKeditor.ToolbarSet = 'PositLogDefault';
		}
		oFCKeditor.Value = "";
		editorArea.innerHTML = oFCKeditor.CreateHtml();



		// ControlPanel for editor (2)
		// Instructions
		var control2 = PLG.createElm("div", "editor-control2");
		var captionlabelElm = PLG.createElm("span", "editor-captionlabel");
		captionlabelElm.appendChild(document.createTextNode(""));
		control2.appendChild(captionlabelElm);
		editor.appendChild(control2);

		// Textarea
		var textArea = PLG.createElm("textarea", "editor-textarea");

		// Adjust editor size and location
		textArea.appendChild(document.createTextNode(""));
		textArea.style.width = (parseInt(EDT.editor.WIDTH) - 8) + "px";
		textArea.style.height = EDT.editor.height + "px";

		editor.appendChild(textArea);

		controlPanelHeight = control2.offsetTop + control2.offsetHeight;
		textArea.style.top = controlPanelHeight + "px";

		control2.style.visibility = "hidden";
		textArea.style.visibility = "hidden";
	}
	else if(PARAM.editorType == PLG.CONST.SIMPLE_EDITOR || PARAM.editorType == PLG.CONST.WIKI_EDITOR){
		// ControlPanel for editor (2)
		// Instructions
		var control2 = PLG.createElm("div", "editor-control2");
		var captionlabelElm = PLG.createElm("span", "editor-captionlabel");
		captionlabelElm.appendChild(document.createTextNode(""));
		control2.appendChild(captionlabelElm);
		editor.appendChild(control2);

		// Textarea
		var textArea = PLG.createElm("textarea", "editor-textarea");

		// Adjust editor size and location
		textArea.appendChild(document.createTextNode(""));
		textArea.style.width = (parseInt(EDT.editor.WIDTH) - 8) + "px";
		textArea.style.height = EDT.editor.height + "px";

		editor.appendChild(textArea);

		controlPanelHeight = control2.offsetTop + control2.offsetHeight;
		textArea.style.top = controlPanelHeight + "px";
	}

	if(shrinkFlag){
		EDT.editor.shrink();
	}

	EDT.editor.created = true;
};

EDT.focusEditor = function() {
	var oEditor = FCKeditorAPI.GetInstance("innereditorarea");
	oEditor.Focus();
};

EDT.editor.ready = false;
if(EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR || EDT.currentEditorType == PLG.CONST.WIKI_EDITOR){
	EDT.editor.ready = true;
}

EDT.editor.readyTimer = null;

EDT.editor.fck = null;
function FCKeditor_OnComplete(editorInstance) {
	EDT.editor.ready = true;
	editorInstance.Events.AttachEvent('OnAfterSetHTML', EDT.focusEditor);
	EDT.editor.fck = FCKeditorAPI.GetInstance("innereditorarea");
};


EDT.editor.isNewSprite = false;
EDT.editor.open = function() {
	if(this.mode != EDT.EDITOR_CLOSE){
		return;
	}
	
	// Target sprite and its id
	var eSpr = PLG.selection.currentFixed;
	var eSid = PLG.selection.currentFixed.id;

	if(!EDT.editor.created){
		EDT.editor.create(false);
	}

	// Safari2 ignores i option.
	// Use capital tag name here.
	if(PARAM.sprites[eSid].innerHTML.match(/<IFRAME/i)
		 || PARAM.sprites[eSid].innerHTML.match(/<APPLET/i)){
		if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR){
 			EDT.currentEditorType = PLG.CONST.SIMPLE_EDITOR;
		}
	}
	else{
		if(EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR && PARAM.editorType == PLG.CONST.RICH_EDITOR){
			EDT.currentEditorType = PLG.CONST.RICH_EDITOR;
		}
	}

	PLG.state = PLG.STATES.EDITING; // Stop select action

	if(!EDT.editor.ready){
		EDT.editor.readyTimer = setTimeout("EDT.editor.open()", 1000);
		return;
	}

	this.mode = EDT.EDITOR_OPEN;

	PLG.enableSelection();

	EDT.view.setPropertyDirty(false);


	// Check innerHTML
	if(PARAM.sprites[eSid].isDrawing){
		PARAM.sprites[eSid].innerHTML = EDT.getValidInnerHtmlForDrawing(PARAM.sprites[eSid].innerHTML);
	}

	// Change styles of new sprite

	if(EDT.editor.isNewSprite || EDT.isDefaultSprite(eSpr)){
		// Load user profile
		var profUserName = PARAM.author;
		profUserName = encodeURIComponent(profUserName);
		var userProfCookie = PLG.getCookie("prof_" + profUserName);
		var userProf = {};
		if(userProfCookie !== undefined){
			var profArray = userProfCookie.split(",");
			for(var i = 0;i < profArray.length; i++){
				var myProf = profArray[i];
				var myProfArray = myProf.split(":");
				var key = myProfArray[0];
				var value = myProfArray[1];
				// keys : "borderColor", "borderStyle", "borderWidth",
				// "padding", "bgColor", "fgColor", "showTime", "showAuthor", 
				// "showUri", "showTag"
				userProf[key] = value;
			}
		}

		if(userProf["showAuthor"]){
			if(userProf["showAuthor"] == "true"){
				PARAM.sprites[eSid].display.author = 1;
			}
			else{
				PARAM.sprites[eSid].display.author = 0;
			}
		}

		if(userProf["showTime"]){
			if(userProf["showTime"] == "true"){
				PARAM.sprites[eSid].display.created_time = 1;
			}
			else{
				PARAM.sprites[eSid].display.created_time = 0;
			}
		}
		if(userProf["showUri"]){
			if(userProf["showUri"] == "true"){
				PARAM.sprites[eSid].display.uri = 1;
			}
			else{
				PARAM.sprites[eSid].display.uri = 0;
			}
		}
		if(userProf["showTag"]){
			if(userProf["showTag"] == "true"){
				PARAM.sprites[eSid].display.tag = 1;
			}
			else{
				PARAM.sprites[eSid].display.tag = 0;
			}
		}
		EDT.setSpriteInfo(eSpr);

		var cElm = PLG.getSpriteContents(eSpr);
		if(userProf["borderColor"]){
			var color = decodeURIComponent(userProf["borderColor"]);
			cElm.style.borderColor = color;
			PARAM.sprites[eSid].borderColor = color;
		}
		else{
			cElm.style.borderColor = "#000000";
			PARAM.sprites[eSid].borderColor = "#000000";
		}

		if(userProf["bgColor"]){
			var color = decodeURIComponent(userProf["bgColor"]);
			cElm.style.backgroundColor = color;
			PARAM.sprites[eSid].bgColor = color;
		}
		else{
			cElm.style.backgroundColor = "";
			PARAM.sprites[eSid].bgColor = "";
		}

		if(userProf["fgColor"]){
			var color = decodeURIComponent(userProf["fgColor"]);
			cElm.style.color = color;
			PARAM.sprites[eSid].color = color;
		}
		else{
			cElm.style.color = "#000000";
			PARAM.sprites[eSid].color = "#000000";
		}

		if(userProf["borderStyle"]){
			cElm.style.borderStyle = userProf["borderStyle"];
			PARAM.sprites[eSid].borderStyle = userProf["borderStyle"];
		}
		else{
			cElm.style.borderStyle = "none";
			PARAM.sprites[eSid].borderStyle = "none";
		}

		if(userProf["borderWidth"]){
			// For regacy ...
			var bw = parseInt(userProf["borderWidth"].replace(/px/g, ""));
			cElm.style.borderWidth = bw + "px";
			PARAM.sprites[eSid].borderWidth = bw;
		}
		else{
			cElm.style.borderWidth = "0px";
			PARAM.sprites[eSid].borderWidth = 0;
		}

		if(userProf["padding"]){
			var pa = parseInt(userProf["padding"].replace(/px/g, ""));
//			cElm.style.padding = pa + "px";
			PLG.setContentsPadding(cElm, pa);
			PARAM.sprites[eSid].padding = pa;
		}
		else{
//			cElm.style.padding = "0px";
			PLG.setContentsPadding(cElm, 0);
			PARAM.sprites[eSid].padding = 0;
		}

	}
	var e;
	EDT.view.redraw(e, false);

	var controlPanelHeight = 0;

	// Set id
	$("editor-id").innerHTML = eSid;

//	if(EDT.editor.shrinked){
	EDT.editor.expand();
//	}
	if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR){
		controlPanelHeight = $("editor-control").offsetTop + $("editor-control").offsetHeight;
	}
	else if(EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR || EDT.currentEditorType == PLG.CONST.WIKI_EDITOR){
		controlPanelHeight = $("editor-control2").offsetTop + $("editor-control2").offsetHeight;
	}



	var editor = $("editor");
	editor.style.width = EDT.editor.WIDTH + "px";
	editor.style.height = (EDT.editor.height + controlPanelHeight + 5) + "px";

	// Set dialog
	var editorTop = 0;
	if(PLG.sprTop(eSpr) > PLG.browserYtoWorldY(PLG.getInnerHeight() / 2, true)){
		editorTop = PLG.sprTop(PLG.selection.currentFixed) - editor.offsetHeight;
	}
	else{
		editorTop = PLG.sprTop(PLG.selection.currentFixed) + PLG.sprHeight(PLG.selection.currentFixed);
	}
	if(editorTop + editor.offsetHeight > PLG.browserYtoWorldY(PLG.getInnerHeight(), true)){
		editorTop = PLG.browserYtoWorldY(PLG.getInnerHeight(), true) - editor.offsetHeight;
	}
	if(editorTop < PLG.browserYtoWorldY($("controlpanel").offsetHeight + 30, true)){
		editorTop = PLG.browserYtoWorldY($("controlpanel").offsetHeight, true) + 30;
	}
	var editorLeft = PLG.sprLeft(eSpr) + 30;
	if(editorLeft < PLG.browserXtoWorldX(0, true)){
		editorLeft = PLG.browserXtoWorldX(0, true);
	}
	if(editorLeft + EDT.editor.WIDTH > PLG.browserXtoWorldX($("controlpanel").offsetWidth, true) - 5){
		editorLeft = PLG.browserXtoWorldX($("controlpanel").offsetWidth, true) - EDT.editor.WIDTH - 5;
	}

	editor.style.left = editorLeft + "px";
	editor.style.top = editorTop + "px";




	// Set editor
	if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR){
		var innerHTML = "";
		if(PLG.browser.safari){
			innerHTML = " "; // This is adhoc bug fix for FCKeditor's bug.
		}
		if(EDT.editor.isNewSprite || EDT.isDefaultSprite(eSpr)){
			// nop
		}
		else{
			innerHTML = PARAM.sprites[eSid].innerHTML;
		}
		// SetData is unstable in WYSIWYG mode on IEs
		if(PLG.browser.msie || PLG.browser.msie7){
			EDT.editor.fck.SwitchEditMode();
			EDT.editor.fck.SetData(innerHTML);
			EDT.editor.fck.SwitchEditMode();
		}
		else{
			EDT.editor.fck.SetData(innerHTML);
		}
	}
	else if(EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR){
		var captionStr = "";
		if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_SUPER){
			captionStr = MESSAGE.EDITOR_INPUTHTML;
		}
		else{
			captionStr = MESSAGE.EDITOR_INPUTTEXT;
		}

		if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_SUPER){
			captionStr += MESSAGE.EDITOR_SCRIPTAVAILABLE;
		}
		if(parseInt(PARAM.sprite_autolink) == 1 && PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
			captionStr += MESSAGE.EDITOR_AUTOLINK;
		}
		$("editor-captionlabel").innerHTML = captionStr;

		var innerHtml = "";
		if(EDT.editor.isNewSprite || EDT.isDefaultSprite(eSpr)){
			// nop
		}
		else{
			innerHtml = PARAM.sprites[eSid].innerHTML;

			if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
				innerHtml = innerHtml.replace(/<img.*?src=[\"\'].+?[\"\'].*?>/i, "");
				innerHtml = innerHtml.replace(/<a.*?class=.?attachedfile.*?>.*?<\/a>/i, "");
			}
			if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
					innerHtml = innerHtml.replace(/<br.*?\/?>\n?/gi, "\r");
					innerHtml = innerHtml.replace(/\n/gi, "");
					innerHtml = innerHtml.replace(/\r/gi, "\n");
			}
			else{
				if(PLG.browser.msie || PLG.browser.msie7){
					innerHtml = innerHtml.replace(/(<br.*?\/?>)\n?/gi, "$1\n");
				}
				else if(PLG.browser.opera){
					innerHtml = innerHtml.replace(/(<script.*?>\n?)\s\s\s\s/gi, "$1<!--");
				}
			}
			if(PARAM.sprite_autolink == 1 && PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
				while(innerHtml.match(/<a href=\"(.+?)\">(.+?)<\/a>/i)){
					if(RegExp.$1 == RegExp.$2){
						innerHtml = innerHtml.replace(/<a href=\".+?\">/i, "");
						innerHtml = innerHtml.replace(/<\/a>/i, "");
					}
					else{
						innerHtml = innerHtml.replace(/<a href=\".+?\">/i, "[" + RegExp.$1 + " ");
						innerHtml = innerHtml.replace(/<\/a>/i, "]");
					}
				}
			}
		}

		$("editor-textarea").value = innerHtml;
	}
	else if(EDT.currentEditorType == PLG.CONST.WIKI_EDITOR){
		var captionStr = "";
		if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_SUPER){
			captionStr = MESSAGE.EDITOR_INPUTWIKIHTML;
		}
		else{
			captionStr = MESSAGE.EDITOR_INPUTWIKI;
		}

		if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_SUPER){
			captionStr += MESSAGE.EDITOR_SCRIPTAVAILABLE;
		}
		$("editor-captionlabel").innerHTML = captionStr;

		var innerHTML = "";
		if(EDT.editor.isNewSprite || EDT.isDefaultSprite(eSpr)){
			// nop
		}
		else{
			innerHTML = PARAM.sprites[eSid].innerHTML;
			innerHTML = innerHTML.replace(/<br class=\"?wiki_br_space\"?>/gi, "<br> ");
			innerHTML = Wiky.toWiki(innerHTML);
		}
		$("editor-textarea").value = innerHTML;
	}

	if(EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR || EDT.currentEditorType == PLG.CONST.WIKI_EDITOR){
		// Notice: Cannot focus it here if editor is opened by double click
		$("editor-textarea").focus();
	}
};

EDT.editor.close = function() {
	if($("uploader-dialog")){
		EDT.uploader.close();
	}
	if($("plugin-dialog")){
		EDT.plugin.close();
	}
	// display = "none" causes error. It may be problems on FCKeditor.
	// use shrink()
	// $("editor").style.display = "none";


	// Can't use "this.shrink()"
	EDT.editor.shrink();

	// Delete?
	if(EDT.editor.isNewSprite){
		EDT.editor.isNewSprite = false;
		// EDT.SAVE_NEWBUTTONSPRITE is saved on server.
		// Others are not saved on server.
		$("spriteslist").removeChild(PLG.selection.currentFixed);
		EDT.restoreHashes();
		PLG.state = PLG.STATES.WORKING;
		PLG.selection.clear();
		var e;
		EDT.view.redraw(e, true);
		return;
	}
	else if(EDT.isDefaultSprite(PLG.selection.currentFixed)){
		EDT.deleteSprite(false);
		return;
	}
	else{
		EDT.view.setPropertyDirty(EDT.view.isPropertyDirty);

		PLG.state = PLG.STATES.FIXEDSELECTED;
		var id = PLG.selection.currentFixed.id;
		PLG.selection.clear();
		PLG.selection.fix(id, false);
		EDT.view.redraw();
	}
};

EDT.editor.shrink = function() {
	EDT.editor.mode = EDT.EDITOR_CLOSE;

	if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR && typeof(FCKeditorAPI) != "undefined"){
		// Source view causes error
		if(EDT.editor.fck.EditMode != FCK_EDITMODE_WYSIWYG){
					EDT.editor.fck.SwitchEditMode();
		}
	}
	if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR && (PLG.browser.msie || PLG.browser.msie7)){
		EDT.editor.fck.SetData("");
	}


	$("editor-control2").style.visibility = "hidden";
	$("editor-textarea").style.visibility = "hidden";
	if($("editorarea")){
		$("editorarea").style.visibility = "hidden";
	}
	$("editor").style.visibility = "hidden";
	EDT.colorpicker.close();
};

EDT.editor.expand = function() {
	if($("editorarea") && EDT.currentEditorType == PLG.CONST.RICH_EDITOR && 	$("editorarea").style.visibility == "hidden"){
		$("editorarea").style.visibility = "visible";
		$("editor-control2").style.visibility = "hidden";
		$("editor-textarea").style.visibility = "hidden";
	}
	else if((EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR || EDT.currentEditorType == PLG.CONST.WIKI_EDITOR) && $("editor-textarea").style.visibility == "hidden"){
		if($("editorarea")){
			$("editorarea").style.visibility = "hidden";
		}
		$("editor-control2").style.visibility = "visible";
		$("editor-textarea").style.visibility = "visible";
	}
	$("editor").style.visibility = "visible";

};

// -----------------------------------------------------------------------------------------------
// Uploader dialog

EDT.UPLOADER_CLOSE = 0;
EDT.UPLOADER_OPEN = 1;

EDT.uploader = {};
EDT.uploader.mode = EDT.UPLOADER_CLOSE;
EDT.uploader.canMove = false;
EDT.uploader.moveOffsetX = false;
EDT.uploader.moveOffsetY = false;
EDT.uploader.WIDTH = 300;
EDT.uploader.open = function() {
	if(EDT.uploader.mode == EDT.UPLOADER_CLOSE){
		EDT.uploader.mode = EDT.UPLOADER_OPEN;

		if(PLG.browser.msie || PLG.browser.msie7){
			$("uploaderbtn").setAttribute("className", "btn-open");
		}
		else{
			$("uploaderbtn").setAttribute("class", "btn-open")
		}

		PLG.setCookie("pageid", PARAM.pageid, PARAM.CGIFILEPATH, 0);

		var uDialog = PLG.createElm("div", "uploader-dialog");
		uDialog.style.width = EDT.uploader.WIDTH + "px";

		var title = PLG.createElm("div", "uploadertitle");
		if(PLG.browser.mozes){
			title.style.MozUserSelect = "none";
		}
		else if(PLG.browser.safari){
			title.style.KhtmlUserSelect = "none";
		}
		title.style.width = EDT.uploader.WIDTH + "px";
		title.onmousedown = function(e) {
			PLG.disableSelection();
			EDT.uploader.moveOffsetX = PLG.mouseXonBrowser(e) - $("uploader-dialog").offsetLeft;
			EDT.uploader.moveOffsetY = PLG.mouseYonBrowser(e) - $("uploader-dialog").offsetTop;
			EDT.uploader.canMove = true;
		}
		title.appendChild(document.createTextNode("File uploader"));
		uDialog.appendChild(title);

		var closeBtn = PLG.createElm("div", "uploaderclosebtn");
		closeBtn.onmousedown = function() {
			EDT.uploader.close();
			PLG.ignoreMouseDown = true;
		}
		uDialog.appendChild(closeBtn);

		var fileUploadFrame = PLG.createElm("iframe", "fileuploadframe");

		fileUploadFrame.setAttribute("src", "./fileupload.cgi?" + (new Date()).getTime());

		uDialog.appendChild(fileUploadFrame);
		var uBtn = $("uploaderbtn");
		var uTop = 0;
		var uHeight = 0;
		var uLeft = 0;
		if(PLG.browser.msie || PLG.browser.msie7){
			uTop = uBtn.offsetTop + uBtn.parentNode.offsetTop;
			uHeight = uBtn.offsetHeight;
			uLeft = uBtn.offsetLeft + uBtn.parentNode.offsetLeft;
		}
		else{
			uTop = uBtn.offsetTop;
			uHeight = uBtn.offsetHeight;
			uLeft = uBtn.offsetLeft;
		}
		uDialog.style.top = uTop + uHeight + "px";
		if(uLeft + EDT.uploader.WIDTH > PLG.getInnerWidth() - 10){
			uLeft = PLG.getInnerWidth() - EDT.uploader.WIDTH - 10;
		}
		uDialog.style.left = uLeft + "px";

		$("positlogbody").appendChild(uDialog);
	}
};

EDT.uploader.close = function() {
	if(EDT.uploader.mode != EDT.UPLOADER_CLOSE){
		EDT.uploader.mode = EDT.UPLOADER_CLOSE;
		if(PLG.browser.msie || PLG.browser.msie7){
			$("uploaderbtn").setAttribute("className", "btn-close");
		}
		else{
			$("uploaderbtn").setAttribute("class", "btn-close")
		}
		$("positlogbody").removeChild($("uploader-dialog"));
	}
};

// This function is called from filepload.cgi.
EDT.uploader.insert = function(html) {
	if(html.match(/^filename;(.+?);(.+?)x(.+?)$/)){
		var filename = RegExp.$1;
		var width = RegExp.$2;
		var height = RegExp.$3;
		$("uploadedfilename").innerHTML = filename + "(" + width + "x" + height + ")";
	}
	else if(html.match(/^filename;(.+?);(.+?)$/)){
		var filename = RegExp.$1;
		var bytes = RegExp.$2;
		var kbytes = Math.round(bytes / 1024);
		if(kbytes !== 0){
			$("uploadedfilename").innerHTML = filename + "(" + kbytes + "kb)";
		}
		else{
			$("uploadedfilename").innerHTML = filename + "(" + bytes + "b)";
		}
	}
	else{
		$("editor-textarea").value += html;
	}
};

// -----------------------------------------------------------------------------------------------
// Plugin dialog

EDT.PLUGIN_CLOSE = 0;
EDT.PLUGIN_OPEN = 1;

EDT.plugin = {};
EDT.plugin.mode = EDT.PLUGIN_CLOSE;
EDT.plugin.canMove = false;
EDT.plugin.moveOffsetX = false;
EDT.plugin.moveOffsetY = false;
EDT.plugin.WIDTH = 300;
EDT.plugin.open = function() {
	if(EDT.plugin.mode == EDT.PLUGIN_CLOSE){
		EDT.plugin.mode = EDT.PLUGIN_OPEN;

		PLG.enableSelection();

		if(PLG.browser.msie || PLG.browser.msie7){
			$("pluginbtn").setAttribute("className", "btn-open");
		}
		else{
			$("pluginbtn").setAttribute("class", "btn-open")
		}

		var pluginName = "";
		var pluginOption = "";
		var pluginTemplate = "";
		var pluginStr = PLG.getSpritePlugin(PLG.selection.currentFixed).innerHTML;
		if(pluginStr !== undefined && pluginStr !== ""){
			pluginStr = pluginStr.replace(/&amp;/gi, "&");
			var pluginArray = pluginStr.split(";");
			var pluginCommand = pluginArray[0];
			if(pluginArray.length >= 2){
				for(var i = 1;i < pluginArray.length - 1; i++){
					pluginTemplate += pluginArray[i] + ";";
				}
				pluginTemplate += pluginArray[pluginArray.length - 1];
			}
			if(pluginTemplate === ""){
				pluginTemplate = "[[plugin]]";
			}

			var pluginCommandArray = pluginCommand.split(",");

			if(pluginCommandArray.length >= 1){
				var index = 0;
				pluginName = pluginCommandArray[index];
				if(pluginName == "plugin"){
					index++;
					pluginName = pluginCommandArray[index];
				}
				if(pluginCommandArray.length >= 2){
					for(var i = index + 1;i < pluginCommandArray.length - 1; i++){
						pluginOption += pluginCommandArray[i] + ",";
					}
					pluginOption += pluginCommandArray[pluginCommandArray.length - 1];
				}
			}
		}

		// form
		var pDialog = PLG.createElm("form", "plugin-dialog");
		pDialog.style.width = EDT.plugin.WIDTH + "px";
		pDialog.onsubmit = function() {
			return false;
		}

		var title = PLG.createElm("div", "plugintitle");
		if(PLG.browser.mozes){
			title.style.MozUserSelect = "none";
		}
		else if(PLG.browser.safari){
			title.style.KhtmlUserSelect = "none";
		}
		title.style.width = EDT.plugin.WIDTH + "px";
		title.onmousedown = function(e) {
			PLG.disableSelection();
			EDT.plugin.moveOffsetX = PLG.mouseXonBrowser(e) - $("plugin-dialog").offsetLeft;
			EDT.plugin.moveOffsetY = PLG.mouseYonBrowser(e) - $("plugin-dialog").offsetTop;
			EDT.plugin.canMove = true;
		}
		title.appendChild(document.createTextNode("Plugin"));
		pDialog.appendChild(title);

		var closeBtn = PLG.createElm("div", "pluginclosebtn");
		closeBtn.onmousedown = function() {
			EDT.plugin.close();
			PLG.ignoreMouseDown = true;
		}
		pDialog.appendChild(closeBtn);

		// Plugin name
		var nameTitleElm = PLG.createElm("div", "plugin-nametitle");
		nameTitleElm.appendChild(document.createTextNode(""));
		nameTitleElm.innerHTML = "plugin&nbsp;name";
		pDialog.appendChild(nameTitleElm);

		// clear cache
		var clearElement = PLG.createElm("input", "dialog-clearcache");
		clearElement.setAttribute("type", "button");
		clearElement.value = "Clear Cache";
		clearElement.onclick = function() {
			var postdata = "&pageid=" + PARAM.pageid + "&sourceID=" + PLG.selection.currentFixed.id + "&plugin=" + $("plugin-name").value + "," + $("plugin-option").value;
			var clearCacheOnLoaded = function(obj) {
				var res = obj.responseText;
				res.match(/^(.+?)[\n\r]/i);
				res = RegExp.$1;
				$("dialog-clearcacheresult").innerHTML = res;
			}
			PLG.sendRequest(clearCacheOnLoaded, postdata, "POST", PARAM.CGIFILEPATH + "clearCache.cgi", true, true);
		}

		pDialog.appendChild(clearElement);

		var clearResultElement = PLG.createElm("div", "dialog-clearcacheresult");
		pDialog.appendChild(clearResultElement);

		pDialog.appendChild(PLG.createElm("br"));

		var nameElm = PLG.createElm("input", "plugin-name");
		nameElm.setAttribute("type", "text");
		if(PLG.browser.safari){
			nameElm.setAttribute("size", "30");
		}
		else{
			nameElm.setAttribute("size", "40");
		}
		nameElm.value = pluginName;
		nameElm.onfocus = function() {
			PLG.focusedField = "plugin-name";
		}
		nameElm.onblur = function() {
			PLG.focusedField = "";
		}
		pDialog.appendChild(nameElm);

		// Plugin options
		var optionTitleElm = PLG.createElm("div", "plugin-optiontitle");
		optionTitleElm.appendChild(document.createTextNode(""));
		optionTitleElm.innerHTML = "plugin&nbsp;options";
		pDialog.appendChild(optionTitleElm);

		var optionElm = PLG.createElm("textarea", "plugin-option");
		optionElm.setAttribute("rows", "2");
		optionElm.value = pluginOption;
		optionElm.onfocus = function() {
			PLG.focusedField = "plugin-option";
		}
		optionElm.onblur = function() {
			PLG.focusedField = "";
		}
		pDialog.appendChild(optionElm);

		// Plugin template
		var templateTitleElm = PLG.createElm("div", "plugin-templatetitle");
		templateTitleElm.appendChild(document.createTextNode(""));
		templateTitleElm.innerHTML = "plugin&nbsp;template";
		pDialog.appendChild(templateTitleElm);

		var templateElm = PLG.createElm("textarea", "plugin-template");
		templateElm.setAttribute("rows", "6");
		templateElm.value = pluginTemplate;
		templateElm.onfocus = function() {
			PLG.focusedField = "plugin-template";
		}
		templateElm.onblur = function() {
			PLG.focusedField = "";
		}
		pDialog.appendChild(templateElm);

		var brElm = PLG.createElm("br");
		pDialog.appendChild(brElm);

		// ok
		var okElm = PLG.createElm("input", "dialog-ok");
		okElm.setAttribute("type", "button");
		okElm.value = "Ok";
		okElm.onclick = function() {
			var templateElm = $("plugin-template");
			var template = templateElm.value;
			if(!template.match(/\[\[plugin\]\]/)){
				templateElm.value = "[[plugin]]" + template;
			}

			var pluginStr = ""
			if(!$("plugin-name").value.match(/^\s*$/)){
				pluginStr = $("plugin-name").value + "," + $("plugin-option").value + ";" + templateElm.value;
			}

			PLG.getSpritePlugin(PLG.selection.currentFixed).innerHTML = pluginStr;
			
			PARAM.sprites[PLG.selection.currentFixed.id].plugin = pluginStr;
			
			$("cp_pluginname").innerHTML = $("plugin-name").value;

			if(EDT.editor.mode != EDT.EDITOR_CLOSE){
				if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR){
					var innerHTML = EDT.editor.fck.GetData();
					if(innerHTML === ""){
						// SetData is unstable in WYSIWYG mode on IEs
						if(PLG.browser.msie || PLG.browser.msie7){
							EDT.editor.fck.SwitchEditMode();
							EDT.editor.fck.SetData("[[plugin]]");
							EDT.editor.fck.SwitchEditMode();
						}
						else{
							EDT.editor.fck.SetData("[[plugin]]");
						}

					}
				}
				else{
					if($("editor-textarea").value === ""){
						$("editor-textarea").value = "[[plugin]]";
					}
				}
			}
			EDT.plugin.close();
//			EDT.savepropertybtnOnClick();
			EDT.view.setPropertyDirty(true);
		};

		pDialog.appendChild(okElm);
		var pBtn = $("pluginbtn");
		var pTop = 0;
		var pHeight = 0;
		var pLeft = 0;
		if(PLG.browser.msie || PLG.browser.msie7){
			pTop = pBtn.offsetTop + pBtn.parentNode.offsetTop;
			pHeight = pBtn.offsetHeight;
			pLeft = pBtn.offsetLeft + pBtn.parentNode.offsetLeft;
		}
		else{
			pTop = pBtn.offsetTop;
			pHeight = pBtn.offsetHeight;
			pLeft = pBtn.offsetLeft;
		}
		pDialog.style.top = pTop + pHeight + "px";
		if(pLeft + EDT.plugin.WIDTH > PLG.getInnerWidth() - 10){
			pLeft = PLG.getInnerWidth() - EDT.plugin.WIDTH - 10;
		}
		pDialog.style.left = pLeft + "px";

		$("positlogbody").appendChild(pDialog);
	}
};

EDT.plugin.close = function() {
	if(EDT.plugin.mode != EDT.PLUGIN_CLOSE){
		EDT.plugin.mode = EDT.PLUGIN_CLOSE;
		if(PLG.browser.msie || PLG.browser.msie7){
			$("pluginbtn").setAttribute("className", "btn-close");
		}
		else{
			$("pluginbtn").setAttribute("class", "btn-close")
		}
		$("positlogbody").removeChild($("plugin-dialog"));

		PLG.focusedField = "";
	}
};



// -----------------------------------------------------------------------------------------------
// Drawing tool dialog

EDT.DRAWINGTOOL_CLOSE = 0;
EDT.DRAWINGTOOL_OPEN = 1;
EDT.drawingtool = {};
EDT.drawingtool.mode = EDT.DRAWINGTOOL_CLOSE;
EDT.drawingtool.canMove = false;
EDT.drawingtool.moveOffsetX = 0;
EDT.drawingtool.moveOffsetY = 0;
EDT.drawingtool.WIDTH = 90;
EDT.drawingtool.HEIGHT = 150;
EDT.drawingtool.open = function() {
	if(EDT.drawingtool.mode == EDT.DRAWINGTOOL_CLOSE){
		EDT.drawingtool.mode = EDT.DRAWINGTOOL_OPEN;

		// form
		var dDialog = PLG.createElm("div", "drawingtool");
		dDialog.style.width = EDT.drawingtool.WIDTH + "px";
		dDialog.style.height = EDT.drawingtool.HEIGHT + "px";

		var title = PLG.createElm("div", "drawingtooltitle");
		if(PLG.browser.mozes){
			title.style.MozUserSelect = "none";
		}
		else if(PLG.browser.safari){
			title.style.KhtmlUserSelect = "none";
		}
		title.style.width = EDT.drawingtool.WIDTH + "px";
		title.onmousedown = function(e) {
			PLG.disableSelection();
			EDT.drawingtool.moveOffsetX = PLG.mouseXonBrowser(e) - $("drawingtool").offsetLeft;
			EDT.drawingtool.moveOffsetY = PLG.mouseYonBrowser(e) - $("drawingtool").offsetTop;
			EDT.drawingtool.canMove = true;
		}
		title.appendChild(document.createTextNode(MESSAGE.PROPERTYDRAWINGTOOL));
		dDialog.appendChild(title);

		var lwBlock = PLG.createElm("div", "drawinglinewidthblock");

		var lwLabel = PLG.createElm("div", "drawinglinewidthlabel");
		lwLabel.appendChild(document.createTextNode(MESSAGE.PROPERTYWIDTHLABEL));
		lwBlock.appendChild(lwLabel);

		var lSelector = PLG.createElm("select", "drawlinewidthselector");
		for(var txt in EDT.lineWidthIndex){
			if(txt.match(/^(.+)px$/)){
				var lineWidthOption = PLG.createElm("option");
				lineWidthOption.setAttribute("value", txt);
				lineWidthOption.appendChild(document.createTextNode(RegExp.$1));
				lSelector.appendChild(lineWidthOption);
			}
		}
		lSelector.onmousedown = function() {
			PLG.ignoreMouseDown = true;
		};
		lSelector.onchange = function() {
//			PLG.ignoreMouseDown = true;
			EDT.pensize = parseInt(lSelector.options[lSelector.selectedIndex].value.replace(/px/g, ""));
		};
		lSelector.selectedIndex = EDT.lineWidthIndex[EDT.pensize + "px"];
		lwBlock.appendChild(lSelector);

		dDialog.appendChild(lwBlock);

		var undoBlock = PLG.createElm("div", "undodrawingblock");

		var undoLabel = PLG.createElm("div", "undodrawinglabel");
		undoLabel.appendChild(document.createTextNode(MESSAGE.PROPERTYUNDODRAWING));
		undoBlock.appendChild(undoLabel);

		var undobtn = PLG.createElm("div", "undodrawingbtn");
		undoBlock.appendChild(undobtn);

		dDialog.appendChild(undoBlock);
		
		dDialog.style.top = ($("controlpanel").offsetHeight + EDT.colorpicker.HEIGHT + 3) + "px";
		dDialog.style.left = PLG.getInnerWidth() - EDT.drawingtool.WIDTH - 10 + "px";

		$("positlogbody").appendChild(dDialog);

		EDT.setButtonEvents("undodrawingbtn", "undo_hl.gif", "undo.gif", "undo_rev.gif", "EDT.undoDraw()");
	}
};

EDT.drawingtool.close = function() {
	if(EDT.drawingtool.mode != EDT.DRAWINGTOOL_CLOSE){
		EDT.drawingtool.mode = EDT.DRAWINGTOOL_CLOSE;
		$("positlogbody").removeChild($("drawingtool"));
	}
};


// -----------------------------------------------------------------------------------------------
// Color picker dialog

// Picker mode
EDT.PICKER_CLOSE = 0;
EDT.PICKER_BG = 1;
EDT.PICKER_TEXT = 2;
EDT.PICKER_LINE = 3;
EDT.PICKER_DRAWING = 4;

EDT.colorpicker = {};
EDT.colorpicker.mode = EDT.PICKER_CLOSE;
EDT.colorpicker.canPick = false;
EDT.colorpicker.canMove = false;
EDT.colorpicker.moveOffsetX = 0;
EDT.colorpicker.moveOffsetY = 0;
EDT.colorpicker.registering = false;
EDT.colorpicker.r = 0;
EDT.colorpicker.g = 0;
EDT.colorpicker.b = 0;
EDT.colorpicker.h = 0;
EDT.colorpicker.s = 0;
EDT.colorpicker.v = 0;

EDT.colorpicker.WIDTH = 310;
EDT.colorpicker.HEIGHT = 245;

EDT.colorpicker.pick = function(x, y) {
	if(!this.canPick){
		return;
	}
	// Saturation and value area
	if(x < $("svarea").offsetLeft + $("svarea").offsetWidth + 3 && y >= $("svarea").offsetTop - 3){

		var s = (x - $("svarea").offsetLeft);
		if(s > 127){
			s = 127;
		}
		else if(s < 0){
			s = 0;
		}
		s /= 127.0;

		var v = (207.0 - (y - $("svarea").offsetTop));
		if(v > 207){
			v = 207;
		}
		else if(v < 0){
			v = 0;
		}
		v /= 207.0;

		this.setHSV(this.h, s, v);
	}
	else if(x >= $("huearea").offsetLeft - 3 && x < $("huearea").offsetLeft + $("huearea").offsetWidth + 3){

		var h = (207.0 - (y - $("huearea").offsetTop));
		if(h > 207){
			h = 207;
		}
		else if(h < 0){
			h = 0;
		}
		h /= 207.0;
		this.setHSV(h, this.s, this.v);
	}

	if(EDT.colorpicker.mode == EDT.PICKER_LINE && PLG.selection.currentFixed.id.match(/_link$/)){
		EDT.colorpicker.saveLinkColor(EDT.rgb2hex(EDT.colorpicker.r, EDT.colorpicker.g, EDT.colorpicker.b));
	}
	else{
		EDT.view.setPropertyDirty(true);
	}
};

EDT.colorpicker.setColor = function(col, hRotateFlag){
	if(col !== "" && col != "transparent"){
		if(col.match(/^rgb\((\d+?),\s?(\d+?),\s?(\d+?)\)/)){
			EDT.colorpicker.setRGB(RegExp.$1, RegExp.$2, RegExp.$3, hRotateFlag);
		}
		else if(col.match(/^#/)){
			EDT.colorpicker.setHEX(col.substr(1, 6), hRotateFlag);
		}
		else{
			alert("Invalid color format: " + col);
		}
	}
	else{
		EDT.colorpicker.setHEX("", hRotateFlag);
	}
};

EDT.colorpicker.setHEX = function(hex, hRotateFlag) {
	if(hex !== ""){
		this.setRGB(EDT.hex2dec(hex.substr(0, 2)), EDT.hex2dec(hex.substr(2, 2)), EDT.hex2dec(hex.substr(4, 2)), hRotateFlag);
	}
	else{
		this.h = 1.0;
		this.s = 0;
		this.v = 1.0;
		this.r = this.g = this.b = 255;
		this.applyColor(true, true);
	}
};

EDT.colorpicker.setHSV = function(h, s, v, hRotateFlag) {
	this.h = parseFloat(h);
	this.s = parseFloat(s);
	this.v = parseFloat(v);

	var rgb = EDT.hsv2rgb(this.h, this.s, this.v);
	var rgbArray = rgb.split(",");
	this.r = parseInt(rgbArray[0]);
	this.g = parseInt(rgbArray[1]);
	this.b = parseInt(rgbArray[2]);

	this.applyColor(false, hRotateFlag);
};

EDT.colorpicker.setRGB = function(r, g, b, hRotateFlag) {
	this.r = parseInt(r);
	this.g = parseInt(g);
	this.b = parseInt(b);

	var hsv = EDT.rgb2hsv(this.r, this.g, this.b);
	var hsvArray = hsv.split(",");
	this.h = parseFloat(hsvArray[0]);
	this.s = parseFloat(hsvArray[1]);
	this.v = parseFloat(hsvArray[2]);

	this.applyColor(false, hRotateFlag);
};

EDT.colorpicker.applyColor = function(transparencyFlag, hRotateFlag) {
	var hueareatop = 27;
	var hueBar = Math.round(207 * (1.0 - this.h));

	if(transparencyFlag && EDT.colorpicker.mode == EDT.PICKER_DRAWING){
		this.h = 1.0;
		this.s = 0;
		this.v = 0;
		this.r = this.g = this.b = 0;
		transparencyFlag = false;
	}

	if(this.h === 0 && hRotateFlag){
		hueBar = 0;
	}
	$("colorslider").style.top = (hueBar + hueareatop - 2) + "px";

	var svarealeft = 10;
	var svareatop = 27;
	$("colorpointer").style.left = (Math.round(127 * this.s) + svarealeft - 3) + "px";
	$("colorpointer").style.top = (Math.round(207 * (1.0 - this.v)) + svareatop - 3) + "px";
	var rgb = EDT.hsv2rgb(this.h, 1, 1);
	var rgbArray = rgb.split(",");
	var col = "rgb(" + rgbArray[0] + "," + rgbArray[1] + "," + rgbArray[2] + ")";
	$("svarea").style.backgroundColor = col;

	var hex = EDT.rgb2hex(this.r, this.g, this.b);

	if(transparencyFlag){
		$("hexinput").value = "";
		hex = "";
	}
	else{
		$("hexinput").value = hex;
		hex = "#" + hex;
	}
	$("currentcolor").style.backgroundColor = hex;

	if(EDT.colorpicker.mode != EDT.PICKER_DRAWING){
		var sid = PLG.selection.currentFixed.id;
		if(PLG.selection.isFixed(sid)){
			var contents = PLG.getSpriteContents($(sid));
			if(EDT.colorpicker.mode == EDT.PICKER_BG){
				contents.style.backgroundColor = hex;
				PARAM.sprites[sid].bgColor = hex;
			}
			else if(EDT.colorpicker.mode == EDT.PICKER_TEXT){
				contents.style.color = hex;
				PARAM.sprites[sid].color = hex;
			}
			else if(EDT.colorpicker.mode == EDT.PICKER_LINE){
				if(sid.match(/_link$/)){
					// nop
				}
				else{
					contents.style.borderColor = hex;
					PARAM.sprites[sid].borderColor = hex;
				}
			}
		}
	}
	else{
		EDT.penColor = hex;
	}

};

EDT.colorpicker.saveLinkColor = function(hex){
	var contents = PLG.getSpriteContents(PLG.selection.currentFixed);
	var innerHTML = contents.innerHTML.replace(new RegExp("draw\\('shape,arrow,(.+?),(.+?),(.+?),(.+?),(.+?),(.+?),(.+?)'\\)"), "draw('shape,arrow,$1,$2,#" + hex + ",$4,$5,$6,$7')");
	contents.innerHTML = innerHTML;
	EDT.saveFromEditor(PLG.selection.currentFixed, EDT.SAVE_PROPERTY, true);

};


EDT.createPalette = function(id, num, row, colors) {
	var box = PLG.createElm("div", id);
	num = parseInt(num);
	row = parseInt(row);
	var col = Math.floor(num / row);
	for(var i = 0;i < num; i++){
		var width = 14;
		var height = 14;

		var margin = 3;
		var palette = PLG.createElm("div", id + i);
		if(PLG.browser.msie || PLG.browser.msie7){
			palette.setAttribute("className", "colorpalette");
		}
		else{
			palette.setAttribute("class", "colorpalette")
		}
		var currentRow = Math.floor(i / col);
		palette.style.left = (i - currentRow * col) * (width + margin) + "px";
		palette.style.top = currentRow * (height + margin) + "px";
		palette.style.width = width + "px";
		palette.style.height = height + "px";
		if(colors[i]){
			palette.style.backgroundColor = colors[i];
		}
		else{
			// for IE6
			palette.style.backgroundColor = "transparent";
		}
		palette.onmouseover = function() {
			this.style.borderColor = "#000000";
			this.style.padding = "1px";
			this.style.left = this.offsetLeft - 1 + "px";
			this.style.top = this.offsetTop - 1 + "px";
			if(this.id.match(/^colorpalettebox-custom/)){
				if(EDT.colorpicker.registering || (!EDT.colorpicker.registering && this.style.backgroundColor === "")){

					$("colorregistlabel2").innerHTML = MESSAGE.PROPERTYCANCOLORREGISTER;
				}
			}
		};
		palette.onmouseout = function() {
			this.style.borderColor = "#909090";
			this.style.padding = "0px";
			this.style.left = (this.offsetLeft + 1) + "px";
			this.style.top = (this.offsetTop + 1) + "px";
			$("colorregistlabel2").innerHTML = "";
		};
		palette.onmousedown = function() {
			if(this.id.match(/^colorpalettebox-custom(.+?)$/)){
				if(EDT.colorpicker.registering 
					 || this.style.backgroundColor === ""
					 || this.style.backgroundColor == "transparent"){
					if($("currentcolor").style.backgroundColor === ""){
						EDT.usercolor[RegExp.$1] = "";
						this.style.backgroundColor = "";
						EDT.colorpicker.saveColorProfile();
					}
					else{
						EDT.usercolor[RegExp.$1] = "rgb(" + EDT.colorpicker.r + "," + EDT.colorpicker.g + "," + EDT.colorpicker.b + ")";
						this.style.backgroundColor = "rgb(" + EDT.colorpicker.r + "," + EDT.colorpicker.g + "," + EDT.colorpicker.b + ")";
						EDT.colorpicker.saveColorProfile();
					}
				}
				else{
					var col = this.style.backgroundColor;
					EDT.colorpicker.setColor(col, true);
					if(EDT.colorpicker.mode == EDT.PICKER_LINE && PLG.selection.currentFixed.id.match(/_link$/)){
						EDT.colorpicker.saveLinkColor(EDT.rgb2hex(EDT.colorpicker.r, EDT.colorpicker.g, EDT.colorpicker.b));
					}
					else{
						EDT.view.setPropertyDirty(true);
					}
				}
			}
			else{
				var col = this.style.backgroundColor;
				EDT.colorpicker.setColor(col, true);
				if(EDT.colorpicker.mode == EDT.PICKER_LINE && PLG.selection.currentFixed.id.match(/_link$/)){
						EDT.colorpicker.saveLinkColor(EDT.rgb2hex(EDT.colorpicker.r, EDT.colorpicker.g, EDT.colorpicker.b));
				}
				else{
					EDT.view.setPropertyDirty(true);
				}

			}

		}
		box.appendChild(palette);
	}
	return box;
};

EDT.colorpicker.setRecentColor = function(col){
	if(col.match(/^rgb\((\d+?),\s?(\d+?),\s?(\d+?)\)/)){
		col = "#" + EDT.rgb2hex(RegExp.$1, RegExp.$2, RegExp.$3);
	}
	for(var i=0; i<EDT.recentcolor.length; i++){
		var rescol = EDT.recentcolor[i];
		if(rescol.match(/^rgb\((\d+?),\s?(\d+?),\s?(\d+?)\)/)){
			rescol = "#" + EDT.rgb2hex(RegExp.$1, RegExp.$2, RegExp.$3);
		}
		if(col == rescol){
			return;
		}
	}
	EDT.recentcolor.pop();
	EDT.recentcolor.unshift(col);
	for(var i=0; i<EDT.recentcolor.length; i++){
		if($("colorpalettebox-history" + i)){
			$("colorpalettebox-history" + i).style.backgroundColor = EDT.recentcolor[i];
		}
	}
};

EDT.colorpicker.saveColorProfile = function(){
	var colorProf = "";
	var userColor = "";
	for(var i=0; i<EDT.usercolor.length-1; i++){
		userColor += EDT.usercolor[i] + "&";
	}
	userColor += EDT.usercolor[EDT.usercolor.length-1];
	colorProf += "userColor:" + escape(userColor) + ",";

	var recentColor = "";
	for(var i=0; i<EDT.recentcolor.length-1; i++){
		recentColor += EDT.recentcolor[i] + "&";
	}
	recentColor += EDT.recentcolor[EDT.recentcolor.length-1];
	colorProf += "recentColor:" + escape(recentColor);

	var profUserName = PARAM.author;
	profUserName = encodeURIComponent(profUserName);

	PLG.setCookie("colorprof_" + profUserName, colorProf, PARAM.CGIFILEPATH, 30);

}

// hex: from "000000" to "ffffff"
EDT.colorpicker.open = function(label, _left, _top, _color) {
	if(PLG.state != PLG.STATES.FIXED && PLG.state != PLG.STATES.EDITING && EDT.currenttool != EDT.TOOL_DRAWING){
		// While colorpicker is opened, only PLG.STATES.FIXED PLG.STATES.FIXEDSELECTED
		// PLG.STATES.EDITING PLG.STATES.EDITINGSELECTED EDT.TOOL_DRAWING are available.
		return;
	}

	var picker = $("colorpicker");

	if(!picker){

		var profUserName = PARAM.author;
		profUserName = encodeURIComponent(profUserName);
		var userProfCookie = PLG.getCookie("colorprof_" + profUserName);
		var userProf = {};
		if(userProfCookie !== undefined){
			var profArray = userProfCookie.split(",");
			for(var i = 0;i < profArray.length; i++){
				var myProf = profArray[i];
				var myProfArray = myProf.split(":");
				var key = myProfArray[0];
				var value = myProfArray[1];
				userProf[key] = value;
			}
		}

		if(userProf["userColor"]){
			var colstr = unescape(userProf["userColor"]);
			var colorArray = colstr.split("&");
			for(var i=0; i<colorArray.length; i++){
				EDT.usercolor[i] = colorArray[i];
			}
		}

		if(userProf["recentColor"]){
			var colstr = unescape(userProf["recentColor"]);
			var colorArray = colstr.split("&");
			for(var i=0; i<colorArray.length; i++){
				EDT.recentcolor[i] = colorArray[i];
			}
		}


		picker = PLG.createElm("div", "colorpicker");
		picker.style.width = EDT.colorpicker.WIDTH + "px";
		picker.style.height = EDT.colorpicker.HEIGHT + "px";

		var title = PLG.createElm("div", "colorpickertitle");
		if(PLG.browser.mozes){
			title.style.MozUserSelect = "none";
		}
		else if(PLG.browser.safari){
			title.style.KhtmlUserSelect = "none";
		}
		title.style.width = EDT.colorpicker.WIDTH + "px";
		title.onmousedown = function(e) {
			PLG.disableSelection();
			EDT.colorpicker.moveOffsetX = PLG.mouseXonBrowser(e) - $("colorpicker").offsetLeft;
			EDT.colorpicker.moveOffsetY = PLG.mouseYonBrowser(e) - $("colorpicker").offsetTop;
			EDT.colorpicker.canMove = true;
		}
		title.appendChild(document.createTextNode(""));
		picker.appendChild(title);

		var closeBtn = PLG.createElm("div", "colorpickerclosebtn");
		closeBtn.onmousedown = function() {
			EDT.colorpicker.close();
			PLG.ignoreMouseDown = true;
		}
		picker.appendChild(closeBtn);

		var sv = PLG.createElm("div", "svarea");
		if(PLG.browser.mozes){
			sv.style.MozUserSelect = "none";
		}
		else if(PLG.browser.safari){
			sv.style.KhtmlUserSelect = "none";
		}

		if(PLG.browser.msie){		
			sv.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(Src='" + PARAM.SYSTEMPATH + "images/colorpickerbg.png', SizingMethod='image')";
		}
		else{
			sv.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/colorpickerbg.png')";
		}		

		picker.appendChild(sv);

		var hue = PLG.createElm("div", "huearea");
		if(PLG.browser.mozes){
			hue.style.MozUserSelect = "none";
		}
		else if(PLG.browser.safari){
			hue.style.KhtmlUserSelect = "none";
		}
		var innerHTML = "";
		for(var i = 0;i < 208; i++){
			var rgb = EDT.hsv2rgb((207 - i) / 207, 1, 1);
			var rgbArray = rgb.split(",");
			var col = "rgb(" + rgbArray[0] + "," + rgbArray[1] + "," + rgbArray[2] + ")";
			innerHTML += "<div style='background-color:" + col + "; font-size:1px; margin:0px; padding:0px; overflow: hidden'></div>"
		}
		hue.innerHTML = innerHTML;
		picker.appendChild(hue);

		var slider = PLG.createElm("div", "colorslider");
		picker.appendChild(slider);

		var pointer = PLG.createElm("div", "colorpointer");
		picker.appendChild(pointer);

		var currentcolor = PLG.createElm("div", "currentcolor");
		picker.appendChild(currentcolor);

		var hexbox = PLG.createElm("div", "hexbox");

		var hexlabel = PLG.createElm("span", "hexlabel");
		hexlabel.appendChild(document.createTextNode("#"));
		hexbox.appendChild(hexlabel);

		var hexinput = PLG.createElm("input", "hexinput");
		hexinput.setAttribute("type", "text");
		hexinput.setAttribute("maxlength", "6");
		hexinput.onfocus = function() {
			PLG.focusedField = "hexinput";
			PLG.focusedFieldText = $("hexinput").value;
		}
		hexinput.onblur = function() {
			PLG.focusedField = "";
		}

		hexbox.appendChild(hexinput);

		var hexsetbtn = PLG.createElm("div", "hexsetbtn");
		hexsetbtn.style.display = "none";
		hexbox.appendChild(hexsetbtn);

		var hexclearbtn = PLG.createElm("div", "hexclearbtn");
		hexclearbtn.onmousedown = function() {
			EDT.colorpicker.setHEX("");
			if(EDT.colorpicker.mode == EDT.PICKER_LINE && PLG.selection.currentFixed.id.match(/_link$/)){
				EDT.colorpicker.saveLinkColor(EDT.rgb2hex(EDT.colorpicker.r, EDT.colorpicker.g, EDT.colorpicker.b));
			}
			else{
				EDT.view.setPropertyDirty(true);
			}
		};
		hexclearbtn.onmouseover = function() {
			this.style.borderColor = "#000000";
			this.style.padding = "1px";
			this.style.left = this.offsetLeft - 1 + "px";
			this.style.top = this.offsetTop - 1 + "px";
		};
		hexclearbtn.onmouseout = function() {
			this.style.borderColor = "#909090";
			this.style.padding = "0px";
			this.style.left = (this.offsetLeft + 1) + "px";
			this.style.top = (this.offsetTop + 1) + "px";
		};
		hexbox.appendChild(hexclearbtn);

		var hexclearlabel = PLG.createElm("span", "hexclearlabel");
		hexclearlabel.appendChild(document.createTextNode(MESSAGE.PROPERTYTRANSPARENCY));
		hexbox.appendChild(hexclearlabel);

		if(EDT.colorpicker.mode != EDT.PICKER_DRAWING 
			 && (PLG.selection.currentFixed === null || !PLG.selection.currentFixed.id.match(/_link$/))){
				 hexclearbtn.style.display = "block";
				 hexclearlabel.style.display = "block";
		}
		else{
				 hexclearbtn.style.display = "none";
				 hexclearlabel.style.display = "none";
		}

		picker.appendChild(hexbox);

		var colorpalettebox = EDT.createPalette("colorpalettebox", 32, 4, EDT.defaultcolor);
		picker.appendChild(colorpalettebox);

		var colorpalettebox_custom = EDT.createPalette("colorpalettebox-custom", 24, 3, EDT.usercolor);
		picker.appendChild(colorpalettebox_custom);

		var colorregistbox = PLG.createElm("div", "colorregistbox");

		var colorregistbtn = PLG.createElm("div", "colorregistbtn");
		colorregistbtn.setAttribute("title", "Register color");
		colorregistbtn.onmouseover = function() {
			if(!EDT.colorpicker.registering){
				colorregistbtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/colorregist_hl.gif')";
			}
		};
		colorregistbtn.onmouseout = function() {
			if(!EDT.colorpicker.registering){
				colorregistbtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/colorregist.gif')";
			}
		};
		colorregistbtn.onmousedown = function() {
			if(!EDT.colorpicker.registering){
				colorregistbtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/colorregist_rev.gif')";
				EDT.colorpicker.registering = true;
			}
			else{
				colorregistbtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/colorregist.gif')";
				EDT.colorpicker.registering = false;
			}
		};
		colorregistbox.appendChild(colorregistbtn);

		var colorregistlabel = PLG.createElm("div", "colorregistlabel");
		colorregistlabel.appendChild(document.createTextNode(MESSAGE.PROPERTYPALETTEOVERWRITE));
		colorregistbox.appendChild(colorregistlabel);
		picker.appendChild(colorregistbox);

		var colorregistlabel2 = PLG.createElm("div", "colorregistlabel2");
		colorregistlabel2.appendChild(document.createTextNode(""));
		picker.appendChild(colorregistlabel2);

//		var historyColors = [];
//		var len = 8;
//		for(i = 0;i < len; i++){
//			historyColors.push("#ffffff");
//		}
		var colorpalettebox_history = EDT.createPalette("colorpalettebox-history", 8, 1, EDT.recentcolor);
		picker.appendChild(colorpalettebox_history);

		EDT.view.setPropertyDirty(false);

		picker.style.top = _top + "px";
		if(_left + EDT.colorpicker.WIDTH > PLG.getInnerWidth() - 10){
			_left = PLG.getInnerWidth() - EDT.colorpicker.WIDTH - 10;
		}
		picker.style.left = _left + "px";
		$("positlogbody").appendChild(picker);

		EDT.setButtonEvents("hexsetbtn", "save_hl.gif", "save.gif", "save_rev.gif", "EDT.colorpicker.saveHexColor()");
	}
	else{
		if(EDT.colorpicker.mode != EDT.PICKER_DRAWING 
			 && (PLG.selection.currentFixed === null || !PLG.selection.currentFixed.id.match(/_link$/))){
				 $("hexclearbtn").style.display = "block";
				 $("hexclearlabel").style.display = "block";
		}
		else{
			$("hexclearbtn").style.display = "none";
			$("hexclearlabel").style.display = "none";
		}

		$("colorpicker").style.display = "block";


		picker.style.top = _top + "px";
		if(_left + EDT.colorpicker.WIDTH > PLG.getInnerWidth() - 10){
			_left = PLG.getInnerWidth() - EDT.colorpicker.WIDTH - 10;
		}
		picker.style.left = _left + "px";
		$("positlogbody").appendChild(picker);

	}

	$("colorpickertitle").innerHTML = label;
	this.setColor(_color, true, true);
};

EDT.colorpicker.close = function() {
	if(EDT.colorpicker.mode != EDT.PICKER_CLOSE){
		$("hexsetbtn").style.display = "none";

		if($("currentcolor")){
			EDT.colorpicker.setRecentColor($("currentcolor").style.backgroundColor);
			EDT.colorpicker.saveColorProfile();
		}

		EDT.colorpicker.reset();
		EDT.colorpicker.mode = EDT.PICKER_CLOSE;
	}
};

EDT.colorpicker.saveHexColor = function() {
	var hex = $("hexinput").value;
	if(hex.match(/[0-9a-f]{6}/i)){
		this.setHEX(hex, true);
	}
	else if(hex === ""){
		this.setHEX("", true);
	}
	else{
		// alert("Invalid color value");
		return;
	}

	if(EDT.colorpicker.mode == EDT.PICKER_LINE && PLG.selection.currentFixed.id.match(/_link$/)){
		EDT.colorpicker.saveLinkColor(EDT.rgb2hex(EDT.colorpicker.r, EDT.colorpicker.g, EDT.colorpicker.b));
	}
	else{
		EDT.view.setPropertyDirty(true);
	}
};

EDT.colorpicker.reset = function() {
	if(EDT.colorpicker.mode != EDT.PICKER_CLOSE){
		$("colorpicker").style.display = "none";
	}

	if($("textcolorbtn")){
		$("textcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/textcolorbtn.gif')";
	}
	if($("bgcolorbtn")){
		$("bgcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/bgcolorbtn.gif')";
	}
	if($("linecolorbtn")){
		$("linecolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn.gif')";
	}
	if($("drawcolorbtn")){
		$("drawcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn.gif')";
	}
};

EDT.colorpicker.toggleText = function() {
	EDT.colorpicker.reset();

	if(EDT.colorpicker.mode == EDT.PICKER_TEXT){
		EDT.colorpicker.mode = EDT.PICKER_CLOSE;
		return;
	}

	EDT.colorpicker.mode = EDT.PICKER_TEXT;
	$("textcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/textcolorbtn_rev.gif')";
	if(PLG.browser.msie7 || PLG.browser.msie){
		EDT.colorpicker.open(MESSAGE.PROPERTYTEXTCOLOR, $("textcolorbtn").offsetLeft, $("controlpanel_bar4").offsetTop + $("textcolorbtn").offsetTop + $("textcolorbtn").offsetHeight, PLG.getSpriteContents(PLG.selection.currentFixed).style.color);
	}
	else{
		EDT.colorpicker.open(MESSAGE.PROPERTYTEXTCOLOR, $("textcolorbtn").offsetLeft, $("textcolorbtn").offsetTop + $("textcolorbtn").offsetHeight, PLG.getSpriteContents(PLG.selection.currentFixed).style.color);
	}
};

EDT.colorpicker.toggleBg = function() {
	EDT.colorpicker.reset();

	if(EDT.colorpicker.mode == EDT.PICKER_BG){
		EDT.colorpicker.mode = EDT.PICKER_CLOSE;
		return;
	}

	EDT.colorpicker.mode = EDT.PICKER_BG;
	$("bgcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/bgcolorbtn_rev.gif')";
	if(PLG.browser.msie7 || PLG.browser.msie){
		EDT.colorpicker.open(MESSAGE.PROPERTYBGCOLOR, $("bgcolorbtn").offsetLeft, $("controlpanel_bar4").offsetTop + $("bgcolorbtn").offsetTop + $("bgcolorbtn").offsetHeight, PLG.getSpriteContents(PLG.selection.currentFixed).style.backgroundColor);
	}
	else{
		EDT.colorpicker.open(MESSAGE.PROPERTYBGCOLOR, $("bgcolorbtn").offsetLeft, $("bgcolorbtn").offsetTop + $("bgcolorbtn").offsetHeight, PLG.getSpriteContents(PLG.selection.currentFixed).style.backgroundColor);
	}
};

EDT.colorpicker.toggleLine = function() {
	EDT.colorpicker.reset();

	if(EDT.colorpicker.mode == EDT.PICKER_LINE){
		EDT.colorpicker.mode = EDT.PICKER_CLOSE;
		return;
	}

	EDT.colorpicker.mode = EDT.PICKER_LINE;
	$("linecolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn_rev.gif')";

	var contents = PLG.getSpriteContents(PLG.selection.currentFixed);
	var col = contents.style.borderTopColor;
	if(PLG.selection.currentFixed.id.match(/_link$/)){
		contents.innerHTML.match(/draw\('shape,arrow,(.+?),(.+?),(.+?),(.+?),(.+?),(.+?),(.+?)'\)/);
		col = RegExp.$3;
	}
	if(PLG.browser.msie7 || PLG.browser.msie){
		EDT.colorpicker.open(MESSAGE.PROPERTYLINECOLOR, $("linecolorbtn").offsetLeft, $("controlpanel_bar4").offsetTop + $("linecolorbtn").offsetTop + $("linecolorbtn").offsetHeight, col);
	}
	else{
		EDT.colorpicker.open(MESSAGE.PROPERTYLINECOLOR, $("linecolorbtn").offsetLeft, $("linecolorbtn").offsetTop + $("linecolorbtn").offsetHeight, col);
	}
};

EDT.colorpicker.toggleDrawing = function() {
	EDT.colorpicker.reset();

	if(EDT.colorpicker.mode == EDT.PICKER_DRAWING){
		EDT.colorpicker.mode = EDT.PICKER_CLOSE;
		return;
	}

	var top = $("controlpanel").offsetHeight;
	var left = PLG.getInnerWidth() - EDT.colorpicker.WIDTH - 2;
	EDT.colorpicker.mode = EDT.PICKER_DRAWING;
	$("drawcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn_rev.gif')";
	EDT.colorpicker.open("", left, top, "#000000");
};

// -----------------------------------------------------------------------------------------------
// Utilities

EDT.getArrowSrcDstFromSpriteID = function(id){
	var idobj = null;
	if(id.match(/^(.+)_link$/)){
		var sprStr = RegExp.$1;
		var sprArray = sprStr.split("_");
		var srcid = "";
		var dstid = "";
		if(sprArray.length == 6){
			srcid = sprArray[0] + "_" + sprArray[1] + "_" + sprArray[2];
			dstid = sprArray[3] + "_" + sprArray[4] + "_" + sprArray[5];
		}
		else if(sprArray.length == 4){
			srcid = sprArray[0];
			if(sprArray[1].match(/spr/)){
				dstid = sprArray[1] + "_" + sprArray[2] + "_" + sprArray[3];
			}
			else{
				srcid += "_" + sprArray[1] + "_" + sprArray[2];
				dstid = sprArray[3];
			}
		}
		else if(sprArray.length == 2){
			srcid = sprArray[0];
			dstid = sprArray[1];
		}

		idobj = {};
		idobj.src = srcid;
		idobj.dst = dstid;
	}
	return idobj;
}

EDT.min = function(a, b, c) {
	var v;
	if(a <= b){
		v = a;
	}
	else{
		v = b;
	}
	if(c <= v){
		v = c;
	}
	return v;
};

EDT.max = function(a, b, c) {
	var v;
	if(a >= b){
		v = a;
	}
	else{
		v = b;
	}
	if(c >= v){
		v = c;
	}
	return v;
};

EDT.hexMatrix = {
	"0" : "0",
	"1" : "1",
	"2" : "2",
	"3" : "3",
	"4" : "4",
	"5" : "5",
	"6" : "6",
	"7" : "7",
	"8" : "8",
	"9" : "9",
	"a" : "10",
	"b" : "11",
	"c" : "12",
	"d" : "13",
	"e" : "14",
	"f" : "15"
};

EDT.hex2dec = function(h) {
	return parseInt(EDT.hexMatrix[h.charAt(0).toLowerCase()]) * 16 + parseInt(EDT.hexMatrix[h.charAt(1).toLowerCase()]);
};

EDT.rgb2hex = function(r, g, b) {
	r = parseInt(r);
	g = parseInt(g);
	b = parseInt(b);
	var rr = r.toString(16);
	if(rr.length == 1){
		rr = "0" + rr;
	}
	var gg = g.toString(16);
	if(gg.length == 1){
		gg = "0" + gg;
	}
	var bb = b.toString(16);
	if(bb.length == 1){
		bb = "0" + bb;
	}
	return rr + gg + bb;
};

EDT.hsv2rgb = function(h, s, v) {
	var i, f, p, q, t;
	var r, g, b;
	if(s === 0){
		r = g = b = Math.round(v * 255);
		return r + "," + g + "," + b;
	}
	else{
		h *= 6;
		i = Math.floor(h);
		f = h - i;
		p = v * (1 - s);
		q = v * (1 - s * f);
		t = v * (1 - s * (1 - f));
		if(i == 6){
			i = 0;
		}
		switch(i){
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			default:
				r = v;
				g = p;
				b = q;
				break;
		}
		return Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255);
	}
};

EDT.rgb2hsv = function(r, g, b) {
	var h, s;
	r /= 255;
	g /= 255;
	b /= 255;
	var minV = EDT.min(r, g, b);
	var maxV = EDT.max(r, g, b);
	var v = maxV;
	var d = maxV - minV;
	if(maxV !== 0){
		s = d / maxV;
	}
	else{
		s = 0;
		h = 0;
		return h + "," + s + "," + v;
	}
	if(d === 0){
		h = 0;
	}
	else if(r == maxV){
		h = (g - b) / d;
	}
	else if(g == maxV){
		h = 2 + (b - r) / d;
	}
	else{
		h = 4 + (r - g) / d;
	}
	h *= 60;
	if(h < 0){
		h += 360;
	}
	return h / 360.0 + "," + s + "," + v;
};

EDT.isDefaultSprite = function(sprite) {
	var elm = PLG.getSpriteContents(sprite);
	if(elm.innerHTML.match(/^<br\/?>\n?New sprite[\n\s]?<br\/?>/i) 
		 || elm.innerHTML.match(/^<br\/?>\s?\n?<div.+?>New sprite<\/div>[\n\s]?<br\/?>/i)
		 || elm.innerHTML.match(/^<br\/?>\n?New comment[\n\s]?<br\/?>/i) 
		 || elm.innerHTML.match(/^<br\/?>\s\n?<div.+?>New comment<\/div>[\n\s]?<br\/?>/i)){
		return true;
	}
	else{
		return false;
	}
};

EDT.getValidInnerHtmlForDrawing = function(tmpHTML) {
	// In the drawing sprite, innerHTML must be reset because attributes in
	// canvas are not quoted validly in IE, "<!--" is not included in Opera,
	// <canvas> is not closed in Safari.
	tmpHTML.match(/<canvas.+width=["']?(.+?)["'> ]/i);
	var canvasWidth = RegExp.$1;
	tmpHTML.match(/<canvas.+height=["']?(.+?)["'> ]/i);
	var canvasHeight = RegExp.$1;
	tmpHTML.match(/<canvas.+id=["']?(.+?)["'> ]/i);
	var canvasID = RegExp.$1;
	tmpHTML.match(/(PLG.draw\(.+?\);)/i);
	var drawCommandStr = RegExp.$1;
	tmpHTML = "<canvas id='" + canvasID + "' width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas><script type='text/javascript'>\n<!--\n" + drawCommandStr + "\n// -->\n</script>";
	return tmpHTML;
};

EDT.restoreHashes = function() {
	PARAM.sprites = eval('(' + PLG.orgSprites + ')');
	PARAM.groups = eval('(' + PLG.orgGroups + ')');
};

EDT.backupHashes = function() {
	PLG.orgSprites = PARAM.sprites.toJSONString();
	PLG.orgGroups = PARAM.groups.toJSONString();
};

// -----------------------------------------------------------------------------------------------
// Draw guide lines

EDT.rebuildYoungerArray = function() {
	for(var id in PARAM.sprites){
		if(id.match(/^spr.+$/)){
			if(PARAM.sprites[id].margin_s && PARAM.sprites[id].margin_s.younger){
				delete(PARAM.sprites[id].margin_s.younger);
			}
		}
	}
	for(var id in PARAM.groups){
		if(id.match(/^grp.+$/)){
			if(PARAM.groups[id].margin_s && PARAM.groups[id].margin_s.younger){
				delete(PARAM.groups[id].margin_s.younger);
			}
		}
	}

	for(var sid in PARAM.sprites){
		if(sid.match(/^spr.+$/)){
			if(PARAM.sprites[sid].margin_s && PARAM.sprites[sid].margin_s.elder && PARAM.sprites[sid].margin_s.elder !== ""){
				var eid = PARAM.sprites[sid].margin_s.elder;
				var hash = null;
				if(eid.match(/^spr.+$/)){
					hash = PARAM.sprites;
				}
				else if(eid.match(/^grp.+$/)){
					hash = PARAM.groups;
				}
				else{
					continue;
				}

				if(!hash[eid]){
					delete PARAM.sprites[sid].margin_s;
					continue;
				}
				if(!hash[eid].margin_s){
					hash[eid].margin_s = {};
				}
				if(!hash[eid].margin_s.younger){
					hash[eid].margin_s.younger = [];
				}
				hash[eid].margin_s.younger.push(sid);
			}
		}
	}

	for(var gid in PARAM.groups){
		if(gid.match(/^grp.+$/)){
			if(PARAM.groups[gid].margin_s && PARAM.groups[gid].margin_s.elder && PARAM.groups[gid].margin_s.elder !== ""){
				var eid = PARAM.groups[gid].margin_s.elder;
				var hash = null;
				if(eid.match(/^spr.+$/)){
					hash = PARAM.sprites;
				}
				else if(eid.match(/^grp.+$/)){
					hash = PARAM.groups;
				}
				else{
					continue;
				}

				if(!hash[eid]){
					delete PARAM.groups[gid].margin_s;
					continue;
				}

				if(!hash[eid].margin_s){
					hash[eid].margin_s = {};
				}
				if(!hash[eid].margin_s.younger){
					hash[eid].margin_s.younger = [];
				}
				hash[eid].margin_s.younger.push(gid);
			}
		}
	}
};

EDT.drawSiblingMargin = function(id) {
	var hash = null;
	if(id.match(/^spr.+$/)){
		hash = PARAM.sprites;
	}
	else if(id.match(/^grp.+$/)){
		hash = PARAM.groups;
	}	
	while(hash[id].margin_s && hash[id].margin_s.elder && hash[id].margin_s.elder !== ""){
		if(hash[id].margin_s.elder == "root"){
			break;
		}
		id = hash[id].margin_s.elder;
		if(id.match(/^spr.+$/)){
			hash = PARAM.sprites;
		}
		else if(id.match(/^grp.+$/)){
			hash = PARAM.groups;
		}
	}
	EDT.drawYoungerMargin(id);
};

EDT.drawYoungerMargin = function(id) {

	if(PLG.canvasOK){
		var hash = null;
		if(id.match(/^spr.+$/)){
			hash = PARAM.sprites;
		}
		else if(id.match(/^grp.+$/)){
			hash = PARAM.groups;
		}
		else{
			return;
		}

		if(!hash[id].margin_s){
			return;
		}

		if(hash[id].margin_s && hash[id].margin_s.younger && hash[id].margin_s.younger.length > 0){
			for(var i = 0;i < hash[id].margin_s.younger.length; i++){
				EDT.drawYoungerMargin(hash[id].margin_s.younger[i]);

				PLG.drawctx.strokeStyle = EDT.COLOR_GUIDEARROW;
				PLG.drawctx.lineWidth = 3;
				
				var yid = hash[id].margin_s.younger[i];
				var yhash = null;
				if(yid.match(/^spr.+$/)){
					yhash = PARAM.sprites;
				}
				else if(yid.match(/^grp.+$/)){
					yhash = PARAM.groups;
				}	

				var startx = -PLG.viewPositionX + yhash[yid].x + Math.round(yhash[yid].width / 2);
				var endx = -PLG.viewPositionX + hash[id].x + Math.round(hash[id].width / 2);
				if(PARAM.page_type == "map"){
					startx += Math.round(PLG.getInnerWidth() / 2);
					endx += Math.round(PLG.getInnerWidth() / 2);
				}
				var starty = 0;
				var endy = 0;

				var yoffset = 0;

				if(yhash[yid].margin_s.position == "TB"){
					if($("spritemenu").offsetTop + $("spritemenu").offsetHeight == hash[id].y){
						yoffset = - $("spritemenu").offsetHeight;
					}
					starty =  -PLG.viewPositionY + yhash[yid].y + yhash[yid].height;
					endy = yoffset - PLG.viewPositionY + hash[id].y;
				}
				else{
					if($("spritemenu").offsetTop + $("spritemenu").offsetHeight == yhash[yid].y){
						yoffset = - $("spritemenu").offsetHeight;
					}
					starty = yoffset - PLG.viewPositionY + yhash[yid].y;
					endy = -PLG.viewPositionY + hash[id].y + hash[id].height;
				}

				if(PARAM.page_type == "map"){
					starty += Math.round(PLG.getInnerHeight() / 2);
					endy += Math.round(PLG.getInnerHeight() / 2);
				}
				var srcControlX = startx;
				var dstControlX = endx;

				var srcControlY = 0;
				var dstControlY = 0;
				if(yhash[yid].margin_s.position == "TB"){
//					srcControlY = starty + Math.abs(Math.round((endy - starty) / 3));
					srcControlY = starty;
					dstControlY = endy - Math.abs(Math.round((endy - starty) / 3));
				}
				else{
//					srcControlY = starty - Math.abs(Math.round((endy - starty) / 3));
					srcControlY = starty;
					dstControlY = endy + Math.abs(Math.round((endy - starty) / 3));
				}

				var ax, ay, ax2, ay2;
				var arrowx = 5;
//				var arrowy = 15;
				var arrowy = 10;
				var arrowx2 = -arrowx;
				var arrowy2 = arrowy;
				if(yhash[yid].margin_s.position == "TB"){
					var width = endx - startx;
					var height = endy - starty;
					var length = Math.sqrt(width*width + height*height);
					var cos = height / length;
					var sin = - width / length;	
					ax = Math.round(arrowx*cos-arrowy*sin);
					ay = -Math.round(arrowx*sin+arrowy*cos);
					ax2 = Math.round(arrowx2*cos-arrowy2*sin);
					ay2 = -Math.round(arrowx2*sin+arrowy2*cos);
				}
				else if(yhash[yid].margin_s.position == "BT"){
					var width = endx - startx;
					var height = starty - endy;
					
					var length = Math.sqrt(width*width + height*height);
					var cos = height / length;
					var sin = - width / length;	
					ax = Math.round(arrowx*cos-arrowy*sin);
					ay = Math.round(arrowx*sin+arrowy*cos);
					ax2 = Math.round(arrowx2*cos-arrowy2*sin);
					ay2 = Math.round(arrowx2*sin+arrowy2*cos);
				}

				PLG.drawctx.beginPath();

				PLG.drawctx.moveTo(startx,starty);
				PLG.drawctx.lineTo(startx+ax,starty-ay);
				PLG.drawctx.lineTo(startx+ax2,starty-ay2);
				PLG.drawctx.lineTo(startx,starty);

				PLG.drawctx.lineCap = "round";
				PLG.drawctx.lineJoin = "round";

				PLG.drawctx.moveTo(startx, starty);
				PLG.drawctx.bezierCurveTo(srcControlX, srcControlY, dstControlX, dstControlY, endx, endy);
				PLG.drawctx.stroke();

				PLG.drawctx.beginPath();
				PLG.drawctx.fillStyle = PLG.drawctx.strokeStyle;
				PLG.drawctx.arc(endx, endy, 4, 0, Math.PI * 2, true);
				PLG.drawctx.fill();
			}
		}
	}
};

EDT.clearCanvas = function() {
	if(PLG.canvasOK){
		PLG.drawctx.clearRect(0, 0, PLG.drawcanvas.offsetWidth, PLG.drawcanvas.offsetHeight);
	}
};

// -----------------------------------------------------------------------------------------------
// Modal dialog

EDT.modalDialogOnMouseDown = function(e) {
	// Check whether mouse is on modal dialog area
	if(EDT.drawingtool.mode != EDT.DRAWINGTOOL_CLOSE){
		var dtool = $("drawingtool");
		var mouseX = 0;
		var mouseY = 0;
		mouseX = PLG.mouseXonBrowser(e);
		mouseY = PLG.mouseYonBrowser(e);

		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}

		if(mouseX >= dtool.offsetLeft && mouseX < dtool.offsetLeft + dtool.offsetWidth && mouseY >= dtool.offsetTop && mouseY < dtool.offsetTop + dtool.offsetHeight){
			if(!EDT.drawingtool.canPick){
				var x = mouseX - dtool.offsetLeft;
				var y = mouseY - dtool.offsetTop;
				if(y < $("drawingtooltitle").offsetHeight){
					// nop
				}
			}
			return 1;
		}
	}

	if(EDT.colorpicker.mode != EDT.PICKER_CLOSE){
		var picker = $("colorpicker");
		var mouseX = 0;
		var mouseY = 0;
		mouseX = PLG.mouseXonBrowser(e);
		mouseY = PLG.mouseYonBrowser(e);

		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}

		if(mouseX >= picker.offsetLeft && mouseX < picker.offsetLeft + picker.offsetWidth && mouseY >= picker.offsetTop && mouseY < picker.offsetTop + picker.offsetHeight){
			if(!EDT.colorpicker.canPick){
				var x = mouseX - picker.offsetLeft;
				var y = mouseY - picker.offsetTop;
				if(y < $("colorpickertitle").offsetHeight){
					// nop
				}
				else if((x >= $("svarea").offsetLeft && x < $("svarea").offsetLeft + $("svarea").offsetWidth && y >= $("svarea").offsetTop && y < $("svarea").offsetTop + $("svarea").offsetHeight) || (x >= $("huearea").offsetLeft && x < $("huearea").offsetLeft + $("huearea").offsetWidth && y >= $("huearea").offsetTop && y < $("huearea").offsetTop + $("huearea").offsetHeight)){
					EDT.colorpicker.canPick = true;
					EDT.colorpicker.pick(x, y);
				}
			}
			return 1;
		}
	}

	if(EDT.plugin.mode != EDT.PLUGIN_CLOSE){
		return 1;
	}
	
	if(EDT.uploader.mode != EDT.UPLOADER_CLOSE){
		return 1;
	}
	
	if(EDT.editor.mode != EDT.EDITOR_CLOSE){
		var editor = $("editor");
		var x = PLG.mouseXonWorld(e);
		var y = PLG.mouseYonWorld(e);
		if(x > editor.offsetLeft && x < editor.offsetLeft + editor.offsetWidth && y > editor.offsetTop && y < editor.offsetTop + editor.offsetHeight){
			return 1;
		}
	}
	return -1;
};

EDT.moveModalDialog = function(e, dialog, dialogObj) {
	var minX = 0;
	var minY = 0;
	var maxX = 0;
	var maxY = 0;

	var left = 0;
	var top = 0;
	if(dialog.parentNode.id == "positlogbody"){
		minX = dialog.offsetWidth;
		maxX = PLG.getInnerWidth() - dialog.offsetWidth - 3;
		minY = 0;
		maxY = PLG.getInnerHeight() - dialog.offsetHeight - 3;

		left = PLG.mouseXonBrowser(e) - dialogObj.moveOffsetX;
		top = PLG.mouseYonBrowser(e) - dialogObj.moveOffsetY;
	}
	else{
		minX = PLG.browserXtoWorldX(0, true) + 60;
		maxX = PLG.browserXtoWorldX(PLG.getInnerWidth(), true) - 60;
		minY = PLG.browserYtoWorldY($("controlpanel").offsetHeight, true);
		maxY = PLG.browserYtoWorldY(PLG.getInnerHeight() - $("editor-control").offsetHeight, true);

		left = PLG.browserXtoWorldX(PLG.mouseXonBrowser(e) - dialogObj.moveOffsetX, true);
		top = PLG.browserYtoWorldY(PLG.mouseYonBrowser(e) - dialogObj.moveOffsetY, true);
	}

	if(left + dialog.offsetWidth < minX){
		left = minX - dialog.offsetWidth;
	}
	else if(left > maxX){
		left = maxX;
	}

	if(top < minY){
		top = minY;
	}
	else if(top > maxY){
		top = maxY;
	}

	dialog.style.left = left + "px";
	dialog.style.top = top + "px";
};

EDT.modalDialogOnMouseMove = function(e) {
	// Check whether mouse is on modal dialog area

	if(EDT.drawingtool.mode != EDT.DRAWINGTOOL_CLOSE){
		var mouseX = 0;
		var mouseY = 0;
		mouseX = PLG.mouseXonBrowser(e);
		mouseY = PLG.mouseYonBrowser(e);

		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}

		if(EDT.drawingtool.canMove){
			EDT.moveModalDialog(e, $("drawingtool"), EDT.drawingtool);
			return 1;
		}
	}


	if(EDT.colorpicker.mode != EDT.PICKER_CLOSE){
		var picker = $("colorpicker");
		var mouseX = 0;
		var mouseY = 0;
		mouseX = PLG.mouseXonBrowser(e);
		mouseY = PLG.mouseYonBrowser(e);

		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}

		if(EDT.colorpicker.canPick){
			var x = mouseX - picker.offsetLeft;
			var y = mouseY - picker.offsetTop;
			EDT.colorpicker.pick(x, y);
			return 1;
		}
		else if(EDT.colorpicker.canMove){
			EDT.moveModalDialog(e, picker, EDT.colorpicker);
			return 1;
		}
	}
	else if(EDT.editor.mode != EDT.EDITOR_CLOSE){
		if(EDT.editor.canMove){
			EDT.moveModalDialog(e, $("editor"), EDT.editor);
		}
		else{
			var x = PLG.mouseXonWorld(e);
			var y = PLG.mouseYonWorld(e);
			var editor = $("editor");
			if(x > editor.offsetLeft && x < editor.offsetLeft + editor.offsetWidth && y > editor.offsetTop && y < editor.offsetTop + editor.offsetHeight){
				return 1;
			}
		}
	}
	else if(EDT.plugin.mode != EDT.PLUGIN_CLOSE){
		if(EDT.plugin.canMove){
			EDT.moveModalDialog(e, $("plugin-dialog"), EDT.plugin);
		}
		return 1;
	}
	else if(EDT.uploader.mode != EDT.UPLOADER_CLOSE){
		if(EDT.uploader.canMove){
			EDT.moveModalDialog(e, $("uploader-dialog"), EDT.uploader);
		}
		return 1;
	}

	return -1;
};

// -----------------------------------------------------------------------------------------------
// Drawing

//EDT.spoit = function(spr) {
//	var contents = PLG.getSpriteContents(spr);
//};

EDT.drawingOnMouseUp = function() {
	PLG.prevMouseXonBrowser = 0;
	PLG.prevMouseYonBrowser = 0;
	if(EDT.pendownFlag && $("currentcolor")){
		EDT.colorpicker.setRecentColor($("currentcolor").style.backgroundColor);
	}
	EDT.pendownFlag = false;
	if(PLG.browser.mozes || PLG.browser.msie7 || PLG.browser.msie){
		$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
	}

};

EDT.drawingOnMouseDown = function(e) {
	PLG.prevMouseXonBrowser = PLG.mouseXonBrowser(e);
	PLG.prevMouseYonBrowser = PLG.mouseYonBrowser(e);

	if(PLG.prevMouseYonBrowser < $("controlpanel").offsetHeight){
		return;
	}

	EDT.pendownFlag = true;
	EDT.pendownFirstFlag = true;

	PLG.prevMouseXonWorld = PLG.mouseXonWorld(e);
	PLG.prevMouseYonWorld = PLG.mouseYonWorld(e);
};

EDT.drawingOnMouseMove = function(e) {
	if(EDT.pendownFlag){
		if(EDT.pendownFirstFlag){
			PLG.drawctx.lineCap = "round";
			PLG.drawctx.lineJoin = "round";
			var drawLineWidth = EDT.pensize * PLG.zoom;
			if(drawLineWidth < 0.5){
				drawLineWidth = 0.5;
			}
			PLG.drawctx.lineWidth = drawLineWidth;
			PLG.drawctx.strokeStyle = EDT.penColor;

			EDT.drawRecord.push("l");
			EDT.drawRecord.push("s" + EDT.pensize);
			EDT.drawRecord.push("c" + EDT.penColor);
			EDT.pendownFirstFlag = false;
		}
		var prevX = parseInt(PLG.prevMouseXonBrowser);
		var prevY = parseInt(PLG.prevMouseYonBrowser);
		var prevXzoom = parseInt(PLG.prevMouseXonWorld);
		var prevYzoom = parseInt(PLG.prevMouseYonWorld);

		PLG.drawctx.beginPath();
		PLG.drawctx.moveTo(prevX, prevY);
		EDT.drawRecord.push(prevXzoom);
		EDT.drawRecord.push(prevYzoom);

		if(EDT.drawCanvasLeft > prevXzoom - Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasLeft = prevXzoom - Math.ceil(EDT.pensize / 2);
		}
		if(EDT.drawCanvasRight < prevXzoom + Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasRight = prevXzoom + Math.ceil(EDT.pensize / 2);
		}
		if(EDT.drawCanvasTop > prevYzoom - Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasTop = prevYzoom - Math.ceil(EDT.pensize / 2);
		}
		if(EDT.drawCanvasBottom < prevYzoom + Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasBottom = prevYzoom + Math.ceil(EDT.pensize / 2);
		}

		var nextX = PLG.mouseXonBrowser(e);
		var nextY = PLG.mouseYonBrowser(e);
		var nextXzoom = PLG.mouseXonWorld(e);
		var nextYzoom = PLG.mouseYonWorld(e);

		PLG.drawctx.lineTo(nextX, nextY);
		PLG.drawctx.stroke();

		EDT.drawRecord.push(nextXzoom);
		EDT.drawRecord.push(nextYzoom);
		if(EDT.drawCanvasLeft > nextXzoom - Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasLeft = nextXzoom - Math.ceil(EDT.pensize / 2);
		}
		if(EDT.drawCanvasRight < nextXzoom + Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasRight = nextXzoom + Math.ceil(EDT.pensize / 2);
		}
		if(EDT.drawCanvasTop > nextYzoom - Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasTop = nextYzoom - Math.ceil(EDT.pensize / 2);
		}
		if(EDT.drawCanvasBottom < nextYzoom + Math.ceil(EDT.pensize / 2)){
			EDT.drawCanvasBottom = nextYzoom + Math.ceil(EDT.pensize / 2);
		}
	}

	PLG.prevMouseXonBrowser = PLG.mouseXonBrowser(e);
	PLG.prevMouseYonBrowser = PLG.mouseYonBrowser(e);
	PLG.prevMouseXonWorld = PLG.mouseXonWorld(e);
	PLG.prevMouseYonWorld = PLG.mouseYonWorld(e);
};

EDT.undoDraw = function() {
	EDT.drawCanvasLeft = Number.MAX_VALUE;
	EDT.drawCanvasRight = -Number.MAX_VALUE;
	EDT.drawCanvasTop = Number.MAX_VALUE;
	EDT.drawCanvasBottom = -Number.MAX_VALUE;

	if(EDT.drawRecord.length > 0){
		for(var i = EDT.drawRecord.length - 1;i >= 0; i--){
			if(EDT.drawRecord[i] == "l"){
				EDT.drawRecord.pop();
				break;
			}
			else{
				EDT.drawRecord.pop();
			}
		}
	}

	if(PLG.canvasOK){
		PLG.drawctx.clearRect(0, 0, PLG.drawcanvas.offsetWidth, PLG.drawcanvas.offsetHeight);
		for(var i = 0;i < EDT.drawRecord.length; i++){
			if(EDT.drawRecord[i] == "l"){
				if(i !== 0){
					PLG.drawctx.stroke();
				}
				i++;
				var drawRecordStr = EDT.drawRecord[i];
				drawRecordStr.match(/^s(.+)$/);

				var trueLineWidth = parseFloat(RegExp.$1);
				var drawLineWidth = parseFloat(RegExp.$1) * PLG.zoom;
				if(drawLineWidth < 0.5){
					drawLineWidth = 0.5;
				}
				PLG.drawctx.lineWidth = drawLineWidth;
				i++;

				drawRecordStr = EDT.drawRecord[i];
				drawRecordStr.match(/^c(.+)$/);
				PLG.drawctx.strokeStyle = RegExp.$1;
				i++;

				PLG.drawctx.beginPath();
				var x = PLG.worldXtoBrowserX(parseInt(EDT.drawRecord[i]));
				var y = PLG.worldYtoBrowserY(parseInt(EDT.drawRecord[i + 1]));
				PLG.drawctx.moveTo(x, y);
				if(EDT.drawCanvasLeft > parseInt(EDT.drawRecord[i]) - Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasLeft = parseInt(EDT.drawRecord[i]) - Math.ceil(trueLineWidth / 2);
				}
				if(EDT.drawCanvasRight < parseInt(EDT.drawRecord[i]) + Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasRight = parseInt(EDT.drawRecord[i]) + Math.ceil(trueLineWidth / 2);
				}
				if(EDT.drawCanvasTop > parseInt(EDT.drawRecord[i + 1]) - Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasTop = parseInt(EDT.drawRecord[i + 1]) - Math.ceil(trueLineWidth / 2);
				}
				if(EDT.drawCanvasBottom < parseInt(EDT.drawRecord[i + 1]) + Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasBottom = parseInt(EDT.drawRecord[i + 1]) + Math.ceil(trueLineWidth / 2);
				}
			}
			else{
				var x = PLG.worldXtoBrowserX(parseInt(EDT.drawRecord[i]));
				var y = PLG.worldYtoBrowserY(parseInt(EDT.drawRecord[i + 1]));
				PLG.drawctx.lineTo(x, y);
				if(EDT.drawCanvasLeft > parseInt(EDT.drawRecord[i]) - Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasLeft = parseInt(EDT.drawRecord[i]) - Math.ceil(trueLineWidth / 2);
				}
				if(EDT.drawCanvasRight < parseInt(EDT.drawRecord[i]) + Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasRight = parseInt(EDT.drawRecord[i]) + Math.ceil(trueLineWidth / 2);
				}
				if(EDT.drawCanvasTop > parseInt(EDT.drawRecord[i + 1]) - Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasTop = parseInt(EDT.drawRecord[i + 1]) - Math.ceil(trueLineWidth / 2);
				}
				if(EDT.drawCanvasBottom < parseInt(EDT.drawRecord[i + 1]) + Math.ceil(trueLineWidth / 2)){
					EDT.drawCanvasBottom = parseInt(EDT.drawRecord[i + 1]) + Math.ceil(trueLineWidth / 2);
				}
			}
			i++;
		}
		// For safari3
		if(EDT.drawRecord.length > 0){
			PLG.drawctx.stroke();
		}
	}
};

EDT.drawingBtnOnMouseDown = function() {
	if(PLG.state == PLG.STATES.EDITING || PLG.state == PLG.STATES.EDITINGSELECTED){
		return;
	}

	var drawingBtn = $("drawingbtn");

	if(EDT.currenttool != EDT.TOOL_DRAWING){
		if(EDT.currenttool == EDT.TOOL_ARROWLINK){
			EDT.arrowBtnOnMouseDown();
		}

		if(EDT.canDrop){
			EDT.directDropBtnOnMouseDown();
		}

		EDT.currenttool = EDT.TOOL_DRAWING;

		PLG.selection.clear();
		EDT.view.redraw();

		EDT.colorpicker.toggleDrawing();
		EDT.drawingtool.open();

		drawingBtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/drawingbtn_rev.gif')";
		PLG.state = PLG.STATES.WORKING;

		PLG.drawcanvas.style.zIndex = PLG.ZIND.DRAWCANVASFRONT;
		PLG.drawcanvas.style.display = "block";
		PLG.drawcanvas.style.left = PLG.browserXtoWorldX(0, true) + "px";
		PLG.drawcanvas.style.top = PLG.browserYtoWorldY(0, true) + "px";

		EDT.drawCanvasLeft = Number.MAX_VALUE;
		EDT.drawCanvasRight = -Number.MAX_VALUE;
		EDT.drawCanvasTop = Number.MAX_VALUE;
		EDT.drawCanvasBottom = -Number.MAX_VALUE;

		// You must not set alpha of drawcanvas on IEs
		// if(PLG.browser.msie || PLG.browser.msie7){
		// PLG.drawcanvas.style.filter = "alpha(opacity=100)";
		// }
		// else{
		// PLG.drawcanvas.style.opacity = 1.0;
		// }

		if(PLG.browser.msie || PLG.browser.msie7){
			var imgArray = document.getElementsByTagName("img");
			for(var i=0; i<imgArray.length; i++){
				if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
					imgArray[i].style.cursor = "crosshair";
				}
			}
			var canvasArray = document.getElementsByTagName("canvas");
			for(var i=0; i<canvasArray.length; i++){
				if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
					canvasArray[i].style.cursor = "crosshair";
				}
			}
		}

		if(PLG.browser.mozes){
			// On IEs, custom cursor is displayed only when a mouse cursor is on
			// drawing lines.
			// So, don't use custom cursor here on IEs.
			$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/drawingpen.cur), default";
			PLG.drawcanvas.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/drawingpen.cur), default";
		}
		else{
			$("spritesworld").style.cursor = "crosshair";
			PLG.drawcanvas.style.cursor = "crosshair";
		}
		PLG.disableSelection();
		PLG.mapcanvas.style.display = "none";
		PLG.viewcanvas.style.display = "none";

	}
	else{
		drawingBtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/drawingbtn.gif')";

		EDT.currenttool = EDT.TOOL_NORMAL;

//		EDT.colorpicker.close();
		EDT.colorpicker.saveColorProfile();
		EDT.colorpicker.reset();
		EDT.colorpicker.mode = EDT.PICKER_CLOSE;

		EDT.drawingtool.close();

		EDT.view.redraw();


		if(PLG.browser.msie || PLG.browser.msie7){
			var imgArray = document.getElementsByTagName("img");
			for(var i=0; i<imgArray.length; i++){
				if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
					imgArray[i].style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
				}
			}
			var canvasArray = document.getElementsByTagName("canvas");
			for(var i=0; i<canvasArray.length; i++){
				if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
					canvasArray[i].style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
				}
			}
		}

		if(PLG.browser.mozes){
			$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
			PLG.drawcanvas.style.cursor = "";
		}
		else{
			$("spritesworld").style.cursor = "auto";
			PLG.drawcanvas.style.cursor = "";
		}


		PLG.drawcanvas.style.zIndex = PLG.ZIND.DRAWCANVASBACK;
		PLG.drawctx.clearRect(0, 0, PLG.drawcanvas.offsetWidth, PLG.drawcanvas.offsetHeight)
//		PLG.drawcanvas.style.display = "none";

		// Create sprite
		if(EDT.drawRecord.length > 0){
			var newRecord = [];
			// var offset = 18;
			var offset = 2;
			var rect = {};
			rect.left = EDT.drawCanvasLeft - offset;
			rect.top = EDT.drawCanvasTop - offset;
			for(var i = 0;i < EDT.drawRecord.length; i++){
				if(EDT.drawRecord[i] != "l"){
					newRecord.push(parseInt(EDT.drawRecord[i]) - parseInt(EDT.drawCanvasLeft) + offset);
				}
				else{
					newRecord.push(EDT.drawRecord[i]);// l
					i++;
					newRecord.push(EDT.drawRecord[i]);// s
					i++;
					newRecord.push(EDT.drawRecord[i]);// c
					i++;
					newRecord.push(parseInt(EDT.drawRecord[i]) - parseInt(EDT.drawCanvasLeft) + offset);
				}
				i++;
				newRecord.push(parseInt(EDT.drawRecord[i]) - parseInt(EDT.drawCanvasTop) + offset);
			}
			var newSpriteID = EDT.generateNewID("spr", PARAM.sprites);
			var canvasWidth = EDT.drawCanvasRight - EDT.drawCanvasLeft + offset * 2;
			var contents = "<canvas width='" + canvasWidth + "' height='" + (EDT.drawCanvasBottom - EDT.drawCanvasTop + offset * 2) + "' id='" + newSpriteID + "_canvas'></canvas><script type='text/javascript'>\n<!--\nPLG.draw('" + newSpriteID + "_canvas," + newRecord.join() + "');\n// -->\n</script>";

			if(canvasWidth > EDT.SPRITEWIDTH_MIN){
				rect.width = (EDT.drawCanvasRight - EDT.drawCanvasLeft) + offset * 2;
			}
			else{
				rect.width = EDT.SPRITEWIDTH_MIN;
			}
			
			rect.height = EDT.drawCanvasBottom - EDT.drawCanvasTop + offset * 2;

			EDT.drawRecord = [];

			EDT.createSprite(EDT.SAVE_NEWDRAWINGSPRITE, contents, newSpriteID, rect);
		}
		PLG.mapcanvas.style.display = "block";
		PLG.viewcanvas.style.display = "block";

	}
};

// -----------------------------------------------------------------------------------------------
// Move sprite

EDT.moverOnMouseDown = function() {
	if(PLG.selection.currentFixed.id.match(/_link$/)){
		PLG.ignoreMouseDown = true;
		$("controlresult").innerHTML = MESSAGE.CANNOTMOVE;
		return;
	}

	if(PARAM.sprites[PLG.selection.currentFixed.id].template !== undefined &&PARAM.sprites[PLG.selection.currentFixed.id].template == 1){
		PLG.ignoreMouseDown = true;
		$("controlresult").innerHTML = MESSAGE.CANNOTMOVE;
		return;
	}


	// Mask over iframes because they interferes moving.
	var mask = $("screenmask");
//	mask.style.left = PLG.browserXtoWorldX(0, true) + "px";
//	mask.style.top = PLG.browserYtoWorldY(0, true) + "px";
	mask.style.left = "0px";
	mask.style.top = "0px";
	mask.style.width = PLG.getInnerWidth() + "px";
	mask.style.height = PLG.getInnerHeight() + "px";
	mask.style.display = "block";


	PLG.state = PLG.STATES.MOVING;

	EDT.sumOfSpriteMoveX = 0;
	EDT.sumOfSpriteMoveY = 0;

	// drawcanvas interferes with spriteOnMouseOver event on a sprite
	// that has canvas element on IE
	if(PLG.canvasSpriteExists && (PLG.browser.msie || PLG.browser.msie7)){
//		PLG.drawcanvas.style.display = "none";
	}

	PLG.disableSelection();

	EDT.view.redraw();
};

// -----------------------------------------------------------------------------------------------
// Scale sprite

EDT.scalerOnMouseDown = function() {
	PLG.state = PLG.STATES.SCALING;

	var mask = $("screenmask");
//	mask.style.left = PLG.browserXtoWorldX(0, true) + "px";
//	mask.style.top = PLG.browserYtoWorldY(0, true) + "px";
	mask.style.left = "0px";
	mask.style.top = "0px";
	mask.style.width = PLG.getInnerWidth() + "px";
	mask.style.height = PLG.getInnerHeight() + "px";
	mask.style.display = "block";

	if(PLG.browser.safari){
		PLG.disableSelection();
	}
};

// -----------------------------------------------------------------------------------------------
// Cut/Copy/Paste/Alias

EDT.copySprite = function(deleted) {
	PLG.selection.calcRegion();

	var contents = PARAM.pageid + "&";

	var sprites = "";
	for(var i = 0;i < PLG.selection.length(); i++){
		var id = PLG.selection.array[i];
		if(PLG.selection.hash[id].fixed){
			sprites += id + ",";
		}
	}

	if(sprites !== ""){
		sprites = sprites.substr(0, sprites.length - 1);
	}
	contents += sprites + "&";

	var clipSprites = {};
	var clipGroups = {};
	var clipInnerHTML = {};
	var clipPlugin = {};
	var clipTag = {};

	for(var id in PLG.selection.allsprites){
		if(id.match(/^spr.+$/)){
			clipSprites[id] = {};
			
			if(PARAM.sprites[id].inlink){
				for(var inid in PARAM.sprites[id].inlink){
					if(!inid.match(/^spr.+$/)){
						continue;
					}
					if(PARAM.sprites[id].inlink[inid] == 1 && PLG.selection.allsprites[inid]){
						if(!clipSprites[id].inlink){
							clipSprites[id].inlink = {};
						}
						clipSprites[id].inlink[inid] = 1;
					}
				}
			}
			if(PARAM.sprites[id].outlink){
				for(var outid in PARAM.sprites[id].outlink){
					if(!outid.match(/^spr.+$/)){
						continue;
					}
					if(PARAM.sprites[id].outlink[outid] == 1 && PLG.selection.allsprites[outid]){
						if(!clipSprites[id].outlink){
							clipSprites[id].outlink = {};
						}
						clipSprites[id].outlink[outid] = 1;
					}
				}
			}

			clipSprites[id].display = PARAM.sprites[id].display;

			clipSprites[id].x = PARAM.sprites[id].x;
			clipSprites[id].y = PARAM.sprites[id].y;
			clipSprites[id].z = PARAM.sprites[id].z;
			clipSprites[id].width = PARAM.sprites[id].width;
			clipSprites[id].height = PARAM.sprites[id].height;

			clipSprites[id].borderWidth = PARAM.sprites[id].borderWidth;
			clipSprites[id].borderStyle = PARAM.sprites[id].borderStyle;
			clipSprites[id].padding = PARAM.sprites[id].padding;
			clipSprites[id].borderColor = escape(PARAM.sprites[id].borderColor);
			clipSprites[id].bgColor = escape(PARAM.sprites[id].bgColor);
			clipSprites[id].color = escape(PARAM.sprites[id].color);

			clipSprites[id].groupid = PARAM.sprites[id].groupid;
			clipSprites[id].isDrawing = PARAM.sprites[id].isDrawing;

			if(PARAM.sprites[id].tag){
				clipTag[id] = escape(PARAM.sprites[id].tag);
			}
			else{
				clipTag[id] = "";
			}
		
			if(PARAM.sprites[id].groupid){
				clipGroups[PARAM.sprites[id].groupid] = PARAM.groups[PARAM.sprites[id].groupid];
			}
			
			clipInnerHTML[id] = escape(PARAM.sprites[id].innerHTML);
			clipPlugin[id] = escape(PARAM.sprites[id].plugin);
		}
	}

	var leftOffset = PLG.selection.x;
	var topOffset = PLG.selection.y;
	contents += leftOffset + "," + topOffset + "&";

	contents += clipSprites.toJSONString() + "&";
	contents += clipGroups.toJSONString() + "&";
	contents += clipInnerHTML.toJSONString() + "&";
	contents += clipPlugin.toJSONString() + "&";
	contents += clipTag.toJSONString() + "&";


	if(deleted){
		contents += "true";
	}
	else{
		contents += "false";
	}

	PLG.setCookie("clip", contents, "/", 0);
};

EDT.cutSprite = function() {
	EDT.copySprite(true);
	EDT.deleteSprite(false);
};

EDT.isValidClip = function(clip) {
	var clipArray = clip.split("&");
	if(clipArray.length != 9){
		return false;
	}
	else{
		return true;
	}
};

EDT.pasteSprite = function(e, aliasFlag) {
	var clip = PLG.getCookie("clip");

	// Clear cookie to reduce communication traffic
	PLG.setCookie("clip", "", "/", 0);

	if(clip === undefined || clip === null || clip === ""){
		$("controlresult").innerHTML = "No clip";
		return;
	}

	if(!EDT.isValidClip(clip)){
		$("controlresult").innerHTML = "Invalid clip";
		return;
	}
	var clipArray = clip.split("&");

	var deleted = clipArray[8];
	if(deleted == "true" && aliasFlag !== undefined && aliasFlag){
		return;
	}

	var pageid = clipArray[0];
	var itemsArray = clipArray[1].split(",");
	var regionArray = clipArray[2].split(",");

	var srcSpritesHash = eval('(' + clipArray[3] + ')');
	var srcGroupsHash = eval('(' + clipArray[4] + ')');
	var srcInnerHtmlHash = eval('(' + clipArray[5] + ')');
	var srcPluginHash = eval('(' + clipArray[6] + ')');
	var srcTagHash = eval('(' + clipArray[7] + ')');

	// Save obj
	var saveObj = [];
	var index = 0;

	// Group obj
	var groupObj = {};

	// targetSprite is fixed (registered to PLG.selection.currentFixed) after
	// saving
	var targetSprite = null;
	var distanceFromTopLeft = Number.MAX_VALUE;

	// New sprite nodes which are append to spriteslist after saveSpriteOnLoaded
	var newSprites = [];

	// Dictionary from src item to dst item
	var dicGroups = {};
	var dicSprites = {};

	var newAuthor = PARAM.author;
	var public_password = "";
	var public_author = "";
	if(newAuthor == "public"){
		public_password = $("cp_publicpass").value;
		public_author = $("cp_publicauthor").value;

		if(public_author === ""){
			public_author = "public";
		}
		if(public_password !== ""){
			newAuthor = "&lt;" + public_author + "&gt;";
		}
		else{
			newAuthor = "[" + public_author + "]";
		}
	}

	while(itemsArray.length > 0){
		var id = itemsArray.pop();
		if(id.match(/^grp.+$/)){
			var newgid = EDT.generateNewID("grp", PARAM.groups);
			groupObj[newgid] = {};
			dicGroups[id] = newgid;
			if(srcGroupsHash[id].groupid){
				// Group "id" belongs a parent group
				// "srcGroupsHash[id].groupid".
				// Parent group is registered to dicGroups in advance
				// because this function parses groups from parent to children.
				var pgid = dicGroups[srcGroupsHash[id].groupid]
				// Add parent to child
				groupObj[newgid].groupid = pgid;
				// Add child to parent
				groupObj[pgid][newgid] = {};
			}
			// Add it to itemsArray to parse the group
			for(var itemid in srcGroupsHash[id]){
				if(itemid.match(/^spr.+$/) || itemid.match(/^grp.+$/)){
					itemsArray.push(itemid);
				}
			}
		}
		else if(id.match(/^spr.+$/)){
			// Save sprite
			saveObj[index] = {};
			var newsid = EDT.generateNewID("spr", PARAM.sprites);
			dicSprites[id] = newsid;

			var newSprite = PLG.createElm("div", newsid);
			if(PLG.browser.msie || PLG.browser.msie7){
				newSprite.setAttribute("className", "sprite");
				// IE cannot apply .css file here
				newSprite.style.cssText = "margin: 0px; padding: 0px; position: absolute; overflow: visible; cursor: auto;";
			}
			else{
				newSprite.setAttribute("class", "sprite");
			}

			$("spriteslist").appendChild(newSprite);

			// Set region
			var regionElm = PLG.createElm("div");
			if(PLG.browser.msie || PLG.browser.msie7){
				regionElm.setAttribute("className", "region");
				if(PLG.browser.msie){
					regionElm.style.cssText = "left: 0px; margin: 0px; border: 0px; padding: 1px; float: left; overflow: hidden";
				}
				else{
					regionElm.style.cssText = "left: 0px; margin: 0px; border: 0px; padding: 1px; float: left;";
				}
			}
			else{
				regionElm.setAttribute("class", "region");
			}
			regionElm.style.width = (srcSpritesHash[id].width - 2) + "px";

			newSprite.onmouseover = PLG.spriteOnMouseOver;
			newSprite.appendChild(regionElm);

			// Set contents
			var contents = PLG.createElm("div");
			regionElm.appendChild(contents);
			if(PLG.browser.msie || PLG.browser.msie7){
				contents.setAttribute("className", "contents");
			}
			else{
				contents.setAttribute("class", "contents");
			}
			contents.appendChild(document.createTextNode(""));
			var innerHTML = unescape(srcInnerHtmlHash[id]);
			// For canvas
			innerHTML = innerHTML.replace(id, newsid);
			innerHTML = innerHTML.replace(id, newsid);
			innerHTML = innerHTML.replace(id, newsid);
			if(srcSpritesHash[id].isDrawing){
				innerHTML = EDT.getValidInnerHtmlForDrawing(innerHTML);
			}
			contents.innerHTML = innerHTML;
			PLG.fixParagraph(contents);

			contents.style.borderWidth = srcSpritesHash[id].borderWidth + "px";
			contents.style.borderStyle = srcSpritesHash[id].borderStyle;
//			contents.style.padding = srcSpritesHash[id].padding + "px";
			PLG.setContentsPadding(contents, srcSpritesHash[id].padding);
			contents.style.borderColor = unescape(srcSpritesHash[id].borderColor);
			contents.style.backgroundColor = unescape(srcSpritesHash[id].bgColor);
			contents.style.color = unescape(srcSpritesHash[id].color);

			// Set info
			var infoElm = PLG.createElm("div");
			regionElm.appendChild(infoElm);
			if(PLG.browser.msie || PLG.browser.msie7){
				infoElm.style.cssText = "width: 100%; font-size: 80%; left: 0px; right: 0px; margin: 0px; padding: 0px; border: 0px;";
				infoElm.setAttribute("className", "info");
			}
			else{
				infoElm.setAttribute("class", "info");
			}

			if(PLG.zooming){
				newSprite.style.overflow = "hidden";
				contents.style.overflow = "hidden";
				PLG.getSpriteInfo(newSprite).style.overflow = "hidden";
			}

			// Set plugin
			var pluginElm = PLG.createElm("span");
			pluginElm.setAttribute("class", "plugin");
			pluginElm.appendChild(document.createTextNode(""));
			pluginElm.style.display = "none";
			if(PLG.browser.msie || PLG.browser.msie7){
				pluginElm.setAttribute("className", "plugin");
			}
			newSprite.appendChild(pluginElm);

			var pluginHTML = unescape(srcPluginHash[id]);
			var pluginHtmlEnc = "";

			// Alias
			if(aliasFlag !== undefined && aliasFlag){
				pluginHTML = "Alias," + pageid + "," + id + ";[[plugin]]";
				pluginElm.innerHTML = pluginHTML;
				saveObj[index].showUriFlag = 1;
			}
			pluginHtmlEnc = encodeURIComponent(pluginHTML);

			// Set position
			var leftOffset = srcSpritesHash[id].x - parseFloat(regionArray[0]);
			var topOffset = srcSpritesHash[id].y - parseFloat(regionArray[1]);

			var left = EDT.submenu.mouseX + leftOffset;
			var top = EDT.submenu.mouseY + topOffset;
			newSprite.style.left = left + "px";
			newSprite.style.top = top + "px";
			newSprite.style.width = srcSpritesHash[id].width + "px";
			newSprite.style.zIndex = srcSpritesHash[id].z;

			var tag = unescape(srcTagHash[id]);
			if(PARAM.language == "ja"){
				tag = PLG.fixTagField(tag);
			}
			tag = tag.replace(/,\s+/g, ",");
			tag = tag.replace(/\s+,/g, ",");
			tag = tag.replace(/^\s+/g, "");
			tag = tag.replace(/,+/g, ",");
			tag = tag.replace(/,$/g, "");

			// Backup properties
			PARAM.sprites[newsid] = {};

			if(aliasFlag !== undefined && aliasFlag){
				PARAM.sprites[newsid].src = pageid + "," + id;
			}

			var currentDate = new EDT.CurrentDate();
			PARAM.sprites[newsid].created_time = currentDate.getDate();

			PARAM.sprites[newsid].author = newAuthor;

			PARAM.sprites[newsid].innerHTML = innerHTML;
			PARAM.sprites[newsid].plugin = pluginHTML;
			PARAM.sprites[newsid].tag = tag;

			PARAM.sprites[newsid].display = {};
			for(var type in srcSpritesHash[id].display){
				if(type != "toJSONString"){
					PARAM.sprites[newsid].display[type] = srcSpritesHash[id].display[type];
				}
			}

			PARAM.sprites[newsid].x = left;
			PARAM.sprites[newsid].y = top;
			PARAM.sprites[newsid].z = srcSpritesHash[id].z;
			PARAM.sprites[newsid].width = srcSpritesHash[id].width;
			PARAM.sprites[newsid].height = srcSpritesHash[id].height;

			PARAM.sprites[newsid].borderWidth = srcSpritesHash[id].borderWidth;
			PARAM.sprites[newsid].borderStyle = srcSpritesHash[id].borderStyle;
			PARAM.sprites[newsid].padding = srcSpritesHash[id].padding;
			PARAM.sprites[newsid].borderColor = unescape(srcSpritesHash[id].borderColor);
			PARAM.sprites[newsid].bgColor = unescape(srcSpritesHash[id].bgColor);
			PARAM.sprites[newsid].color = unescape(srcSpritesHash[id].color);

			PARAM.sprites[newsid].isDrawing = srcSpritesHash[id].isDrawing;

			EDT.setSpriteInfo(newSprite);


			var tmpDistance = leftOffset * leftOffset + topOffset * topOffset;
			if(distanceFromTopLeft > tmpDistance){
				distanceFromTopLeft = tmpDistance;
				targetSprite = newSprite;
			}
			newSprites.push(newSprite);


			if(srcSpritesHash[id].groupid){
				// Sprite "id" belongs a parent group
				// "srcSpritesHash[id].groupid".
				var pgid = dicGroups[srcSpritesHash[id].groupid];
				// Add parent to child
				PARAM.sprites[newsid].groupid = pgid;
				// Add child to parent
				groupObj[pgid][newsid] = {};
			}

			var innerHTMLPost = encodeURIComponent(innerHTML);
			saveObj[index].innerHTMLPost = innerHTMLPost;
			saveObj[index].public_password = public_password;
			saveObj[index].public_author = encodeURIComponent(public_author);

			saveObj[index].authorName = encodeURIComponent(newAuthor);

			saveObj[index].left = left;
			saveObj[index].top = top;
			saveObj[index].width = srcSpritesHash[id].width;
			saveObj[index].height = srcSpritesHash[id].height;
			saveObj[index].zIndex = srcSpritesHash[id].z;

			saveObj[index].borderWidth = PARAM.sprites[newsid].borderWidth;
			saveObj[index].borderStyle = PARAM.sprites[newsid].borderStyle;
			saveObj[index].padding = PARAM.sprites[newsid].padding;
			saveObj[index].borderColor = PARAM.sprites[newsid].borderColor;
			saveObj[index].bgColor = PARAM.sprites[newsid].bgColor;
			saveObj[index].color = PARAM.sprites[newsid].color;

			saveObj[index].showAuthorFlag = 0;
			saveObj[index].showTimeFlag = 0;
			saveObj[index].showUriFlag = 0;
			saveObj[index].showTagFlag = 0;
			saveObj[index].tag = encodeURIComponent(tag);

			if(aliasFlag !== undefined && aliasFlag){
				saveObj[index].src = PARAM.sprites[newsid].src;
			}
			else{
				saveObj[index].src = "";
			}

			var children = infoElm.childNodes;
			for(var i = 0;i < children.length; i++){
				if(children[i].className == "uri"){
					saveObj[index].showUriFlag = 1;
				}
				else if(children[i].className == "time"){
					saveObj[index].showTimeFlag = 1;
				}
				else if(children[i].className == "author"){
					saveObj[index].showAuthorFlag = 1;
				}
				else if(children[i].className == "tag"){
					saveObj[index].showTagFlag = 1;
				}
			}

			saveObj[index].pluginEnc = pluginHtmlEnc;

			saveObj[index].id = newsid;

			index++;
		}
	}

	for(var sid in dicSprites){
		if(sid.match(/^spr.+$/)){
			if(srcSpritesHash[sid].inlink){
				for(var sid2 in srcSpritesHash[sid].inlink){
					if(sid2.match(/^spr.+$/)){
						if(!PARAM.sprites[dicSprites[sid]].inlink){
							PARAM.sprites[dicSprites[sid]].inlink = {};
						}
						if(dicSprites[sid2]){
							PARAM.sprites[dicSprites[sid]].inlink[dicSprites[sid2]] = 1;
						}
					}
				}
			}
			if(srcSpritesHash[sid].outlink){
				for(var sid2 in srcSpritesHash[sid].outlink){
					if(sid2.match(/^spr.+$/)){
						if(!PARAM.sprites[dicSprites[sid]].outlink){
							PARAM.sprites[dicSprites[sid]].outlink = {};
						}
						if(dicSprites[sid2]){
							PARAM.sprites[dicSprites[sid]].outlink[dicSprites[sid2]] = 1;
						}
					}
				}
			}
		}
	}
	EDT.saveSprite(targetSprite, newSprites, EDT.SAVE_PASTEDSPRITE, saveObj, groupObj);

	EDT.submenu.close();
};

EDT.aliasSprite = function(e) {
	EDT.pasteSprite(e, true)
};

// -----------------------------------------------------------------------------------------------
// Layer (Top/Bottom)

EDT.sendToTop = function() {
	// get list of all sprites
	var topZ = 0;
	var topSprite = PLG.selection.currentFixed;
	var zIndex = PLG.sprZindex(topSprite);
	var topcount = 0;
	for(var id in PARAM.sprites){
		if(!id.match(/^spr.+$/)){
			continue;
		}
		var tmpSprite = $(id);
		var tmpZ = PLG.sprZindex(tmpSprite);
		if(tmpZ > topZ && tmpZ <= PLG.ZIND.SPRITE_MAX){
			topZ = tmpZ;
			topSprite = tmpSprite;
			topcount = 1;
		}
		else if(tmpZ == topZ){
			topcount++;
		}
	}

	if(topSprite != PLG.selection.currentFixed || topcount > 1){
		if(topZ < PLG.ZIND.SPRITE_MAX){
			zIndex = parseFloat(topZ) + 1;
		}
		else{
			zIndex = PLG.ZIND.SPRITE_MAX;
		}
	}
	if(zIndex < PLG.ZIND.SPRITE_MIN || zIndex > PLG.ZIND.SPRITE_MAX){
		zIndex = PLG.ZIND.SPRITE_CREATEMIN;
	}

	$(PLG.selection.currentFixed.id).style.zIndex = zIndex;
	PARAM.sprites[PLG.selection.currentFixed.id].z = zIndex;
	EDT.saveStyles(PLG.selection.currentFixed, true);
};

EDT.sendToBottom = function() {
	// get list of all sprites
	var bottomZ = PLG.ZIND.SPRITE_MAX + 1;
	var bottomSprite = PLG.selection.currentFixed;
	var zIndex = PLG.sprZindex(bottomSprite);
	var bottomCount = 0;
	for(var id in PARAM.sprites){
		if(!id.match(/^spr.+$/)){
			continue;
		}
		var tmpSprite = $(id);
		var tmpZ = PLG.sprZindex(tmpSprite);
		if(tmpZ < bottomZ){
			bottomZ = tmpZ;
			bottomSprite = tmpSprite;
			bottomCount = 1;
		}
		else if(tmpZ == bottomZ){
			bottomCount++;
		}
		if(bottomSprite != PLG.selection.currentFixed || bottomCount > 1){
			if(bottomZ > PLG.ZIND.SPRITE_MIN){
				zIndex = parseFloat(bottomZ) - 1;
			}
			else{
				zIndex = PLG.ZIND.SPRITE_MIN;
			}
		}
	}

	if(zIndex < PLG.ZIND.SPRITE_MIN || zIndex > PLG.ZIND.SPRITE_MAX){
		zIndex = PLG.ZIND.SPRITE_CREATEMIN;
	}

	$(PLG.selection.currentFixed.id).style.zIndex = zIndex;
	PARAM.sprites[PLG.selection.currentFixed.id].z = zIndex;

	EDT.saveStyles(PLG.selection.currentFixed, true);
};

// -----------------------------------------------------------------------------------------------
// Save or Delete Sprite

EDT.saveSimpleText = function(saveObj) {
	var innerHTML = $("editor-textarea").value;

	// Attached file
	var attachedfilename = "";
	// var attachedfilenamepost = "";
	var attachedWidth = 0;
	var attachedHeight = 0;
	var attachedFilesize = 0;
	if($("uploadedfilename")){
		attachedfilename = $("uploadedfilename").innerHTML;
		saveObj.attachedfilenamepost = attachedfilename;
		if(attachedfilename.match(/^(.+?)\((.+?)x(.+?)\)$/)){
			attachedfilename = RegExp.$1;
			attachedWidth = RegExp.$2;
			attachedHeight = RegExp.$3;
		}
		else if(attachedfilename.match(/^(.+?)\((.+?)\)$/)){
			attachedfilename = RegExp.$1;
			attachedFilesize = RegExp.$2;
		}
	}

	// Can delete?
	if(innerHTML.length === 0){
		if(attachedfilename === ""){
			if(PARAM.sprites[PLG.selection.currentFixed.id].plugin !== ""){
				var pluginArray = PARAM.sprites[PLG.selection.currentFixed.id].plugin.split(",");
				innerHTML = pluginArray[0];
			}
			else{
				return -1;
			}
		}
	}

	// --------------------------------------------------------------
	// Set innerHTML, innerHTMLPost

	if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
		innerHTML = innerHTML.replace(/</g, "&lt;");
		innerHTML = innerHTML.replace(/>/g, "&gt;");
	}

	if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
		innerHTML = innerHTML.replace(/(\r\n?)|\n/g, "<br />\n");
	}
	else{
		innerHTML = innerHTML.replace(/\r\n?/g, "\n");
	}


	if(PARAM.sprite_autolink == 1 && PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
		// Wiki syntax
		innerHTML = innerHTML.replace(/\[http:(\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+) (.+?)\]/g, "<a href=\"HTTP:$1\">$2<\/a>");
		innerHTML = innerHTML.replace(/\[https:(\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+) (.+?)\]/g, "<a href=\"HTTPS:$1\">$2<\/a>");
		innerHTML = innerHTML.replace(/\[([-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+) (.+?)\]/g, "<a href=\"$1\">$2<\/a>");

		// Autolink
		innerHTML = innerHTML.replace(/(s?https?|ftp):(\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g, "<a href=\"$1:$2\">$1:$2<\/a>");

		innerHTML = innerHTML.replace(/HTTP:/g, "http:");
		innerHTML = innerHTML.replace(/HTTPS:/g, "https:");
	}


	// innerHTML which is posted to cgi
	saveObj.innerHTMLPost = encodeURIComponent(innerHTML);

	if(attachedfilename !== ""){
		var filepath = PARAM.DATAFILEPATH;
		if(PARAM.filesecure == 1){
			filepath = "./";
		}
		if(attachedfilename.match(/^.+?\.(gif|jpeg|jpg|png)$/i)){
			innerHTML = "<img alt='" + attachedfilename + "(" + attachedWidth + "x" + attachedHeight + ")' src='" + filepath + PARAM.pageid + "/Image/" + attachedfilename + "' width='" + attachedWidth + "' height='" + attachedHeight + "' class='attachedimage'>" + innerHTML;
		}
		else{
			innerHTML = "<a title='" + attachedfilename + "(" + attachedFilesize + ")' class='attachedfile' href='" + filepath + PARAM.pageid + "/File/" + attachedfilename + "'>" + attachedfilename + "</a>" + innerHTML;
		}
		saveObj.attachedfilenamepost = encodeURIComponent(saveObj.attachedfilenamepost);
	}

	// innerHTML which is set to current DOM
	saveObj.innerHTML = innerHTML;
	return 1;
};


EDT.saveWikiText = function(saveObj) {
	var innerHTML = $("editor-textarea").value;

	// Can delete?
	if(innerHTML.length === 0){
		if(PARAM.sprites[PLG.selection.currentFixed.id].plugin !== ""){
			var pluginArray = PARAM.sprites[PLG.selection.currentFixed.id].plugin.split(",");
			innerHTML = pluginArray[0];
		}
		else{
			return -1;
		}
	}

	// --------------------------------------------------------------
	// Set innerHTML, innerHTMLPost

	if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
		innerHTML = innerHTML.replace(/(\[%)([\s\S]*?)(%\])/gi, function($0, $1, $2, $3){return $1 + $2.replace(/</gi, "lt_preserved").replace(/>/gi, "gt_preserved") + $3; });
		innerHTML = innerHTML.replace(/(\[\(.+?\)%)([\s\S]*?)(%\])/gi, function($0, $1, $2, $3){return $1 + $2.replace(/</gi, "lt_preserved").replace(/>/gi, "gt_preserved") + $3; });
		innerHTML = innerHTML.replace(/<!--/gi, "lt_preserved!--");
		innerHTML = innerHTML.replace(/-->/gi, "--gt_preserved");

		innerHTML = innerHTML.replace(/\\</g, "&lt;");
		innerHTML = innerHTML.replace(/\\>/g, "&gt;");
		innerHTML = innerHTML.replace(/</g, "&lt;");
		innerHTML = innerHTML.replace(/>/g, "&gt;");
		innerHTML = innerHTML.replace(/lt_preserved/g, "<");
		innerHTML = innerHTML.replace(/gt_preserved/g, ">");
	}

	innerHTML = Wiky.toHtml(innerHTML);

	innerHTML = innerHTML.replace(/\r\n?/g, "\n");
	innerHTML = innerHTML.replace(/(<br.*?\/?>) /gi, "<br class=\"wiki_br_space\">");

	if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_SUPER){
		innerHTML = innerHTML.replace(/(<pre.*?>)([\s\S]*?)(<\/pre>)/gi, function($0, $1, $2, $3){return $1 + $2.replace(/&amp;([lg]t;)/gi, "&$1") + $3; });
	}


	// innerHTML which is posted to cgi
	saveObj.innerHTMLPost = encodeURIComponent(innerHTML);

	// innerHTML which is set to current DOM
	saveObj.innerHTML = innerHTML;
	return 1;
};

EDT.saveRichText = function(saveObj) {
//	var innerHTML = oEditor.GetHTML();
	var innerHTML = EDT.editor.fck.GetData();

	innerHTML = innerHTML.replace(/\r\n?/g, "\n");

	if(innerHTML.length === 0 || innerHTML == "<br type=\"_moz\" />"){
		if(PARAM.sprites[PLG.selection.currentFixed.id].plugin !== ""){
			var pluginArray = PARAM.sprites[PLG.selection.currentFixed.id].plugin.split(",");
			saveObj.innerHtmlPost = encodeURIComponent(pluginArray[0]);
			saveObj.innerHTML = pluginArray[0];
		}
		else{
			return -1;
		}
	}
	else{
		saveObj.innerHTMLPost = encodeURIComponent(innerHTML);
		saveObj.innerHTML = innerHTML;
		return 1;
	}
};

EDT.saveFromEditor = function(targetSprite, saveMode, changeInnerHTML) {
	PLG.waitSavingFlag = true;
	PLG.startProcessingAnime();

	EDT.editor.ignoreMove = true;

	$("controlresult").innerHTML = "";

	// Quick authentication for public user's sprite
	var authorName = PARAM.sprites[targetSprite.id].author;
	var loginid = PLG.getCookie("loginid");
	if(loginid == "public" && !authorName.match(/^&lt;.+&gt;$/) && !authorName.match(/^\[.+\]$/)){

		$("controlresult").innerHTML = MESSAGE.PERMISSIONDENIED;
		PLG.waitSavingFlag = false;
		PLG.stopProcessingAnime();
		PLG.ignoreMouseDown = true;

		EDT.revertSprite(new Array(targetSprite.id), true);

		return;
	}

	// ------------------------------------------------------
	// Set authorName, public_password and public_author

	var public_password = "";
	var public_author = "";
	if(authorName.match(/^&lt;.+&gt;$/) || authorName.match(/^\[.+\]$/)){
		public_password = $("cp_publicpass").value;
		public_author = $("cp_publicauthor").value;

		if(public_author === ""){
			public_author = "public";
		}
		if(public_password !== ""){
			authorName = "&lt;" + public_author + "&gt;";
		}
		else{
			authorName = "[" + public_author + "]";
		}
	}

	// authorName, public_password and public_author are set
	// ---------------------------------------------------------

	var saveObj = [];
	saveObj[0] = {};

	saveObj[0].pluginEnc = encodeURIComponent(PARAM.sprites[targetSprite.id].plugin);

	var tag = $("tagfield").value;
	if(PARAM.language == "ja"){
		tag = PLG.fixTagField(tag);
	}
	tag = tag.replace(/,\s+/g, ",");
	tag = tag.replace(/\s+,/g, ",");
	tag = tag.replace(/^\s+/g, "");
	tag = tag.replace(/,+/g, ",");
	tag = tag.replace(/,$/g, "");

	if(tag !== undefined && tag !== null){
		tag = tag.replace(/</g, "&lt;");
		tag = tag.replace(/>/g, "&gt;");
		PARAM.sprites[targetSprite.id].tag = tag;
	}
	else{
		tag = "";
	}
	saveObj[0].tag = encodeURIComponent(tag);
	saveObj[0].attachedfilenamepost = "";
	saveObj[0].innerHTMLPost = "";
	saveObj[0].innerHTML = "";

	var contentsElm = PLG.getSpriteContents(targetSprite);

	if(changeInnerHTML){
		var res;
		if(targetSprite.id.match(/_link$/)){
			saveObj[0].innerHTML = PLG.getSpriteContents(targetSprite).innerHTML;
			saveObj[0].innerHTMLPost = encodeURIComponent(PLG.getSpriteContents(targetSprite).innerHTML);
			res = 1;
		}
		else if(EDT.currentEditorType == PLG.CONST.SIMPLE_EDITOR){
			res = EDT.saveSimpleText(saveObj[0]);
		}
		else if(EDT.currentEditorType == PLG.CONST.WIKI_EDITOR){
			res = EDT.saveWikiText(saveObj[0]);
		}
		else if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR){
			res = EDT.saveRichText(saveObj[0]);
		}

		if(res == -1){
			if(EDT.editor.isNewSprite){
				EDT.editor.close();
				PLG.waitSavingFlag = false;
				PLG.stopProcessingAnime();
				return;
			}
			else{
				if(PLG.selection.isMultiFixed() > 1 || PARAM.sprites[PLG.selection.currentFixed.id].groupid){
					PLG.waitSavingFlag = true;
					PLG.startProcessingAnime();
					mes = MESSAGE.DIALOGDELETESPRITES;
					if(window.confirm(mes)){
						EDT.deleteSprite(true);
					}
					else{
						PLG.setViewPositionFlag = false;
						PLG.waitSavingFlag = false;
						PLG.stopProcessingAnime();
						PLG.ignoreMouseDown = true;
						return;
					}
				}
				else{
					EDT.deleteSprite(true);
				}
				return;
			}
		}

		contentsElm.innerHTML = saveObj[0].innerHTML;
		PLG.fixParagraph(contentsElm);
		PARAM.sprites[targetSprite.id].innerHTML = saveObj[0].innerHTML;

		// Set valid <canvas>
		var drawCommandStr = "";
		if((PLG.browser.msie || PLG.browser.msie7) && PARAM.sprites[targetSprite.id].isDrawing){
			saveObj[0].innerHTML.match(/(PLG.draw\(.+?\);)/i);
			drawCommandStr = RegExp.$1;
			contentsElm.innerHTML = "";

			saveObj[0].innerHTML.match(/<canvas.+width=[\"'](.+?)[\"'].*>/i);
			var canvasWidth = RegExp.$1;
			saveObj[0].innerHTML.match(/<canvas.+height=[\"'](.+?)[\"'].*>/i);
			var canvasHeight = RegExp.$1;

			var canvasElm = PLG.createElm("canvas", targetSprite.id + "_canvas");
			canvasElm.width = canvasWidth;
			canvasElm.height = canvasHeight;
			contentsElm.appendChild(canvasElm);

			G_vmlCanvasManager.initElement(canvasElm);

			// It's a queer hack.
			// Dummy element (<canvas></canvas>) is needed to set <script>
			// element to innerHTML in IE.
			contentsElm.insertAdjacentHTML("beforeEnd", "<canvas id='tmpcanvas'></canvas><script type='text/javascript'>\n<!--\n" + drawCommandStr + "\n// -->\n</script>");
			contentsElm.removeChild($("tmpcanvas"));

		}
	}

	// innerHTML, innerHTMLPost and plugin are set
	// --------------------------------------------------------------

	// Expand width of the sprite
	if(saveObj[0].innerHTML.match(/<img.+width=[\"'](.+?)[\"'].*>/i)){
		var imgWidth = parseInt(RegExp.$1) + 4;
		if(PARAM.sprites[targetSprite.id].width < imgWidth){
			PARAM.sprites[targetSprite.id].width = imgWidth;
			if(PLG.zoom == 1.0){
				targetSprite.style.width = imgWidth + "px";
				var regionElm = PLG.getSpriteRegion(targetSprite);
				regionElm.style.width = (imgWidth - 2) + "px";
			}
		}
	}

	// --------------------------------------------------------------
	// Set styles and userProf
	PLG.backupDynamicProperties(targetSprite);

	saveObj[0].left = PARAM.sprites[targetSprite.id].x;
	saveObj[0].top = PARAM.sprites[targetSprite.id].y;
	saveObj[0].width = PARAM.sprites[targetSprite.id].width;
	saveObj[0].height = PARAM.sprites[targetSprite.id].height;
	saveObj[0].zIndex = PARAM.sprites[targetSprite.id].z;

	var userProf = "";

	var borderWidth = PARAM.sprites[targetSprite.id].borderWidth;
	userProf += "borderWidth:" + borderWidth + ",";
	var borderStyle = PARAM.sprites[targetSprite.id].borderStyle;
	userProf += "borderStyle:" + borderStyle + ",";
	var padding = PARAM.sprites[targetSprite.id].padding;
	userProf += "padding:" + padding + ",";

	saveObj[0].borderWidth = borderWidth;
	saveObj[0].borderStyle = borderStyle;
	saveObj[0].padding = padding;

	saveObj[0].borderColor = "";
	saveObj[0].bgColor = "";
	saveObj[0].color = "";

	if(contentsElm.style.borderTopColor){
//		saveObj[0].borderColor = contentsElm.style.borderTopColor;
		saveObj[0].borderColor = PARAM.sprites[targetSprite.id].borderColor;
		var encFrameColor = encodeURIComponent(contentsElm.style.borderTopColor);
		userProf += "borderColor:" + encFrameColor + ",";
	}
	if(contentsElm.style.backgroundColor){
//		saveObj[0].bgColor = contentsElm.style.backgroundColor;
		saveObj[0].bgColor = PARAM.sprites[targetSprite.id].bgColor;
		var encBgColor = encodeURIComponent(contentsElm.style.backgroundColor);
		userProf += "bgColor:" + encBgColor + ",";
	}
	else{
		userProf += "bgColor:" + ",";
	}
	if(contentsElm.style.color){
//		saveObj[0].color = contentsElm.style.color;
		saveObj[0].color = PARAM.sprites[targetSprite.id].color;
		var encFgColor = encodeURIComponent(contentsElm.style.color);
		userProf += "fgColor:" + encFgColor + ",";
	}

	// ------------------------------------------------------
	// Set spriteinfo and userProf

	if(PARAM.sprites[targetSprite.id].display.author == 1){
		userProf += "showAuthor:" + "true" + ",";
	}
	else{
		userProf += "showAuthor:" + "false" + ",";
	}

	if(PARAM.sprites[targetSprite.id].display.created_time == 1){
		userProf += "showTime:" + "true" + ",";
	}
	else{
		userProf += "showTime:" + "false" + ",";
	}

	if(PARAM.sprites[targetSprite.id].display.uri == 1){
		userProf += "showUri:" + "true" + ",";
	}
	else{
		userProf += "showUri:" + "false" + ",";
	}

	if(PARAM.sprites[targetSprite.id].display.tag == 1){
		userProf += "showTag:" + "true";
	}
	else{
		userProf += "showTag:" + "false";
	}

	var profUserName = PARAM.author;
	profUserName = encodeURIComponent(profUserName);
	if(!targetSprite.id.match(/_link$/)){
		PLG.setCookie("prof_" + profUserName, userProf, PARAM.CGIFILEPATH, 30);
	}

	// --------------------------------------------------------------
	// Create saveObj

	saveObj[0].public_password = public_password;
	saveObj[0].public_author = encodeURIComponent(public_author);
	saveObj[0].authorName = encodeURIComponent(authorName);
	saveObj[0].showAuthorFlag = PARAM.sprites[targetSprite.id].display.author;
	saveObj[0].showTimeFlag = PARAM.sprites[targetSprite.id].display.created_time;
	saveObj[0].showUriFlag = PARAM.sprites[targetSprite.id].display.uri;
	saveObj[0].showTagFlag = PARAM.sprites[targetSprite.id].display.tag;
	saveObj[0].id = targetSprite.id;

	delete saveObj[0].innerHTML;

	var newSprites = [];
	newSprites.push(targetSprite);
	EDT.saveSprite(targetSprite, newSprites, saveMode, saveObj);
};

// -----------------------------------------------
// Save sprite
// TargetSprite is the sprite that will be fixed.
// NewSprites are the list of the saving sprites.
// NewSprites must contain the targetSprite.
EDT.saveSprite = function(targetSprite, newSprites, saveMode, saveObj, groupObj) {
	PLG.waitSavingFlag = true;
	PLG.startProcessingAnime();

	$("controlresult").innerHTML = "";

	var marginHash = EDT.calcMargin();
	EDT.rebuildYoungerArray();

	var world = {};
	world.Right = PLG.worldRight;
	world.Left = PLG.worldLeft;
	world.Bottom = PLG.worldBottom;
	world.Top = PLG.worldTop;

	var adjustedTop = {};
	if(PLG.marginIsAdjusted){
		PLG.marginIsAdjusted = false;
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				adjustedTop[id] = PARAM.sprites[id].y;
			}
			else if(id.match(/^grp.+$/)){
				adjustedTop[id] = PARAM.groups[id].y;
			}
		}
	}

	var postdata = "";
	if(groupObj){
		postdata = "&pageid=" + PARAM.pageid + "&saveObj=" + saveObj.toJSONString() + "&groupObj=" + groupObj.toJSONString() + "&margin=" + marginHash.toJSONString() + "&world=" + world.toJSONString() + "&adjustedTop=" + adjustedTop.toJSONString();
	}
	else{
		// groupObj is needed. It is a fail safe. This is because JSON.pm(2.0) does not accept "". 
		postdata = "&pageid=" + PARAM.pageid + "&saveObj=" + saveObj.toJSONString() + "&groupObj={}&margin=" + marginHash.toJSONString() + "&world=" + world.toJSONString() + "&adjustedTop=" + adjustedTop.toJSONString();
	}

	// callback function
	var saveSpriteOnLoaded = function(obj) {
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		if(res != "saved"){
			// Error!

			$("controlresult").innerHTML = EDT.getResponseText(res);
			PLG.waitSavingFlag = false;
			PLG.stopProcessingAnime();

			if(saveMode == EDT.SAVE_FROMEDITOR || saveMode == EDT.SAVE_PROPERTY){
				EDT.editor.canMove = false;
				EDT.revertSprite(new Array(saveObj[0].id), true);
				return;
			}
			else{
				var idArray = new Array();
				for(var i=0; i<saveObj.length; i++){
					idArray.push(saveObj[i].id);
				}
				EDT.revertSprite(idArray, true);

				if(newSprites){
					for(var i = 0;i < newSprites.length; i++){
						if($(newSprites[i].id)){
							PLG.numberOfSprites--;
							$("spriteslist").removeChild(newSprites[i]);
						}
					}
				}

				return;
			}

		}
		else{
			// Succeed
			$("controlresult").innerHTML = EDT.getResponseText(res);

			// Set public_author / public_password
			var passElm = $("cp_publicpass");
			if(passElm){
				var public_password = passElm.value;
				if(public_password !== ""){
					PLG.setCookie("public_password", public_password, PARAM.CGIFILEPATH, 30);
				}
				var public_author = $("cp_publicauthor").value;
				if(public_author === ""){
					public_author = "public";
				}
				PLG.setCookie("public_author", encodeURIComponent(public_author), PARAM.CGIFILEPATH, 30);
			}

			EDT.view.setPropertyDirty(false);

			// Append new sprites
			if(newSprites){
				for(var i = 0;i < newSprites.length; i++){
					// Get information of new images and canvases.
					if(PLG.zooming){
						var contents = PLG.getSpriteContents(newSprites[i]);
						var children = [];
						for(var j = 0;j < contents.childNodes.length; j++){
							children.push(contents.childNodes[j]);
						}
						var count = 0;
						var date = new Date;
						var dateStr = parseInt(date.getTime())
						while(children.length > 0){
							var node = children.pop();
							if(node.id && node.id.match(/^positlog.+?_\d+_(.*)$/)){
								continue;
							}

							// Safari2 ignores i option.
							// Use capital tag name here.
//							if(node.nodeName.match(/^(img)/i) || node.nodeName.match(/^(object)/i) || node.nodeName.match(/^(embed)/i)){
							if(node.nodeName.match(/^(IMG)/i) || node.nodeName.match(/^(OBJECT)/i) || node.nodeName.match(/^(EMBED)/i)){
								var name = RegExp.$1;
								var id = "positlog" + name + "_" + dateStr + count + "_";
								if(node.id){
									var matchStr = "/^positlog" + name + "_\d+_(.*)$/";
									if(node.id.match(matchStr)){
										id += RegExp.$1;
									}
									else{
										id += node.id;
									}
								}
								node.id = id;
								var obj = {};
								obj.width = node.offsetWidth;
								obj.height = node.offsetHeight;
								obj.id = id;
								if(PLG.zoomingObject[newSprites[i].id] === undefined){
									PLG.zoomingObject[newSprites[i].id] = {};
								}
								PLG.zoomingObject[newSprites[i].id][count] = obj;
								count++;
							}
//							else if(node.nodeName.match(/^canvas/i)){
							else if(node.nodeName.match(/^CANVAS/i)){
								var canvas = {};
								canvas.width = node.offsetWidth;
								canvas.height = node.offsetHeight;
								PLG.zoomingCanvas[newSprites[i].id] = canvas;
							}
							if(node.childNodes.length > 0){
								for(var j = 0;j < node.childNodes.length; j++){
									children.push(node.childNodes[j]);
								}
							}
						}
					}
				}
			}

			// Update recentSprites
			if(EDT.editor.mode != EDT.EDITOR_CLOSE){
				if(EDT.editor.isNewSprite){
					PLG.numberOfSprites++;
					$("pageinfo").innerHTML = "(" + PLG.numberOfSprites + "sprites, " + Math.abs(PLG.worldRight - PLG.worldLeft) + "x" + Math.abs(PLG.worldBottom - PLG.worldTop) + "pixels)";
					PARAM.recentSprites.unshift(saveObj[0].id);
				}
			}

			while(PARAM.recentSprites.length > 5){
				PARAM.recentSprites.pop();
			}

			// Close widgets
			if(EDT.editor.mode != EDT.EDITOR_CLOSE){
				EDT.editor.shrink();
				EDT.editor.isNewSprite = false;
			}


			// Post processes
			for(var i = 0;i < saveObj.length; i++){
				if(PARAM.sprites[saveObj[i].id].isDrawing){
					// Draw lines
					var innerHTML = PARAM.sprites[saveObj[i].id].innerHTML;
					if(innerHTML.match(/draw\('(.+)'\)/)){
						var drawCommand = RegExp.$1;
						PLG.draw(drawCommand);
						if(PLG.drawTimer === null){
							PLG.drawTimer = setInterval("PLG.execDrawCommand()", 10);
						}
					}
				}

				PARAM.sprites[saveObj[i].id].author = decodeURIComponent(saveObj[i].authorName);
				EDT.setSpriteInfo($(saveObj[i].id));
			}

			if(groupObj){
				for(var gid in groupObj){
					if(gid.match(/^grp.+$/)){
						PARAM.groups[gid] = {};
						for(var gid2 in groupObj[gid]){
							PARAM.groups[gid][gid2] = groupObj[gid][gid2];
						}
						PLG.calcRegionsOfGroup(gid);
					}
				}
			}

			// Highlight new sprite
			if(saveMode != EDT.SAVE_NEWDRAWINGSPRITE && saveMode != EDT.SAVE_NEWARROWSPRITE && saveMode != EDT.SAVE_PROPERTY && saveMode != EDT.SAVE_NEWDROPSPRITE){
				PLG.state = PLG.STATES.FIXEDSELECTED;
				PLG.selection.clear();
				PLG.selection.fix(targetSprite.id, false);
			}

			// Update geometries and small map
			EDT.view.refreshMap();
			for(var i = 0;i < saveObj.length; i++){
				EDT.view.rebuildArrowSprites(saveObj[i].id);
			}

			// Update status
			if(saveMode != EDT.SAVE_FROMEDITOR && saveMode != EDT.SAVE_PROPERTY){
				PLG.numberOfSprites += newSprites.length;
					$("pageinfo").innerHTML = "(" + PLG.numberOfSprites + "sprites, " + Math.abs(PLG.worldRight - PLG.worldLeft) + "x" + Math.abs(PLG.worldBottom - PLG.worldTop) + "pixels)";

				if(saveMode == EDT.SAVE_NEWCOMMENTSPRITE){
					EDT.commentFlag = true;

					if(!PARAM.sprites[targetSprite.id].outlink){
						PARAM.sprites[targetSprite.id].outlink = {};
					}
					PARAM.sprites[targetSprite.id].outlink[EDT.parentOfComment.id] = 1;


					if(!PARAM.sprites[EDT.parentOfComment.id].inlink){
						PARAM.sprites[EDT.parentOfComment.id].inlink = {};
					}
					PARAM.sprites[EDT.parentOfComment.id].inlink[targetSprite.id] = 1;

					EDT.moverOnMouseDown();
				}
			}

			EDT.backupHashes();

			if(PLG.zooming){
				PLG.drawZoomMap();
			}

			PLG.spriteArraySorted = null;
			PLG.sortSpritesByDistance();

			EDT.editor.canMove = false;
			PLG.stopProcessingAnime();

			EDT.view.redraw();

			PLG.setViewPositionFlag = false;
			PLG.waitSavingFlag = false;

		}
	};

	PLG.sendRequest(saveSpriteOnLoaded, postdata, "POST", PARAM.CGIFILEPATH + "saveSprite.cgi", true, true);
};


EDT.revertSprite = function(idArray, resetInnerHTML) {
	EDT.restoreHashes();
	
	for(var i = 0; i<idArray.length; i++){
		var id = idArray[i];
		var spr = $(id);
		if(PARAM.sprites[id]){
			var contents = PLG.getSpriteContents(spr);

			if(resetInnerHTML){
				contents.innerHTML = PARAM.sprites[id].innerHTML;
				PLG.fixParagraph(contents);
				if(id.match(/^(spr.+)_(spr.+)_link/)){
					PLG.drawArrowSprite(RegExp.$1, RegExp.$2);
				}
			}
			var pluginStr = PARAM.sprites[id].plugin;
			PLG.getSpritePlugin(spr).innerHTML = pluginStr;
			var pluginName = "";
			if(pluginStr !== undefined && pluginStr !== ""){
				var pluginArray = pluginStr.split(",");
				pluginName = pluginArray[0];
			}
			if($("cp_pluginname")){
				$("cp_pluginname").innerHTML = pluginName;
			}

			contents.style.borderWidth = PARAM.sprites[id].borderWidth + "px";;
			contents.style.borderStyle = PARAM.sprites[id].borderStyle;
			contents.style.borderColor = PARAM.sprites[id].borderColor;
			contents.style.backgroundColor = PARAM.sprites[id].bgColor;
			contents.style.color = PARAM.sprites[id].color;
//			contents.style.padding = PARAM.sprites[id].padding + "px";
			PLG.setContentsPadding(contents, PARAM.sprites[id].padding);
			EDT.setSpriteInfo(spr);
		}
		else{
			// New sprite
			// nop
		}
	}

};

EDT.deleteDialog = function() {
	PLG.waitSavingFlag = true;
	PLG.startProcessingAnime();
	var mes = MESSAGE.DIALOGDELETESPRITE;
	if(PLG.selection.isMultiFixed() > 1 || PARAM.sprites[PLG.selection.currentFixed.id].groupid){
		mes = MESSAGE.DIALOGDELETESPRITES;
	}
	if(window.confirm(mes)){
		EDT.deleteSprite(false);
	}
	else{
		PLG.setViewPositionFlag = false;
		PLG.waitSavingFlag = false;
		PLG.stopProcessingAnime();
		PLG.ignoreMouseDown = true;
		return false;
	}
};

EDT.deleteSprite = function(isEditorOpen) {
	var deleteIDs = "";
	var unlinkArray = [];
	for(var i = 0;i < PLG.selection.length(); i++){
		if(PLG.selection.isFixed(PLG.selection.array[i])){
			deleteIDs += PLG.selection.array[i] + ";";
			unlinkArray.push(PLG.selection.array[i]);
		}
	}

	// Unlink sprites
	var linkingCommand = "";
	while(unlinkArray.length > 0){
		var itemid = unlinkArray.pop();
		if(itemid.match(/^grp.+$/)){
			for(var itemid2 in PARAM.groups[itemid]){
				if(itemid2.match(/^grp.+$/) || itemid2.match(/^spr.+$/)){
					unlinkArray.push(itemid2);
				}
			}
		}
		else{
			if(PARAM.sprites[itemid].outlink){
				for(var id in PARAM.sprites[itemid].outlink){
					if(!id.match(/^spr.+$/)){
						continue;
					}
					if(PARAM.sprites[id] && PARAM.sprites[id].inlink && PARAM.sprites[id].inlink[itemid]){
						delete(PARAM.sprites[id].inlink[itemid]);
					}
					delete(PARAM.sprites[itemid].outlink[id]);
					linkingCommand += "unlink," + itemid + "," + id + ";";
					var arrowid = itemid + "_" + id + "_link";
					deleteIDs += arrowid + ";";
				}
			}
			if(PARAM.sprites[itemid].inlink){
				for(var id in PARAM.sprites[itemid].inlink){
					if(!id.match(/^spr.+$/)){
						continue;
					}
					if(PARAM.sprites[id] && PARAM.sprites[id].outlink && PARAM.sprites[id].outlink[itemid]){
						delete(PARAM.sprites[id].outlink[itemid]);
					}
					delete(PARAM.sprites[itemid].inlink[id]);
					linkingCommand += "unlink," + id + "," + itemid + ";";
					var arrowid = id + "_" + itemid + "_link";
					deleteIDs += arrowid + ";";
				}
			}
		}
	}

	if(PLG.selection.currentFixed.id.match(/^(.+)_link$/)){
		var sprStr = RegExp.$1;
		var sprArray = sprStr.split("_");
		var srcid = "";
		var dstid = "";
		if(sprArray.length == 6){
			srcid = sprArray[0] + "_" + sprArray[1] + "_" + sprArray[2];
			dstid = sprArray[3] + "_" + sprArray[4] + "_" + sprArray[5];
		}
		else if(sprArray.length == 4){
			srcid = sprArray[0];
			if(sprArray[1].match(/spr/)){
				dstid = sprArray[1] + "_" + sprArray[2] + "_" + sprArray[3];
			}
			else{
				srcid += "_" + sprArray[1] + "_" + sprArray[2];
				dstid = sprArray[3];
			}
		}
		else if(sprArray.length == 2){
			srcid = sprArray[0];
			dstid = sprArray[1];
		}
		if(srcid !== "" && dstid !== ""){
			if(PARAM.sprites[srcid].outlink && PARAM.sprites[srcid].outlink[dstid]){
				delete(PARAM.sprites[srcid].outlink[dstid]);
			}
			if(PARAM.sprites[dstid].inlink && PARAM.sprites[dstid].inlink[srcid]){
				delete(PARAM.sprites[dstid].inlink[srcid]);
			}
			linkingCommand += "unlink," + srcid + "," + dstid + ";";
		}
	}

	if(linkingCommand !== ""){
		linkingCommand = linkingCommand.substr(0, linkingCommand.length - 1);
	}

	deleteIDs = deleteIDs.substr(0, deleteIDs.length - 1);

	var deletedSprites = new Array();
	// Delete hash
	var deleteArray = deleteIDs.split(";");
	for(var i = 0;i < deleteArray.length; i++){
		var id = deleteArray[i];
		if(id.match(/^spr.+$/)){
			deletedSprites.push(id);
			delete(PARAM.sprites[id]);
		}
		else if(id.match(/^grp.+$/)){
			for(var id2 in PARAM.groups[id]){
				if(!id2.match(/^spr.+$/) && !id.match(/^grp.+$/)){
					continue;
				}
				deleteArray.push(id2);
			}
			delete(PARAM.groups[id]);
		}
	}

	var marginHash = EDT.calcMargin();
	EDT.rebuildYoungerArray();

	// password
	var public_password = "";
	var passElm = $("cp_publicpass");
	if(passElm){
		public_password = passElm.value;
	}
	else{
		public_password = PLG.getCookie("public_password");
		if(public_password === undefined){
			public_password = "";
		}
	}

	var prevState = PLG.state;

	var postdata = "&ids=" + deleteIDs + "&pageid=" + PARAM.pageid + "&public_password=" + public_password + "&linking=" + linkingCommand + "&margin=" + marginHash.toJSONString();

	// callback function
	var deleteSpriteOnLoaded = function(obj) {
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		if(res != "succeed"){
			if(res == "invalid_public_password"){
				$("controlresult").innerHTML = EDT.getResponseText(res);
				if(!isEditorOpen){
					EDT.restoreHashes();
					PLG.waitSavingFlag = false;
					PLG.stopProcessingAnime();
					return;
				}
			}
			else{
				$("controlresult").innerHTML = EDT.getResponseText(res);
			}

			EDT.restoreHashes();

			EDT.editor.canMove = false;
			PLG.waitSavingFlag = false;
			PLG.stopProcessingAnime();

			if(isEditorOpen){
				EDT.revertSprite(new Array(PLG.selection.currentFixed.id), true);

				EDT.editor.shrink();

				PLG.selection.clear();
				PLG.selection.fix(PLG.selection.currentFixed.id, false);
				PLG.state = PLG.STATES.FIXEDSELECTED;
				EDT.view.redraw();
				return;
			}
			return;
		}
		else{
			if(isEditorOpen){
				EDT.editor.shrink();
			}

			EDT.clearCanvas();

			PLG.state = PLG.STATES.WORKING;

			// Delete nodes
			for(var i = 0;i < deletedSprites.length; i++){
				var id = deletedSprites[i];
				if(id.match(/^spr.+$/)){
					$("spriteslist").removeChild($(id));
				}
			}

			EDT.view.refreshMap();
			EDT.view.rebuildArrowSprites(PLG.selection.currentFixed.id);
			EDT.backupHashes();

			PLG.selection.clear();
			var e;
			EDT.view.redraw(e, true);

			PLG.numberOfSprites -= deletedSprites.length;
			$("pageinfo").innerHTML = "(" + PLG.numberOfSprites + "sprites, " + Math.abs(PLG.worldRight - PLG.worldLeft) + "x" + Math.abs(PLG.worldBottom - PLG.worldTop) + "pixels)";

			PLG.spriteArraySorted = null;
			PLG.sortSpritesByDistance();

			PLG.adjustZoomingWorldFrame();

			PLG.waitSavingFlag = false;
			PLG.stopProcessingAnime();
		}

	};

	PLG.sendRequest(deleteSpriteOnLoaded, postdata, "POST", PARAM.CGIFILEPATH + "deleteSprite.cgi", true, true);
};

EDT.saveStyles = function(targetSprite, singleFlag) {
	if(targetSprite === null){
		$("controlresult").innerHTML = "Invalid sprite";
		return;
	}

	// styles
	var mode = "single";
	var targetID = targetSprite.id;
	var left = PARAM.sprites[targetID].x;
	var top = PARAM.sprites[targetID].y;
	var width = PARAM.sprites[targetID].width;
	var height = PARAM.sprites[targetID].height;
	var zIndex = PARAM.sprites[targetID].z;

	if(singleFlag === undefined || !singleFlag){
		if(PLG.selection.length() > 1 || PLG.selection.array[0].match(/^grp.+$/)){
			mode = "multiple";
			left = EDT.sumOfSpriteMoveX;
			top = EDT.sumOfSpriteMoveY;
			targetID = "";
			for(var i = 0;i < PLG.selection.length(); i++){
				if(PLG.selection.isFixed(PLG.selection.array[i])){
					targetID += PLG.selection.array[i] + ";";
				}
			}
			if(targetID !== ""){
				targetID = targetID.substr(0, targetID.length - 1);
			}
		}
	}
	// password
	var public_password = "";
	var passElm = $("cp_publicpass");
	if(passElm){
		public_password = passElm.value;
	}
	else{
		public_password = PLG.getCookie("public_password");
		if(public_password === undefined){
			public_password = "";
		}
	}

	var world = {};
	world.Right = PLG.worldRight;
	world.Left = PLG.worldLeft;
	world.Bottom = PLG.worldBottom;
	world.Top = PLG.worldTop;

	// Re-calc margin
	var marginHash = EDT.calcMargin();
	EDT.rebuildYoungerArray();

	var adjustedTop = {};
	if(PLG.marginIsAdjusted){
		PLG.marginIsAdjusted = false;
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				adjustedTop[id] = PARAM.sprites[id].y;
			}
			else if(id.match(/^grp.+$/)){
				adjustedTop[id] = PARAM.groups[id].y;
			}
		}
	}

	var postdata = "";
	if(mode == "single"){
		postdata = "&id=" + targetID + "&pageid=" + PARAM.pageid + "&public_password=" + public_password + "&mode=" + mode + "&left=" + left + "&top=" + top + "&width=" + width + "&height=" + height + "&zIndex=" + zIndex + "&margin=" + marginHash.toJSONString() + "&world=" + world.toJSONString() + "&adjustedTop=" + adjustedTop.toJSONString();
	}
	else if(mode == "multiple"){
		postdata = "&id=" + targetID + "&pageid=" + PARAM.pageid + "&public_password=" + public_password + "&mode=" + mode + "&left=" + left + "&top=" + top + "&margin=" + marginHash.toJSONString() + "&world=" + world.toJSONString() + "&adjustedTop=" + adjustedTop.toJSONString();
	}
	else{
		return;
	}

	var prevState = PLG.state;

	// callback function
	var saveStylesOnLoaded = function(obj) {
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		var resArray = res.split(",");
		if(resArray[0] != "succeed"){
			if(prevState == PLG.STATES.SCALING){
				EDT.restoreHashes();
				targetSprite.style.width = PARAM.sprites[targetSprite.id].width + "px";
				var regionElm = PLG.getSpriteRegion(targetSprite);
				regionElm.style.width = (PARAM.sprites[targetSprite.id].width - 2) + "px";
			}
			else if(prevState == PLG.STATES.MOVING || prevState == PLG.STATES.MOVINGSELECTED){
				for(var id in PLG.selection.allsprites){
					if(id.match(/^spr.+$/)){
						if(PLG.selection.allsprites[id].fixed){
							$(id).style.left = (PARAM.sprites[id].x - EDT.sumOfSpriteMoveX) + "px";
							$(id).style.top = (PARAM.sprites[id].y - EDT.sumOfSpriteMoveY) + "px";

							if(PLG.browser.msie || PLG.browser.msie7){
									$(id).style.filter = "alpha(opacity=100)";
							}
							else{
									$(id).style.opacity = 1.0;
							}
						}
					}
				}
				EDT.restoreHashes();
			}

			$("controlresult").innerHTML = EDT.getResponseText(res);

			PLG.state = PLG.STATES.WORKING;
			PLG.selection.clear();
			EDT.view.redraw();

			PLG.waitSavingFlag = false;
			PLG.stopProcessingAnime();

			if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
				$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
			}
			EDT.clearCanvas();

			if(PLG.zooming){
				PLG.drawZoomMap();
			}
			return;
		}

		if(prevState == PLG.STATES.FIXEDSELECTED || prevState == PLG.STATES.FIXED){
			// case "Send to top/bottom"
			$("controlresult").innerHTML = EDT.getResponseText(res);

			EDT.submenu.close();

			EDT.view.redraw();
		}
		else if(PLG.state == PLG.STATES.MOVING || PLG.state == PLG.STATES.MOVINGSELECTED){
			PLG.state = PLG.STATES.FIXEDSELECTED;

			for(var id in PLG.selection.allsprites){
				if(!id.match(/^spr.+$/)){
					continue;
				}
				EDT.view.rebuildArrowSprites(id);

				if(PLG.browser.msie || PLG.browser.msie7){
					$(id).style.filter = "alpha(opacity=100)";
				}
				else{
					$(id).style.opacity = 1.0;
				}
			}

			PLG.selection.add(PLG.selection.currentFixed.id);
			EDT.view.redraw();
			EDT.view.refreshMap();

			$("pageinfo").innerHTML = "(" + PLG.numberOfSprites + "sprites, " + Math.abs(PLG.worldRight - PLG.worldLeft) + "x" + Math.abs(PLG.worldBottom - PLG.worldTop) + "pixels)";

			if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
				$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
			}
		}
		else{
			PLG.state = PLG.STATES.FIXEDSELECTED;
			PLG.selection.add(PLG.selection.currentFixed.id);
			EDT.view.redraw();
			EDT.view.refreshMap();
			EDT.view.rebuildArrowSprites(targetID);

			$("pageinfo").innerHTML = "(" + PLG.numberOfSprites + "sprites, " + Math.abs(PLG.worldRight - PLG.worldLeft) + "x" + Math.abs(PLG.worldBottom - PLG.worldTop) + "pixels)";

			if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
				$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
			}
		}

		EDT.backupHashes();

		PLG.adjustZoomingWorldFrame();

		PLG.waitSavingFlag = false;
		PLG.stopProcessingAnime();
	};

	PLG.sendRequest(saveStylesOnLoaded, postdata, "POST", PARAM.CGIFILEPATH + "saveStyles.cgi", true, true);
};



EDT.calcMargin = function(){
	var marginHash = {};
	if(parseInt(PARAM.publish) != 1){
		return marginHash;
	}

	var siblings = {};
	for(var id in PARAM.sprites){
		if(id.match(/_link$/)){
			continue;
		}
		if(id.match(/^spr.+$/)){
			if(PARAM.sprites[id].groupid && PARAM.groups[PARAM.sprites[id].groupid]){
				if(!PARAM.groups[PARAM.sprites[id].groupid].groupid){
					siblings[PARAM.sprites[id].groupid] = 1;
				}
			}
			else{
				siblings[id] = 1;
			}
		}
	}
	EDT.calcSiblingsMargin(marginHash, siblings);
	
	for(var gid in PARAM.groups){
		if(gid.match(/^grp.+$/)){
			EDT.calcSiblingsMargin(marginHash, PARAM.groups[gid]);
		}
	}

	return marginHash;
};


EDT.calcSiblingsMargin = function(marginHash, siblings) {
	var upperSiblings = [];
	var lowerSiblings = [];

	for(var id in siblings){
		if(id.match(/_link$/)){
			continue;
		}
		var obj = null;
		var item = null;
		if(id.match(/^spr.+$/)){
			item = PARAM.sprites[id];
		}
		else if(id.match(/^grp.+$/)){
			item = PARAM.groups[id];
		}
		else{
			continue;
		}
		if(item.y + item.height < 0){
			upperSiblings.push(id);
		}
		else if(item.y > 0){
			lowerSiblings.push(id);
		}
		else{
			upperSiblings.push(id);
			lowerSiblings.push(id);
		}
	}

	var sortByBottomReverse = function(a,b){
		var hashA = null;
		if(a.match(/^spr.+$/)){
			hashA = PARAM.sprites;
		}
		else{
			hashA = PARAM.groups;
		}
		var hashB = null;
		if(b.match(/^spr.+$/)){
			hashB = PARAM.sprites;
		}
		else{
			hashB = PARAM.groups;
		}
		var result = (hashB[b].y + hashB[b].height) - (hashA[a].y + hashA[a].height);
		if(result === 0){
			if(hashA[a].margin_s && hashA[a].margin_s && hashA[a].margin_s.elder == b){
				result = 1;
			}
			else{
				result = -1;
			}
		}
		if(isNaN(result)){
			result = 1;
		}
		return result;
	};
	upperSiblings.sort(sortByBottomReverse);

	for(var i = 0;i < upperSiblings.length; i++){
		EDT.calcSiblingsMargin2(marginHash, upperSiblings, "upper", i);
	}

	// Process lower siblings

	var sortByTop = function(a,b){
		var hashA = null;
		if(a.match(/^spr.+$/)){
			hashA = PARAM.sprites;
		}
		else{
			hashA = PARAM.groups;
		}
		var hashB = null;
		if(b.match(/^spr.+$/)){
			hashB = PARAM.sprites;
		}
		else{
			hashB = PARAM.groups;
		}
		var result = hashA[a].y - hashB[b].y;
		if(result === 0){
			if(hashA[a].margin_s && hashA[a].margin_s.elder == b){
				result = 1;
			}
			else{
				result = -1;
			}
		}
		if(isNaN(result)){
			result = 1;
		}
		return result;
	};
	lowerSiblings.sort(sortByTop);

	for(var i = 0; i < lowerSiblings.length; i++){
		EDT.calcSiblingsMargin2(marginHash, lowerSiblings, "lower", i);
	}

	return marginHash;
};

EDT.calcSiblingsMargin2 = function(marginHash, siblings, position, i) {
	var minmargin = "";
	var minmarginid = "";
	var hashI = null;

	var sibidI = siblings[i];

	if(sibidI.match(/^spr.+$/)){
		hashI = PARAM.sprites;
	}
	else if(sibidI.match(/^grp.+$/)){
		hashI = PARAM.groups;
	}
	else{
		return;
	}

	for(var j = 0;j < i; j++){
		var sibidJ = siblings[j];
		var hashJ = null;
		if(sibidJ.match(/^spr.+$/)){
			hashJ = PARAM.sprites;
		}
		else if(sibidJ.match(/^grp.+$/)){
			hashJ = PARAM.groups;
		}
		else{
			continue;
		}

		if((hashJ[sibidJ].x <= hashI[sibidI].x && hashJ[sibidJ].x + hashJ[sibidJ].width >= hashI[sibidI].x)
			 || (hashJ[sibidJ].x <= hashI[sibidI].x + hashI[sibidI].width && hashJ[sibidJ].x + hashJ[sibidJ].width >= hashI[sibidI].x + hashI[sibidI].width)
			 || (hashJ[sibidJ].x >= hashI[sibidI].x && hashJ[sibidJ].x + hashJ[sibidJ].width <= hashI[sibidI].x + hashI[sibidI].width)){
				 if(position == "upper"){
					 // Use === instead of ==
					 if(minmargin === "" || minmargin > hashJ[sibidJ].y - (hashI[sibidI].y + hashI[sibidI].height)){
						 minmargin = hashJ[sibidJ].y - (hashI[sibidI].y + hashI[sibidI].height);
						 minmarginid = sibidJ;
					 }
				 }
				 else{
					 // Use === instead of ==
					 if(minmargin === "" || minmargin > (hashI[sibidI].y) - (hashJ[sibidJ].y + hashJ[sibidJ].height)){
						 minmargin = hashI[sibidI].y - (hashJ[sibidJ].y + hashJ[sibidJ].height);
						 minmarginid = sibidJ;
					 }
				 }
			 }
	}

	if(minmargin !== "" && minmargin > -32){
		if(!hashI[sibidI].margin_s){
			hashI[sibidI].margin_s = {};
			hashI[sibidI].margin_s.pixel = "";
		}

		var pos = "";
		if(position == "upper"){
			pos = "TB";
		}
		else{
			pos = "BT";
		}

		if(hashI[sibidI].margin_s.pixel != minmargin || hashI[sibidI].margin_s.elder != minmarginid || hashI[sibidI].margin_s.position != pos){
			hashI[sibidI].margin_s.pixel = minmargin;
			hashI[sibidI].margin_s.elder = minmarginid;
			hashI[sibidI].margin_s.position = pos;
			if(marginHash[sibidI] === undefined){
				marginHash[sibidI] = {};
			}
			marginHash[sibidI].pixel = minmargin;
			marginHash[sibidI].elder = minmarginid;
			marginHash[sibidI].position = pos;
		}
	}
	else if(position == "upper" && minmargin === ""){
		if(hashI[sibidI].y + hashI[sibidI].height < 0){
			if(!hashI[sibidI].margin_s){
				hashI[sibidI].margin_s = {};
				hashI[sibidI].margin_s.pixel = "";
			}
			hashI[sibidI].margin_s.pixel = 0 - (hashI[sibidI].y + hashI[sibidI].height);
			hashI[sibidI].margin_s.elder = "root";
			hashI[sibidI].margin_s.position = "TB";
			if(marginHash[sibidI] === undefined){
				marginHash[sibidI] = {};
			}
			marginHash[sibidI].pixel = 0 - (hashI[sibidI].y + hashI[sibidI].height);
			marginHash[sibidI].elder = "root";
			marginHash[sibidI].position = "TB";
		}
	}
	else{
		// no sibling
		if(hashI[sibidI].margin_s){
			if(hashI[sibidI].margin_s.pixel || hashI[sibidI].margin_s.elder || hashI[sibidI].margin_s.position){
				delete(hashI[sibidI].margin_s.pixel);
				delete(hashI[sibidI].margin_s.elder);
				delete(hashI[sibidI].margin_s.position);
				if(marginHash[sibidI] === undefined){
					marginHash[sibidI] = {};
				}
				marginHash[sibidI] = "";
			}
		}
	}

	return marginHash;
};


// ------------------------------------------------------------------------------------
// Create sprite

// --------------------------------
// Create comment

EDT.createComment = function() {
	PLG.ignoreMouseDown = true;
	PLG.ignoreMouseUp = true;
	EDT.parentOfComment = PLG.selection.currentFixed;
	PLG.selection.clear();

	var rect = {};
	rect.left = PARAM.sprites[EDT.parentOfComment.id].x + $("sprite-comment").offsetLeft;
	rect.top = PARAM.sprites[EDT.parentOfComment.id].y - $("spritemenu").offsetHeight;
	rect.width = EDT.DEFAULT_SPRITEWIDTH;
	// Redraw (hide spritemenu) after calculating offsetLeft/Height
	EDT.view.redraw();
	var contents = "<br>\n<div style='text-align:center'>New comment</div>\n<br>\n";
	EDT.createSprite(EDT.SAVE_NEWCOMMENTSPRITE, contents, EDT.generateNewID("spr", PARAM.sprites), rect);
};

EDT.generateNewID = function(prefix, hash) {
	var id = "";
	do{
		var rand0 = Math.floor(Math.random() * 10)
		var rand1 = Math.floor(Math.random() * 26)
		var rand2 = Math.floor(Math.random() * 26)
		var rand3 = Math.floor(Math.random() * 26)
		var rand4 = Math.floor(Math.random() * 26)
		id = prefix + rand0.toString() + EDT.sprName[rand1] + EDT.sprName[rand2] + EDT.sprName[rand3] + EDT.sprName[rand4];
	}
	while(hash[id]);
	return id;
};

EDT.createSpriteFromSubmenu = function() {
	EDT.submenu.close();

	var rect = {};
	rect.left = EDT.submenu.mouseX;
	rect.top = EDT.submenu.mouseY;
	rect.width = EDT.DEFAULT_SPRITEWIDTH;
	var contents = "<br>\n<div style='text-align:center'>New sprite</div>\n<br>\n";
	EDT.createSprite(EDT.SAVE_NEWCLICKSPRITE, contents, EDT.generateNewID("spr", PARAM.sprites), rect);
};

// -----------------------------------
// Create sprite
// saveMode : EDT.SAVE_NEWBUTTONSPRITE etc.
// contents : contents of new sprite
// newSpriteID : id of new sprite
// rectangle
//    left, top : position of new sprite
//    width : width of new sprite
//    height : height of new sprite
//    (height effects only if saveMode is EDT.SAVE_NEWDRAWINGSPRITE or
//     EDT.SAVE_NEWARROWSPRITE)
// -----------------------------------
EDT.createSprite = function(saveMode, contents, newSpriteID, rectangle) {
	if(saveMode === undefined){
		return;
	}
	if(newSpriteID === undefined || newSpriteID === ""){
		return;
	}

	var topOfNewSprite = 0;
	var leftOfNewSprite = 0;

	if(rectangle !== undefined && rectangle !== null){
		topOfNewSprite = rectangle.top;
		leftOfNewSprite = rectangle.left;
	}

	// Generate date and id
	var currentDate = new EDT.CurrentDate();
	var newSpriteDate = currentDate.getDate();

	// Generate properties
	var newAuthor = PARAM.author;
	var public_password = "";
	var public_author = "";
	if(newAuthor == "public"){
		public_password = $("cp_publicpass").value;
		public_author = $("cp_publicauthor").value;

		if(public_author === ""){
			public_author = "public";
		}
		if(public_password !== ""){
			newAuthor = "&lt;" + public_author + "&gt;";
		}
		else{
			newAuthor = "[" + public_author + "]";
		}
	}

	// Calculate z-index
	var topZ = PLG.ZIND.SPRITE_CREATEMIN;
	var topid = newSpriteID;
	for(var id in PARAM.sprites){
		if(!id.match(/^spr.+$/)){
			continue;
		}
		var tmpZ = PARAM.sprites[id].z;
		if(tmpZ >= topZ && tmpZ <= PLG.ZIND.SPRITE_MAX){
			topZ = tmpZ;
			topid = id;
		}
	}
	if(topid != newSpriteID){
		if(topZ < PLG.ZIND.SPRITE_CREATEMIN){
			topZ = PLG.ZIND.SPRITE_CREATEMIN;
		}
		if(topZ < PLG.ZIND.SPRITE_MAX){
			topZ = parseFloat(topZ) + 1;
		}
		else{
			topZ = PLG.ZIND.SPRITE_MAX;
		}
	}

	PARAM.sprites[newSpriteID] = {};
	// These properties are not backuped
	// in backupSpriteProperties() and backupDynamicProperties()
	PARAM.sprites[newSpriteID].created_time = newSpriteDate;
	PARAM.sprites[newSpriteID].author = newAuthor;

	PARAM.sprites[newSpriteID].display = {};
	if(saveMode == EDT.SAVE_NEWDRAWINGSPRITE || saveMode == EDT.SAVE_NEWARROWSPRITE || saveMode == EDT.SAVE_NEWDROPSPRITE){
		PARAM.sprites[newSpriteID].display.author = 0;
		PARAM.sprites[newSpriteID].display.created_time = 0;
		PARAM.sprites[newSpriteID].display.uri = 0;
		if(saveMode == EDT.SAVE_NEWARROWSPRITE){
			PARAM.sprites[newSpriteID].display.tag = 1;
		}
		else{
			PARAM.sprites[newSpriteID].display.tag = 0;
		}
	}
	else{
		PARAM.sprites[newSpriteID].display.author = 1;
		PARAM.sprites[newSpriteID].display.created_time = 1;
		PARAM.sprites[newSpriteID].display.uri = 1;
		PARAM.sprites[newSpriteID].display.tag = 1;
	}

	PARAM.sprites[newSpriteID].tag = "";


	// Create sprite node
	var newSprite = PLG.createElm("div", newSpriteID);

//	$("spriteslist").appendChild(newSprite);
	$("spriteslist").insertBefore(newSprite, $("spriteslist").firstChild);

	if(PLG.browser.msie || PLG.browser.msie7){
		newSprite.setAttribute("className", "sprite");
		// IE can not apply .css file here
		newSprite.style.cssText = "width:" + rectangle.width + "px; left:" + leftOfNewSprite + "px; top:" + topOfNewSprite + "px; z-index:" + topZ + "; border-width:0px; border-style:none; border-color:#ffffff;" + " margin: 0px; padding: 0px; position: absolute; overflow: visible; cursor: auto;";
	}
	else{
		newSprite.setAttribute("class", "sprite");
		newSprite.style.width = rectangle.width + "px";
		newSprite.style.left = leftOfNewSprite + "px";
		newSprite.style.top = topOfNewSprite + "px";
		newSprite.style.zIndex = topZ;
		newSprite.style.borderWidth = "0px";
		newSprite.style.borderStyle = "none";
		newSprite.style.borderColor = "#ffffff";
	}

	var regionElm = PLG.createElm("div");
	if(PLG.browser.msie || PLG.browser.msie7){
		regionElm.setAttribute("className", "region");
		if(PLG.browser.msie){
			regionElm.style.cssText = "left: 0px; margin: 0px; border: 0px; padding: 1px; width:" + (rectangle.width - 2) + "px; float: left; overflow:hidden";
		}
		else{
			regionElm.style.cssText = "left: 0px; margin: 0px; border: 0px; padding: 1px; width:" + (rectangle.width - 2) + "px; float: left;";
		}
	}
	else{
		regionElm.style.width = (rectangle.width - 2) + "px";
		regionElm.setAttribute("class", "region");
	}

	newSprite.onmouseover = PLG.spriteOnMouseOver;
	newSprite.appendChild(regionElm);

	var contentsElm = PLG.createElm("div");
	// contentsElm must be added to DOM here for insert canvas if
	// EDT.SAVE_NEWDRAWINGSPRITE
	regionElm.appendChild(contentsElm);

	if(PLG.browser.msie || PLG.browser.msie7){
		contentsElm.setAttribute("className", "contents");
	}
	else{
		contentsElm.setAttribute("class", "contents");
	}
	contentsElm.appendChild(document.createTextNode(""));

	if(saveMode == EDT.SAVE_NEWDRAWINGSPRITE || saveMode == EDT.SAVE_NEWARROWSPRITE){
		contentsElm.innerHTML = contents;

		contentsElm.style.borderWidth = "0px";
		contentsElm.style.borderStyle = "none";
		contentsElm.style.borderColor = "#000000";
		// Attention!! IE cannot insert canvas via innerHTML
		if(PLG.browser.msie || PLG.browser.msie7){
			contents.match(/(PLG.draw\(.+?\);)/i);
			var drawCommandStr = RegExp.$1;
			// It's a queer hack.
			// Dummy element (<canvas></canvas>) is needed to set <script>
			// element to innerHTML in IE.
			contentsElm.innerHTML = "<canvas id='tmpcanvas'></canvas><script type='text/javascript'>\n<!--\n" + drawCommandStr + "\n// -->\n</script>";
			var canvasElm = PLG.createElm("canvas", newSpriteID + "_canvas");
			canvasElm.width = rectangle.width;
			canvasElm.height = rectangle.height;
			contentsElm.appendChild(canvasElm);
			G_vmlCanvasManager.initElement(canvasElm);

			// Dummy element (<canvas></canvas>) is needed to set <script>
			// element to innerHTML in IE.
			// <script> must be added twice to add both <canvas> and <script> here.
			contentsElm.insertAdjacentHTML("beforeEnd", "<canvas id='tmpcanvas2'></canvas><script type='text/javascript'>\n<!--\n" + drawCommandStr + "\n// -->\n</script>");
			contentsElm.removeChild($("tmpcanvas"));
			contentsElm.removeChild($("tmpcanvas2"));
		}
		PLG.canvasSpriteExists = true;
	}
	else if(saveMode == EDT.SAVE_NEWDROPSPRITE){
		contentsElm.innerHTML = contents;
		contentsElm.style.borderWidth = "0px";
		contentsElm.style.borderStyle = "none";
		contentsElm.style.borderColor = "#000000";
//		contentsElm.style.padding = "0px";
		PLG.setContentsPadding(contentsElm, 0);
	}
	else{
		contentsElm.innerHTML = contents;
		contentsElm.style.borderWidth = "1px";
		contentsElm.style.borderStyle = "solid";
		contentsElm.style.borderColor = "#a0a0a0";
		if(saveMode == EDT.SAVE_NEWPAGESPRITE){
			contentsElm.style.color = "#000000";
		}
		else{
			contentsElm.style.color = "#a0a0a0";
		}
//		contentsElm.style.padding = "0px";
		PLG.setContentsPadding(contentsElm, 0);
		contentsElm.style.backgroundColor = "#ffffff";
	}

	var infoElm = PLG.createElm("div");
	regionElm.appendChild(infoElm);
	if(PLG.browser.msie || PLG.browser.msie7){
		infoElm.style.cssText = "width: 100%; font-size: 80%; left: 0px; right: 0px; margin: 0px; padding: 0px; border: 0px;";
		infoElm.setAttribute("className", "info");
	}
	else{
		infoElm.setAttribute("class", "info");
	}

	if(saveMode != EDT.SAVE_NEWDRAWINGSPRITE && saveMode != EDT.SAVE_NEWARROWSPRITE){
		EDT.setSpriteInfo(newSprite);
	}

	var pluginElm = PLG.createElm("span");
	pluginElm.setAttribute("class", "plugin");
	pluginElm.appendChild(document.createTextNode(""));
	pluginElm.style.display = "none";
	if(PLG.browser.msie || PLG.browser.msie7){
		pluginElm.setAttribute("className", "plugin");
	}
	newSprite.appendChild(pluginElm);

	if(saveMode == EDT.SAVE_NEWDRAWINGSPRITE || saveMode == EDT.SAVE_NEWARROWSPRITE){
		PARAM.sprites[newSpriteID].isDrawing = true;
	}

	if(saveMode == EDT.SAVE_NEWCLICKSPRITE){
		// New sprite will be saved after the editor is closed.

		// Backup properties after newsprite is displayed
		PLG.backupSpriteProperties(newSprite);
		PLG.backupDynamicProperties(newSprite);

		PLG.selection.fix(newSpriteID, true);
		EDT.view.redraw();

		if(PLG.zooming){
			newSprite.style.overflow = "hidden";
			PLG.getSpriteContents(newSprite).style.overflow = "hidden";
			PLG.getSpriteInfo(newSprite).style.overflow = "hidden";
			PLG.drawZoomMap();
		}

		EDT.editor.isNewSprite = true;
		EDT.editor.open();

	}
	else{

		PLG.backupSpriteProperties(newSprite);
		if(saveMode == EDT.SAVE_NEWDRAWINGSPRITE || saveMode == EDT.SAVE_NEWARROWSPRITE){
			PARAM.sprites[newSpriteID].innerHTML = contents;
		}
		PLG.backupDynamicProperties(newSprite);

		// Save
		var saveObj = [];
		saveObj[0] = {};
		saveObj[0].left = leftOfNewSprite;
		saveObj[0].top = topOfNewSprite;
		saveObj[0].width = rectangle.width;
		saveObj[0].height = PLG.sprHeight(newSprite);
		saveObj[0].zIndex = topZ;


		saveObj[0].innerHTMLPost = encodeURIComponent(contents);
		saveObj[0].public_password = public_password;
		saveObj[0].public_author = encodeURIComponent(public_author);
		saveObj[0].authorName = encodeURIComponent(newAuthor);

		saveObj[0].attachedfilenamepost = "";
		saveObj[0].pluginEnc = "";
		saveObj[0].tag = "";
		saveObj[0].createdtime = newSpriteDate;

		saveObj[0].id = newSpriteID;


		if(saveMode == EDT.SAVE_NEWDRAWINGSPRITE || saveMode == EDT.SAVE_NEWARROWSPRITE){
			saveObj[0].borderWidth = 0;
			saveObj[0].borderStyle = "none";
			saveObj[0].padding = 0;
			saveObj[0].borderColor = "#000000";
			saveObj[0].bgColor = "";
			saveObj[0].color = "#000000";

			saveObj[0].showAuthorFlag = 0;
			saveObj[0].showTimeFlag = 0;
			saveObj[0].showUriFlag = 0;
			if(saveMode == EDT.SAVE_NEWARROWSPRITE){
				saveObj[0].showTagFlag = 1;
			}
			else{
				saveObj[0].showTagFlag = 0;
			}
		}
		else if(saveMode == EDT.SAVE_NEWDROPSPRITE){
			saveObj[0].borderWidth = 0;
			saveObj[0].borderStyle = "none"
			saveObj[0].padding = 0;
			saveObj[0].borderColor = "#000000";
			saveObj[0].bgColor = "";
			saveObj[0].color = "#000000";

			saveObj[0].showAuthorFlag = 0;
			saveObj[0].showTimeFlag = 0;
			saveObj[0].showUriFlag = 0;
			saveObj[0].showTagFlag = 0;
		}
		else{
			saveObj[0].borderWidth = parseInt(contentsElm.style.borderTopWidth.replace(/px/g, ""));
			saveObj[0].borderStyle = contentsElm.style.borderTopStyle;
			saveObj[0].padding = parseInt(contentsElm.style.padding.replace(/px/g, ""));
			saveObj[0].borderColor = contentsElm.style.borderTopColor;
			saveObj[0].bgColor = contentsElm.style.backgroundColor;
			saveObj[0].color = contentsElm.style.color;

			saveObj[0].showAuthorFlag = 1;
			saveObj[0].showTimeFlag = 1;
			saveObj[0].showUriFlag = 1;
			saveObj[0].showTagFlag = 1;
		}
		
		var idobj = EDT.getArrowSrcDstFromSpriteID(newSpriteID);
		if(idobj !== null){
			var linkCommand = "link," + idobj.src + "," + idobj.dst;
			saveObj[0].linkCommand = linkCommand;
		}

		var newSprites = [];
		newSprites.push(newSprite);
		EDT.saveSprite(newSprite, newSprites, saveMode, saveObj);
	}

};

// -----------------------------------
// Create New Page

EDT.createPageFromSubmenu = function() {
	if(PARAM.create_page == 1){
		EDT.submenu.close();
		EDT.createPage(EDT.submenu.mouseX, EDT.submenu.mouseY);
	}
};

EDT.createPage = function(x, y) {
	if(EDT.editor.mode != EDT.EDITOR_CLOSE){
		return;
	}
	if(EDT.currenttool != EDT.TOOL_NORMAL){
		return;
	}

	var tmppagetitle = document.title;
	var leftBraceChar = "(";
	var rightBraceChar = ")";

	var pageNumber = 0;
	var pagetitleArray = tmppagetitle.split(" ");
	if(pagetitleArray.length == 1){
		pageNumber = 2;
	}
	else{
		pageNumber = pagetitleArray[pagetitleArray.length - 1];
		var matchNumber = pageNumber.match(/\d+/);
		if(matchNumber){
			if(pageNumber.match(/\[/)){
				leftBraceChar = "[";
				rightBraceChar = "]";
			}

			if(pageNumber.match(/\{/)){
				leftBraceChar = "{";
				rightBraceChar = "}";
			}

			if(pageNumber.match(/#/)){
				leftBraceChar = "#";
				rightBraceChar = "";
			}

			matchNumber = matchNumber.toString();
			if(PARAM.language == "ja"){
				matchNumber = PLG.numberZenkakuToHankaku(matchNumber);
			}

			pageNumber = parseInt(matchNumber) + 1;
			tmppagetitle = pagetitleArray[0] + " ";
			for(var i = 1;i < pagetitleArray.length - 1; i++){
				tmppagetitle += pagetitleArray[i] + " ";
			}
		}
		else{
			pageNumber = 2;
		}
	}

	var newpagetitle = window.prompt(MESSAGE.ENTERNEWPAGETITLE, tmppagetitle + " " + leftBraceChar + pageNumber + rightBraceChar);
	if(newpagetitle === ""){
		$("controlresult").innerHTML = MESSAGE.TITLEISNOTENTERED;
		PLG.ignoreMouseDown = true;
		return;
	}
	else if(newpagetitle === undefined || newpagetitle === null){
		return;
	}

	var top = 0;
	var left = 0;
	if(x && y){
		left = x;
		top = y;
	}
	else{
		left = 5 + PLG.viewPositionX + Math.floor(Math.random() * 70);
		top = 100 + PLG.viewPositionY + Math.floor(Math.random() * 30);
		if(PARAM.page_type == "map"){
			left -= Math.round(PLG.getInnerWidth() / 2);
			top -= Math.round(PLG.getInnerHeight() / 2);
		}
	}
	var rect = {};
	rect.left = left;
	rect.top = top;
	rect.width = EDT.DEFAULT_SPRITEWIDTH;

	var createPageOnLoaded = function(obj) {
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		var resArray = res.split(",");
		if(resArray[0] != "succeed"){
			$("controlresult").innerHTML = EDT.getResponseText(res);
			return;
		}
		var newPageid = resArray[1];
		var link = "<a href='./positlog.cgi?load=" + newPageid + "'>" + newpagetitle + "</a>";
		if(PARAM.mod_rewrite == 1){
			link = "<a href='./" + newPageid + ".html'>" + newpagetitle + "</a>";
		}
		EDT.createSprite(EDT.SAVE_NEWPAGESPRITE, link, EDT.generateNewID("spr", PARAM.sprites), rect);
	};

	PLG.sendRequest(createPageOnLoaded, "&pageid=" + PARAM.pageid + "&top=" + top + "&left=" + left + "&newpagetitle=" + newpagetitle, "POST", PARAM.CGIFILEPATH + "createPage.cgi", true, true);

};

// ---------------------------------------------------------------------------------------------------------
// Events

EDT.onResize = function() {
	if(EDT.currenttool == EDT.TOOL_DRAWING){
		return false;
	}

	$("currentposition").innerHTML = "<a href='" + PLG.currentURL + "'>url</a>";

	// Close modal dialog under positlogbody
	if(EDT.colorpicker.mode != EDT.PICKER_CLOSE){
		EDT.colorpicker.close();
	}
	if(EDT.plugin.mode != EDT.PLUGIN_CLOSE){
		EDT.plugin.close();
	}

	PLG.initializeWidgets();
	PLG.resizeWorld();

	if(PARAM.page_type == "map"){
		PLG.setViewPosition(PLG.viewPositionX, PLG.viewPositionY);
	}

	var hbtn = $("homebtn");
	hbtn.style.top = $("controlpanel").offsetHeight + "px";
	PLG.redrawViewCanvas();
	PLG.redrawMapCanvas();
};

EDT.spriteOnMouseOver = function(elm, e) {
	if(PLG.state == PLG.STATES.WORKING){
		PLG.selection.add(elm.id);
		PLG.state = PLG.STATES.SELECTED;
	}
	else if(PLG.state == PLG.STATES.SELECTED){
		PLG.selection.remove(PLG.selection.current.id);
		PLG.selection.add(elm.id);
	}
	else if(PLG.state == PLG.STATES.FIXED){
		if(!EDT.view.isConnectorVisible){
			PLG.state = PLG.STATES.FIXEDSELECTED;
			PLG.selection.add(elm.id);
		}
	}
	else if(PLG.state == PLG.STATES.FIXEDSELECTED){
		if(!EDT.view.isConnectorVisible){
			// select another sprite
			if(PLG.selection.current != elm && !PLG.selection.isFixed(PLG.selection.current.id)){
				PLG.selection.remove(PLG.selection.current.id);
			}
			PLG.selection.add(elm.id);
		}
	}
	else if(PLG.state == PLG.STATES.EDITING){
		if(!PLG.selection.isFixed(elm.id)){
			PLG.state = PLG.STATES.EDITINGSELECTED;
			PLG.selection.add(elm.id);
		}
	}
	else if(PLG.state == PLG.STATES.MOVING){
		if(!PLG.selection.isFixed(elm.id)){
			PLG.state = PLG.STATES.MOVINGSELECTED;
			PLG.selection.add(elm.id);
		}
	}

	EDT.view.redraw(e);
};

EDT.clearSelectedSprite = function(e) {
	if(PLG.state == PLG.STATES.SELECTED){
		PLG.state = PLG.STATES.WORKING;
		PLG.selection.clear();
		EDT.view.redraw(e);
	}
	else if(PLG.state == PLG.STATES.FIXEDSELECTED){
		PLG.state = PLG.STATES.FIXED;
		if(!PLG.selection.isFixed(PLG.selection.current.id)){
			PLG.selection.remove(PLG.selection.current.id);
		}
		EDT.view.redraw(e);
	}
	else if(PLG.state == PLG.STATES.EDITINGSELECTED){
		PLG.state = PLG.STATES.EDITING;
		PLG.selection.remove(PLG.selection.current.id);
		EDT.view.redraw(e);
	}
	else if(PLG.state == PLG.STATES.MOVINGSELECTED){
		PLG.state = PLG.STATES.MOVING;
		PLG.selection.remove(PLG.selection.current.id);
		EDT.view.redraw(e);
	}

};

EDT.onMouseDown = function(e) {
	if(PLG.handTool){
		return true;
	}

	EDT.submenu.ignoreFlag = false;
	EDT.submenu.close();
	EDT.submenu.normalContext = false;

	if(EDT.getCtrlKey(e)){

		if(EDT.modalDialogIsOpened()){
			return true;
		}
		else if((PLG.state == PLG.STATES.FIXEDSELECTED || PLG.state == PLG.STATES.SELECTED) 
						&& !PLG.selection.current.id.match(/_link$/) 
						&& (PLG.selection.currentFixed === null || !PLG.selection.currentFixed.id.match(/_link$/))){
			// Multiple selection
			if(PLG.selection.isFixed(PLG.selection.current.id)){
				var tmpCurrentId = PLG.selection.current.id;
				var tmpCurrentFixedId = PLG.selection.currentFixed.id;
				PLG.selection.remove(PLG.selection.current.id);
				PLG.selection.add(tmpCurrentId);

				if(!PLG.selection.isFixed(tmpCurrentFixedId)){
					if(PLG.selection.length() > 0){
						for(var sid in PLG.selection.allsprites){
							if(!sid.match(/^spr.+$/)){
								continue;
							}
							if(PLG.selection.allsprites[sid].fixed){
								PLG.selection.currentFixed = $(sid);
							}
						}
					}
				}
			}
			else{
				PLG.selection.fix(PLG.selection.current.id, false);
			}

			if(PLG.selection.length() === 0){
				PLG.state = PLG.STATES.SELECTED;
			}
			else{
				PLG.state = PLG.STATES.FIXEDSELECTED;
			}
		}
		else if(PLG.browser.opera){
			EDT.submenu.open(e, false);
			return true;
		}

	}
	else if(PLG.state == PLG.STATES.WORKING){
		if(EDT.modalDialogIsOpened()){
			return true;
		}
		else{
			// Case double click
			if(PLG.mouseXonWorld(e) - EDT.prevMouseDownXonWorld === 0 && PLG.mouseYonWorld(e) - EDT.prevMouseDownYonWorld === 0){
//			if(!PLG.browser.msie && !PLG.browser.msie7){
				// Ignore submenu in the case of (1st) Left click, (2nd) Right click
//				EDT.submenu.ignoreFlag = true;
//				var rect = {};
//				rect.left = EDT.prevMouseDownXonWorld;
//				rect.top = EDT.prevMouseDownYonWorld;
//				rect.width = EDT.DEFAULT_SPRITEWIDTH;
//				var contents = "<br>\n<div style='text-align:center'>New sprite</div>\n<br>\n";
//				EDT.createSprite(EDT.SAVE_NEWCLICKSPRITE, contents, EDT.generateNewID("spr", PARAM.sprites), rect);
//			}
			}
		}
	}
	else if(PLG.state == PLG.STATES.FIXED){
		// Check region of spritemenu
		if(PLG.mouseXonWorld(e) > $("spritemenu").offsetLeft 
			 && PLG.mouseXonWorld(e) < $("spritemenu").offsetLeft + $("spritemenu").offsetWidth 
			 && PLG.mouseYonWorld(e) > $("spritemenu").offsetTop 
			 && PLG.mouseYonWorld(e) < $("spritemenu").offsetTop + $("spritemenu").offsetHeight){
			return true;
		}
		PLG.selection.clear();
		PLG.state = PLG.STATES.WORKING;

		EDT.view.redraw(e);
		return false;
	}
	else if(PLG.state == PLG.STATES.FIXEDSELECTED){
		if(EDT.modalDialogIsOpened()){
			if($("colorpicker")){
//				EDT.spoit(PLG.selection.current);
			}
		}
		else{
			if(!PLG.selection.isFixed(PLG.selection.current.id)){
				var tmpid = PLG.selection.current.id;

				if(PLG.selection.isMultiFixed() === 0){
					PLG.selection.remove(PLG.selection.currentFixed.id);
				}
				else{
					PLG.selection.clear();
				}

				PLG.selection.fix(tmpid, false);
			}
			else{
				if(PLG.selection.currentFixed == PLG.selection.current){
					if(PLG.mouseXonWorld(e) - EDT.prevMouseDownXonWorld === 0 && PLG.mouseYonWorld(e) - EDT.prevMouseDownYonWorld === 0){
						EDT.submenu.ignoreFlag = true;
//						if(!PLG.browser.msie && !PLG.browser.msie7){
//						if(!PARAM.sprites[PLG.selection.currentFixed.id].isDrawing && PARAM.sprites[PLG.selection.currentFixed.id].template != 1){
//							EDT.editor.open();
//						}
//					}
					}
				}
				else{
					PLG.selection.fix(PLG.selection.current.id, false);
				}
			}
		}
	}
	else if(PLG.state == PLG.STATES.SELECTED){
		if(EDT.modalDialogIsOpened()){
			return;
		}
		else{
			PLG.state = PLG.STATES.FIXEDSELECTED;
			PLG.selection.fix(PLG.selection.current.id, false);
		}
	}
	else if(PLG.state == PLG.STATES.EDITING){
		if(EDT.modalDialogIsOpened()){
			return;
		}
	}
	else if(PLG.state == PLG.STATES.EDITINGSELECTED){
		if(EDT.modalDialogIsOpened()){
			if($("colorpicker")){
//				EDT.spoit(PLG.selection.current);
			}
		}
	}

	EDT.view.redraw(e);

	EDT.prevMouseDownXonWorld = PLG.mouseXonWorld(e);
	EDT.prevMouseDownYonWorld = PLG.mouseYonWorld(e);

	return true;
};

EDT.onMouseMove = function(e, moveX, moveY) {
	if(PLG.handTool){
		return;
	}

	// Move sprite
	if(PLG.state == PLG.STATES.MOVING || PLG.state == PLG.STATES.MOVINGSELECTED){
		EDT.sumOfSpriteMoveX += moveX;
		EDT.sumOfSpriteMoveY += moveY;
		var groups = [];
		for(var id in PLG.selection.allsprites){
			if(id.match(/^spr.+$/)){
				if(PLG.selection.isFixed(id)){
					PARAM.sprites[id].x += moveX;
					PARAM.sprites[id].y += moveY;
					if(PLG.zoom == 1.0){
						$(id).style.left = (PARAM.sprites[id].x) + "px";
						$(id).style.top = (PARAM.sprites[id].y) + "px";
					}
					else{
						PLG.drawZoomMap();
					}
					if(PARAM.sprites[id].groupid){
						groups.push(PARAM.sprites[id].groupid);
					}
				}
			}
		}

		var movedHash = {};
		while(groups.length > 0){
			var gid = groups.pop();
			if(PARAM.groups[gid].groupid){
				groups.push(PARAM.groups[gid].groupid);
			}
			if(movedHash[gid]){
				continue;
			}
			movedHash[gid] = 1;
			PARAM.groups[gid].x += moveX;
			PARAM.groups[gid].y += moveY;
			if($(gid)){
				$(gid).style.left = PARAM.groups[gid].x + "px";
				$(gid).style.top = PARAM.groups[gid].y + "px";
			}
		}
	}
	else if(PLG.state == PLG.STATES.SCALING){
		// Scale single Sprite
		var spr = PLG.selection.currentFixed;
		var id = PLG.selection.currentFixed.id;
		var scalerElm = $("sprite-scaler");

		var newWidth = PARAM.sprites[id].width + moveX;
		if(newWidth < EDT.SPRITEWIDTH_MIN){
			newWidth = EDT.SPRITEWIDTH_MIN;
		}

		if(PLG.zoom != 1.0){
			PARAM.sprites[id].width = newWidth;
			PLG.backupDynamicProperties(spr);
			PLG.drawZoomMap();
		}
		else{
			spr.style.width = newWidth + "px";
			var regionElm = PLG.getSpriteRegion(spr);
			regionElm.style.width = (newWidth - 2) + "px";

			PLG.backupDynamicProperties(spr);
		}

		var width = EDT.getMenuWidth(Math.round(newWidth * PLG.zoom));
		$("spritemenu").style.width = width + "px";

		scalerElm.style.left = (PLG.sprLeft(spr) + PLG.sprWidth(spr) - 18) + "px";
		scalerElm.style.top = (PLG.sprTop(spr) + PLG.sprHeight(spr) - 18) + "px";
	}
};

EDT.onMouseUp = function(e) {
	if(PLG.handTool){
		return;
	}

	if(EDT.parentOfComment !== null){
		PLG.state = PLG.STATES.MOVING;
		EDT.parentOfComment = null;
		EDT.view.redraw(e);
	}

	if(PLG.state == PLG.STATES.MOVING || PLG.state == PLG.STATES.MOVINGSELECTED){
		PLG.waitSavingFlag = true;
//		PLG.startProcessingAnime();
		EDT.saveStyles(PLG.selection.currentFixed);

		var mask = $("screenmask");
		mask.style.display = "none";
	}
	else if(PLG.state == PLG.STATES.SCALING){
		PLG.waitSavingFlag = true;
		PLG.startProcessingAnime();

		EDT.view.redraw(e);

		if(PARAM.sprites[PLG.selection.currentFixed.id].groupid){
			var gid = PARAM.sprites[PLG.selection.currentFixed.id].groupid
			PLG.calcRegionsOfGroup(gid);
			while(PARAM.groups[gid] && PARAM.groups[gid].groupid){
				gid = PARAM.groups[gid].groupid;
				PLG.calcRegionsOfGroup(gid);
			}
		}

		EDT.saveStyles(PLG.selection.currentFixed, true);

		var mask = $("screenmask");
		mask.style.display = "none";
	}

	EDT.commentFlag = false;
};

EDT.oncontextmenu = function(e) {

	if(PLG.browser.opera){
		return false;
	}

	if(EDT.modalDialogIsOpened()){
		return true;
	}
	if(PLG.mouseYonBrowser(e) < $("controlpanel").offsetHeight){
		return true;
	}

	if(EDT.getCtrlKey(e)){
		return true;
	}

	if(PLG.mouseXonBrowser(e) > $("footer").offsetLeft && PLG.mouseYonBrowser(e) > $("footer").offsetTop){
		return true;
	}

	if(PLG.state == PLG.STATES.FIXEDSELECTED){
		if(!PLG.selection.isFixed(PLG.selection.current.id)){
			var tmpid = PLG.selection.current.id;
			PLG.selection.remove(PLG.selection.currentFixed.id);
			PLG.selection.fix(tmpid, false);
			EDT.view.redraw(e);
		}
	}
	else{
		// check region of spritemenu
		var mouseX = PLG.mouseXonWorld(e);
		var mouseY = PLG.mouseYonWorld(e);
		if(mouseX > $("spritemenu").offsetLeft && mouseX < $("spritemenu").offsetLeft + $("spritemenu").offsetWidth && mouseY > $("spritemenu").offsetTop && mouseY < $("spritemenu").offsetTop + $("spritemenu").offsetHeight){
			// nop
		}
		else if(PLG.state == PLG.STATES.SELECTED){
			PLG.state = PLG.STATES.FIXEDSELECTED;
			PLG.selection.fix(PLG.selection.current.id, false);
			EDT.view.redraw(e);
		}
		else{
			PLG.selection.clear();
			PLG.state = PLG.STATES.WORKING;
			EDT.view.redraw(e);
		}
	}

	if(PLG.browser.msie || PLG.browser.msie7){	
		var select = document.selection.createRange().text;
		if(select.length > 0){
			return true;
		}
	}
	else{
		var select = window.getSelection();
		if(select !== null && select.focusOffset - select.anchorOffset !== 0){
			return true;
		}
	}

	if(EDT.submenu.normalContext){
		EDT.submenu.close();
		return true;
	}
	else{
		EDT.submenu.open(e, false);
		return false;
	}
};

EDT.getCtrlKey = function(e) {
	if(PLG.browser.msie || PLG.browser.msie7){
		if(event){
			return event.ctrlKey;
		}
		else{
			return false;
		}
	}
	else if(PLG.browser.mac && !PLG.browser.opera){
		if(e){
			return e.metaKey;
		}
		else{
			return false;
		}
	}
	else{
		if(e){
			return e.ctrlKey;
		}
		else{
			return false;
		}
	}
};

EDT.onkeyup = function(e) {
	if(PLG.focusedField !== ""){
		if(PLG.focusedField == "tagfield"){
			if(PLG.focusedFieldText != $("tagfield").value){
				EDT.view.setPropertyDirty(true);
			}
		}
		else if(PLG.focusedField == "hexinput"){
			if(PLG.focusedFieldText != $("hexinput").value && $("hexinput").value.length == 6){
				$("hexsetbtn").style.display = "block";
			}
		}
		return;
	}
	if(EDT.ctrlKey){
		if(EDT.ctrlKey != EDT.getCtrlKey(e)){
			EDT.ctrlKey = EDT.getCtrlKey(e);
			if(PLG.state == PLG.STATES.FIXEDSELECTED || PLG.state == PLG.STATES.SELECTED || PLG.state == PLG.STATES.FIXED){
				EDT.view.redraw(e); // Check if ctrl key is down
			}
		}
	}

	if(PLG.handTool){
		var theDay = new Date();

		if(theDay.getTime() - PLG.keyPressStartTime < 500){
			var moveY = PLG.getInnerHeight() - 50;
			var top = parseInt(PLG.viewPositionY) + moveY;
			PLG.setViewPosition(PLG.viewPositionX, top);
		}

		PLG.keyPressStartTime = 0;
	}
	PLG.handTool = false;
	var mask = $("screenmask");
	if(mask.style.display == "block"){
		mask.style.display = "none";
	}

};

EDT.onkeydown = function(e) {
	if(PLG.focusedField !== ""){
		return;
	}
	if(!EDT.ctrlKey){
		if(EDT.ctrlKey != EDT.getCtrlKey(e)){
			EDT.ctrlKey = EDT.getCtrlKey(e);
			if(PLG.state == PLG.STATES.FIXEDSELECTED || PLG.state == PLG.STATES.SELECTED || PLG.state == PLG.STATES.FIXED){
				EDT.view.redraw(e); // Check if ctrl key is down
			}
		}
	}

	if(!(PLG.state == PLG.STATES.WORKING || PLG.state == PLG.STATES.SELECTED || PLG.state == PLG.STATES.FIXED || PLG.state == PLG.STATES.FIXEDSELECTED) || EDT.currenttool != EDT.TOOL_NORMAL){
		return;
	}

	// Mozilla(Firefox, NN) and Opera
	var keycode = PLG.getKeyCode(e);

	// Space key
	if(keycode == 32 || keycode == 229){
		PLG.handTool = true;
		if(PLG.keyPressStartTime == 0){
			var theDay = new Date();
			PLG.keyPressStartTime = theDay.getTime();

			var mask = $("screenmask");
			mask.style.left = "0px";
			mask.style.top = "0px";
			mask.style.width = PLG.getInnerWidth() + "px";
			mask.style.height = PLG.getInnerHeight() + "px";
			mask.style.display = "block";
		}
		return false;
	}
	
	if(keycode == 46 || (PLG.browser.mac && keycode == 8)){
		if(PLG.selection.currentFixed !== null){
			EDT.deleteDialog();
		}
		return false;
	}

	EDT.dokeyevents(keycode);
};

EDT.onkeypress = function(e) {
	if(PLG.focusedField !== ""){
		return;
	}

	if(PLG.ignoreKeyPressFlag){
		PLG.ignoreKeyPressFlag = false;
		return;
	}

	if(!(PLG.state == PLG.STATES.WORKING || PLG.state == PLG.STATES.SELECTED || PLG.state == PLG.STATES.FIXEDSELECTED) || EDT.currenttool != EDT.TOOL_NORMAL){
		return;
	}

	if(PLG.handTool){
		return;
	}

	var keycode = PLG.getKeyCode(e);

	if(PLG.browser.mac && keycode == 8){
		return false;
	}

	if(keycode == 36 || keycode == 8){
		return;
	}

	EDT.dokeyevents(keycode);
};

EDT.dokeyevents = function(keycode) {
	// 36 Home
	// 35 End
	// 33 PageUp
	// 34 PageDown
	// 38 up
	// 40 down
	// 37 left
	// 39 right
	// 32 space
	// 46 delete
	// 8 backspace
	// 16 shift

	if(keycode == 35){
		PLG.gotoBirdView();
	}
	else if(keycode == 36){
		PLG.moveToHomePosition();
	}
	else if(keycode == 8){
		// not to disturb drawingPassword
		// window.history.back();
	}
	else if(keycode == 33){
		PLG.ignoreKeyPressFlag = true;

		var scroll = Math.round(PLG.getInnerHeight() - 100);
		if(scroll < 0){
			scroll = PLG.getInnerHeight();
		}
		var top = parseInt(PLG.viewPositionY) - scroll;
		var left = parseInt(PLG.viewPositionX);
		var yoffset = 100;
		if(parseInt(PLG.viewPositionY) >= PLG.worldTop - yoffset
			 && PLG.worldTop - yoffset > top){
			top = PLG.worldTop - yoffset;
		}
		else if(parseInt(PLG.viewPositionY) <= PLG.worldBottom + yoffset
						&& PLG.worldBottom + yoffset < top){
			top = PLG.worldBottom + yoffset;
		}
		PLG.setViewPosition(left, top);
	}
	else if(keycode == 34 || keycode == 32){
		PLG.ignoreKeyPressFlag = true;

		var scroll = Math.round(PLG.getInnerHeight() - 100);
		if(scroll < 0){
			scroll = PLG.getInnerHeight();
		}
		var top = parseInt(PLG.viewPositionY) + scroll;
		var left = parseInt(PLG.viewPositionX);
		var yoffset = 100;
		if(parseInt(PLG.viewPositionY) >= PLG.worldTop - yoffset
			 && PLG.worldTop - yoffset > top){
			top = PLG.worldTop - yoffset;
		}
		else if(parseInt(PLG.viewPositionY) <= PLG.worldBottom + yoffset
						&& PLG.worldBottom + yoffset < top){
			top = PLG.worldBottom + yoffset;
		}
		PLG.setViewPosition(left, top);
	}
	else if(keycode == 38){
		var scroll = 50;
		var top = parseInt(PLG.viewPositionY) - scroll;
		var yoffset = 100;
		if(parseInt(PLG.viewPositionY) >= PLG.worldTop - yoffset
			 && PLG.worldTop - yoffset > top){
			top = PLG.worldTop - yoffset;
		}
		else if(parseInt(PLG.viewPositionY) <= PLG.worldBottom + yoffset
						&& PLG.worldBottom + yoffset < top){
			top = PLG.worldBottom + yoffset;
		}
		PLG.setViewPosition(parseInt(PLG.viewPositionX), top);
	}
	else if(keycode == 40){
		var scroll = 50;
		var top = parseInt(PLG.viewPositionY) + scroll;
		var yoffset = 100;

		if(parseInt(PLG.viewPositionY) >= PLG.worldTop - yoffset
			 && PLG.worldTop - yoffset > top){
			top = PLG.worldTop - yoffset;
		}
		else if(parseInt(PLG.viewPositionY) <= PLG.worldBottom + yoffset
						&& PLG.worldBottom + yoffset < top){
			top = PLG.worldBottom + yoffset;
		}

		PLG.setViewPosition(PLG.viewPositionX, top);
	}
	else if(keycode == 37){
		var scroll = 50;
		var left = PLG.viewPositionX - scroll;
		var xoffset = 100;
		if(parseInt(PLG.viewPositionX) >= PLG.worldLeft - xoffset
			 && PLG.worldLeft - xoffset > left){
			left = PLG.worldLeft - xoffset;
		}
		else if(parseInt(PLG.viewPositionX) <= PLG.worldRight + xoffset
						&& PLG.worldRight + xoffset < left){
			left = PLG.worldRight + xoffset;
		}
		PLG.setViewPosition(left, PLG.viewPositionY);
	}
	else if(keycode == 39){
		var scroll = 50;
		var left = PLG.viewPositionX + scroll;
		var xoffset = 100;
		if(parseInt(PLG.viewPositionX) >= PLG.worldLeft - xoffset
			 && PLG.worldLeft - xoffset > left){
			left = PLG.worldLeft - xoffset;
		}
		else if(parseInt(PLG.viewPositionX) <= PLG.worldRight + xoffset
						&& PLG.worldRight + xoffset < left){
			left = PLG.worldRight + xoffset;
		}
		PLG.setViewPosition(left, PLG.viewPositionY);
	}
};

// -------------------------------------------------------------------------------------------------------
// Group / Ungroup sprites

EDT.groupSprites = function() {
	var public_password = "";
	var passElm = $("cp_publicpass");
	if(passElm){
		public_password = passElm.value;
	}
	else{
		public_password = PLG.getCookie("public_password");
		if(public_password === undefined){
			public_password = "";
		}
	}

	var newgroupid = "";
	do{
		var rand0 = Math.floor(Math.random() * 10)
		var rand1 = Math.floor(Math.random() * 26)
		var rand2 = Math.floor(Math.random() * 26)
		var rand3 = Math.floor(Math.random() * 26)
		var rand4 = Math.floor(Math.random() * 26)
		newgroupid = "grp" + rand0.toString() + EDT.sprName[rand1] + EDT.sprName[rand2] + EDT.sprName[rand3] + EDT.sprName[rand4];
	}
	while(PARAM.group !== undefined && PARAM.group[newgroupid] !== undefined);

	var groupHash = {};
	for(var id in PLG.selection.hash){
		if(!id.match(/^spr.+$/) && !id.match(/^grp.+$/)){
			continue;
		}
		if(!PLG.selection.isFixed(id)){
			continue;
		}
		groupHash[id] = {};
	}

	PARAM.groups[newgroupid] = {};
	for(var id in groupHash){
		if(!id.match(/^spr.+$/) && !id.match(/^grp.+$/)){
			continue;
		}
		PARAM.groups[newgroupid][id] = {};
		if(id.match(/^spr.+$/)){
			PARAM.sprites[id].groupid = newgroupid;
			groupHash[id].y = PARAM.sprites[id].y;
		}
		else if(id.match(/^grp.+$/)){
			PARAM.groups[id].groupid = newgroupid;
			groupHash[id].y = PARAM.groups[id].y;
		}
	}

	PLG.calcRegionsOfGroup(newgroupid);

	var marginHash = EDT.calcMargin();
	EDT.rebuildYoungerArray();

	var adjustedTop = {};
	if(PLG.marginIsAdjusted){
		PLG.marginIsAdjusted = false;
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				adjustedTop[id] = PARAM.sprites[id].y;
			}
			else if(id.match(/^grp.+$/)){
				adjustedTop[id] = PARAM.groups[id].y;
			}
		}
	}
	
	var groupSpriteOnLoaded = function(obj) {
		var firstSprite;
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		$("controlresult").innerHTML = EDT.getResponseText(res);
		if(res != "succeed"){
			groupHash = null;
			EDT.restoreHashes();
			return;
		}
		else{
			groupHash = null;

			EDT.backupHashes();

			PLG.state = PLG.STATES.FIXED;
			var tmpid = PLG.selection.currentFixed.id;
			PLG.selection.clear();
			PLG.selection.fix(tmpid);
			EDT.view.redraw();
		}
	};

	PLG.sendRequest(groupSpriteOnLoaded, "&pageid=" + PARAM.pageid + "&groupid=" + newgroupid + "&public_password=" + public_password + "&items=" + groupHash.toJSONString() + "&margin=" + marginHash.toJSONString() + "&adjustedTop=" + adjustedTop.toJSONString(), "POST", PARAM.CGIFILEPATH + "groupSprites.cgi", true, true);
};

EDT.ungroupSprites = function() {
	var public_password = "";
	var passElm = $("cp_publicpass");
	if(passElm){
		public_password = passElm.value;
	}
	else{
		public_password = PLG.getCookie("public_password");
		if(public_password === undefined){
			public_password = "";
		}
	}

	if(PLG.selection.currentFixed === null){
		return;
	}
	var id = EDT.getRootID(PLG.selection.currentFixed.id);

	for(var itemid in PARAM.groups[id]){
		if(!itemid.match(/^spr.+$/) && !itemid.match(/^grp.+$/)){
			continue;
		}
		if(itemid.match(/^spr.+$/)){
			delete PARAM.sprites[itemid].groupid;
		}
		if(itemid.match(/^grp.+$/)){
			delete PARAM.groups[itemid].groupid;
		}
	}
	PLG.selection.remove(id);
	delete PARAM.groups[id];

	var marginHash = EDT.calcMargin();
	EDT.rebuildYoungerArray();

	var adjustedTop = {};
	if(PLG.marginIsAdjusted){
		PLG.marginIsAdjusted = false;
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				adjustedTop[id] = PARAM.sprites[id].y;
			}
			else if(id.match(/^grp.+$/)){
				adjustedTop[id] = PARAM.groups[id].y;
			}
		}
	}

	var ungroupSpriteOnLoaded = function(obj) {
		var res = obj.responseText;
		res.match(/^(.+?)[\n\r]/i);
		res = RegExp.$1;
		if(res != "succeed"){
			$("controlresult").innerHTML = EDT.getResponseText(res);
			EDT.restoreHashes();
			return;
		}
		else{
			$("controlresult").innerHTML = EDT.getResponseText(res);

			PLG.removeGroupFrame(id);

			EDT.backupHashes();

			PLG.state = PLG.STATES.WORKING;
			PLG.selection.clear();
			EDT.view.redraw();
		}
	};

	PLG.sendRequest(ungroupSpriteOnLoaded, "&pageid=" + PARAM.pageid + "&groupid=" + id + "&public_password=" + public_password + "&margin=" + marginHash.toJSONString() + "&adjustedTop=" + adjustedTop.toJSONString(), "POST", PARAM.CGIFILEPATH + "ungroupSprites.cgi", true, true);

};

// -------------------------------------------------------------------------------------------------------
// Control panel

EDT.openPageProperty = function() {
	window.open(PARAM.ADMINTOOLSCGIPATH + "pageproperty.cgi?page=" + PARAM.pageid);
};

EDT.newspritebtnOnMouseDown = function() {
	if(EDT.editor.mode != EDT.EDITOR_CLOSE){
		return;
	}
	if(EDT.currenttool == EDT.TOOL_NORMAL){
		var rect = {};
		rect.left = 5 + PLG.viewPositionX + Math.floor(Math.random() * 70);
		rect.top = 100 + PLG.viewPositionY + Math.floor(Math.random() * 30);
		if(PARAM.page_type == "map"){
			rect.left -= Math.round(PLG.getInnerWidth() / 2);
			rect.top -= Math.round(PLG.getInnerHeight() / 2);
		}
		rect.width = EDT.DEFAULT_SPRITEWIDTH;
		var contents = "<br>\n<div style='text-align:center'>New sprite</div>\n<br>\n";
		EDT.createSprite(EDT.SAVE_NEWBUTTONSPRITE, contents, EDT.generateNewID("spr", PARAM.sprites), rect);
	}
};

EDT.selectArrowSrcDst = function() {
	if(PLG.selection.current !== null){
		if(EDT.linkSrcSprite === null){
			if(PLG.selection.current.id.match(/_link$/)){
				$("controlresult").innerHTML = MESSAGE.ARROWLINKSTART;
				return;
			}
			if(PARAM.sprites[PLG.selection.current.id].template !== undefined && PARAM.sprites[PLG.selection.current.id].template == 1){
				$("controlresult").innerHTML = MESSAGE.ARROWLINKSTART;
				return;
			}
			EDT.linkSrcSprite = PLG.selection.current;
			$("controlresult").innerHTML = MESSAGE.ARROWLINKEND;
			return;
		}
		else{
			if(PLG.selection.current.id.match(/_link$/)){
				$("controlresult").innerHTML = MESSAGE.ARROWLINKEND;
				return;
			}
			if(PARAM.sprites[PLG.selection.current.id].template !== undefined && PARAM.sprites[PLG.selection.current.id].template == 1){
				$("controlresult").innerHTML = MESSAGE.ARROWLINKEND;
				return;
			}
			if(!PARAM.sprites[EDT.linkSrcSprite.id].outlink){
				PARAM.sprites[EDT.linkSrcSprite.id].outlink = {};
			}
			PARAM.sprites[EDT.linkSrcSprite.id].outlink[PLG.selection.current.id] = 1;

			if(!PARAM.sprites[PLG.selection.current.id].inlink){
				PARAM.sprites[PLG.selection.current.id].inlink = {};
			}
			PARAM.sprites[PLG.selection.current.id].inlink[EDT.linkSrcSprite.id] = 1;

			PLG.drawArrowSprite(EDT.linkSrcSprite.id, PLG.selection.current.id);
			EDT.arrowBtnOnMouseDown();
			return;
		}
	}
	else{
		if(EDT.linkSrcSprite === null){
			$("controlresult").innerHTML = MESSAGE.ARROWLINKSTART;
		}
		else{
			$("controlresult").innerHTML = MESSAGE.ARROWLINKEND;
		}
	}
};

EDT.arrowBtnOnMouseDown = function() {
	EDT.colorpicker.reset();

	var arrowBtn = $("arrowbtn");
	if(EDT.currenttool == EDT.TOOL_ARROWLINK){
		EDT.currenttool = EDT.TOOL_NORMAL;
		arrowBtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/arrowbtn.gif')";
		$("controlresult").innerHTML = "";
		EDT.linkSrcSprite = null;
		return;
	}
	else if(EDT.currenttool == EDT.TOOL_DRAWING){
		EDT.drawingBtnOnMouseDown();
		EDT.currenttool = EDT.TOOL_ARROWLINK;
	}
	else if(EDT.currenttool == EDT.TOOL_NORMAL){
		EDT.currenttool = EDT.TOOL_ARROWLINK;
	}

	if(EDT.canDrop){
		EDT.directDropBtnOnMouseDown();
		EDT.currenttool = EDT.TOOL_ARROWLINK;
	}

	arrowBtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/arrowbtn_rev.gif')";
	PLG.ignoreMouseDown = true;
	$("controlresult").innerHTML = MESSAGE.ARROWLINKSTART;

	PLG.selection.clear();
	EDT.view.redraw();
	PLG.state = PLG.STATES.WORKING;

};

EDT.directDropBtnOnMouseDown = function() {
	EDT.colorpicker.reset();

	var directDropBtn = $("directdropbtn");
	if(EDT.canDrop){
		EDT.canDrop = false;
		EDT.hideDragFrame();
		directDropBtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/directdropbtn.gif')";
		if(PLG.browser.mozes || PLG.browser.opera){
			$("positlogbody").removeChild($("dropuploaderwrapper"));
		}
		else{
			$("positlogbody").removeChild($("dropuploader"));
		}

		if(PLG.browser.msie || PLG.browser.msie7){
			$("positlogbody").ondragenter = null;
//			$("positlogbody").ondragleave = null;
		}
		return;
	}

	if(EDT.currenttool == EDT.TOOL_ARROWLINK){
		EDT.arrowBtnOnMouseDown();
	}
	else if(EDT.currenttool == EDT.TOOL_DRAWING){
		EDT.drawingBtnOnMouseDown();
	}

	EDT.canDrop = true;

	directDropBtn.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/directdropbtn_rev.gif')";
	PLG.ignoreMouseDown = true;

	PLG.selection.clear();
	EDT.view.redraw();
	PLG.state = PLG.STATES.WORKING;

	var loginid = PLG.getCookie("loginid");
	var loginpass = PLG.getCookie("loginpass");

	var dropUploader = null;

	if(PLG.browser.safari){
		dropUploader = PLG.createElm("object");
		dropUploader.setAttribute("width","1");
		dropUploader.setAttribute("height","1");
		dropUploader.setAttribute("id","dropuploader");
		dropUploader.setAttribute("codetype","application/java");
		dropUploader.setAttribute("type","application/x-java-applet");
		dropUploader.setAttribute("code","org.positlog.upload.DropUploader.class");

		var setParam = function(name, value){
			var param = PLG.createElm("param");
			param.setAttribute("name", name);
			param.setAttribute("value", value);
			dropUploader.appendChild(param);
		};

		setParam("uploaderurl", PARAM.ROOTURL + "fileupload.cgi");
		setParam("codebase", PARAM.SYSTEMPATH + "dropuploader/");
		setParam("archive", "DropUploader.jar, commons-codec-1.3.jar, commons-httpclient-3.1.jar, commons-logging-1.1.1.jar");
		setParam("loginid", loginid);
		setParam("loginpass", loginpass);
		setParam("pageid", PARAM.pageid);
		setParam("browser", "safari");
	}
	else if(PLG.browser.opera){
		dropUploader = PLG.createElm("div");
		dropUploader.setAttribute("id", "dropuploaderwrapper");
		dropUploader.style.width = "1px";
		dropUploader.style.height = "1px";
		dropUploader.innerHTML = "<applet id='dropuploader' code='org.positlog.upload.DropUploader.class' archive='DropUploader.jar, commons-codec-1.3.jar, commons-httpclient-3.1.jar, commons-logging-1.1.1.jar' codebase='" + PARAM.SYSTEMPATH + "dropuploader/' uploaderurl='" + PARAM.ROOTURL + "fileupload.cgi' loginid='" + loginid + "' loginpass='" + loginpass + "' pageid='" + PARAM.pageid + "' browser='opera' width='1' height='1' mayscript></applet>";
	}
	else if(PLG.browser.mozes){
		dropUploader = PLG.createElm("div");
		dropUploader.setAttribute("id", "dropuploaderwrapper");
		dropUploader.style.width = "1px";
		dropUploader.style.height = "1px";
		dropUploader.innerHTML = "<applet id='dropuploader' code='org.positlog.upload.DropUploader.class' archive='DropUploader.jar, commons-codec-1.3.jar, commons-httpclient-3.1.jar, commons-logging-1.1.1.jar' codebase='" + PARAM.SYSTEMPATH + "dropuploader/' uploaderurl='" + PARAM.ROOTURL + "fileupload.cgi' loginid='" + loginid + "' loginpass='" + loginpass + "' pageid='" + PARAM.pageid + "' browser='mozes' width='1' height='1' mayscript></applet>";
	}
	else if(PLG.browser.msie || PLG.browser.msie7){
		dropUploader = PLG.createElm("applet");
		dropUploader.setAttribute("id", "dropuploader");
		dropUploader.setAttribute("width", "1");
		dropUploader.setAttribute("height", "1");
		dropUploader.setAttribute("uploaderurl", PARAM.ROOTURL + "fileupload.cgi");
		dropUploader.setAttribute("loginid", loginid);
		dropUploader.setAttribute("loginpass", loginpass);
		dropUploader.setAttribute("pageid", PARAM.pageid);
		dropUploader.setAttribute("browser", "ie");
		dropUploader.setAttribute("codebase", PARAM.SYSTEMPATH + "dropuploader/");
		dropUploader.setAttribute("archive", "DropUploader.jar, commons-codec-1.3.jar, commons-httpclient-3.1.jar, commons-logging-1.1.1.jar");
		dropUploader.setAttribute("code", "org.positlog.upload.DropUploader.class");

		$("positlogbody").ondragenter = function(){
			if($("dropuploader")){
				$("dropuploader").browserDragEnter();
			}
		}
//		$("positlogbody").ondragleave = function(){
//			if($("dropuploader")){
//				$("dropuploader").browserDragLeave();
//			}
//		}
	}	

	$("positlogbody").appendChild(dropUploader);


};

EDT.infoVisibleChanged = function(id, type){
	return function(){
		var sid = PLG.selection.currentFixed.id;
		if(PLG.selection.isFixed(sid)){
			if($(id).checked){
				PARAM.sprites[PLG.selection.currentFixed.id].display[type] = 1;

				if(type == "tag"){
					var tag = $("tagfield").value;
					if(tag !== undefined && tag !== null && tag !== ""){
						tag = tag.replace(/</g, "&lt;");
						tag = tag.replace(/>/g, "&gt;");
						PARAM.sprites[PLG.selection.currentFixed.id].tag = tag;
					}
				}
			}
			else{
				PARAM.sprites[PLG.selection.currentFixed.id].display[type] = 0;
			}
			EDT.setSpriteInfo(PLG.selection.currentFixed);
		}
		EDT.view.setPropertyDirty(true);
	}
};

EDT.resetRegion = function(){
	if(PLG.selection.currentFixed !== null){
		var regionElm = PLG.getSpriteRegion(PLG.selection.currentFixed);
		var currentWidth = parseInt(regionElm.style.width.replace(/px/g, ""));
		regionElm.style.width = (currentWidth - 1) + "px";
	}
}

EDT.initializePropertyPanel = function() {
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		$("showauthor").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
		$("showuri").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
		$("showtime").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
		$("showtag").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}

	if(PLG.browser.msie || PLG.browser.msie7){
		$("showauthor").onclick = EDT.infoVisibleChanged("showauthor", "author");
		$("showuri").onclick = EDT.infoVisibleChanged("showuri", "uri");
		$("showtime").onclick = EDT.infoVisibleChanged("showtime", "created_time");
		$("showtag").onclick = EDT.infoVisibleChanged("showtag", "tag");
	}
	else{
		$("showauthor").onchange = EDT.infoVisibleChanged("showauthor", "author");
		$("showuri").onchange = EDT.infoVisibleChanged("showuri", "uri");
		$("showtime").onchange = EDT.infoVisibleChanged("showtime", "created_time");
		$("showtag").onchange = EDT.infoVisibleChanged("showtag", "tag");
	}

	$("tagfield").onfocus = function() {
		PLG.focusedField = "tagfield";
		PLG.focusedFieldText = $("tagfield").value;
	}
	$("tagfield").onblur = function() {
		PLG.focusedField = "";
	}

	$("textcolorbtn").onclick = EDT.colorpicker.toggleText;
	$("textcolorbtn").onmouseover = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_TEXT){
			$("textcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/textcolorbtn_hl.gif')";
		}
	}
	$("textcolorbtn").onmouseout = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_TEXT){
			$("textcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/textcolorbtn.gif')";
		}
	}
	$("bgcolorbtn").onclick = EDT.colorpicker.toggleBg
	$("bgcolorbtn").onmouseover = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_BG){
			$("bgcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/bgcolorbtn_hl.gif')";
		}
	}
	$("bgcolorbtn").onmouseout = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_BG){
			$("bgcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/bgcolorbtn.gif')";
		}
	}
	$("linecolorbtn").onclick = EDT.colorpicker.toggleLine;
	$("linecolorbtn").onmouseover = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_LINE){
			$("linecolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn_hl.gif')";
		}
	}
	$("linecolorbtn").onmouseout = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_LINE){
			$("linecolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn.gif')";
		}
	}
	$("drawcolorbtn").onclick = EDT.colorpicker.toggleDrawing;
	$("drawcolorbtn").onmouseover = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_DRAWING){
			$("drawcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn_hl.gif')";
		}
	}
	$("drawcolorbtn").onmouseout = function() {
		if(EDT.colorpicker.mode != EDT.PICKER_DRAWING){
			$("drawcolorbtn").style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/linecolorbtn.gif')";
		}
	}

	var sSelector = $("styleselector");
	var lsSelector = $("linestyleselector");
	var wSelector = $("widthselector");
	var lSelector = $("linewidthselector");
	var pSelector = $("paddingselector");

	for(var txt in EDT.borderStyleName){
		if(txt != "toJSONString"){
			var frameOption = PLG.createElm("option");
			frameOption.setAttribute("value", txt);
			frameOption.appendChild(document.createTextNode(EDT.borderStyleName[txt]));
			sSelector.appendChild(frameOption);
		}
	}

	sSelector.onmousedown = function(){
		PLG.ignoreMouseDown = true;
	}
	sSelector.onchange = function() {
		var sid = PLG.selection.currentFixed.id;
		if(PLG.selection.isFixed(sid)){
			var contentsElm = PLG.getSpriteContents($(sid));
			var style = sSelector.options[sSelector.selectedIndex].value;
			contentsElm.style.borderStyle = style;
			PARAM.sprites[PLG.selection.currentFixed.id].borderStyle = style;
			if(contentsElm.style.borderTopWidth == "0px" && sSelector.selectedIndex !== 0){
				contentsElm.style.borderWidth = "1px";
				PARAM.sprites[sid].borderWidth = 1;
				wSelector.selectedIndex = 1;
			}
//			PLG.setContentsPadding(contentsElm, PARAM.sprites[PLG.selection.currentFixed.id].padding);
		}
		EDT.view.setPropertyDirty(true);
		EDT.view.redraw();
	};

	for(var txt in EDT.lineStyleName){
		if(txt != "toJSONString"){
			var frameOption = PLG.createElm("option");
			frameOption.setAttribute("value", txt);
			frameOption.appendChild(document.createTextNode(EDT.lineStyleName[txt]));
			lsSelector.appendChild(frameOption);
		}
	}
	lsSelector.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	lsSelector.onchange = function() {
//		PLG.ignoreMouseDown = true;
		var lineStyle = lsSelector.options[lsSelector.selectedIndex].value;
		var contents = PLG.getSpriteContents(PLG.selection.currentFixed);
		var innerHTML = contents.innerHTML.replace(new RegExp("draw\\('shape,arrow,(.+?),(.+?),(.+?),(.+?),(.+?),(.+?),(.+?)'\\)"), "draw('shape,arrow,$1,$2,$3,$4," + lineStyle + ",$6,$7')");
		contents.innerHTML = innerHTML;

		EDT.saveFromEditor(PLG.selection.currentFixed, EDT.SAVE_PROPERTY, true);

//		PARAM.sprites[PLG.selection.currentFixed.id].innerHTML = innerHTML;
//		if(innerHTML.match(/draw\('(.+)'\)/)){
//			var drawCommand = RegExp.$1;
//			PLG.draw(drawCommand);
//			PLG.execDrawCommand();
//		}
//		EDT.view.setPropertyDirty(true);
//		EDT.view.redraw();
	};

	for(var txt in EDT.borderWidthIndex){
		if(txt.match(/^(.+)px$/)){
			var borderWidthOption = PLG.createElm("option");
			borderWidthOption.setAttribute("value", txt);
			var disptxt = RegExp.$1;
			if(disptxt == "0"){
				disptxt = "-";
			}
			borderWidthOption.appendChild(document.createTextNode(disptxt));
			wSelector.appendChild(borderWidthOption);
		}
	}
	wSelector.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	wSelector.onchange = function() {
//		PLG.ignoreMouseDown = true;
		var sid = PLG.selection.currentFixed.id;
		if(PLG.selection.isFixed(sid)){
			var contentsElm = PLG.getSpriteContents($(sid));
			contentsElm.style.borderWidth = Math.round(parseInt(wSelector.options[wSelector.selectedIndex].value.replace(/px/g, "")) * PLG.zoom) + "px";
			PARAM.sprites[PLG.selection.currentFixed.id].borderWidth = parseInt(wSelector.options[wSelector.selectedIndex].value.replace(/px/g, ""));

			// Reset sprite width
			if(PLG.browser.safari){
				var regionElm = PLG.getSpriteRegion(PLG.selection.currentFixed);
				var currentWidth = parseInt(regionElm.style.width.replace(/px/g, ""));
				regionElm.style.width = (currentWidth + 1) + "px";
				setTimeout("EDT.resetRegion()", 1);
			}
//			PLG.setContentsPadding(contentsElm, PARAM.sprites[PLG.selection.currentFixed.id].padding);
		}
		EDT.view.redraw();
		EDT.view.setPropertyDirty(true);
	};

	for(var txt in EDT.lineWidthIndex){
		if(txt.match(/^(.+)px$/)){
			var lineWidthOption = PLG.createElm("option");
			lineWidthOption.setAttribute("value", txt);
			lineWidthOption.appendChild(document.createTextNode(RegExp.$1));
			lSelector.appendChild(lineWidthOption);
		}
	}
	lSelector.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	lSelector.onchange = function() {
//		PLG.ignoreMouseDown = true;
		/*
    if(EDT.currenttool == EDT.TOOL_DRAWING){
			EDT.pensize = parseInt(lSelector.options[lSelector.selectedIndex].value.replace(/px/g, ""));
//			EDT.view.setPropertyDirty(true);
//			EDT.view.redraw();
		}
		else 
		*/
		if(PLG.selection.currentFixed !== null && PLG.selection.currentFixed.id.match(/_link$/)){
			var lineWidth = parseInt(lSelector.options[lSelector.selectedIndex].value.replace(/px/g, ""));
			var contents = PLG.getSpriteContents(PLG.selection.currentFixed);
			var innerHTML = contents.innerHTML.replace(/draw\('shape,arrow,(.+?),(.+?),(.+?),(.+?),(.+?),(.+?),(.+?)'\)/, "draw('shape,arrow,$1,$2,$3," + lineWidth + ",$5,$6,$7')");
			contents.innerHTML = innerHTML;

			EDT.saveFromEditor(PLG.selection.currentFixed, EDT.SAVE_PROPERTY, true);

//			PARAM.sprites[PLG.selection.currentFixed.id].innerHTML = innerHTML;
//			if(innerHTML.match(/draw\('(.+)'\)/)){
//				var drawCommand = RegExp.$1;
//				PLG.draw(drawCommand);
//				PLG.execDrawCommand();
//			}
		}
	};

	for(var txt in EDT.paddingIndex){
		if(txt.match(/^(.+)px$/)){
			var paddingOption = PLG.createElm("option");
			paddingOption.setAttribute("value", txt);
			paddingOption.appendChild(document.createTextNode(RegExp.$1));
			pSelector.appendChild(paddingOption);
		}
	}
	pSelector.onmousedown = function() {
		PLG.ignoreMouseDown = true;
	};
	pSelector.onchange = function() {
//		PLG.ignoreMouseDown = true;
		var sid = PLG.selection.currentFixed.id;
		if(PLG.selection.isFixed(sid)){
			var contentsElm = PLG.getSpriteContents($(sid));
//			contentsElm.style.padding = Math.round(parseInt(pSelector.options[pSelector.selectedIndex].value.replace(/px/g, "")) * PLG.zoom) + "px";
			PLG.setContentsPadding(contentsElm, Math.round(parseInt(pSelector.options[pSelector.selectedIndex].value.replace(/px/g, "")) * PLG.zoom));
			PARAM.sprites[PLG.selection.currentFixed.id].padding = parseInt(pSelector.options[pSelector.selectedIndex].value.replace(/px/g, ""));
			// Reset sprite width
			if(PLG.browser.safari){
				var regionElm = PLG.getSpriteRegion(PLG.selection.currentFixed);
				var currentWidth = parseInt(regionElm.style.width.replace(/px/g, ""));
				regionElm.style.width = (currentWidth + 1) + "px";
				setTimeout("EDT.resetRegion()", 1);
			}
		}
		EDT.view.redraw();
		EDT.view.setPropertyDirty(true);
	};

	$("revertpropertybtn").onclick = function(){
		EDT.view.revertProperty();
		EDT.view.redraw();		
	};

	$("uploaderbtn").onclick = function() {
		if(EDT.uploader.mode == EDT.PLUGIN_CLOSE){
			EDT.uploader.open();
		}
		else{
			EDT.uploader.close();
		}
	};

	$("fileclearbtn").onclick = function() {
		EDT.view.setPropertyDirty(true);
		$("uploadedfilename").innerHTML = "";
		PARAM.sprites[PLG.selection.currentFixed.id].innerHTML = PARAM.sprites[PLG.selection.currentFixed.id].innerHTML.replace(/<img.*?>/gi, "");
		PARAM.sprites[PLG.selection.currentFixed.id].innerHTML = PARAM.sprites[PLG.selection.currentFixed.id].innerHTML.replace(/<a\s.*?class=.attachedfile.+?>.+?<\/a>/gi, "");
	};

	$("pluginbtn").onclick = function() {
		if(EDT.plugin.mode == EDT.PLUGIN_CLOSE){
			EDT.plugin.open();
		}
		else{
			EDT.plugin.close();
		}
	};
};


// -------------------------------------------------------------------------------------------------------
// Initialization

EDT.initializeSpriteMenu = function() {
	var menuElm = PLG.createElm("div", "spritemenu");
	menuElm.style.display = "none";
	menuElm.style.backgroundColor = EDT.COLOR_FIXEDSPRITE;

	// Don't use alpha.
	// if(PLG.browser.msie || PLG.browser.msie7){
	// menuElm.style.filter = "alpha(opacity=80)";
	// }
	// else{
	// menuElm.style.opacity = 0.8;
	// }
	var moverElm = PLG.createElm("div", "sprite-mover");
	moverElm.onmousedown = EDT.moverOnMouseDown;
	menuElm.appendChild(moverElm);

	var opensubmenuElm = PLG.createElm("div", "sprite-opensubmenu");
	opensubmenuElm.onmousedown = function() {
		if($("sprite-submenu").style.display == "block"){
			EDT.submenu.close();
		}
		else{
			EDT.submenu.open(null, true);
		}
	};
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		opensubmenuElm.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}
	menuElm.appendChild(opensubmenuElm);

	var editElm = PLG.createElm("div", "sprite-editor");
	editElm.onmousedown = function() {
		EDT.editor.open();

	};
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		editElm.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}
	menuElm.appendChild(editElm);

	var commentElm = PLG.createElm("div", "sprite-comment");
	commentElm.onmousedown = function() {
		EDT.createComment();
	};
	if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
		commentElm.style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand3.cur), default";
	}
	menuElm.appendChild(commentElm);

	$("spriteslist").appendChild(menuElm);

	var scalerElm = PLG.createElm("div", "sprite-scaler");
	scalerElm.onmousedown = EDT.scalerOnMouseDown;
	scalerElm.style.display = "none";
	$("spriteslist").appendChild(scalerElm);
};

EDT.setButtonEvents = function(id, mouseoverimg, mouseoutimg, mousedownimg, myfunc) {
	var btnNode = $(id);
	if(btnNode !== null){
		btnNode.onmouseover = function() {
			this.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/" + mouseoverimg + "')";
		};
		btnNode.onmouseout = function() {
			this.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/" +  mouseoutimg + "')";
		};
		btnNode.onmousedown = function(e) {
			this.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/" +  mousedownimg + "')";
			eval(myfunc);
			if(PLG.browser.msie || PLG.browser.msie7){
				event.returnValue = false;
				event.cancelBubble = true;
			}
			else{
				e.preventDefault();
				e.stopPropagation();
			}
			return false;
		};
		btnNode.onmouseup = function() {
			this.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/" +  mouseoutimg + "')";
		};
	}
};

EDT.onDoubleClick = function(e){
	if(PLG.handTool){
		return true;
	}

	if(PLG.waitSavingFlag){
		return;
	}


	// Check modal dialog and drawing
	if(EDT.modalDialogIsOpened()){
		var onDialog = EDT.modalDialogOnMouseDown(e);
		if(onDialog > 0){
			return;
		}
	}

	if(EDT.currenttool != EDT.TOOL_NORMAL){
		return;
	}


	if(PLG.state == PLG.STATES.FIXEDSELECTED){
		if(PLG.selection.currentFixed != null && PLG.selection.currentFixed == PLG.selection.current){
			if(!PARAM.sprites[PLG.selection.currentFixed.id].isDrawing && (PARAM.sprites[PLG.selection.currentFixed.id].template === undefined || PARAM.sprites[PLG.selection.currentFixed.id].template != 1)){
				EDT.editor.open();
			}
		}
	}
	else if(PLG.state == PLG.STATES.WORKING){
			var rect = {};
			rect.left = EDT.prevMouseDownXonWorld;
			rect.top = EDT.prevMouseDownYonWorld;
			rect.width = EDT.DEFAULT_SPRITEWIDTH;
			var contents = "<br>\n<div style='text-align:center'>New sprite</div>\n<br>\n";
			EDT.createSprite(EDT.SAVE_NEWCLICKSPRITE, contents, EDT.generateNewID("spr", PARAM.sprites), rect);
	}

}

EDT.initialize = function() {
	// positlog.js is loaded

	window.onresize = EDT.onResize;

	document.oncontextmenu = EDT.oncontextmenu;
	document.onkeydown = EDT.onkeydown;
	document.onkeypress = EDT.onkeypress;
	document.onkeyup = EDT.onkeyup;

	var centermark = PLG.createElm("div", "centermark");
	if(PARAM.page_type == "document"){
		centermark.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/document_center.gif')";
		centermark.style.left = "-4px";
		centermark.style.top = "-4px";
	}
	else{
		centermark.style.backgroundImage = "url('" + PARAM.SYSTEMPATH + "images/center.gif')";
		centermark.style.left = "-10px";
		centermark.style.top = "-10px";
	}
	$("spriteslist").appendChild(centermark);


	// rebuild margin_s.younger
	EDT.rebuildYoungerArray();

	// Control panel line 1

	$("cp_unlockpass").onclick = function() {
		// unlock password of public user
		var pass = $("cp_publicpass").value;
		var targetID = PLG.selection.currentFixed.id;

		var postdata = "&id=" + targetID + "&pageid=" + PARAM.pageid + "&public_password=" + pass;

		var unlockPasswordOnLoaded = function(obj) {
			var res = obj.responseText;
			res.match(/^(.+?)[\n\r]/i);
			res = RegExp.$1;
			$("controlresult").innerHTML = EDT.getResponseText(res);

			if(res == "unlockpassword"){
				$("cp_publicpass").value = "";
				PLG.setCookie("public_password", "", PARAM.CGIFILEPATH, 30);

				var sid = PLG.selection.currentFixed.id
				var authorName = PARAM.sprites[sid].author;
				if(authorName.match(/^&lt;(.+)&gt;$/)){
					authorName = "[" + RegExp.$1 + "]";
				}
				PARAM.sprites[sid].author = authorName;
				EDT.setSpriteInfo($(sid));

				$("cp_unlockpass").style.display = "none";
			}
		}
		PLG.sendRequest(unlockPasswordOnLoaded, postdata, "POST", PARAM.CGIFILEPATH + "unlockPassword.cgi", true, true);
	};

	document.ondblclick = EDT.onDoubleClick;

	EDT.setButtonEvents("newspritebtn", "newspritebtn_hl.gif", "newspritebtn.gif", "newspritebtn_rev.gif", "EDT.newspritebtnOnMouseDown();");
	EDT.setButtonEvents("newpagebtn", "newpagebtn_hl.gif", "newpagebtn.gif", "newpagebtn_rev.gif", "EDT.createPage()");
	EDT.setButtonEvents("propertybtn", "propertybtn_hl.gif", "propertybtn.gif", "propertybtn_rev.gif", "EDT.openPageProperty()");

	var arrowBtn = $("arrowbtn");
	arrowBtn.onmousedown = EDT.arrowBtnOnMouseDown;

	var drawingBtn = $("drawingbtn");
	drawingBtn.onmousedown = EDT.drawingBtnOnMouseDown;

	var directDropBtn = $("directdropbtn");
	if(PARAM.permissionLevel >= PLG.CONST.USERLEVEL_ATTACH_FILE){
		if(!(PLG.browser.mac && (PLG.browser.opera || PLG.browser.mozes))){
			directDropBtn.style.display = "block";
			directDropBtn.onmousedown = EDT.directDropBtnOnMouseDown;
		}
	}

	EDT.initializePropertyPanel();

	// Sprite menu
	EDT.initializeSpriteMenu();

	// Submenu (Context menu)
	EDT.submenu.initialize();


	// Home btn
	var hbtn = $("homebtn");
	hbtn.style.top = $("controlpanel").offsetHeight + "px";
	hbtn.style.right = "0px";

	// Small map
	PLG.mapcanvas.style.display = "block";
	PLG.viewcanvas.style.display = "block";

	if(PLG.canvasOK){
		PLG.drawcanvas.style.display = "block";
	}

	if(PARAM.permissionLevel < PLG.CONST.USERLEVEL_ATTACH_FILE){
		EDT.editorConfigPath = PARAM.SYSTEMPATH + "fckmyconfig_noupload.js";
	}

	// Preload editor
  // It is too heavy to load on a weak environment.
	if(PLG.browser.mozes){
//		EDT.editor.create(true);
	}

	// JSON
	if(!Object.prototype.toJSONString){
		Array.prototype.toJSONString = function() {
			var a = ['['], b, i, l = this.length, v;

			function p(s) {
				if(b){
					a.push(',');
				}
				a.push(s);
				b = true;
			}

			for(i = 0;i < l; i += 1){
				v = this[i];
				switch(typeof v){
					case 'undefined':
					case 'function':
					case 'unknown':
						break;
					case 'object':
						if(v){
							if(typeof v.toJSONString === 'function'){
								p(v.toJSONString());
							}
						}
						else{
							p("null");
						}
						break;
					default:
						p(v.toJSONString());
				}
			}
			a.push(']');
			return a.join('');
		};

		Boolean.prototype.toJSONString = function() {
			return String(this);
		};

		Date.prototype.toJSONString = function() {

			function f(n) {
				return n < 10 ? '0' + n : n;
			}

			return '"' + this.getFullYear() + '-' + f(this.getMonth() + 1) + '-' + f(this.getDate()) + 'T' + f(this.getHours()) + ':' + f(this.getMinutes()) + ':' + f(this.getSeconds()) + '"';
		};

		Number.prototype.toJSONString = function() {
			return isFinite(this) ? String(this) : "null";
		};

		Object.prototype.toJSONString = function() {
			var a = ['{'], b, i, v;

			function p(s) {
				if(b){
					a.push(',');
				}
				a.push(i.toJSONString(), ':', s);
				b = true;
			}

			for(i in this){
				if(this.hasOwnProperty(i)){
					v = this[i];
					switch(typeof v){
						case 'undefined':
						case 'function':
						case 'unknown':
							break;
						case 'object':
							if(v){
								if(typeof v.toJSONString === 'function'){
									p(v.toJSONString());
								}
							}
							else{
								p("null");
							}
							break;
						default:
							p(v.toJSONString());
					}
				}
			}
			a.push('}');
			return a.join('');
		};

		(function(s) {
			var m = {
				'\b' : '\\b',
				'\t' : '\\t',
				'\n' : '\\n',
				'\f' : '\\f',
				'\r' : '\\r',
				'"' : '\\"',
				'\\' : '\\\\'
			};

			s.toJSONString = function() {
				if(/["\\\x00-\x1f]/.test(this)){
					return '"' + this.replace(/([\x00-\x1f\\"])/g, function(a, b) {
						var c = m[b];
						if(c){
							return c;
						}
						c = b.charCodeAt();
						return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
					}) + '"';
				}
				return '"' + this + '"';
			};
		})(String.prototype);
	}
	// end of toJSONString

	// Backup hash
	EDT.backupHashes();

	// Execute draw command on sprites
	PLG.drawTimer = setInterval("PLG.execDrawCommand()", 10);
	PLG.startProcessingAnime();

	EDT.loaded = true;
};
