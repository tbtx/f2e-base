## 目录结构
	tbtx: 库文件所在目录
	component: 组件所在目录

	gallery: 第三方库目录
	jquery: jQuery所在目录
	doc: 文档目录
	node_modules: nodejs包目录，主要为grunt使用
	plugin: 第三方jQuery插件目录
	test: 测试目录

	Gruntfile.js: grunt配置文件
	package.json: 包配置文件
	tbtx.js: 最终生成的tbtx.js

## 	[Grunt](http://gruntjs.com/)安装

	安装nodejs(会安装npm)
	npm install -g grunt-cli 安装grunt客户端
	切到 Gruntfile和package.json所在目录，如果没有安装过项目依赖包则运行npm install，npm会把项目依赖包文件下载到node_modules文件夹下
	运行grunt

## grunt 插件

* jshint: js校验
* concat: 文件合并
* uglify: js压缩
* watch: 检测文件修改并执行相应任务

## tbtx.js
使用 tbtx.xx 对外只有一个接口

	(按顺序)
	seed.js: 库开始文件
	promise.js: es6 promise实现
	json2.js: JSON fix
	cache.js: 缓存
	lang.js: 语言扩展
	uri.js: url相关
	loader: 组件加载
	preload: fix无jQuery的环境
	cookie.js: cookie操作
	support.js: 浏览器支持fix
	date: 日期格式化
	detector.js: 嗅探
	events.js: 事件
	aspect.js: before & after
	attrs: attr操作
	widget: base & widget
	pin: 定位
	dom.js: dom操作
	path.js: 路径
	msg.js: 消息提醒
	miiee.js: miiee相关

## components
	templateable: 让组件使用模板

	overlay: 覆盖层
	draggable: 拖动
	sns: 分享到社交网络
	drop: 鼠标移上/click 显示对应内容
	pagination: 分页
	Popup: 弹出
	Drop: arale popup
	validator: 表单校验
	scrollspy: 滚动侦测
	soltMachine: 老虎机
	tip: arale tip
	lightbox: 幻灯片
	countDown: 倒计时
	switchable: 各种切换
	autocomplete: 自动完成

## 调整
	
	ES6 Promise实例 增加done,fail,always方法

## arale调整
	Widget移除自动render跟data-api, parseElementFromTemplate增加id, 增加renderMethod和relatedNode来扩展插入方式
	detector 增加mobile判断


## 测试框架

* jasmine
* totoro

## 文档

[readthedoc](http://tbtx.readthedocs.org)


