# Roadmap xây dựng Website tự học ngôn ngữ

## 1. Tổng quan dự án

### 1.1. Mục tiêu

Xây dựng một nền tảng website tự học ngôn ngữ có khả năng:

- Hoạt động tốt trên Desktop, Tablet và Mobile (Responsive + Progressive Web App).
- Hỗ trợ nhiều ngôn ngữ học (Target Learning Language) như English, Japanese, Korean...
- **Hỗ trợ đa ngôn ngữ giao diện (UI/Interface Language – i18n)**: người dùng ở các quốc gia khác nhau có thể dùng giao diện bằng tiếng Việt, tiếng Anh, tiếng Nhật... — đây là khái niệm **khác** với "ngôn ngữ học" ở trên (xem mục 1.3).
- Hỗ trợ nhiều trình độ như A1, A2, B1, B2, C1.
- Học theo Course → Unit → Lesson.
- Hỗ trợ Vocabulary, Grammar, Reading, Listening, Speaking và Exercise.
- Theo dõi tiến độ học tập.
- Theo dõi lịch sử học, thời gian học và streak.
- Có hệ thống Admin để quản lý nội dung, kể cả nội dung dịch (translation) cho từng ngôn ngữ giao diện.
- Hoạt động ổn định trên nhiều trình duyệt, nhiều kích thước màn hình, và có thể cài đặt như một ứng dụng (Add to Home Screen) nhờ PWA.
- Hỗ trợ học offline cơ bản (cache lesson đã học) khi mất kết nối mạng.
- Có kiến trúc đủ linh hoạt để sau này mở rộng thành mobile app (Flutter/Android native) dùng chung Backend API.

### 1.2. Technology Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Angular |
| Language | TypeScript |
| UI | Angular Material + Tailwind CSS |
| State / Reactive | Angular Signals + RxJS |
| Backend | Java |
| Framework | Spring Boot |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL |
| Migration | Flyway |
| API | REST |
| Build Backend | Maven |
| API Documentation | OpenAPI / Swagger |
| Backend Test | JUnit + Mockito |
| Frontend Test | Angular testing tools |
| Deployment | Docker + Nginx |
| **UI i18n (đa ngôn ngữ giao diện)** | **Transloco hoặc ngx-translate** (dịch động, load lazy theo locale) |
| **Backend i18n** | **Spring `MessageSource` + `ResourceBundle` (`messages_vi.properties`, `messages_en.properties`)** |
| **PWA / Offline** | **Angular Service Worker (`@angular/pwa`) + Web App Manifest** |
| **Caching / Session** | **Redis** (cache danh mục course/level, rate limiting, refresh token blacklist) |
| **Media Storage** | **S3-compatible Object Storage / CDN** cho audio, hình ảnh vocabulary |
| **Push Notification (tùy chọn)** | **Web Push API** (nhắc nhở streak / daily goal) |
| **Cross-browser/device Test** | **BrowserStack hoặc Playwright multi-device emulation** |

---

## 1.3. Phân biệt "Ngôn ngữ học" và "Ngôn ngữ giao diện" (rất quan trọng)

Hệ thống có **hai khái niệm ngôn ngữ hoàn toàn khác nhau**, cần tách rõ ngay từ thiết kế database và API để tránh nhầm lẫn:

| | Target Learning Language (ngôn ngữ đang học) | UI / Interface Language (ngôn ngữ giao diện – i18n) |
|---|---|---|
| Ý nghĩa | Ngôn ngữ mà user muốn học (English, Japanese...) | Ngôn ngữ hiển thị nút bấm, menu, thông báo, email |
| Lưu ở đâu | Bảng `languages`, gắn với `courses`, `vocabularies` | Resource file / bảng `ui_locales` + translation key-value |
| Nơi dùng | Course, Lesson, Vocabulary, Exercise content | Toàn bộ UI Angular + email + thông báo lỗi backend |
| Selector trên UI | "Chọn ngôn ngữ muốn học" (trong Dashboard) | "Chọn ngôn ngữ hiển thị" (icon 🌐 ở Header, mọi trang kể cả trang Login) |
| Ví dụ | User học tiếng Anh | User là người Việt, xem giao diện tiếng Việt trong khi học tiếng Anh |

> Một lỗi thiết kế phổ biến là dùng chung 1 bảng `languages` cho cả hai mục đích — nên tách riêng ngay từ đầu.

---

# 2. Kiến trúc tổng thể

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │     Nginx     │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌──────────────┐       ┌────────────────┐
        │   Angular    │       │  Spring Boot   │
        │   Frontend   │──────▶│    Backend     │
        └──────────────┘ REST  └───────┬────────┘
                                       │
                                       │ JPA/Hibernate
                                       ▼
                                ┌──────────────┐
                                │    MySQL     │
                                └──────────────┘
```

Luồng kiến trúc:

```text
Angular
   │
   │ HTTPS / REST API
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
MySQL
```

Nguyên tắc:

- Angular không phụ thuộc trực tiếp vào database structure.
- Backend không trả trực tiếp JPA Entity ra API.
- Controller không chứa business logic.
- Business logic nằm ở Service.
- Repository chịu trách nhiệm truy cập database.
- API nên được version ngay từ đầu.

---

# 3. User Roles

## 3.1. USER

Quyền chính:

```text
Authentication
├── Register
├── Login
├── Logout
├── Forgot password
└── Reset password

Profile
├── View profile
├── Edit profile
└── Change password

Learning
├── Select language
├── Select level
├── View course
├── View unit
├── Learn lesson
└── Complete lesson

Practice
├── Vocabulary
├── Grammar
├── Listening
├── Reading
├── Speaking
└── Exercise

Progress
├── Course progress
├── Lesson progress
├── Vocabulary progress
├── Exercise history
├── Statistics
└── Streak
```

## 3.2. ADMIN

```text
Dashboard
├── User management
├── Language management
├── Level management
├── Course management
├── Unit management
├── Lesson management
├── Vocabulary management
├── Exercise management
└── Statistics
```

Có thể mở rộng sau này:

```text
USER
TEACHER
ADMIN
SUPER_ADMIN
```

---

# 4. User Learning Flow

Flow chính:

```text
Register / Login
       ↓
