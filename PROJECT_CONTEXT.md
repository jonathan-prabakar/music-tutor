# MusicTutor Project Context

## Project
MusicTutor is a Next.js App Router project for an AI-powered music tutor/student marketplace.

## Current Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- LocalStorage for mock persistence
- Root-level `app/` directory, not `src/app/`
- Root-level `lib/` directory

## Current Routes
- `/` landing page
- `/student/onboarding` student onboarding
- `/student/dashboard` student dashboard with matched tutors
- `/tutor/onboarding` tutor onboarding
- `/tutor/dashboard` tutor dashboard with matched students

## Existing Lib Files
- `lib/mock-tutors.ts`
- `lib/matching.ts`
- `lib/mock-students.ts`
- `lib/tutor-matching.ts`

## Current Features Built
- Landing page with student/tutor role cards
- Student onboarding steps:
  - name + instruments
  - experience
  - goal
- Tutor onboarding steps:
  - name + instruments
  - teaching style
  - preferred student level
- Student dashboard:
  - loads `studentProfile` from localStorage
  - shows matched tutor cards
  - uses `calculateCompatibility`
- Tutor dashboard:
  - loads `tutorProfile` from localStorage
  - shows matched student cards
  - uses `calculateStudentCompatibility`

## Current Bug
Student dashboard stopped showing after adding lesson request flow.
Likely issue: `handleRequestTutor` was placed inside `useMemo`, so JSX cannot access it.
Fix: `handleRequestTutor` must be inside `StudentDashboardPage`, but outside `useMemo`.

Correct structure:

```tsx
export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [requestedTutorIds, setRequestedTutorIds] = useState<number[]>([]);

  useEffect(() => {
    // load studentProfile and requestedTutorIds
  }, []);

  const matchedTutors = useMemo(() => {
    // calculate tutor matches
  }, [profile]);

  function handleRequestTutor(tutorId: number) {
    // save request to localStorage
  }

  if (!profile) {
    // return onboarding fallback
  }

  return (
    // dashboard JSX
  );
}
```

## Next Planned Feature
Lesson request flow:
1. Student clicks Contact
2. Button changes to Request Sent
3. Save to localStorage:
   - `requestedTutorIds`
   - `lessonRequests`
4. Tutor dashboard reads `lessonRequests`
5. Tutor sees Incoming Lesson Requests
6. Tutor can Accept or Decline

## Important Notes
- Use real JSX in files, not escaped HTML.
- Correct: `<main>`
- Wrong: `&lt;main&gt;`
- Correct: `I&apos;m`
- Wrong: `I&amp;apos;m`

## Suggested Next Commit
```bash
git add .
git commit -m "Fix student lesson request action"
git push
```
