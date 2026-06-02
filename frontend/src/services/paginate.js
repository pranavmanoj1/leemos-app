// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION SERVICE
//
// Pure, view-agnostic logic that turns a chapter's paragraphs into balanced
// pages for a given column size / font. It depends only on its inputs (no
// reads of app globals like BOOK/state/DOM) and produces plain data —
// `[{ paragraphs: string[] }]` — that the view renders.
//
// Text is measured with Pretext (pure-JS, no DOM reflow; handles bidi/CJK/
// graphemes), loaded as an ES module from a CDN to keep the frontend zero-build.
// ─────────────────────────────────────────────────────────────────────────────
import { prepare, layout, clearCache } from 'https://esm.sh/@chenglou/pretext@0.0.7';

// Pretext warns against `system-ui` for accuracy on macOS — use named families.
function getFontString(fontFamily, fs) {
  return fontFamily === 'sans'
    ? '400 ' + fs + 'px -apple-system, "Helvetica Neue", Arial, sans-serif'
    : '400 ' + fs + 'px Literata, Georgia, "Times New Roman", serif';
}

// Cache of `prepare()` handles, keyed by (font, paragraph text).  `prepare()`
// is the expensive step; `layout()` is pure arithmetic over the handle, so we
// only redo `layout()` on resize / column-width changes.
var _preparedCache = new Map();
function getPrepared(text, fontStr) {
  var key = fontStr + '\u0001' + text;
  var hit = _preparedCache.get(key);
  if (hit) return hit;
  var p = prepare(text, fontStr);
  _preparedCache.set(key, p);
  return p;
}

function measureParaHeight(text, colWidth, fontStr, lhPx) {
  var p = getPrepared(text, fontStr);
  var r = layout(p, colWidth, lhPx);
  // An empty paragraph still occupies one line visually.
  return Math.max(1, r.lineCount) * lhPx;
}

// Per-(id) page cache. Cleared on resize / font-change so we don't accumulate
// stale layouts. Key encodes everything that affects layout.
var _pageCache = new Map();
function pageCacheKey(id, opts) {
  return id + '|' + opts.colWidth + '|' + opts.colHeight + '|' + opts.fontSize + '|' + opts.fontFamily;
}

// Balanced pagination.  Two phases:
//   (a) Greedy first-fit to find the minimum page count N that fits the
//       paragraphs within colHeight.
//   (b) DP to partition the paragraphs into exactly N contiguous groups,
//       minimizing Σ (pageHeight − target)².  This avoids the "tiny last
//       page" you get with pure greedy — heights cluster around the mean.
function computePages(paras, opts) {
  var fs       = opts.fontSize;
  var lhPx     = fs * 1.6;
  var gapPx    = lhPx * 0.55;
  var fontStr  = getFontString(opts.fontFamily, fs);
  var colWidth = opts.colWidth;
  var colHeight = opts.colHeight;

  if (colWidth <= 0 || colHeight <= 0) return [];

  var M = paras.length;
  if (M === 0) return [];

  // Measure each paragraph once at the current width / font.
  var H = new Float64Array(M);
  for (var i = 0; i < M; i++) {
    H[i] = measureParaHeight(paras[i], colWidth, fontStr, lhPx);
  }

  // Prefix sum → O(1) page-height queries.
  var cum = new Float64Array(M + 1);
  for (var i = 0; i < M; i++) cum[i + 1] = cum[i] + H[i];
  function pageH(j, i) {
    return cum[i] - cum[j] + (i - j - 1) * gapPx;
  }

  // (a) Greedy first-fit to determine the minimum page count N.
  function greedyRanges(maxH) {
    var ranges = [];
    var start = 0, used = 0;
    for (var i = 0; i < M; i++) {
      var cost = H[i] + (i > start ? gapPx : 0);
      if (i > start && used + cost > maxH) {
        ranges.push([start, i]);
        start = i;
        used = H[i];
      } else {
        used += cost;
      }
    }
    ranges.push([start, M]);
    return ranges;
  }

  var N = greedyRanges(colHeight).length;
  if (N <= 1) return [{ paragraphs: paras.slice() }];

  // (b) DP for balanced partition into exactly N pages.
  var target = (cum[M] + (M - N) * gapPx) / N;
  var INF = Infinity;
  var dp = [], path = [];
  for (var p = 0; p <= N; p++) {
    dp.push(new Float64Array(M + 1));
    path.push(new Int32Array(M + 1));
    for (var i = 0; i <= M; i++) { dp[p][i] = INF; path[p][i] = -1; }
  }
  dp[0][0] = 0;

  for (var p = 1; p <= N; p++) {
    for (var i = p; i <= M; i++) {
      for (var j = p - 1; j < i; j++) {
        var prev = dp[p - 1][j];
        if (prev === INF) continue;
        var h = pageH(j, i);
        // Multi-paragraph pages may not overflow.  A single paragraph
        // that's taller than the column has nowhere else to go, so we
        // accept it on its own page (the squared diff stays in the cost).
        if (h > colHeight && (i - j) > 1) continue;
        var diff = h - target;
        var cost = prev + diff * diff;
        if (cost < dp[p][i]) {
          dp[p][i] = cost;
          path[p][i] = j;
        }
      }
    }
  }

  if (!isFinite(dp[N][M])) {
    // Shouldn't happen — greedy proved N pages fit.  Fall back if it does.
    return greedyRanges(colHeight).map(function (r) {
      return { paragraphs: paras.slice(r[0], r[1]) };
    });
  }

  // Walk the path back to recover the cut points.
  var splits = [M];
  var idx = M;
  for (var p = N; p >= 1; p--) {
    var j = path[p][idx];
    splits.unshift(j);
    idx = j;
  }
  var pages = [];
  for (var k = 0; k < splits.length - 1; k++) {
    pages.push({ paragraphs: paras.slice(splits[k], splits[k + 1]) });
  }
  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

// Paginate `paragraphs` for the given display `opts`, memoised by `id` (the
// caller's stable identifier for this content, e.g. a chapter index).
//   opts: { colWidth, colHeight, fontSize, fontFamily }
//   → returns [{ paragraphs: string[] }]
export function paginate(id, paragraphs, opts) {
  var key = pageCacheKey(id, opts);
  var hit = _pageCache.get(key);
  if (hit) return hit;
  var pages = computePages(paragraphs, opts);
  _pageCache.set(key, pages);
  return pages;
}

// Drop cached page partitions (e.g. on resize). Prepared text handles are
// width-independent, so they survive.
export function clearPageCache() {
  _pageCache.clear();
}

// Drop everything (e.g. on font-family / font-size change), including Pretext's
// internal segment-shape cache.
export function clearAllCaches() {
  _preparedCache.clear();
  _pageCache.clear();
  try { clearCache(); } catch (_) { /* older versions may lack this */ }
}
