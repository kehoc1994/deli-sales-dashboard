# Dashboard quản trị bán hàng Deli Q3/2026

Dashboard cho Trưởng phòng và Ban Giám đốc. Dữ liệu được đọc trực tiếp từ Google Sheet **Demo9** (tab `Du_lieu_sach`, dữ liệu đã làm sạch) mỗi lần mở trang hoặc nhấn nút **Làm mới dữ liệu**.

## Cấu trúc

| File | Vai trò |
|---|---|
| `index.html` | Giao diện dashboard (HTML/CSS/JS thuần, biểu đồ SVG, không cần thư viện) |
| `api/data.js` | Hàm serverless trên Vercel: đọc Google Sheet, chỉ lấy các cột cần thiết, trả JSON, không cache |
| `logo.png` | Logo Deli |

Mã nhân viên và mã khách hàng (cột E, F của sheet) không được đọc và không hiển thị.

## Cấu hình trên Vercel

| Biến môi trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `SHEET_ID` | Có | ID của Google Sheet (phần giữa `/d/` và `/edit` trong link) |
| `SHEET_TAB` | Không | Tên tab, mặc định `Du_lieu_sach` |

Sheet cần được chia sẻ ở chế độ **Bất kỳ ai có đường liên kết: Người xem** để hàm serverless đọc được.

## Quy tắc tính KPI

Một đơn được tính vào KPI khi: trạng thái là "Hoàn thành" ("Hoàn tất" được chuẩn hóa), mã đơn xuất hiện lần đầu, có đủ Số lượng, Đơn giá, Chiết khấu, và Doanh thu khớp `Đơn giá × Số lượng × (1 − Chiết khấu)` với sai lệch tối đa 1 VND.

Dữ liệu giả lập phục vụ đào tạo; không dùng cho quyết định kinh doanh thật.
