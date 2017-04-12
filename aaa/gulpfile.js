var gulp = require('gulp'),
    path = require('path'),
    webpack = require('webpack'),
    gulpWebpack = require('gulp-webpack'),
    gulpZip = require('gulp-zip'),
    del = require('del'),
    open = require('open'),
    fs = require('fs'),
    Q = require('q'),
    email = require('gulp-email'),
    mailer = require('nodemailer'),
    exec = require('child_process').exec,
    execSync = require('child_process').execSync,
    webpackDevServer = require('webpack-dev-server'),
    defaultSettings = require('./config/defaults.js'),
    webpackDevConfig = require('./config/webpack.config.js'),
    webpackDistConfig = require('./config/webpack.dist.config.js'),
    packageConfig = require('./config/package.js'),
    filePath = defaultSettings.filePath;

gulp.task('dev', function() {
    var compiler = webpack(webpackDevConfig);
    new webpackDevServer(compiler, {
        contentBase: './',
        historyApiFallback: true,
        hot: true,
        noInfo: false,
        publicPath: filePath.publicPath
    }).listen(defaultSettings.port, function(err) {
        console.log('listening: http://172.16.24.181:' + defaultSettings.port);
        console.log('Opening your system browser...');
        open('http://172.16.24.181:' + defaultSettings.port + '/webpack-dev-server/aaaPages/Test/index.html');
    })
});

gulp.task('clean', function(cb) {
    console.log('prebuild folder has been cleaned successfully');
    return del(['prebuild/**/*'], cb);
});

gulp.task('copyVerify', ['clean'], function() {
    return gulp.src('./MP_verify_hash.txt')
           .pipe(gulp.dest('prebuild/'));
})

