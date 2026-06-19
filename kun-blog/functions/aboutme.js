// functions/aboutme.js  ——  Cloudflare Pages Function
// curl -N https://zhangkun.dev/aboutme  →  终端瀑布动画 + 名片
//
// 关键铁律：
//  - 返回 ReadableStream，CF 自动 chunked（别设 Content-Length / Transfer-Encoding）
//  - Cache-Control: no-transform 禁止边缘缓冲改写正文
//  - sleep 消耗墙钟时间、不占 CPU，所以再慢也不会触发 CPU 超时

const ESC = "\x1b";
const C = {
  reset: `${ESC}[0m`,
  bold:  `${ESC}[1m`,
  dim:   `${ESC}[2m`,
  head:  `${ESC}[97m`,        // 雨滴头：亮白
  g1:    `${ESC}[92m`,        // 亮绿
  g2:    `${ESC}[32m`,        // 绿
  g3:    `${ESC}[2;32m`,      // 暗绿
  gray:  `${ESC}[90m`,
  cyan:  `${ESC}[36m`,
  yellow:`${ESC}[33m`,
  green: `${ESC}[32m`,
};

const CURSOR_HIDE = `${ESC}[?25l`;
const CURSOR_SHOW = `${ESC}[?25h`;
const CLEAR       = `${ESC}[2J${ESC}[H`;
const HOME        = `${ESC}[H`;

// 终端宽高未知（HTTP 拿不到 tty 尺寸），按经典 80x18 画
const COLS = 80;
const ROWS = 18;

// 瀑布字符集：片假名 + 数字 + 名字里的字母，落下来更有"代码雨"感
const GLYPHS = (
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ" +
  "0123456789" +
  "ZHANGKUN<>/\\|=+*"
).split("");

const rnd  = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];

export async function onRequest() {
  const enc = new TextEncoder();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const stream = new ReadableStream({
    async start(ctrl) {
      const w = (s) => ctrl.enqueue(enc.encode(s));

      // 逐字打印（落定后的名片用）
      const type = async (s, speed = 14, gap = 70) => {
        for (const ch of s) { w(ch); await sleep(speed); }
        w("\n");
        await sleep(gap);
      };

      try {
        w(CURSOR_HIDE);
        w(CLEAR);

        // ---------- 1. 瀑布动画 ----------
        // grid[r][c] = brightness 0..1（0 = 空）；每帧整体衰减
        const bright = Array.from({ length: ROWS }, () =>
          new Float32Array(COLS).fill(0)
        );
        const glyph = Array.from({ length: ROWS }, () =>
          new Array(COLS).fill(" ")
        );

        // 每列一个雨滴：头部行 y、速度、还有多久重生
        const drops = Array.from({ length: COLS }, () => ({
          y: rnd(ROWS) - ROWS,                 // 错开起点，从屏幕上方陆续进入
          speed: 0.5 + Math.random() * 0.9,    // 每帧下落 0.5~1.4 行
          acc: 0,
        }));

        const colorFor = (b) =>
          b > 0.92 ? C.head :
          b > 0.6  ? C.g1   :
          b > 0.3  ? C.g2   :
                     C.g3;

        const FRAMES = 48;
        for (let f = 0; f < FRAMES; f++) {
          // 衰减拖尾
          for (let r = 0; r < ROWS; r++) {
            const row = bright[r];
            for (let c = 0; c < COLS; c++) row[c] *= 0.82;
          }
          // 推进雨滴头
          for (let c = 0; c < COLS; c++) {
            const d = drops[c];
            d.acc += d.speed;
            while (d.acc >= 1) {
              d.acc -= 1;
              d.y += 1;
              const yi = d.y;
              if (yi >= 0 && yi < ROWS) {
                bright[yi][c] = 1;             // 新头：最亮
                glyph[yi][c] = pick(GLYPHS);
              }
              if (d.y > ROWS + d.speed * 4) {   // 落到底 → 从顶部重生
                d.y = -rnd(ROWS);
                d.speed = 0.5 + Math.random() * 0.9;
              }
            }
          }
          // 渲染整帧（合并相同颜色，省字节）
          let out = HOME;
          let cur = "";
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const b = bright[r][c];
              if (b < 0.06) {
                if (cur !== "blank") { out += C.reset; cur = "blank"; }
                out += " ";
              } else {
                const col = colorFor(b);
                if (col !== cur) { out += col; cur = col; }
                // 拖尾偶尔抖动换字，更像流动的水
                if (b < 0.5 && Math.random() < 0.15) glyph[r][c] = pick(GLYPHS);
                out += glyph[r][c];
              }
            }
            out += "\n";
          }
          out += C.reset;
          w(out);
          await sleep(70);
        }

        // ---------- 2. 落定成名片 ----------
        w(CLEAR);
        w(CURSOR_SHOW);

        await type(`${C.gray}# stream from zhangkun.dev — booting ...${C.reset}`, 6, 160);
        await sleep(120);

        await type(`${C.cyan}$ whoami${C.reset}`, 16);
        await type(`${C.green}${C.bold}Zhang Kun${C.reset} — Full stack Engineer`);
        w("\n");

        await type(`${C.cyan}$ cat skills.txt${C.reset}`, 16);
        await type(`  ${C.yellow}▸${C.reset} Go · Rust · TypeScript · Python`);
        await type(`  ${C.yellow}▸${C.reset} Docker · K8s · Cloudflare · Linux/ARM`);
        await type(`  ${C.yellow}▸${C.reset} WireGuard · Nginx`);
        w("\n");

        await type(`${C.cyan}$ cat contact.txt${C.reset}`, 16);
        await type(`  web    https://zhangkun.dev`);
        await type(`  email  carlzh23@gmail.com`);
        await type(`  github https://github.com/zk39`);
        w("\n");
        await type(`${C.gray}# eof${C.reset}`, 8, 0);
      } finally {
        w(C.reset + CURSOR_SHOW);
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
