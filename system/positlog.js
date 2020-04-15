// -------------------------------------------------
// positlog.js
//
// Copyright (c) 2006-2008 Hidekazu Kubota All right reserved.
//  <hidekaz@positlog.org> 
//  http://positlog.com/
//
// This program is distributed under GPL2.0.
// --------------------------------------------------------


// ---------------------------
// DEFINITION
// ---------------------------

// PARAM.* are defined in positlog.cgi


// PLG is abbreviation of PositLog
var PLG = {};


// For checking browser
PLG.browser = {};


PLG.createHttpRequest = function() {
	if(window.XMLHttpRequest){
		return new XMLHttpRequest();
	}
	else if(window.ActiveXObject){
		try{
			return new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch(e){
			try{
				return new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch(e2){
				return null;
			}
		}
	}
	else{
		return null;
	}
};

PLG.nowidgets = false;

PLG.checkBrowser = function() {
	var a, ua = navigator.userAgent;

	PLG.browser.iemobile = navigator.appName == 'Microsoft Pocket Internet Explorer';
	PLG.browser.safari = ua.match(/AppleWebKit/gi) !== null || ((a = ua.split('Konqueror/')[1]) ? a.split(';')[0] : 0) >= 3.3;
	PLG.browser.konqueror = ((a = ua.split('Konqueror/')[1]) ? a.split(';')[0] : 0) >= 3.3;
	PLG.browser.mozes = ((a = ua.split('Gecko/')[1]) ? a.split(' ')[0] : 0) >= 20011128;
	PLG.browser.opera = (!!window.opera) && ((typeof XMLHttpRequest) == 'function');
	PLG.browser.msie7 = (!!window.ActiveXObject) ? ((typeof XMLHttpRequest) == 'object') : false;
	PLG.browser.msie = (!!window.ActiveXObject) ? (!!PLG.createHttpRequest()) && ((typeof XMLHttpRequest) != 'object') : false;


	if(ua.match(/Macintosh/)){
		PLG.browser.mac = true;
	}
	else{
		PLG.browser.mac = false;
	}			

	if(ua.match(/iPod/)){
		PLG.browser.ipod = true;
		PLG.nowidgets = true;
	}
	else{
		PLG.browser.ipod = false;
	}

	if(PLG.browser.safari){
		if(ua.match(/Version\/3/)){
			PLG.browser.safari3 = true;
			PLG.browser.safari2 = false;
		}
		else{
			PLG.browser.safari3 = false;
			PLG.browser.safari2 = true;
		}
	}
};
PLG.checkBrowser();

// Check browser
//if(PARAM.positlogMode == "EditMode"){
// alert("iemobile:" + PLG.browser.iemobile +
// "\nsafari:"+PLG.browser.safari+"\nkonqueror:"+PLG.browser.konqueror+"\nmozes:"+PLG.browser.mozes+"\nopera:"+PLG.browser.opera+"\nmsie7:"+PLG.browser.msie7+"\nmsie:"+PLG.browser.msie);
//}


// CONST
PLG.CONST = {};

PLG.CONST.USERLEVEL_READ = 10;
PLG.CONST.USERLEVEL_EDIT = 20;
PLG.CONST.USERLEVEL_ATTACH_FILE = 30;
PLG.CONST.USERLEVEL_SUPER = 40;

PLG.CONST.SIMPLE_EDITOR = 10;
PLG.CONST.RICH_EDITOR = 20;
PLG.CONST.WIKI_EDITOR = 30;

// z-index
PLG.ZIND = {};
PLG.ZIND.BACKGROUND = 0; // this is the same value as z-index of spritesworld
// defined in positlog.cgi
PLG.ZIND.DRAWCANVASBACK = 1; // this is the same value as z-index of drawcanvas
// defined in positlog.cgi
PLG.ZIND.GO_TEMP_BACKGROUND = 10;
PLG.ZIND.SPRITE_MIN = 1000;
PLG.ZIND.SPRITE_CREATEMIN = 500000;
PLG.ZIND.SPRITE_MAX = 999999;
PLG.ZIND.GO_TEMP_FOREGROUND = 1000000;
PLG.ZIND.DRAWCANVASFRONT = 1500000;
PLG.ZIND.CONTROLPANEL = 2000000; // this is the same value as z-index of
// controlpanel defined in positlog.css
PLG.ZIND.SMALLMAP = 2500000;
PLG.ZIND.EDITOR = 3000000; // this is the same value as z-index of
// editor/password-dialog defined in positlog.css
PLG.ZIND.EDITOR2 = 3000100; // this is the same value as z-index of
// plugin-dialog/fileuploadframe/trianglecolorselector
// defined in positlog.css

// STATES
PLG.STATES = {};

PLG.STATES.VIEWING = 0;
PLG.STATES.WORKING = 100;
PLG.STATES.SELECTED = 101;
PLG.STATES.FIXED = 102;
PLG.STATES.FIXEDSELECTED = 103;
PLG.STATES.MOVING = 104;
PLG.STATES.MOVINGSELECTED = 105;
PLG.STATES.SCALING = 106;
PLG.STATES.EDITING = 107;
PLG.STATES.EDITINGSELECTED = 108;

// Others
PLG.error = "";
PLG.putErr = function(msg){
	PLG.error += msg + ",";
}
PLG.showErr = function() {
	if(PLG.error === ""){
		return;
	}
	var win = window.open();
	win.document.open();
	win.document.write(PLG.error);
	win.document.close();
};

// Form and key events
PLG.focusedField = "";
PLG.focusedFieldText = "";

PLG.keyPressStartTime = 0;
PLG.handTool = false;

// Mouse state
PLG.MOUSESTATES = {};
PLG.MOUSESTATES.UP = 0;
PLG.MOUSESTATES.DOWN = 1;
PLG.mouseState = PLG.MOUSESTATES.UP;

// Url of current contents
PLG.currentURL = "";

// Value of window.location.hash
PLG.prevLocationHash = "";

// History of window.location.hash
PLG.anchorHistory = {};
PLG.anchorHistoryArray = [];
PLG.anchorFrameQueue = [];

// Whether <canvas> is available
PLG.canvasOK = false;

PLG.canvasSpriteExists = false;

PLG.drawTimer = null;

// IFRAME
PLG.hiddenIframes = [];

// Zoom
PLG.zoom = 1.0;
PLG.minimumzoom = 0.1;
PLG.zooming = false;
//PLG.zoomingEnabled = false;

PLG.zoomDrawTimerFlag = false;
PLG.zoomTimer = null;

PLG.zoomingCanvas = {};
PLG.zoomingObject = {};
PLG.zoomingListItem = {};

PLG.zoomscalerOnMouseDown = false;

PLG.spriteArraySorted = null;

PLG.adjustViewPositionAfterMouseWheelFlag = false;

// Copyright
PLG.copyright = "PositLog " + PARAM.currentversion;

// Nubmer of sprites
PLG.numberOfSprites = 0;

// Border width between sprite and its region
PLG.SPRITE_BORDER_OFFSET = 1;

// For opera
PLG.onloadcount = 0;

// PLG.debug = true;
PLG.debug = false;

// Ignore mouse down event
PLG.ignoreMouseDown = false;

// Ignore mouse up event
PLG.ignoreMouseUp = false;

// Check font size to ajust margins
PLG.fontSizeChecker = null;
PLG.fontSize = 0;
PLG.adjustFlag = false;

// Current state
PLG.state = PLG.STATES.WORKING;

// Backup
PLG.orgSprites = "";
PLG.orgGroups = "";

// View position of sprites world
PLG.viewPositionX = 0;
PLG.viewPositionY = 0;

PLG.setViewPositionFlag = false;
PLG.adjustViewPositionFlag = false;

PLG.viewPositionChangeHash = false;

// Focused sprite (indicated by SpriteID)
// (colored solid frame)
PLG.focusedSprite = null;

// Whether mouse is out of world
PLG.mouseOutOfWorld = false;

// Offset of mouse position
PLG.mousePositionOffset = 0;

// Previous mouse position
PLG.prevMouseXonBrowser = 0;
PLG.prevMouseYonBrowser = 0;
PLG.prevMouseDownXonBrowser = 0;
PLG.prevMouseDownYonBrowser = 0;

// Click four times to move foreground sprite to background
// This is a counter
PLG.counterForMoveToBackground = 0;


PLG.isMouseOnImage = false;


// Smallmap
PLG.mapcanvas = null;
PLG.mapctx = null;
PLG.viewcanvas = null;
PLG.viewctx = null;
PLG.drawcanvas = null;
PLG.drawctx = null;
PLG.DEFAULT_MAPSIZE = 150;
PLG.mapSize = PLG.DEFAULT_MAPSIZE;
PLG.setSmallMapFlag = false;
PLG.borderOfMap = 2;

// For waiting callback from server
PLG.waitSavingFlag = false;

// Timer for animation
PLG.moveTimer = null;
PLG.moveCount = 0;
PLG.MOVEDIVISION = 5;
PLG.animeStartX = 0;
PLG.animeStartY = 0;
PLG.animeEndX = 0;
PLG.animeEndY = 0;

PLG.focusSmallMapCount = 0;
PLG.focusSmallMapTimer = null;
PLG.unfocusSmallMapCount = 0;
PLG.unfocusSmallMapTimer = null;
PLG.smallMapIsFocused = false;
PLG.viewcanvasIsFocused = false;

// World
PLG.worldLeft = Number.MAX_VALUE;
PLG.worldRight = -Number.MAX_VALUE;
PLG.worldTop = Number.MAX_VALUE;
PLG.worldBottom = -Number.MAX_VALUE;

PLG.worldFrameLeft = 0;
PLG.worldFrameTop = 0;
PLG.worldFrameWidth = 0;
PLG.worldFrameHeight = 0;

PLG.leftSprID = "";
PLG.rightSprID = "";
PLG.topSprID = "";
PLG.bottomSprID = "";

// Magic margin for hiding vertical scroll bar in EditMode
PLG.drawCommand = [];

PLG.ignoreKeyPressFlag = false;
PLG.bodyTimer = null;

PLG.showAllRegionFlag = false;
PLG.showRegionFlag = false;
PLG.showGuideFlag = false;

PLG.zoomingOnMouseDown = false;

PLG.loaded = false;


PLG.COLOR_GROUPFRAME = "#a0a0f0";
PLG.COLOR_FOCUSEDSPRITE = "#a0a0f0";


// "id" and "itemid" represent either sprite id or group id.
// "sid" represents sprite id.
// "gid" represents group id.

function $(sid) {
	return document.getElementById(sid);
}

PLG.getScrollLeft = function(){
	if(PLG.browser.safari){
		return document.body.scrollLeft;
	}
	else{
		return document.documentElement.scrollLeft;
	}
}

PLG.getScrollTop = function(){
	if(PLG.browser.safari){
		return document.body.scrollTop;
	}
	else{
		return document.documentElement.scrollTop;
	}
};


PLG.resetFocusedSprite = function(){
	if(PLG.focusedSprite !== null){
		var region = PLG.getSpriteRegion(PLG.focusedSprite);
		region.style.border = "0px";
		region.style.padding = "1px";
		PLG.focusedSprite.style.zIndex = PARAM.sprites[PLG.focusedSprite.id].z;
		PLG.focusedSprite = null;
	}
};

// ----------------------------------
// Selected sprites (1)
// Other properties are defined in edit.js
// ----------------------------------

PLG.selection = {};
PLG.selection.current = null; // Sprite object on which a mouse is placed

// -----------------------------------------------------------------
// Get parts of a sprite
// -----------------------------------------------------------------

PLG.getSpriteRegion = function(spr){
	if(!spr){
		return null;
	}
	return spr.firstChild;
};

PLG.getSpritePlugin = function(spr){
	if(!spr){
		return null;
	}
	return spr.childNodes.item(1);
};

PLG.getSpriteContents = function(spr){
	if(!spr){
		return null;
	}
	return spr.firstChild.firstChild;
};

PLG.getSpriteInfo = function(spr){
	if(!spr){
		return null;
	}
	return spr.firstChild.childNodes.item(1);
};

PLG.getSpriteTag = function(spr){
	if(!spr){
		return "";
	}
	var info = PLG.getSpriteInfo(spr);
	var children = info.childNodes;
	for(var i = 0;i < children.length; i++){
		if(children[i].className == "tag"){
			return children[i].innerHTML;
		}
	}
	return "";
};


// -----------------------------------------------------------------
// Get size of the browser and world
// -----------------------------------------------------------------

PLG.rebuildWorldEdges = function() {
	PLG.worldLeft = Number.MAX_VALUE;
	PLG.worldRight = -Number.MAX_VALUE;
	PLG.worldTop = Number.MAX_VALUE;
	PLG.worldBottom = -Number.MAX_VALUE;


	var hash = PARAM.sprites;
	for(var id in hash){
		if(id.match(/^spr.+$/) && !id.match(/_link$/)){
			// calc region
			if(PLG.worldLeft > hash[id].x){
				PLG.worldLeft = hash[id].x;
				PLG.leftSprID = id;
			}
			if(PLG.worldRight < hash[id].x + hash[id].width){
				PLG.worldRight = hash[id].x + hash[id].width;
				PLG.rightSprID = id;
			}
			if(PLG.worldTop > hash[id].y){
				PLG.worldTop = hash[id].y;
				PLG.topSprID = id;
			}
			if(PLG.worldBottom < hash[id].y + hash[id].height){
				PLG.worldBottom = hash[id].y + hash[id].height;
				PLG.bottomSprID = id;
			}
		}
	}

	PLG.worldLeft += PLG.SPRITE_BORDER_OFFSET;
	PLG.worldTop += PLG.SPRITE_BORDER_OFFSET;

	var minLeft = 0;
	var minTop = 0;
	if(PLG.worldTop > minTop){
		PLG.worldTop = minTop;
	}
	if(PLG.worldLeft > minLeft){
		PLG.worldLeft = minLeft;
	}
	if(PLG.worldBottom < minTop + 1){
		PLG.worldBottom = minTop + 1;
	}
	if(PLG.worldRight < minLeft + 1){
		PLG.worldRight = minLeft + 1;
	}

	var frame = $("worldframe");
	
	var frameleft = 0;
	var frametop = 0;
	var framewidth = 0;
	var frameheight = 0;

	if(PLG.worldRight - PLG.worldLeft < PLG.getInnerWidth()){
		if(PARAM.page_type == "document"){
			frameleft = PLG.worldLeft;
			var frameright = PLG.getInnerWidth() + 100;
			if(PLG.worldRight + 100 > frameright){
				frameright = PLG.worldRight + 100;
			}
			framewidth = frameright - frameleft;
		}
		else if(PARAM.page_type == "map"){
			frameleft = - Math.round(PLG.getInnerWidth()/2) - 100;
			if(PLG.worldLeft - 100 < frameleft){
				frameleft = PLG.worldLeft - 100;
			}
			var frameright = Math.round(PLG.getInnerWidth()/2) + 100;
			if(PLG.worldRight + 100 > frameright){
				frameright = PLG.worldRight + 100;
			}
			framewidth  = frameright - frameleft;
		}
	}
	else{
		if(PARAM.page_type == "document"){
			frameleft = PLG.worldLeft;
		}
		else{
			frameleft = PLG.worldLeft - 100;
		}
		framewidth = PLG.worldRight - PLG.worldLeft + 200;
	}

	if(PLG.worldBottom - PLG.worldTop < PLG.getInnerHeight()){
		if(PARAM.page_type == "document"){
			frametop = PLG.worldTop;
			var framebottom = PLG.getInnerHeight() + 100;
			if(PLG.worldBottom + 100 > framebottom){
				framebottom = PLG.worldBottom + 100;
			}
			frameheight = framebottom - PLG.worldTop;
		}
		else if(PARAM.page_type == "map"){
			frametop = - Math.round(PLG.getInnerHeight()/2) - 100;
			if(PLG.worldTop - 100 < frametop){
				frametop = PLG.worldTop - 100;
			}
			var framebottom = Math.round(PLG.getInnerHeight()/2) + 100;
			if(PLG.worldBottom + 100 > framebottom){
				framebottom = PLG.worldBottom + 100;
			}
			frameheight = framebottom - frametop;
		}
	}
	else{
		if(PARAM.page_type == "document"){
			frametop = PLG.worldTop;
		}
		else{
			frametop = PLG.worldTop - 100;
		}
		frameheight = PLG.worldBottom - PLG.worldTop + 200;
	}

	PLG.worldFrameLeft = frameleft;
	PLG.worldFrameTop = frametop;
	PLG.worldFrameWidth = framewidth;
	PLG.worldFrameHeight = frameheight;

	frame.style.left = frameleft + "px";
	frame.style.top = frametop + "px";
	frame.style.width = framewidth + "px";
	frame.style.height = frameheight + "px";

	PLG.calcMinimumZoom();
};

// Get browser width
PLG.getInnerWidth = function() {
	if(!PLG.browser.safari && !PLG.browser.opera){
		try{
			return parseInt(document.documentElement.clientWidth);
		}
		catch(e){
			// This sometimes causes error on msie.
		}
	}
	else if(PLG.browser.opera){
		var trueWidth = parseInt(window.innerWidth);
		if(PARAM.positlogMode == "ViewMode" && parseInt(window.innerHeight) < $("spritesworld").offsetHeight){
			// vertical scroll bar is visible
			trueWidth -= 17;
		}
		return trueWidth;
	}
	else{
		return parseInt(window.innerWidth);
	}
};

// Get browser height
PLG.getInnerHeight = function() {
	if(!PLG.browser.safari && !PLG.browser.opera){
		return parseInt(document.documentElement.clientHeight);
	}
	else if(PLG.browser.opera){
		var trueHeight = parseInt(window.innerHeight);
		if(PARAM.positlogMode == "ViewMode" && parseInt(window.innerWidth) < $("spritesworld").offsetWidth){
			// vertical scroll bar is visible
			trueHeight -= 17;
		}
		return trueHeight;
	}
	else{
		return parseInt(window.innerHeight);
	}
};

// -----------------------------------------------------------------
// Get sprite geometry
// -----------------------------------------------------------------

PLG.sprLeft = function(spr) {
	if(!spr || !spr.style){
		return 0;
	}
	return parseInt(spr.style.left);
};
PLG.sprTop = function(spr) {
	if(!spr || !spr.style){
		return 0;
	}
	return parseInt(spr.style.top);
};
PLG.sprWidth = function(spr) {
	if(!spr || !spr.style){
		return 0;
	}
	return parseInt(spr.style.width);
};
PLG.sprHeight = function(spr) {
	if(!spr){
		return 0;
	}
	var height = spr.offsetHeight;
	return height;
};
PLG.sprContentsHeight = function(spr) {
	if(!spr){
		return 0;
	}
	var contents = PLG.getSpriteContents(spr);
	var padding = 0;
	if(contents.style.paddingBottom){
		padding = parseInt(contents.style.paddingTop.replace(/px/g, "")) + parseInt(contents.style.paddingBottom.replace(/px/g, ""));
	}
	var border = 0;
	if(contents.style.borderTopWidth){
		border = parseInt(contents.style.borderTopWidth.replace(/px/g, "")) * 2;
	}
	var height = parseInt(contents.offsetHeight) - parseInt(padding) - parseInt(border);
	return height;
};
PLG.sprZindex = function(spr) {
	if(!spr || !spr.style){
		return 0;
	}
	return parseFloat(spr.style.zIndex);
};

// -----------------------------------------------------------------
// Get Mouse Position in spliteslist region
// -----------------------------------------------------------------

PLG.mouseXonWorld = function(e, nozoom) {
	return PLG.browserXtoWorldX(PLG.mouseXonBrowser(e), nozoom);
};

PLG.mouseYonWorld = function(e, nozoom) {
	return PLG.browserYtoWorldY(PLG.mouseYonBrowser(e), nozoom);
};

// -----------------------------------------------------------------
// Get Mouse Position in browser window
// -----------------------------------------------------------------
PLG.mouseXonBrowser = function(e) {
	if(PLG.browser.msie || PLG.browser.msie7){
		return parseInt(window.event.clientX - PLG.mousePositionOffset);
	}
	else{
		return parseInt(e.pageX) - PLG.getScrollLeft();
	}
};

PLG.mouseYonBrowser = function(e) {
	if(PLG.browser.msie || PLG.browser.msie7){
		return parseInt(window.event.clientY - PLG.mousePositionOffset);
	}
	else{
		return parseInt(e.pageY) - PLG.getScrollTop();
	}
};

// -----------------------------------------------------------------
// Browser <-> World
// -----------------------------------------------------------------

// "getInnerWidth()/2" and "getInnerHeight()/2" must be rounded to keep
// consistent results between browserXtoWorldX and WorldXtoBrowserX

PLG.browserXtoWorldX = function(x, nozoom) {
	var zoom = PLG.zoom;
	if(nozoom){
		zoom = 1;
	}
	if(PARAM.positlogMode == "ViewMode"){
		if(PARAM.page_type == "map"){
			return Math.round((x + PLG.getScrollLeft() - PLG.getInnerWidth() / 2) / PLG.zoom + PLG.worldLeft);
		}
		else{
			return Math.round((x + PLG.getScrollLeft()) / zoom + PLG.worldLeft);
		}
	}
	else{
		if(PARAM.page_type == "map"){
			return Math.round((x - Math.round(PLG.getInnerWidth() / 2)) / zoom + PLG.viewPositionX);
		}
		else{
			return Math.round((x - Math.round(PLG.getInnerWidth() / 2)) / zoom + PLG.viewPositionX + Math.round(PLG.getInnerWidth() / 2));
		}
	}
};

PLG.browserYtoWorldY = function(y, nozoom) {
	var zoom = PLG.zoom;
	if(nozoom){
		zoom = 1;
	}
	if(PARAM.positlogMode == "ViewMode"){
		if(PARAM.page_type == "map"){
			return Math.round((y + PLG.getScrollTop() - PLG.getInnerHeight() / 2) / PLG.zoom + PLG.worldTop);
		}
		else{
			return Math.round((y + PLG.getScrollTop()) / zoom + PLG.worldTop);
		}
	}
	else{
		if(PARAM.page_type == "map"){
			return Math.round((y - Math.round(PLG.getInnerHeight() / 2)) / zoom + PLG.viewPositionY);
		}
		else{
			return Math.round((y - Math.round(PLG.getInnerHeight() / 2)) / zoom + PLG.viewPositionY + Math.round(PLG.getInnerHeight() / 2));
		}
	}
};

PLG.worldXtoBrowserX = function(x, nozoom) {
	var zoom = PLG.zoom;
	if(nozoom){
		zoom = 1;
	}
	if(PARAM.page_type == "map"){
		return Math.round((x - PLG.viewPositionX) * zoom + Math.round(PLG.getInnerWidth() / 2));
	}
	else{
		return Math.round((x - PLG.viewPositionX - Math.round(PLG.getInnerWidth() / 2)) * zoom + Math.round(PLG.getInnerWidth() / 2));
	}
};

PLG.worldYtoBrowserY = function(y, nozoom) {
	var zoom = PLG.zoom;
	if(nozoom){
		zoom = 1;
	}
	if(PARAM.page_type == "map"){
		return Math.round((y - PLG.viewPositionY) * zoom + Math.round(PLG.getInnerHeight() / 2));

	}
	else{
		return Math.round((y - PLG.viewPositionY - Math.round(PLG.getInnerHeight() / 2)) * zoom + Math.round(PLG.getInnerHeight() / 2));
	}
};


PLG.setCurrentURL = function() {
	var urlArray = location.href.split("?");
	var urlArray2 = urlArray[0].split("/");
	var newURL = "";
	for(var i = 0;i < urlArray2.length - 1; i++){
		newURL += urlArray2[i];
		newURL += "/";
	}

	if(PARAM.positlogMode == "EditMode"){
		newURL += "positlog.cgi?load=" + PARAM.pageid + "&mode=" + PARAM.positlogMode + "&p=" + PLG.viewPositionX + "," + PLG.viewPositionY;
	}
	else{
		newURL += "positlog.cgi?load=" + PARAM.pageid + "&p=" + PLG.viewPositionX + "," + PLG.viewPositionY;
	}

	if(PLG.zoom != 1 && PLG.zoom == PLG.minimumzoom){
		newURL += "&z=birdview";
	}
	else if(PLG.zoom != 1){
		newURL += "&z=" + PLG.zoom;
	}
	PLG.currentURL = newURL;

	$("currentposition").innerHTML = "<a href='" + newURL + "'>url</a>";
};



PLG.searchNearestSibling = function(sibidI, siblings, position, hashI){
	var minmargin = "";
	var minmarginid = "";

	for(var j=0; j<siblings.length; j++){
		var sibidJ = siblings[j];
		var hashJ = null;
		if(siblings[j].match(/^spr.+$/)){
			hashJ = PARAM.sprites;
		}
		else if(siblings[j].match(/^grp.+$/)){
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
					 if(minmargin === "" || minmargin > hashI[sibidI].y - (hashJ[sibidJ].y + hashJ[sibidJ].height)){
						 minmargin = hashI[sibidI].y - (hashJ[sibidJ].y + hashJ[sibidJ].height);
						 minmarginid = sibidJ;
					 }
				 }
			 }
	}

	return minmarginid;
};

PLG.adjustSiblingsMargin = function(siblings){
	var upperSiblings = [];
	var lowerSiblings = [];

	for(var id in siblings){
		if(id.match(/_link$/)){
			continue;
		}
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
	upperSiblings.sort(sortByBottomReverse);

	var tempLowerSiblings = [];
	for(var i=0; i<upperSiblings.length; i++){
		var sibid = upperSiblings[i];
		var nearestid = "";

		var hash = null;
		if(sibid.match(/^spr.+$/)){
			hash = PARAM.sprites;
		}
		else if(sibid.match(/^grp.+$/)){
			hash = PARAM.groups;
		}
		else{
			continue;
		}

		if(!hash[sibid].margin_s || !hash[sibid].margin_s.elder){
			tempLowerSiblings.push(sibid);
			continue;
		}
	
		var elderid = hash[sibid].margin_s.elder;
		var hashE = null;

		var nearesttop = 0;
		if(elderid == "root" && hash[sibid].margin_s.position == "TB"){
			tempLowerSiblings.push(sibid);
		}
		else{
			if(elderid.match(/^spr.+$/)){
				hashE = PARAM.sprites;
			}
			else if(elderid.match(/^grp.+$/)){
				hashE = PARAM.groups;
			}
			else{
				tempLowerSiblings.push(sibid);
				continue;
			}

			if(!hashE[elderid]){
				tempLowerSiblings.push(sibid);
				continue;
			}
			
			if(hash[sibid].margin_s.pixel < 0){
				// The target spriet originally overlapped on the elder sprite
				nearestid = hash[sibid].margin_s.elder;
			}
			else{
				nearestid = PLG.searchNearestSibling(sibid, tempLowerSiblings, "upper", hash);
			}
			tempLowerSiblings.push(sibid);

			if(nearestid !== ""){
				var hashN = null;
				if(nearestid.match(/^spr.+$/)){
					hashN = PARAM.sprites;
				}
				else if(nearestid.match(/^grp.+$/)){
					hashN = PARAM.groups;
				}
				else{
					continue;
				}

				if(hashN[nearestid].y > hashE[elderid].y){
					// The elder sprite exists above the target sprite
					nearestid = elderid;
				}

				if(!hashN[nearestid]){
					continue;
				}
				nearesttop = hashN[nearestid].y;
			}

		}

		if(hash[sibid].margin_s.position == "TB"){
			if(sibid.match(/^spr.+$/)){
				var newy = nearesttop - hash[sibid].margin_s.pixel - hash[sibid].height;
				if(hash[sibid].y != newy){
					PLG.marginIsAdjusted = true;
				}
				hash[sibid].y = newy;
				$(sibid).style.top = hash[sibid].y + "px";
			}
			else if(sibid.match(/^grp.+$/)){
				var oldy = hash[sibid].y;
				var newy = nearesttop - hash[sibid].margin_s.pixel - hash[sibid].height;
				hash[sibid].y = newy;

				if(hash[sibid].y != newy){
					PLG.marginIsAdjusted = true;
				}

				if($(sibid)){
					$(sibid).style.top = hash[sibid].y + "px";
				}

				var items = [];
				for(var id in PARAM.groups[sibid]){
					items.push(id);
				}
				while(items.length > 0){
					var id = items.pop();
					if(id.match(/^spr.+$/)){
						PARAM.sprites[id].y += newy - oldy;
						$(id).style.top = PARAM.sprites[id].y + "px";
					}
					else if(id.match(/^grp.+$/)){
						PARAM.groups[id].y += newy - oldy;
						if($(id)){
							$(id).style.top = PARAM.groups[id].y + "px";
						}
						for(var child in PARAM.groups[id]){
							items.push(child);
						}
					}
				}
			}
		}
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

	var tempUpperSiblings = [];
	for(var i=0; i<lowerSiblings.length; i++){
		var sibid = lowerSiblings[i];
		var nearestid = "";

		var hash = null;
		if(sibid.match(/^spr.+$/)){
			hash = PARAM.sprites;
		}
		else if(sibid.match(/^grp.+$/)){
			hash = PARAM.groups;
		}
		else{
			continue;
		}

		if(!hash[sibid].margin_s || !hash[sibid].margin_s.elder){
			tempUpperSiblings.push(sibid);
			continue;
		}

		var elderid = hash[sibid].margin_s.elder;
		var hashE = null;
		if(elderid.match(/^spr.+$/)){
			hashE = PARAM.sprites;
		}
		else if(elderid.match(/^grp.+$/)){
			hashE = PARAM.groups;
		}
		else{
			tempUpperSiblings.push(sibid);
			continue;
		}

		if(!hashE[elderid]){
			tempUpperSiblings.push(sibid);
			continue;
		}
	
		if(hash[sibid].margin_s.pixel < 0){
			// The target spriet originally overlapped on the elder sprite
			nearestid = hash[sibid].margin_s.elder;
		}
		else{
			nearestid = PLG.searchNearestSibling(sibid, tempUpperSiblings, "lower", hash);
		}
		tempUpperSiblings.push(sibid);
		
		if(nearestid !== ""){

			var hashN = null;
			if(nearestid.match(/^spr.+$/)){
				hashN = PARAM.sprites;
			}
			else if(nearestid.match(/^grp.+$/)){
				hashN = PARAM.groups;
			}
			else{
				continue;
			}

			if(hashN[nearestid].y + hashN[nearestid].height < hashE[elderid].y + hashE[elderid].height){
				// The elder sprite exists below the target sprite
				nearestid = elderid;
			}

			if(!hashN[nearestid]){
				continue;
			}

			if(hash[sibid].margin_s.position == "BT"){
				if(sibid.match(/^spr.+$/)){
					var newy = hashN[nearestid].y + hashN[nearestid].height + hash[sibid].margin_s.pixel;
					if(hash[sibid].y != newy){
						PLG.marginIsAdjusted = true;
					}
					hash[sibid].y = newy;
					$(sibid).style.top = parseInt(hash[sibid].y) + "px";					 
				}
				else if(sibid.match(/^grp.+$/)){
					var oldy = hash[sibid].y;
					var newy = hashN[nearestid].y + hashN[nearestid].height + hash[sibid].margin_s.pixel;
					hash[sibid].y = newy;
					if(hash[sibid].y != newy){
						PLG.marginIsAdjusted = true;
					}
					if($(sibid)){
						$(sibid).style.top = hash[sibid].y + "px";
					}
					var items = [];
					for(var id in PARAM.groups[sibid]){
						items.push(id);
					}
					while(items.length > 0){
						var id = items.pop();
						if(id.match(/^spr.+$/)){
							PARAM.sprites[id].y += newy - oldy;
							$(id).style.top = PARAM.sprites[id].y + "px";
						}
						else if(id.match(/^grp.+$/)){
							PARAM.groups[id].y += newy - oldy;
							if($(id)){
								$(id).style.top = PARAM.groups[id].y + "px";
							}
							for(var child in PARAM.groups[id]){
								items.push(child);
							}
						}
					}
				}
			}
		}
	}
};

PLG.marginIsAdjusted = false;
PLG.adjustMargin = function(gid){
	var siblings;
	if(gid === ""){
		var rootItems = {};
		for(var id in PARAM.groups){
			if(id.match(/_link$/)){
				continue;
			}
			if(id.match(/^grp.+$/)){
				if(!PARAM.groups[id].groupid){
					rootItems[id] = 1;
					PLG.adjustMargin(id);
					PLG.calcRegionsOfGroup(id);
				}
			}
		}
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				if(!PARAM.sprites[id].groupid){
					rootItems[id] = 1;
				}
			}
		}
		PLG.adjustSiblingsMargin(rootItems);

	}
	else{
		for(var id in PARAM.groups[gid]){
			if(id.match(/^grp.+$/)){
				PLG.adjustMargin(id);
				PLG.calcRegionsOfGroup(id);
			}
		}
		PLG.adjustSiblingsMargin(PARAM.groups[gid]);
	}
};


PLG.layouter = function() {
	if(PLG.fontSize != document.getElementById("footer").offsetHeight){
		PLG.fontSize = document.getElementById("footer").offsetHeight;
		PLG.adjustFlag = true;
	}

	if(PLG.adjustFlag && !PLG.zooming){
		PLG.adjustFlag = false;

		// Save new height
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				PLG.backupDynamicValues($(id));
			}
		}

		// Reset to original position
		if(PARAM.publish == 1 && PARAM.positlogMode == "ViewMode"){
			for(var id in PARAM.sprites){
				if(id.match(/^spr.+$/)){
					PARAM.sprites[id].x = PARAM.sprites[id].orgx;
					PARAM.sprites[id].y = PARAM.sprites[id].orgy;
				}
			}
		}

		PLG.adjustMargin("");

		// Re-calc
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				var spr = $(id);
				PLG.backupSpritePosition(spr);
			}
		}

		for(var id in PARAM.sprites){
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
						srcid += "_" + sprArray[1] + sprArray[2];
						dstid = sprArray[3];
					}
				}
				else if(sprArray.length == 2){
					srcid = sprArray[0];
					dstid = sprArray[1];
				}
				PLG.drawArrowSprite(srcid, dstid);
			}
		}


		PLG.rebuildWorldEdges();


		PLG.initSmallMap();
		PLG.redrawViewCanvas();
		PLG.redrawMapCanvas();

		if(PARAM.positlogMode == "EditMode" && EDT.loaded){
			PLG.resizeWorld();
			EDT.view.redraw();
		}
	}
};

