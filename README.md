# Lingora — học tiếng Anh & tiếng Nhật

Monolith JHipster 9.4 (Spring Boot 4, Java 21+) + frontend Angular 22 (thư mục `app/`), dữ liệu lưu trong MySQL 8, media lưu trên Supabase Storage.

| Thành phần | Vị trí                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Backend    | `src/main/java/com/lingora` (REST API dưới `/api/**`)                                                        |
| Schema DB  | `src/main/resources/config/liquibase` (Liquibase tự chạy khi khởi động)                                      |
| Frontend   | `app/` (Angular, Tailwind)                                                                                    |
| Dữ liệu    | `seed/` — `npm run build` sinh `seed/out/*.json`; backend import vào MySQL                                    |
| Storage    | `supabase/storage-policies.sql` (tạo bucket public `media`; upload qua URL ký sẵn do backend cấp)            |

## Chạy môi trường dev

Yêu cầu: JDK 21+, Node 22+, MySQL 8 tại `localhost:3306`.

1. Backend (profile `dev`; tự tạo database `lingora`, chạy Liquibase, import `seed/out` nếu bảng `language` còn trống):

   ```bash
   ./mvnw
   ```

   Thông tin MySQL lấy từ biến môi trường `DB_USERNAME` / `DB_PASSWORD` (mặc định trong `application-secret-samples.yml`).

2. Frontend (proxy `/api` sang `http://localhost:8080`, xem `app/proxy.conf.json`):

   ```bash
   cd app
   npm install
   npm start
   ```

   Mở http://localhost:4200.

Tài khoản dev (chỉ tạo trong profile `dev`):

- Admin: `admin@lingora.dev` / `Admin@12345`
- Học viên: `learner@lingora.dev` / `Learner@12345`

Ở profile dev, link kích hoạt tài khoản và đặt lại mật khẩu được ghi ra log backend (không cần SMTP).

### Nạp lại dữ liệu

- Tự động: khi khởi động, nếu chưa có ngôn ngữ nào (`LINGORA_SEED_AUTO_IMPORT=true`, mặc định ở dev).
- Thủ công: admin gọi `POST /api/admin/content/import` (ghi đè/cập nhật theo id, tiến độ học viên được giữ nguyên).

## Cấu hình

| Biến môi trường                           | Ý nghĩa                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`    | Kết nối MySQL (bắt buộc ở prod)                                 |
| `JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET` | Khóa ký JWT (bắt buộc ở prod, ≥ 512 bit, base64)     |
| `GOOGLE_CLIENT_ID`                        | Bật đăng nhập Google (backend xác thực ID token của Google)     |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET` | Bật upload media (service key chỉ nằm ở backend) |
| `SPRING_MAIL_*`, `JHIPSTER_MAIL_BASE_URL` | Gửi email kích hoạt / đặt lại mật khẩu                          |
| `LINGORA_SEED_PATH`                       | Thư mục dữ liệu seed (mặc định `seed/out`)                      |

## Đóng gói production

```bash
./mvnw -Pprod clean verify
java -jar target/*.jar
```

Profile `prod` chạy `npm ci` + `npm run build` trong `app/` và đóng gói bản build Angular vào jar (`static/`); backend phục vụ SPA và API trên cùng một cổng. Bỏ qua bước build frontend bằng `-Dskip.npm`.

## Kiểm thử

```bash
./mvnw verify          # backend
cd app && npx ng test  # frontend
```

## Tham khảo

- [JHipster 9.4.0](https://www.jhipster.tech/documentation-archive/v9.4.0)
- [Using JHipster in production](https://www.jhipster.tech/documentation-archive/v9.4.0/production/)
# web_hoc_moi_thu_jhipster
