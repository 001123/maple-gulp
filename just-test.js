var fs = require("fs");
var path = require("path");



function getDir(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

var template_arr = getDir(path.join(__dirname, "app/template"));

template_arr.forEach(i => {
    var sub_dir_arr = getDir(path.join(__dirname, "app/template/" + i));
    console.log(sub_dir_arr);
});
