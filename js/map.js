/* SkyCast — Trang bản đồ thời tiết (Leaflet + RainViewer + Open-Meteo) */
'use strict';

(() => {
  const S = SkyCast;

  S.extend({
    vi: {
      'map.title': 'Bản đồ thời tiết',
      'map.sub': 'Radar mưa và nhiệt độ hiện tại tại các thành phố.',
      'map.layers': 'Lớp bản đồ',
      'map.radar': 'Radar mưa',
      'map.cities': 'Nhiệt độ thành phố',
      'map.light': 'Mưa nhẹ', 'map.heavy': 'Mưa to / dông',
      'map.radarTime': 'Ảnh radar lúc {t}',
      'map.radarNA': 'Hiện không tải được dữ liệu radar.',
      'map.play': '▶ Phát radar 2 giờ qua', 'map.pause': '❚❚ Tạm dừng',
      'map.cityTemps': 'Nhiệt độ hiện tại',
      'map.hint': 'Nhấn vào bất kỳ điểm nào trên bản đồ để xem thời tiết tại đó.',
      'map.here': 'Xem dự báo tại đây',
      'map.point': 'Điểm đã chọn',
      'map.loading': 'Đang tải…'
    },
    en: {
      'map.title': 'Weather map',
      'map.sub': 'Rain radar and current temperatures across cities.',
      'map.layers': 'Map layers',
      'map.radar': 'Rain radar',
      'map.cities': 'City temperatures',
      'map.light': 'Light rain', 'map.heavy': 'Heavy rain / storm',
      'map.radarTime': 'Radar image at {t}',
      'map.radarNA': 'Radar data is unavailable right now.',
      'map.play': '▶ Play last 2 hours', 'map.pause': '❚❚ Pause',
      'map.cityTemps': 'Current temperatures',
      'map.hint': 'Click anywhere on the map to see the weather there.',
      'map.here': 'See forecast here',
      'map.point': 'Selected point',
      'map.loading': 'Loading…'
    }
  });

  let map = null;
  let mainMarker = null;
  const cityLayer = window.L ? L.layerGroup() : null;
  let cityData = [];
  let radar = { host: '', frames: [], layer: null, index: 0, timer: null };

  const app = S.init('map', { render });

  function tempIcon(temp, code, isDay, main = false) {
    const w = S.wx(code, isDay);
    const label = Math.round(temp) + '°';
    return L.divIcon({
      className: 'temp-marker' + (main ? ' main' : ''),
      html: S.icon(w.icon, '') + label,
      iconSize: [main ? 70 : 62, main ? 34 : 30],
      iconAnchor: [main ? 35 : 31, main ? 17 : 15]
    });
  }

  function render(data, loc) {
    if (!window.L) return;
    const c = data.current;
    if (!map) {
      map = L.map('map', { zoomControl: true, worldCopyJump: true, maxZoom: 16 }).setView([loc.lat, loc.lon], 6);
      const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
      L.tileLayer(esri + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> — Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
      }).addTo(map);
      map.createPane('labels');
      map.getPane('labels').style.zIndex = 450;
      map.getPane('labels').style.pointerEvents = 'none';
      L.tileLayer(esri + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, pane: 'labels' }).addTo(map);
      cityLayer.addTo(map);
      map.on('click', e => showPoint(e.latlng.lat, e.latlng.lng));
      initRadar();
      loadCities();
      setTimeout(() => map.invalidateSize(), 50);
    } else {
      map.setView([loc.lat, loc.lon], Math.max(map.getZoom(), 6));
    }

    if (mainMarker) mainMarker.remove();
    const w = S.wx(c.weather_code, c.is_day);
    mainMarker = L.marker([loc.lat, loc.lon], { icon: tempIcon(c.temperature_2m, c.weather_code, c.is_day, true), zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(popupHtml(S.locName(loc), c.temperature_2m, w, c.relative_humidity_2m, c.wind_speed_10m, null));
    updateRadarLabels();
  }

  function popupHtml(title, temp, w, hum, wind, btnData) {
    return `<div class="map-popup">
      <strong>${S.esc(title)}</strong>
      <div class="row">${S.icon(w.icon)}<b>${Math.round(temp)}°C</b></div>
      <p>${S.esc(w.text)}</p>
      <p>${S.t('common.humidity')}: ${hum}% · ${S.t('common.wind')}: ${Math.round(wind)} ${S.t('unit.kmh')}</p>
      ${btnData ? `<button class="btn btn-primary go-here" type="button" data-lat="${btnData.lat}" data-lon="${btnData.lon}">${S.t('map.here')}</button>` : ''}
    </div>`;
  }

  /* --- Click bất kỳ điểm nào --- */
  async function showPoint(lat, lon) {
    const popup = L.popup().setLatLng([lat, lon]).setContent(`<div class="map-popup">${S.t('map.loading')}</div>`).openOn(map);
    try {
      const [r] = await S.getCurrentMany([{ lat, lon }]);
      const c = r.current;
      const w = S.wx(c.weather_code, c.is_day);
      const title = S.t('map.point') + ` (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      popup.setContent(popupHtml(title, c.temperature_2m, w, c.relative_humidity_2m, c.wind_speed_10m, { lat: lat.toFixed(4), lon: lon.toFixed(4) }));
    } catch (e) {
      popup.setContent(`<div class="map-popup">${S.esc(S.errorText(e))}</div>`);
    }
  }

  document.getElementById('map').addEventListener('click', e => {
    const b = e.target.closest('.go-here');
    if (!b) return;
    const lat = +b.dataset.lat, lon = +b.dataset.lon;
    S.setLocation({
      name: { vi: `Điểm ${lat.toFixed(2)}, ${lon.toFixed(2)}`, en: `Point ${lat.toFixed(2)}, ${lon.toFixed(2)}` },
      country: '', lat, lon
    });
    window.location.href = 'index.html';
  });

  /* --- Nhiệt độ các thành phố --- */
  async function loadCities() {
    try {
      const res = await S.getCurrentMany(S.POPULAR);
      cityData = res.map((r, i) => ({ city: S.POPULAR[i], cur: r.current }));
      drawCities();
    } catch (e) {
      document.getElementById('city-temps').innerHTML = `<li>${S.esc(S.errorText(e))}</li>`;
    }
  }

  function drawCities() {
    cityLayer.clearLayers();
    cityData.forEach(({ city, cur }) => {
      const w = S.wx(cur.weather_code, cur.is_day);
      L.marker([city.lat, city.lon], { icon: tempIcon(cur.temperature_2m, cur.weather_code, cur.is_day) })
        .bindPopup(popupHtml(S.locName(city), cur.temperature_2m, w, cur.relative_humidity_2m, cur.wind_speed_10m, { lat: city.lat, lon: city.lon }))
        .addTo(cityLayer);
    });
    document.getElementById('city-temps').innerHTML = cityData.map(({ city, cur }, i) => {
      const w = S.wx(cur.weather_code, cur.is_day);
      return `<li data-i="${i}" tabindex="0"><span>${S.icon(w.icon, 'wx-icon', w.text)}${S.esc(S.locName(city))}</span><b>${S.fmt.temp(cur.temperature_2m)}</b></li>`;
    }).join('');
  }

  document.getElementById('city-temps').addEventListener('click', e => {
    const li = e.target.closest('li[data-i]');
    if (!li || !map) return;
    const { city } = cityData[+li.dataset.i];
    map.setView([city.lat, city.lon], 8);
  });

  document.getElementById('toggle-cities').addEventListener('change', e => {
    if (!map) return;
    if (e.target.checked) cityLayer.addTo(map); else cityLayer.remove();
  });

  /* --- Radar mưa (RainViewer) --- */
  async function initRadar() {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error('radar');
      const json = await res.json();
      radar.host = json.host;
      radar.frames = (json.radar && json.radar.past) || [];
      if (!radar.frames.length) throw new Error('radar');
      radar.index = radar.frames.length - 1;
      radar.layer = L.tileLayer(frameUrl(radar.frames[radar.index]), {
        opacity: 0.65, maxNativeZoom: 7, maxZoom: 16, zIndex: 400,
        attribution: '<a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>'
      });
      if (document.getElementById('toggle-radar').checked) radar.layer.addTo(map);
    } catch (e) {
      radar.frames = [];
      radar.failed = true;
    }
    updateRadarLabels();
  }

  const frameUrl = f => `${radar.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`;

  function showFrame(i) {
    radar.index = i;
    radar.layer.setUrl(frameUrl(radar.frames[i]));
    updateRadarLabels();
  }

  function updateRadarLabels() {
    const timeEl = document.getElementById('radar-time');
    const playBtn = document.getElementById('radar-play');
    if (!radar.frames.length) {
      timeEl.textContent = radar.failed ? S.t('map.radarNA') : '';
      playBtn.hidden = true;
      return;
    }
    playBtn.hidden = false;
    const f = radar.frames[radar.index];
    const time = new Intl.DateTimeFormat(S.locale(), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(f.time * 1000));
    timeEl.textContent = S.t('map.radarTime', { t: time });
    playBtn.textContent = radar.timer ? S.t('map.pause') : S.t('map.play');
  }

  document.getElementById('radar-play').addEventListener('click', () => {
    if (!radar.layer) return;
    if (radar.timer) {
      clearInterval(radar.timer);
      radar.timer = null;
      showFrame(radar.frames.length - 1);
      return;
    }
    if (!map.hasLayer(radar.layer)) { radar.layer.addTo(map); document.getElementById('toggle-radar').checked = true; }
    let i = 0;
    showFrame(0);
    radar.timer = setInterval(() => {
      i = (i + 1) % radar.frames.length;
      showFrame(i);
    }, 900);
    updateRadarLabels();
  });

  document.getElementById('toggle-radar').addEventListener('change', e => {
    if (!radar.layer || !map) return;
    if (e.target.checked) radar.layer.addTo(map); else radar.layer.remove();
  });

  document.addEventListener('skycast:lang', () => {
    if (cityData.length) drawCities();
    updateRadarLabels();
  });

  void app;
})();
