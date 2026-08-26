/**
 * WüSpace Logo Generator - Main Controller
 * Fully client-side vector generator and high-resolution rasterizer
 */

(function () {
  'use strict';

  // --- Constants & Brand Configuration ---
  const BRAND_PALETTE = {
    bg1: '#1E1E2E',
    bg2: '#182D4A',
    signature: '#603F83',
    accent1: '#96E0ED',
    accent2: '#F9A877',
  };

  const SIZE_PRESETS = {
    favicon: [
      { size: 16, dimension: '16 px', label: 'Tab Favicon' },
      { size: 32, dimension: '32 px', label: 'Retina Favicon' },
      { size: 64, dimension: '64 px', label: 'High-DPI' },
      { size: 128, dimension: '128 px', label: 'App / Touch' },
    ],
    default: [
      { size: 512, dimension: '512 px', label: 'Small / Web' },
      { size: 1024, dimension: '1024 px', label: 'Medium / HD' },
      { size: 2048, dimension: '2048 px', label: 'Large / 2K' },
      { size: 4096, dimension: '4096 px', label: 'Ultra / 4K' },
    ],
  };

  const VARIANTS = {
    square: {
      id: 'square',
      name: 'Main Logo',
      tag: 'Primary · 1:1',
      subtitle: 'Square Lockup',
      description: 'Compact composition with Star & Planet.',
      viewBox: [0, 0, 4168, 4168],
      ratio: 1.0,
      recommended: 'Avatars, Social Media, Merchandise',
      blackFile: 'square-black.svg',
      whiteFile: 'square-white.svg',
    },
    main: {
      id: 'square',
      name: 'Main Logo',
      tag: 'Primary · 1:1',
      subtitle: 'Square Lockup',
      description: 'Compact composition with Star & Planet.',
      viewBox: [0, 0, 4168, 4168],
      ratio: 1.0,
      recommended: 'Avatars, Social Media, Merchandise',
      blackFile: 'square-black.svg',
      whiteFile: 'square-white.svg',
    },
    wide: {
      id: 'wide',
      name: 'Wide Logo',
      tag: '16:9',
      subtitle: 'Horizontal Lockup',
      description: 'Full brandmark with Star, Wordmark & Tagline.',
      viewBox: [0, 0, 7210, 4168],
      ratio: 7210 / 4168,
      recommended: 'Websites, Banners, Headers',
      blackFile: 'wide-black.svg',
      whiteFile: 'wide-white.svg',
    },
    lettermark: {
      id: 'lettermark',
      name: 'Lettermark',
      tag: 'Wordmark',
      subtitle: 'Pure Typography',
      description: 'Clean geometric WÜSPACE typographic wordmark.',
      viewBox: [0, 0, 5418, 1251],
      ratio: 5418 / 1251,
      recommended: 'Navbars, Document Footers',
      blackFile: 'lettermark-black.svg',
      whiteFile: 'lettermark-white.svg',
    },
    pride: {
      id: 'pride',
      name: 'Pride Edition',
      tag: 'Rainbow',
      subtitle: 'Spectrum Edition',
      description: 'Radiant Pride rainbow spectrum variant.',
      viewBox: [0, 0, 4168, 4167],
      ratio: 1.0,
      recommended: 'Pride Month, Community Events',
      blackFile: 'pride-black.svg',
      whiteFile: 'pride-white.svg',
    },
    favicon: {
      id: 'favicon',
      name: 'Favicon & Mark',
      tag: '1:1',
      subtitle: 'Minimalist Symbol',
      description: 'Minimalist Star icon for tabs and apps.',
      viewBox: [0, 0, 4167, 4167],
      ratio: 1.0,
      recommended: 'Browser Favicons, App Icons',
      blackFile: 'favicon-black.svg',
      whiteFile: 'favicon-white.svg',
    },
  };

  // --- App State (Square / Main is Default) ---
  const state = {
    variant: 'square',       // 'square' (Main Logo) | 'wide' | 'favicon' | 'lettermark' | 'pride'
    theme: 'white',          // 'white' (Dark Mode Logo) | 'black' (Light Mode Logo) - Default: white
    hasBackground: true,     // true (Solid BG) | false (Transparent BG)
    sizePreset: 2048,        // 512 | 1024 | 2048 | 4096 for logos; 16 | 32 | 64 | 128 for favicon; or 'native' | 'custom'
    customWidth: 2048,
    customHeight: 2048,
    aspectRatioLocked: true,
    zoomLevel: 1.0,
    showGrid: false,
  };

  // --- DOM Element References ---
  const elements = {
    viewportOuter: document.getElementById('previewViewport'),
    logoWrapper: document.getElementById('logoDisplayWrapper'),
    variantCards: document.querySelectorAll('.variant-card'),
    themeSegments: document.querySelectorAll('[data-theme-option]'),
    bgSegments: document.querySelectorAll('[data-bg-option]'),
    sizeChipsGrid: document.getElementById('sizeChipsGrid'),
    customWidthInput: document.getElementById('customWidthInput'),
    customHeightInput: document.getElementById('customHeightInput'),
    lockRatioBtn: document.getElementById('lockRatioBtn'),
    
    // Meta outputs
    metaDimensions: document.getElementById('metaDimensions'),
    metaRatio: document.getElementById('metaRatio'),
    metaBgColor: document.getElementById('metaBgColor'),
    metaBgDot: document.getElementById('metaBgDot'),
    metaFilename: document.getElementById('metaFilename'),
    
    // Action buttons
    btnDownloadPng: document.getElementById('btnDownloadPng'),
    btnDownloadSvg: document.getElementById('btnDownloadSvg'),
    btnCopySvg: document.getElementById('btnCopySvg'),
    btnCopyPng: document.getElementById('btnCopyPng'),
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnZoomReset: document.getElementById('btnZoomReset'),
    btnToggleGrid: document.getElementById('btnToggleGrid'),
    toastContainer: document.getElementById('toastContainer'),
  };

  // --- Initialize App ---
  async function init() {
    renderSizeChips();
    attachEventListeners();
    updateCustomInputs();
    await setupMiniPreviews();
    await render();
  }

  // --- Normalize variant ID ---
  function normalizeVariantId(id) {
    if (id === 'main') return 'square';
    return id || 'square';
  }

  // --- Populate mini preview thumbnails on variant cards ---
  async function setupMiniPreviews() {
    await Promise.all(
      Array.from(elements.variantCards).map(async (card) => {
        const rawKey = card.getAttribute('data-variant');
        const varKey = normalizeVariantId(rawKey);
        const miniPreview = card.querySelector('.variant-mini-preview');
        if (miniPreview && VARIANTS[varKey]) {
          const rawSvg = await getRawSvg(varKey, 'white');
          if (rawSvg) {
            miniPreview.innerHTML = rawSvg;
          }
        }
      })
    );
  }

  // --- Render Size Preset Chips dynamically ---
  function renderSizeChips() {
    if (!elements.sizeChipsGrid) return;
    const isFavicon = normalizeVariantId(state.variant) === 'favicon';
    const presets = isFavicon ? SIZE_PRESETS.favicon : SIZE_PRESETS.default;

    elements.sizeChipsGrid.innerHTML = presets.map((p) => `
      <button type="button" class="btn-size-chip ${state.sizePreset === p.size ? 'active' : ''}" data-size="${p.size}">
        <span class="chip-dimension">${p.dimension}</span>
        <span class="chip-label">${p.label}</span>
      </button>
    `).join('');

    // Attach click listeners to freshly rendered chips
    elements.sizeChipsGrid.querySelectorAll('.btn-size-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const sizeVal = parseInt(chip.getAttribute('data-size'), 10);
        state.sizePreset = sizeVal;
        state.customWidth = sizeVal;
        const varKey = normalizeVariantId(state.variant);
        const ratio = VARIANTS[varKey].ratio;
        state.customHeight = Math.round(sizeVal / ratio);
        updateCustomInputs();
        render();
      });
    });
  }

  // --- SVG Data Loader & Cache ---
  const svgCache = new Map();

  async function fetchSvg(filename) {
    if (svgCache.has(filename)) {
      return svgCache.get(filename);
    }

    // 1. Check embedded SVG_DATA bundle first (instant, 0 requests, offline/GH Pages safe)
    if (typeof window !== 'undefined' && window.SVG_DATA && window.SVG_DATA[filename]) {
      const data = window.SVG_DATA[filename];
      svgCache.set(filename, data);
      return data;
    }

    // 2. Fallback to dynamic fetch with robust base URL resolution
    try {
      // Resolve path relative to current HTML document or base
      const targetUrl = new URL(`SVG/${filename}`, document.baseURI).href;
      const res = await fetch(targetUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const svgText = await res.text();
      svgCache.set(filename, svgText);
      return svgText;
    } catch (err) {
      console.error(`Failed to load SVG/${filename}:`, err);
      return null;
    }
  }

  async function getRawSvg(variantId, theme) {
    const varKey = normalizeVariantId(variantId);
    const variant = VARIANTS[varKey] || VARIANTS.square;
    const filename = theme === 'white' ? variant.whiteFile : variant.blackFile;
    return await fetchSvg(filename);
  }

  // --- Compute Export & Preview Colors ---
  function getBackgroundColor() {
    if (!state.hasBackground) return 'transparent';
    // For white logo variant: Logo BG uses Background 1 (#1E1E2E)
    // For black logo variant: Logo BG uses #FFFFFF
    return state.theme === 'white' ? BRAND_PALETTE.bg1 : '#FFFFFF';
  }

  // --- Compute Export Dimensions ---
  function getExportDimensions() {
    const varKey = normalizeVariantId(state.variant);
    const variant = VARIANTS[varKey] || VARIANTS.square;
    const vb = variant.viewBox;
    const nativeWidth = vb[2];
    const nativeHeight = vb[3];
    const ratio = variant.ratio;

    let targetWidth = 2048;
    let targetHeight = 2048;

    if (state.sizePreset === 'native') {
      targetWidth = nativeWidth;
      targetHeight = nativeHeight;
    } else if (state.sizePreset === 'custom') {
      targetWidth = parseInt(state.customWidth, 10) || 2048;
      targetHeight = parseInt(state.customHeight, 10) || Math.round(targetWidth / ratio);
    } else {
      targetWidth = parseInt(state.sizePreset, 10) || 2048;
      targetHeight = Math.round(targetWidth / ratio);
    }

    return {
      width: Math.max(16, targetWidth),
      height: Math.max(16, targetHeight),
      nativeWidth,
      nativeHeight,
      ratio,
    };
  }

  // --- Build Clean SVG String (for export or preview) ---
  async function generateSvgContent(options = {}) {
    const { includeBackground = state.hasBackground } = options;
    const varKey = normalizeVariantId(state.variant);
    const rawSvg = await getRawSvg(varKey, state.theme);
    if (!rawSvg) return '<svg viewBox="0 0 100 100"><text x="10" y="50" fill="red">Error loading logo</text></svg>';

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const svgElem = doc.querySelector('svg');

    if (!svgElem) return rawSvg;

    const variant = VARIANTS[varKey] || VARIANTS.square;
    const vb = variant.viewBox;
    const vbWidth = vb[2];
    const vbHeight = vb[3];

    // Ensure standard SVG namespaces
    svgElem.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgElem.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Remove any existing background rects
    const existingBg = svgElem.querySelector('#wuespace-bg-rect');
    if (existingBg) existingBg.remove();

    if (includeBackground) {
      const bgColor = state.theme === 'white' ? BRAND_PALETTE.bg1 : '#FFFFFF';
      const bgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('id', 'wuespace-bg-rect');
      bgRect.setAttribute('x', '0');
      bgRect.setAttribute('y', '0');
      bgRect.setAttribute('width', String(vbWidth));
      bgRect.setAttribute('height', String(vbHeight));
      bgRect.setAttribute('fill', bgColor);

      // Insert as the very first child
      svgElem.insertBefore(bgRect, svgElem.firstChild);
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElem);
  }

  // --- Generate Standardized Filename ---
  function getFilename(extension = 'png') {
    const varKey = normalizeVariantId(state.variant);
    const variantName = varKey === 'square' ? 'main' : varKey;
    const themeName = state.theme === 'white' ? 'white' : 'black';
    const bgName = state.hasBackground ? 'bg' : 'transparent';
    const dims = getExportDimensions();
    const sizeStr = extension === 'png' ? `-${dims.width}x${dims.height}` : '';
    return `wuespace-logo-${variantName}-${themeName}-${bgName}${sizeStr}.${extension}`;
  }

  // --- Update UI & Render Stage ---
  async function render() {
    const varKey = normalizeVariantId(state.variant);
    const variant = VARIANTS[varKey] || VARIANTS.square;
    const dims = getExportDimensions();
    const bgColor = getBackgroundColor();

    // 1. Update Active States in Variant Cards
    elements.variantCards.forEach((card) => {
      const cardVar = card.getAttribute('data-variant');
      const normalizedCardVar = normalizeVariantId(cardVar);
      card.classList.toggle('active', normalizedCardVar === varKey);
    });

    // 2. Update Theme Segments
    elements.themeSegments.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-option') === state.theme);
    });

    // 3. Update Background Segments
    elements.bgSegments.forEach((btn) => {
      const isBg = btn.getAttribute('data-bg-option') === 'solid';
      btn.classList.toggle('active', isBg === state.hasBackground);
    });

    // 4. Update Size Chips Active Class
    if (elements.sizeChipsGrid) {
      elements.sizeChipsGrid.querySelectorAll('.btn-size-chip').forEach((chip) => {
        const chipSize = chip.getAttribute('data-size');
        chip.classList.toggle('active', String(state.sizePreset) === chipSize);
      });
    }

    // 5. Update Viewport Styles
    elements.viewportOuter.className = 'preview-viewport-outer';
    if (state.hasBackground) {
      if (state.theme === 'white') {
        elements.viewportOuter.classList.add('mode-white-bg');
      } else {
        elements.viewportOuter.classList.add('mode-black-bg');
      }
    } else {
      elements.viewportOuter.classList.add('mode-transparent');
      if (state.theme === 'black') {
        elements.viewportOuter.classList.add('theme-black');
      }
    }

    if (state.showGrid) {
      elements.viewportOuter.classList.add('mode-transparent');
    }

    // 6. Render SVG into Viewport
    const svgCode = await generateSvgContent({ includeBackground: false });
    elements.logoWrapper.innerHTML = svgCode;
    elements.logoWrapper.style.transform = `scale(${state.zoomLevel})`;

    // 7. Update Meta Footnotes
    if (elements.metaDimensions) {
      elements.metaDimensions.textContent = `${dims.width} × ${dims.height} px`;
    }
    if (elements.metaRatio) {
      elements.metaRatio.textContent = variant.ratio === 1 ? '1:1 (Square)' : `${variant.ratio.toFixed(2)}:1`;
    }
    if (elements.metaBgColor) {
      elements.metaBgColor.textContent = state.hasBackground ? (state.theme === 'white' ? '#1E1E2E (Bg 1)' : '#FFFFFF (White)') : 'Transparent';
    }
    if (elements.metaBgDot) {
      elements.metaBgDot.style.backgroundColor = state.hasBackground ? (state.theme === 'white' ? BRAND_PALETTE.bg1 : '#FFFFFF') : 'transparent';
      elements.metaBgDot.style.borderColor = state.hasBackground && state.theme === 'white' ? 'rgba(150,224,237,0.5)' : '#7387A4';
    }
    if (elements.metaFilename) {
      elements.metaFilename.textContent = getFilename('png');
    }

    // 8. Update Download Button Label
    if (elements.btnDownloadPng) {
      elements.btnDownloadPng.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download PNG (${dims.width}×${dims.height}px)
      `;
    }
  }

  // --- Synchronize Custom Dimension Inputs ---
  function updateCustomInputs() {
    const dims = getExportDimensions();
    if (elements.customWidthInput && document.activeElement !== elements.customWidthInput) {
      elements.customWidthInput.value = dims.width;
    }
    if (elements.customHeightInput && document.activeElement !== elements.customHeightInput) {
      elements.customHeightInput.value = dims.height;
    }
  }

  // --- Toast Notification Handler ---
  function showToast(message, icon = '✓') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  // --- SVG Export Implementation ---
  async function downloadSvg() {
    try {
      const fullSvg = await generateSvgContent({ includeBackground: state.hasBackground });
      const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const filename = getFilename('svg');

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Exported ${filename}`, '✨');
    } catch (err) {
      console.error('Failed to export SVG:', err);
      showToast('Error exporting SVG', '⚠️');
    }
  }

  // --- Copy SVG to Clipboard ---
  async function copySvgCode() {
    try {
      const fullSvg = await generateSvgContent({ includeBackground: state.hasBackground });
      await navigator.clipboard.writeText(fullSvg);
      showToast('SVG Markup copied to clipboard!', '📋');
    } catch (err) {
      console.error('Failed to copy SVG code:', err);
      const fallbackSvg = await generateSvgContent({ includeBackground: state.hasBackground });
      fallbackCopyText(fallbackSvg);
    }
  }

  // --- PNG Rasterization Engine ---
  async function rasterizeToCanvas(callback) {
    const dims = getExportDimensions();
    const fullSvg = await generateSvgContent({ includeBackground: false });

    const canvas = document.createElement('canvas');
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d');

    if (state.hasBackground) {
      ctx.fillStyle = state.theme === 'white' ? BRAND_PALETTE.bg1 : '#FFFFFF';
      ctx.fillRect(0, 0, dims.width, dims.height);
    } else {
      ctx.clearRect(0, 0, dims.width, dims.height);
    }

    const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, dims.width, dims.height);
      URL.revokeObjectURL(blobUrl);
      callback(canvas);
    };

    img.onerror = function (e) {
      URL.revokeObjectURL(blobUrl);
      console.error('Error rasterizing SVG to Canvas:', e);
      showToast('Failed to rasterize logo', '⚠️');
    };

    img.src = blobUrl;
  }

  // --- Download PNG ---
  function downloadPng() {
    showToast('Rendering high-res PNG...', '⏳');
    rasterizeToCanvas((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('PNG Generation failed', '⚠️');
          return;
        }
        const url = URL.createObjectURL(blob);
        const filename = getFilename('png');
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Exported ${filename}`, '🚀');
      }, 'image/png');
    });
  }

  // --- Copy PNG to Clipboard ---
  function copyPngImage() {
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast('PNG clipboard not supported in this browser. Please download PNG.', '⚠️');
      return;
    }

    showToast('Preparing PNG image...', '⏳');
    rasterizeToCanvas((canvas) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to generate PNG blob', '⚠️');
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('PNG image copied to clipboard!', '🖼️');
        } catch (err) {
          console.error('Clipboard write image error:', err);
          showToast('Could not copy image directly. Use Download PNG.', '⚠️');
        }
      }, 'image/png');
    });
  }

  // --- Fallback Text Copy ---
  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!', '📋');
    } catch (err) {
      showToast('Failed to copy to clipboard', '⚠️');
    }
    document.body.removeChild(textArea);
  }

  // --- Copy Brand Color Code Helper ---
  window.copyColorHex = function (hex, name) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hex).then(() => {
        showToast(`Copied ${name} (${hex}) to clipboard!`, '🎨');
      });
    } else {
      fallbackCopyText(hex);
    }
  };

  // --- Event Listeners Attachment ---
  function attachEventListeners() {
    // 1. Variant Selection
    elements.variantCards.forEach((card) => {
      card.addEventListener('click', () => {
        const rawKey = card.getAttribute('data-variant');
        const variantId = normalizeVariantId(rawKey);
        if (VARIANTS[variantId]) {
          const prevIsFavicon = normalizeVariantId(state.variant) === 'favicon';
          const newIsFavicon = variantId === 'favicon';
          state.variant = variantId;

          // Adjust resolution presets when switching to/from favicon
          if (newIsFavicon && !prevIsFavicon) {
            state.sizePreset = 32;
            state.customWidth = 32;
            state.customHeight = 32;
          } else if (!newIsFavicon && prevIsFavicon) {
            state.sizePreset = 2048;
            state.customWidth = 2048;
            const ratio = VARIANTS[variantId].ratio;
            state.customHeight = Math.round(2048 / ratio);
          }

          updateCustomInputs();
          renderSizeChips();
          render();
        }
      });
    });

    // 2. Theme Selection (Dark Mode = white logo / Light Mode = black logo)
    elements.themeSegments.forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme-option');
        if (theme === 'white' || theme === 'black') {
          state.theme = theme;
          render();
        }
      });
    });

    // 3. Background Toggle (Solid vs Transparent)
    elements.bgSegments.forEach((btn) => {
      btn.addEventListener('click', () => {
        const bgOption = btn.getAttribute('data-bg-option');
        state.hasBackground = bgOption === 'solid';
        render();
      });
    });

    // 4. Custom Dimensions Inputs
    if (elements.customWidthInput) {
      elements.customWidthInput.addEventListener('input', (e) => {
        state.sizePreset = 'custom';
        const w = parseInt(e.target.value, 10) || 16;
        state.customWidth = w;
        if (state.aspectRatioLocked) {
          const varKey = normalizeVariantId(state.variant);
          const ratio = VARIANTS[varKey].ratio;
          state.customHeight = Math.round(w / ratio);
          if (elements.customHeightInput) {
            elements.customHeightInput.value = state.customHeight;
          }
        }
        render();
      });
    }

    if (elements.customHeightInput) {
      elements.customHeightInput.addEventListener('input', (e) => {
        state.sizePreset = 'custom';
        const h = parseInt(e.target.value, 10) || 16;
        state.customHeight = h;
        if (state.aspectRatioLocked) {
          const varKey = normalizeVariantId(state.variant);
          const ratio = VARIANTS[varKey].ratio;
          state.customWidth = Math.round(h * ratio);
          if (elements.customWidthInput) {
            elements.customWidthInput.value = state.customWidth;
          }
        }
        render();
      });
    }

    // 5. Lock Aspect Ratio Toggle
    if (elements.lockRatioBtn) {
      elements.lockRatioBtn.addEventListener('click', () => {
        state.aspectRatioLocked = !state.aspectRatioLocked;
        elements.lockRatioBtn.classList.toggle('active', state.aspectRatioLocked);
        showToast(state.aspectRatioLocked ? 'Aspect ratio locked' : 'Aspect ratio unlinked', '🔗');
      });
    }

    // 6. Action Buttons
    if (elements.btnDownloadPng) {
      elements.btnDownloadPng.addEventListener('click', downloadPng);
    }
    if (elements.btnDownloadSvg) {
      elements.btnDownloadSvg.addEventListener('click', downloadSvg);
    }
    if (elements.btnCopySvg) {
      elements.btnCopySvg.addEventListener('click', copySvgCode);
    }
    if (elements.btnCopyPng) {
      elements.btnCopyPng.addEventListener('click', copyPngImage);
    }

    // 7. Zoom Controls
    if (elements.btnZoomIn) {
      elements.btnZoomIn.addEventListener('click', () => {
        state.zoomLevel = Math.min(2.5, state.zoomLevel + 0.25);
        render();
      });
    }
    if (elements.btnZoomOut) {
      elements.btnZoomOut.addEventListener('click', () => {
        state.zoomLevel = Math.max(0.4, state.zoomLevel - 0.25);
        render();
      });
    }
    if (elements.btnZoomReset) {
      elements.btnZoomReset.addEventListener('click', () => {
        state.zoomLevel = 1.0;
        render();
      });
    }
    if (elements.btnToggleGrid) {
      elements.btnToggleGrid.addEventListener('click', () => {
        state.showGrid = !state.showGrid;
        elements.btnToggleGrid.classList.toggle('active', state.showGrid);
        render();
      });
    }

    // 8. Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = e.key.toUpperCase();
      if (key === '1') { selectVariantByIndex(0); }
      else if (key === '2') { selectVariantByIndex(1); }
      else if (key === '3') { selectVariantByIndex(2); }
      else if (key === '4') { selectVariantByIndex(3); }
      else if (key === '5') { selectVariantByIndex(4); }
      else if (key === 'T') { state.theme = state.theme === 'white' ? 'black' : 'white'; render(); }
      else if (key === 'B') { state.hasBackground = !state.hasBackground; render(); }
      else if (key === 'P' && e.ctrlKey) { e.preventDefault(); downloadPng(); }
      else if (key === 'S' && e.ctrlKey) { e.preventDefault(); downloadSvg(); }
    });
  }

  function selectVariantByIndex(index) {
    if (elements.variantCards[index]) {
      elements.variantCards[index].click();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
