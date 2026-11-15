/* =========================================================
   SkyCast — JavaScript dùng chung
   - Đa ngôn ngữ (Việt / Anh)
   - Gọi API Open-Meteo (tìm thành phố + dự báo)
   - Header / footer / ô tìm kiếm / trạng thái loading & lỗi
   - Bộ icon thời tiết (SVG)
   ========================================================= */
'use strict';

const SkyCast = (() => {
  /* ---------------- Lưu trữ cục bộ (an toàn) ---------------- */
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('skycast.' + key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('skycast.' + key, JSON.stringify(value)); } catch (e) { /* bỏ qua */ }
    }
  };

  /* ---------------- Từ điển song ngữ ---------------- */
  const I18N = {
    vi: {
      'nav.home': 'Trang chủ', 'nav.hourly': 'Theo giờ', 'nav.weekly': 'Theo tuần', 'nav.map': 'Bản đồ', 'nav.about': 'Giới thiệu',
      'nav.menu': 'Mở menu',
      'search.placeholder': 'Nhập tên thành phố, ví dụ: Đà Nẵng',
      'search.label': 'Tìm thành phố',
      'search.button': 'Tìm',
      'search.geo': 'Vị trí của tôi',
      'search.empty': 'Vui lòng nhập tên thành phố.',
      'search.short': 'Nhập ít nhất 2 ký tự.',
      'search.none': 'Không tìm thấy thành phố "{q}". Hãy kiểm tra chính tả và thử lại.',
      'search.searching': 'Đang tìm…',
      'search.geoUnsupported': 'Trình duyệt không hỗ trợ định vị.',
      'search.geoDenied': 'Không lấy được vị trí. Hãy cho phép quyền định vị hoặc tìm theo tên.',
      'search.geoLoading': 'Đang xác định vị trí…',
      'loc.mine': 'Vị trí của bạn',
      'state.loading': 'Đang tải dữ liệu thời tiết…',
      'state.retry': 'Thử lại',
      'err.network': 'Không kết nối được máy chủ thời tiết. Kiểm tra kết nối mạng rồi thử lại.',
      'err.limit': 'Đã vượt giới hạn truy vấn API. Vui lòng thử lại sau ít phút.',
      'err.api': 'Máy chủ thời tiết trả về lỗi. Vui lòng thử lại.',
      'footer.data': 'Dữ liệu thời tiết:',
      'footer.project': 'Đề án Thiết kế Web & Đồ họa — ĐH Hoa Sen',
      'unit.kmh': 'km/h',
      'common.today': 'Hôm nay', 'common.tomorrow': 'Ngày mai', 'common.now': 'Bây giờ',
      'common.feels': 'Cảm giác như', 'common.humidity': 'Độ ẩm', 'common.wind': 'Gió',
      'common.pressure': 'Áp suất', 'common.cloud': 'Mây che phủ', 'common.uv': 'Chỉ số UV',
      'common.sunrise': 'Mặt trời mọc', 'common.sunset': 'Mặt trời lặn',
      'common.rainChance': 'Khả năng mưa', 'common.rainSum': 'Lượng mưa', 'common.temp': 'Nhiệt độ',
      'common.max': 'Cao nhất', 'common.min': 'Thấp nhất', 'common.time': 'Giờ', 'common.condition': 'Thời tiết',
      'common.updated': 'Cập nhật lúc {t} (giờ địa phương)',
      'common.hiLo': 'C: {hi}° · T: {lo}°',
      'uv.low': 'Thấp', 'uv.mod': 'Trung bình', 'uv.high': 'Cao', 'uv.vhigh': 'Rất cao', 'uv.ext': 'Nguy hiểm'
    },
    en: {
      'nav.home': 'Home', 'nav.hourly': 'Hourly', 'nav.weekly': 'Weekly', 'nav.map': 'Map', 'nav.about': 'About',
      'nav.menu': 'Open menu',
      'search.placeholder': 'Enter a city name, e.g. Da Nang',
      'search.label': 'Search city',
      'search.button': 'Search',
      'search.geo': 'My location',
      'search.empty': 'Please enter a city name.',
      'search.short': 'Type at least 2 characters.',
      'search.none': 'No city found for "{q}". Check the spelling and try again.',
      'search.searching': 'Searching…',
      'search.geoUnsupported': 'Your browser does not support geolocation.',
      'search.geoDenied': 'Could not get your location. Allow location access or search by name.',
      'search.geoLoading': 'Locating you…',
      'loc.mine': 'Your location',
      'state.loading': 'Loading weather data…',
      'state.retry': 'Try again',
      'err.network': 'Could not reach the weather server. Check your connection and try again.',
      'err.limit': 'API rate limit reached. Please try again in a few minutes.',
      'err.api': 'The weather server returned an error. Please try again.',
      'footer.data': 'Weather data:',
      'footer.project': 'Web & Graphic Design Project — Hoa Sen University',
      'unit.kmh': 'km/h',
      'common.today': 'Today', 'common.tomorrow': 'Tomorrow', 'common.now': 'Now',
      'common.feels': 'Feels like', 'common.humidity': 'Humidity', 'common.wind': 'Wind',
      'common.pressure': 'Pressure', 'common.cloud': 'Cloud cover', 'common.uv': 'UV index',
      'common.sunrise': 'Sunrise', 'common.sunset': 'Sunset',
      'common.rainChance': 'Chance of rain', 'common.rainSum': 'Precipitation', 'common.temp': 'Temperature',
      'common.max': 'High', 'common.min': 'Low', 'common.time': 'Time', 'common.condition': 'Condition',
      'common.updated': 'Updated {t} (local time)',
      'common.hiLo': 'H: {hi}° · L: {lo}°',
      'uv.low': 'Low', 'uv.mod': 'Moderate', 'uv.high': 'High', 'uv.vhigh': 'Very high', 'uv.ext': 'Extreme'
    }
  };

  let lang = store.get('lang', 'vi');
  if (!I18N[lang]) lang = 'vi';

  /** Thêm chuỗi riêng của từng trang vào từ điển */
  function extend(dict) {
    Object.keys(dict).forEach(l => Object.assign(I18N[l], dict[l]));
  }

  function t(key, vars) {
    let s = (I18N[lang] && I18N[lang][key]) || I18N.vi[key] || key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  function applyI18n(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    const titleKey = document.body.dataset.titleKey;
    if (titleKey) document.title = t(titleKey) + ' — SkyCast';
    document.querySelectorAll('.lang-toggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  function setLang(l) {
    if (!I18N[l] || l === lang) return;
    lang = l;
    store.set('lang', l);
    applyI18n();
    document.dispatchEvent(new CustomEvent('skycast:lang', { detail: l }));
  }

  const locale = () => (lang === 'vi' ? 'vi-VN' : 'en-GB');

  /* ---------------- Escape HTML ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------- Bộ icon SVG ---------------- */
  const CLOUD = 'M46 50H20a10 10 0 1 1 2.6-19.7A13 13 0 0 1 47.5 33 8.6 8.6 0 0 1 46 50z';
  const sunSvg = (fill = '#fbbf24') =>
    `<g stroke="${fill}" stroke-width="3.5" stroke-linecap="round">
      <line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/>
      <line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/>
      <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/><line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
      <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/><line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
    </g><circle cx="32" cy="32" r="12" fill="${fill}"/>`;
  const moonSvg = '<path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>';
  const cloudSvg = (fill = '#f1f5f9', stroke = '#cbd5e1', dx = 0, dy = 0) =>
    `<path d="${CLOUD}" transform="translate(${dx} ${dy})" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  const small = (inner, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
  const drops = (color, n = 3, len = 7) => {
    const xs = n === 3 ? [24, 33, 42] : [22, 30, 38, 46];
    return `<g stroke="${color}" stroke-width="3" stroke-linecap="round">${xs.map(x => `<line x1="${x}" y1="${54}" x2="${x - 3}" y2="${54 + len}"/>`).join('')}</g>`;
  };
  const dots = (color, r = 2) => [24, 33, 42].map((x, i) => `<circle cx="${x}" cy="${57 + (i % 2) * 3}" r="${r}" fill="${color}"/>`).join('');

  const ICONS = {
    'clear-day': sunSvg(),
    'clear-night': moonSvg,
    'partly-day': small(sunSvg(), -4, -6, 0.75) + cloudSvg('#ffffff', '#cbd5e1', 2, 4),
    'partly-night': small(moonSvg, -2, -4, 0.7) + cloudSvg('#e2e8f0', '#94a3b8', 2, 4),
    'cloudy': cloudSvg('#f1f5f9', '#94a3b8', 0, -4),
    'overcast': cloudSvg('#cbd5e1', '#94a3b8', -8, -12) + cloudSvg('#94a3b8', '#64748b', 2, -2),
    'fog': cloudSvg('#e2e8f0', '#94a3b8', 0, -10) +
      '<g stroke="#94a3b8" stroke-width="3" stroke-linecap="round"><line x1="12" y1="48" x2="52" y2="48"/><line x1="18" y1="55" x2="46" y2="55"/></g>',
    'drizzle': cloudSvg('#e2e8f0', '#94a3b8', 0, -8) + dots('#3b82f6'),
    'rain': cloudSvg('#cbd5e1', '#64748b', 0, -8) + drops('#2563eb'),
    'showers-day': small(sunSvg(), -4, -8, 0.6) + cloudSvg('#e2e8f0', '#64748b', 2, -6) + drops('#2563eb'),
    'showers-night': small(moonSvg, -2, -6, 0.6) + cloudSvg('#cbd5e1', '#64748b', 2, -6) + drops('#2563eb'),
    'heavy-rain': cloudSvg('#94a3b8', '#475569', 0, -8) + drops('#1d4ed8', 4, 9),
    'snow': cloudSvg('#f1f5f9', '#94a3b8', 0, -8) + dots('#7dd3fc', 3),
    'sleet': cloudSvg('#e2e8f0', '#94a3b8', 0, -8) + dots('#7dd3fc', 2.5) + '<line x1="28" y1="54" x2="26" y2="60" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>',
    'storm': cloudSvg('#64748b', '#334155', 0, -10) +
      '<path d="M34 40l-8 12h7l-4 11 12-15h-7l5-8z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" stroke-linejoin="round"/>'
  };

  function icon(name, cls = 'wx-icon', label = '') {
    const body = ICONS[name] || ICONS.cloudy;
    const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
    return `<svg class="${cls}" viewBox="0 0 64 64" ${a11y}>${body}</svg>`;
  }

  /* Icon giao diện (nét) */
  const UI = {
    search: '<path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.5 18a9 9 0 1 1 17 0z"/>',
    cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.2-9.9A6 6 0 0 1 20.6 12 3.5 3.5 0 0 1 17.5 19z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    sunrise: '<path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M8 6l4-4 4 4"/>',
    sunset: '<path d="M17 18a5 5 0 0 0-10 0M12 9V2M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M16 5l-4 4-4-4"/>',
    thermo: '<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
    umbrella: '<path d="M22 12a10 10 0 0 0-20 0zM12 12v7a2 2 0 0 0 4 0"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
    code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
    mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  };
  function ui(name, extra = '') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${UI[name] || ''}</svg>`;
  }

  /* ---------------- Mã thời tiết WMO ---------------- */
  // [vi, en, iconDay, iconNight, theme]
  const WMO = {
    0: ['Trời quang', 'Clear sky', 'clear-day', 'clear-night', 'clear'],
    1: ['Nắng, ít mây', 'Mainly clear', 'partly-day', 'partly-night', 'clear'],
    2: ['Có mây rải rác', 'Partly cloudy', 'partly-day', 'partly-night', 'cloudy'],
    3: ['Nhiều mây, u ám', 'Overcast', 'overcast', 'overcast', 'overcast'],
    45: ['Sương mù', 'Fog', 'fog', 'fog', 'fog'],
    48: ['Sương mù đóng băng', 'Depositing rime fog', 'fog', 'fog', 'fog'],
    51: ['Mưa phùn nhẹ', 'Light drizzle', 'drizzle', 'drizzle', 'rain'],
    53: ['Mưa phùn', 'Drizzle', 'drizzle', 'drizzle', 'rain'],
    55: ['Mưa phùn dày', 'Dense drizzle', 'drizzle', 'drizzle', 'rain'],
    56: ['Mưa phùn băng giá', 'Freezing drizzle', 'sleet', 'sleet', 'rain'],
    57: ['Mưa phùn băng giá dày', 'Dense freezing drizzle', 'sleet', 'sleet', 'rain'],
    61: ['Mưa nhỏ', 'Slight rain', 'rain', 'rain', 'rain'],
    63: ['Mưa vừa', 'Moderate rain', 'rain', 'rain', 'rain'],
    65: ['Mưa to', 'Heavy rain', 'heavy-rain', 'heavy-rain', 'rain'],
    66: ['Mưa băng giá nhẹ', 'Light freezing rain', 'sleet', 'sleet', 'rain'],
    67: ['Mưa băng giá', 'Heavy freezing rain', 'sleet', 'sleet', 'rain'],
    71: ['Tuyết rơi nhẹ', 'Slight snowfall', 'snow', 'snow', 'snow'],
    73: ['Tuyết rơi', 'Moderate snowfall', 'snow', 'snow', 'snow'],
    75: ['Tuyết rơi dày', 'Heavy snowfall', 'snow', 'snow', 'snow'],
    77: ['Hạt tuyết', 'Snow grains', 'snow', 'snow', 'snow'],
    80: ['Mưa rào nhẹ', 'Slight showers', 'showers-day', 'showers-night', 'rain'],
    81: ['Mưa rào', 'Rain showers', 'showers-day', 'showers-night', 'rain'],
    82: ['Mưa rào rất to', 'Violent showers', 'heavy-rain', 'heavy-rain', 'rain'],
    85: ['Mưa tuyết nhẹ', 'Slight snow showers', 'snow', 'snow', 'snow'],
    86: ['Mưa tuyết', 'Heavy snow showers', 'snow', 'snow', 'snow'],
    95: ['Dông', 'Thunderstorm', 'storm', 'storm', 'storm'],
    96: ['Dông kèm mưa đá', 'Thunderstorm with hail', 'storm', 'storm', 'storm'],
    99: ['Dông mạnh kèm mưa đá', 'Severe thunderstorm with hail', 'storm', 'storm', 'storm']
  };

  function wx(code, isDay = 1) {
    const w = WMO[code] || WMO[3];
    const day = isDay !== 0;
    let theme = w[4];
    if (theme === 'clear' || theme === 'cloudy') theme += day ? '-day' : '-night';
    if (theme === 'cloudy-day' || theme === 'cloudy-night') { /* giữ nguyên */ }
    return {
      text: lang === 'vi' ? w[0] : w[1],
      icon: day ? w[2] : w[3],
      theme: 'wx-' + theme
    };
  }

  /* ---------------- Định dạng ---------------- */
  const fmt = {
    temp: v => (v == null ? '–' : Math.round(v) + '°'),
    num: (v, d = 0) => (v == null ? '–' : Number(v).toFixed(d)),
    hour: iso => iso.slice(11, 16),
    date(iso, opts) {
      const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
      return new Intl.DateTimeFormat(locale(), opts).format(d);
    },
    weekday(iso, todayIso) {
      if (todayIso) {
        const diff = Math.round((new Date(iso + 'T00:00:00') - new Date(todayIso.slice(0, 10) + 'T00:00:00')) / 86400000);
        if (diff === 0) return t('common.today');
        if (diff === 1) return t('common.tomorrow');
      }
      const s = fmt.date(iso, { weekday: lang === 'vi' ? 'long' : 'short' });
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    dayMonth: iso => fmt.date(iso, { day: '2-digit', month: '2-digit' }),
    full: iso => {
      const s = fmt.date(iso, { weekday: 'long', day: 'numeric', month: 'long' });
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    windDir(deg) {
      if (deg == null) return '';
      const vi = ['B', 'ĐB', 'Đ', 'ĐN', 'N', 'TN', 'T', 'TB'];
      const en = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const i = Math.round(((deg % 360) / 45)) % 8;
      return (lang === 'vi' ? vi : en)[i];
    },
    uv(v) {
      if (v == null) return '';
      if (v < 3) return t('uv.low');
      if (v < 6) return t('uv.mod');
      if (v < 8) return t('uv.high');
      if (v < 11) return t('uv.vhigh');
      return t('uv.ext');
    }
  };

  /* ---------------- Địa điểm ---------------- */
  const DEFAULT_LOC = { name: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 10.8231, lon: 106.6297 };

  const POPULAR = [
    { name: { vi: 'Hà Nội', en: 'Hanoi' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 21.0285, lon: 105.8542 },
    { name: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 10.8231, lon: 106.6297 },
    { name: { vi: 'Đà Nẵng', en: 'Da Nang' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 16.0544, lon: 108.2022 },
    { name: { vi: 'Huế', en: 'Hue' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 16.4637, lon: 107.5909 },
    { name: { vi: 'Hải Phòng', en: 'Hai Phong' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 20.8449, lon: 106.6881 },
    { name: { vi: 'Cần Thơ', en: 'Can Tho' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 10.0452, lon: 105.7469 },
    { name: { vi: 'Đà Lạt', en: 'Da Lat' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 11.9404, lon: 108.4583 },
    { name: { vi: 'Nha Trang', en: 'Nha Trang' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 12.2388, lon: 109.1967 },
    { name: { vi: 'Sa Pa', en: 'Sa Pa' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 22.3364, lon: 103.8438 },
    { name: { vi: 'Phú Quốc', en: 'Phu Quoc' }, country: { vi: 'Việt Nam', en: 'Vietnam' }, lat: 10.2899, lon: 103.984 }
  ];

  const pick = v => (v && typeof v === 'object' ? (v[lang] || v.vi || v.en) : v || '');
  const locName = loc => pick(loc.name);
  const locSub = loc => [pick(loc.admin1), pick(loc.country)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');

  function getLocation() {
    const l = store.get('location', null);
    return l && typeof l.lat === 'number' && typeof l.lon === 'number' ? l : DEFAULT_LOC;
  }
  function setLocation(loc) {
    store.set('location', loc);
    const recent = store.get('recent', []).filter(r => !(Math.abs(r.lat - loc.lat) < 0.01 && Math.abs(r.lon - loc.lon) < 0.01));
    recent.unshift(loc);
    store.set('recent', recent.slice(0, 5));
  }

  /* ---------------- API Open-Meteo ---------------- */
  class ApiError extends Error {
    constructor(kind) { super(kind); this.kind = kind; }
  }

  async function getJSON(url) {
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      throw new ApiError('network');
    }
    if (res.status === 429) throw new ApiError('limit');
    if (!res.ok) throw new ApiError('api');
    return res.json();
  }

  function errorText(e) {
    const kind = e && e.kind ? e.kind : 'api';
    return t('err.' + kind);
  }

  async function searchCity(q) {
    const url = 'https://geocoding-api.open-meteo.com/v1/search?count=8&format=json&language=' + lang + '&name=' + encodeURIComponent(q);
    const data = await getJSON(url);
    return (data.results || []).map(r => ({
      name: r.name,
      admin1: r.admin1 || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude
    }));
  }

  const forecastCache = new Map();
  async function getForecast(loc) {
    const key = loc.lat.toFixed(3) + ',' + loc.lon.toFixed(3);
    const cached = forecastCache.get(key);
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.data;
    const params = new URLSearchParams({
      latitude: loc.lat,
      longitude: loc.lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset',
      timezone: 'auto',
      forecast_days: '7'
    });
    const data = await getJSON('https://api.open-meteo.com/v1/forecast?' + params.toString());
    forecastCache.set(key, { at: Date.now(), data });
    return data;
  }

  /** Lấy thời tiết hiện tại cho nhiều điểm trong 1 lần gọi (dùng cho bản đồ) */
  async function getCurrentMany(points) {
    const params = new URLSearchParams({
      latitude: points.map(p => p.lat).join(','),
      longitude: points.map(p => p.lon).join(','),
      current: 'temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m',
      timezone: 'auto'
    });
    const data = await getJSON('https://api.open-meteo.com/v1/forecast?' + params.toString());
    return Array.isArray(data) ? data : [data];
  }

  /** Vị trí giờ hiện tại trong mảng hourly */
  function currentHourIndex(data) {
    const now = data.current.time.slice(0, 13);
    const idx = data.hourly.time.findIndex(tm => tm.slice(0, 13) >= now);
    return idx < 0 ? 0 : idx;
  }

  /* ---------------- Header & Footer ---------------- */
  const PAGES = [
    ['home', 'index.html', 'nav.home'],
    ['hourly', 'hourly.html', 'nav.hourly'],
    ['weekly', 'weekly.html', 'nav.weekly'],
    ['map', 'map.html', 'nav.map'],
    ['about', 'about.html', 'nav.about']
  ];

  function renderShell(page) {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="SkyCast">
          <img src="assets/logo.svg" alt="" width="38" height="38">
          <span>Sky<b>Cast</b></span>
        </a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav" data-i18n-aria="nav.menu">${ui('menu', 'width="22" height="22"')}</button>
        <nav class="main-nav" id="main-nav" aria-label="Main">
          <ul>
            ${PAGES.map(([id, href, key]) => `<li><a href="${href}" data-i18n="${key}" ${id === page ? 'aria-current="page"' : ''}></a></li>`).join('')}
          </ul>
        </nav>
        <div class="lang-toggle" role="group" aria-label="Language">
          <button type="button" data-lang="vi">VI</button>
          <button type="button" data-lang="en">EN</button>
        </div>
      </div>`;
    document.body.prepend(header);

    const btn = header.querySelector('.menu-btn');
    btn.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.innerHTML = ui(open ? 'close' : 'menu', 'width="22" height="22"');
    });
    header.querySelectorAll('.lang-toggle button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container footer-inner">
        <div class="footer-brand"><img src="assets/logo.svg" alt="" width="28" height="28"> SkyCast © 2026</div>
        <div><span data-i18n="footer.data"></span> <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0)</div>
        <div data-i18n="footer.project"></div>
      </div>`;
    document.body.append(footer);
  }

  /* ---------------- Ô tìm kiếm thành phố ---------------- */
  function mountSearch(host, onSelect) {
    host.innerHTML = `
      <form class="search" role="search" novalidate>
        <div class="search-row">
          <div class="search-field">
            ${ui('search')}
            <input type="search" name="q" autocomplete="off" spellcheck="false"
              data-i18n-placeholder="search.placeholder" data-i18n-aria="search.label"
              role="combobox" aria-expanded="false" aria-autocomplete="list">
            <button class="btn btn-primary" type="submit" data-i18n="search.button"></button>
          </div>
          <button class="btn btn-ghost geo-btn" type="button">${ui('locate')}<span data-i18n="search.geo"></span></button>
        </div>
        <ul class="search-results" role="listbox" hidden></ul>
        <p class="search-msg" role="status" hidden></p>
      </form>`;
    applyI18n(host);

    const form = host.querySelector('form');
    const input = host.querySelector('input');
    const list = host.querySelector('.search-results');
    const msg = host.querySelector('.search-msg');
    const listId = 'sr-' + Math.random().toString(36).slice(2, 8);
    list.id = listId;
    input.setAttribute('aria-controls', listId);

    let results = [];
    let active = -1;
    let timer = null;
    let seq = 0;

    const showMsg = (text, info = false) => {
      if (!text) { msg.hidden = true; return; }
      msg.hidden = false;
      msg.className = 'search-msg' + (info ? ' info' : '');
      msg.innerHTML = (info ? '' : ui('alert', 'width="16" height="16"')) + '<span>' + esc(text) + '</span>';
    };
    const closeList = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; };
    const renderList = () => {
      if (!results.length) { closeList(); return; }
      list.innerHTML = results.map((r, i) =>
        `<li role="option" id="${listId}-${i}" data-i="${i}" aria-selected="${i === active}">
           <b>${esc(r.name)}</b><small>${esc(locSub(r))}</small>
         </li>`).join('');
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      if (active >= 0) input.setAttribute('aria-activedescendant', `${listId}-${active}`);
      else input.removeAttribute('aria-activedescendant');
    };
    const choose = r => {
      closeList();
      showMsg('');
      input.value = '';
      input.blur();
      onSelect(r);
    };

    async function run(q, autoPick) {
      const my = ++seq;
      showMsg(t('search.searching'), true);
      try {
        const found = await searchCity(q);
        if (my !== seq) return;
        results = found;
        active = -1;
        if (!found.length) { closeList(); showMsg(t('search.none', { q })); return; }
        showMsg('');
        if (autoPick) choose(found[0]); else renderList();
      } catch (e) {
        if (my !== seq) return;
        closeList();
        showMsg(errorText(e));
      }
    }

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { results = []; closeList(); showMsg(''); seq++; return; }
      timer = setTimeout(() => run(q, false), 350);
    });

    input.addEventListener('keydown', e => {
      if (list.hidden || !results.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % results.length; renderList(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % results.length; renderList(); }
      else if (e.key === 'Escape') { closeList(); }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      clearTimeout(timer);
      const q = input.value.trim();
      if (!q) { closeList(); showMsg(t('search.empty')); input.focus(); return; }
      if (q.length < 2) { showMsg(t('search.short')); return; }
      if (!list.hidden && results.length) { choose(results[active >= 0 ? active : 0]); return; }
      run(q, true);
    });

    list.addEventListener('mousedown', e => {
      const li = e.target.closest('li');
      if (li) { e.preventDefault(); choose(results[+li.dataset.i]); }
    });
    input.addEventListener('blur', () => setTimeout(closeList, 120));
    input.addEventListener('focus', () => { if (results.length && input.value.trim().length >= 2) renderList(); });

    host.querySelector('.geo-btn').addEventListener('click', () => {
      if (!('geolocation' in navigator)) { showMsg(t('search.geoUnsupported')); return; }
      showMsg(t('search.geoLoading'), true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          showMsg('');
          onSelect({
            name: { vi: I18N.vi['loc.mine'], en: I18N.en['loc.mine'] },
            country: '',
            lat: +pos.coords.latitude.toFixed(4),
            lon: +pos.coords.longitude.toFixed(4)
          });
        },
        () => showMsg(t('search.geoDenied')),
        { timeout: 10000, maximumAge: 300000 }
      );
    });

    document.addEventListener('skycast:lang', () => { applyI18n(host); if (!msg.hidden) showMsg(''); });
  }

  /* ---------------- Trạng thái loading / lỗi ---------------- */
  function prepareView(view) {
    if (!view || view.querySelector(':scope > .state-loading')) return;
    view.insertAdjacentHTML('afterbegin', `
      <div class="state state-loading" aria-live="polite"><div class="spinner"></div><p data-i18n="state.loading">${t('state.loading')}</p></div>
      <div class="state state-error" role="alert">${ui('alert')}<p class="err-msg"></p>
        <button class="btn btn-primary retry-btn" type="button" data-i18n="state.retry">${t('state.retry')}</button></div>`);
  }

  /* ---------------- Khởi tạo trang ---------------- */
  /**
   * @param {string} page   id trang hiện tại
   * @param {object} opts   { render(data, loc), needsData: bool }
   */
  function init(page, opts = {}) {
    renderShell(page);
    applyI18n();

    const view = document.querySelector('[data-view]');
    prepareView(view);
    applyI18n();

    let last = null;

    async function load() {
      const loc = getLocation();
      if (view) view.dataset.state = 'loading';
      try {
        const data = await getForecast(loc);
        last = { data, loc };
        if (view) view.dataset.state = 'ready';
        opts.render && opts.render(data, loc);
      } catch (e) {
        console.error(e);
        if (view) {
          view.dataset.state = 'error';
          view.querySelector('.err-msg').textContent = errorText(e);
        }
      }
    }

    if (view) view.querySelector('.retry-btn').addEventListener('click', load);

    document.querySelectorAll('[data-search]').forEach(h =>
      mountSearch(h, loc => { setLocation(loc); load(); window.scrollTo({ top: 0, behavior: 'smooth' }); })
    );

    document.addEventListener('skycast:lang', () => {
      if (last && opts.render) opts.render(last.data, last.loc);
    });

    const api = {
      reload: load,
      selectLocation(loc) { setLocation(loc); return load(); }
    };
    if (opts.needsData !== false) load();
    return api;
  }

  /* ---------------- Chart.js mặc định ---------------- */
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = '#5b7083';
    Chart.defaults.borderColor = '#e2ebf3';
  }

  return {
    t, extend, applyI18n, setLang, get lang() { return lang; }, locale,
    esc, icon, ui, wx, fmt,
    POPULAR, locName, locSub, getLocation, setLocation,
    searchCity, getForecast, getCurrentMany, currentHourIndex, errorText,
    init, mountSearch, chartDefaults
  };
})();
