# Mầm — học tiếng Anh & tiếng Nhật

<img src="app/public/brand/mam-mark.svg" width="72" alt="Mầm">

_Gieo một từ hôm nay — nói trôi chảy ngày mai._ Tên mã nội bộ (package Java, database, khóa localStorage) vẫn là `lingora`.

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

## Deploy production (miễn phí)

| Thành phần | Nền tảng                                   | Ghi chú                                                         |
| ---------- | ------------------------------------------ | --------------------------------------------------------------- |
| App        | Hugging Face Spaces (Docker, CPU basic)    | 2 vCPU / 16 GB RAM, ngủ sau 48 giờ không có truy cập            |
| Database   | Aiven for MySQL — gói Free                 | MySQL 8, 1 GB, bắt buộc TLS                                     |
| Media      | Supabase Storage — gói Free                | Tùy chọn (upload ảnh/âm thanh)                                  |
| CI/CD      | GitHub Actions                             | `deploy-hf.yml`: test → đẩy mã nguồn lên Space → Space tự build |

`Dockerfile` build Angular + seed (`node seed/build.mjs`) + jar Spring Boot (profile `prod`); container nghe cổng `7860`, Liquibase tự tạo schema và seed được nạp ở lần chạy đầu.

### 1. Database (Aiven)

1. Tạo service **MySQL → Free plan** trên [console.aiven.io](https://console.aiven.io).
2. **Advanced configuration** → thêm `mysql.sql_require_primary_key` = `false` (bảng `DATABASECHANGELOG` của Liquibase không có khóa chính).
3. Lấy Host, Port, User (`avnadmin`), Password ở tab **Overview**.

### 2. Space (Hugging Face)

Tạo token **Write** ở [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens). Space được workflow tự tạo; sau đó vào **Settings → Variables and secrets** của Space:

| Tên (Secret)                                          | Giá trị                                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `DB_URL`                                              | `jdbc:mysql://HOST:PORT/lingora?sslMode=REQUIRED&useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&createDatabaseIfNotExist=true` |
| `DB_USERNAME`, `DB_PASSWORD`                          | Tài khoản Aiven                                                                                                                            |
| `JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET`  | Chuỗi base64 ≥ 64 byte ngẫu nhiên                                                                                                          |
| `LINGORA_ADMIN_EMAIL`, `LINGORA_ADMIN_PASSWORD`       | Tài khoản admin được tạo khi khởi động (tài khoản đã tồn tại chỉ được thêm quyền admin)                                                    |

| Tên (Variable)               | Giá trị                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `APP_BASE_URL`               | `https://<user>-<space>.hf.space` (link trong email)                                         |
| `LINGORA_REQUIRE_ACTIVATION` | `false` khi chưa có SMTP: đăng ký xong dùng được ngay                                        |

Tùy chọn: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH=true`, `SMTP_STARTTLS=true`, `MAIL_FROM` (ví dụ Brevo/Gmail) — khi có SMTP thì đặt `LINGORA_REQUIRE_ACTIVATION=true`; `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`; `GOOGLE_CLIENT_ID` hoặc `FIREBASE_*` (thêm domain `hf.space` vào authorized origins).

### 3. GitHub Actions

Trong **Settings → Secrets and variables → Actions** của repo GitHub:

- Secret `HF_TOKEN`: token Write ở bước 2.
- Variable `HF_SPACE`: `<user>/<space>` (ví dụ `dinhquy/mam`).
- Variable `APP_URL`: `https://<user>-<space>.hf.space` (workflow `keepalive.yml` ping 12 giờ/lần để Space không ngủ).

Mỗi lần push lên `main`: chạy test frontend → đẩy mã nguồn lên Space → Space build image và khởi động lại (~10 phút cho lần đầu).

### 4. Nạp dữ liệu từ điển (tùy chọn)

```bash
MYSQL_HOST=... MYSQL_PORT=... MYSQL_USER=avnadmin MYSQL_PASSWORD=... MYSQL_SSL=true python data/scripts/import_mysql.py data/jsonl
```

## Kiểm thử

```bash
./mvnw verify          # backend
cd app && npx ng test  # frontend
```

## Tham khảo

- [JHipster 9.4.0](https://www.jhipster.tech/documentation-archive/v9.4.0)
- [Using JHipster in production](https://www.jhipster.tech/documentation-archive/v9.4.0/production/)
# web_hoc_moi_thu_jhipster
