package PositLogConfig;

# --------------------------------------------------------
# PositLogConfig.pm
#      global configuration file for PositLog
#  (tested under perl 5.8.4)
#
#  This file is part of PositLog.
# --------------------------------------------------------

#-------------------------------------------------------------------
# 以下の設定において挙げる例は，次のようなディレクトリ構成，
# サイト構成の場合について記述しています．
#
# /var/www/html/positlog/positlog.cgi
# /var/www/html/positlog/pages/
#
# http://xxx.com/positlog/positlog.cgi でPositLogへアクセス
#-------------------------------------------------------------------

#-------------------------------------------------------------------
# PositLogのルートURL
#（おわりの"/"を省略しないでください）
# 例）http://xxx.com/positlog/

$rooturl = "http://xxx.com/positlog/";

#-------------------------------------------------------------------
# ページデータ保存用ディレクトリ
# （positlog.cgiのあるディレクトリからの相対パスで指定してください）
# （positlog.cgiのあるディレクトリよりも下の場所を指定してください）
# （おわりの"/"を省略しないでください）
# 例) ./pages/

$datapath = "./pages/";

#-------------------------------------------------------------------
# 添付ファイルの最大バイト数
# シンプルエディタにおいて，スプライトの添付ファイルとしてアップロード可能な
# ファイルの最大サイズを指定します．バイト数で指定してください．
# 例）100キロバイトの場合，$uploadmax = 102400;
# 1メガバイトの場合　$uploadmax = 1048576;
# リッチエディタでは制限をつけることができません．

$uploadmax = 102400;

#-------------------------------------------------------------------
# システムやメッセージの言語
# 日本語: ja
# 英語: en

$language = "ja";

#-------------------------------------------------------------------
# インストール先サーバでのmod_rewriteの利用
#
# 可能: 1
# 不可能: 0
#
# 利用可能の場合，$mod_rewrite = 1; として，PositLogに付属のファイル
# htaccess_mod_rewrite を内容に問題がないか確認の上，
# .htaccess という名前でPositLogのルートURLに置いてください．
#
# mod_rewriteが利用可能なサーバでは，ページのURLの
# positlog.cgi?load=000000XX の部分を 000000XX.html で置き換えたり
# タグをmicroformatsのrel-tagに対応させることが出来るようになります．
#
# レンタルサーバなど自分がサーバの管理者でない場合，
# mod_rewriteが使えるかどうかは，どこかで別途調べてください．

$mod_rewrite = 0;

#-------------------------------------------------------------------
# gzip圧縮転送
#
# 可能: 1
# 不可能: 0
#
# サーバでgzipが利用できる場合，$gzip = 1; にすると
# positlog.cgi の出力するHTMLファイルをgzip圧縮して
# 転送量を減らすことができます．
# $gzippathには正しいパスを入力してください．

$gzip = 0;
$gzippath = "/bin/gzip";


#-------------------------------------------------------------------
# 添付ファイルのセキュリティ
#
# PositLogを用いてアップロードしたファイルは，通常，
# そのURLさえ判っていれば，誰でもアクセスすることができます．
#
# アカウントをもつユーザ以外にファイルが見えないようにするためには，
# ページデータ保存用ディレクトリ（$datapath）に，外部からhttpプロトコルで
# アクセス出来ない場所を指定する必要があります．$datapathは通常，
# positlog.cgiのあるディレクトリよりも下の場所を指定しますが，
# このようにファイルを隠したい場合はどの場所を指定しても構いません．
# ただし，ファイルアップロード機能を利用するために，次の手順で
# ファイルローダーを設置する必要があります．
#
# 1. まずmod_rewriteの利用できることが前提
# 2．以下のRewriteRuleを.htaccess 等に設定
#   (fileloader.cgiのパスは適当なものに変更してください)
#
#   RewriteRule ^(.*)([0-9]{6}[a-zA-Z]{2})(/Image/.+)$ /fileloader.cgi?page=$2&path=$3 [L]
#   RewriteRule ^(.*)([0-9]{6}[a-zA-Z]{2})(/File/.+)$ /fileloader.cgi?page=$2&path=$3 [L]
#
# 3．fileloader.cgi を positlog.cgiと同じディレクトリに設置（755）
# 4．以下の $filesecure の値を1にする．
#

$filesecure = 0;

# 以上でファイルアップロードが可能となります．ただし，ファイルへの
# アクセスがすべてCGIを経由するので若干遅くなります．
#
# 以上の設定が不可能なサーバの場合，または意味の判らない場合，
# $filesecure = 0 のままにしておいてください．
# この場合，アカウントをもつユーザ以外に見せたくないファイルのURLがばれない
# ように気をつけてください．あるいは，ページにBASIC 認証をつけてください．

# 設定が必要なのはここまでです．以下には手を加えないでください．

$positloghome = "http://positlog.org/";
$helpurl = "http://positlog.org/071208MM.html";

$rooturl =~ /^http:\/\/.+?(\/.*)$/;
$cgipath = $1;
$systempath = $cgipath . "system/";
$bgimagespath = "./bgimages/";
$bgimagesurl = $bgimagespath;
$adminpath = "./admindata/";
$admintoolscgipath = "./admintools/";
$admintoolsfilepath = "./admintools/";
$dataurl = $datapath;
$fckuploadurl = $cgipath . $datapath;
$fckconnector = $systempath . "fckeditor/editor/filemanager/connectors/perl/connector.cgi";
$fckuploader = $systempath . "fckeditor/editor/filemanager/connectors/perl/upload.cgi";
$rooturl =~ /^(http:\/\/.+?\/).*$/;
$site = $1;

1;
