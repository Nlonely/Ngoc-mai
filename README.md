# Ngoc-mai 💗

Website tương tác chủ đề 20/10 dành tặng Ngọc Mai.

## Cấu trúc dự án

```text
Ngoc-mai/
├── index.html             # Trang web chính
├── README.md              # Hướng dẫn dự án
├── .gitignore             # Bỏ qua file hệ thống và cấu hình cục bộ
└── assets/
    ├── css/style.css      # Giao diện và hiệu ứng CSS
    ├── js/main.js         # Hiệu ứng trái tim, ảnh, thư và tương tác
    ├── photos/            # Ảnh nhúng trong bản HTML ban đầu
    └── images/            # Ảnh gốc từ file ZIP được cung cấp
```

## Chạy thử

Mở `index.html` bằng trình duyệt. Nếu trình duyệt hạn chế một số tính năng khi mở trực tiếp, hãy mở thư mục bằng VS Code và chạy bằng tiện ích Live Server.

## Đưa lên GitHub

Tạo repository tên `Ngoc-mai` trên GitHub (nếu chưa có), sau đó mở Terminal/CMD tại thư mục dự án và chạy:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Nlonely/Ngoc-mai.git
git push -u origin main
```

Nếu Git báo `remote origin already exists`, chạy `git remote set-url origin https://github.com/Nlonely/Ngoc-mai.git` rồi push lại. Nếu repository GitHub đã có README hoặc commit khác, có thể cần pull/reconcile trước khi push.

## Đăng website bằng GitHub Pages

Trong repository GitHub, vào **Settings → Pages**, chọn deploy từ branch **main** và thư mục **/(root)**, rồi lưu. Chờ GitHub Pages triển khai xong để nhận liên kết website.

## Lưu ý

- Giữ nguyên đường dẫn `assets/` khi tải lên để ảnh, CSS và JavaScript hoạt động.
- Một số font được tải từ Google Fonts nên cần Internet để hiển thị đúng.
