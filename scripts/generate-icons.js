import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');

const PORT = 9876;

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Icon Generator</title>
</head>
<body style="background: #111; margin: 0; padding: 20px; color: #fff; font-family: sans-serif;">
  <h2>Rendering Crisp Japanese Soroban App Icons...</h2>
  <div id="status">Starting...</div>

  <canvas id="c512" width="512" height="512" style="border: 1px solid #444; margin: 10px;"></canvas>
  <canvas id="c192" width="192" height="192" style="border: 1px solid #444; margin: 10px;"></canvas>

  <script>
    function drawIcon(canvas, isMaskable = false) {
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const scale = size / 512;
      ctx.save();
      ctx.scale(scale, scale);

      // 1. FULL BACKGROUND (Rich Lacquer Dark Vignette)
      // Edge-to-edge fill for maskable support
      const bg = ctx.createRadialGradient(256, 256, 50, 256, 256, 280);
      bg.addColorStop(0, '#26201e');
      bg.addColorStop(0.55, '#1a1615');
      bg.addColorStop(1, '#0f0d0c');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 512, 512);

      // If not maskable (e.g. standalone/apple icon), draw the polished gold border ring
      if (!isMaskable) {
        ctx.save();
        ctx.beginPath();
        // Inner rounded boundary
        ctx.arc(256, 256, 240, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        const goldBorder = ctx.createLinearGradient(0, 0, 512, 512);
        goldBorder.addColorStop(0, '#f59e42');
        goldBorder.addColorStop(0.5, '#b87328');
        goldBorder.addColorStop(1, '#e05638');
        ctx.strokeStyle = goldBorder;
        ctx.stroke();
        ctx.restore();
      }

      // 2. ZEN ENSO CIRCLE (円相 - Zen Brush Stroke Arc)
      ctx.save();
      ctx.translate(256, 240);
      ctx.rotate(-0.25);
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0.4, Math.PI * 1.82);
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      const ensoGrad = ctx.createLinearGradient(-150, -150, 150, 150);
      ensoGrad.addColorStop(0, '#e05638');
      ensoGrad.addColorStop(0.4, '#f59e42');
      ensoGrad.addColorStop(0.8, '#d97736');
      ensoGrad.addColorStop(1, '#8a2411');
      ctx.strokeStyle = ensoGrad;
      ctx.shadowColor = 'rgba(245, 158, 66, 0.45)';
      ctx.shadowBlur = 16;
      ctx.stroke();

      // Secondary fine brush echo
      ctx.beginPath();
      ctx.arc(0, 0, 162, 0.6, Math.PI * 1.6);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(240, 108, 75, 0.35)';
      ctx.stroke();
      ctx.restore();

      // Helper function to draw a bold 3D bi-conical diamond bead
      function draw3DBead(cx, cy, w, h) {
        const halfW = w / 2;
        const halfH = h / 2;
        const topRim = 12;

        ctx.save();
        ctx.translate(cx, cy);

        // Shadow behind bead
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // Top slope facet
        const topGrad = ctx.createLinearGradient(0, -halfH, 0, 0);
        topGrad.addColorStop(0, '#ff8a6a');
        topGrad.addColorStop(0.5, '#f06c4b');
        topGrad.addColorStop(1, '#e05638');

        ctx.beginPath();
        ctx.moveTo(-topRim, -halfH);
        ctx.lineTo(topRim, -halfH);
        ctx.lineTo(halfW, 0);
        ctx.lineTo(-halfW, 0);
        ctx.closePath();
        ctx.fillStyle = topGrad;
        ctx.fill();

        // Bottom slope facet
        ctx.shadowColor = 'transparent'; // clear shadow for inner facet
        const botGrad = ctx.createLinearGradient(0, 0, 0, halfH);
        botGrad.addColorStop(0, '#c44527');
        botGrad.addColorStop(0.7, '#9e2d14');
        botGrad.addColorStop(1, '#661908');

        ctx.beginPath();
        ctx.moveTo(-halfW, 0);
        ctx.lineTo(halfW, 0);
        ctx.lineTo(topRim, halfH);
        ctx.lineTo(-topRim, halfH);
        ctx.closePath();
        ctx.fillStyle = botGrad;
        ctx.fill();

        // Stroke boundary
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#5a1506';
        ctx.stroke();

        // Sharp center ridge highlight line
        ctx.beginPath();
        ctx.moveTo(-halfW + 3, 0);
        ctx.lineTo(halfW - 3, 0);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.stroke();

        // Soft glossy center bead highlight
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        ctx.restore();
      }

      // 3. THE SOROBAN COLUMN EMBLEM (Center-Top, inside Safe Zone)
      const colX = 256;

      // Vertical Rod (Bamboo / Metal Axis)
      const rodGrad = ctx.createLinearGradient(colX - 5, 0, colX + 5, 0);
      rodGrad.addColorStop(0, '#1c1918');
      rodGrad.addColorStop(0.45, '#786e6a');
      rodGrad.addColorStop(0.7, '#a89c97');
      rodGrad.addColorStop(1, '#221e1d');
      ctx.fillStyle = rodGrad;
      ctx.fillRect(colX - 4.5, 95, 9, 215);

      // Horizontal Reckoning Beam (梁)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 3;

      const beamGrad = ctx.createLinearGradient(0, 175, 0, 195);
      beamGrad.addColorStop(0, '#423b38');
      beamGrad.addColorStop(0.5, '#24201e');
      beamGrad.addColorStop(1, '#12100f');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(colX - 75, 175, 150, 18);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#574d49';
      ctx.strokeRect(colX - 75, 175, 150, 18);

      // White Reckoning Unit Dot (定位点)
      ctx.beginPath();
      ctx.arc(colX, 184, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();

      // Beads (1 Upper Heaven Bead + 2 Lower Earth Beads)
      // Heaven bead touching beam from top
      draw3DBead(colX, 150, 100, 36);
      // Earth bead 1 touching beam from bottom
      draw3DBead(colX, 218, 100, 36);
      // Earth bead 2 touching bead 1
      draw3DBead(colX, 256, 100, 36);

      // 4. JAPANESE CALLIGRAPHY: 「そろばん」
      // Perfectly centered in safe zone below beads
      ctx.save();
      ctx.font = '900 46px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text glow & shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = '#fdf8f0';
      ctx.fillText('そろばん', colX - 18, 350);

      // Subtle gold gradient overlay for text
      const textGrad = ctx.createLinearGradient(colX - 100, 330, colX + 80, 365);
      textGrad.addColorStop(0, '#ffffff');
      textGrad.addColorStop(0.5, '#fff1d6');
      textGrad.addColorStop(1, '#ffd899');
      ctx.fillStyle = textGrad;
      ctx.fillText('そろばん', colX - 18, 350);
      ctx.restore();

      // 5. TRADITIONAL VERMILION HANKO STAMP: 「珠算」 (SHUZAN)
      // Placed right beside calligraphy, fully inside the safe circle!
      ctx.save();
      ctx.translate(colX + 92, 350);
      ctx.rotate(-0.06);

      // Hanko Red Base
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#bd2c15';
      ctx.fillRect(-22, -22, 44, 44);

      // Hanko Gold Inner Border
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#f59e42';
      ctx.strokeRect(-20, -20, 40, 40);

      // Hanko Characters
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px "Hiragino Mincho ProN", "Yu Mincho", serif, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('珠', 0, -8);
      ctx.fillText('算', 0, 9);
      ctx.restore();

      ctx.restore();
      return canvas.toDataURL('image/png');
    }

    async function generateAndUpload() {
      const c512 = document.getElementById('c512');
      const c192 = document.getElementById('c192');

      document.getElementById('status').innerText = 'Drawing 512x512 standard...';
      const png512 = drawIcon(c512, false);

      document.getElementById('status').innerText = 'Drawing 512x512 maskable...';
      const c512mask = document.createElement('canvas');
      c512mask.width = 512;
      c512mask.height = 512;
      const png512mask = drawIcon(c512mask, true);

      document.getElementById('status').innerText = 'Drawing 192x192 standard...';
      const png192 = drawIcon(c192, false);

      document.getElementById('status').innerText = 'Drawing 192x192 maskable...';
      const c192mask = document.createElement('canvas');
      c192mask.width = 192;
      c192mask.height = 192;
      const png192mask = drawIcon(c192mask, true);

      document.getElementById('status').innerText = 'Drawing 180x180 apple...';
      const c180 = document.createElement('canvas');
      c180.width = 180;
      c180.height = 180;
      const png180 = drawIcon(c180, false);

      document.getElementById('status').innerText = 'Sending to backend...';
      await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icon512: png512,
          icon512mask: png512mask,
          icon192: png192,
          icon192mask: png192mask,
          apple180: png180,
        }),
      });

      document.getElementById('status').innerText = 'SUCCESS! All icons saved.';
    }

    setTimeout(generateAndUpload, 200);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/generate.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        function saveBase64(base64Str, filename) {
          const base64Data = base64Str.replace(/^data:image\/png;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(path.join(publicDir, filename), buffer);
          console.log(`Saved: ${filename} (${buffer.length} bytes)`);
        }

        saveBase64(data.icon512, 'icon-512.png');
        saveBase64(data.icon512mask, 'icon-maskable-512.png');
        saveBase64(data.icon192, 'icon-192.png');
        saveBase64(data.icon192mask, 'icon-maskable-192.png');
        saveBase64(data.apple180, 'apple-touch-icon.png');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');

        console.log('ALL ICONS GENERATED SUCCESSFULLY!');
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 500);
      } catch (err) {
        console.error('Error saving icons:', err);
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);

  // Launch headless edge
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const edgePath = edgePaths.find(p => fs.existsSync(p));
  if (!edgePath) {
    console.error('Edge executable not found!');
    process.exit(1);
  }

  console.log('Launching headless Edge to execute HTML5 canvas rendering...');
  const edgeProcess = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/generate.html`,
  ]);

  edgeProcess.on('exit', (code) => {
    console.log(`Edge exited with code ${code}`);
  });
});