gulp.task('zip', function() {
    return gulp.src('./package/**/*')
        .pipe(gulpZip('test.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('package', function() {
    return gulp.src(filePath.srcPath)
        .pipe(gulpWebpack(packageConfig))
        .pipe(gulp.dest('package/'));
});


gulp.task('build', ['checkPrebuild']);

gulp.task('default', ['dev']);

/* =======================================  */
/**
   grayDeploy
   steps:
   1. prebuild
   2. check ->(succ) next
            ->(fail) email
   3. readOldFiles
   4. copy
   5. getDiffSet
   6. delPerversionFiles
   7. check ->(succ) email
            ->(fail) email
   
*/


/* =======================================  */

/**
 * 1. prebuild(clean, copyVerify)
 */
gulp.task('prebuild', ['clean', 'copyVerify'], function() {
    return gulp.src(filePath.srcPath)
        .pipe(gulpWebpack(webpackDistConfig))
        .pipe(gulp.dest('prebuild/'));
});

/**
 * 2. checkPrebuild
 */
gulp.task('checkPrebuild', ['prebuild', 'copyPrebuildFiles'], function() {
    var defered = Q.defer();

    return deferedCheckPrebuild(function() {
        sendEmail({
            subject: 'aaa build task has been successfully completed on master branch.',
            html: '<p>Project aaa will be updated in a minute; Have a nice day! ;D  --sent from John </p>'
        });
    }, function() {
        defered.reject();
    });

    return defered.promise;
});

gulp.task('deferedCheckPrebuild', deferedCheckPrebuild);

function deferedCheckPrebuild(successFn, errorFn) {
    var defered = Q.defer();

    checkPrebuildFn(function() {
        execTaskAfterPreBuild(function(toDelFileListMap) {
            // copy and del
            copyNewBuiltFiles(function(stdout, stderr) {
                // 如果不是以war包的形式布在服务器上，这里可以做一个延时任务去剔除旧版本的文件
                var timeout = 1000;

                console.log('Source codes has been built successfully');
                console.log('Old files will be deleted in '+ parseInt(timeout/1000, 10) +' seconds...');

                setTimeout(function() {
                    delFilesByFileListMap(toDelFileListMap, function() {
                        successFn && successFn();
                        defered.resolve();
                    });
                }, timeout);
            });
        });
    }, function() {

        sendEmail({
            subject: 'build task failed at step checkPrebuildFn.',
            html: [
                '<p>Fail at:</p>',
                '<p>step: checkPrebuildFn</p>',
                '<p>Check your log carefully!</p>'
            ]
        });

        defered.reject();
        errorFn && errorFn();
    });

    return defered.promise;
}

gulp.task('copyPrebuildFiles', ['prebuild']);

function checkPrebuildFn(successFn, errorFn) {
    var countFileShellCMD = 'ls -al prebuild/ |grep "^-"|wc -l';
    var stdout = execSync(countFileShellCMD);
    var totalFileNums = parseInt(stdout, 10);

    console.log('totalFileNums', totalFileNums);

    if (totalFileNums <= 1) {
        errorFn && errorFn();
    } else {
        successFn && successFn();   
    }
}

function delFilesByFileListMap(map, callback) {
    var findFileShellCMD = 'find ./build -type f';
    var files = execSync(findFileShellCMD);
    var fileList = files.toString().split('\n');

    console.log('map', map);

    var targetList = [];
    for (var path in map) {
        var seperator = path == '/' ? '' : '/';
        var file2DelList = map[path];
        var list = file2DelList.map(function (file) {
            return [path, file].join(seperator);
        }).filter(function(listItem) {
            return listItem != '';
        });

        if(list.length && list[0] != '/') {
            console.log('concat list', list);
            targetList = targetList.concat(list);
        }
    }


    console.log('targetList', targetList);

    targetList.map(function(file) {
        var fileIndex = getIndexInList(file, fileList);
        if (fileIndex !== -1) {
            delFile(fileIndex, fileList);
        }
    });

    callback && callback();
}

function delFile(index, fileList) {
    var filename = fileList[index];
    var delFileShellCMD = ['rm -f', filename].join(' ');
    console.log('execSync shell script', delFileShellCMD);
    // delete files synchronizly
    execSync(delFileShellCMD);
    console.log(filename + ' has been deleted successfully...');
}

function getIndexInList(item, list) {
    for (var i = 0, l = list.length; i < l; i++) {
        if (item != '' && list[i].indexOf(item) >= 0) {
            return i;
        }
    }
    return -1;
}

function copyNewBuiltFiles(callback) {
    var copyFilesShellCMD = 'cp -r prebuild/* build';
    console.log('exec shell script ', copyFilesShellCMD);
    exec(copyFilesShellCMD, function(err, stdout, stderr) {
        if (err) {
            sendEmail({
                subject: 'build task failed at step copyNewBuiltFiles.',
                html: [
                    '<p>Fail at:</p>',
                    '<p>'+ copyFilesShellCMD +'</p>',
                    '<p>Check your log carefully!</p>'
                ]
            });
            throw err;
        }

        console.log(copyFilesShellCMD, 'successfully');

        callback && callback(stdout, stderr);
    });
}

function execTaskAfterPreBuild(callback) {
    var oldFileListShellCMD = 'find build -type f';
    var newFileListShellCMD = 'find prebuild -type f';
    var oldFileList = execSync(oldFileListShellCMD).toString().split('\n');
    var newFileList = execSync(newFileListShellCMD).toString().split('\n');

    oldFileList = delPathPrefix(oldFileList);
    newFileList = delPathPrefix(newFileList);

    console.log('oldFileList', oldFileList);
    console.log('newFileList', newFileList);

    // 生成最终要移除的文件列表
    var toDelFileListMap = getDiffSetFileList(oldFileList, newFileList);

    callback && callback(toDelFileListMap);
}

/**
 * [getDiffSetFileList 根据新的文件列表生成一个差集列表，差集用于灰度部署]
 * @Author   JohnNong
 * @Email    overkazaf@gmail.com
 * @Github   https://github.com/overkazaf
 * @DateTime 2016-12-19T11:56:11+0800
 * @param    {[type]}                     oldFiles [description]
 * @param    {[type]}                     newFiles [description]
 * @return   {[type]}                              [description]
 */
function getDiffSetFileList(oldFiles, newFiles) {
    var mapOld = getDirMap(oldFiles);
    var mapNew = getDirMap(newFiles);

    // 根据差异信息生成要删除的文件数组
    var fileListMap = {};
    for (var attr in mapOld) {
        var oldList = mapOld[attr] || [];
        var newList = mapNew[attr] || [];
        var delList = calcDelList(oldList, newList);
        if (!fileListMap[attr]) {
            fileListMap[attr] = [];
        }
        fileListMap[attr] = fileListMap[attr].concat(delList);

        console.log('fileListMap['+ attr +']', fileListMap[attr]);
    }

    return fileListMap;
}

function calcDelList(oldList, newList) {
    var flag = isSameList(oldList, newList);
    if (flag) {
        return [];
    } else {
        // 过滤新旧数组中的新数组无素
        // FIXME
        var list = oldList.filter(function(old) {
            // 往回true的被选中
            // 这里要在oldList中剔除掉newList中已经存在的元素
            return !elementInList(old, newList);
        });

        return list;
    }
}

function elementInList(el, list) {
    for (var i = 0, l = list.length; i < l; i++) {
        var cur = list[i];
        if (cur === el) {
            return true;
        }
    }

    return false;
}

function isSameList(list1, list2) {
    var l1 = list1 && list1.length || 0;
    var l2 = list2 && list2.length || 0;
    var flag = false;
    if (l1 == l2) {
        var tmpArray = [];
        for (var i = 0; i < l1; i++) {
            var tmpFlag = 0;
            for (var j = 0; j < l2; j++) {
                if (list1[i] == list2[j]) {
                    tmpFlag = 1;
                    break;
                }
            }
            tmpArray.push(tmpFlag);
        }

        flag = isWholeOneArray(tmpArray);
    }

    return flag;
}

function isWholeOneArray(arr) {
    if(!arr.length) {
        return false;
    }

    for (var i = 0, item; item = arr[i++];) {
        if (item !== 1) {
            return false;
        }
    }
    return true;
}

function getDirMap(list) {
    var map = {};

    list.map(function(item) {
        var itemArray = item.split('/');
        var fileInfo = getFileInfo(itemArray);

        if (!map[fileInfo.folder]) {
            map[fileInfo.folder] = [];
        }
        map[fileInfo.folder].push(fileInfo.filename);
    });

    return map;
}

function getFileInfo(itemArray) {
    var info = {};
    var l = itemArray.length;
    var folder,
        filename;
    if (l === 1) {
        folder = '/';
        filename = itemArray[0];
    } else {
        filename = itemArray.pop();
        folder = itemArray.join('/');
    }

    info['folder'] = folder;
    info['filename'] = filename;

    return info;
}

function delPathPrefix(list) {
    return list.map(function(item) {
        var itemArray = item.split('/');
        itemArray.shift();
        return itemArray.join('/');
    }).filter(function(listItem) {
        return listItem != '';
    });
}

gulp.task('sendEmail', sendEmail);

/**
 * [sendEmail 执行gulp任务后， 按结果发送email]
 * @Author   JohnNong
 * @Email    overkazaf@gmail.com
 * @Github   https://github.com/overkazaf
 * @DateTime 2016-12-19T10:46:29+0800
 * @param    {[type]}                     EmailOptions [description]
 * @param    {[type]}                     EmailConfig  [description]* 
 * @return   {[type]}                                  [description]
 */
function sendEmail(EmailOptions, EmailConfig) {

    return;

    var config = EmailConfig || {
        "host": "smtp.exmail.qq.com",
        "secureConnection": false,
        "port": 465,
        "auth": {
            "user": "admin@domain.com",
            "pass": "*******"
        }
    };

    var transporter = mailer.createTransport("SMTP", config);

    var mail = {
        from: 'admin@domain.com',
        to: [
                'receiver@domain.com',
            ].join(','),
        subject: EmailOptions.subject || 'test',
        html: EmailOptions.html || 'nodemailer test from gulp'
    };

    transporter.sendMail(mail, function(error, response) {
        if (error) {
            throw error;
        } else {
            console.log('mail has been successfully sent');
            // end node process
            process.exit(0);
        }
    });
}

