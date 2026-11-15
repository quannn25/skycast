/* SkyCast — Trang giới thiệu */
'use strict';

(() => {
  const S = SkyCast;

  S.extend({
    vi: {
      'about.title': 'Giới thiệu SkyCast',
      'about.p1': 'SkyCast là website dự báo thời tiết giúp người dùng — đặc biệt là sinh viên và người đi làm — tra cứu thông tin thời tiết nhanh chóng, rõ ràng trên cả máy tính và điện thoại.',
      'about.p2': 'Website hiển thị dữ liệu thời tiết thực tế (không phải nội dung tĩnh): tìm kiếm thành phố, xem điều kiện hiện tại, dự báo theo giờ, dự báo 7 ngày, biểu đồ nhiệt độ và bản đồ radar mưa.',
      'about.features': 'Tính năng chính',
      'about.f1t': 'Tìm kiếm thành phố', 'about.f1': 'Gợi ý kết quả khi gõ, hỗ trợ tiếng Việt có dấu và định vị vị trí hiện tại.',
      'about.f2t': 'Thời tiết hiện tại', 'about.f2': 'Nhiệt độ, cảm giác thực, độ ẩm, gió, áp suất, chỉ số UV, giờ mặt trời mọc/lặn.',
      'about.f3t': 'Dự báo theo giờ', 'about.f3': 'Dự báo đến 72 giờ kèm biểu đồ nhiệt độ và khả năng mưa.',
      'about.f4t': 'Dự báo 7 ngày', 'about.f4': 'Nhiệt độ cao/thấp, xác suất mưa và chi tiết cho từng ngày.',
      'about.f5t': 'Bản đồ thời tiết', 'about.f5': 'Radar mưa động, nhiệt độ các thành phố, nhấn vào bản đồ để xem thời tiết.',
      'about.f6t': 'Responsive & song ngữ', 'about.f6': 'Hiển thị tốt trên mọi màn hình, chuyển đổi Tiếng Việt / English.',
      'about.data': 'Nguồn dữ liệu',
      'about.dataP1': 'Dữ liệu dự báo và tìm kiếm địa điểm được cung cấp bởi <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> — API thời tiết mở, miễn phí cho mục đích phi thương mại, theo giấy phép <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.',
      'about.dataP2': 'Bản đồ nền từ <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> (dữ liệu có nguồn từ OpenStreetMap), ảnh radar mưa từ <a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>. Dữ liệu được cập nhật mỗi lần tải trang.',
      'about.tech': 'Công nghệ sử dụng',
      'about.t.structure': 'Cấu trúc', 'about.t.style': 'Giao diện', 'about.t.logic': 'Chức năng', 'about.t.data': 'Dữ liệu thời tiết',
      'about.t.chart': 'Biểu đồ', 'about.t.map': 'Bản đồ', 'about.t.graphic': 'Đồ họa', 'about.t.host': 'Hosting',
      'about.team': 'Nhóm thực hiện',
      'about.teamSub': 'Đề án môn Thiết kế Web và Đồ họa — Lớp TINV205DV01_L4.',
      'about.member': 'Thành viên',
      'about.role1': 'Tổng hợp tài liệu / nghiên cứu API', 'about.role2': 'Thiết kế đồ họa', 'about.role3': 'Lập trình giao diện',
      'about.role4': 'Lập trình chức năng', 'about.role5': 'Biên tập báo cáo',
      'about.sitemap': 'Sơ đồ website',
      'about.contact': 'Liên hệ',
      'about.contactP': 'Mọi góp ý về website xin gửi về email của nhóm.',
      'about.school': 'Khoa Kinh tế Thương mại — Trường Đại học Hoa Sen, TP. Hồ Chí Minh, 2026.',
      'sm.home': 'Trang chủ (tìm kiếm + thời tiết hiện tại)',
      'sm.hourly': 'Theo giờ (dự báo giờ + biểu đồ)',
      'sm.weekly': 'Theo tuần (dự báo 7 ngày)',
      'sm.map': 'Bản đồ (radar mưa + nhiệt độ)',
      'sm.about': 'Giới thiệu (nguồn dữ liệu + nhóm)'
    },
    en: {
      'about.title': 'About SkyCast',
      'about.p1': 'SkyCast is a weather forecast website that helps users — especially students and office workers — check the weather quickly and clearly on both desktop and mobile.',
      'about.p2': 'The site shows live weather data (not static content): city search, current conditions, hourly forecasts, a 7-day forecast, temperature charts and a rain radar map.',
      'about.features': 'Key features',
      'about.f1t': 'City search', 'about.f1': 'Suggestions as you type, Vietnamese diacritics support and current location detection.',
      'about.f2t': 'Current weather', 'about.f2': 'Temperature, feels-like, humidity, wind, pressure, UV index, sunrise and sunset.',
      'about.f3t': 'Hourly forecast', 'about.f3': 'Up to 72 hours ahead with temperature and rain probability charts.',
      'about.f4t': '7-day forecast', 'about.f4': 'Daily highs/lows, chance of rain and details for each day.',
      'about.f5t': 'Weather map', 'about.f5': 'Animated rain radar, city temperatures, and click-anywhere weather.',
      'about.f6t': 'Responsive & bilingual', 'about.f6': 'Works on every screen size, switch between Vietnamese and English.',
      'about.data': 'Data sources',
      'about.dataP1': 'Forecast data and location search are provided by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> — an open weather API, free for non-commercial use, under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> license.',
      'about.dataP2': 'Base map from <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> (with data sourced from OpenStreetMap), rain radar imagery from <a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>. Data refreshes on every page load.',
      'about.tech': 'Technology',
      'about.t.structure': 'Structure', 'about.t.style': 'Styling', 'about.t.logic': 'Functionality', 'about.t.data': 'Weather data',
      'about.t.chart': 'Charts', 'about.t.map': 'Map', 'about.t.graphic': 'Graphics', 'about.t.host': 'Hosting',
      'about.team': 'Project team',
      'about.teamSub': 'Web & Graphic Design course project — Class TINV205DV01_L4.',
      'about.member': 'Member',
      'about.role1': 'Research / API study', 'about.role2': 'Graphic design', 'about.role3': 'UI development',
      'about.role4': 'Feature development', 'about.role5': 'Report editing',
      'about.sitemap': 'Sitemap',
      'about.contact': 'Contact',
      'about.contactP': 'Please send any feedback about the website to our team email.',
      'about.school': 'Faculty of Commerce — Hoa Sen University, Ho Chi Minh City, 2026.',
      'sm.home': 'Home (search + current weather)',
      'sm.hourly': 'Hourly (hourly forecast + chart)',
      'sm.weekly': 'Weekly (7-day forecast)',
      'sm.map': 'Map (rain radar + temperatures)',
      'sm.about': 'About (data sources + team)'
    }
  });

  S.init('about', { needsData: false });

  const FEATURES = [['search', 1], ['thermo', 2], ['chart', 3], ['calendar', 4], ['map', 5], ['mobile', 6]];

  function render() {
    document.getElementById('features').innerHTML = FEATURES.map(([ic, n]) =>
      `<div class="card feature"><div class="stat-icon">${S.ui(ic)}</div>
        <h3>${S.t('about.f' + n + 't')}</h3><p>${S.t('about.f' + n)}</p></div>`).join('');
    document.getElementById('sitemap').textContent = [
      'SkyCast',
      ' ├─ index.html   ' + S.t('sm.home'),
      ' ├─ hourly.html  ' + S.t('sm.hourly'),
      ' ├─ weekly.html  ' + S.t('sm.weekly'),
      ' ├─ map.html     ' + S.t('sm.map'),
      ' └─ about.html   ' + S.t('sm.about')
    ].join('\n');
    S.applyI18n();
  }

  render();
  document.addEventListener('skycast:lang', render);
})();
