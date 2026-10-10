export function youtubeId(url: string): string | null {
  const u = (url || "").trim();
  if (!u) return null;
  const m = u.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/
  );
  if (m?.[1]) return m[1];
  const q = u.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  return q?.[1] ?? null;
}

export function youtubeEmbed(url: string): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
