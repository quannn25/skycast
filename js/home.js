/* SkyCast — Trang chủ */
'use strict';

(() => {
  const S = SkyCast;

  S.extend({
    vi: {
      'home.title': 'Dự báo thời tiết',
      'home.heroTitle': 'Thời tiết hôm nay, rõ ràng trong tích tắc',
      'home.heroLead': 'Tìm thành phố để xem nhiệt độ, độ ẩm, gió và dự báo những ngày tới.',
      'home.nextHours': 'Các giờ tới',
      'home.nextDays': '7 ngày tới',
      'home.seeHourly': 'Xem theo giờ',
      'home.seeWeekly': 'Xem theo tuần',
      'home.summary': 'Hôm nay nhiệt độ từ {lo}° đến {hi}°, khả năng mưa cao nhất {p}%. Ngày mai: {cond}, {lo2}°–{hi2}°.',
      'home.rainSoon': 'Có thể mưa vào khoảng {h} (khả năng {p}%). Nhớ mang theo ô!',
      'home.noRain': 'Không có mưa đáng kể trong 12 giờ tới.'
    },
    en: {
      'home.title': 'Weather forecast',
      'home.heroTitle': "Today's weather, clear at a glance",
      'home.heroLead': 'Search for a city to see temperature, humidity, wind and the days ahead.',
      'home.nextHours': 'Next hours',
      'home.nextDays': 'Next 7 days',
      'home.seeHourly': 'Hourly forecast',
      'home.seeWeekly': 'Weekly forecast',
      'home.summary': 'Today ranges from {lo}° to {hi}°, with up to {p}% chance of rain. Tomorrow: {cond}, {lo2}°–{hi2}°.',
      'home.rainSoon': 'Rain is likely around {h} ({p}% chance). Bring an umbrella!',
      'home.noRain': 'No significant rain expected in the next 12 hours.'
    }
  });

  const app = S.init('home', { render });

  /* Chip thành phố phổ biến */
  const chips = document.getElementById('chips');
  function renderChips() {
    chips.innerHTML = S.POPULAR.slice(0, 8).map((c, i) =>
      `<button type="button" class="chip" data-i="${i}">${S.esc(S.locName(c))}</button>`).join('');
  }
  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (b) app.selectLocation(S.POPULAR[+b.dataset.i]);
  });
  renderChips();
  document.addEventListener('skycast:lang', renderChips);

  function stat(iconName, label, value) {
    return `<div class="stat"><div class="stat-icon">${S.ui(iconName)}</div>
      <div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div></div>`;
  }

  function render(data, loc) {
    const c = data.current;
    const d = data.daily;
    const w = S.wx(c.weather_code, c.is_day);
    const sub = S.locSub(loc);

    /* --- Thẻ thời tiết hiện tại --- */
    document.getElementById('current').innerHTML = `
      <div class="current-main ${w.theme}">
        <div class="current-loc">${S.ui('pin')}<span>${S.esc(S.locName(loc))}</span></div>
        <div class="current-time">${sub ? S.esc(sub) + ' · ' : ''}${S.fmt.full(c.time)} · ${S.fmt.hour(c.time)}</div>
        <div class="current-body">
          ${S.icon(w.icon, 'wx-icon', w.text)}
          <div>
            <div class="current-temp">${Math.round(c.temperature_2m)}<sup>°C</sup></div>
            <div class="current-cond">${S.esc(w.text)}</div>
            <div class="current-meta">${S.t('common.feels')} ${S.fmt.temp(c.apparent_temperature)} · ${S.t('common.hiLo', { hi: Math.round(d.temperature_2m_max[0]), lo: Math.round(d.temperature_2m_min[0]) })}</div>
          </div>
        </div>
      </div>
      <div class="stats">
        ${stat('drop', S.t('common.humidity'), c.relative_humidity_2m + '<small>%</small>')}
        ${stat('wind', S.t('common.wind'), Math.round(c.wind_speed_10m) + ' <small>' + S.t('unit.kmh') + ' ' + S.fmt.windDir(c.wind_direction_10m) + '</small>')}
        ${stat('umbrella', S.t('common.rainChance'), (d.precipitation_probability_max[0] ?? '–') + '<small>%</small>')}
        ${stat('gauge', S.t('common.pressure'), Math.round(c.pressure_msl) + ' <small>hPa</small>')}
        ${stat('sun', S.t('common.uv'), S.fmt.num(d.uv_index_max[0], 1) + ' <small>' + S.fmt.uv(d.uv_index_max[0]) + '</small>')}
        ${stat('cloud', S.t('common.cloud'), c.cloud_cover + '<small>%</small>')}
        ${stat('sunrise', S.t('common.sunrise'), S.fmt.hour(d.sunrise[0]))}
        ${stat('sunset', S.t('common.sunset'), S.fmt.hour(d.sunset[0]))}
      </div>`;

    /* --- Các giờ tới --- */
    const h = data.hourly;
    const start = S.currentHourIndex(data);
    const hours = [];
    for (let i = start; i < Math.min(start + 12, h.time.length); i++) {
      const hw = S.wx(h.weather_code[i], h.is_day[i]);
      hours.push(`<div class="hour-card ${i === start ? 'now' : ''}">
        <div class="time">${i === start ? S.t('common.now') : S.fmt.hour(h.time[i])}</div>
        ${S.icon(hw.icon, 'wx-icon', hw.text)}
        <div class="temp">${S.fmt.temp(h.temperature_2m[i])}</div>
        <div class="rain">${S.ui('drop', 'width="12" height="12"')}${h.precipitation_probability[i] ?? 0}%</div>
      </div>`);
    }
    document.getElementById('next-hours').innerHTML = hours.join('');

    /* --- Tóm tắt --- */
    const tw = S.wx(d.weather_code[1], 1);
    let rainIdx = -1;
    for (let i = start; i < Math.min(start + 12, h.time.length); i++) {
      if ((h.precipitation_probability[i] ?? 0) >= 50) { rainIdx = i; break; }
    }
    const rainLine = rainIdx >= 0
      ? S.t('home.rainSoon', { h: S.fmt.hour(h.time[rainIdx]), p: h.precipitation_probability[rainIdx] })
      : S.t('home.noRain');
    document.getElementById('summary').textContent = S.t('home.summary', {
      lo: Math.round(d.temperature_2m_min[0]), hi: Math.round(d.temperature_2m_max[0]),
      p: d.precipitation_probability_max[0] ?? 0,
      cond: tw.text.toLowerCase(), lo2: Math.round(d.temperature_2m_min[1]), hi2: Math.round(d.temperature_2m_max[1])
    }) + ' ' + rainLine;

    /* --- 7 ngày tới --- */
    const minAll = Math.min(...d.temperature_2m_min);
    const maxAll = Math.max(...d.temperature_2m_max);
    const span = Math.max(1, maxAll - minAll);
    document.getElementById('days').innerHTML = d.time.map((day, i) => {
      const dw = S.wx(d.weather_code[i], 1);
      const left = ((d.temperature_2m_min[i] - minAll) / span) * 100;
      const width = ((d.temperature_2m_max[i] - d.temperature_2m_min[i]) / span) * 100;
      return `<li>
        <div class="d-name">${S.fmt.weekday(day, c.time)}<small>${S.fmt.dayMonth(day)}</small></div>
        ${S.icon(dw.icon, 'wx-icon', dw.text)}
        <div class="range"><span class="lo">${S.fmt.temp(d.temperature_2m_min[i])}</span>
          <div class="range-bar"><span style="left:${left}%;width:${Math.max(width, 4)}%"></span></div>
          <span class="hi">${S.fmt.temp(d.temperature_2m_max[i])}</span></div>
        <div class="rain">${d.precipitation_probability_max[i] ?? 0}%</div>
      </li>`;
    }).join('');
  }
})();
