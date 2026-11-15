/* SkyCast — Trang dự báo theo tuần */
'use strict';

(() => {
  const S = SkyCast;

  S.extend({
    vi: {
      'weekly.title': 'Dự báo 7 ngày',
      'weekly.hint': 'Chọn một ngày để xem chi tiết.',
      'weekly.dayChart': 'Nhiệt độ theo giờ — {d}',
      'weekly.windMax': 'Gió mạnh nhất',
      'weekly.range': 'Nhiệt độ {lo}° – {hi}°'
    },
    en: {
      'weekly.title': '7-day forecast',
      'weekly.hint': 'Select a day to see its details.',
      'weekly.dayChart': 'Hourly temperature — {d}',
      'weekly.windMax': 'Max wind',
      'weekly.range': 'Temperature {lo}° – {hi}°'
    }
  });

  S.chartDefaults();
  let selected = 0;
  let chart = null;
  let last = null;

  S.init('weekly', { render: (data, loc) => { last = { data, loc }; draw(); } });

  document.getElementById('week').addEventListener('click', e => {
    const card = e.target.closest('.day-card');
    if (!card) return;
    selected = +card.dataset.i;
    document.querySelectorAll('.day-card').forEach(c => c.setAttribute('aria-pressed', String(c === card)));
    drawDetail();
  });

  function draw() {
    const { data, loc } = last;
    const d = data.daily;
    if (selected >= d.time.length) selected = 0;
    const sub = S.locSub(loc);
    document.getElementById('loc-line').textContent = S.locName(loc) + (sub ? ' · ' + sub : '');

    document.getElementById('week').innerHTML = d.time.map((day, i) => {
      const w = S.wx(d.weather_code[i], 1);
      return `<button type="button" class="day-card" data-i="${i}" aria-pressed="${i === selected}">
        <span class="dname">${S.fmt.weekday(day, data.current.time)}</span>
        <span class="ddate">${S.fmt.dayMonth(day)}</span>
        ${S.icon(w.icon, 'wx-icon', w.text)}
        <span class="temps">${S.fmt.temp(d.temperature_2m_max[i])} <span>/ ${S.fmt.temp(d.temperature_2m_min[i])}</span></span>
        <span class="rain">☂ ${d.precipitation_probability_max[i] ?? 0}%</span>
      </button>`;
    }).join('');
    drawDetail();
  }

  function drawDetail() {
    const { data } = last;
    const d = data.daily;
    const h = data.hourly;
    const i = selected;
    const day = d.time[i];
    const w = S.wx(d.weather_code[i], 1);
    const kv = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;

    document.getElementById('day-detail').innerHTML = `
      <div class="detail-head">
        ${S.icon(w.icon, 'wx-icon', w.text)}
        <div>
          <h2>${S.fmt.full(day)}</h2>
          <p>${S.esc(w.text)} · ${S.t('weekly.range', { lo: Math.round(d.temperature_2m_min[i]), hi: Math.round(d.temperature_2m_max[i]) })}</p>
        </div>
      </div>
      <dl class="kv">
        ${kv(S.t('common.max'), S.fmt.temp(d.temperature_2m_max[i]))}
        ${kv(S.t('common.min'), S.fmt.temp(d.temperature_2m_min[i]))}
        ${kv(S.t('common.rainChance'), (d.precipitation_probability_max[i] ?? 0) + '%')}
        ${kv(S.t('common.rainSum'), S.fmt.num(d.precipitation_sum[i], 1) + ' mm')}
        ${kv(S.t('weekly.windMax'), Math.round(d.wind_speed_10m_max[i]) + ' ' + S.t('unit.kmh') + ' ' + S.fmt.windDir(d.wind_direction_10m_dominant[i]))}
        ${kv(S.t('common.uv'), S.fmt.num(d.uv_index_max[i], 1) + ' · ' + S.fmt.uv(d.uv_index_max[i]))}
        ${kv(S.t('common.sunrise'), S.fmt.hour(d.sunrise[i]))}
        ${kv(S.t('common.sunset'), S.fmt.hour(d.sunset[i]))}
      </dl>`;

    /* Giờ của ngày được chọn (mỗi 3 giờ cho thẻ, đủ 24 giờ cho biểu đồ) */
    const idx = [];
    h.time.forEach((tm, k) => { if (tm.slice(0, 10) === day) idx.push(k); });
    document.getElementById('day-chart-title').textContent = S.t('weekly.dayChart', { d: S.fmt.weekday(day, data.current.time) + ' ' + S.fmt.dayMonth(day) });

    if (window.Chart) {
      if (chart) chart.destroy();
      const ctx = document.getElementById('day-chart').getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 200);
      grad.addColorStop(0, 'rgba(14,165,233,0.3)');
      grad.addColorStop(1, 'rgba(14,165,233,0)');
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: idx.map(k => S.fmt.hour(h.time[k])),
          datasets: [{
            label: S.t('common.temp'), data: idx.map(k => h.temperature_2m[k]),
            borderColor: '#0ea5e9', backgroundColor: grad, fill: true, tension: 0.35,
            pointRadius: 2, pointHoverRadius: 5, borderWidth: 2.5
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: it => ' ' + it.parsed.y.toFixed(1) + '°C · ☂ ' + (h.precipitation_probability[idx[it.dataIndex]] ?? 0) + '%' } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 10 } },
            y: { ticks: { callback: v => v + '°' }, grace: '10%' }
          }
        }
      });
    }

    document.getElementById('day-hours').innerHTML = idx.filter(k => +h.time[k].slice(11, 13) % 3 === 0).map(k => {
      const hw = S.wx(h.weather_code[k], h.is_day[k]);
      return `<div class="hour-card">
        <div class="time">${S.fmt.hour(h.time[k])}</div>
        ${S.icon(hw.icon, 'wx-icon', hw.text)}
        <div class="temp">${S.fmt.temp(h.temperature_2m[k])}</div>
        <div class="rain">${S.ui('drop', 'width="12" height="12"')}${h.precipitation_probability[k] ?? 0}%</div>
      </div>`;
    }).join('');
  }
})();