// -----------------------------------------------------------------
// Backup properties
// -----------------------------------------------------------------

PLG.backupDynamicValues = function(spr) {
	var id = spr.id;
	PARAM.sprites[id].width = PLG.sprWidth(spr);
	PARAM.sprites[id].height = PLG.sprHeight(spr);

	PARAM.sprites[id].contentsHeight = PLG.sprContentsHeight(spr);

	var info = PLG.getSpriteInfo(spr);
	if(info && info.childNodes.length > 0){
		if(PLG.browser.msie || PLG.browser.msie7){
			PARAM.sprites[id].infoHeight = info.offsetHeight;
		}
		else{
			PARAM.sprites[id].infoHeight = 12;
		}
	}
	else{
			PARAM.sprites[id].infoHeight = 0;
	}
};

PLG.setContentsPadding = function(contents, padding){
	contents.style.padding = padding + "px";
/* 
	if( (!contents.style.borderTopWidth || contents.style.borderTopWidth == "0px" || !contents.style.borderTopStyle || contents.style.borderTopStyle == "none")
			&& padding == 0
			&& (PLG.browser.msie || PLG.browser.msie7) 
			&& contents.innerHTML.match(/<p.*?>/mi)){
		// IEs do not insert blank line before <p> element when contents does not have border or padding.
		contents.style.paddingTop = "1px";
	}
*/
};

PLG.backupDynamicProperties = function(spr) {
	// Dynamic properties are defined only after a sprite is append to DOM
	// because these properties follow the size of the rendered innerHTML of
	// spritecontents.
	// This function must be called only when a sprite is the original size (not
	// zoomed out)
	// because width and height are changed when zooming.
	var id = spr.id;
	if(PLG.zooming){
		// Reset to the original size
		var contents = PLG.getSpriteContents(spr);
		var region = PLG.getSpriteRegion(spr);
		if(PARAM.sprites[id].width && spr.style.width != PARAM.sprites[id].width + "px"){

			PLG.adjustZoomingObject(spr.id, 1.0);
			PLG.adjustZoomingCanvas(id, 1.0);
			PLG.adjustZoomingListItem(id, 1.0);


			spr.style.width = PARAM.sprites[id].width + "px";
			spr.style.height = "auto";
			spr.style.fontSize = "";
			spr.style.lineHeight = "";

			region.style.width = (PARAM.sprites[id].width - 2) + "px";
			region.style.height = "auto";

			contents.style.overflow = "visible";
			contents.style.height = "auto";
//			contents.style.padding = PARAM.sprites[id].padding + "px";
			PLG.setContentsPadding(contents, PARAM.sprites[id].padding);
			contents.style.borderWidth = PARAM.sprites[id].borderWidth + "px";

			var info = PLG.getSpriteInfo(spr);
			info.style.height = "auto";
		}

		PLG.backupDynamicValues(spr);

		// Return to the zooming size
		contents.style.overflow = "hidden";
		PLG.getSpriteInfo(spr).style.overflow = "hidden";
		// You must call drawZoomMap() after that.
	}
	else{
		PLG.backupDynamicValues(spr);
	}
};

PLG.backupSpritePosition = function(spr) {
	var id = spr.id;
	// sprLeft and sprTop are changed when zooming.
	if(!PARAM.sprites[id].x || !PLG.zooming){
		PARAM.sprites[id].x = PLG.sprLeft(spr);
		PARAM.sprites[id].y = PLG.sprTop(spr);
	}
	PARAM.sprites[id].z = PLG.sprZindex(spr);
};

// Backup
// borderWidth, borderStyle, borderColor
// padding
// color, backgroundColor
// innerHTML, plugin

PLG.fixParagraph = function(contents){
	var first = contents.firstChild;
	if(first && first.nodeType == 1 && first.tagName.match(/p|H\d|blockquote|div|ul|ol|dl|pre|table/i)){
		first.style.marginTop = "0px";
	}
	var last = contents.lastChild;
	if(last && last.nodeType == 3){
		if(last.nodeValue.length == 0){
			last = last.previousSibling;
		}
	}
	if(last && last.nodeType == 1 && last.tagName.match(/p|H\d|blockquote|div|ul|ol|dl|pre|table/i)){
		last.style.marginBottom = "0px";
	}
};

PLG.backupSpriteProperties = function(spr) {
	var id = spr.id;
	
	PLG.backupSpritePosition(spr);

	var contents = PLG.getSpriteContents(spr);

	// Safari cannot get border by short name. (e.g. border, border-width)
	// Get by full name. (e.g. border-top-width);

	// For zooming
	if(contents.style.borderTopWidth){
		PARAM.sprites[id].borderWidth = parseInt(contents.style.borderTopWidth.replace(/px/g, ""));
	}
	else{
		PARAM.sprites[id].borderWidth = 0;
	}
	if(contents.style.paddingBottom){
		PARAM.sprites[id].padding = parseInt(contents.style.paddingBottom.replace(/px/g, ""));
	}
	else{
		PARAM.sprites[id].padding = 0;
	}
	PLG.setContentsPadding(contents, PARAM.sprites[id].padding);

	if(PARAM.positlogMode == "EditMode"){
		// innerHTML in the drawing sprite might be wrong.
		// See the usage of setValidInnerHtmlForDrawing(id) in edit.js.
		PARAM.sprites[id].innerHTML = contents.innerHTML;

		var pluginElm = PLG.getSpritePlugin(spr);
		if(pluginElm){
			PARAM.sprites[id].plugin = pluginElm.innerHTML;
		}
		if(contents.style.borderTopStyle){
			PARAM.sprites[id].borderStyle = contents.style.borderTopStyle;
		}
		else{
			PARAM.sprites[id].borderStyle = "none";
		}
		if(contents.style.borderTopColor){
			PARAM.sprites[id].borderColor = contents.style.borderTopColor;
		}
		else{
			PARAM.sprites[id].borderColor = "#ffffff";
		}
		if(contents.style.color){
			PARAM.sprites[id].color = contents.style.color;
		}
		else{
			PARAM.sprites[id].color = "#000000";
		}
		if(contents.style.backgroundColor){
			PARAM.sprites[id].bgColor = contents.style.backgroundColor;
		}
		else{
			PARAM.sprites[id].bgColor = "";
		}
	}

	PLG.fixParagraph(contents);

};

// -----------------------------------------------------------------
// Zooming
// -----------------------------------------------------------------

PLG.zoomSprites = [];
PLG.zoomSpritesAdjusted = {};

PLG.adjustZoomingWorldFrame = function(){
	var width = Math.round(PLG.worldFrameWidth * PLG.zoom);
	var height = Math.round(PLG.worldFrameHeight * PLG.zoom);
	var frame = $("worldframe");

	if(PARAM.positlogMode == "ViewMode" && PARAM.page_type == "document"){
		var left = (PLG.worldFrameLeft - PLG.worldLeft) * PLG.zoom + PLG.worldLeft;
		var top = (PLG.worldFrameTop - PLG.worldTop) * PLG.zoom + PLG.worldTop;
		frame.style.left = Math.round(left) + "px";
		frame.style.top = Math.round(top) + "px";
	}
	else{
		var centerX = PLG.worldFrameLeft + PLG.worldFrameWidth / 2 - PLG.viewPositionX;
		var centerY = PLG.worldFrameTop + PLG.worldFrameHeight / 2 - PLG.viewPositionY;
		if(PARAM.page_type == "document"){
			centerX -= Math.round(PLG.getInnerWidth() / 2);
			centerY -= Math.round(PLG.getInnerHeight() / 2);
		}

		var left = Math.round(centerX * PLG.zoom - width / 2);
		var top = Math.round(centerY * PLG.zoom - height / 2);
		if(PARAM.page_type == "document"){
			left += Math.round(PLG.getInnerWidth() / 2);
			top += Math.round(PLG.getInnerHeight() / 2);
		}

		if(PARAM.positlogMode == "ViewMode"){
			frame.style.left = (left + PLG.getScrollLeft() + PLG.worldLeft) + "px";
			frame.style.top = (top + PLG.getScrollTop() + PLG.worldTop) + "px";
		}
		else if(PARAM.positlogMode == "EditMode"){
			frame.style.left = (left + PLG.viewPositionX) + "px";
			frame.style.top = (top + PLG.viewPositionY) + "px";
		}	
	}



	frame.style.width = width + "px";
	frame.style.height = height + "px";

	if(PLG.zoom == 1.0 && PARAM.positlogMode == "ViewMode"){
		if(frame.style.visibility != "hidden"){
			frame.style.visibility = "hidden";
		}
	}
	else{
		if(frame.style.visibility != "visible"){
			frame.style.visibility = "visible";
		}
	}
};


PLG.adjustZoomingSpritesPosition = function(id){
	var width = Math.round(PARAM.sprites[id].width * PLG.zoom);
	var height = Math.round(PARAM.sprites[id].height * PLG.zoom);
	var spr = $(id);


	if(PARAM.positlogMode == "ViewMode" && PARAM.page_type == "document"){
		var left = (PARAM.sprites[id].x - PLG.worldLeft) * PLG.zoom + PLG.worldLeft;
		var top = (PARAM.sprites[id].y - PLG.worldTop) * PLG.zoom + PLG.worldTop;
		var spr = $(id);
		spr.style.left = Math.round(left) + "px";
		spr.style.top = Math.round(top) + "px";
	}
	else{
		var centerX = PARAM.sprites[id].x + PARAM.sprites[id].width / 2 - PLG.viewPositionX;
		var centerY = PARAM.sprites[id].y + PARAM.sprites[id].height / 2 - PLG.viewPositionY;
		if(PARAM.page_type == "document"){
			centerX -= PLG.getInnerWidth() / 2;
			centerY -= PLG.getInnerHeight() / 2;
		}

		var left = centerX * PLG.zoom - width / 2;
		var top = centerY * PLG.zoom - height / 2;
		if(PARAM.page_type == "document"){
			left += PLG.getInnerWidth() / 2;
			top += PLG.getInnerHeight() / 2;
		}

		if(PARAM.positlogMode == "ViewMode"){
			spr.style.left = Math.round(left + PLG.getScrollLeft() + PLG.worldLeft) + "px";
			spr.style.top = Math.round(top + PLG.getScrollTop() + PLG.worldTop) + "px";
		}
		else if(PARAM.positlogMode == "EditMode"){
			spr.style.left = Math.round(left + PLG.viewPositionX) + "px";
			spr.style.top = Math.round(top + PLG.viewPositionY) + "px";
		}
	}
}

PLG.adjustZoomingSpritesContents = function(id){
	var width = Math.round(PARAM.sprites[id].width * PLG.zoom);
	var height = Math.round(PARAM.sprites[id].height * PLG.zoom);

	var spr = $(id);
	var contents = PLG.getSpriteContents(spr);
	var region = PLG.getSpriteRegion(spr);

	if(PLG.zooming){
		if(PLG.zoom == 1.0){
			spr.style.fontSize = "";
			spr.style.lineHeight = "";
		}
		else if(PLG.zoom == 0.1){
			spr.style.fontSize = "5%";
			spr.style.lineHeight = "1";
		}
		else if(PLG.zoom <= 0.5){
			spr.style.fontSize = Math.round(PLG.zoom * 100) + "%";
			spr.style.lineHeight = "1";
		}
		else if(PLG.zoom <= 0.8){
			spr.style.fontSize = Math.round(PLG.zoom * 100) + "%";
			spr.style.lineHeight = "1.1";
		}
		else{
			spr.style.fontSize = Math.round(PLG.zoom * 100) + "%";
			spr.style.lineHeight = "";
		}
		spr.style.width = width + "px";
		spr.style.height = height + "px";

		var regionHeight = height - 2;
		region.style.width = (width - 2) + "px";
		region.style.height = regionHeight + "px";

		var padding = Math.round(parseInt(PARAM.sprites[id].padding) * PLG.zoom);
//		contents.style.padding = padding + "px";
		PLG.setContentsPadding(contents, padding);
		var borderWidth = Math.round(parseInt(PARAM.sprites[id].borderWidth) * PLG.zoom);
		if(borderWidth < 1 && parseInt(PARAM.sprites[id].borderWidth) != 0){
			borderWidth = 1;
		}
		contents.style.borderWidth = borderWidth + "px";

		if(PLG.browser.safari || PLG.browser.opera){
			var info = PLG.getSpriteInfo(spr);
			if(PLG.zoom <= 0.5){
				if(info.style.visibility != "hidden"){
					info.style.visibility = "hidden";
				}
			}
			else{
				if(info.style.visibility != "visible"){
					info.style.visibility = "visible";
				}
			}
		}

		var infoH = Math.round(PARAM.sprites[id].infoHeight * PLG.zoom);
		var info = PLG.getSpriteInfo(spr);
		info.style.height = infoH + "px";

		var contentsHeight = regionHeight - infoH - padding*2 - borderWidth*2;

		if(contentsHeight < 1){
			contentsHeight = 1;
		}
		contents.style.height =  contentsHeight + "px";
		
		if(PARAM.positlogMode == "EditMode"){
//			alert("set: spr " + height + ", region " + (height - 2) + ", contents " + rHeight + ", info " + infoH);
//			alert("value: spr " + spr.offsetHeight + ", region " + region.offsetHeight + ", contents " + contents.offsetHeight + ", info " + info.offsetHeight);
		}
	}

};

