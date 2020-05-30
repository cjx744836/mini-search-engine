const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, './src/server/')
let txt = fs.readFileSync(filePath + '/router.js', 'utf-8');
function MyPlugin() {

}
MyPlugin.prototype.apply = function(compiler) {
  compiler.hooks.emit.tapAsync('replace-start', (compilation, callback) => {
        for(let file in compilation.assets) {
            replace(file.split('.')[0], '/js/' + file);
        }
      callback();
  });
  compiler.hooks.afterEmit.tapAsync('replace-complete', (compilation, callback) => {
      fs.writeFileSync(filePath + '/router.build.js', txt);
      callback();
  });
};

function replace(name, file) {
    let reg = new RegExp('\{\{\{' + name + '\}\}\}', 'gi');
    txt = txt.replace(reg, file);
}

module.exports = MyPlugin;