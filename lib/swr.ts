/**
 * Shared SWR fetchers and keys for API data.
 * Use with useSWR(key, fetcher) or useSWR(key, fetcher, options).
 */

const baseFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error('Request failed');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
};

/** GET /api/stats → { stats } */
export const statsFetcher = async (url: string) => {
  const json = await baseFetcher(url);
  return json.stats;
};

/** GET /api/onboarding/profile → { profile } */
export const profileFetcher = async (url: string) => {
  const json = await baseFetcher(url);
  return json.profile;
};

/** GET /api/sessions → { sessions } */
export const sessionsFetcher = async (url: string) => {
  const json = await baseFetcher(url);
  return json.sessions ?? [];
};

/** GET /api/onboarding/assignments → { assignments } */
export const assignmentsFetcher = async (url: string) => {
  const json = await baseFetcher(url);
  return json.assignments ?? [];
};

/** GET /api/onboarding/courses → { courses } */
export const coursesFetcher = async (url: string) => {
  const json = await baseFetcher(url);
  return json.courses ?? [];
};

export const apiKeys = {
  stats: '/api/stats',
  profile: '/api/onboarding/profile',
  sessions: '/api/sessions',
  assignments: '/api/onboarding/assignments',
  courses: '/api/onboarding/courses',
} as const;

// ---------------------------------------------------------------------------
// Mutations (use with useSWRMutation from 'swr/mutation')
// ---------------------------------------------------------------------------

async function mutationFetcher(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body: unknown,
) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = new Error('Request failed');
    (err as Error & { status?: number }).status = res.status;
    try {
      (err as Error & { data?: unknown }).data = await res.json();
    } catch {
      // ignore
    }
    throw err;
  }
  return res.json();
}

/** POST /api/recommend — arg: { mood, timeAvailable } */
export const recommendMutationFetcher = (
  _key: string,
  { arg }: { arg: { mood: string; timeAvailable: number } },
) => mutationFetcher('/api/recommend', 'POST', arg);

/** POST /api/sessions — arg: session body */
export const startSessionMutationFetcher = (
  _key: string,
  { arg }: { arg: Record<string, unknown> },
) => mutationFetcher('/api/sessions', 'POST', arg);

/** PUT /api/sessions/[id]/complete — arg: { id, durationActual, completed, notes?, clientDate? } */
export const completeSessionMutationFetcher = (
  _key: string,
  {
    arg,
  }: {
    arg: {
      id: string;
      durationActual: number;
      completed: boolean;
      notes?: string;
      clientDate?: string;
    };
  },
) => mutationFetcher(`/api/sessions/${arg.id}/complete`, 'PUT', arg);

/** PUT /api/onboarding/profile — arg: { displayName?, defaultSessionMinutes? } */
export const updateProfileMutationFetcher = (
  _key: string,
  { arg }: { arg: { displayName?: string | null; defaultSessionMinutes?: number } },
) => mutationFetcher('/api/onboarding/profile', 'PUT', arg);

/** POST /api/onboarding/assignments — arg: assignment body */
export const createAssignmentMutationFetcher = (
  _key: string,
  {
    arg,
  }: {
    arg: { title: string; due_at?: string; estimated_minutes?: number; course_id?: string | null };
  },
) => mutationFetcher('/api/onboarding/assignments', 'POST', arg);

/** POST /api/coding-practice — arg: session payload */
export const saveCodingSessionMutationFetcher = (
  _key: string,
  {
    arg,
  }: {
    arg: {
      language: string;
      startedAt: string;
      endedAt: string;
      durationSeconds: number;
      charactersTyped: number;
      charactersCorrect: number;
      wpm: number;
      accuracyPercent: number;
    };
  },
) => mutationFetcher('/api/coding-practice', 'POST', arg);

/** POST /api/generate-practice-code — arg: { mood, timeAvailable, language? } → { code, language } */
export const generatePracticeCodeMutationFetcher = (
  _key: string,
  {
    arg,
  }: {
    arg: {
      mood: 'low' | 'moderate' | 'high';
      timeAvailable: number;
      language?: string;
    };
  },
) => mutationFetcher('/api/generate-practice-code', 'POST', arg);