PLG.adjustZoomingObject = function(id, zoom){

	for(var index in PLG.zoomingObject[id]){
		if(index.match(/\d+/)){
			var obj = PLG.zoomingObject[id][index];
			
			var width = Math.round(obj.width * zoom);
			var height = Math.round(obj.height * zoom);
			var node = $(obj.id);

			if((PLG.browser.msie || PLG.browser.msie7)
				 && obj.id.match(/iframe/i)){
					 node.style.zoom =  zoom;
				 }
			else{
				if(node){
					node.style.width = width + "px";
					node.style.height = height + "px";
					node.width = width;
					node.height = height;
				}
			}
		

		}
	}
};

PLG.adjustZoomingListItem = function(id, zoom){
	for(var index in PLG.zoomingListItem[id]){
		if(index.match(/\d+/)){
			var obj = PLG.zoomingListItem[id][index];
			
			var node = $(obj.id);
			if(node){
				node.style.marginLeft = Math.round(obj.marginLeft * zoom) + "px";
				node.style.paddingLeft = Math.round(obj.paddingLeft * zoom) + "px";
			}
		}
	}
};

PLG.adjustZoomingCanvas = function(id, zoom){
		var canvas = PLG.zoomingCanvas[id];

		if(canvas){
			var width = Math.round(canvas.width * zoom);
			var height = Math.round(canvas.height * zoom);
			var node = $(id + "_canvas");
			if(!node){
				if($(id).innerHTML.match(/(spr.+?_canvas)/)){
					var cid = RegExp.$1;
          node = $(cid);
        }
			}
			if(PLG.browser.safari2){
				if(node.parentNode.innerHTML.match(/draw\('(.+)'\)/)){
					var drawCommand = RegExp.$1;
					PLG.draw(drawCommand);
				}
			}
			else{
				node.style.width = width + "px";
				node.style.height = height + "px";
			}


			if(PLG.browser.msie || PLG.browser.msie7){
				if(node.firstChild){
					var children = node.firstChild.childNodes;
					for(var j = 0;j < children.length; j++){
									// See excanvas.js for more information about the
									// reason why using "10" px.
									// (<g_vml_:shape>'s width and height are 10px.)
									//							var base = 10;
						
						if(children[j].tagName.match(/shape/i)){
							var base = 100;
							children[j].style.width = Math.round(base * zoom) + "px";
							children[j].style.height = Math.round(base * zoom) + "px";
							var strokes = children[j].childNodes;

							for(var k = 0;k < strokes.length; k++){
								if(strokes[k].id.match(/stroke_(.+)/i)){
									strokes[k].weight = RegExp.$1 * zoom + "px";
								}
							}
						}
					}
				}
			}
		}
};

PLG.execZoomNumber = 3;
PLG.execZoomSprites = function(){
	if(!PLG.zoomIn && PLG.execZoomNumber < 10){
		for(var i=0; i<PLG.zoomSprites.length; i++){
			PLG.adjustZoomingSpritesContents(PLG.zoomSprites[i])
		}
	}

	for(var i=0; i<PLG.execZoomNumber; i++){
		if(PLG.zoomSprites.length > 0){
			var id = PLG.zoomSprites.pop();
			if(id){
				if(PARAM.positlogMode == "EditMode" || PLG.zoomingOnMouseDown){
					PLG.adjustZoomingSpritesPosition(id);

					if(PLG.zoomIn){
						PLG.adjustZoomingSpritesContents(id)
					}

					PLG.adjustZoomingObject(id, PLG.zoom);
					PLG.adjustZoomingCanvas(id, PLG.zoom);
					PLG.adjustZoomingListItem(id, PLG.zoom);

					PLG.zoomSpritesAdjusted[id] = 1;
				}
			}
		}
		else{
			break;
		}
	}

	if(PLG.execZoomNumber < 10){
		PLG.execZoomNumber = 10;
	}
};

PLG.rewriteChangeModeLink = function(){
	var zoomArg = "";
	if(PLG.zoom != 1 && PLG.zoom == PLG.minimumzoom){
		zoomArg += "&amp;z=birdview";
	}
	else if(PLG.zoom != 1){
		zoomArg += "&amp;z=" + PLG.zoom;
	}	
	if($("changemode")){
		if(PARAM.positlogMode == "ViewMode"){
			$("changemode").innerHTML = "<a href='./positlog.cgi?load=" + PARAM.pageid + zoomArg + "&amp;mode=EditMode'>[Edit]</a>";
		}
		else if(PARAM.positlogMode == "EditMode"){
			$("changemode").innerHTML = "<a href='./positlog.cgi?load=" + PARAM.pageid + zoomArg + "'>[View]</a>";
		}
	}
};

PLG.drawZoomMap = function(timerFlag) {
	// Clear array
	if(timerFlag !== undefined && timerFlag){
		PLG.zoomSprites.length = 0;
		PLG.zoomSpritesAdjusted = {};

		if(PLG.zoomTimer !== null){
			clearInterval(PLG.zoomTimer);
			PLG.zoomTimer = null;
		}

		for(var i=0; i<PLG.spriteArraySorted.length; i++){
			PLG.zoomSprites.push(PLG.spriteArraySorted[i]);
		}
		PLG.execZoomNumber = 3;
		PLG.zoomTimer = setInterval("PLG.execZoomSprites()", 100);
		PLG.adjustZoomingWorldFrame();
	}
	else{
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				PLG.adjustZoomingSpritesPosition(id);
				PLG.adjustZoomingSpritesContents(id);
				PLG.adjustZoomingObject(id, PLG.zoom);
				PLG.adjustZoomingCanvas(id, PLG.zoom);
				PLG.adjustZoomingListItem(id, PLG.zoom);
			}
		}
		PLG.adjustZoomingWorldFrame();
	}

	if(PLG.browser.safari2){
		if(PLG.drawTimer === null){
			PLG.drawTimer = setInterval("PLG.execDrawCommand()", 100);
			PLG.zoomDrawTimerFlag = true;
		}
	}

	if(PARAM.positlogMode == "EditMode"){
		var centermark = $("centermark");
		var centerX = 0 - PLG.viewPositionX;
		var centerY = 0 - PLG.viewPositionY;
		if(PARAM.page_type == "document"){
			centerX += 6 - Math.round(PLG.getInnerWidth() / 2);
			centerY += 6 - Math.round(PLG.getInnerHeight() / 2);
		}

		var left = Math.round(centerX * PLG.zoom - Math.ceil(centermark.offsetWidth / 2));
		var top = Math.round(centerY * PLG.zoom - Math.ceil(centermark.offsetHeight / 2));

		if(PARAM.page_type == "document"){
			left += Math.round(PLG.getInnerWidth() / 2);
			top += Math.round(PLG.getInnerHeight() / 2);
		}

		centermark.style.left = (left + PLG.viewPositionX) + "px";
		centermark.style.top = (top + PLG.viewPositionY) + "px";
	}
};

PLG.changeZoomDisplay = function() {
	if(!PLG.zooming){
		$("zoom").innerHTML = " ";
	}
	else if(PLG.zoom == 1.0){
		$("zoom").innerHTML = "x1.0";
	}
	else{
		$("zoom").innerHTML = "x" + PLG.zoom;
	}
	if($("zoom").innerHTML.length == 4){
		$("zoom").innerHTML += "0";
	}

	if(PARAM.positlogMode == "ViewMode" && PLG.minimumzoom != 1){
		var scale = (1 - PLG.zoom)  * 0.9 / (1-PLG.minimumzoom) * 10;
		if(scale > 9){
			scale = 9;
		}
		 $("zoompointer").style.top = Math.round(19 + 17 * scale) + "px";
	}
	else{
		 $("zoompointer").style.top = Math.round(19 + 17 * (1 - PLG.zoom) * 10) + "px";
	}

	PLG.rewriteChangeModeLink();
};

PLG.prevZoom = 1.0;
PLG.zoomIn = false;
PLG.changeZoom = function(zoom) {
	PLG.prevZoom = PLG.zoom;

	if(PLG.prevZoom == zoom){
		return;
	}

	if(PLG.prevZoom <= zoom){
		PLG.zoomIn = true;
	}
	else{
		PLG.zoomIn = false;
	}
	PLG.zoom = zoom;

	if(PLG.state == PLG.STATES.FIXEDSELECTED || PLG.state == PLG.STATES.FIXED){
		EDT.view.revertProperty();
		PLG.selection.clear();
		PLG.state = PLG.STATES.WORKING;
		EDT.view.redraw();
	}

	if(PLG.zoom == 1.0){
		PLG.changeZoomDisplay();

		PLG.drawZoomMap(true);
		PLG.redrawViewCanvas();
	}
	else{
		if(!PLG.zooming){
			PLG.enableZooming();
		}

		PLG.changeZoomDisplay();
		
		PLG.drawZoomMap(true);
		PLG.redrawViewCanvas()
	}

	if(PARAM.positlogMode == "EditMode" && EDT.loaded){
		EDT.view.redraw();
	}

	if(PARAM.positlogMode == "ViewMode"){
		if(PLG.zoomIn && !PLG.zoomingOnMouseDown){
			PLG.resizeWorld(1.0);
		}
		PLG.zoomingOnMouseDown = true;
	}

	PLG.setHomeBtn(PLG.viewPositionX, PLG.viewPositionY);

	PLG.setCurrentURL();
};


PLG.adjustViewPositionAfterMouseWheel = function(){
	PLG.setViewPosition(PLG.viewPositionX, PLG.prevViewPositionY - Math.round(PLG.sumOfMoveY/PLG.zoom), true, true, false);
	PLG.sumOfMoveY = 0;
	PLG.sortSpritesByDistance();
};


PLG.zoomingOnMouseWheel = function(delta) {
	// Zoom
	if(delta){
		if(delta > 0){
			delta = 0.10;
		}
		else{
			if(PLG.browser.msie || PLG.browser.msie7){
				delta = -0.05;
			}
			else{
				delta = -0.05;
			}
		}

		var zoom = 1.0;
		if(delta > 0){
			if(PLG.zoom == 1.0){
				return;
			}
			zoom = parseFloat(PLG.zoom) + delta;
			if(zoom >= 1.0){
				zoom = 1.0;
			}
			else{
				zoom = Math.floor((zoom + 0.005) * 100) / 100;
			}
		}
		else{
			if(PLG.zoom == 0.1){
				return;
			}
			zoom = parseFloat(PLG.zoom) + delta;


			if(PARAM.positlogMode == "EditMode"){			
				if(zoom < 0.1){
					zoom = 0.1;
				}
				else{
					zoom = Math.floor((zoom + 0.005) * 100) / 100;
				}
			}
			else{
				if(PLG.zoom == PLG.minimumzoom){
					PLG.showForceCancelMark();
					return;
				}
				else if(zoom < PLG.minimumzoom){
					zoom = PLG.minimumzoom;
				}
				else{
					zoom = Math.floor((zoom + 0.005) * 100) / 100;
				}
			}
		}
		PLG.changeZoom(zoom);
	}

};

PLG.backupZoomingObject = function(tagName){
	var objArray = document.getElementsByTagName(tagName);
	for(var i = 0;i < objArray.length; i++){
		var objNode = objArray[i];
		if(objNode.id == "homebtnicon"
			|| objNode.id == "plg_anchorframe"){
			continue;
		}
		var parent = objNode.parentNode;
		while(parent.className === undefined || parent.className != "sprite"){
			parent = parent.parentNode;
			if(parent === null){
				break;
			}
		}
		if(parent === null){
			continue;
		}
		if(!parent.id.match(/^spr/)){
			continue;
		}

		var obj = {};

// offsetXXXX cannot get w/h of <embed>
//		obj.width = objNode.offsetWidth;
//		obj.height = objNode.offsetHeight;
		// Opera cannot get objNode.width and height
		if(PLG.browser.opera){
			obj.width = objNode.offsetWidth;
			obj.height = objNode.offsetHeight;
		}
		else{
			obj.width = objNode.width;
			obj.height = objNode.height;
		}
		var objid = "positlog" + tagName + "_" + i + "_";
		if(objNode.id){
			objid += objNode.id;
		}
		objNode.id = objid;
		
		obj.id = objid;

		var count = 0;
		if(PLG.zoomingObject[parent.id] === undefined){
			PLG.zoomingObject[parent.id] = {};
		}
		else{
			for(var index in PLG.zoomingObject[parent.id]){
				if(index.match(/\d+/)){
					count++
				}
			}
		}			
		PLG.zoomingObject[parent.id][count] = obj;
	}
};


PLG.backupZoomingListItem = function(tagName){
	var objArray = document.getElementsByTagName(tagName);
	for(var i = 0;i < objArray.length; i++){
		var objNode = objArray[i];
		var parent = objNode.parentNode;
		while(parent.className === undefined || parent.className != "sprite"){
			parent = parent.parentNode;
			if(parent === null){
				break;
			}
		}
		if(parent === null){
			continue;
		}
		if(!parent.id.match(/^spr/)){
			continue;
		}

		var obj = {};

		if(PLG.browser.msie || PLG.browser.msie7){
			obj.paddingLeft = parseInt(objNode.currentStyle.paddingLeft.replace(/px/g, ""));
			obj.marginLeft = parseInt(objNode.currentStyle.marginLeft.replace(/px/g, ""));
		}
		else{
			obj.paddingLeft = parseInt(document.defaultView.getComputedStyle(objNode, '').getPropertyValue("padding-left").replace(/px/g, ""));
			obj.marginLeft = parseInt(document.defaultView.getComputedStyle(objNode, '').getPropertyValue("margin-left").replace(/px/g, ""));
		}

		var objid = "positlog" + tagName + "_" + i + "_";
		if(objNode.id){
			objid += objNode.id;
		}
		objNode.id = objid;
		
		obj.id = objid;

		var count = 0;
		if(PLG.zoomingListItem[parent.id] === undefined){
			PLG.zoomingListItem[parent.id] = {};
		}
		else{
			for(var index in PLG.zoomingListItem[parent.id]){
				if(index.match(/\d+/)){
					count++
				}
			}
		}			
		PLG.zoomingListItem[parent.id][count] = obj;
	}
};

PLG.sortSpritesByDistance = function(x, y){
	if(x === undefined){
		x = PLG.viewPositionX;
	}
	if(y === undefined){
		y = PLG.viewPositionY;
	}
	
	var sortByDistance = function(a,b){
		var centerAX = PARAM.sprites[a].x + PARAM.sprites[a].width / 2 - x;
		var centerAY = PARAM.sprites[a].y + PARAM.sprites[a].height / 2 - y;
		var centerBX = PARAM.sprites[b].x + PARAM.sprites[b].width / 2 - x;
		var centerBY = PARAM.sprites[b].y + PARAM.sprites[b].height / 2 - y;
		var result = Math.pow(centerBX,2) + Math.pow(centerBY,2) - Math.pow(centerAX,2) - Math.pow(centerAY,2);
		if(isNaN(result)){
			result = 1;
		}
		return result;
	};
	if(PLG.spriteArraySorted === null){
		PLG.spriteArraySorted = new Array();
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				PLG.spriteArraySorted.push(id);
			}
		}
	}
	PLG.spriteArraySorted.sort(sortByDistance);
};


PLG.enableZooming = function() {
	PLG.zooming = true;

	// Hide info and change overflow attribute
	for(var id in PARAM.sprites){
		if(id.match(/^spr.+$/)){
			var spr = $(id);

			PLG.getSpriteInfo(spr).style.overflow = "hidden";	

			var contents = PLG.getSpriteContents(spr);
			contents.style.overflow = "hidden";

			if(PARAM.sprites[id].isDrawing){
				var canvas = {};
				var canvasNode = $(id + "_canvas");
				if(!canvasNode){
					if($(id).innerHTML.match(/(spr.+?_canvas)/)){
						var cid = RegExp.$1;
            canvasNode = $(cid);
          }
				}
				if(canvasNode){
					canvas.width = canvasNode.offsetWidth;
					canvas.height = canvasNode.offsetHeight;
					PLG.zoomingCanvas[id] = canvas;
				}
			}
		}
	}

	PLG.backupZoomingObject("img");
	PLG.backupZoomingObject("object");
	PLG.backupZoomingObject("embed");
	PLG.backupZoomingObject("iframe");

	PLG.backupZoomingListItem("ul");
	PLG.backupZoomingListItem("ol");
//	PLG.backupZoomingListItem("dl"); // IE cannot get marginLeft of dl

	PLG.sortSpritesByDistance();

	$("zoomscalerarea").style.visibility = "visible";

	if(PARAM.positlogMode == "EditMode" && PARAM.page_type == "document"){
		$("spriteslist").style.borderLeftWidth = "1px";
		$("spriteslist").style.borderLeftStyle = "none";
		$("spriteslist").style.borderLeftColor = "#808080";
		$("spriteslist").style.borderTopWidth = "1px";
		$("spriteslist").style.borderTopStyle = "none";
		$("spriteslist").style.borderTopColor = "#808080";
	}

};

PLG.unableZooming = function(){

	PLG.drawctx.clearRect(0, 0, PLG.drawcanvas.offsetWidth, PLG.drawcanvas.offsetHeight);

	PLG.spriteArraySorted = null;

	while(PLG.zoomSprites.length > 0){
		var id = PLG.zoomSprites.pop();
		if(id){
			PLG.adjustZoomingSpritesPosition(id);
			PLG.adjustZoomingSpritesContents(id);
			PLG.adjustZoomingObject(id, PLG.zoom);
			PLG.adjustZoomingCanvas(id, PLG.zoom);
			PLG.adjustZoomingListItem(id, PLG.zoom);
			if(PARAM.positlogMode == "ViewMode" && $(id).style.visibility == "hidden"){
				$(id).style.visibility = "visible";
			}
		}
	}
	PLG.adjustZoomingWorldFrame();

	if(PLG.zoomTimer !== null){
		clearInterval(PLG.zoomTimer);
		PLG.zoomTimer = null;
	}
	if(PLG.zoomDrawTimerFlag){
		PLG.zoomDrawTimerFlag = false;
	}

	// Reset sprites
	for(var id in PARAM.sprites){
		if(id.match(/^spr.+$/)){
			var spr = $(id);
			spr.style.left = PARAM.sprites[id].x + "px";
			spr.style.top = PARAM.sprites[id].y + "px";
			spr.style.width = PARAM.sprites[id].width + "px";
			spr.style.height = "auto";

			var region = PLG.getSpriteRegion(spr);
			region.style.width = (PARAM.sprites[id].width - 2) + "px";
			region.style.height = "auto";
			// This takes too much time. 
			// Don't do it.
			//			region.style.width = "auto";

			var contents = PLG.getSpriteContents(spr);
			contents.style.overflow = "visible";
			contents.style.height = "auto";
//			contents.style.padding = PARAM.sprites[id].padding + "px";
			PLG.setContentsPadding(contents, PARAM.sprites[id].padding);
			contents.style.borderWidth = PARAM.sprites[id].borderWidth + "px";

			var info = PLG.getSpriteInfo(spr);
			info.style.overflow = "visible";
			info.style.height = "auto";
		}
	}

	// Reset objects
	for(var id in PLG.zoomingObject){
		if(id.match(/^spr.+$/)){
			for(var index in PLG.zoomingObject[id]){
				if(index.match(/\d+/)){
					var obj = PLG.zoomingObject[id][index];
					if(obj.id.match(/^positlog.+?_\d+_(.*)$/)){
						objid = RegExp.$1;
						if($(obj.id)){
							$(obj.id).id = objid;
						}
					}
				}
			}
		}
	}

	// Reset list items
	for(var id in PLG.zoomingListItem){
		if(id.match(/^spr.+$/)){
			for(var index in PLG.zoomingListItem[id]){
				if(index.match(/\d+/)){
					var obj = PLG.zoomingListItem[id][index];
					if($(obj.id)){
						$(obj.id).style.paddingLeft = obj.paddingLeft;
						$(obj.id).style.marginLeft = obj.marginLeft;

						$(obj.id).style.markerOffset = obj.markerOffset;

						if(obj.id.match(/^positlog.+?_\d+_(.*)$/)){
							objid = RegExp.$1;
							$(obj.id).id = objid;
						}
					}
				}
			}
		}
	}
	PLG.zoomingCanvas = null;
	PLG.zoomingCanvas = {};
	PLG.zoomingObject = null;
	PLG.zoomingObject = {};
	PLG.zoomingListItem = null;
	PLG.zoomingListItem = {};

	PLG.zoomingOnMouseDown = false;
	PLG.zooming = false;

	if(PARAM.positlogMode == "ViewMode"){
		PLG.state = PLG.STATES.VIEWING;
	}
	else{
		PLG.state = PLG.STATES.WORKING;
	}

	PLG.setViewPosition(PLG.viewPositionX, PLG.viewPositionY, false);

	PLG.changeZoomDisplay();

	if(PARAM.positlogMode == "EditMode"){
		EDT.view.refreshMap();
	}

	$("zoomscalerarea").style.visibility = "hidden";

	PLG.hideZoomingCenter();
};

// -----------------------------------------------------------------
// Small map
// -----------------------------------------------------------------

PLG.redrawMapCanvas = function() {
	if(PLG.nowidgets){
		return;
	}

	if(PLG.canvasOK){
		var rate = 1;
		var maxWidth = Math.abs(PLG.worldRight - PLG.worldLeft);
		var maxHeight = Math.abs(PLG.worldBottom - PLG.worldTop);
		if(maxWidth > maxHeight){
			rate = PLG.mapSize / maxWidth;
		}
		else{
			rate = PLG.mapSize / maxHeight;
		}
		PLG.mapctx.clearRect(0, 0, PLG.mapcanvas.offsetWidth, PLG.mapcanvas.offsetHeight);

		var len = PARAM.recentSprites.length;
		if(len > 5){
			len = 5;
		}

		for(var id in PARAM.sprites){
			if(!id.match(/^spr.+$/)){
				continue;
			}

			if(id.match(/_link$/)){
				PLG.mapctx.fillStyle = "rgba(112,112,112,0.4)";
			}
			else if(PARAM.sprites[id].isDrawing){
				PLG.mapctx.fillStyle = "rgba(30,90,30,0.5)";
			}
			else{
				PLG.mapctx.fillStyle = "#707070";
			}

			if(PLG.smallMapIsFocused){
				for(var i = 0;i < len; i++){
					if(PARAM.recentSprites[i] == id){
						var red = 255 - i * 20;
						if(id.match(/_link$/)){
							PLG.mapctx.fillStyle = "rgba(" + red + ",130,130,0.6)";
						}
						else if(PARAM.sprites[id].isDrawing){
							PLG.mapctx.fillStyle = "rgba(" + red + ",130,130,0.6)";
						}
						else{
							PLG.mapctx.fillStyle = "rgb(" + red + ",130,130)";
						}
					}
				}
			}

			var left = 1 + Math.round((-PLG.worldLeft + PARAM.sprites[id].x) * parseFloat(rate));
			var top = 1 + Math.round((-PLG.worldTop + PARAM.sprites[id].y) * parseFloat(rate));
			var width = Math.round(PARAM.sprites[id].width * parseFloat(rate));
			var height = Math.round(PARAM.sprites[id].height * parseFloat(rate));

			if(left && top && width && height){
				PLG.mapctx.beginPath();
				PLG.mapctx.rect(left, top, width, height);
				PLG.mapctx.fill();
			}
		}

		if(PLG.zoom != 1.0){
			if(PLG.browser.msie || PLG.browser.msie7){
				var children = PLG.mapcanvas.childNodes;
				for(var j = 0;j < children.length; j++){
					if(children[j].tagName.match(/shape/i)){
						// See excanvas.js for more information about the reason
						// why using "10" px.
						// (<g_vml_:shape>'s width and height are 10px.)
						children[j].style.width = "10px";
						children[j].style.height = "10px";
					}
				}
			}
		}
	}
};

