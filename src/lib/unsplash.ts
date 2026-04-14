// Thin wrapper over the Unsplash Search API. Requires
// EXPO_PUBLIC_UNSPLASH_ACCESS_KEY. When unset, we expose a small curated
// fallback list so cover-picker UI can still render in dev.

export type UnsplashPhoto = {
  id: string;
  description: string | null;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  author: {
    name: string;
    username: string;
    link: string;
  };
  link: string;
  width: number;
  height: number;
};

const UNSPLASH_ENDPOINT = 'https://api.unsplash.com/search/photos';

// Curated fallback — used when the Unsplash key is missing. Tripsy-quality
// stock shots keyed loosely to popular destinations.
const FALLBACK_PHOTOS: Record<string, UnsplashPhoto[]> = {
  default: [
    photo('1507525428034-b723cf961d3e', 'Beach', 'Sean O.'),
    photo('1502602898657-3e91760cbb34', 'Paris', 'Chris Karidis'),
    photo('1516483638261-f4dbaf036963', 'Italy', 'Jonathan Bean'),
    photo('1493976040374-85c8e12f0c0e', 'Kyoto', 'Sorasak'),
    photo('1518548419970-58e3b4079ab2', 'Santorini', 'Heidi Kaden'),
    photo('1534430480872-3498386e7856', 'New York', 'Oliver Niblett'),
    photo('1528128024150-5f3adb3d5e32', 'Iceland', 'Cosmic Timetraveler'),
    photo('1527631746610-bca00a040d60', 'Desert', 'Keith Hardy'),
  ],
};

function photo(
  id: string,
  description: string,
  author: string,
): UnsplashPhoto {
  const base = `https://images.unsplash.com/photo-${id}`;
  return {
    id,
    description,
    urls: {
      thumb: `${base}?w=200&h=150&fit=crop`,
      small: `${base}?w=400&h=300&fit=crop`,
      regular: `${base}?w=1080&h=720&fit=crop`,
      full: `${base}?w=2400&h=1600&fit=crop`,
    },
    author: {
      name: author,
      username: author.toLowerCase().replace(/\s+/g, '_'),
      link: `https://unsplash.com/@${author.toLowerCase().replace(/\s+/g, '_')}`,
    },
    link: `https://unsplash.com/photos/${id}`,
    width: 2400,
    height: 1600,
  };
}

export function getUnsplashAccessKey(): string | null {
  return process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ?? null;
}

export async function searchUnsplash(
  query: string,
  opts: { perPage?: number; signal?: AbortSignal } = {},
): Promise<UnsplashPhoto[]> {
  const key = getUnsplashAccessKey();
  const trimmed = query.trim();

  if (!key) {
    // Dev fallback — filter the curated pool by description substring.
    const all = FALLBACK_PHOTOS.default;
    if (!trimmed) return all;
    const q = trimmed.toLowerCase();
    return all.filter((p) => (p.description ?? '').toLowerCase().includes(q));
  }

  const perPage = opts.perPage ?? 24;
  const url = `${UNSPLASH_ENDPOINT}?query=${encodeURIComponent(
    trimmed || 'travel',
  )}&per_page=${perPage}&orientation=landscape`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${key}`,
      'Accept-Version': 'v1',
    },
    signal: opts.signal,
  });

  if (!res.ok) {
    throw new Error(`Unsplash: ${res.status} ${res.statusText}`);
  }

  const payload = (await res.json()) as {
    results: Array<{
      id: string;
      description?: string | null;
      alt_description?: string | null;
      urls: {
        thumb: string;
        small: string;
        regular: string;
        full: string;
      };
      user: {
        name: string;
        username: string;
        links: { html: string };
      };
      links: { html: string };
      width: number;
      height: number;
    }>;
  };

  return payload.results.map((r) => ({
    id: r.id,
    description: r.description ?? r.alt_description ?? null,
    urls: r.urls,
    author: {
      name: r.user.name,
      username: r.user.username,
      link: r.user.links.html,
    },
    link: r.links.html,
    width: r.width,
    height: r.height,
  }));
}

/** Attribution payload to persist into trips.cover_photo_attribution. */
export type PhotoAttribution = {
  provider: 'unsplash' | 'user';
  photoId: string;
  author: string;
  authorUsername: string;
  authorLink: string;
  link: string;
};

export function attributionFromPhoto(p: UnsplashPhoto): PhotoAttribution {
  return {
    provider: 'unsplash',
    photoId: p.id,
    author: p.author.name,
    authorUsername: p.author.username,
    authorLink: p.author.link,
    link: p.link,
  };
}
