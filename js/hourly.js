/* SkyCast — Trang dự báo theo giờ */
'use strict';

(() => {
  const S = SkyCast;

  S.extend({
    vi: {
      'hourly.title': 'Dự báo theo giờ',
      'hourly.r24': '24 giờ', 'hourly.r48': '48 giờ', 'hourly.r72': '72 giờ',
      'hourly.cards': 'Từng giờ',
      'hourly.table': 'Bảng chi tiết'
    },
    en: {
      'hourly.title': 'Hourly forecast',
      'hourly.r24': '24 hours', 'hourly.r48': '48 hours', 'hourly.r72': '72 hours',
      'hourly.cards': 'Hour by hour',
      'hourly.table': 'Detailed table'
    }
  });

  S.chartDefaults();
  let range = 24;
  let chart = null;
  let last = null;

  const app = S.init('hourly', { render: (data, loc) => { last = { data, loc }; draw(); } });

  document.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => {
    range = +b.dataset.range;
    document.querySelectorAll('[data-range]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (last) draw();
  }));

  function draw() {
    const { data, loc } = last;
    const h = data.hourly;
    const start = S.currentHourIndex(data);
    const end = Math.min(start + range, h.time.length);
    const idx = [];
    for (let i = start; i < end; i++) idx.push(i);

    const sub = S.locSub(loc);
    document.getElementById('loc-line').textContent = S.locName(loc) + (sub ? ' · ' + sub : '') + ' · ' + S.t('common.updated', { t: S.fmt.hour(data.current.time) });

    /* --- Biểu đồ --- */
    const labels = idx.map(i => {
      const hr = S.fmt.hour(h.time[i]);
      return hr === '00:00' ? [hr, S.fmt.dayMonth(h.time[i].slice(0, 10))] : hr;
    });
    const temps = idx.map(i => h.temperature_2m[i]);
    const rain = idx.map(i => h.precipitation_probability[i] ?? 0);

    if (window.Chart) {
      if (chart) chart.destroy();
      const ctx = document.getElementById('temp-chart').getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(249,115,22,0.28)');
      grad.addColorStop(1, 'rgba(249,115,22,0)');
      chart = new Chart(ctx, {
        data: {
          labels,
          datasets: [
            {
              type: 'line', label: S.t('common.temp'), data: temps, yAxisID: 'y',
              borderColor: '#f97316', backgroundColor: grad, fill: true, tension: 0.35,
              pointRadius: range > 24 ? 0 : 3, pointHoverRadius: 6, pointBackgroundColor: '#f97316', borderWidth: 2.5, order: 1
            },
            {
              type: 'bar', label: S.t('common.rainChance'), data: rain, yAxisID: 'y1',
              backgroundColor: 'rgba(147,197,253,0.55)', borderRadius: 4, order: 2, barPercentage: 0.9, categoryPercentage: 0.9
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: items => {
                  const i = idx[items[0].dataIndex];
                  return S.fmt.weekday(h.time[i].slice(0, 10), data.current.time) + ' · ' + S.fmt.hour(h.time[i]);
                },
                label: item => item.dataset.yAxisID === 'y'
                  ? ' ' + S.t('common.temp') + ': ' + item.parsed.y.toFixed(1) + '°C'
                  : ' ' + S.t('common.rainChance') + ': ' + item.parsed.y + '%'
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } },
            y: { position: 'left', ticks: { callback: v => v + '°' }, grace: '10%' },
            y1: { position: 'right', min: 0, max: 100, grid: { display: false }, ticks: { callback: v => v + '%' } }
          }
        }
      });
    }

    /* --- Thẻ từng giờ --- */
    document.getElementById('hour-cards').innerHTML = idx.map(i => {
      const w = S.wx(h.weather_code[i], h.is_day[i]);
      const isNow = i === start;
      const hr = S.fmt.hour(h.time[i]);
      return `<div class="hour-card ${isNow ? 'now' : ''}">
        ${hr === '00:00' && !isNow ? `<div class="day-label">${S.fmt.weekday(h.time[i].slice(0, 10), data.current.time)}</div>` : ''}
        <div class="time">${isNow ? S.t('common.now') : hr}</div>
        ${S.icon(w.icon, 'wx-icon', w.text)}
        <div class="temp">${S.fmt.temp(h.temperature_2m[i])}</div>
        <div class="rain">${S.ui('drop', 'width="12" height="12"')}${h.precipitation_probability[i] ?? 0}%</div>
        <div class="muted">${Math.round(h.wind_speed_10m[i])} ${S.t('unit.kmh')}</div>
      </div>`;
    }).join('');

    /* --- Bảng chi tiết --- */
    document.getElementById('hour-table').innerHTML = idx.map(i => {
      const w = S.wx(h.weather_code[i], h.is_day[i]);
      return `<tr>
        <td><b>${S.fmt.hour(h.time[i])}</b> <span class="muted">${S.fmt.dayMonth(h.time[i].slice(0, 10))}</span></td>
        <td><div class="cell-wx">${S.icon(w.icon)}${S.esc(w.text)}</div></td>
        <td><b>${S.fmt.temp(h.temperature_2m[i])}</b></td>
        <td>${S.fmt.temp(h.apparent_temperature[i])}</td>
        <td>${h.precipitation_probability[i] ?? 0}%</td>
        <td>${S.fmt.num(h.precipitation[i], 1)} mm</td>
        <td>${h.relative_humidity_2m[i]}%</td>
        <td>${Math.round(h.wind_speed_10m[i])} ${S.t('unit.kmh')} ${S.fmt.windDir(h.wind_direction_10m[i])}</td>
      </tr>`;
    }).join('');
  }

  void app;
})();