PLG.focusingSmallmap = function() {
	PLG.focusSmallMapCount++;
	var delta = 10;
	if(PLG.browser.msie || PLG.browser.msie7){
		delta = 30;
	}
	var opacity = 40 + PLG.focusSmallMapCount * delta;
	if(opacity >= 100){
		opacity = 100;
		clearInterval(PLG.focusSmallMapTimer);
		PLG.focusSmallMapCount = 0;
		PLG.focusSmallMapTimer = null;
		PLG.viewcanvas.style.borderColor = "#505050";

		PLG.smallMapIsFocused = true;
		PLG.redrawMapCanvas();
	}
	if(PLG.browser.msie || PLG.browser.msie7){
		PLG.mapcanvas.style.filter = "alpha(opacity=" + opacity + ")";
		$("zoomscalerarea").style.filter = "alpha(opacity=" + opacity + ")";
	}
	else{
		PLG.mapcanvas.style.opacity = opacity / 100;
		$("zoomscalerarea").style.opacity = opacity / 100;
	}
};

PLG.unfocusingSmallmap = function() {
	PLG.unfocusSmallMapCount++;
	var delta = 10;
	if(PLG.browser.msie || PLG.browser.msie7){
		delta = 30;
	}
	var opacity = 100 - PLG.unfocusSmallMapCount * delta;
	if(opacity <= 40){
		opacity = 40;
		clearInterval(PLG.unfocusSmallMapTimer);
		PLG.unfocusSmallMapCount = 0;
		PLG.unfocusSmallMapTimer = null;
		PLG.viewcanvas.style.borderColor = "#c0c0c0";

		PLG.redrawMapCanvas();
	}
	if(PLG.browser.msie || PLG.browser.msie7){
		PLG.mapcanvas.style.filter = "alpha(opacity=" + opacity + ")";
		$("zoomscalerarea").style.filter= "alpha(opacity=" + opacity + ")";
	}
	else{
		PLG.mapcanvas.style.opacity = opacity / 100;
		$("zoomscalerarea").style.opacity = opacity / 100;
	}
};

PLG.focusSmallMap = function() {
	if(PLG.browser.msie || PLG.browser.msie7){
		if(PLG.mapcanvas.style.filter.match(/alpha\(opacity=(.+)\)/)){
			if(parseInt(RegExp.$1) == 100){
				return;
			}
		}
	}
	else{
		if(PLG.mapcanvas.style.opacity == 1.0){
			return;
		}
	}
	if(PLG.focusSmallMapTimer !== null){
		return;
	}
	PLG.focusSmallMapTimer = setInterval("PLG.focusingSmallmap()", 20);

	if(PLG.zoom == 1.0){
		$("zoomscalerarea").style.visibility = "visible";
	}
};

PLG.unfocusSmallMap = function() {
	if(PLG.focusSmallMapTimer !== null){
		clearInterval(PLG.focusSmallMapTimer);
		PLG.focusSmallMapTimer = null;
		PLG.focusSmallMapCount = 0;
	}
	if(PLG.browser.msie || PLG.browser.msie7){
		if(PLG.mapcanvas.style.filter.match(/alpha\(opacity=(.+)\)/)){
			if(parseInt(RegExp.$1) == 40){
				return;
			}
		}
	}
	else{
		if(PLG.mapcanvas.style.opacity == 0.4){
			return;
		}
	}
	if(PLG.unfocusSmallMapTimer !== null){
		return;
	}
	PLG.unfocusSmallMapTimer = setInterval("PLG.unfocusingSmallmap()", 20);

	if(!PLG.zooming){
		$("zoomscalerarea").style.visibility = "hidden";
	}
	PLG.smallMapIsFocused = false;
};

PLG.initSmallMap = function() {
	if(PLG.nowidgets){
		return;
	}

	PLG.mapcanvas = $("mapcanvas");
	if(PLG.canvasOK){
		PLG.mapcanvas.style.border = "2px solid #505050";
		PLG.mapcanvas.style.zIndex = PLG.ZIND.SMALLMAP;
		PLG.mapcanvas.style.backgroundColor = "#EFECDE";
		if(PLG.worldLeft == Number.MAX_VALUE || PLG.worldRight == -Number.MAX_VALUE || PLG.worldTop == Number.MAX_VALUE || PLG.worldBottom == -Number.MAX_VALUE){
			PLG.mapcanvas.width = 1;
			PLG.mapcanvas.height = 1;
		}
		else{
			var maxWidth = Math.abs(PLG.worldRight - PLG.worldLeft);
			var maxHeight = Math.abs(PLG.worldBottom - PLG.worldTop);
			if(maxWidth > maxHeight){
				PLG.mapcanvas.width = PLG.mapSize;
				PLG.mapcanvas.height = Math.round(PLG.mapSize * maxHeight / maxWidth);
			}
			else{
				PLG.mapcanvas.height = PLG.mapSize;
				PLG.mapcanvas.width = Math.round(PLG.mapSize * maxWidth / maxHeight);
			}
		}

		PLG.mapcanvas.style.height = PLG.mapcanvas.height + "px";
		PLG.mapcanvas.style.width = PLG.mapcanvas.width + "px";


		PLG.mapctx = PLG.mapcanvas.getContext("2d");
	}
	else if(PLG.mapcanvas){
		PLG.mapcanvas.style.display = "none";
	}

	PLG.viewcanvas = $("viewcanvas");
	if(PARAM.positlogMode == "EditMode" && !PLG.loaded){
//		PLG.viewcanvas.style.display = "none";
	}
	if(PLG.canvasOK){
		PLG.viewcanvas.style.border = "2px solid #c0c0c0";
		PLG.viewcanvas.style.zIndex = PLG.ZIND.SMALLMAP + 10;
		PLG.viewcanvas.style.right = "0px";
		PLG.viewcanvas.width = PLG.mapcanvas.width;
		PLG.viewcanvas.height = PLG.mapcanvas.height;
		PLG.viewcanvas.style.height = PLG.mapcanvas.style.height;
		PLG.viewcanvas.style.width = PLG.mapcanvas.style.width;

		PLG.viewcanvas.onmouseover = function(){
			if(PLG !== undefined){
				PLG.viewcanvasIsFocused = true;
			}
		}

		PLG.viewcanvas.onmouseout = function(){
			if(PLG !== undefined){
				PLG.viewcanvasIsFocused = false;
			}
		}

		PLG.viewctx = PLG.viewcanvas.getContext("2d");
	}
	else if(PLG.viewcanvas){
		PLG.viewcanvas.style.display = "none";
	}

	$("zoomscaler").onmousedown = $("zoompointer").onmousedown = function(e){
		PLG.zoomscalerOnMouseDown = true;
		PLG.ignoreMouseDown = true;
		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}
	};
	$("zoomscaler").onmousemove = $("zoompointer").onmousemove = function(e){
		if(PLG.zoomscalerOnMouseDown){
			var scalerTop = $("zoomscalerarea").offsetTop + $("zoomscaler").offsetTop + 4;
			if(PLG.browser.msie){
				scalerTop -= document.documentElement.scrollTop;
			}
			var newY = PLG.mouseYonBrowser(e) - scalerTop;

			var zoom = 1.0;
			if(PARAM.positlogMode == "ViewMode" && PLG.minimumzoom != 1){
				zoom = PLG.minimumzoom + Math.round(18 - newY / 8.5) * 0.05 * (1-PLG.minimumzoom) / 0.9;
			}
			else{
				zoom = 0.1 + Math.round(18 - newY / 8.5) * 0.05;
			}

			zoom = Math.floor((zoom + 0.005) * 100) / 100;

			if(PARAM.positlogMode == "EditMode"){			
				if(zoom < 0.1){
					zoom = 0.1;
				}
				else if(zoom > 1){
					zoom = 1.0;
				}
			}
			else{
				if(zoom < PLG.zoom && PLG.zoom == PLG.minimumzoom){
					PLG.showForceCancelMark();
					return;
				}
				else if(zoom < PLG.minimumzoom){
					zoom = PLG.minimumzoom;
				}
				else if(zoom > 1){
					zoom = 1.0;
				}
			}

			PLG.changeZoomDisplay();
			PLG.changeZoom(zoom);
		}
		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}
	};
	$("zoomscaler").onmouseup = $("zoompointer").onmouseup = function(e){
		if(PLG.zoomscalerOnMouseDown){
			PLG.zoomscalerOnMouseDown = false;
			var scalerTop = $("zoomscalerarea").offsetTop + $("zoomscaler").offsetTop + 4;
			if(PLG.browser.msie){
				scalerTop -= document.documentElement.scrollTop;
			}
			var newY = PLG.mouseYonBrowser(e) - scalerTop;
			var zoom = 1.0;

			if(PARAM.positlogMode == "ViewMode" && PLG.minimumzoom != 1){
				zoom = PLG.minimumzoom + Math.round(18 - newY / 8.5) * 0.05 * (1-PLG.minimumzoom) / 0.9;
			}
			else{
				zoom = 0.1 + Math.round(18 - newY / 8.5) * 0.05;
			}

			zoom = Math.floor((zoom + 0.005) * 100) / 100;

			if(PARAM.positlogMode == "EditMode"){			
				if(zoom < 0.1){
					zoom = 0.1;
				}
				else if(zoom > 1){
					zoom = 1.0;
				}
			}
			else{
				if(zoom < PLG.zoom && PLG.zoom == PLG.minimumzoom){
					PLG.showForceCancelMark();
					return;
				}
				else if(zoom < PLG.minimumzoom){
					zoom = PLG.minimumzoom;
				}
				else if(zoom > 1){
					zoom = 1.0;
				}
			}

			PLG.changeZoomDisplay();
			PLG.changeZoom(zoom);
		}
	};

	$("x1btn").onclick = function(){
		if(PLG.zooming){
			PLG.changeZoom(1.0);
			PLG.unableZooming();
		}
	}

};

PLG.redrawViewCanvas = function(x, y) {
	if(PLG.nowidgets){
		return;
	}

	if(x === undefined){
		x = PLG.viewPositionX;
	}
	if(y === undefined){
		y = PLG.viewPositionY;
	}

	if(PLG.canvasOK){
		var rate = 1.0;
		var maxWidth = Math.abs(PLG.worldRight - PLG.worldLeft);
		var maxHeight = Math.abs(PLG.worldBottom - PLG.worldTop);
		if(maxWidth > maxHeight){
			rate = PLG.mapSize / maxWidth;
		}
		else{
			rate = PLG.mapSize / maxHeight;
		}

		var left = x - PLG.worldLeft;
		var top = y - PLG.worldTop;
		if(PARAM.page_type == "map" && !PARAM.printable){
			left -= Math.round(PLG.getInnerWidth() / 2);
			top -= Math.round(PLG.getInnerHeight() / 2);
		}
		left = Math.round(left * parseFloat(rate));
		top = Math.round(top * parseFloat(rate));

		var width = Math.round(PLG.getInnerWidth() * parseFloat(rate) / PLG.zoom);
		var height = Math.round(PLG.getInnerHeight() * parseFloat(rate) / PLG.zoom);

		if(PLG.zooming){
			var xOffset = PLG.getInnerWidth() * (1 - PLG.zoom) / 2 / PLG.zoom;
			var yOffset = PLG.getInnerHeight() * (1 - PLG.zoom) / 2 / PLG.zoom;

			left -= Math.round(xOffset * parseFloat(rate));
			top -= Math.round(yOffset * parseFloat(rate));
		}

		if(left < 0){
			width += left;
			left = 0;
		}
		if(left >= PLG.viewcanvas.width){
			top = PLG.viewcanvas.width - 1;
		}
		if(left + width > PLG.viewcanvas.width){
			width -= left + width - PLG.viewcanvas.width;
		}
		if(width <= 0){
			width = 1;
		}

		if(top < 0){
			height += top;
			top = 0;
		}
		if(top >= PLG.viewcanvas.height){
			top = PLG.viewcanvas.height - 1;
		}
		if(top + height > PLG.viewcanvas.height){
			height -= top + height - PLG.viewcanvas.height;
		}
		if(height <= 0){
			height = 1;
		}

		PLG.viewctx.fillStyle = "rgba(90,90,255,0.3)";
		PLG.viewctx.clearRect(0, 0, PLG.viewcanvas.offsetWidth, PLG.viewcanvas.offsetHeight);
		PLG.viewctx.beginPath();
		if(!isNaN(left) && !isNaN(top) && !isNaN(width) && !isNaN(height)){
			PLG.viewctx.rect(left, top, width, height);
			PLG.viewctx.fill();
		}


		if(PLG.zoom != 1.0){
			if(PLG.browser.msie || PLG.browser.msie7){
				var children = PLG.viewcanvas.childNodes;
				for(var j = 0;j < children.length; j++){
					if(children[j].tagName.match(/shape/i)){
						// See excanvas.js for more information about the reason
						// why using "10" px.
						// (<g_vml_:shape>'s width and height are 10px.)
						children[j].style.width = "10px";
						children[j].style.height = "10px";
					}
				}
			}
		}
	}
};

// -----------------------------------------------------------------
// Enable/disable selection
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// Enable/disable selection
// -----------------------------------------------------------------

// It does not work on opera
PLG.disableSelection = function() {
	var body = $("positlogbody");
	if(PLG.browser.mozes){
		body.style.MozUserSelect = "none";
	}
	else if(PLG.browser.safari){
		body.style.KhtmlUserSelect = "none";
	}
	else if(PLG.browser.msie || PLG.browser.msie7){
		document.onselectstart = function() {
			return false;
		};
	}
};

// It does not work on opera
PLG.enableSelection = function() {
	var body = $("positlogbody");
	if(PLG.browser.mozes){
		body.style.MozUserSelect = "";
	}
	else if(PLG.browser.safari){
		body.style.KhtmlUserSelect = "";
	}
	else if(PLG.browser.msie || PLG.browser.msie7){
		document.onselectstart = function() {
			return true;
		};
	}
};

// -----------------------------------------------------------------
// Mouse events
// -----------------------------------------------------------------

PLG.spriteOnMouseOver = function(e) {
	if(PARAM.positlogMode == "EditMode" && (typeof(EDT) == "undefined" || !EDT.loaded)){
		return;
	}

	if(PLG.waitSavingFlag){
		return;
	}
	if(PARAM.positlogMode == "EditMode" && EDT.currenttool == EDT.TOOL_DRAWING){
		return;
	}

	var elm = this;
	if((elm === null && elm === undefined) || PLG.mouseOutOfWorld){
		return;
	}

	if(PARAM.positlogMode == "ViewMode"){
		PLG.selection.current = null;
		PLG.selection.current = elm;
	}
	else{
		EDT.spriteOnMouseOver(elm, e);
	}
};

PLG.isInActiveArea = function(e) {
	var yoffset = 0;
	if(PARAM.positlogMode == "EditMode"){
		yoffset = $("controlpanel").offsetHeight;
	}
	var x = PLG.mouseXonBrowser(e);
	var y = PLG.mouseYonBrowser(e);
	if(x > PLG.getInnerWidth() || x < 0 || y > PLG.getInnerHeight() || y < yoffset){
		return false;
	}

	if(!PLG.nowidgets && x > $("footer").offsetLeft && y > $("footer").offsetTop){
		return false;
	}

	return true;
};

PLG.onMouseOutProcess = function(e){
	PLG.zoomscalerOnMouseDown = false;

	PLG.mouseOutOfWorld = true;
	if(PARAM.positlogMode == "ViewMode"){
		PLG.adjustViewPositionFlag = true;
	}

	if(PARAM.positlogMode == "ViewMode"){
		PLG.selection.current = null;
	}
	else{
		EDT.clearSelectedSprite(e);
	}

	PLG.onMouseUp();
};

PLG.onMouseOut = function(e) {
	if(PARAM.positlogMode == "EditMode" && (typeof(EDT) == "undefined" || !EDT.loaded)){
		return;
	}
	if(!PLG.isInActiveArea(e) && PLG.state != PLG.STATES.MOVING && PLG.state != PLG.STATES.MOVINGSELECTED && PLG.state != PLG.STATES.SCALING){
		PLG.onMouseOutProcess(e);
	}
};

PLG.onDoubleClick = function(e) {
	if(PLG.zooming){
		var x = 0;
		var y = 0;
		if(PARAM.positlogMode == "ViewMode"){
			x = PLG.mouseXonWorld(e);
			y = PLG.mouseYonWorld(e);
      if(PARAM.page_type == "document"){
				x -= Math.round(PLG.getInnerWidth()/2);
				y -= Math.round(PLG.getInnerHeight()/2);
      }
			if(x < PLG.worldLeft){
        x = PLG.worldLeft;
      }
      else if(x > PLG.worldRight){
        x = PLG.worldRight;
      }
      if(y < PLG.worldTop){
        y = PLG.worldTop;
      }
      else if(y > PLG.worldBottom){
        y = PLG.worldBottom;
      }
			PLG.viewPositionX = x;
			PLG.viewPositionY = y;
		}
		else if(PARAM.positlogMode == "EditMode" && PLG.handTool){
			x = PLG.mouseXonWorld(e);
			y = PLG.mouseYonWorld(e);
			if(PARAM.page_type == "document"){
				x -= Math.round(PLG.getInnerWidth() / 2);
				y -= Math.round(PLG.getInnerHeight() / 2);
			}
			PLG.setViewPosition(x, y, true);
		}
		else{
			return;
		}

		PLG.sortSpritesByDistance();

		if(PLG.zoom == 1.0){
			return false;
		}		
		var zoom = parseFloat(PLG.zoom) + 0.5;
		if(zoom >= 1.0){
			zoom = 1.0;
			PLG.changeZoom(zoom);
			PLG.unableZooming();
		}
		else{
			zoom = Math.floor((zoom + 0.005) * 100) / 100;
			PLG.changeZoom(zoom);
		}
	}
};

PLG.onMouseDown = function(e) {
	PLG.mouseState = PLG.MOUSESTATES.DOWN;
	// Check start --------------

	if(PLG.mouseXonBrowser(e) - PLG.prevMouseDownXonBrowser === 0 && PLG.mouseYonBrowser(e) - PLG.prevMouseDownYonBrowser === 0){
		PLG.onDoubleClick(e);
	}

	if(PLG.zoomingOnMouseDown){
		return;
	}

	if(PARAM.positlogMode == "EditMode" && (typeof(EDT) == "undefined" || !EDT.loaded)){
		return;
	}

	// Check flags
	if(PLG.ignoreMouseDown){
		PLG.ignoreMouseDown = false;
		return;
	}

	if(PLG.waitSavingFlag){
		return;
	}

	if(PLG.adjustViewPositionAfterMouseWheelFlag){
		PLG.adjustViewPositionAfterMouseWheelFlag = false;
		PLG.adjustViewPositionAfterMouseWheel();
	}

	// Check modal dialog and drawing
	if(PARAM.positlogMode == "EditMode"){
		if(EDT.modalDialogIsOpened()){
			var onDialog = EDT.modalDialogOnMouseDown(e);
			if(onDialog > 0){
				return;
			}
		}
		if(EDT.currenttool == EDT.TOOL_DRAWING){
			if(PLG.browser.msie || PLG.browser.msie7){
				event.returnValue = false;
				event.cancelBubble = true;
			}
			else{
				e.preventDefault();
				e.stopPropagation();
			}
			EDT.drawingOnMouseDown(e);
			return;
		}
	}

	// Check status
	if(PLG.state == PLG.STATES.SCALING){
		return;
	}
	if(PLG.state != PLG.STATES.SELECTED){
		if(PLG.browser.mozes){
			// Left button:1
			// Middle button:2
			// Right button:3
			if(e.which != 1){
				return;
			}
		}
		else if(PLG.browser.msie || PLG.browser.msie7){
			if(window.event.button != 1){
				return;
			}
		}
	}

	// Check whether mouse is on small map area
	var mouseXonB = PLG.mouseXonBrowser(e);
	var mouseYonB = PLG.mouseYonBrowser(e);
	if(PLG.canvasOK && !PLG.nowidgets){
		var offx = 0;
		var offy = 0;
		if(PLG.browser.msie){
			offx = document.documentElement.scrollLeft;
			offy = document.documentElement.scrollTop;
		}
		if(mouseXonB >= PLG.mapcanvas.offsetLeft - offx 
			 && mouseXonB < PLG.mapcanvas.offsetLeft - offx + PLG.mapcanvas.offsetWidth 
			 && mouseYonB >= PLG.mapcanvas.offsetTop - offy 
			 && mouseYonB < PLG.mapcanvas.offsetTop - offy + PLG.mapcanvas.offsetHeight){
			PLG.setSmallMapFlag = true;
			return;
		}
		else{
			PLG.setSmallMapFlag = false;
		}
	}

	// Check region of active area
	if(!PLG.isInActiveArea(e)){
		return;
	}
	// Check end --------------

	// -------------------------
	// Process mouse down event
	// -------------------------
	if(PARAM.positlogMode == "EditMode"){
		$("controlresult").innerHTML = "";
	}

	// Reset focused sprite
	PLG.resetFocusedSprite();

	if(PARAM.positlogMode == "EditMode" && EDT.currenttool == EDT.TOOL_NORMAL){
		var result = EDT.onMouseDown(e);
		if(!result){
			return;
		}
	}

	PLG.prevMouseXonBrowser = mouseXonB;
	PLG.prevMouseYonBrowser = mouseYonB;
	PLG.prevMouseDownXonBrowser = mouseXonB;
	PLG.prevMouseDownYonBrowser = mouseYonB;
	PLG.prevMouseXonWorld = PLG.mouseXonWorld(e);
	PLG.prevMouseYonWorld = PLG.mouseYonWorld(e);

	// Use arrow tool
	if(PARAM.positlogMode == "EditMode" && EDT.currenttool == EDT.TOOL_ARROWLINK){
		EDT.selectArrowSrcDst();
	}
	// Move view position of sprites world
	var canMove = false;
	if(PLG.selection.current !== null){
		if(PLG.isMouseOnImage){
			canMove = true;
			if(PLG.browser.msie || PLG.browser.msie7){
				e = event;
				e.returnValue = false;
				e.cancelBubble = true;
			}
			else{
				e.preventDefault();
				e.stopPropagation();
			}
		}
		else{
			PLG.enableSelection();
		}
	}
	else{
		canMove = true;

		if(PARAM.positlogMode == "ViewMode"){
			PLG.disableSelection();
		}
		else{
			PLG.enableSelection();
		}
	}

	if(PLG.handTool || PLG.state == PLG.STATES.WORKING || (PLG.state == PLG.STATES.VIEWING && canMove)){
		PLG.setViewPositionFlag = true;

		PLG.prevViewPositionX = PLG.viewPositionX;
		PLG.prevViewPositionY = PLG.viewPositionY;
		PLG.sumOfMoveX = 0;
		PLG.sumOfMoveY = 0;

		if(PLG.browser.mozes || PLG.browser.msie7){
			if($("spritesworld").style.cursor != "url(" + PARAM.SYSTEMPATH + "images/hand2.cur), default"){
				$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand2.cur), default";
			}
		}

		if(PLG.zooming){
			PLG.showZoomingCenter();
		}

		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}
		else{
			e.preventDefault();
			e.stopPropagation();
		}
		return false;
	}
};

