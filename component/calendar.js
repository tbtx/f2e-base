/**
*	日历控件 
*	superman_tbtx 2013-11-15
*/
(function(){
	function Calendar(date){
		this.init(date);
		this.startYear = 1970;
		this.endYear = 2050;
		this.today = new Date();
	}
	Calendar.prototype.init = function(D){
		var _date = (D && D.constructor==Date) ? D : new Date();
		this.year = _date.getFullYear();
		this.month = _date.getMonth();
		this.date = _date.getDate();
		this.day = _date.getDay();
		this.isLeapYear = Calendar.isLeapYear(this.year);
		this.isToday = (D && D.constructor==Date) ? Calendar.isToday(D) : true;
	};
	Calendar.isToday = function(D){
		var d = new Date();
		return d.getFullYear() == D.getFullYear() && d.getMonth() == D.getMonth() && d.getDate() == D.getDate();
	};
	Calendar.isLeapYear = function(iYear) {//是否是闰年
		if (iYear % 4 == 0 && iYear % 100 != 0) {
			return true;
		}else {
			if (iYear % 400 == 0) {
				return true;
			}else{
				return false;
			}
		}
	};
	Calendar.toFormatString = function(date,format){
		var sf = format || '{{YYYY}}-{{MM}}-{{DD}}';
		var d = {
				YYYY : date.year || date.getFullYear(),
				MM : (date.month || date.getMonth())+1,
				DD : date.date || date.getDate()
			};
		d.MM = d.MM<10?'0'+d.MM:d.MM;
		d.DD = d.DD<10?'0'+d.DD:d.DD;
		return tbtx.substitute(sf,d);
	};
	
	Calendar.prototype.show = function(J,D,F){
		if(D){
			this.init(D);
		}
		var template = '<div class="tbtx-calendar"><div class="tbtx-calendar-header"><span>{{year}}年</span><span>{{month}}月</span><span><a class="tbtx-calendar-action-today" href="javascript:void(\'today\')">今天</a></span></div><table class="tbtx-calendar-day-table"><thead><tr>{{dayHeader}}</tr></thead><tbody>{{date}}</tbody></table><div class="tbtx-calendar-footer"></div></div>',
			dateItem = '<td class="tbtx-calendar-week-{{week}} {{cla}}" data-week="{{week}}" data-value="{{value}}" data-year="{{year}}" data-month="{{month}}" data-date="{{date}}">{{date}}</td>',			
			select = '<select class="tbtx-calendar-{{cla}}" value="{{value}}">{{options}}</select>';
		//生成年的HTML
		var yearHTML = '';
		for(var i = this.startYear; i <= this.endYear; i++){
			yearHTML += '<option value="'+i+'" '+(i == this.year ? 'selected' : '')+'>'+i+'</option>';			
		}
		yearHTML = tbtx.substitute(select,{
			cla : 'year',
			value : this.year,
			options : yearHTML
		});
		//生成月的HTML
		var monthHTML = '';
		for(var i = 0; i < 12; i++){
			monthHTML += '<option value="'+(i)+'" '+( i== this.month?'selected':'')+'>'+(i+1)+'</option>';			
		}
		monthHTML = tbtx.substitute(select,{
			cla : 'month',
			value : this.today.getMonth(),
			options : monthHTML
		});
		//生成日期表头HTML
		var dayHeader = '',
			weeks = ['日','一','二','三','四','五','六'];			
		for(var i in weeks){
			dayHeader += '<th class="tbtx-calendar-week-'+i+'">'+weeks[i]+'</th>';
		}
		var months = [31,28,31,30,31,30,31,31,30,31,30,31];
		if(this.isLeapYear){
			months[1] = 29;
		}
		//生成日期表
		var days = [];
		var week = (new Date(this.year, this.month, 1)).getDay();
		for(var i = 0;i<months[this.month];i++){			
			days.push({
				week : (week + i) % 7,
				year : this.year,
				month : this.month,
				date : i+1,
				value : Calendar.toFormatString(new Date(this.year,this.month,i+1)),
				cla : 'tbtx-calendar-current-month'
			});
		}				
		if(week){ //不是从周日开始，补上上一个月的最后几天日期
			var upMonth = this.month-1;
			upMonth = upMonth<0?11:upMonth;
			var upYear = upMonth > this.month ? this.year-1 : this.year;			
			for(var i = week; i>0; i--){				
				days.unshift({
					week : i-1,
					year : upYear,
					month : upMonth,
					date : months[upMonth]+i-week,
					value : Calendar.toFormatString(new Date(upYear,upMonth,months[upMonth]+i-week)),
					cla : 'tbtx-calendar-up-month'
				})
			}
		}
		//本月的最后一天
		week = (new Date(this.year, this.month, months[this.month])).getDay();
		if(week != 6){ //最后一天不是周六的话，补上下个月的头几天
			var nxMonth = this.month+1;
			nxMonth = nxMonth>11?0:nxMonth;
			var nxYear = nxMonth < this.month ? this.year + 1 : this.year;
			for(var i = week; i<=6; i++){				
				days.push({
					week : i+1,
					year : nxYear,
					month : nxMonth,
					date : i-week+1,
					value :Calendar.toFormatString(new Date( nxYear,nxMonth,i-week+1)),
					cla : 'tbtx-calendar-down-month'
				})
			}
		}
		var daysHTML = '',weeksHTML = '';
		
		for(var i in days){
			daysHTML += tbtx.substitute(dateItem,days[i]);
			if(i%7==6){
				weeksHTML += '<tr>'+daysHTML+'</tr>';
				daysHTML = '';
			}
		}
		var html = tbtx.substitute(template,{
			year : yearHTML,
			month : monthHTML,
			date : weeksHTML,
			dayHeader : dayHeader
		});
		J.empty().append(html);
		this.jObject = $('.tbtx-calendar',J);		
		//今天
		$('td[data-value="'+Calendar.toFormatString(this.today)+'"]',this.jObject).addClass('tbtx-calendar-today');
		//当前日期
		
		$('td[data-value="'+Calendar.toFormatString(new Date(this.year,this.month,this.date))+'"]',this.jObject).addClass('tbtx-calendar-current-day');
		
		var _this = this;
		var chang = function(){
			var year= parseInt(yearObj.val());			
			var month = parseInt(monthObj.val());
			var date = parseInt($('.tbtx-calendar-current-day',_this.jObject).text());	
			_this.show(J, new Date(year,month,date));
			
		};		
		var yearObj = $('.tbtx-calendar-year',this.jObject).on('change',chang);
		var monthObj = $('.tbtx-calendar-month',this.jObject).on('change',chang);
		
		$('td',this.jObject).click(function(){
			var obj = $(this);
			_this.year = parseInt(obj.data('year'));
			_this.month = parseInt(obj.data('month'));
			_this.date = parseInt(obj.data('date'));
			if(typeof(_this.select) === 'function'){			
				_this.select.call(_this,{oldValue:D,newValue:new Date(_this.year,_this.month,_this.date)});
			}
			//_this.hide();
		});
		
		
		$('.tbtx-calendar-action-today',this.jObject).click(function(){
			var date = new Date();
						
				if(typeof(_this.select) === 'function'){					
					_this.select.call(_this,{oldValue:D,newValue:date});
				}
				//_this.hide();
				
		});
		
		if(typeof(F) === 'function'){
			F.call(this);
		}
		if(typeof(this.showCallback) == 'function'){
			this.showCallback.call(this);
		}
		
	};
	Calendar.prototype.hide = function(F){		
			this.jObject.remove();
			if(typeof(F)=="function"){
				F.call(this);
			}
			if(typeof(this.hideCallback) === 'function'){
				this.hideCallback.call(this);
			}
		
	};
	
	var jQuery_Extend_Calendar = function(){
			return this.each(function(){
				var $this = $(this);
				var flag = false;
				var cc = $('<div class="calendar-container"></div>');	
				var hideCallback = function(){
						$this.removeClass('J-Calendar-Show')//.blur();
						cc.remove();
						$(document).off('mousewheel',hide).off('click',hide);
						flag = false;
					};
				var hide = function(){						
						if(!flag){
							c.hide(hideCallback);
						}
					};
				var c = new Calendar();	
				c.select = function(json){					
					$this.val(Calendar.toFormatString(json.newValue));
					$this.trigger('change');						
					this.hide(hideCallback);
				};
				$this.on('focus click',function(){
					if($this.hasClass('J-Calendar-Show')){
						return;
					}
					$this.addClass('J-Calendar-Show');	
					flag = true;
					var css = {
							top : ($this.offset().top+$this.outerHeight() - parseInt($this.css('border-bottom-width')))+'px',
							left:$this.offset().left+'px',
							position: 'absolute'
						};
					cc.appendTo('body').css(css);
					var val = $(this).val();
					var dd = new Date();
					if(/^[\d]{4}\-[\d]{1,2}\-[\d]{1,2}$/gi.test(val)){
						val = val.split('-');
						for(i=0;i<3;i++){
							val[i] = parseInt(val[i]);
						}
						dd = new Date(val[0],val[1]-1,val[2]);
					}
					c.show(cc,dd,function(){
						$(document).on('mousewheel',hide).on('click',hide);		
						this.jObject.hover(function(){
							$this.addClass('J-mouse-over-popup');
						},function(){
							$this.removeClass('J-mouse-over-popup');
						})
					});
					cc.hover(function(){
						flag = true;
					},function(){
						flag = false;
					});					
				}).hover(function(){
					
				},function(){
					flag = false;					
				}).blur(function(){
					if(!flag){
						c.hide(hideCallback);
					}
				}).keydown(function(e){
					if(e.keyCode == 9){
						c.hide(hideCallback);
					}
				});
			});
			
		};
		
	$.fn.extend({
		Calendar : jQuery_Extend_Calendar
	});
	$(function(){
		$('.J-AutoInit-Calendar').Calendar().removeClass('J-AutoInit-Calendar');
		$(document).on('click','.J-AutoInit-Calendar',function(){
			$(this).Calendar().removeClass('J-AutoInit-Calendar').focus();
		})
	})	
})(jQuery);