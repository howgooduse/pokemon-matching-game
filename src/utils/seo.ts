import type { RouteLocationNormalized } from 'vue-router';

const DEFAULT_TITLE = 'PLAY一對';
const DEFAULT_DESCRIPTION = '開始挑戰遊戲，看你能否記住所有寶可夢';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/** 依路由 meta 更新 title / description / og 標籤 */
export function updateSeoTags(to: RouteLocationNormalized): void {
  const title = to.meta.title ?? DEFAULT_TITLE;
  const description = to.meta.description ?? DEFAULT_DESCRIPTION;

  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
}
