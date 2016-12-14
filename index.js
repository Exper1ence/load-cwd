/**
 * Created by Exper1ence on 2016/12/14.
 */
const Fs = require('fs');
const Path = require('path');
const _ = require('lodash');
const type = require('typical-function');

const ignore = [/index/, /^_/];
const requirement = [/\.js/];

function directoryError(directory) {
    throw new Error(`No such directory, scandir '${directory}'.`);
}

function forEachModule(directory, filenames, cb) {
    if (_.isUndefined(filenames)) directoryError(directory);
    filenames.forEach((filename) => {
        for (let ig of ignore) {
            if (ig.test(filename))return;
        }
        for (let re of requirement) {
            if (!re.test(filename))return;
        }
        try {
            cb(require(Path.resolve(directory, filename)), filename);
        }
        catch (e) {
        }
    });
}
function getResult(directory, filenames, options) {
    if (options.dictionary) {
        const dic = {};
        forEachModule(directory, filenames, (module, name) => {
            dic[name.replace(requirement[0], '')] = module;
        });
        return dic;
    }
    else {
        const arr = [];
        forEachModule(directory, filenames, (module) => {
            arr.push(module);
        });
        return arr;
    }
}

module.exports = type(String, function load_cwd(directory, options = {}) {
    options = Object.assign({}, options);
    if (options.async) {
        return new Promise((resolve, reject) => {
            Fs.readdir(directory, (err, filenames) => {
                if (err) reject(err);
                resolve(getResult(directory, filenames, options));
            })
        });
    }
    else {
        try {
            const filenames = Fs.readdirSync(directory);
            return getResult(directory, filenames, options);
        }
        catch (e) {
            directoryError(directory);
        }
    }
});