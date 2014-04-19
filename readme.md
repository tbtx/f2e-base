## 目录结构
	gallery: 功能独立的第三方库目录
	plugin: 第三方jQuery插件目录
	dist: 发布目录
	src: 源文件目录
	test: 测试目录

	Gruntfile.js: grunt配置文件
	package.json: 包配置文件
	tbtx.js: 最终生成的tbtx.js

## 目录规范

	尽量使用{{ name }}/{{ version }}/{{ name }}.js

## 版本格式

主版本号.次版本号.修订号，版本号递增规则如下：

1. 主版本号：当你做了不兼容的API 修改
2. 次版本号：当你做了向下兼容的功能性新增
3. 修订号：当你做了向下兼容的问题修正。

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


## 测试框架

* jasmine
* totoro

## 文档

[readthedoc](http://tbtx.readthedocs.org)


