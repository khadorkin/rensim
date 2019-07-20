import * as fs from "fs";
import tempfile from 'tempfile';
import { spawn } from "child-process-promise";
import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';

import { Theme } from "../../src/shared/selectors/themeSelectors";
import { Stack, StackForRendering } from "../../src/types";
import { connectionImages, puyoImages } from "../../src/shared/assets/puyoImages";
import { HistoryRecord } from "../../src/shared/models/history";
import { getStackForRendering } from "../../src/shared/models/stack";
import { getDropPlan, getVanishPlan } from "../../src/shared/models/chainPlanner";

const cross = require('../../assets/cross.png');
import { performance } from 'perf_hooks';

import ffmpeg from 'ffmpeg-static';

const fieldRows = 13;
const fieldCols = 6;

let assetCache = {};

async function loadImageWithCache(asset: any) {
  if (!(asset in assetCache)) {
    assetCache[asset] = await loadImage(asset);
  }
  return assetCache[asset];
}

export default class FieldImageRenderer {

  puyoSize = 16;
  margin = 3;

  puyoSkin: string;
  theme: Theme;

  canvas: Canvas;
  context: CanvasRenderingContext2D;

  constructor(theme: Theme, puyoSkin: string) {
    this.theme = theme;
    this.puyoSkin = puyoSkin;

    const fieldWidth = this.puyoSize * 6;
    const fieldHeight = this.puyoSize * 13;

    this.canvas = createCanvas(
      fieldWidth + this.margin * 2,
      fieldHeight + this.margin * 2);

    this.context = this.canvas.getContext('2d');
    if (this.context === null) {
      throw new Error('Failed to get canvas context');
    }

  }

  async renderVideo(history: HistoryRecord[]) {
    let filePrefix = tempfile();
    let fileCount = 0;
    const renderAndSave = async (stack: Stack) => {
      const renderingStack = getStackForRendering(stack, []);
      await this.renderStack(renderingStack, this.margin, this.margin);
      const f = filePrefix + String(fileCount++).padStart(5, '0') + '.png';
      fs.writeFileSync(f, this.canvas.toBuffer('image/png'));
    };

    const time1 = performance.now();

    for (const record of history) {
      const stack = record.stack;
      await renderAndSave(stack);

      // run chains
      while (true) {
        const dropPlans = getDropPlan(stack, fieldRows, fieldCols);
        if (dropPlans.length > 0) {
          await renderAndSave(stack);
        }

        const vanishPlans = getVanishPlan(stack, fieldRows, fieldCols);
        if (vanishPlans.length > 0) {
          await renderAndSave(stack);
        } else {
          break;
        }
      }
    }

    const time2 = performance.now();

    const outputFile = tempfile('.mp4');
    const spawnResponse = spawn(
      ffmpeg.path,
      ['-framerate', '3', '-i', filePrefix + '%05d.png', '-vcodec', 'libx264', '-pix_fmt', 'yuv420p', '-sws_flags', 'neighbor', '-vf', '"scale=408:-1"', outputFile],
      { shell: true });

    let ffmpegOutput = '';
    spawnResponse.childProcess.stdout.on('data', data => {
      ffmpegOutput += '[spawn] stdout: ' + data.toString() + '\n';
    });
    spawnResponse.childProcess.stderr.on('data', data => {
      ffmpegOutput += '[spawn] stderr: ' + data.toString() + '\n';
    });

    await spawnResponse;

    const time3 = performance.now();

    console.info("Ffmpeg finished: \n" + ffmpegOutput);
    console.info("Tick", time2 - time1, time3 - time2);

    return fs.readFileSync(outputFile);
  }

  async renderField(stack: Stack) {
    const renderingStack = getStackForRendering(stack, []);
    await this.renderStack(renderingStack, this.margin, this.margin);

    const f = tempfile('.gif');
    fs.writeFileSync(f, this.canvas.toBuffer('image/png'));

    await spawn(
      'convert',
      ['-sample', '200%', f, f]);

    return fs.readFileSync(f);
  }

  async renderStack(stack: StackForRendering, x: number, y: number) {
    const fieldWidth = this.puyoSize * 6;
    const fieldHeight = this.puyoSize * 13;

    this.context.fillStyle = this.theme.themeColor;
    this.context.fillRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height);

    this.context.fillStyle = this.theme.themeLightColor;
    this.context.fillRect(
      x,
      y,
      fieldWidth,
      fieldHeight);

    // draw cross
    {
      const img = await loadImageWithCache(cross);
      this.context.drawImage(img,
        x + this.puyoSize * 2, y + this.puyoSize,
        this.puyoSize, this.puyoSize);
    }

    for (let i = 0; i < fieldRows; i++) {
      for (let j = 0; j < fieldCols; j++) {
        const resource = puyoImages[this.puyoSkin][stack[i][j].color];
        if (resource !== null) {
          const img = await loadImageWithCache(resource);
          this.context.drawImage(
            img,
            x + this.puyoSize * j,
            y + this.puyoSize * i,
            this.puyoSize,
            this.puyoSize);
        }
      }
    }

    for (let i = 0; i < fieldRows; i++) {
      for (let j = 0; j < fieldCols; j++) {
        const connection = stack[i][j].connections;
        if (connection.bottom) {
          const resource = connectionImages[this.puyoSkin][stack[i][j].color - 1].vertical;
          const img = await loadImageWithCache(resource);
          this.context.drawImage(
            img,
            x + this.puyoSize * j,
            y + this.puyoSize * i + this.puyoSize / 2,
            this.puyoSize,
            this.puyoSize);
        }

        if (stack[i][j].connections.right) {
          const resource = connectionImages[this.puyoSkin][stack[i][j].color - 1].horizontal;
          const img = await loadImageWithCache(resource);
          this.context.drawImage(
            img,
            x + this.puyoSize * j + this.puyoSize / 2,
            y + this.puyoSize * i,
            this.puyoSize,
            this.puyoSize);
        }
      }
    }

    {
      this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.context.fillRect(x, y, this.puyoSize * 6, this.puyoSize)
    }
  }
}