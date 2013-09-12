/*****************************************
*	fileUpload.js 生成文件上传控件
*	superman_tbtx 2013-09-02 16:33
******************************************/
/**
*	url 上传接口地址
*/
var fileUpload = function(url){
	var TPLswap = function(tpl, params) {
		var str = tpl || '';
		if( typeof (params) == 'object') {
			for(var p in params) {
				str = str.replace(new RegExp('\{' + p + '\}', 'g'), params[p]);
			}
		}
		return str;
	};
	var tpl_file_box = '<div class="tbtx-file-upload-box"><div class="tbtx-file-upload-input"><form class="tbtx-file-upload-form" action="{url}" id="{fid}" target="{target}" enctype="multipart/form-data" method="post"><iframe src="" name="{target}" frameborder="0" style="width:0;height:0;border:0px solid #fff;"></iframe><input type="hidden" name="jtoken" value="" /><input type="file" multiple="multiple" name="file" /><a href="javascript:void(\'取消\');" class="tbtx-file-upload-cancel">取消</a></form><div class="tbtx-file-upload-waiting" style="display:none">正在上传中，请稍后...<a href="javascript:void(\'取消\');" class="tbtx-file-upload-cancel">取消</a></div></div></div>';
	
	var oe = {};
	oe.url = url;
	/**
	*	uploadCallback: 文件上传后回调方法
	*	cancelCallback: 取消操作的回调方法
	*/
	oe.show = function(uploadCallback,cancelCallback){
		var addItemByUpload = function(json) {				
				if(typeof(uploadCallback) == 'function'){
					uploadCallback(json, oe);
				}
				oe.popup.hide('fadeOut',function(){
					oe.hide();
				});
			};		
		var that = addItemByUpload, 
			random = (new Date()).getTime()+ Math.random().toString().substr(2), 			
			target = 'miframe' + random, 
			fid = 'form_' + random;
			
		oe.callFunc = 'tbtxFileUploaded' + random;
		
		var callFuncTemplate = 'window["{callFunc}"] = function(json){that(json);}';
		
		eval(TPLswap(callFuncTemplate, {callFunc : oe.callFunc}));
		
		oe.jObject = $(TPLswap(tpl_file_box, {
			fid : fid,
			url : oe.url + '?callFunc=' + oe.callFunc,
			target : target
		}));
		oe.popup = new tbtx.Popup(oe.jObject);
		
		$('.tbtx-file-upload-input input', oe.jObject).change(function() {
			$('.tbtx-file-upload-form', oe.jObject).submit().hide();
			$('.tbtx-file-upload-waiting', oe.jObject).show();			
		});
		$('.tbtx-file-upload-cancel', oe.jObject).click(function() {
			if(typeof(cancelCallback) == 'function'){
				cancelCallback(oe);
			}
			oe.popup.hide('fadeOut',function(){
				oe.hide();
			});
		});
		oe.jObject.appendTo('body');
		oe.popup.show();
		return oe;
	};
	oe.hide = function(){
		oe.jObject.remove();		
		window[oe.callFunc] = null;
		delete window[oe.callFunc];
		oe.jObject = oe.popup = oe.callFunc = null;
		return oe;
	};	
	return oe;
};