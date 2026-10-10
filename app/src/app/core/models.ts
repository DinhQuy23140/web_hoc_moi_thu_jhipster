/** UI (interface) language — independent from the language being learned. */
export type UiLocale = 'vi' | 'en' | 'ja';

/** Localized text for content. `vi` and `en` are required, `ja` falls back to `en`. */
export interface L10n {
  vi: string;
  en: string;
  ja?: string;
}

/** Target learning language. */
export interface Language {
  id: string;
  code: 'en' | 'ja';
  name: L10n;
  nativeName: string;
  flag: string;
  speechLang: string;
  levels: string[];
  order: number;
  active: boolean;
  courseCount: number;
}

export interface CertificateLevel {
  code: string;
  label: string;
  cefr?: string;
  description: L10n;
}

export interface CertificateSection {
  name: L10n;
  minutes: number;
  questions: number;
}

export interface Certificate {
  id: string;
  languageId: string;
  code: string;
  name: string;
  fullName: string;
  organizer: string;
  description: L10n;
  levels: CertificateLevel[];
  sections: CertificateSection[];
  scoring: L10n;
  durationMinutes: number;
  validity: L10n;
  website: string;
  tips: L10n[];
  color: string;
  order: number;
  courseIds: string[];
  examIds: string[];
}

export interface Course {
  id: string;
  languageId: string;
  certificateId: string | null;
  level: string;
  cefr: string;
  title: L10n;
  subtitle: L10n;
  description: L10n;
  outcomes: L10n[];
  emoji: string;
  color: string;
  coverUrl?: string;
  tags: string[];
  unitCount: number;
  lessonCount: number;
  vocabCount: number;
  estimatedHours: number;
  difficulty: number;
  order: number;
  published: boolean;
}

export interface LessonSummary {
  id: string;
  title: L10n;
  minutes: number;
  xp: number;
  kinds: ContentType[];
}

export interface UnitOutline {
  id: string;
  title: L10n;
  description: L10n;
  lessons: LessonSummary[];
}

export interface CourseOutline {
  courseId: string;
  units: UnitOutline[];
}

export type ContentType =
  | 'VOCABULARY'
  | 'GRAMMAR'
  | 'READING'
  | 'LISTENING'
  | 'SPEAKING'
  | 'VIDEO'
  | 'EXERCISE';

export interface VocabItem {
  id: string;
  word: string;
  reading?: string;
  romaji?: string;
  ipa?: string;
  pos: string;
  meaning: L10n;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: L10n;
  audioUrl?: string;
  imageUrl?: string;
  level: string;
  topic?: string;
}

export interface Vocabulary extends VocabItem {
  languageId: string;
  wordLc: string;
  tags: string[];
}

export interface GrammarPoint {
  id: string;
  title: string;
  structure: string;
  explanation: L10n;
  examples: { text: string; reading?: string; meaning: L10n }[];
  note?: L10n;
}

export type ExerciseType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'MATCHING'
  | 'ORDER_WORD'
  | 'TRANSLATE'
  | 'LISTENING'
  | 'SPEAKING'
  | 'DICTATION';

export interface Exercise {
  id: string;
  type: ExerciseType;
  /** Instruction shown above the question, localized. */
  instruction: L10n;
  /** Main question text in the target language (may contain "___" for blanks). */
  question?: string;
  /** Optional hint / reading for the question. */
  hint?: string;
  /** Question written in the learner's UI language (e.g. a meaning to translate). */
  prompt?: L10n;
  options?: string[];
  /** Localized display text for option / pair values that are not in the target language. */
  labels?: Record<string, L10n>;
  /** Accepted answers. For ORDER_WORD the single entry is the full sentence. */
  answers?: string[];
  /** For TRUE_FALSE. */
  correct?: boolean;
  /** For MATCHING: left/right pairs in correct order. */
  pairs?: [string, string][];
  /** Text read by text-to-speech for LISTENING / SPEAKING. */
  audioText?: string;
  audioUrl?: string;
  explanation?: L10n;
}

