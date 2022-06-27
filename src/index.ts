import picgo from 'picgo';
import webp from 'webp-converter';
import fs from 'fs';
import path from 'path';

const PLUGIN_NAME = 'webp';

/**
 * @description: 改变文件路径后缀名
 * @return {string}
 * @param {string} filepath
 * @param {string} outExt
 */
const changeExt = (filepath: string, outExt: string) => {
  const fp = path.normalize(filepath);
  const pathObj = path.parse(fp);
  pathObj.ext = outExt;
  delete pathObj.base;
  return path.format(pathObj);
};

const beforeTransformPlugins = {
  async handle(ctx: picgo) {
    const [tempPath] = ctx.input;
    if (path.extname(tempPath) === '.webp') {
      return ctx.input;
    }
    const input = changeExt(tempPath, '.webp');
    try {
      await webp.cwebp(ctx.input, input, '-q 80', '-v');
      ctx.input = [input];
      return ctx;
    } catch (error) {
      ctx.log.error(error);
      ctx.emit('notification', {
        title: '转webp错误',
        body: error
      });
    }
  }
};

const afterUploadPlugins = {
  handle(ctx: picgo) {
    ctx.input.forEach(p => {
      fs.unlinkSync(p);
    });
  }
};

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.beforeTransformPlugins.register(PLUGIN_NAME, beforeTransformPlugins);
    ctx.helper.afterUploadPlugins.register(PLUGIN_NAME, afterUploadPlugins);
  };
  return {
    register
  };
};
