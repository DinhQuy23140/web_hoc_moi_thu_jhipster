package com.lingora.service.learning;

/**
 * FSRS-5 spaced repetition with default parameters and 90 % target retention.
 * Server-side port of {@code app/src/app/core/srs.ts}; both must stay in sync.
 */
public final class Srs {

    public enum Grade {
        AGAIN(1),
        HARD(2),
        GOOD(3),
        EASY(4);

        final int value;

        Grade(int value) {
            this.value = value;
        }

        public static Grade parse(String s) {
            return Grade.valueOf(s.trim().toUpperCase(java.util.Locale.ROOT));
        }
    }

    /** Card state; times are epoch milliseconds, {@code stability}/{@code difficulty} may be null (SM-2 cards). */
    public record State(double ease, double interval, int reps, int lapses, long due, Double stability, Double difficulty, Long lastReview) {}

    private static final long DAY = 86_400_000L;
    private static final long RELEARN_MS = 10 * 60_000L;
    private static final int MAX_INTERVAL = 365;
    private static final double DECAY = -0.5;
    private static final double FACTOR = 19.0 / 81.0;
    private static final double[] W = {
        0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
        2.9898, 0.51655, 0.6621,
    };

    private Srs() {}

    public static State fresh(long now) {
        return new State(2.5, 0, 0, 0, now, null, null, null);
    }

    static double retrievability(double elapsedDays, double stability) {
        return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
    }

    private static double initStability(int g) {
        return Math.max(W[g - 1], 0.1);
    }

    private static double initDifficulty(int g) {
        return clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);
    }

    private static double nextDifficulty(double d, int g) {
        double delta = -W[6] * (g - 3);
        double damped = d + (delta * (10 - d)) / 9;
        return clamp(W[7] * initDifficulty(4) + (1 - W[7]) * damped, 1, 10);
    }

    private static double recallStability(double d, double s, double r, int g) {
        double hardPenalty = g == 2 ? W[15] : 1;
        double easyBonus = g == 4 ? W[16] : 1;
        return s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hardPenalty * easyBonus + 1);
    }

    private static double forgetStability(double d, double s, double r) {
        double sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
        return Math.min(sf, s);
    }

    private static double shortTermStability(double s, int g) {
        return s * Math.exp(W[17] * (g - 3 + W[18]));
    }

    private record Memory(double s, double d, long last) {}

    private static Memory memory(State st) {
        if (st.reps() == 0 && st.lapses() == 0 && st.stability() == null) return null;
        long fallbackLast = st.due() - Math.round(st.interval() * DAY);
        if (st.stability() != null && st.difficulty() != null) {
            return new Memory(st.stability(), st.difficulty(), st.lastReview() != null ? st.lastReview() : fallbackLast);
        }
        return new Memory(Math.max(st.interval(), 0.5), clamp(10 - (st.ease() - 1.3) * 4, 1, 10), fallbackLast);
    }

    public static State review(State st, Grade grade, long now) {
        int g = grade.value;
        Memory mem = memory(st);
        double s;
        double d;
        if (mem == null) {
            s = initStability(g);
            d = initDifficulty(g);
        } else {
            double elapsed = (now - mem.last()) / (double) DAY;
            double r = retrievability(elapsed, mem.s());
            d = nextDifficulty(mem.d(), g);
            if (elapsed < 1) s = shortTermStability(mem.s(), g);
            else s = g == 1 ? forgetStability(mem.d(), mem.s(), r) : recallStability(mem.d(), mem.s(), r, g);
        }
        s = round2(Math.max(s, 0.1));
        d = round2(d);

        if (grade == Grade.AGAIN) {
            return new State(st.ease(), 0, 0, st.lapses() + 1, now + RELEARN_MS, s, d, now);
        }
        int interval = (int) clamp(Math.round(s), 1, MAX_INTERVAL);
        if (grade == Grade.EASY) {
            int prev = st.interval() > 0 ? (int) Math.round(st.interval()) : 1;
            interval = Math.max(interval, Math.min(MAX_INTERVAL, prev + 1));
        }
        return new State(st.ease(), interval, st.reps() + 1, st.lapses(), now + interval * DAY, s, d, now);
    }

    /** Mastery 0..5 derived from the interval. */
    public static int mastery(double interval, int reps) {
        if (reps == 0) return 0;
        if (interval >= 60) return 5;
        if (interval >= 21) return 4;
        if (interval >= 7) return 3;
        if (interval >= 3) return 2;
        return 1;
    }

    private static double clamp(double n, double min, double max) {
        return Math.max(min, Math.min(max, n));
    }

    private static double round2(double n) {
        return Math.round(n * 100) / 100.0;
    }
}
