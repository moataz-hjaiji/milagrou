"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreeFolder = exports.createFolder = exports.getFileType = void 0;
const fs_1 = __importDefault(require("fs"));
const getFileType = (filename, mimetype) => {
    let ext;
    if (mimetype) {
        ext = mimetype.split('/')[1];
    }
    else {
        ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'jfif':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
            return 'image';
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'm4a':
            return 'audio';
        case 'mp4':
        case 'avi':
        case 'webm':
        case 'wmv':
        case 'flv':
            return 'video';
        case 'pdf':
            return 'document';
        case 'doc':
        case 'docx':
            return 'word';
        case 'xls':
        case 'xlsx':
        case 'csv':
            return 'excel';
        case 'ppt':
        case 'pptx':
            return 'powerpoint';
        default:
            return 'unknown';
    }
};
exports.getFileType = getFileType;
const createFolder = (folderpath) => {
    if (!fs_1.default.existsSync(folderpath)) {
        fs_1.default.mkdirSync(folderpath);
    }
};
exports.createFolder = createFolder;
const createTreeFolder = (folderpath) => {
    const folders = folderpath.split('/');
    let folder = '';
    folders.forEach((f) => {
        folder += `${f}/`;
        (0, exports.createFolder)(folder);
    });
};
exports.createTreeFolder = createTreeFolder;
//# sourceMappingURL=file.utils.js.map