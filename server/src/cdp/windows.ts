import { getAllTargets, connectCDP } from './core.js';

export interface WindowInfo {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export async function listWindows(): Promise<WindowInfo[]> {
  const targets = getAllTargets();
  if (targets.length === 0) {
    await connectCDP();
    return getAllTargets().map((t, i) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      active: i === 0,
    }));
  }

  return targets.map((t, i) => ({
    id: t.id,
    title: t.title,
    url: t.url,
    active: i === 0,
  }));
}
