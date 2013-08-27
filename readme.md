所有文档均为markdown格式，windows下安装[MarkdownPad](http://markdownpad.com/download.html)

## 目录结构
	tbtx: 库文件所在目录
	component: 组件所在目录
	
	gallery: 第三方库目录
	jquery: jQuery所在目录
	doc: 文档目录
	log: 升级日志目录
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
* cssmin: css压缩
* concat: 文件合并
* uglify: js压缩
* watch: 检测文件修改并执行相应任务

## tbtx.js
使用 tbtx.xx 对外只有一个接口
	
	(按顺序)
	seed.js 库开始文件
	lang.js 语言扩展
	cookie.js cookie操作
	detector.js 嗅探
	dom.js dom操作
	path.js 请求路径
	miiee.js miiee相关

## components
	
	overlay 覆盖层
	Popup 弹出

## 测试框架jasmine


