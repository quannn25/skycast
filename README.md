# SkyCast — Website dự báo thời tiết

Đề án môn Thiết kế Web & Đồ họa (ĐH Hoa Sen). Website tĩnh: HTML + CSS + JavaScript, không cần backend, không cần API key.

## Cấu trúc

```
index.html     Trang chủ: tìm thành phố, thời tiết hiện tại, các giờ tới, 7 ngày tới
hourly.html    Dự báo theo giờ (24/48/72h), biểu đồ nhiệt độ + khả năng mưa, bảng chi tiết
weekly.html    Dự báo 7 ngày, chọn ngày để xem chi tiết + biểu đồ theo giờ của ngày đó
map.html       Bản đồ Leaflet: radar mưa (RainViewer, có phát lại), nhiệt độ 10 thành phố, nhấn bản đồ để xem thời tiết
about.html     Giới thiệu, nguồn dữ liệu, công nghệ, nhóm thực hiện, sơ đồ website
css/style.css  Toàn bộ giao diện (biến màu, card, responsive)
js/common.js   Dùng chung: song ngữ Việt/Anh, gọi API Open-Meteo, header/footer, ô tìm kiếm, icon SVG
js/*.js        Mã riêng của từng trang
assets/logo.svg
```

## Chạy thử

- Cách nhanh nhất: mở `index.html` bằng Chrome/Edge (nhấp đúp).
- Hoặc dùng extension **Live Server** trong VS Code.

## Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub và tải toàn bộ thư mục này lên (bỏ các file PDF nếu không cần).
2. Vào **Settings → Pages**, chọn nhánh `main`, thư mục `/ (root)` → **Save**.
3. Sau khoảng 1 phút, website có tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Nguồn dữ liệu

- Thời tiết & tìm địa điểm: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0)
- Radar mưa: [RainViewer](https://www.rainviewer.com/)
- Bản đồ nền: Esri Light Gray Canvas
- Biểu đồ: [Chart.js](https://www.chartjs.org/) 4.4.1 · Bản đồ: [Leaflet](https://leafletjs.com/) 1.9.4

## Cần tự điền

- Tên thành viên và email liên hệ trong `about.html` (hiện là "Thành viên 1…5" và `skycast.team@example.com`).
