const gulp = require("gulp");
const clean = require("gulp-clean");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const obfuscator = require("gulp-javascript-obfuscator"); //用于js代码混淆
const concat = require("gulp-concat");
const gzip = require("gulp-gzip");
const cleanCSS = require('gulp-clean-css'); //gulp-minify-css已失效

//clean：清理dist目录中生成的文件
gulp.task('clean', function() {
	return gulp.src('dist')
		.pipe(clean())
});

gulp.task("minify-js", function() {
	return gulp.src("plugins/*.js")
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(uglify({
			mangle: true,
			compress: true
		}))
		//用于js代码混淆
		//.pipe(obfuscator())
		.pipe(gulp.dest("dist/plugins"));
});

gulp.task("minify-js-main", function() {
	return gulp.src(["uix.easyui-lang-zh_CN.js", "uix.easyui.extend.js"])
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(uglify({
			mangle: true,
			compress: true
		}))
		//用于js代码混淆
		//.pipe(obfuscator())
		.pipe(gulp.dest("dist"));
});

gulp.task("concat-js", function() {
	let plugins = ["dist/plugins/uix.daterangebox.min.js", "dist/plugins/uix.comboricheditor.min.js",
		"dist/uix.easyui-lang-zh_CN.min.js",
		"dist/uix.easyui.extend.min.js"
	];
	return gulp.src(plugins)
		.pipe(concat('uix.easyui.all.min.js')) // 合并匹配到的js文件并命名为"all.js"
		.pipe(gulp.dest('dist'));
});

gulp.task("gzip-js", function() {
	return gulp.src("dist/uix.easyui.all.min.js")
		.pipe(gzip())
		.pipe(gulp.dest("dist"));
});

gulp.task('all-js', gulp.series("minify-js", "minify-js-main", "concat-js", "gzip-js", function(cb) {
	console.log("js构建任务完成");
	cb();
}));

//css任务
gulp.task("minify-css", function() {
	return gulp.src(["css/*.css", "themes/default/*.css"])
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(cleanCSS())
		.pipe(gulp.dest("dist/css"));
});

gulp.task("concat-css", function() {
	let comps = ["reset", "basic", "easyui.fix"];
	let mins = comps.map((t) => "dist/css/uix." + t + ".min.css");
	return gulp.src(mins)
		.pipe(concat('uix.easyui.all.min.css'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task("gzip-css", function() {
	return gulp.src("dist/css/uix.easyui.all.min.css")
		.pipe(gzip())
		.pipe(gulp.dest("dist/css"));
});

gulp.task('all-css', gulp.series("minify-css", "concat-css", "gzip-css", function(cb) {
	console.log("css构建任务完成");
	cb();
}));

//图片复制任务

//默认任务，启动入口
gulp.task("default", gulp.series("clean", "all-js", "all-css", function(cb) {
	console.log("总构建任务完成");
	cb();
}));
