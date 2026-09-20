import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../core/errors.js';

const execFileAsync = promisify(execFile);

const COMPUTER_VISION_DIR = path.resolve(process.cwd(), 'computer_vision');
const VENV_PYTHON = path.join(
  COMPUTER_VISION_DIR,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python3'
);

// Runs the teammate-owned OpenCV pipeline (`computer_vision/scene_analysis.py`)
// against a captured photo and returns the resulting SceneAnalysis JSON
// (colors/shapes/textures/lines/patterns) exactly as the script prints it.
export async function analyzeSceneImage(imageBuffer: Buffer): Promise<unknown> {
  const tempPath = path.join(tmpdir(), `wonderly-scan-${randomUUID()}.jpg`);
  await writeFile(tempPath, imageBuffer);

  try {
    const { stdout } = await execFileAsync(VENV_PYTHON, [
      path.join(COMPUTER_VISION_DIR, 'scene_analysis.py'),
      tempPath
    ]);
    return JSON.parse(stdout);
  } catch (error) {
    throw new ApiError('Scene analysis failed', 502, {
      cause: error instanceof Error ? error.message : String(error)
    });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
