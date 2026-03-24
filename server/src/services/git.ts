import simpleGit, { SimpleGit, StatusResult } from 'simple-git';
import { config } from '../config.js';

let workspacePath: string = process.cwd();

export function setWorkspacePath(path: string): void {
  workspacePath = path;
}

export function getWorkspacePath(): string {
  return workspacePath;
}

function git(): SimpleGit {
  return simpleGit(workspacePath);
}

export async function getStatus(): Promise<StatusResult> {
  return git().status();
}

export async function getDiff(filePath?: string): Promise<string> {
  if (filePath) return git().diff(['--', filePath]);
  return git().diff();
}

export async function stageFile(filePath: string): Promise<void> {
  await git().add(filePath);
}

export async function stageAll(): Promise<void> {
  await git().add('.');
}

export async function commit(message: string): Promise<void> {
  await git().commit(message);
}

export async function push(): Promise<void> {
  await git().push();
}

export async function pull(): Promise<void> {
  await git().pull();
}

export async function getBranch(): Promise<string> {
  const result = await git().branchLocal();
  return result.current;
}

export async function unstageFile(filePath: string): Promise<void> {
  await git().reset(['--', filePath]);
}

export async function discardFile(filePath: string): Promise<void> {
  await git().checkout(['--', filePath]);
}

export async function getCommitLog(limit = 10) {
  return git().log({ n: limit });
}