Dashboard
       ↓
Select Language
       ↓
Select Level
       ↓
Course List
       ↓
Course Detail
       ↓
Unit
       ↓
Lesson
       ↓
Lesson Content
       ↓
Exercise
       ↓
Result
       ↓
Update Progress
       ↓
Next Lesson
```

Flow học một lesson:

```text
Lesson
  │
  ├── Vocabulary
  │
  ├── Grammar
  │
  ├── Reading
  │
  ├── Listening
  │
  ├── Speaking
  │
  └── Exercise
          ↓
       Result
          ↓
      Complete
```

---

# 5. Sitemap

## 5.1. Public

```text
/
├── Login
├── Register
├── Forgot Password
└── Reset Password
```

## 5.2. Student

```text
/dashboard

/courses
/courses/:id

/units/:id

/lessons/:id

/vocabulary
/vocabulary/:id

/practice

/progress

/statistics

/profile
```

## 5.3. Admin

```text
/admin
/admin/users
/admin/languages
/admin/levels
/admin/courses
/admin/units
/admin/lessons
/admin/vocabularies
/admin/exercises
/admin/statistics
```

---

# 6. Database Design

## 6.1. Core Tables

```text
users
roles
user_roles

languages          -- ngôn ngữ ĐANG HỌC (target learning language)
levels

courses
units
lessons
lesson_contents

ui_locales         -- ngôn ngữ GIAO DIỆN (vd: vi, en, ja) — xem mục 1.3
ui_translations     -- key-value dịch UI theo từng locale (nếu quản lý qua Admin thay vì file JSON tĩnh)
```

Gợi ý field cho `ui_locales` / `ui_translations` (nếu muốn Admin tự chỉnh sửa bản dịch mà không cần release code):

```text
ui_locales
----------
id
code            -- 'vi', 'en', 'ja'
name            -- 'Tiếng Việt'
is_default
is_active

ui_translations
---------------
id
locale_code     -- FK -> ui_locales.code
namespace       -- 'common', 'auth', 'dashboard', 'exercise'...
key             -- 'BUTTON_SUBMIT', 'ERROR_COURSE_NOT_FOUND'
value           -- 'Nộp bài' / 'Submit'
```

> Nếu team nhỏ và không cần Admin chỉnh sửa bản dịch runtime, có thể bỏ 2 bảng này và dùng file JSON tĩnh (`assets/i18n/vi.json`, `assets/i18n/en.json`) — đơn giản hơn cho MVP. Chỉ đưa vào DB khi cần workflow dịch thuật động.

Quan hệ:

```text
Language
   │
   └── Level
         │
         └── Course
               │
               └── Unit
                     │
                     └── Lesson
                           │
                           └── LessonContent
```

## 6.2. Vocabulary

```text
vocabularies
lesson_vocabularies
```

Các field chính:

```text
id
language_id
word
meaning
pronunciation
phonetic
part_of_speech
audio_url
image_url
example_sentence
difficulty
created_at
updated_at
```

## 6.3. Exercise

```text
exercises
exercise_options
```

Exercise type:

```text
MULTIPLE_CHOICE
TRUE_FALSE
FILL_BLANK
MATCHING
ORDER_WORD
TRANSLATE
LISTENING
SPEAKING
```

## 6.4. Progress

```text
user_courses
user_units
user_lessons
user_vocabularies
user_exercise_attempts
learning_sessions
```

## 6.5. Gamification

```text
achievements
user_achievements
daily_goals
user_streaks
```

## 6.6. Nguyên tắc thiết kế Database để dễ mở rộng về sau (Scalability)

Mục tiêu: thêm tính năng mới **không phải sửa cấu trúc bảng hiện có** hoặc migration ít nhất có thể.

### a) Chuẩn hóa cột chung cho MỌI bảng nghiệp vụ

```text
id            BIGINT/UUID     -- xem lựa chọn bên dưới
created_at    TIMESTAMP
updated_at    TIMESTAMP
created_by    BIGINT (nullable, FK users)
updated_by    BIGINT (nullable, FK users)
deleted_at    TIMESTAMP (nullable)   -- soft delete, không xóa cứng dữ liệu học tập/lịch sử
version       INT (optional)          -- optimistic locking cho bảng hay bị update đồng thời
```

> Soft delete đặc biệt quan trọng với `courses/lessons/vocabularies` — Admin "xóa" nhưng dữ liệu tiến độ (`user_lessons`, `user_exercise_attempts`) của user đã học không được vỡ.

### b) Khóa chính: BIGINT tự tăng (nội bộ) + UUID public (lộ ra API)

```text
id            BIGINT AUTO_INCREMENT   -- dùng nội bộ, join nhanh, index nhỏ gọn
public_id     UUID/CHAR(36)           -- dùng khi trả ra API/URL, tránh lộ số lượng record,
                                          dễ merge dữ liệu nếu sau này tách service/sharding
```

### c) Mẫu thiết kế "generic/extensible" đã áp dụng — tiếp tục nhân rộng

`LessonContent` (mục 7) là ví dụ tốt: thay vì hard-code từng loại nội dung thành bảng riêng, dùng `type` + bảng nội dung linh hoạt. Áp dụng tư duy tương tự cho các phần dễ phát sinh thêm loại mới:

```text
exercise_type     -- nên là bảng lookup `exercise_types` (id, code, config_schema) thay vì hard-code ENUM cứng trong code,
                      để thêm loại bài tập mới (vd sau này thêm SPEAKING_SHADOWING) không cần deploy lại backend.
achievement       -- điều kiện đạt achievement nên lưu dạng JSON rule (vd {"type":"streak","value":7})
                      thay vì hard-code logic if/else, để Admin tự tạo achievement mới.
