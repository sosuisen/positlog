//-------------------------------------------------
// drawingonlist.js
//
// This file is part of PositLog.
//-------------------------------------------------

var PLG = new Object();
PLG.zoom = 1.0;

drawCommand = new Array();

//-------------------------
// Drawing
//-------------------------
function execDrawCommand(){
	if(drawCommand.length > 0){
		var cmd = drawCommand.shift();
		var cmdArray = cmd.split(",");
		if(cmdArray[0] == "shape"){
			var id = cmdArray[2] + "_" + cmdArray[3] + "_link_canvas";
			var canvas = document.getElementById(id);
			if(canvas){
				canvas.parentNode.innerHTML = "Arrow";
			}
			setTimeout("execDrawCommand()", 10);
			return;
		}
		var canvas = document.getElementById(cmdArray[0]);
		if(!canvas.getContext){
			return;
		}
		if(!canvas){
			setTimeout("execDrawCommand()", 10);
			return;
		}


		if(cmdArray[1] == "l"){
			var ctx = canvas.getContext("2d");
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

			ctx.moveTo(parseInt(cmdArray[startIndex-2]),parseInt(cmdArray[startIndex-1]));

			for(var i=startIndex; i<cmdArray.length; i++){
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
					ctx.moveTo(parseInt(cmdArray[i]),parseInt(cmdArray[i+1]));
				}
				else{
					ctx.lineTo(parseInt(cmdArray[i]),parseInt(cmdArray[i+1]));
				}

				i++;
			}
			ctx.stroke();
		}
		setTimeout("execDrawCommand()", 10);
		return;
	}

}

var PLG = {};
PLG.draw = function(cmd){
	drawCommand.push(cmd);
}

function bodyOnLoad(){
	var cb = new chkAjaBrowser();
	if(cb.bw.msie || cb.bw.msie7){
		G_vmlCanvasManager.init();
	}
	setTimeout("execDrawCommand()", 10);
}


function chkAjaBrowser() {
	var a, ua = navigator.userAgent;
	this.bw = {
		iemobile : (navigator.appName == 'Microsoft Pocket Internet Explorer'),
		safari : ua.match(/AppleWebKit/gi) != null || ((a = ua.split('Konqueror/')[1]) ? a.split(';')[0] : 0) >= 3.3,
		konqueror : ((a = ua.split('Konqueror/')[1]) ? a.split(';')[0] : 0) >= 3.3,
		mozes : ((a = ua.split('Gecko/')[1]) ? a.split(' ')[0] : 0) >= 20011128,
		opera : (!!window.opera) && ((typeof XMLHttpRequest) == 'function'),
		msie7 : (!!window.ActiveXObject) ? ((typeof XMLHttpRequest) == 'object') : false,
		msie : (!!window.ActiveXObject) ? (!!createHttpRequest()) && ((typeof XMLHttpRequest) != 'object') : false
	}
	return (this.bw.safari || this.bw.konqueror || this.bw.mozes || this.bw.opera || this.bw.msie)
}

function createHttpRequest() {
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
}