PLG.onMouseMove = function(e) {
	// Check start --------------
	if(PARAM.positlogMode == "EditMode" && (typeof(EDT) == "undefined" || !EDT.loaded)){
		return;
	}

	if(PLG.zoomingOnMouseDown){
		return;
	}

	if(PLG.waitSavingFlag){
		return;
	}

	if(PLG.selectorMouseOver){
		return;
	}

	if(PLG.zoomscalerOnMouseDown){
		return;
	}

	if(PLG.adjustViewPositionAfterMouseWheelFlag){
		PLG.adjustViewPositionAfterMouseWheelFlag = false;
		PLG.adjustViewPositionAfterMouseWheel();
	}


	// Check modal dialog and drawing
	if(PARAM.positlogMode == "EditMode"){
		if(EDT.modalDialogIsOpened()){
			var onDialog = EDT.modalDialogOnMouseMove(e);
			if(onDialog > 0){
				return;
			}
		}
		if(EDT.currenttool == EDT.TOOL_DRAWING){
			if(PLG.browser.msie || PLG.browser.msie7){
				event.returnValue = false;
				event.cancelBubble = true;
			}
			else{
				e.preventDefault();
				e.stopPropagation();
			}
			EDT.drawingOnMouseMove(e);
			return;
		}
	}

	if(PLG.adjustViewPositionFlag){
		PLG.adjustViewPositionFlag = false;
		PLG.adjustViewPosition();
	}

	// Check whether mouse is on small map area
	var mouseXonB = PLG.mouseXonBrowser(e);
	var mouseYonB = PLG.mouseYonBrowser(e);

	if(PLG.canvasOK && !PLG.nowidgets){
		var offx = 0;
		var offy = 0;
		if(PLG.browser.msie){
			offx += document.documentElement.scrollLeft;
			offy += document.documentElement.scrollTop;
		}

		if(PLG.viewcanvasIsFocused || 
			 (mouseXonB >= PLG.mapcanvas.offsetLeft - offx 
			 && mouseXonB < PLG.mapcanvas.offsetLeft - offx + PLG.mapcanvas.offsetWidth 
			 && mouseYonB >= PLG.mapcanvas.offsetTop - offy - $("zoomscalerarea").offsetHeight 
			 && mouseYonB < PLG.mapcanvas.offsetTop - offy + PLG.mapcanvas.offsetHeight)){
				 if(!PLG.setSmallMapFlag){
					 PLG.focusSmallMap();
				 }
				 else{
					 if(mouseYonB >= PLG.mapcanvas.offsetTop - offy){
						 var rate = Math.abs(PLG.worldBottom - PLG.worldTop) / parseInt(PLG.mapcanvas.style.height);

						 var mapLeft = PLG.mapcanvas.offsetLeft;
						 if(PLG.browser.msie){
							 mapLeft -= document.documentElement.scrollLeft;
						 }
						 var mapTop = PLG.mapcanvas.offsetTop;
						 if(PLG.browser.msie){
							 mapTop -= document.documentElement.scrollTop;
						 }

						 var newX = PLG.worldLeft + Math.round((mouseXonB - mapLeft) * rate);
						 var newY = PLG.worldTop + Math.round((mouseYonB - mapTop) * rate);

						 if(PARAM.page_type == "document"){
							 newX -= Math.round(PLG.getInnerWidth() / 2);
							 newY -= Math.round(PLG.getInnerHeight() / 2);
						 }

						 PLG.setViewPosition(newX, newY, true, true);
						 return;
					 }
				 }
			 }
		else{
			if(PLG.zooming && PLG.zoom == 1.0){
				PLG.unableZooming();
			}
			if(PLG.smallMapIsFocused){
				PLG.setSmallMapFlag = false;
				PLG.unfocusSmallMap();
			}
		}
	}

	// Check border of spritesworld
	if(!PLG.setViewPositionFlag 
		 && !(PLG.state == PLG.STATES.MOVING || PLG.state == PLG.STATES.MOVINGSELECTED || PLG.state == PLG.STATES.SCALING || PLG.state == PLG.STATES.SCALINGSELECTED)){
			 if(!PLG.isInActiveArea(e)){
				 PLG.onMouseOutProcess(e);
				 return;
			 }

		 }
	
	// For smooth dragging
	if(PLG.browser.msie || PLG.browser.msie7){
		try{
			if(PARAM.positlogMode != "EditMode" && PLG.selection.current !== null){
				var contents = PLG.getSpriteContents(PLG.selection.current).firstChild;
				// Safari2 ignores i option.
				// Use capital tag name here.
				if(contents.nodeType == 1 && (contents.tagName.match(/^CANVAS$/gi) || (contents.tagName.match(/^IMG$/gi)))){
					e = event;
					e.returnValue = false;
					e.cancelBubble = true;
					if(document.selection.type != "None"){
						document.selection.empty();
					}
				}
			}
			else if(PLG.selection.current === null){
				if(document.selection.type != "None"){
					document.selection.empty();
				}
			}
		}catch(e){
			// nop
		}
	}

	PLG.mouseOutOfWorld = false;

	var moveX = mouseXonB - PLG.prevMouseXonBrowser;
	var moveY = mouseYonB - PLG.prevMouseYonBrowser;

	PLG.prevMouseXonBrowser = PLG.mouseXonBrowser(e);
	PLG.prevMouseYonBrowser = PLG.mouseYonBrowser(e);

	if(PARAM.positlogMode == "EditMode"){
		EDT.onMouseMove(e, Math.round(moveX / PLG.zoom), Math.round(moveY / PLG.zoom));
	}

	if(PLG.setViewPositionFlag){
		PLG.sumOfMoveX += moveX;
		PLG.sumOfMoveY += moveY;
		if(PARAM.positlogMode == "ViewMode"){
//			PLG.setViewPosition(PLG.viewPositionX - Math.round(moveX/PLG.zoom), PLG.viewPositionY - Math.round(moveY/PLG.zoom), true, true, false);
			PLG.setViewPosition(PLG.viewPositionX - Math.round(moveX/PLG.zoom), PLG.viewPositionY - Math.round(moveY/PLG.zoom), true, true, true);
		}
		else if(PARAM.positlogMode == "EditMode"){
			PLG.setViewPosition(PLG.viewPositionX - Math.round(moveX), PLG.viewPositionY - Math.round(moveY), true, true, true);
		}

		if(PLG.browser.msie || PLG.browser.msie7){
			event.returnValue = false;
			event.cancelBubble = true;
		}
		else{
			e.preventDefault();
			e.stopPropagation();
		}

		return false;
	}

	// Check whether mouse is on the selected Sprite.
	if(((PARAM.positlogMode == "ViewMode" && PLG.selection.current !== null) 
			|| PLG.state == PLG.STATES.FIXEDMULTISELECTED 
			|| PLG.state == PLG.STATES.SELECTED 
			|| PLG.state == PLG.STATES.FIXEDSELECTED 
			|| PLG.state == PLG.STATES.EDITINGSELECTED 
			|| PLG.state == PLG.STATES.MOVINGSELECTED) 
		 && (PARAM.positlogMode == "ViewMode" 
				 || (PARAM.positlogMode == "EditMode" 
						 && !EDT.editor.canMove && !EDT.colorpicker.canMove && !EDT.drawingtool.canMove && !EDT.plugin.canMove && !EDT.uploader.canMove))){
		// Onmouseout events are occurred when mouse is on the region.
		// An onmouseout event is occurred when mouse is moved onto another
		// object
		// on the selected object.
		// So, here, check whether mouse is out or not.
		var left = PLG.worldXtoBrowserX(PLG.sprLeft(PLG.selection.current), true);
		var top = PLG.worldYtoBrowserY(PLG.sprTop(PLG.selection.current), true);

		if(PLG.mouseXonBrowser(e) < left || PLG.mouseXonBrowser(e) > left + PLG.sprWidth(PLG.selection.current) || PLG.mouseYonBrowser(e) < top || PLG.mouseYonBrowser(e) > top + PLG.sprHeight(PLG.selection.current)){
			if(PARAM.positlogMode == "ViewMode"){
				PLG.selection.current = null;
			}
			else{
				EDT.clearSelectedSprite(e);
			}

			if(PLG.browser.msie || PLG.browser.msie7){
				while(PLG.hiddenIframes.length > 0){
					var iframe = PLG.hiddenIframes.pop();
					iframe.style.visibility = "visible";
				}
			}
		}
	}
};

PLG.onMouseUp = function(e) {
	PLG.mouseState = PLG.MOUSESTATES.UP;

	if(PARAM.positlogMode == "EditMode" && (typeof(EDT) == "undefined" || !EDT.loaded)){
		return;
	}
	
	PLG.zoomscalerOnMouseDown = false;

	// Check modal dialog
	if(PARAM.positlogMode == "EditMode"){
		if($("editorarea") && EDT.editor.canMove){
			if(EDT.currentEditorType == PLG.CONST.RICH_EDITOR){
				$("editorarea").style.visibility = "visible";
			}
		}
		EDT.colorpicker.canMove = false;
		EDT.drawingtool.canMove = false;
		EDT.editor.canMove = false;
		EDT.plugin.canMove = false;
		EDT.uploader.canMove = false;
		PLG.enableSelection();
	}

	if(PARAM.positlogMode == "EditMode"){
		EDT.colorpicker.canPick = false;
	}

	if(PLG.ignoreMouseUp){
		PLG.ignoreMouseUp = false;
		return;
	}

	if(PLG.ignoreMouseDown){
		PLG.ignoreMouseDown = false;
	}

	if(PLG.waitSavingFlag){
		return;
	}

	if(PARAM.positlogMode == "EditMode" && EDT.currenttool == EDT.TOOL_DRAWING){
		EDT.drawingOnMouseUp();
		return;
	}

	if(PLG.setSmallMapFlag){
		var x = PLG.mouseXonBrowser(e);
		var y = PLG.mouseYonBrowser(e);
		var offx = 0;
		var offy = 0;
		if(PLG.browser.msie){
			offx = document.documentElement.scrollLeft;
			offy = document.documentElement.scrollTop;
		}
		if(x >= PLG.mapcanvas.offsetLeft - offx && x < PLG.mapcanvas.offsetLeft - offx + PLG.mapcanvas.offsetWidth && y >= PLG.mapcanvas.offsetTop - offy && y < PLG.mapcanvas.offsetTop - offy + PLG.mapcanvas.offsetHeight){
			var rate = Math.abs(PLG.worldBottom - PLG.worldTop) / parseInt(PLG.mapcanvas.style.height);

			var mapLeft = PLG.mapcanvas.offsetLeft;
			if(PLG.browser.msie){
				mapLeft -= document.documentElement.scrollLeft;
			}
			var mapTop = PLG.mapcanvas.offsetTop;
			if(PLG.browser.msie){
				mapTop -= document.documentElement.scrollTop;
			}

			var newX = PLG.worldLeft + Math.round((x - mapLeft) * rate);
			var newY = PLG.worldTop + Math.round((y - mapTop) * rate);

			if(PARAM.page_type == "document"){
				newX -= Math.round(PLG.getInnerWidth() / 2);
				newY -= Math.round(PLG.getInnerHeight() / 2);
			}
			PLG.moveViewPosition(newX, newY);
		}

		PLG.setSmallMapFlag = false;
		return;
	}

	if(PLG.setViewPositionFlag){
		if(PARAM.positlogMode == "ViewMode"){
			PLG.setViewPosition(PLG.viewPositionX, PLG.viewPositionY, true, true, false);
		}
		else if(PARAM.positlogMode == "EditMode"){
			PLG.setViewPosition(PLG.prevViewPositionX - Math.round(PLG.sumOfMoveX/PLG.zoom), PLG.prevViewPositionY - Math.round(PLG.sumOfMoveY/PLG.zoom), true, true, false);
		}

		PLG.setViewPositionFlag = false;
		if(PLG.browser.opera){
			PLG.setViewPositionCookie();
		}
		if(PLG.zooming){
			PLG.hideZoomingCenter();
			PLG.sortSpritesByDistance();
		}
	}

	if(PLG.browser.mozes || PLG.browser.msie7){
		if($("spritesworld").style.cursor != "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default"){
			$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
		}
	}

	if(PLG.zoomingOnMouseDown){
		PLG.zoomingOnMouseDown = false;
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				if(!PLG.zoomSpritesAdjusted[id]){
					PLG.adjustZoomingSpritesContents(id);
					PLG.adjustZoomingObject(id, PLG.zoom);
					PLG.adjustZoomingCanvas(id, PLG.zoom);
					PLG.adjustZoomingListItem(id, PLG.zoom);
				}
				var left = (PARAM.sprites[id].x - PLG.worldLeft) * PLG.zoom + PLG.worldLeft;
				var top = (PARAM.sprites[id].y - PLG.worldTop) * PLG.zoom + PLG.worldTop;

				var spr = $(id);
				spr.style.left = Math.round(left) + "px";
				spr.style.top = Math.round(top) + "px";
			}
		}

		var fleft = (PLG.worldFrameLeft - PLG.worldLeft) * PLG.zoom + PLG.worldLeft;
		var ftop = (PLG.worldFrameTop - PLG.worldTop) * PLG.zoom + PLG.worldTop;
		var frame = $("worldframe");
		frame.style.left = Math.round(fleft) + "px";
		frame.style.top = Math.round(ftop) + "px";
		PLG.setViewPosition(PLG.viewPositionX, PLG.viewPositionY, true, true, true);
		PLG.resizeWorld();
	}

	if(PARAM.positlogMode == "EditMode"){
		EDT.onMouseUp(e);
	}

	if(PLG.browser.msie || PLG.browser.msie7){
		while(PLG.hiddenIframes.length > 0){
			var iframe = PLG.hiddenIframes.pop();
			iframe.style.visibility = "visible";
		}
	}
};