```

### d) Cột `metadata` / `settings` dạng JSON cho thuộc tính mở rộng

```sql
ALTER TABLE courses ADD COLUMN metadata JSON NULL;
ALTER TABLE lessons ADD COLUMN settings JSON NULL;
```

Dùng cho thuộc tính "có thể cần trong tương lai nhưng chưa chắc chắn" (vd: `{"estimated_minutes": 15, "tags": ["business", "travel"]}`) — tránh phải `ALTER TABLE` liên tục mỗi khi phát sinh nhu cầu nhỏ. Thuộc tính đã ổn định, dùng để query/filter thường xuyên thì vẫn nên tách cột riêng + index (JSON không index tốt bằng cột thật).

### e) Chuẩn bị cho bảng dữ liệu lớn theo thời gian

`user_exercise_attempts`, `learning_sessions`, `user_lessons` sẽ tăng rất nhanh theo số user × số lần học. Từ đầu nên:

```text
- Đánh index đúng: (user_id, created_at), (lesson_id, created_at)
- Cân nhắc partition theo tháng/quý (MySQL RANGE partition theo created_at) khi bảng lớn
- Tách bảng "summary" (vd user_lesson_progress tổng hợp) khỏi bảng "log chi tiết" (user_exercise_attempts)
  để Dashboard đọc bảng summary (nhanh), không phải aggregate real-time trên bảng log khổng lồ
- Cân nhắc archive dữ liệu log cũ (>1-2 năm) sang bảng/kho lưu trữ riêng
```

### f) Chuẩn bị cho các trục mở rộng nghiệp vụ tương lai (không build ngay, nhưng đừng thiết kế bó buộc)

```text
organization_id (nullable, FK) trên bảng users/courses
    → nếu sau này bán B2B (trường học, doanh nghiệp mua license) không phải viết lại schema.

user_id là khóa hay dùng để phân vùng dữ liệu
    → nếu sau này cần scale ngang (sharding theo user_id), thiết kế hiện tại (mỗi bảng progress đều có user_id)
      đã sẵn sàng, không cần thiết kế lại.

Tách rõ "content data" (courses/lessons/vocabularies — ít thay đổi, đọc nhiều)
khỏi "activity data" (progress/attempts/sessions — ghi nhiều, tăng nhanh)
    → cho phép sau này scale/cache/replicate hai nhóm này theo chiến lược khác nhau
      (vd content data cache CDN/Redis lâu dài; activity data ưu tiên write throughput).
```

### g) Migration & versioning

```text
Mọi thay đổi schema đi qua Flyway (đã có trong stack) — không sửa tay trên production.
Đặt tên migration rõ ràng: V{n}__{mô_tả}.sql, không sửa lại migration cũ đã chạy production.
Với bảng lớn, cân nhắc migration "online" (thêm cột nullable trước, backfill dữ liệu bằng job riêng,
sau đó mới ràng buộc NOT NULL) để tránh khóa bảng lâu khi hệ thống đã có traffic thật.
```

---

# 7. Lesson Architecture

Lesson phải được thiết kế linh hoạt.

Không nên hard-code:

```text
Lesson
 ├── Vocabulary
 ├── Grammar
 ├── Listening
 └── Exercise
```

Thay vào đó:

```text
Lesson
   │
   └── LessonContent
          │
          ├── type
          ├── title
          ├── content
          └── order
```

Content type:

```text
VOCABULARY
GRAMMAR
READING
LISTENING
SPEAKING
VIDEO
EXERCISE
```

Ví dụ:

```java
@Entity
public class LessonContent {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    private ContentType type;

    private String title;

    private Integer displayOrder;
}
```

Angular renderer:

```text
LessonContent
      │
      ▼
ContentRenderer
      │
      ├── VOCABULARY → VocabularyComponent
      ├── GRAMMAR    → GrammarComponent
      ├── READING    → ReadingComponent
      ├── LISTENING  → ListeningComponent
      ├── SPEAKING   → SpeakingComponent
      └── EXERCISE   → ExerciseComponent
```

---

# 8. Java Backend Roadmap

## Phase 1 — Spring Boot Foundation

### Công việc

- Tạo Spring Boot project.
- Cấu hình Maven.
- Cấu hình MySQL.
- Cấu hình JPA/Hibernate.
- Cấu hình Flyway.
- Cấu hình CORS.
- Cấu hình application profile:
  - `application.yml`
  - `application-dev.yml`
  - `application-prod.yml`
- Thiết lập logging.
- Thiết lập global exception handling.
- Thiết lập API response format.
- Thiết lập OpenAPI/Swagger.

### Package structure

```text
com.learning
│
├── config          -- gồm MessageSourceConfig (i18n), CorsConfig, SecurityConfig...
├── security
├── controller
├── service
├── repository
├── entity
├── dto
├── mapper
├── exception
└── util
```

```text
src/main/resources
│
├── i18n
│   ├── messages.properties      -- default (en)
│   ├── messages_vi.properties
│   └── messages_ja.properties
│
└── db/migration                 -- Flyway scripts
```

---

# 9. API Response Standard

Success:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

HTTP status cần chuẩn hóa:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 10. Authentication & Authorization

## Backend

Implement:

```text
Register
Login
Logout
Refresh Token
Forgot Password
Reset Password
```

JWT flow:

```text
Angular
   │
   │ POST /api/v1/auth/login
   ▼
Spring Boot
   │
   ├── Validate credentials
   │
   └── Generate JWT
           │
           ▼
        Angular
```

Request sau login:

```http
Authorization: Bearer <JWT>
```

## Angular

```text
HTTP Request
     ↓
AuthInterceptor
     ↓
Add JWT
     ↓
Spring Security
     ↓
Controller
```

## Authorization

Backend phải kiểm tra role.

Không được chỉ ẩn button Admin ở Angular.

---

# 11. API Design

Nên version API:

```text
/api/v1
```

Các API chính:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET /api/v1/languages
GET /api/v1/levels

GET /api/v1/courses
GET /api/v1/courses/{id}
GET /api/v1/courses/{id}/units

GET /api/v1/units/{id}
GET /api/v1/units/{id}/lessons

GET /api/v1/lessons/{id}
GET /api/v1/lessons/{id}/contents

GET /api/v1/vocabularies
GET /api/v1/vocabularies/{id}

GET /api/v1/exercises/{id}
POST /api/v1/exercises/{id}/submit

GET /api/v1/users/me
GET /api/v1/users/me/progress
GET /api/v1/users/me/statistics

GET /api/v1/ui-locales                -- danh sách ngôn ngữ giao diện khả dụng (vi, en, ja...)
```

Mọi request nên gửi kèm header sau (Angular HttpInterceptor tự động thêm):

