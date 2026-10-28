import { shuffle } from './array';

/** 遊戲中隨機抽取的寶可夢編號範圍（1 ~ POKEMON_POOL_SIZE） */
export const POKEMON_POOL_SIZE = 150;

/** 卡牌背面圖 */
export const POKEBALL_IMAGE = '/assets/pokeball.png';

export function getPokemonImageUrl(pokemonId: number): string {
  return `/assets/pokemon/${pokemonId}.png`;
}

/** 從 1 ~ POKEMON_POOL_SIZE 中隨機取出 count 個不重複的編號 */
export function pickRandomPokemonIds(count: number): number[] {
  const ids = Array.from({ length: POKEMON_POOL_SIZE }, (_, i) => i + 1);
  return shuffle(ids).slice(0, count);
}

export interface PokemonInfo {
  id: number;
  name: string;
}

interface PokemonJsonItem {
  id: string;
  name: string;
  image_file_name: string;
}

let pokemonListPromise: Promise<PokemonInfo[]> | null = null;

/** 讀取 /assets/pokemon.json（只會實際請求一次） */
export function loadPokemonList(): Promise<PokemonInfo[]> {
  pokemonListPromise ??= fetch('/assets/pokemon.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<PokemonJsonItem[]>;
    })
    .then((items) =>
      items
        .map((item) => ({ id: Number.parseInt(item.id, 10), name: item.name }))
        .filter((p) => Number.isFinite(p.id)),
    )
    .catch((error) => {
      console.error('讀取 pokemon.json 失敗:', error);
      pokemonListPromise = null; // 允許下次重試
      return [];
    });
  return pokemonListPromise;
}
