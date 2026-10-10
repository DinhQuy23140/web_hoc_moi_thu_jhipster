import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/landing/landing.page').then((m) => m.LandingPage) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot.page').then((m) => m.ForgotPage) },
  { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email.page').then((m) => m.VerifyEmailPage) },
  {
    path: 'account/activate',
    data: { mode: 'verifyEmail' },
    loadComponent: () => import('./features/auth/action.page').then((m) => m.ActionPage),
  },
  {
    path: 'account/reset/finish',
    data: { mode: 'resetPassword' },
    loadComponent: () => import('./features/auth/action.page').then((m) => m.ActionPage),
  },
  {
    path: 'lessons/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/lesson/lesson-player.page').then((m) => m.LessonPlayerPage),
  },
  {
    path: 'exams/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/certificates/exam.page').then((m) => m.ExamPage),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'courses', loadComponent: () => import('./features/courses/courses.page').then((m) => m.CoursesPage) },
      { path: 'courses/:id', loadComponent: () => import('./features/courses/course-detail.page').then((m) => m.CourseDetailPage) },
      { path: 'certificates', loadComponent: () => import('./features/certificates/certificates.page').then((m) => m.CertificatesPage) },
      { path: 'certificates/:id', loadComponent: () => import('./features/certificates/certificate-detail.page').then((m) => m.CertificateDetailPage) },
      { path: 'vocabulary', loadComponent: () => import('./features/vocabulary/vocabulary.page').then((m) => m.VocabularyPage) },
      { path: 'vocabulary/review', loadComponent: () => import('./features/vocabulary/review.page').then((m) => m.ReviewPage) },
      { path: 'vocabulary/:id', loadComponent: () => import('./features/vocabulary/vocab-detail.page').then((m) => m.VocabDetailPage) },
      { path: 'practice', loadComponent: () => import('./features/practice/practice.page').then((m) => m.PracticePage) },
      { path: 'practice/writing', loadComponent: () => import('./features/writing/writing.page').then((m) => m.WritingPage) },
      { path: 'mistakes', loadComponent: () => import('./features/mistakes/mistakes.page').then((m) => m.MistakesPage) },
      { path: 'placement', loadComponent: () => import('./features/placement/placement.page').then((m) => m.PlacementPage) },
      { path: 'practice/:game', loadComponent: () => import('./features/practice/game.page').then((m) => m.GamePage) },
      { path: 'progress', loadComponent: () => import('./features/progress/progress.page').then((m) => m.ProgressPage) },
      { path: 'leaderboard', loadComponent: () => import('./features/leaderboard/leaderboard.page').then((m) => m.LeaderboardPage) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage) },
      { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage) },
    ],
  },
  { path: '**', loadComponent: () => import('./features/not-found.page').then((m) => m.NotFoundPage) },
];