```http
Accept-Language: vi
Authorization: Bearer <JWT>
```

Backend dùng `Accept-Language` để trả về `message` lỗi đã dịch (xem mục 13a); không ảnh hưởng đến dữ liệu học tập (course/lesson vẫn theo `language_id` mà user chọn học).

Pagination:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 120,
  "totalPages": 6
}
```

---

# 12. Angular Foundation

## Structure

```text
src/app
│
├── core
│   ├── auth
│   ├── guards
│   ├── interceptors
│   ├── services
│   └── models
│
├── shared
│   ├── components
│   ├── pipes
│   └── directives
│
├── features
│   ├── dashboard
│   ├── courses
│   ├── lessons
│   ├── vocabulary
│   ├── exercises
│   └── progress
│
├── layout
│   ├── header
│   ├── sidebar
│   ├── mobile-navigation
│   └── main-layout
│
├── i18n
│   ├── transloco-root.module.ts
│   └── locale.service.ts        -- lưu/khôi phục locale đã chọn
│
└── app.routes.ts
```

```text
src/assets
│
├── i18n
│   ├── vi.json
│   ├── en.json
│   └── ja.json
│
└── icons                        -- app icons cho PWA manifest
```

## Core

```text
AuthService
UserService
ApiService
TokenService
```

## Shared Components

```text
Button
Input
Select
Modal
Dialog
Toast
Loading
Pagination
ProgressBar
Card
AudioPlayer
```

## Layout

Desktop:

```text
┌────────────┬─────────────────────────┐
│ Sidebar    │ Content                 │
│            │                         │
│ Dashboard  │                         │
│ Courses    │                         │
│ Practice   │                         │
│ Progress   │                         │
│ Profile    │                         │
└────────────┴─────────────────────────┘
```

Mobile:

```text
┌──────────────────────┐
│ ☰   English     👤  │
├──────────────────────┤
│                      │
│ Content              │
│                      │
├──────────────────────┤
│ Home Course Practice │
└──────────────────────┘
```

---

# 13. Responsive Design

## Nguyên tắc

Thiết kế theo hướng:

```text
Mobile First
     ↓
Tablet
     ↓
Desktop
     ↓
Large Desktop
```

Không tạo riêng:

```text
DesktopDashboard
MobileDashboard
TabletDashboard
```

Thay vào đó dùng cùng component và responsive CSS.

## Breakpoint tham khảo

```text
< 640px       Mobile
640–767px     Large Mobile
768–1023px    Tablet
1024–1279px   Desktop
1280px+       Large Desktop
```

Không nên phụ thuộc hoàn toàn vào breakpoint. Ưu tiên fluid layout.

## Design tokens

Cần chuẩn hóa:

```text
Typography
Colors
Spacing
Border Radius
Shadow
Container Width
Button Height
Input Height
Icon Size
```

Spacing có thể bắt đầu:

```text
4
8
12
16
20
24
32
40
48
64
```

---

# 13a. Internationalization (i18n) Architecture — Đa ngôn ngữ giao diện

## Frontend (Angular)

Khuyến nghị dùng **Transloco** (hoặc ngx-translate) thay vì `@angular/localize` built-in, vì:

```text
@angular/localize   → build riêng 1 bundle / ngôn ngữ, đổi ngôn ngữ phải reload lại app,
                       phù hợp khi số ngôn ngữ cố định và ít thay đổi.

Transloco/ngx-translate → load file JSON theo locale tại runtime, đổi ngôn ngữ
                       ngay lập tức không cần reload, dễ thêm ngôn ngữ mới,
                       phù hợp SPA có UI switcher "🌐".
```

Cấu trúc thư mục:

```text
src/assets/i18n
│
├── vi.json
├── en.json
└── ja.json
```

```json
// vi.json (rút gọn)
{
  "common": { "submit": "Nộp bài", "cancel": "Hủy" },
  "auth": { "login": "Đăng nhập", "register": "Đăng ký" },
  "exercise": { "correct": "Chính xác!", "incorrect": "Chưa đúng, thử lại." }
}
```

Luồng chọn ngôn ngữ giao diện:

```text
App khởi động
     │
     ▼
Đọc locale ưu tiên theo thứ tự:
  1. Locale user đã chọn (lưu trong localStorage / user profile)
  2. Header Accept-Language của trình duyệt
  3. Locale mặc định (vi hoặc en)
     │
     ▼
TranslocoService.setActiveLang(locale)
     │
     ▼
Toàn bộ UI (pipe `| transloco`) render theo locale
```

Các điểm cần xử lý thêm:

```text
Locale-aware date/number format  → DatePipe/DecimalPipe với locale tương ứng (Intl API)
Locale-aware routing (tùy chọn)  → /vi/dashboard, /en/dashboard hoặc giữ 1 URL + cookie locale
Lazy load translation theo route → tránh tải hết mọi namespace ngay từ đầu
Fallback locale                  → nếu thiếu key ở locale hiện tại, fallback về locale mặc định
RTL layout (nếu mở rộng Ả Rập)   → dir="rtl" + CSS logical properties (margin-inline thay vì margin-left)
```

## Backend (Spring Boot)

```text
src/main/resources/i18n
│
├── messages.properties          -- default (en)
├── messages_vi.properties
└── messages_ja.properties
```

```properties
# messages_vi.properties
error.course.not_found=Không tìm thấy khóa học
error.auth.invalid_credentials=Sai tài khoản hoặc mật khẩu
```

```java
@Bean
public MessageSource messageSource() {
    ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();
    source.setBasename("classpath:i18n/messages");
    source.setDefaultEncoding("UTF-8");
    return source;
}
```

Backend đọc locale từ header `Accept-Language` (Angular tự động gửi kèm mỗi request theo locale UI hiện tại) để trả **message lỗi** đã dịch:

```http
GET /api/v1/courses/999
Accept-Language: vi
```

```json
{
  "success": false,
  "data": null,
  "message": "Không tìm thấy khóa học",
  "code": "COURSE_NOT_FOUND"
}
```

> Lưu ý: nội dung học (course/lesson/vocabulary) KHÔNG dịch qua cơ chế `MessageSource` này — đó là dữ liệu nghiệp vụ, lưu trực tiếp trong bảng `courses`, `lessons`... theo `language_id` (target learning language). `MessageSource` chỉ dùng cho label UI và message lỗi hệ thống.

## SEO cho đa ngôn ngữ (nếu public content cần index)

```html
<link rel="alternate" hreflang="vi" href="https://site.com/vi/courses" />
<link rel="alternate" hreflang="en" href="https://site.com/en/courses" />
<html lang="vi">
```

---

# 13b. Multi-device & Progressive Web App (PWA)

## Mức độ hỗ trợ đa thiết bị

```text
Responsive layout (bắt buộc, MVP)
        ↓