PLG.onMouseWheel = function(e){
	if(PARAM.positlogMode == "EditMode" && EDT.currenttool != EDT.TOOL_NORMAL){
		return;
	}

	if(PARAM.positlogMode == "EditMode" &&
		 (EDT.editor.mode != EDT.EDITOR_CLOSE || EDT.colorpicker.mode != EDT.PICKER_CLOSE || EDT.uploader.mode != EDT.PICKER_CLOSE || EDT.plugin.mode != EDT.PLUGIN_CLOSE || EDT.drawingtool.mode != EDT.DRAWINGTOOL_CLOSE)){
		return;
	}

	if(PLG.focusedField !== ""){
		return;
	}

	var delta = 0;
	if(!e){ // For IE
		e = window.event;
	}
	if(e.wheelDelta){ // IE/Opera
		delta = e.wheelDelta / 5;
		// In Opera (<9.2), delta differs in sign as compared to IE.
		navigator.userAgent.match(/^Opera\/(.+?) \(.+$/);
		var version = parseFloat(RegExp.$1);
		if(PLG.browser.opera && version < 9.2){
			delta = -delta;
		}
	}
	else if(e.detail){ // Mozilla
		delta = -e.detail * 6;
	}

	if(PLG.mouseState == PLG.MOUSESTATES.DOWN){
		PLG.zoomingOnMouseWheel(delta);
		if(PLG.browser.mozes){
			e.preventDefault();
		}

		PLG.setViewPositionFlag = false;
		return false;
	}
	else{
		if(PARAM.positlogMode == "ViewMode"){
			PLG.adjustViewPositionFlag = true;
			PLG.adjustViewPosition();
		}
		else if(PARAM.positlogMode == "EditMode"){
			if(EDT.editor.mode != EDT.EDITOR_CLOSE || EDT.plugin.mode != EDT.PLUGIN_CLOSE){
				return true;
			}

			if(PLG.state == PLG.STATES.WORKING || PLG.state == PLG.STATES.SELECTED || PLG.state == PLG.STATES.FIXED || PLG.state == PLG.STATES.FIXEDSELECTED){
				var yoffset = 100;
				var moveY = delta * 3;
				var top = parseInt(PLG.viewPositionY) - moveY;

				if(!PLG.adjustViewPositionAfterMouseWheelFlag){
					PLG.prevViewPositionY = PLG.viewPositionY;
					PLG.sumOfMoveY = 0;
					PLG.adjustViewPositionAfterMouseWheelFlag = true;
				}

				// Ignore the top edge (PLG.worldTop - yoffset) 
				// if PLG.viewPositionY has already been above the top edge.
				// PLG.viewPositionY can be above it by mouse dragging in EditMode.
				if(parseInt(PLG.viewPositionY) >= PLG.worldTop - yoffset
					 && PLG.worldTop - yoffset > top){
					top = PLG.worldTop - yoffset;
				}

				if(PARAM.page_type == "document"){
					yoffset -= Math.floor(PLG.getInnerHeight()/2);
					if(parseInt(PLG.viewPositionY) <= PLG.worldBottom + yoffset
						 && PLG.worldBottom + yoffset < top){
						top = PLG.worldBottom + yoffset;
					}
				}
				else{
					if(parseInt(PLG.viewPositionY) <= PLG.worldBottom + yoffset
						 && PLG.worldBottom + yoffset < top){
						top = PLG.worldBottom + yoffset;
					}
				}

				// Recalc moveY
				moveY = parseInt(PLG.viewPositionY) - top;
				PLG.sumOfMoveY += moveY;

				PLG.setViewPosition(PLG.viewPositionX, top, true, true, true);
			}
		}
		return true;
	}
};

// -----------------------------------------------------------------
// Set and move position
// -----------------------------------------------------------------

PLG.setHomeBtn = function(posX, posY){
	var homeX = 0;
	var homeY = 0;
	if(PARAM.page_type == "document"){
		homeX = PLG.worldLeft;
		homeY = PLG.worldTop;

		if(PARAM.positlogMode == "EditMode"){
			homeY -= $("controlpanel").offsetHeight;
		}
	}

	if($("homebtn")){
		if(PARAM.homeposition == ""){
			if(posX != homeX || posY != homeY || PLG.zoom != 1){
				var homeBtn = $("homebtn");
				if(homeBtn.style.display != "block"){
					homeBtn.style.display = "block";
				}
			}
			else{
				var homeBtn = $("homebtn");
				if(homeBtn.style.display != "none"){
					homeBtn.style.display = "none";
				}
			}
		}
		else{
			var homezoom = PARAM.homeposition.zoom;
			if(homezoom == "birdview"){
				homezoom = PLG.minimumzoom;
			}
			if(posX != PARAM.homeposition.x || posY != PARAM.homeposition.y || PLG.zoom != homezoom){
				var homeBtn = $("homebtn");
				if(homeBtn.style.display != "block"){
					homeBtn.style.display = "block";
				}
			}
			else{
				var homeBtn = $("homebtn");
				if(homeBtn.style.display != "none"){
					homeBtn.style.display = "none";
				}
			}
		}
	}
};

PLG.setViewPosition = function(posX, posY, refreshView, noCookie, noAdjustZoom) {
	if(isNaN(posX) || isNaN(posY)){
		return;
	}

	if(PLG.viewPositionChangeHash){
		if(window.location.hash != "#" && window.location.hash != ""){
			window.location.hash = "#";
		}
		PLG.viewPositionChangeHash = false;
	}

	if(PARAM.positlogMode == "ViewMode"){
		if(posX < PLG.worldLeft){
			posX = PLG.worldLeft;
		}
		else if(posX > PLG.worldRight){
			posX = PLG.worldRight;
		}
		if(posY < PLG.worldTop){
			posY = PLG.worldTop;
		}
		else if(posY > PLG.worldBottom){
			posY = PLG.worldBottom;
		}
	}
	PLG.viewPositionX = parseInt(posX);
	PLG.viewPositionY = parseInt(posY);

	if(PARAM.positlogMode == "ViewMode"){
		var worldOffsetX = PLG.worldLeft;
		var worldOffsetY = PLG.worldTop;

		if(PARAM.page_type == "map" && !PARAM.printable){
			worldOffsetX -= Math.round(PLG.getInnerWidth() / 2);
			worldOffsetY -= Math.round(PLG.getInnerHeight() / 2);
		}

		$("spriteslist").style.left = (-worldOffsetX) + "px";
		$("spriteslist").style.top = (-worldOffsetY) + "px";
		$("spritesworld").style.backgroundPosition = (-worldOffsetX) + "px" + " " + (-worldOffsetY) + "px";

		var slPosX = Math.round((parseInt(posX) - PLG.worldLeft) * PLG.zoom);
		var slPosY = Math.round((parseInt(posY) - PLG.worldTop) * PLG.zoom);

		if(PLG.browser.opera){
			document.documentElement.scrollLeft = slPosX;
			document.documentElement.scrollTop = slPosY;
		}
		else if(PLG.browser.safari && !PLG.browser.mac){
//			document.body.scrollLeft = slPosX;
			window.scrollTo(slPosX, slPosY);
		}
		else{
			window.scrollTo(slPosX, slPosY);
		}
	}
	else if(PARAM.positlogMode == "EditMode"){
		var slPosX = parseInt(posX);
		var slPosY = parseInt(posY);
		if(PARAM.page_type == "map"){
			slPosX -= Math.round(PLG.getInnerWidth() / 2);
			slPosY -= Math.round(PLG.getInnerHeight() / 2);
		}

		$("spriteslist").style.left = (-slPosX) + "px";
		$("spriteslist").style.top = (-slPosY) + "px";
		$("spritesworld").style.backgroundPosition = Math.round(-slPosX * PLG.zoom) + "px" + " " + Math.round(-slPosY * PLG.zoom) + "px";
		if(PLG.canvasOK){
			PLG.drawcanvas.style.left = PLG.browserXtoWorldX(0, true) + "px";
			PLG.drawcanvas.style.top = PLG.browserYtoWorldY(0, true) + "px";
		}
	}

	PLG.setCurrentURL();

	if(refreshView === undefined || refreshView == true){
		if(PLG.zooming && !PLG.setSmallMapFlag){
			PLG.redrawViewCanvas(PLG.prevViewPositionX - Math.round(PLG.sumOfMoveX/PLG.zoom), PLG.prevViewPositionY - Math.round(PLG.sumOfMoveY/PLG.zoom));
		}
		else{
			PLG.redrawViewCanvas();
		}
	}

	PLG.setHomeBtn(posX, posY);

	if(PLG.zooming && (noAdjustZoom === undefined || !noAdjustZoom)){
		PLG.drawZoomMap();
	}

	if(PARAM.positlogMode == "EditMode" && EDT.loaded){
		EDT.view.redraw();
	}

	if(!noCookie){
		// ViewPositionCookie must be set in unloading and reloading page.
		// Almost browsers throw unload event when a page is reload,
		// however Opera does not.
		if(PLG.browser.opera){
			PLG.setViewPositionCookie();
		}
	}

	if(PARAM.positlogMode == "EditMode" && EDT.editor.mode == EDT.EDITOR_CLOSE){
		var editor = $("editor");
		if(editor){
			editor.style.left = PLG.browserXtoWorldX(PLG.getInnerWidth(), true) + "px";
			editor.style.top = PLG.browserYtoWorldY(PLG.getInnerHeight(), true) + "px";
		}
	}

}

PLG.adjustViewPosition = function() {
	var worldOffsetX = PLG.worldLeft;
	var worldOffsetY = PLG.worldTop;

	var sLeft = PLG.getScrollLeft();
	var sTop = PLG.getScrollTop();

	if(sLeft == 0 && sTop == 0){
		// Back operation on IEs
		return;
	}
	PLG.viewPositionX = Math.round(sLeft / PLG.zoom) + worldOffsetX;
	PLG.viewPositionY = Math.round(sTop  / PLG.zoom) + worldOffsetY;
	

	PLG.redrawViewCanvas();

	PLG.setHomeBtn(PLG.viewPositionX, PLG.viewPositionY);

	PLG.setCurrentURL();
};

PLG.moving = function() {
	var hokan = function(r, zs, ze, ts, te) {
		var f = function(t) {
			return Math.sin(Math.PI * t / 2.0);
		}
		r = (f((te - ts) * r + ts) - f(ts)) / (f(te) - f(ts));
		return (ze - zs) * r;
	}

	var r = PLG.moveCount / (PLG.MOVEDIVISION - 1.0);

	var x = hokan(r, PLG.animeStartX, PLG.animeEndX, -1, 1);
	var y = hokan(r, PLG.animeStartY, PLG.animeEndY, -1, 1);

	if(PLG.moveCount >= PLG.MOVEDIVISION - 1.0){
		clearInterval(PLG.moveTimer);
		PLG.moveTimer = null;
		PLG.moveCount = 0;

		PLG.setViewPosition(PLG.animeEndX, PLG.animeEndY, false);

		if(PLG.zooming){
			PLG.sortSpritesByDistance();
		}

		PLG.redrawViewCanvas();
		PLG.viewPositionChangeHash = true;
	}
	else{
		PLG.moveCount++;
		// Use noAdjustZoom to avoid blinking screen
		PLG.setViewPosition(PLG.animeStartX + Math.round(PLG.zoom * x), PLG.animeStartY + Math.round(PLG.zoom * y), false, false, true);
		PLG.redrawViewCanvas(PLG.animeStartX + x, PLG.animeStartY + y);
	}
};

PLG.moveToHomePosition = function() {
	if(PARAM.homeposition == ""){
		if(PLG.zoom == 1){
			if(PARAM.page_type == "document"){
				if(PARAM.positlogMode == "EditMode"){
					PLG.moveViewPosition(PLG.worldLeft, PLG.worldTop - $("controlpanel").offsetHeight);
				}
				else{
					PLG.moveViewPosition(PLG.worldLeft, PLG.worldTop);
				}
			}
			else{
				PLG.moveViewPosition(0, 0);
			}
			$("homebtn").style.display = "none";
		}
		else{
			if(PARAM.page_type == "document"){
				if(PARAM.positlogMode == "EditMode"){
					PLG.setViewPosition(PLG.worldLeft, PLG.worldTop - $("controlpanel").offsetHeight, true);
				}
				else{
					PLG.setViewPosition(PLG.worldLeft, PLG.worldTop, true);
				}
			}
			else{
				PLG.setViewPosition(0, 0, true);
			}
			PLG.sortSpritesByDistance();
			PLG.changeZoom(1);
			PLG.unableZooming();

			$("homebtn").style.display = "none";
		}
	}
	else{
		var homezoom = PARAM.homeposition.zoom;
		if(homezoom == "birdview"){
			homezoom = PLG.minimumzoom;
		}

		if(PLG.zoom == 1 && homezoom == 1){
			if(PARAM.page_type == "document"){
				if(PARAM.positlogMode == "EditMode"){
					PLG.moveViewPosition(PLG.worldLeft, PLG.worldTop - $("controlpanel").offsetHeight);
				}
				else{
					PLG.moveViewPosition(PLG.worldLeft, PLG.worldTop);
				}
			}
			else{
				PLG.moveViewPosition(0, 0);
			}
			$("homebtn").style.display = "none";
			return;
		}

		PLG.setViewPosition(PARAM.homeposition.x, PARAM.homeposition.y, true, true, false);
		PLG.sortSpritesByDistance();
		if(PLG.zoom == homezoom){
			return;
		}
		PLG.changeZoom(homezoom);
		if(PARAM.positlogMode == "ViewMode"){
			PLG.adjustViewPositionFlag = true;
			PLG.onMouseUp();
		}
		if(PARAM.homeposition.zoom == 1){
			PLG.unableZooming();
		}

		$("homebtn").style.display = "none";
	}
};

PLG.gotoBirdView = function(){
	var centerX = 0;
	var centerY = 0;
	if(PARAM.page_type == "map"){
		centerX = Math.round((PLG.worldRight-Math.abs(PLG.worldLeft))/2);
		centerY = Math.round((PLG.worldBottom-Math.abs(PLG.worldTop))/2);
	}
	if(PARAM.positlogMode == "ViewMode"){
		PLG.viewPositionX = centerX;
		PLG.viewPositionY = centerY;		
	}
	else{
		PLG.setViewPosition(centerX, centerY, true);
	}
	PLG.sortSpritesByDistance();

	if(PLG.zoom == PLG.minimumzoom){
		return;
	}
	PLG.changeZoom(PLG.minimumzoom);
};

PLG.moveToSprite = function(id, noanime) {
	var spr = $(id);
	if(spr){
		var innerWidth = PLG.getInnerWidth();
		var leftOffset = Math.round(PARAM.sprites[spr.id].width / 2);
		if(PARAM.sprites[spr.id].width * PLG.zoom / 2 > innerWidth / 2){
			leftOffset = innerWidth / 2 - 10;
		}
		if(PARAM.page_type == "document"){
			leftOffset -= Math.round(innerWidth / 2);
		}

		var topOffset = 0;
		if(PARAM.page_type == "document"){
			topOffset = -30;
		}
		else{
			topOffset = Math.round(PARAM.sprites[spr.id].height / 2);
			if(PARAM.sprites[spr.id].height * PLG.zoom / 2 > PLG.getInnerHeight() / 2 ){
				topOffset = PLG.getInnerHeight() / 2 - 10;
			}
		}

		// Change view position if the focused sprite is not in the worldArea.
		var vpX = PARAM.sprites[spr.id].x + leftOffset;
		var vpY = PARAM.sprites[spr.id].y + topOffset;

		if(noanime === undefined || noanime == false){
			PLG.moveViewPosition(vpX, vpY);
		}
		else{
			PLG.setViewPosition(vpX, vpY, true);
		}
	}
};

PLG.moveViewPosition = function(posX, posY, centering) {
	if(PLG.moveTimer !== null){
		clearInterval(PLG.moveTimer);
		PLG.moveCount = 0;
	}

	PLG.animeStartX = PLG.viewPositionX;
	PLG.animeStartY = PLG.viewPositionY;
	PLG.animeEndX = posX;
	PLG.animeEndY = posY;

	if(PLG.zooming){
		PLG.moveTimer = setInterval("PLG.moving()", 20);
	}
	else{
		PLG.moveTimer = setInterval("PLG.moving()", 100);
	}
};

// -------------------------------------------------
// Utilities
// -------------------------------------------------

PLG.createElm = function(tag, id, cl) {
	var elm = document.createElement(tag);
	if(id){
		elm.setAttribute("id", id);
	}
	if(cl){
		if(PLG.browser.msie || PLG.browser.msie7){
			elm.setAttribute("className", cl);
		}
		else{
			elm.setAttribute("class", cl)
		}
	}
	return elm;
};

// Cookie
PLG.getCookie = function(key) {
	if(!document.cookie)
		return undefined;
	var v = "; " + document.cookie;
	var ns = v.indexOf("; " + key + "=");
	if(ns < 0)
		return undefined;
	ns = ns + key.length + 1 + 2;
	var ne = v.indexOf(";", ns);
	if(ne < 0)
		ne = v.length;
	return v.substring(ns, ne);
};
PLG.setCookie = function(key, val, path, day) {
	var theDay = new Date();
	theDay.setTime(theDay.getTime() + (day * 1000 * 60 * 60 * 24));
	var cs = key + "=" + val + ";";
	if(path !== ""){
		cs += " path=" + path + ";";
	}
	if(day != 0){
		cs += " expires=" + theDay.toGMTString() + ";";
	}
	document.cookie = cs;
};

PLG.sendRequest = function(c, d, p, u, y, t, v, w) {
	var o = PLG.createHttpRequest();
	if(o === null)
		return null;
	var t = (!!PLG.sendRequest.arguments[5]) ? t : false;
	if(t || p.toUpperCase() == 'GET')
		u += '?';
	if(t)
		u = u + 't=' + (new Date()).getTime();
	var z = PLG.browser;
	var op = z.opera;
	var s = z.safari;
	var k = z.konqueror;
	var m = z.mozes;
	if(typeof c == 'object'){
		var l = c.onload;
		var h = c.onbeforsetheader
	}
	else{
		var l = c;
		var h = null;
	}
	if(op || s || m){
		o.onload = function() {
			l(o);
		}
	}
	else{
		o.onreadystatechange = function() {
			if(o.readyState == 4){
				l(o);
			}
		}
	}
	d = r(d, u);
	if(p.toUpperCase() == 'GET'){
		u += d
	}
	o.open(p, u, y, v, w);
	if(!!h)
		h(o);
	x(o);
	o.send(d);
	function x(o) {
		var g = 'application/x-www-form-urlencoded; charset=UTF-8';
		if(!window.opera){
			o.setRequestHeader('Content-Type', g);
		}
		else{
			if((typeof o.setRequestHeader) == 'function')
				o.setRequestHeader('Content-Type', g);
		}
		return o
	}
	function r(d, u) {
		var n = (u.indexOf('?') == -1) ? '?dmy' : '';
		if(typeof d == 'object'){
			for(var i in d)
				n += '&' + encodeURIComponent(i) + '=' + encodeURIComponent(d[i]);
		}
		else if(typeof d == 'string'){
			if(d == '')
				return '';
			var n = '';
			var f = d.split('&');
			for(var i = 1;i < f.length; i++){
				var q = f[i].split('=');
				n += '&' + encodeURIComponent(q[0]) + '=' + encodeURIComponent(q[1]);
			}
		}
		return n;
	}
	return o
}

// -------------------------------------------------
// Drawing
// -------------------------------------------------

// -----------------------------------
// Create or redraw arrow sprite
// This function creates new arrow sprite if arrow does not exist.
// otherwise redraws arrow.
// -----------------------------------
PLG.setDrawingTitle = function(spr){
	var tag = PARAM.sprites[spr.id].tag;
	if(tag !== undefined && tag !== null && tag !== ""){
		spr.title = PARAM.sprites[spr.id].tag;
	}
};

PLG.showArrowTags = function(spr){
	var info = PLG.getSpriteInfo(spr);
	var children = info.childNodes;
	var tag = null;
	for(var i = 0;i < children.length; i++){
		if(children[i].className == "tag"){
			tag = children[i];
			break;
		}
	}
	if(tag !== null){
		tag.style.position = "absolute";
		tag.style.left = Math.round(spr.offsetWidth / 2 - tag.offsetWidth / 2) + "px";
		tag.style.top = Math.round(spr.offsetHeight / 2 - tag.offsetHeight / 2) + "px";
		if(tag.offsetWidth < 100){
			tag.style.width = "100px";
		}
	}
};

PLG.drawArrowSprite = function(srcid, dstid, lineColor, lineWidth, lineStyle, srcPos, dstPos) {
	if(!PLG.canvasOK){
		return;
	}

	var sprID = srcid + "_" + dstid + "_link";
	var spr = $(sprID);

	if(!PARAM.sprites[srcid] || !PARAM.sprites[dstid]){
		$("spriteslist").removeChild(spr);
		delete PARAM.sprites[sprID];
		return;
	}
	if(srcid == dstid){
		return;
	}
	if(srcid.match(/_link$/) || dstid.match(/_link$/)){
		return;
	}

	var srcSpr = $(srcid);
	var dstSpr = $(dstid);

	var srcTop = PARAM.sprites[srcid].y;
	var srcBottom = PARAM.sprites[srcid].y + PARAM.sprites[srcid].height;
	var srcLeft = PARAM.sprites[srcid].x;
	var srcRight = PARAM.sprites[srcid].x + PARAM.sprites[srcid].width;
	var dstTop = PARAM.sprites[dstid].y;
	var dstBottom = PARAM.sprites[dstid].y + PARAM.sprites[dstid].height;
	var dstLeft = PARAM.sprites[dstid].x;
	var dstRight = PARAM.sprites[dstid].x + PARAM.sprites[dstid].width;

	if(!spr){
		if(srcRight < dstLeft){
			if(srcTop > dstBottom){
				if(srcTop - dstBottom > dstLeft - srcRight){
					srcPos = "Top";
					dstPos = "Bottom";
				}
				else{
					srcPos = "Right";
					dstPos = "Left";
				}
			}
			else if(srcBottom < dstTop){
				if(dstTop - srcBottom > dstLeft - srcRight){
					srcPos = "Bottom";
					dstPos = "Top";
				}
				else{
					srcPos = "Right";
					dstPos = "Left";
				}
			}
			else{
				if(srcMidY < dstTop){
					srcPos = "Right";
					dstPos = "Top";
				}
				else{
					srcPos = "Right";
					dstPos = "Left";
				}
			}
		}
		else if(dstRight < srcLeft){
			if(srcTop > dstBottom){
				if(srcTop - dstBottom > srcLeft - dstRight){
					srcPos = "Top";
					dstPos = "Bottom";
				}
				else{
					srcPos = "Left";
					dstPos = "Right";
				}
			}
			else if(srcBottom < dstTop){
				if(dstTop - srcBottom > srcLeft - dstRight){
					srcPos = "Bottom";
					dstPos = "Top";
				}
				else{
					srcPos = "Left";
					dstPos = "Right";
				}
			}
			else{
				if(srcMidY < dstTop){
					srcPos = "Left";
					dstPos = "Top";
				}
				else{
					srcPos = "Left";
					dstPos = "Right";
				}
			}
		}
		else{
			if(srcTop > dstBottom){
				srcPos ="Top";
				dstPos = "Bottom";
			}
			else if(dstTop > srcBottom){
				srcPos = "Bottom";
				dstPos = "Top";
			}
			else{
				// nop
				return;
			}
		}

		// Create sprite
		lineColor = "#000000";
		lineWidth = 2;
		var drawCommand = "shape,arrow," + srcid + "," + dstid + "," + lineColor + "," + lineWidth + ",Curve," + srcPos + "," + dstPos;
		var contents = "<canvas width='100' height='100' id='" + sprID + "_canvas'></canvas><script type='text/javascript'>\n<!--\nPLG.draw('" + drawCommand + "');\n// -->\n</script>";
		var rect = {};
		rect.left = 0;
		rect.top = 0;
		rect.width = EDT.DEFAULT_SPRITEWIDTH;
		rect.height = 100;

		if(PARAM.positlogMode == "EditMode"){
			EDT.createSprite(EDT.SAVE_NEWARROWSPRITE, contents, sprID, rect);
			EDT.linkSrcSprite = null;
		}
		return;
		// After exiting this function, it is called again in
		// rebuildLineSprites() in saveSprite().
	}

	// Draw arrow
	if(lineColor === undefined || lineWidth === undefined || lineStyle === undefined || srcPos === undefined || dstPos === undefined){
		PLG.getSpriteContents(spr).innerHTML.match(/draw\('(.+)'\)/);
		var drawCommand = RegExp.$1;
		var cmdArray = drawCommand.split(",");
		lineColor = cmdArray[4];
		lineWidth = cmdArray[5];
		lineStyle = cmdArray[6];
		srcPos = cmdArray[7];
		dstPos = cmdArray[8];
	}

	// Line parameters
	var startX, startY, startControlX, startControlY, endX, endY, endControlX, endControlY;
	// Arrow parameters
	var ax, ay, ax2, ay2;
//	var aWidth = 15;
	var aWidth = Math.sqrt(lineWidth) * 10;
//	var aHeight = 5;
	var aHeight = Math.sqrt(lineWidth) * 2;

	var srcMidX = PARAM.sprites[srcid].x + Math.round(PARAM.sprites[srcid].width / 2);
	
	var srcMidY = PARAM.sprites[srcid].y + Math.round(PARAM.sprites[srcid].contentsHeight / 2) + PARAM.sprites[srcid].padding + PARAM.sprites[srcid].borderWidth + PLG.SPRITE_BORDER_OFFSET;
	var dstMidX = PARAM.sprites[dstid].x + Math.round(PARAM.sprites[dstid].width / 2);
	var dstMidY = PARAM.sprites[dstid].y + Math.round(PARAM.sprites[dstid].contentsHeight / 2) + PARAM.sprites[dstid].padding + PARAM.sprites[dstid].borderWidth + PLG.SPRITE_BORDER_OFFSET;

	var spriteLeft = 0;
	var spriteTop = 0;


	var canvasWidth;
	var canvasHeight;

	if(srcPos == "Top"){
		startX = srcMidX;
		startY = srcTop - 2;
	}
	else if(srcPos == "Bottom"){
		startX = srcMidX;
		startY = srcBottom + 1;
	}
	else if(srcPos == "Left"){
		startX = srcLeft - 3;
		startY = srcMidY;
	}
	else if(srcPos == "Right"){
		startX = srcRight + 3;
		startY = srcMidY;
	}

	if(dstPos == "Top"){
		endX = dstMidX;
		endY = dstTop;
		if(PARAM.sprites[dstid].isDrawing){
			endY += Math.round(PARAM.sprites[dstid].height / 5);
		}
	}
	else if(dstPos == "Bottom"){
		endX = dstMidX;
		endY = dstBottom;
		if(PARAM.sprites[dstid].isDrawing){
			endY -= Math.round(PARAM.sprites[dstid].height / 5);
		}
	}
	else if(dstPos == "Left"){
		endX = dstLeft;
		endY = dstMidY;
		if(PARAM.sprites[dstid].isDrawing){
			endX += Math.round(PARAM.sprites[dstid].width / 5);
		}
		else{
			endX -= 3;
		}
	}
	else if(dstPos == "Right"){
		endX = dstRight;
		endY = dstMidY;
		if(PARAM.sprites[dstid].isDrawing){
			endX -= Math.round(PARAM.sprites[dstid].width / 5);
		}
		else{
			endX += 3;
		}
	}

	canvasWidth = Math.abs(endX - startX);
	canvasHeight = Math.abs(endY - startY);

	// Calc canvas position and size
	if(startX < endX){
		spriteLeft = startX;
	}
	else{
		spriteLeft = endX;
	}


	if(startY < endY){
		spriteTop = startY;
	}
	else{
		spriteTop = endY;
	}


	// Calc curve
	var hOffset = 0;
	var wOffset = 0;
	if(srcPos == "Top" || srcPos == "Bottom"){
		if(lineStyle == "Curve"){
			startControlX = startX;
			if(endY < startY){
				startControlY = startY - Math.round(canvasHeight * 2 / 3);
			}
			else{
				startControlY = startY + Math.round(canvasHeight * 2 / 3);
			}
			hOffset = Math.round(canvasHeight / 2);
			wOffset = 0;
		}
		else if(lineStyle == "CurveReverse"){
			if(endX < startX){
				startControlX = startX - Math.round(canvasWidth * 2 / 3);
			}
			else{
				startControlX = startX + Math.round(canvasWidth * 2 / 3);
			}
			startControlY = startY;
			hOffset = 0;
			wOffset = Math.round(canvasWidth / 2);
		}
	}
	else if(srcPos == "Left" || srcPos == "Right"){
		if(lineStyle == "Curve"){
			if(endX < startX){
				startControlX = startX - Math.round(canvasWidth * 2 / 3);
			}
			else{
				startControlX = startX + Math.round(canvasWidth * 2 / 3);
			}
			startControlY = startY;
			hOffset = 0;
			wOffset = Math.round(canvasWidth / 2);
		}
		else if(lineStyle == "CurveReverse"){
			startControlX = startX;
			if(endY < startY){
				startControlY = startY - Math.round(canvasHeight * 2 / 3);
			}
			else{
				startControlY = startY + Math.round(canvasHeight * 2 / 3);
			}
			hOffset = Math.round(canvasHeight / 2);
			wOffset = 0;
		}
	}

	endControlX = endX;
	endControlY = endY;

	// Calc arrow head
	var length = Math.sqrt((canvasWidth - wOffset) * (canvasWidth - wOffset) + (canvasHeight - hOffset) * (canvasHeight - hOffset));
	var cos = (canvasWidth - wOffset) / length;
	var sin = (canvasHeight - hOffset) / length;

	var x = 0;
	if(endX > startX){
		x = - aWidth;
	}
	else{
		x = aWidth;
	}
	if((endX < startX && endY < startY)
		 || (endX > startX && endY > startY)){
			 sin = -sin;
		 }
	var y = aHeight;

	ax = endX + Math.round(x * cos - y * sin);
	ay = endY - Math.round(x * sin + y * cos);
	y = -y;
	ax2 = endX + Math.round(x * cos - y * sin);
	ay2 = endY - Math.round(x * sin + y * cos);


	// Adjust size of arrow head
	if(canvasWidth < aHeight * 2 + lineWidth * 4){
		var offset = (aHeight * 2 + lineWidth * 4 - canvasWidth)/2;
		spriteLeft -= offset;
		canvasWidth = aHeight * 2 + lineWidth * 4;
	}
	if(canvasHeight < aHeight * 2 + lineWidth * 4){
		var offset = (aHeight * 2 + lineWidth * 4 - canvasHeight)/2;
		spriteTop -= offset;
		canvasHeight = aHeight * 2 + lineWidth * 4;
	}

	// var offset = 18;
//	var offset = 2;
	var offset = parseInt(lineWidth);
	canvasWidth += offset;
	canvasHeight += offset;
	spriteLeft -= Math.round(offset / 2);
	spriteTop -= Math.round(offset / 2)

	// Transform canvas

	var canvas = $(sprID + "_canvas");
	// Reset to the original size
	var contents = PLG.getSpriteContents(spr);
	var region = PLG.getSpriteRegion(spr);
	if(PLG.zooming){
		spr.style.width = PARAM.sprites[sprID].width + "px";
		spr.style.height = "auto";
		spr.style.fontSize = "";
		spr.style.lineHeight = "";

		region.style.width = (PARAM.sprites[sprID].width - 2)+ "px";
		region.style.height = "auto";

		contents.style.overflow = "visible";
		contents.style.height = "auto";
//		contents.style.padding = PARAM.sprites[spr.id].padding + "px";
		PLG.setContentsPadding(contents, PARAM.sprites[spr.id].padding);
		contents.style.borderWidth = PARAM.sprites[spr.id].borderWidth + "px";

		var info = PLG.getSpriteInfo(spr);
		info.style.overflow = "visible";
		info.style.height = "auto";

		var cobj = {};
		cobj.width = canvasWidth;
		cobj.height = canvasHeight;
		PLG.zoomingCanvas[sprID] = cobj;
	}

	spr.style.left = spriteLeft + "px";
	spr.style.top = spriteTop + "px";
	spr.style.width = canvasWidth + 2 + "px";

	region.style.width = canvasWidth + "px";

	spr.style.height = canvasHeight + "px";
	PLG.getSpriteContents(spr).style.height = canvasHeight + "px";
	PLG.getSpriteRegion(spr).style.height = "auto";

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	canvas.style.width = canvasWidth + "px";
	canvas.style.height = canvasHeight + "px";

	startX -= spriteLeft;
	startY -= spriteTop;
	startControlX -= spriteLeft;
	startControlY -= spriteTop;
	endX -= spriteLeft;
	endY -= spriteTop;
	endControlX -= spriteLeft;
	endControlY -= spriteTop;
	ax -= spriteLeft;
	ay -= spriteTop;
	ax2 -= spriteLeft;
	ay2 -= spriteTop;


	var startX1, startX2;
	var startY1, startY2;
	if(srcPos == "Right" || srcPos == "Left"){
		startX1 = startX;
		startX2 = startX;
		startY1 = startY - Math.round(parseInt(lineWidth)/2);
		startY2 = startY + Math.round(parseInt(lineWidth)/2);
	}
	else{
		startX1 = startX - Math.round(parseInt(lineWidth)/2);
		startX2 = startX + Math.round(parseInt(lineWidth)/2);
		startY1 = startY;
		startY2 = startY;
	}

	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

	if(PLG.browser.safari2){
		ctx.save();
		ctx.scale(PLG.zoom, PLG.zoom);
	}

	ctx.strokeStyle = lineColor;
	ctx.fillStyle = lineColor;

	// Draw head of arrow
	ctx.lineJoin = "miter"
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.moveTo(endX, endY);
	ctx.lineTo(ax, ay);
	ctx.lineTo(ax2, ay2);
//	ctx.closePath(); // ctx.fill() automatically closes path.
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(endX, endY);
	ctx.lineTo(ax, ay);
	ctx.lineTo(ax2, ay2);
	ctx.closePath();
	ctx.stroke();

	// Draw arc
	ctx.lineJoin = "round"
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.moveTo(startX1, startY1);
	if(lineStyle == "Straight"){
		ctx.lineTo(endX, endY);
		ctx.lineTo(startX2, startY2);
	}
	else{
		ctx.bezierCurveTo(startControlX, startControlY, endControlX, endControlY, endX, endY);
		ctx.bezierCurveTo(endControlX, endControlY, startControlX, startControlY, startX2, startY2);
	}
	ctx.closePath();
//	ctx.closePath(); // ctx.fill() automatically closes path.
	ctx.fill();

	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(startX1, startY1);
	if(lineStyle == "Straight"){
		ctx.lineTo(endX, endY);
		ctx.lineTo(startX2, startY2);
	}
	else{
		ctx.bezierCurveTo(startControlX, startControlY, endControlX, endControlY, endX, endY);
		ctx.bezierCurveTo(endControlX, endControlY, startControlX, startControlY, startX2, startY2);
	}
	ctx.closePath();
	ctx.stroke();

	if(PLG.browser.safari2){
		ctx.restore();
	}

	PARAM.sprites[spr.id].x = spriteLeft;
	PARAM.sprites[spr.id].y = spriteTop;
	PARAM.sprites[spr.id].isDrawing = true;

	PLG.backupSpriteProperties(spr);
	PLG.backupDynamicValues(spr);
	if(PLG.zooming){
		// Return to the zooming size
		contents.style.overflow = "hidden";
		PLG.getSpriteInfo(spr).style.overflow = "hidden";
		PLG.adjustZoomingSpritesPosition(spr.id);
		PLG.adjustZoomingSpritesContents(spr.id);
		// Exclude safari2 to avoid infinite loop.
		if(!PLG.browser.safari2){
			PLG.adjustZoomingCanvas(spr.id, PLG.zoom);
		}
	}

	PLG.showArrowTags(spr);

	PLG.redrawMapCanvas();
};

PLG.execDrawCommand = function() {
	if(PLG.drawcanvas !== null){
		if(PLG.canvasOK){
			if(PLG.drawCommand.length > 0){
				var cmd = PLG.drawCommand.shift();
				var cmdArray = cmd.split(",");
				if(cmdArray[0] == "shape"){
					if(cmdArray[1] == "arrow"){
						PLG.drawArrowSprite(cmdArray[2], cmdArray[3], cmdArray[4], cmdArray[5], cmdArray[6], cmdArray[7], cmdArray[8]);
					}
				}
				else{
					var canvasid = cmdArray[0];
					var canvas = $(canvasid);
					if(!canvas){
						return;
					}

					PLG.canvasSpriteExists = true;

					if(cmdArray[1] == "l"){
						var ctx = canvas.getContext("2d");

						if(PLG.browser.safari2){
							ctx.clearRect(0,0,canvas.width, canvas.height);
							ctx.save();
							ctx.scale(PLG.zoom, PLG.zoom);
						}

						ctx.strokeStyle = "#000000";
						ctx.lineWidth = 2;
						ctx.lineCap = "round";
						ctx.lineJoin = "round";
						var cmdStr = new String(cmdArray[2]);
						var startIndex = 4;
						ctx.beginPath();
						if(cmdStr.match(/^s(.+)$/)){
							ctx.lineWidth = parseFloat(RegExp.$1);
							startIndex++;
						}
						cmdStr = new String(cmdArray[3]);
						if(cmdStr.match(/^c(.+)$/)){
							ctx.strokeStyle = RegExp.$1;
							startIndex++;
						}

						ctx.moveTo(parseInt(cmdArray[startIndex - 2]), parseInt(cmdArray[startIndex - 1]));

						for(var i = startIndex;i < cmdArray.length; i++){
							if(cmdArray[i] == "l"){
								ctx.stroke();
								i++;
								var cmdStr = new String(cmdArray[i]);
								if(cmdStr.match(/^s(.+)$/)){
									ctx.lineWidth = parseFloat(RegExp.$1);
									i++;
								}
								cmdStr = new String(cmdArray[i]);
								if(cmdStr.match(/^c(.+)$/)){
									ctx.strokeStyle = RegExp.$1;
									i++;
								}
								ctx.beginPath();
								ctx.moveTo(parseInt(cmdArray[i]), parseInt(cmdArray[i + 1]));
							}
							else{
								ctx.lineTo(parseInt(cmdArray[i]), parseInt(cmdArray[i + 1]));
							}

							i++;
						}
						ctx.stroke();

						if(PLG.browser.safari2){
							ctx.restore();
						}
					}
				}
			}
			else if(!PLG.zoomDrawTimerFlag){
				clearInterval(PLG.drawTimer);
				PLG.drawTimer = null;
			}

		}
		else{
			PLG.drawCommand = [];
		}
	}
	else{
		PLG.drawCommand = [];
	}

	if(PLG.drawCommand.length == 0 && !PLG.zoomDrawTimerFlag){
		PLG.stopProcessingAnime();

		if(PARAM.zoom !== undefined && PLG.canvasOK){
			var zoom = parseFloat(PARAM.zoom);
			if(PARAM.zoom == "birdview"){
				if(PARAM.page_type == "map"){
					var adjustedX = Math.round((PLG.worldRight-Math.abs(PLG.worldLeft))/2);
					var adjustedY = Math.round((PLG.worldBottom-Math.abs(PLG.worldTop))/2);
					PLG.setViewPosition(adjustedX, adjustedY, true);
				}
				zoom = PLG.minimumzoom;
			}
			
			if(!isNaN(zoom)){
				PLG.changeZoom(zoom);
				if(PARAM.positlogMode == "ViewMode"){
					PLG.adjustViewPositionFlag = true;
					PLG.onMouseUp();
				}
			}
			$("spriteslist").style.visibility = "visible";
		}


		if(PARAM.printable){
//			window.print();
		}

		if(PARAM.positlogMode == "EditMode"){
			if(!EDT.drawingLoaded){
				EDT.drawingLoaded = true;
				// Backup hash again for drawings
				EDT.backupHashes();
			}
		}
	}
};

function draw(){
	// For converting from 0.583 to 0.60
}

PLG.draw = function(cmd) {
	PLG.drawCommand.push(cmd);

	var cmdArray = cmd.split(",");
	var canvasid = cmdArray[0];

	if(cmdArray[0] == "shape"){
		if(cmdArray[1] == "arrow"){
			canvasid = cmdArray[2] + "_" + cmdArray[3] + "_link_canvas";
		}
	}

	var canvas = $(canvasid);
	if(!canvas){
		return;
	}

	if(canvas.parentNode && canvas.parentNode.parentNode && canvas.parentNode.parentNode.parentNode){
		var spr = canvas.parentNode.parentNode.parentNode;

		if(PARAM.sprites[spr.id]){
			PARAM.sprites[spr.id].isDrawing = true;
		}

	}
};



// -------------------------------------------------
// Initialize
// See also bodyOnLoad()
// -------------------------------------------------

PLG.forceCancelTimer = null;
PLG.hideForceCancelMark = function(){
	$("forcecancelmark").style.display = "none";
	$("zoomingcenter").style.display = "none";
	PLG.forceCancelTimer = null;
};
PLG.showForceCancelMark = function(){
	if(PLG.forceCancelTimer === null){	
		var fcmark = $("forcecancelmark");
		fcmark.style.display = "block";
		if(PLG.browser.msie){
			fcmark.style.position = "absolute";
			fcmark.style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop + " + Math.round(PLG.getInnerHeight()/2-10) + " : document.body.scrollTop + " + Math.round(PLG.getInnerHeight()/2-10));
			fcmark.style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  documentElement.scrollLeft + " + Math.round(PLG.getInnerWidth()/2-10) + " : document.body.scrollLeft + " + Math.round(PLG.getInnerWidth()/2-10));
		}
		else{
			fcmark.style.position = "fixed";
			fcmark.style.left = Math.round(PLG.getInnerWidth()/2 - 10) + "px";
			fcmark.style.top = Math.round(PLG.getInnerHeight()/2 - 10) + "px";
		}
		PLG.forceCancelTimer = setTimeout("PLG.hideForceCancelMark()", 500);
	}
};



PLG.procAnimeCounter = 0;
PLG.procAnime = function(){
	var anime = $("procanime");
	anime.style.backgroundPosition = (- PLG.procAnimeCounter * 21) + "px 0px";
  PLG.procAnimeCounter++;
	if(PLG.procAnimeCounter > 8){
		PLG.procAnimeCounter = 0;
	}
	PLG.procAnimeCounter++;
};
PLG.procAnimeTimer = null;
PLG.startProcessingAnime = function(){
	if(PLG.procAnimeTimer === null){	
		var anime = $("procanime");
		anime.style.display = "block";
		if(PLG.browser.msie){
			anime.style.position = "absolute";
			anime.style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop + " + Math.round(PLG.getInnerHeight()/2-10) + " : document.body.scrollTop + " + Math.round(PLG.getInnerHeight()/2-10));
			anime.style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  documentElement.scrollLeft + " + Math.round(PLG.getInnerWidth()/2-10) + " : document.body.scrollLeft + " + Math.round(PLG.getInnerWidth()/2-10));
		}
		else{
			anime.style.position = "fixed";
			anime.style.left = Math.round(PLG.getInnerWidth()/2 - 10) + "px";
			anime.style.top = Math.round(PLG.getInnerHeight()/2 - 10) + "px";
		}
		PLG.procAnimeTimer = setInterval("PLG.procAnime()", 300);
	}
};

PLG.stopProcessingAnime = function(){
	if(PLG.procAnimeTimer !== null){
		clearInterval(PLG.procAnimeTimer);
		PLG.procAnimeTimer = null;
		$("procanime").style.display = "none";
	}
};

PLG.showZoomingCenter = function(){
	var zcenter = $("zoomingcenter");
	if(PLG.browser.msie){
		zcenter.style.position = "absolute";
		zcenter.style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop + " + Math.round(PLG.getInnerHeight()/2-10) + " : document.body.scrollTop + " + Math.round(PLG.getInnerHeight()/2-10));
		zcenter.style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  documentElement.scrollLeft + " + Math.round(PLG.getInnerWidth()/2-10) + " : document.body.scrollLeft + " + Math.round(PLG.getInnerWidth()/2-10));
	}
	else{
		zcenter.style.position = "fixed";
		zcenter.style.left = Math.round(PLG.getInnerWidth()/2 - 10) + "px";
		zcenter.style.top = Math.round(PLG.getInnerHeight()/2 - 10) + "px";
	}
	zcenter.style.display = "block";
}

PLG.hideZoomingCenter = function(){
	$("zoomingcenter").style.display = "none";
};



PLG.showSpritesList = function() {
	// if(PLG.browser.iemobile){
	// IE mobile does not have getElementById method.
	// nop
	// }

	var loaded = true;

	if(PARAM.forceload || (navigator.userAgent.match(/Opera/) && navigator.platform.match(/Windows CE/))){
		// W-ZERO3
		if(PLG.bodyLoaded && $("spriteslist")){
			loaded = true;
		}
		else{
			loaded = false;
		}
	}
	else{
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				var spr = $(id);
				if(!spr){
					loaded = false;
				}
			}
		}
		if(!$("drawcanvas")){ // "drawcanvas" must be checked.
			loaded = false;
		}
		if(!$("worldframe")){ // "worldframe" must be checked.
			loaded = false;
		}
		if(!$("spriteslist")){
			loaded = false;
		}

		// IE must wait bodyLoaded to initialize excanvas
		// Safari must wait bodyLoaded because scroll position is cleared after bodyLoaded
		if(PARAM.publish == 1
			 || (PLG.browser.msie || PLG.browser.msie7 || PLG.browser.safari)){
			if(!PLG.bodyLoaded){
				loaded = false;
			}
		}
	}

	if(loaded){
		var sl = $("spriteslist");
		if(PARAM.page_type == "map" && !PARAM.printable){
			var xoffset = Math.round(PLG.getInnerWidth() / 2);
			var yoffset = Math.round(PLG.getInnerHeight() / 2);
			sl.style.left = xoffset + "px";
			sl.style.top = yoffset + "px";
			$("spritesworld").style.backgroundPosition = xoffset + "px" + " " + yoffset + "px";
		}
		
		PLG.initialize();
	}
	else{
		setTimeout("PLG.showSpritesList()", 10);
	}
}
PLG.showSpritesList();

