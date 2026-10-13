# Vải Chàm – trang demo kiểm thử usability

Web bán áo thun giả lập, gồm 3 file: `index.html`, `style.css`, `script.js`.

## Hai phiên bản trên cùng một code

| Phiên bản | Cách mở | Mục đích |
|---|---|---|
| **A** (mặc định) | `index.html` | Có lỗi usability CỐ Ý, dùng để cho người dùng test |
| **B** | `index.html?v=b` | Bản đã cải thiện, dùng để so sánh trước/sau |

Khi chạy trên GitHub Pages, bản B có dạng `https://<tên>.github.io/<repo>/?v=b`.

## Lỗi cố ý ở phiên bản A (để đối chiếu với kết quả test)

- Nút giỏ hàng nhỏ, chữ xanh nhạt trên nền xanh đậm (tương phản thấp).
- Không có bộ lọc loại sản phẩm, tên và giá chữ nhỏ, màu xám nhạt.
- Nút quay lại chỉ là ký hiệu "‹".
- Nút thêm vào giỏ ghi "OK", nhỏ, màu xám; bấm khi chưa chọn size thì không báo gì; thêm xong không có thông báo.
- Giỏ hàng: nút xóa chỉ là chữ "×" rất nhỏ, không chỉnh được số lượng, nút sang bước sau ghi "Tiếp".
- Thanh toán: ô nhập không có nhãn (chỉ có placeholder), nút "Gửi", nhập sai chỉ hiện "Dữ liệu không hợp lệ." mà không nói ô nào sai.
- Trang cuối chỉ ghi "Đã gửi."

Bản B sửa tất cả các điểm trên (nhãn rõ, nút chọn size, thông báo, ô lỗi theo từng trường, có mã đơn hàng).

## 3 nhiệm vụ test mẫu

1. Tìm **áo thun trắng** và thêm **size M** vào giỏ hàng.
2. Mở giỏ hàng và **xóa** một sản phẩm.
3. **Đặt hàng** hoàn tất (nhập tên, số điện thoại 10 số, địa chỉ).

Số liệu nên ghi: hoàn thành được hay không, thời gian làm, số lần bấm nhầm, người dùng nhận xét gì.

## Đưa lên GitHub Pages (để có link gửi bạn bè)

1. Tạo repo mới trên GitHub, tải 3 file (`index.html`, `style.css`, `script.js`) lên.
2. Vào **Settings → Pages**, chọn nhánh `main`, thư mục `/ (root)`, bấm Save.
3. Đợi 1 đến 2 phút, GitHub cấp link dạng `https://<tên>.github.io/<repo>/`.

## Gắn Microsoft Clarity (tuỳ chọn)

1. Đăng ký miễn phí tại clarity.microsoft.com, tạo project, copy đoạn script.
2. Dán vào `index.html` ở chỗ có ghi chú "MICROSOFT CLARITY" (trong thẻ `<head>`).
3. Cho bạn bè làm 3 nhiệm vụ trên link GitHub Pages, sau đó xem heatmap và session replay.
   Có thể mất vài phút đến vài giờ để dữ liệu hiện lên.

## Dùng với Maze / Lyssna

- **Lyssna**: chụp màn hình từng trang (cả bản A và B), tải ảnh lên, tạo bài test first-click.
- **Maze**: cần kiểm tra gói miễn phí có cho test website thật hay chỉ prototype Figma.
