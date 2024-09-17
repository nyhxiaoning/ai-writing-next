const fs = require("fs");
const path = require("path");

/**
 * 从文件名中删除前缀，只保留文件名和扩展名。
 * @param {string} filename - 完整的文件名（例如：resized-1726068669695-白露.jpeg）
 * @returns {string} - 去掉前缀后的文件名（例如：白露.jpeg）
 */
function getCleanFilename(filename) {
  const parsedPath = path.parse(filename);
  const nameParts = parsedPath.name.split("-");
  const cleanName = nameParts.slice(-1).join("");
  return `${cleanName}${parsedPath.ext}`;
}

/**
 * 扫描当前文件夹下的图片文件，并处理文件名。
 */
function processImageFiles() {
  const directoryPath = __dirname; // 当前目录
  const supportedExtensions = [".jpeg", ".jpg", ".png"]; // 支持的图片格式

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Failed to list contents of directory: ", err);
      return;
    }

    // 遍历目录中的所有文件
    files.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      if (supportedExtensions.includes(ext)) {
        const cleanFilename = getCleanFilename(file);
        fs.renameSync(path.join(directoryPath, file), path.join(directoryPath, cleanFilename), (err) => {
            if (err) {
            console.error(`Failed to rename file ${file}: `, err);
          }
          
        })
        console.log(`Original: ${file} => Cleaned: ${cleanFilename}`);
      }
    });
  });
}

// 运行处理函数
processImageFiles();