PLG.initializeWidgets = function() {
//	$("zoomcaption").style.backgroundColor = $("footerbg").style.backgroundColor;

	// Set drawing canvas
	PLG.drawcanvas = $("drawcanvas");

	if(PLG.browser.msie || PLG.browser.msie7 || (PLG.drawcanvas && PLG.drawcanvas.getContext)){
		PLG.canvasOK = true;
	}

	if(PLG.canvasOK){
		PLG.drawcanvas.width = PLG.getInnerWidth();
		PLG.drawcanvas.height = PLG.getInnerHeight();
		PLG.drawcanvas.style.width = PLG.getInnerWidth() + "px";
		PLG.drawcanvas.style.height = PLG.getInnerHeight() + "px";
		PLG.drawctx = PLG.drawcanvas.getContext("2d");
		PLG.drawcanvas.style.display = "none";
	}

	// Set cursor
	if(PLG.browser.msie || PLG.browser.msie7 || PLG.browser.mozes){
		$("spritesworld").style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
	}

	if(PLG.nowidgets){
		$("homebtn").style.visibility = "hidden";
		$("footer").style.visibility = "hidden";
		$("zoomscalerarea").style.visibility = "hidden";
		return;
	}

	// Init small map
	PLG.initSmallMap();

	var magicMargin = 0;
	if(PLG.browser.opera){
		magicMargin = 2;
	}
	else if(PLG.browser.mozes){
		magicMargin = 3;
	}

	if(PLG.browser.msie){
		// Set position:fixed for IE6
		var hbtn = $("homebtn");
		hbtn.style.position = "absolute";
		hbtn.style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop : document.body.scrollTop");
		hbtn.style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollLeft+document.documentElement.clientWidth-32 : document.body.scrollLeft+document.body.clientWidth-32");

		$("footer").style.position = "absolute";
		$("footer").style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop+document.documentElement.clientHeight-" + $("footer").offsetHeight + " : document.body.scrollTop+document.body.clientHeight-" + $("footer").offsetHeight);
		$("footer").style.width = "280px";
		$("footer").style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollLeft+document.documentElement.clientWidth-" + $("footer").offsetWidth + " : document.body.scrollLeft+document.body.clientWidth-" + $("footer").offsetWidth);

		$("zoomscalerarea").style.position = "absolute";
		var captiontop = $("footer").offsetHeight + PLG.mapcanvas.offsetHeight + $("zoomscalerarea").offsetHeight;
		var captionleft = $("zoomscalerarea").offsetWidth;

		$("zoomscalerarea").style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop+document.documentElement.clientHeight-" + captiontop + " : document.body.scrollTop+document.body.clientHeight-" + captiontop);
		$("zoomscalerarea").style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollLeft+document.documentElement.clientWidth-" + captionleft + " : document.body.scrollLeft+document.body.clientWidth-" + captionleft);
		PLG.drawcanvas.style.position = "absolute";

		PLG.viewcanvas.style.position = "absolute";
		PLG.viewcanvas.style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop+document.documentElement.clientHeight-" + PLG.viewcanvas.offsetHeight + "-" + $("footer").offsetHeight + " : document.body.scrollTop+document.body.clientHeight-" + PLG.viewcanvas.offsetHeight + "-" + $("footer").offsetHeight);
		PLG.viewcanvas.style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollLeft+document.documentElement.clientWidth-" + PLG.viewcanvas.offsetWidth + " : document.body.scrollLeft+document.body.clientWidth-" + PLG.viewcanvas.offsetWidth);

		PLG.mapcanvas.style.position = "absolute";
		PLG.mapcanvas.style.setExpression("top", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollTop+document.documentElement.clientHeight-" + PLG.mapcanvas.offsetHeight + "-" + $("footer").offsetHeight + " : document.body.scrollTop+document.body.clientHeight-" + PLG.mapcanvas.offsetHeight + "-" + $("footer").offsetHeight);
		PLG.mapcanvas.style.setExpression("left", "eval(document.compatMode && document.compatMode=='CSS1Compat') ?  document.documentElement.scrollLeft+document.documentElement.clientWidth-" + PLG.mapcanvas.offsetWidth + " : document.body.scrollLeft+document.body.clientWidth-" + PLG.mapcanvas.offsetWidth);
	}
	else{
		var hbtn = $("homebtn");
		hbtn.style.position = "fixed";
		hbtn.style.top = "0px";
		hbtn.style.right = "0px";

		$("footer").style.position = "fixed";
		$("footer").style.right = "0px";
		$("footer").style.bottom = magicMargin + "px";

		$("zoomscalerarea").style.position = "fixed";
		$("zoomscalerarea").style.right = "0px";
		$("zoomscalerarea").style.bottom = (magicMargin + $("footer").offsetHeight + PLG.viewcanvas.offsetHeight) + "px";
		if(PLG.drawcanvas !== null){
			PLG.drawcanvas.style.position = "absolute";
			PLG.drawcanvas.style.left = "0px";
			PLG.drawcanvas.style.top = "0px";
		}
		if(PLG.viewcanvas !== null){
			PLG.viewcanvas.style.position = "fixed";
			PLG.viewcanvas.style.right = "0px";
			PLG.viewcanvas.style.bottom = ($("footer").offsetHeight + magicMargin) + "px";
		}
		if(PLG.mapcanvas !== null){
			PLG.mapcanvas.style.position = "fixed";
			PLG.mapcanvas.style.right = "0px";
			PLG.mapcanvas.style.bottom = ($("footer").offsetHeight + magicMargin) + "px";
		}
	}

	$("zoomscalerarea").style.visibility = "hidden";
};

PLG.resizeWorld = function(zoom) {
	if(zoom === undefined){
		zoom = PLG.zoom;
	}
		
	if(PARAM.positlogMode == "ViewMode"){
		if(PARAM.printable){
			var h = Math.round((PLG.worldBottom - PLG.worldTop) * zoom + PLG.worldTop);
			if(h < 1){
				h = 1;
			}
			$("spriteslist").style.height = h + "px";
			var w = Math.round((PLG.worldRight - PLG.worldLeft) * zoom + PLG.worldLeft);
			if(w < 1){
				w = 1;
			}
			$("spriteslist").style.width = w + "px";
			$("spritesworld").style.height = (Math.round((PLG.worldBottom - PLG.worldTop) * zoom)) + "px";
			$("spritesworld").style.width = (Math.round((PLG.worldRight - PLG.worldLeft) * zoom)) + "px";
		}
		else if(PARAM.page_type == "map"){
			var h = Math.round((PLG.worldBottom - PLG.worldTop) * zoom + PLG.worldTop + PLG.getInnerHeight() / 2);
			if(h < 1){
				h = 1;
			}
			$("spriteslist").style.height = h + "px";
			var w = Math.round((PLG.worldRight - PLG.worldLeft) * zoom + PLG.worldLeft + PLG.getInnerWidth() / 2);
			if(w < 1){
				w = 1;
			}
			$("spriteslist").style.width = w + "px";
			$("spritesworld").style.height = (Math.round((PLG.worldBottom - PLG.worldTop) * zoom) + PLG.getInnerHeight()) + "px";
			$("spritesworld").style.width = (Math.round((PLG.worldRight - PLG.worldLeft) * zoom) + PLG.getInnerWidth()) + "px";
		}
		else{
			$("spriteslist").style.height = Math.round(PLG.worldBottom + PLG.getInnerHeight()/2) + "px";
			$("spriteslist").style.width = Math.round(PLG.worldRight + PLG.getInnerWidth()/2) + "px";
			$("spritesworld").style.height = (Math.round((PLG.worldBottom - PLG.worldTop) * zoom) + PLG.getInnerHeight()/2) + "px";
			$("spritesworld").style.width = (Math.round((PLG.worldRight - PLG.worldLeft) * zoom) + PLG.getInnerWidth()/2) + "px";
		}
	}
	else if(PARAM.positlogMode == "EditMode"){
		// Hide horizontal scroll bar
		$("controlpanel").style.width = (PLG.getInnerWidth() - 1) + "px";

		if(PLG.browser.safari || PLG.browser.opera){
			$("controlpanel_bar1").style.width = (PLG.getInnerWidth() - 3) + "px";
			$("controlpanel_bar2").style.width = (PLG.getInnerWidth() - 3) + "px";
			$("controlpanel_bar3").style.width = (PLG.getInnerWidth() - 3) + "px";
			$("controlpanel_bar4").style.width = (PLG.getInnerWidth() - 3) + "px";
		}

		// Hide Vertical scroll bar
		$("spritesworld").style.height = PLG.getInnerHeight() + "px";

		// Recalc width of controlpanel
		if(PLG.browser.mozes){
			$("controlpanel").style.width = (PLG.getInnerWidth() - 1) + "px";
			$("controlpanel_bar1").style.width = (PLG.getInnerWidth() - 3) + "px";
			$("controlpanel_bar2").style.width = (PLG.getInnerWidth() - 3) + "px";
			$("controlpanel_bar3").style.width = (PLG.getInnerWidth() - 3) + "px";
			$("controlpanel_bar4").style.width = (PLG.getInnerWidth() - 3) + "px";
		}
		else{
			$("controlpanel").style.width = PLG.getInnerWidth() + "px";
		}

		$("spriteslist").style.height = (PLG.worldBottom - PLG.worldTop + Math.round(PLG.getInnerHeight() / 2)) + "px";
		$("spriteslist").style.width = (PLG.worldRight - PLG.worldLeft + Math.round(PLG.getInnerWidth() / 2)) + "px";
	
	}

	PLG.calcMinimumZoom();
};

PLG.rebuildReverseDicOfGroups = function() {
	for(var gid in PARAM.groups){
		if(!gid.match(/^grp.+$/)){
			continue;
		}
		for(var id in PARAM.groups[gid]){
			if(!id.match(/^spr.+$/) && !id.match(/^grp.+$/)){
				continue;
			}
			if(id.match(/^spr.+$/)){
				if(PARAM.sprites[id]){
					PARAM.sprites[id].groupid = gid;
				}
				else{
					delete PARAM.groups[gid][id];
				}
			}
			else if(id.match(/^grp.+$/)){
				if(PARAM.groups[id]){
					PARAM.groups[id].groupid = gid;
				}
				else{
					delete PARAM.groups[gid][id];
				}
			}
		}
	}
};

PLG.calcRegionsOfGroup = function(gid) {
	var left = Number.MAX_VALUE;
	var right = -Number.MAX_VALUE;
	var top = Number.MAX_VALUE;
	var bottom = -Number.MAX_VALUE;
	var bottomz = Number.MAX_VALUE;
	var topz = 0;

	var itemArray = [];
	itemArray.push(gid);
	while(itemArray.length > 0){
		var id = itemArray.pop();
		if(id.match(/^grp.+$/)){
			for(var itemid in PARAM.groups[id]){
				if(itemid.match(/^grp.+$/) || itemid.match(/^spr.+$/)){
					itemArray.push(itemid);
				}
			}
		}
		else{
			if(left > PARAM.sprites[id].x){
				left = PARAM.sprites[id].x;
			}
			if(right < PARAM.sprites[id].x + PARAM.sprites[id].width){
				right = PARAM.sprites[id].x + PARAM.sprites[id].width;
			}
			if(top > PARAM.sprites[id].y){
				top = PARAM.sprites[id].y;
			}
			if(bottom < PARAM.sprites[id].y + PARAM.sprites[id].height){
				bottom = PARAM.sprites[id].y + PARAM.sprites[id].height;
			}
			if(bottomz > PARAM.sprites[id].z){
				bottomz = PARAM.sprites[id].z;
			}
			if(topz < PARAM.sprites[id].z){
				topz = PARAM.sprites[id].z;
			}
		}
	}
	PARAM.groups[gid].x = left;
	PARAM.groups[gid].y = top;
	PARAM.groups[gid].width = right - left;
	PARAM.groups[gid].height = bottom - top;
	PARAM.groups[gid].topZ = topz;
	PARAM.groups[gid].bottomZ = bottomz;
	PLG.setGroupFrame(gid);
};

PLG.setGroupFrame = function(gid){
//	if(PARAM.positlogMode != "EditMode"){
		return;
//	}

	var group = $(gid);
	if(!group){
		group = PLG.createElm("div", gid);
		group.style.border = "1px solid " + PLG.COLOR_GROUPFRAME;
		group.style.position = "absolute";
		$("spriteslist").appendChild(group);
	}
	group.style.left = PARAM.groups[gid].x + "px";
	group.style.top = PARAM.groups[gid].y + "px";
	group.style.width = PARAM.groups[gid].width + "px";
	group.style.height = PARAM.groups[gid].height + "px";
	group.style.zIndex = (PARAM.groups[gid].bottomZ - 1);
};

PLG.removeGroupFrame = function(gid){
	if($(gid)){
		$("spriteslist").removeChild($(gid));
	}
};


PLG.showControlpanelAuth = function() {
	var loginid = PLG.getCookie("loginid");
	if(loginid == "public"){
		$("idarea").style.display = "none";
		$("cp_auth").style.display = "block";
		var public_password = PLG.getCookie("public_password");
		if(public_password === undefined){
			public_password = "";
		}
		$("cp_publicpass").value = public_password;
		$("cp_publicpass").onfocus = function() {
			PLG.focusedField = "cp_publicpass";
			EDT.view.setPropertyDirty(true);
		}
		$("cp_publicpass").onblur = function() {
			PLG.focusedField = "";
		}

		var public_author = PLG.getCookie("public_author");
		if(public_author === undefined){
			public_author = "public";
		}
		else{
			public_author = decodeURIComponent(public_author);
		}
		$("cp_publicauthor").value = public_author;
		$("cp_publicauthor").onfocus = function() {
			PLG.focusedField = "cp_publicauthor";
			if($("cp_publicauthor").value == "public"){
				$("cp_publicauthor").value = "";
			}
			EDT.view.setPropertyDirty(true);
		}
		$("cp_publicpass").onblur = function() {
			PLG.focusedField = "";
		}
	}
};

PLG.setImageOnMouseOver = function(){
	if(PLG !== undefined){
		PLG.isMouseOnImage = true;
	}
};

PLG.setImageOnMouseOut = function(){
	if(PLG !== undefined){
		PLG.isMouseOnImage = false;
	}
};

PLG.setIframeOnMouseOver = function(){ 
	if(PLG.state == PLG.STATES.MOVING || PLG.state == PLG.STATES.MOVINGSELECTED || PLG.state == PLG.STATES.SCALING){
		// Hide iframes because they interfere moving on IEs.
		if(this.style.visibility != "hidden"){
			this.style.visibility = "hidden";
			PLG.hiddenIframes.push(this);
		}
	}
};

PLG.setIframeOnMouseOut = function(){ 
	if(this.style.visibility != "visible"){
		this.style.visibility = "visible";
	}
};

PLG.setInputOnFocus = function(){ 
	PLG.focusedField = "input";
};

PLG.setInputOnBlur = function(){ 
	PLG.focusedField = "";
};

PLG.calcMinimumZoom = function(){
	if(PLG.worldLeft == Number.MAX_VALUE){
		return;
	}

	var xRate = PLG.getInnerWidth() / (PLG.worldRight - PLG.worldLeft);
	var yRate = PLG.getInnerHeight() / (PLG.worldBottom - PLG.worldTop);
	var minrate = xRate;
	if(yRate < xRate){
		minrate = yRate;
	}
	var min = Math.floor(minrate * 100) / 100;
	if(min > 1){
		min = 1;
	}
	if(min < 0.1){
		min = 0.1;
	}
	PLG.minimumzoom = min;

	PLG.changeZoomDisplay();
}

PLG.getKeyCode = function(e){
	var keycode = 0;
	if(e !== undefined && !PLG.browser.opera){
//		keycode = e.which;
		keycode = (e.keyCode !== 0) ? e.keyCode : e.charCode;
	}
	else{
		keycode = event.keyCode;
	}

	if(PLG.browser.safari){
		switch(keycode){
		case 63273:
			keycode = 36;
			break;
		case 63275:
			keycode = 35;
			break;
		case 63276:
			keycode = 33;
			break;
		case 63277:
			keycode = 34;
			break;
		case 63234:
			keycode = 37;
			break;
		case 63232:
			keycode = 38;
			break;
		case 63235:
			keycode = 39;
			break;
		case 63233:
			keycode = 40;
			break;
		}
	}
	return keycode;
};

PLG.initialize = function() {
	if(PLG.browser.msie || PLG.browser.msie7){
		PLG.mousePositionOffset = 2;
	}

	if(PARAM.printable){
		PLG.nowidgets = true;
	}

	if(PARAM.positlogMode == "EditMode"){
		PLG.state = PLG.STATES.WORKING;
	}
	else{
		PLG.state = PLG.STATES.VIEWING;
	}

	// Process sprites
	for(var id in PARAM.sprites){
		if(id.match(/^spr.+$/)){
			var spr = $(id);
			if(spr){
				// Store processed sprite
				PLG.numberOfSprites++;

				if(PLG.browser.msie || PLG.browser.msie7){
					var infoElm = PLG.getSpriteInfo(spr);
					if(infoElm.hasChildNodes()){
						infoElm.style.width = "100%"; // If this style is not set, IE6 and IE7 fail to calculate the offsetHeight of a sprite including <p> element. 
					}
					else{
						infoElm.style.width = "auto";
					}
				}

				// Set sprite info before backupDynamicProperties
				PLG.backupSpriteProperties(spr);
				PLG.backupDynamicProperties(spr);
//				spr.style.visibility = "visible";
				spr.style.visibility = "";

				if(PARAM.publish == 1 && PARAM.positlogMode == "ViewMode"){
					PARAM.sprites[id].orgx = PARAM.sprites[id].x;
					PARAM.sprites[id].orgy = PARAM.sprites[id].y;
				}
				spr.onmouseover = PLG.spriteOnMouseOver;

			}
		}
	}

	$("footer").style.display = "block";

	if($("status")){
		$("status").innerHTML = "Drawing ...";
	}

	var imgArray = document.getElementsByTagName("img");
	for(var i=0; i<imgArray.length; i++){
		imgArray[i].onmouseover = PLG.setImageOnMouseOver;
		imgArray[i].onmouseout = PLG.setImageOnMouseOut;
		if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
			if(!imgArray[i].parentNode || !imgArray[i].parentNode.tagName.match(/^a$/i)){
				imgArray[i].style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
			}
		}
	}

	var canvasArray = document.getElementsByTagName("canvas");
	for(var i=0; i<canvasArray.length; i++){
		canvasArray[i].onmouseover = PLG.setImageOnMouseOver;
		canvasArray[i].onmouseout = PLG.setImageOnMouseOut;
		if(PLG.browser.mozes || PLG.browser.msie || PLG.browser.msie7){
			canvasArray[i].style.cursor = "url(" + PARAM.SYSTEMPATH + "images/hand.cur), default";
		}
	}

	var iframeArray = document.getElementsByTagName("iframe");
	for(var i=0; i<iframeArray.length; i++){
		var iframe = iframeArray[i];
		if(iframe.id != "plg_anchorframe"){
			// Reload iframe for GoogleMap blog parts
			iframe.src = iframe.src;
			if(PLG.browser.msie || PLG.browser.msie7){
				if(PARAM.positlogMode == "EditMode"){
					iframe.onmouseover = PLG.setIframeOnMouseOver;
					iframe.onmouseout = PLG.setIframeOnMouseOut;
				}
			}
		}
	}

	var inputArray = document.getElementsByTagName("input");
	for(var i=0; i<inputArray.length; i++){
		inputArray[i].onfocus = PLG.setInputOnFocus;
		inputArray[i].onblur = PLG.setInputOnBlur;
	}
	inputArray = document.getElementsByTagName("select");
	for(var i=0; i<inputArray.length; i++){
		inputArray[i].onfocus = PLG.setInputOnFocus;
		inputArray[i].onblur = PLG.setInputOnBlur;
	}
	inputArray = document.getElementsByTagName("textarea");
	for(var i=0; i<inputArray.length; i++){
		inputArray[i].onfocus = PLG.setInputOnFocus;
		inputArray[i].onblur = PLG.setInputOnBlur;
	}

	if(PARAM.positlogMode == "ViewMode"){
		$("spritesworld").style.overflow = "hidden";
	}
	else if(PARAM.positlogMode == "EditMode"){
		// This must be after PLG.backupDynamicProperties() on Firefox
		// because process of calculating offsetHeight and offsetWidth are slow 
		// if overflow is hidden.
		$("spritesworld").style.overflow = "hidden";
	}

	// Process groups
	PLG.rebuildReverseDicOfGroups();

	if(PARAM.publish == 1){
		// adjustMargin includes the function of calcRegionsOfGroup
		PLG.adjustMargin("");

		// Re-calc
		for(var id in PARAM.sprites){
			if(id.match(/^spr.+$/)){
				var spr = $(id);
				PLG.backupSpritePosition(spr);
			}
		}
	}
	else{
		for(var gid in PARAM.groups){
			if(gid.match(/^grp.+$/)){
				PLG.calcRegionsOfGroup(gid);
			}
		}
	}


	var worldFrame = $("worldframe");
	if(PLG.browser.msie || PLG.browser.msie7){
		worldFrame.style.filter = "alpha(opacity=40)";
	}
	else{
		worldFrame.style.opacity = 0.4;
	}

	PLG.rebuildWorldEdges();

	if(PARAM.positlogMode == "ViewMode"){
		worldFrame.style.visibility = "hidden";
	}
	else if(PARAM.positlogMode == "EditMode"){
		worldFrame.style.visibility = "visible";
	}


	// Resize world
	if(PARAM.positlogMode == "ViewMode"){
		PLG.resizeWorld();
	}
	else if(PARAM.positlogMode == "EditMode"){
		// Fix height of controlpanel before EDT.resizeWorld()

		// Control panel line 1
		PLG.showControlpanelAuth();
		$("pageinfo").innerHTML = "(" + PLG.numberOfSprites + "sprites, " + Math.abs(PLG.worldRight - PLG.worldLeft) + "x" + Math.abs(PLG.worldBottom - PLG.worldTop) + "pixels)";

		PLG.resizeWorld();
	}
	
	PLG.initializeWidgets();

	// -------------------------------------------
	// Focus specific position
	// Apply order: edge > id > view position
	// -------------------------------------------
	if(PARAM.edge !== ""){
		if(PARAM.edge == "top"){
			PARAM.id = PLG.topSprID;
		}
		else if(PARAM.edge == "bottom"){
			PARAM.id = PLG.bottomSprID;
		}
		else if(PARAM.edge == "left"){
			PARAM.id = PLG.leftSprID;
		}
		else if(PARAM.edge == "right"){
			PARAM.id = PLG.rightSprID;
		}
	}


	// Id
	var urlArray = location.href.split("#");
	if(urlArray.length > 1){
		if(urlArray[1].match(/id_(.+)/)){
			PARAM.id = RegExp.$1;
		}
	}

	if(PARAM.id === "" && PARAM.p === "" && (PARAM.vp === undefined || PARAM.vp === "")){
		// Home position
		var cookie = PLG.getCookie("viewposition");
		var positionSetFlag = false;

		if(cookie !== undefined){
			// Use history
			var historyArray = cookie.split(":");
			for(var i=0; i<historyArray.length; i++){
				var vpArray = historyArray[i].split(",");
				if(vpArray[0] == PARAM.pageid){
					var viewDateValue = vpArray[5];
					var date = new Date;
					if(parseInt(date.getTime()) - parseInt(viewDateValue) < 1800000){
						PLG.setViewPosition(vpArray[2], vpArray[3], false);
						var zoomArg = vpArray[4];
						if(zoomArg == "birdview"){
							zoomArg = PLG.minimumzoom;
						}
						if(!PARAM.zoom){
							PARAM.zoom = zoomArg;
						}

						positionSetFlag = true;
						break;
					}
				}
			}
		}
		if(!positionSetFlag){
			// Use home position
			if(PARAM.homeposition == ""){
				// Default home position
				if(PARAM.page_type == "map"){
					PLG.setViewPosition(0, 0, false);
				}
				else if(PARAM.page_type == "document"){
					if(PARAM.positlogMode == "EditMode"){
						PLG.setViewPosition(PLG.worldLeft, PLG.worldTop - $("controlpanel").offsetHeight, false);
					}
					else{
						PLG.setViewPosition(PLG.worldLeft, PLG.worldTop, false);
					}
				}
			}
			else{
				// User-defined home position
				var homezoom = PARAM.homeposition.zoom;
				if(homezoom == "birdview"){
					homezoom = PLG.minimumzoom;
				}
				PARAM.zoom = homezoom;
				PLG.setViewPosition(PARAM.homeposition.x, PARAM.homeposition.y, false);
			}
		}
	}
	else if(PARAM.id !== ""){
		PLG.focusedSprite = $(PARAM.id);
		if(PLG.focusedSprite !== null){
			var innerWidth = PLG.getInnerWidth();
			var leftOffset = Math.round(PLG.sprWidth(PLG.focusedSprite) / 2);
			if(PLG.sprWidth(PLG.focusedSprite) / 2 > innerWidth / 2){
				leftOffset = innerWidth / 2 - 10;
			}
			if(PARAM.page_type == "document"){
				leftOffset -= Math.round(innerWidth / 2);
			}

			var topOffset = 0;
			if(PARAM.page_type == "document"){
				topOffset = -30;
			}
			else{
				topOffset = Math.round(PLG.sprHeight(PLG.focusedSprite) / 2);
				if(PLG.sprHeight(PLG.focusedSprite) / 2 > PLG.getInnerHeight() / 2 ){
					topOffset = PLG.getInnerHeight() / 2 - 10;
				}
			}

			// Change view position if the focused sprite is not in the
			// worldArea.
			var vpX = PLG.sprLeft(PLG.focusedSprite) + parseInt(leftOffset);
			var vpY = PLG.sprTop(PLG.focusedSprite) + parseInt(topOffset)
			PLG.setViewPosition(vpX, vpY, false);

			PLG.viewPositionChangeHash = true;

			// show rectangle of PLG.focusedSprite
			var region = PLG.getSpriteRegion(PLG.focusedSprite);
			region.style.border = "1px solid " + PLG.COLOR_FOCUSEDSPRITE;
			region.style.padding = "0px";
			PLG.focusedSprite.style.zIndex = PLG.ZIND.GO_TEMP_FOREGROUND;
		}
	}
	else if(PARAM.vp && PARAM.vp !== ""){
		// move to focused viewposition (old)
		PARAM.vp.match(/^(.+),(.+)$/);
		PLG.setViewPosition(-parseInt(RegExp.$1), -parseInt(RegExp.$2), false);
	}
	else if(PARAM.p !== ""){
		// move to focused viewposition
		PARAM.p.match(/^(.+),(.+)$/);
		PLG.setViewPosition(parseInt(RegExp.$1), parseInt(RegExp.$2), false);
	}

	// Set events
	if(PARAM.positlogMode == "ViewMode"){
		window.onscroll = function() {
			PLG.adjustViewPosition();
		}
	}

	if($("spriteslist").style.visibility == "hidden"
		 && ((PARAM.zoom === undefined || PARAM.zoom == 1)
				 || !PLG.canvasOK)){
		$("spriteslist").style.visibility = "visible";
	}


	document.onmousedown = PLG.onMouseDown;
	document.onmouseup = PLG.onMouseUp;
	document.onmousemove = PLG.onMouseMove;
	document.onmouseout = PLG.onMouseOut;

//	document.ondblclick = PLG.onDoubleClick;

	window.onmousewheel = document.onmousewheel = PLG.onMouseWheel;
	if(window.addEventListener){
		window.addEventListener('DOMMouseScroll', PLG.onMouseWheel, true);
	}

	window.onresize = PLG.resizeWorld;

	// Draw small map
	PLG.redrawViewCanvas();

	if(PLG.browser.safari){
		window.setTimeout('PLG.redrawMapCanvas()', 1000);
	}
	else{
		PLG.redrawMapCanvas();
	}

	// Keep watch on the change of fontsize
	if(PARAM.publish == 1){
		PLG.fontSize = $("footer").offsetHeight;
		PLG.fontSizeChecker = setInterval('PLG.layouter()', 1000);
	}

	if(PLG.canvasOK && !PLG.nowidgets){
		// This filter was enabled in PLG.initSmallMap() in the past version
		// however sometimes it does not work.
		if(PLG.browser.msie || PLG.browser.msie7){
			PLG.mapcanvas.style.filter = "alpha(opacity=40)";
		}
		else{
			PLG.mapcanvas.style.opacity = 0.4;
		}
	}

	PLG.prevLocationHash = window.location.hash;
	setInterval('PLG.focuschecker()', 200);

	document.onkeydown = function(e){
		if(PLG.focusedField !== ""){
			return;
		}
		var keycode = PLG.getKeyCode(e);

		if(keycode == 35){
			// End
			PLG.gotoBirdView();
			return false;
		}

		if(keycode == 36){
			// Home
			if(PLG.moveTimer === null){
				PLG.moveToHomePosition();
			}
			return false;
		}

		if(keycode == 32 || keycode == 229){
			PLG.handTool = true;
			if(PLG.keyPressStartTime == 0){
				var theDay = new Date();
				PLG.keyPressStartTime = theDay.getTime();
				
				var mask = $("screenmask");
				mask.style.left = "0px";
				mask.style.top = "0px";
				mask.style.width = $("spritesworld").style.width;
				mask.style.height = $("spritesworld").style.height;
				mask.style.display = "block";
			}
			return false;
		}

	};

	document.onkeypress = function(e){
		if(PLG.focusedField !== ""){
			return;
		}

		var keycode = PLG.getKeyCode(e);

		if(keycode == 35){
			return false;
		}

		if(keycode == 36){
			return false;
		}

		if(keycode == 32 || keycode == 229){
			return false;
		}
	}

	document.onkeyup = function(e){
		if(PLG.focusedField !== ""){
			return;
		}

		if(PLG.handTool){
			PLG.handTool = false;
			var theDay = new Date();
			if(theDay.getTime() - PLG.keyPressStartTime < 500){
				var moveY = PLG.getInnerHeight() - 50;
				var top = parseInt(PLG.viewPositionY) + moveY;
				PLG.setViewPosition(PLG.viewPositionX, top);
			}

			var mask = $("screenmask");
			if(mask.style.display == "block"){
				mask.style.display = "none";
			}

			PLG.keyPressStartTime = 0;
			return false;
		}


	};

	// Calc minimum zoom
	PLG.calcMinimumZoom();


	if(PLG.browser.msie || PLG.browser.msie7){
		// Insert IFRAME to enable the history of anchor names (#).
		var anchorFrame = PLG.createElm("iframe", "plg_anchorframe");
		anchorFrame.style.cssText = "border: 0px; width:1px; height: 1px; margin: 0px:padding: 0px;";
		anchorFrame.src = PARAM.SYSTEMPATH + "anchorframe.html";
		$("positlogbody").appendChild(anchorFrame);

		anchorFrame.onreadystatechange = function () {
			if (this.readyState == "complete") {
				if(PLG.anchorFrameQueue.length > 0){
					var position = PLG.anchorFrameQueue.pop();
					PLG.saveAnchorHistory(position);
				}
				else{
					var urlArray = $("plg_anchorframe").contentWindow.document.location.href.split("?");
					if(urlArray.length == 2){
						var key = urlArray[1];
						var value = PLG.anchorHistory[key];
						if(value === undefined){
							return;
						}
						if(value.match(/#id_(.+)/)){
							if(window.location.hash != value){
								var sid = RegExp.$1;

								PLG.resetFocusedSprite();
								PLG.focusedSprite = $(sid);
								var region = PLG.getSpriteRegion(PLG.focusedSprite);
								region.style.border = "1px solid " + PLG.COLOR_FOCUSEDSPRITE;
								region.style.padding = "0px";
								
								PLG.ignoreFocuschecker = true;
								PLG.moveToSprite(sid, true);
								PLG.prevLocationHash = value;
								window.location.hash = value;
								PLG.viewPositionChangeHash = true;
							}
						}
						else{
							PLG.resetFocusedSprite();
							var vpArray = value.split(",");
							PLG.setViewPosition(vpArray[0], vpArray[1], true);
							PLG.viewPositionChangeHash = true;
						}
					}
				}
			}
		};
	}

	PLG.loaded = true;
	if(PARAM.positlogMode == "EditMode"){
		EDT.initialize();
	}
	else{
		// Execute draw command on sprites
		PLG.drawTimer = setInterval("PLG.execDrawCommand()", 10);
		PLG.startProcessingAnime();
	}

};

PLG.saveAnchorHistory = function(position){
	// "position" can be a spriteID or viewposition.
	var theDay = new Date();
	var time = theDay.getTime();
	if(PLG.anchorHistoryArray.length > 0 && !PLG.anchorHistory[PLG.anchorHistoryArray[PLG.anchorHistoryArray.length-1]].match(/#id_(.+)/) && !position.match(/#id_(.+)/)){
		time = PLG.anchorHistoryArray[PLG.anchorHistoryArray.length-1];
		PLG.anchorHistory[time] = position;
		if(PLG.anchorFrameQueue.length > 0){
			position = PLG.anchorFrameQueue.pop();
			time = theDay.getTime();
			$("plg_anchorframe").src = PARAM.SYSTEMPATH + "anchorframe.html?" + time;
			PLG.anchorHistory[time] = position;
			PLG.anchorHistoryArray.push(time);
		}
	}
	else{
		$("plg_anchorframe").src = PARAM.SYSTEMPATH + "anchorframe.html?" + time;
		PLG.anchorHistory[time] = position;
		PLG.anchorHistoryArray.push(time);
	}

};

PLG.ignoreFocuschecker = false;
PLG.focuschecker = function() {
	if(window.location.hash != PLG.prevLocationHash){
		if(PLG.ignoreFocuschecker){
			PLG.prevLocationHash = window.location.hash;
			PLG.ignoreFocuschecker = false;
			return;
		}
		if(PLG.browser.msie || PLG.browser.msie7){
			if(PLG.prevLocationHash == "" || PLG.prevLocationHash == "#"){
				if(window.location.hash != "" && window.location.hash != "#"){
					PLG.anchorFrameQueue.push(window.location.hash);
					PLG.saveAnchorHistory(PLG.viewPositionX + "," + PLG.viewPositionY);
				}
			}
			else{
				if(window.location.hash != "" && window.location.hash != "#"){
					PLG.saveAnchorHistory(window.location.hash);
				}
				else{
					PLG.saveAnchorHistory(PLG.viewPositionX + "," + PLG.viewPositionY);
				}
			}
		}
		if(window.location.hash.match(/#id_(.+)/)){
			var sid = RegExp.$1;
			PLG.viewPositionChangeHash = false;
			PLG.focusedSprite = $(sid);
			var region = PLG.getSpriteRegion(PLG.focusedSprite);
			region.style.border = "1px solid " + PLG.COLOR_FOCUSEDSPRITE;
			region.style.padding = "0px";

			PLG.moveToSprite(sid);
		}
	}
	PLG.prevLocationHash = window.location.hash;
};

PLG.setViewPositionCookie = function() {
	var date = new Date();
	var zoomArg = PLG.zoom;
	if(PLG.zoom != 1 && PLG.zoom == PLG.minimumzoom){
		zoomArg = "birdview";
	}
	var newVp = PARAM.pageid + "," + PARAM.positlogMode + "," + PLG.viewPositionX + "," + PLG.viewPositionY + "," + zoomArg + "," + date.getTime();
	var history = PLG.getCookie("viewposition");
	var historyArray = null;
	if(history !== undefined){
		historyArray = history.split(":");
	}
	else{
		historyArray = [];
	}
	var historyExists = false;
	for(var i=0; i<historyArray.length; i++){
		var vpArray = historyArray[i].split(",");
		if(vpArray[0] == PARAM.pageid){
			historyArray[i] = newVp;
			historyExists = true;
			break;
		}
	}
	if(!historyExists){
		if(historyArray.length >= 10){
			historyArray.shift();
			historyArray.push(newVp);
		}
		else{
			historyArray.push(newVp);
		}
	}
	PLG.setCookie("viewposition", historyArray.join(":"), PARAM.CGIFILEPATH, 0);
};


PLG.bodyLoaded = false;

function bodyOnLoad() {
	clearTimeout(PLG.bodyTimer);

	if(PLG.browser.msie || PLG.browser.msie7){
		G_vmlCanvasManager.init();
	}
	PLG.bodyLoaded = true;
}

window.onbeforeunload = function(e) {
// Opera 9.2 does not implement onbeforeunload.
	if(PARAM.positlogMode == "EditMode"){
		if(EDT.editor.mode != EDT.EDITOR_CLOSE || EDT.view.isPropertyDirty){
			return MESSAGE.PROPERTYNOTSAVED;
		}
	}
}

window.onunload = function(e) {
	PLG.setViewPositionCookie();
}