Touch-friendly UI (bắt buộc, MVP)
        ↓
PWA installable (manifest + service worker cơ bản)
        ↓
Offline caching cho lesson đã học
        ↓
Push notification nhắc học (tùy chọn)
```

## Web App Manifest

```json
// manifest.webmanifest
{
  "name": "Language Learning App",
  "short_name": "LangApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Service Worker — chiến lược cache

```text
App shell (HTML/CSS/JS)     → Cache First (ngx-service-worker)
API GET danh mục course     → Network First, fallback Cache
Lesson đã học gần đây       → Cache khi hoàn thành, cho phép xem lại offline
Audio/hình ảnh vocabulary   → Cache on demand (khi user mở bài học)
API POST/PUT (submit, ...)  → Không cache; nếu offline → queue & retry khi có mạng (tùy chọn nâng cao)
```

## Vấn đề riêng theo thiết bị/trình duyệt cần lưu ý

```text
iOS Safari    → Audio/Video cần user gesture để play (không autoplay được);
                PWA trên iOS có giới hạn về storage & push notification.
Android Chrome→ Hỗ trợ tốt Service Worker, Push API, Add to Home Screen.
Mobile browser→ Microphone (Speaking feature) cần HTTPS bắt buộc + xin quyền rõ ràng.
Low-end device→ Giảm bundle size, lazy load, tránh animation nặng.
Tablet        → Layout nên tận dụng không gian ngang (2 cột) thay vì kéo dài layout mobile.
```

## Testing ma trận thiết bị (tối thiểu)

```text
Desktop   → Chrome, Firefox, Edge, Safari (macOS)
Mobile    → Chrome Android, Safari iOS
Tablet    → iPad Safari, Android tablet Chrome
Màn hình  → 360px, 768px, 1024px, 1440px, 1920px
```

---

# 13c. Frontend Visual Design Guideline (Style Prompt)

## Brief thiết kế

Đối tượng người dùng trải rộng nhiều độ tuổi (học sinh, sinh viên, người đi làm, thậm chí người lớn tuổi tự học ngôn ngữ) — nên giao diện cần **hiện đại, trẻ trung, màu sắc tươi sáng** để tạo cảm giác tích cực khi học, nhưng **không được trẻ con hóa quá mức** (tránh làm người lớn tuổi/đi làm thấy "không nghiêm túc"), và phải **rõ ràng, dễ thao tác** (không đánh đố, tap target đủ lớn, chữ đủ đọc) để không loại trừ người lớn tuổi hoặc người mới dùng công nghệ.

> Prompt tham khảo khi giao cho designer/AI thiết kế UI: *"Thiết kế giao diện ứng dụng học ngôn ngữ theo phong cách hiện đại, trẻ trung, năng lượng tích cực — bảng màu tươi sáng nhưng hài hòa (không chói mắt), bo góc mềm mại, khoảng trắng thoáng, minh họa flat/duotone thân thiện. Ưu tiên rõ ràng và dễ dùng hơn là cầu kỳ: nút bấm lớn, tương phản tốt, một điểm nhấn hành động rõ ràng mỗi màn hình. Giao diện phải dùng tốt cho cả người dùng trẻ (học sinh/sinh viên) lẫn người đi làm/lớn tuổi — tránh phong cách 'game trẻ em' quá đà, và tránh phong cách 'dashboard doanh nghiệp' lạnh lùng."*

## Design tokens đề xuất

**Màu sắc** (base palette — có thể tinh chỉnh theo brand thật, nhưng giữ nguyên logic vai trò):

```text
Primary (CTA chính)     #4F46E5   -- indigo tươi, năng lượng nhưng không chói
Primary Light           #818CF8   -- hover/nhấn nhẹ
Accent (điểm nhấn vui)  #FB923C   -- cam ấm, dùng cho streak/XP/badge
Success                 #22C55E   -- đúng / hoàn thành
Error                   #EF4444   -- sai / cảnh báo
Warning                 #F59E0B   -- nhắc nhở (vd sắp hết streak)
Neutral background      #FAFAFA / #FFFFFF
Neutral text            #1F2937   -- không dùng đen tuyệt đối (#000)
Neutral border          #E5E7EB
Dark mode background    #111827   -- tùy chọn, nếu hỗ trợ dark mode
```

Nguyên tắc phối màu: mỗi màn hình chỉ nên có **1 màu nhấn chính** làm điểm nhìn (thường là nút CTA hoặc badge thành tích) — tránh rải nhiều màu sắc cùng lúc gây rối mắt, nhất là với người lớn tuổi.

**Typography:**

```text
Display/Heading   -- 1 font sans-serif bo tròn, thân thiện (vd: Nunito, Baloo 2, hoặc Quicksand)
                      dùng cho tiêu đề, số điểm XP, streak — tạo cảm giác "trẻ trung"
Body/UI text      -- 1 font sans-serif rõ ràng, tối ưu đọc (vd: Inter, Be Vietnam Pro — hỗ trợ tốt tiếng Việt có dấu)
                      dùng cho nội dung học, mô tả, nút bấm
Cỡ chữ tối thiểu  -- 16px cho body (không nhỏ hơn, để người lớn tuổi đọc thoải mái)
Line-height       -- 1.5 trở lên cho đoạn văn dài (Reading lesson)
```

**Layout & component:**

```text
Border-radius     -- bo góc vừa phải (8–16px), không bo tròn quá mức (kiểu bong bóng trẻ em)
                      trừ các phần tử mang tính "thưởng/gamification" (badge, achievement) có thể bo tròn nhiều hơn
Touch target       -- tối thiểu 44x44px cho mọi nút bấm trên mobile
Spacing scale       -- dùng lại thang đo ở mục 13 (4/8/12/16/20/24/32/40/48/64)
Icon style          -- outline hoặc duotone nhất quán (không trộn nhiều style icon khác nhau)
Card/Progress       -- progress bar dùng màu gradient nhẹ (primary → accent) để tạo cảm giác chuyển động/tiến bộ
Illustration        -- flat/duotone, tránh 3D quá cầu kỳ (nặng tải, chậm mobile)
```

**Micro-interaction (dùng có chọn lọc, không lạm dụng):**

```text
Trả lời đúng          → hiệu ứng ngắn (confetti nhỏ / rung nhẹ + màu success) — 1 khoảnh khắc ăn mừng rõ ràng
Hoàn thành lesson      → animation progress bar chạy đầy + toast chúc mừng
Đạt streak mốc (7/30…) → badge pop-up, không lặp lại hiệu ứng ở những nơi không cần thiết
Hover/focus            → transition nhẹ (150–200ms), không dùng hiệu ứng nặng gây chậm trên thiết bị yếu
```

## Accessibility & đa độ tuổi (bắt buộc, không phải tùy chọn)

```text
Tương phản màu chữ/nền đạt chuẩn WCAG AA (tối thiểu 4.5:1 cho text thường)
Không dùng màu là cách DUY NHẤT truyền đạt thông tin (vd: đúng/sai cần kèm icon ✓/✗, không chỉ đổi màu)
Hỗ trợ zoom / tăng cỡ chữ trình duyệt mà không vỡ layout
Nút bấm/label rõ ràng, tránh icon-only không có label cho hành động quan trọng
Ưu tiên ngôn ngữ đơn giản, tránh thuật ngữ kỹ thuật trong copy UI (đồng bộ với phần i18n ở mục 13a)
Tôn trọng prefers-reduced-motion cho người nhạy cảm với chuyển động
```

Design tokens này nên được đưa vào `tailwind.config.js` (Tailwind CSS đã có trong tech stack) làm nguồn chân lý duy nhất, tránh hard-code màu/spacing rải rác trong component.

---

# 14. Phase 2 — Language / Level / Course

## Backend

```http
GET /api/v1/languages
GET /api/v1/levels
GET /api/v1/courses
GET /api/v1/courses/{id}
GET /api/v1/courses/{id}/units
```

## Angular

```text
LanguageList
    ↓
LevelList
    ↓
CourseList
    ↓
CourseDetail
    ↓
UnitList
```

---

# 15. Phase 3 — Unit / Lesson

## Backend

```http
GET /api/v1/units/{id}
GET /api/v1/units/{id}/lessons
GET /api/v1/lessons/{id}
GET /api/v1/lessons/{id}/contents
```

## Angular

```text
CourseDetail
    ↓
UnitList
    ↓
LessonList
    ↓
LessonPlayer
```

---

# 16. Phase 4 — Vocabulary

## Chức năng

- Vocabulary list.
- Vocabulary detail.
- Flashcard.
- Audio.
- Pronunciation.
- Example sentence.
- Mark as known.
- Mark as difficult.
- Review.

## UI

```text
┌─────────────────────────┐
│                         │
│          apple          │
│                         │
│          /ˈæpəl/        │
│             🔊          │
│                         │
│          quả táo        │
│                         │
│     I eat an apple.     │
│                         │
│  [Again]      [Know]    │
└─────────────────────────┘
```

## Tracking

```text
correct_count
wrong_count
last_reviewed_at
next_review_at
mastery_level
```

---

# 17. Phase 5 — Exercise Engine

Exercise cần thiết kế generic.

## Types

```text
MULTIPLE_CHOICE
TRUE_FALSE
FILL_BLANK
MATCHING
ORDER_WORD
TRANSLATE
LISTENING
SPEAKING
```

## Angular

```text
ExerciseRenderer
│
├── MultipleChoice
├── TrueFalse
├── FillBlank
├── Matching
├── OrderWord
├── Translate
├── Listening
└── Speaking
```

## Flow

```text
Question
 ↓
User Answer
 ↓
Submit
 ↓
Validate
 ↓
Show Result
 ↓
Show Explanation
 ↓
Next
```

Backend lưu:

```text
user_id
exercise_id
answer
is_correct
score
attempted_at
```

---

# 18. Phase 6 — Listening

## Chức năng

```text
Audio Player
├── Play
├── Pause
├── Replay
├── Progress
└── Speed
```

Playback speed:

```text
0.75x
1.0x
1.25x
1.5x
```

Exercise:

```text
Listen & Choose
Listen & Fill Blank
Dictation
```

---

# 19. Phase 7 — Speaking

Triển khai sau khi core learning ổn định.

## Giai đoạn 1

```text
Microphone permission
        ↓
Record
        ↓
Playback
        ↓
Retry
```

## Giai đoạn 2

```text
Speech-to-text
        ↓
Pronunciation evaluation
        ↓
Score
        ↓
Feedback
```

---

# 20. Phase 8 — Progress System

Dashboard cần hiển thị:

```text
Course progress
Lesson progress
Vocabulary mastery
Exercise accuracy
Learning time
Streak
Daily goal
```

Ví dụ:

```text
┌──────────────────────────────┐
│ Continue Learning            │
│ English A2                   │
│ ███████████████░░ 72%        │
│                              │
│ Daily Goal                   │
│ ████████████░░ 15/20 min     │
│                              │
│ Vocabulary     428           │
│ Lessons        31            │
│ XP             2,450         │
│ Streak         12 days       │
└──────────────────────────────┘
```

---

# 21. Learning Session

Bảng:

```text
learning_sessions
-----------------
id
user_id
lesson_id
started_at
ended_at
duration
```

Flow:

```text
Open Lesson
    ↓
Start Session
    ↓
Learning
    ↓
Leave Lesson
    ↓
End Session
```

Có thể thống kê:

```text
Today: 25 minutes
This week: 2h 15m
This month: 8h 42m
```

---

# 22. Phase 9 — Daily Goal & Streak

Daily goal:

```text
10 min
20 min
30 min
60 min
```

Streak:

```text
Monday    ✓
Tuesday   ✓
Wednesday ✓
Thursday  ✓
Friday    ✓
Saturday  ✓
Sunday    -
```

Logic:

```text
Last learning date
        ↓
      Today?
        │
        ├── Yes → Maintain
        │
        ├── Yesterday → Increase streak
        │
        └── Older → Reset
```

---

# 23. Phase 10 — Admin System

## Admin Dashboard

```text
Dashboard
│
├── Users
├── Languages
├── Levels
├── Courses
├── Units
├── Lessons
├── Vocabulary
├── Exercises
└── Statistics
```

## CRUD

Mỗi module nên hỗ trợ:

```text
List
Search
Filter
Sort
Pagination
Create
View
Edit
Activate / Deactivate
Delete
```

## Lesson Editor

```text
Lesson
│
├── Basic Information
│
├── Content
│    ├── Vocabulary
│    ├── Grammar
│    ├── Listening
│    ├── Reading
│    └── Exercise
│
└── Publish
```

---

# 24. Phase 11 — Search & Filtering

Search:

```text
Course
Lesson
Vocabulary
```

Filter:

```text
Language
Level
Difficulty
Status
```

API:

```http
GET /api/v1/courses?keyword=english
GET /api/v1/courses?level=A1
GET /api/v1/vocabularies?keyword=apple
```

Phải hỗ trợ pagination.

---

# 25. Phase 12 — Gamification

Chỉ triển khai sau khi core learning và progress ổn định.

## Tính năng

```text
XP
Level
Achievement
Badge
Leaderboard
Daily Challenge
```

Ví dụ:

```text
Complete lesson     +20 XP
Complete exercise   +5 XP
Daily goal          +30 XP
7-day streak        +100 XP
```

---

# 26. Phase 13 — Testing

## Backend

```text
Unit Test
Integration Test
Repository Test
Controller Test
Security Test
```

Test các case:

```text
Login success
Login failed
Invalid JWT
Unauthorized
Forbidden
Course not found
Duplicate vocabulary
Exercise submission
Progress calculation
```

## Angular

```text
Component Test
Service Test
Guard Test
Interceptor Test
```

## E2E

Flow cần test:

```text
Register
 ↓
Login
 ↓
Select Course
 ↓
Open Lesson
 ↓
Complete Exercise
 ↓
Check Progress
```

---

# 27. Phase 14 — Performance

## Angular

Cần chú ý:

```text
Lazy loading
Lazy image
Pagination
Signals
Caching
Debounce search
Efficient rendering
```

Không load toàn bộ course/lesson khi mở trang.

## Backend

Kiểm tra:

```text
N+1 Query
Database indexes
Pagination
Caching
Connection pool
API response size
```

Đặc biệt với JPA:

```text
@ManyToOne
@OneToMany
FetchType.LAZY
FetchType.EAGER
```

Ưu tiên LAZY và kiểm soát query theo từng use case.

---

# 28. Phase 15 — Security

Kiểm tra:

```text
JWT security
Password hashing
CORS
CSRF strategy
SQL Injection
XSS
Input validation
Rate limiting
File upload validation
Authorization
```

Nguyên tắc:

> Authorization phải được kiểm tra ở Backend. Không được chỉ dựa vào việc ẩn UI trên Angular.

---

# 29. Phase 16 — Deployment

Production architecture:

```text
                 Internet
                    │
                    ▼
                  Nginx
                 /     \
                /       \
               ▼         ▼
          Angular     Spring Boot
          Frontend       Backend
                           │
                           ▼
                         MySQL
```

Docker:

```text
docker
│
├── nginx
├── angular
├── spring-boot
└── mysql
```

CI/CD:

```text
Git Push
   ↓
Build
   ↓
Test
   ↓
Docker Build
   ↓
Deploy
```

---

# 30. Phase 17 — Monitoring & Logging

Backend cần có:

```text
Application logs
Error logs
Access logs
Security logs
```

Theo dõi:

```text
API response time
Error rate
Database performance
CPU
Memory
```

---

# 31. Thứ tự triển khai thực tế

```text
01. Requirement
        ↓
02. Sitemap / User Flow
        ↓
03. UX/UI
        ↓
04. Database / ERD
        ↓
05. Spring Boot Foundation
        ↓
06. Angular Foundation
        ↓
06a. i18n Setup (UI đa ngôn ngữ) + PWA Shell (manifest, service worker cơ bản)
        ↓
07. Authentication
        ↓
08. Language / Level
        ↓
09. Course / Unit
        ↓
10. Lesson
        ↓
11. Vocabulary
        ↓
12. Exercise
        ↓
13. Learning Flow
        ↓
14. Progress
        ↓
15. Dashboard
        ↓
16. Admin
        ↓
17. Listening
        ↓
18. Speaking
        ↓
19. Gamification
        ↓
20. Testing
        ↓
21. Security Review
        ↓
22. Performance Optimization
        ↓
23. Deployment
        ↓
24. Monitoring
```

---

# 32. MVP Scope

Không nên triển khai tất cả tính năng ngay từ đầu.

## MVP nên bao gồm

```text
✓ Register / Login
✓ JWT Authentication
✓ Language
✓ Level
✓ Course
✓ Unit
✓ Lesson
✓ Vocabulary
✓ Grammar
✓ Listening cơ bản
✓ Multiple Choice
✓ Fill Blank
✓ Lesson completion
✓ Course progress
✓ User dashboard
✓ Admin CRUD
✓ Responsive Mobile
✓ Responsive Tablet
✓ Responsive Desktop
✓ UI đa ngôn ngữ (tối thiểu 2 locale: vi, en) qua file JSON tĩnh
✓ PWA cơ bản (manifest + service worker cache app shell, chưa cần offline lesson)
```

## Chưa cần làm trong MVP

```text
- AI Speaking
- Pronunciation evaluation
- Spaced Repetition nâng cao
- Leaderboard
- Achievement phức tạp
- Daily Challenge
- Admin tự chỉnh sửa bản dịch UI qua database (ui_locales/ui_translations) — MVP dùng file JSON tĩnh trước
- Offline caching lesson đầy đủ + queue submit khi mất mạng
- Push notification nhắc học
```

Sau MVP:

```text
                 MVP
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   Speaking   Spaced      Gamification
              Repetition
       │          │          │
       └──────────┼──────────┘
                  ▼
             Advanced
             Platform
```

---

# 33. Checklist triển khai

## Foundation

- [ ] Tạo Git repository.
- [ ] Tạo Spring Boot project.
- [ ] Tạo Angular project.
- [ ] Cấu hình MySQL.
- [ ] Cấu hình Flyway.
- [ ] Cấu hình environment.
- [ ] Cấu hình CORS.
- [ ] Chuẩn hóa API response.
- [ ] Global exception handler.
- [ ] OpenAPI / Swagger.
- [ ] Chuẩn cột chung (created_at/updated_at/deleted_at...) áp dụng cho base entity.
- [ ] Thiết lập Tailwind config với design tokens (màu, typography, spacing) làm nguồn chân lý duy nhất.

## Security

- [ ] Register.
- [ ] Login.
- [ ] JWT.
- [ ] Refresh token.
- [ ] Logout.
- [ ] Password hashing.
- [ ] AuthGuard.
- [ ] HTTP interceptor.
- [ ] Role authorization.

## Learning

- [ ] Language.
- [ ] Level.
- [ ] Course.
- [ ] Unit.
- [ ] Lesson.
- [ ] LessonContent.
- [ ] Vocabulary.
- [ ] Grammar.
- [ ] Reading.
- [ ] Listening.
- [ ] Exercise.

## Progress

- [ ] Course progress.
- [ ] Unit progress.
- [ ] Lesson progress.
- [ ] Exercise attempts.
- [ ] Vocabulary mastery.
- [ ] Learning sessions.
- [ ] Statistics.
- [ ] Daily goal.
- [ ] Streak.

## Admin

- [ ] User management.
- [ ] Language management.
- [ ] Level management.
- [ ] Course management.
- [ ] Unit management.
- [ ] Lesson management.
- [ ] Vocabulary management.
- [ ] Exercise management.
- [ ] Statistics.

## i18n (Đa ngôn ngữ giao diện)

- [ ] Chọn thư viện i18n (Transloco/ngx-translate).
- [ ] Tạo file translation vi.json, en.json.
- [ ] Language switcher (🌐) ở Header, có ở cả trang chưa login.
- [ ] Lưu locale đã chọn (localStorage / user profile).
- [ ] Interceptor gửi `Accept-Language`.
- [ ] Backend MessageSource cho message lỗi (messages_vi.properties, messages.properties).
- [ ] Locale-aware date/number format.
- [ ] (Tùy chọn) Bảng `ui_locales`/`ui_translations` cho Admin tự dịch.

## PWA / Multi-device

- [ ] Web App Manifest (icons, theme color).
- [ ] Service worker (Angular Service Worker).
- [ ] Cache app shell.
- [ ] Cache lesson đã học (offline).
- [ ] Test Add to Home Screen (Android + iOS).
- [ ] Xử lý audio/microphone theo từng trình duyệt (iOS Safari gesture, HTTPS cho mic).
- [ ] Test responsive trên breakpoint 360/768/1024/1440px.
- [ ] (Tùy chọn) Push notification nhắc streak/daily goal.

## Quality

- [ ] Unit tests.
- [ ] Integration tests.
- [ ] E2E tests.
- [ ] Security review.
- [ ] Performance review.
- [ ] Responsive testing.
- [ ] Browser compatibility testing (Chrome, Firefox, Edge, Safari desktop + mobile).
- [ ] Test đổi locale UI không làm mất trạng thái đang học.

## Deployment

- [ ] Docker.
- [ ] Nginx.
- [ ] Production environment.
- [ ] CI/CD.
- [ ] Logging.
- [ ] Monitoring.
- [ ] Backup database.

---

# 34. Nguyên tắc kiến trúc quan trọng

## Backend

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Không để business logic trong Controller.

## API

```text
Entity
   ↓
Mapper
   ↓
DTO
   ↓
Controller
   ↓
JSON
```

Không trả trực tiếp JPA Entity.

## Frontend

```text
Page
 ↓
Feature Component
 ↓
Shared Component
 ↓
Service
 ↓
REST API
```

## Responsive

```text
Mobile First
      ↓
Fluid Layout
      ↓
Tablet
      ↓
Desktop
```

## Learning architecture

```text
Course
  ↓
Unit
  ↓
Lesson
  ↓
LessonContent
  ↓
Content Type
```

Kiến trúc LessonContent giúp hệ thống dễ mở rộng thêm:

```text
Vocabulary
Grammar
Reading
Listening
Speaking
Video
Exercise
```

---

# 35. Mục tiêu kiến trúc cuối cùng

Hệ thống sau khi hoàn thiện nên có cấu trúc:

```text
                         ┌─────────────────────┐
                         │       USER          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Angular       │
                         │                     │
                         │ Responsive SPA      │
                         │ Mobile / Tablet     │
                         │ Desktop             │
                         └──────────┬──────────┘
                                    │
                               REST / HTTPS
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Spring Boot      │
                         │                     │
                         │ Authentication      │
                         │ Learning            │
                         │ Vocabulary          │
                         │ Exercise            │
                         │ Progress            │
                         │ Admin               │
                         └──────────┬──────────┘
                                    │
                              JPA / Hibernate
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       MySQL         │
                         └─────────────────────┘
```

Mục tiêu của kiến trúc này là đảm bảo:

1. Frontend và Backend độc lập.
2. Có thể thay đổi UI mà không ảnh hưởng business logic.
3. Có thể mở rộng thêm loại bài học.
4. Có thể mở rộng thêm ngôn ngữ.
5. Có thể mở rộng thêm role.
6. Có thể phát triển mobile app dùng chung Backend API.
7. Dễ test, maintain và deploy.
8. Responsive ngay từ đầu, hoạt động tốt trên Desktop, Tablet, Mobile và cài đặt được như PWA.
9. Giao diện hỗ trợ đa ngôn ngữ (i18n) độc lập với ngôn ngữ nội dung đang học.
10. Có nền tảng để bổ sung AI, Speaking, Spaced Repetition và Gamification về sau.