export interface VocabularyContent {
  type: 'VOCABULARY';
  title: L10n;
  items: VocabItem[];
}
export interface GrammarContent {
  type: 'GRAMMAR';
  title: L10n;
  points: GrammarPoint[];
}
export interface ReadingContent {
  type: 'READING';
  title: L10n;
  passage: string;
  passageReading?: string;
  translation?: L10n;
  questions: Exercise[];
}
export interface ListeningContent {
  type: 'LISTENING';
  title: L10n;
  audioUrl?: string;
  script: { speaker?: string; text: string; meaning?: L10n }[];
  questions: Exercise[];
}
export interface SpeakingContent {
  type: 'SPEAKING';
  title: L10n;
  prompts: { text: string; reading?: string; meaning: L10n }[];
}
export interface VideoContent {
  type: 'VIDEO';
  title: L10n;
  videoUrl: string;
  posterUrl?: string;
  description?: L10n;
}
export interface ExerciseContent {
  type: 'EXERCISE';
  title: L10n;
  exercises: Exercise[];
}

export type LessonContent =
  | VocabularyContent
  | GrammarContent
  | ReadingContent
  | ListeningContent
  | SpeakingContent
  | VideoContent
  | ExerciseContent;

export interface Lesson {
  id: string;
  courseId: string;
  languageId: string;
  unitId: string;
  order: number;
  title: L10n;
  minutes: number;
  xp: number;
  contents: LessonContent[];
}

export interface ExamSection {
  title: L10n;
  kind: 'vocabulary' | 'grammar' | 'reading' | 'listening';
  passage?: string;
  questions: Exercise[];
}

export interface Exam {
  id: string;
  certificateId: string;
  languageId: string;
  level: string;
  title: L10n;
  durationMinutes: number;
  passPercent: number;
  sections: ExamSection[];
  questionCount: number;
  order: number;
}

/* ---------------------------- user / activity data --------------------------- */

export type ThemeMode = 'light' | 'dark' | 'system' | 'sepia' | 'contrast';
export type Palette = 'indigo' | 'sakura' | 'ocean' | 'forest' | 'sunset';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  uiLocale: UiLocale;
  targetLanguage: string;
  dailyGoal: number;
  xp: number;
  weeklyXp: number;
  weekId: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lessonsCompleted: number;
  wordsLearned: number;
  totalMinutes: number;
  achievements: string[];
  createdAt: number;
  /** Streak freezes owned (earned every 7-day streak, max 2). */
  streakFreezes?: number;
}

export interface CourseProgress {
  courseId: string;
  completed: string[];
  scores: Record<string, number>;
  lastLessonId: string | null;
  percent: number;
  startedAt: number;
  updatedAt: number;
}

export type VocabStatus = 'learning' | 'known' | 'difficult';

export interface UserVocab {
  vocabId: string;
  languageId: string;
  word: string;
  reading?: string;
  meaning: L10n;
  example?: string;
  status: VocabStatus;
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  due: number;
  correct: number;
  wrong: number;
  updatedAt: number;
  /** FSRS memory state (absent on cards last reviewed with the old SM-2 scheduler). */
  stability?: number;
  difficulty?: number;
  lastReview?: number;
}

export type MistakeSource = 'lesson' | 'exam' | 'challenge' | 'game';

/** A question the learner got wrong, kept until answered correctly twice in a row. */
export interface Mistake {
  id: string;
  languageId: string;
  source: MistakeSource;
  refId: string;
  title: string;
  exercise: Exercise;
  wrong: number;
  /** Consecutive correct answers since the last mistake. */
  streak: number;
  lastWrong: number;
}

export interface DayStat {
  m: number;
  xp: number;
  l: number;
  e: number;
}

export interface YearStats {
  days: Record<string, DayStat>;
}

export interface Attempt {
  id?: string;
  kind: 'lesson' | 'exam' | 'game' | 'review' | 'challenge';
  refId: string;
  title: string;
  score: number;
  correct: number;
  total: number;
  durationSec: number;
  createdAt: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  xp: number;
  updatedAt: number;
}

export interface Page<T> {
  items: T[];
  cursor: unknown | null;
  hasMore: boolean;
}
