//-------------------------------------------------
// lang_ja.js
// This file is part of PositLog.
//-------------------------------------------------

MESSAGE = new Object();
MESSAGE.FRAMESOLID = "実線";
MESSAGE.FRAMEDOUBLE = "二重線";
MESSAGE.FRAMEDOTTED = "点線";
MESSAGE.FRAMEDASHED = "破線";
MESSAGE.FRAMEGROOVE = "溝線";
MESSAGE.FRAMERIDGE = "稜線";
MESSAGE.FRAMEINSET = "陥没";
MESSAGE.FRAMEOUTSET = "浮上";

MESSAGE.ARROWCURVE = "曲線";
MESSAGE.ARROWCURVEREVERSE = "曲線2";
MESSAGE.ARROWSTRAIGHT = "直線";

MESSAGE.EDITOR_INVALIDPASSWORD = "正しいパスワードを入力して下さい．";
MESSAGE.EDITOR_ENTERPASSWORD = "パスワードを入力して下さい．";
MESSAGE.EDITOR_PASSWORDUNLOCKED = "パスワードは解除されました．";

MESSAGE.EDITOR_INPUTWIKIHTML = "下欄にWiki記法かHTMLを入力してください．";
MESSAGE.EDITOR_INPUTWIKI = "下欄にWiki記法を入力してください．";
MESSAGE.EDITOR_INPUTHTML = "下欄にHTMLを入力してください．";
MESSAGE.EDITOR_INPUTTEXT = "下欄に文章を入力してください．";
MESSAGE.EDITOR_SCRIPTAVAILABLE = "&nbsp;&lt;script&gt;&nbsp;利用可能．";
MESSAGE.EDITOR_AUTOLINK = " http:// は自動リンクされます．";

MESSAGE.EDITOR_FGCOLOR = "文字色";
MESSAGE.EDITOR_BGCOLOR = "背景色";
MESSAGE.EDITOR_FRAME = "枠色";
MESSAGE.EDITOR_PADDING = "余白";

MESSAGE.ENTERNEWPAGETITLE = "新しいページのタイトルを入力してください．";
MESSAGE.TITLEISNOTENTERED = "タイトルが入力されていません．";

MESSAGE.PERMISSIONDENIED = "許可がありません．";

MESSAGE.ARROWLINKSTART = "開始スプライトをクリックしてください．";
MESSAGE.ARROWLINKEND = "終了スプライトをクリックしてください．";

MESSAGE.SUCCEED = "成功しました.";
MESSAGE.SAVED = "保存しました.";

MESSAGE.TOOLARGE = "アップロード可能なファイルサイズの上限を超えています.";

MESSAGE.DIALOGDELETESPRITE = "このスプライトを削除してもよろしいですか？";
MESSAGE.DIALOGDELETESPRITES = "選択された全てのスプライトを削除します．よろしいですか？";

MESSAGE.CANNOTMOVE = "このスプライトは移動できません．";

MESSAGE.SUBMENU_CUT = "スプライトを切り取り";
MESSAGE.SUBMENU_COPY = "スプライトをコピー";
MESSAGE.SUBMENU_PASTE = "スプライトを貼付";
MESSAGE.SUBMENU_ALIAS = "エイリアスを貼付";
MESSAGE.SUBMENU_DELETE = "<span style='float:left'>削除</span><span style='float:right'>del</span>";
MESSAGE.SUBMENU_NEWSPRITE = "新規スプライト";
MESSAGE.SUBMENU_NEWPAGE = "新規ページ";
MESSAGE.SUBMENU_GROUP = "グループ化";
MESSAGE.SUBMENU_UNGROUP = "グループ解除";
MESSAGE.SUBMENU_SENDTOTOP = "最前面へ";
MESSAGE.SUBMENU_SENDTOBOTTOM = "最背面へ";
MESSAGE.SUBMENU_CONTEXTMENU = "ここを右クリックで通常メニュー";

MESSAGE.PROPERTYLABEL_ARROW = "矢印";
MESSAGE.PROPERTYLABEL_DRAWING = "手描き";
MESSAGE.PROPERTYLABEL_NORMAL = "スプライト";
MESSAGE.PROPERTYPADDINGLABEL = "余白";
MESSAGE.PROPERTYSTYLELABEL = "線種";
MESSAGE.PROPERTYWIDTHLABEL = "線幅";

MESSAGE.PROPERTYTEXTCOLOR = "文字色";
MESSAGE.PROPERTYBGCOLOR = "背景色";
MESSAGE.PROPERTYLINECOLOR = "線色";
MESSAGE.PROPERTYTRANSPARENCY = "透明";
MESSAGE.PROPERTYPALETTEOVERWRITE = "上書き";
MESSAGE.PROPERTYCANCOLORREGISTER = "クリックで登録";

MESSAGE.PROPERTYDRAWINGTOOL = "描画ツール";
MESSAGE.PROPERTYUNDODRAWING = "取り消し";

MESSAGE.PROPERTYNOTSAVED = "編集中のスプライトがまだ保存されていません．";

PLG.numberZenkakuToHankaku = function(numberStr){
	numberStr = numberStr.replace(/１/g, "1");
	numberStr = numberStr.replace(/２/g, "2");
	numberStr = numberStr.replace(/３/g, "3");
	numberStr = numberStr.replace(/４/g, "4");
	numberStr = numberStr.replace(/５/g, "5");
	numberStr = numberStr.replace(/６/g, "6");
	numberStr = numberStr.replace(/７/g, "7");
	numberStr = numberStr.replace(/８/g, "8");
	numberStr = numberStr.replace(/９/g, "9");
	numberStr = numberStr.replace(/０/g, "0");
	return numberStr;
}

PLG.fixTagField = function(str){
	str = str.replace(/，/g, ",");
	str = str.replace(/,[　\s]+/g, ",");
	str = str.replace(/,[　\s]+/g, ",");	
	str = str.replace(/[　\s]+,/g, ",");	
	str = str.replace(/[　\s]+$/g, "");	
	return str.replace(/^[　\s]+/g, "");
}