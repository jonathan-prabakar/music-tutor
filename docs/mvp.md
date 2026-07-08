# Cline Rules for MusicTutor

## Project Context
This project is **MusicTutor**, a Next.js 16 App Router application for a music tutor/student marketplace.

## Tech Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Root-level `app/` directory
- Root-level `lib/` directory
- No `src/` folder
- Currently using `localStorage` for mock persistence
- Do not add new packages unless explicitly requested

## Current Routes
- `/` landing page
- `/student/onboarding`
- `/student/dashboard`
- `/tutor/onboarding`
- `/tutor/dashboard`

## Current Data Persistence
Use browser `localStorage` for now.

Known localStorage keys:
- `studentProfile`
- `tutorProfile`
- `requestedTutorIds`
- `requestedStudentIds`
- `lessonRequests`
- `tutorStudentRequests`

## Existing Lib Files
- `lib/mock-tutors.ts`
- `lib/matching.ts`
- `lib/mock-students.ts`
- `lib/tutor-matching.ts`

## Coding Rules
1. Make the smallest possible change for the requested task.
2. Modify only the files explicitly listed in the prompt.
3. Do not refactor unrelated code.
4. Preserve existing UI, styling, layout, imports, and matching logic unless the task requires a change.
5. Use real JSX syntax, never escaped HTML entities.
   - Correct: `<main>`
   - Wrong: `&lt;main&gt;`
   - Correct: `Record<string, string>`
   - Wrong: `Record&lt;string, string&gt;`
   - Correct: `=>`
   - Wrong: `=&gt;`
6. Keep components compiling with TypeScript.
7. Do not add Supabase, Stripe, auth, or AI APIs unless explicitly requested.
8. Do not create new routes unless explicitly requested.
9. Do not install packages.
10. Do not change package.json unless explicitly requested.

## Cline Workflow Rules
Before editing:
1. Inspect the relevant file(s).
2. Explain the plan in 3 bullet points or fewer.
3. Show the diff before applying changes.
4. Wait for approval before applying changes unless the user explicitly says to apply directly.

After editing:
1. Summarize changed files.
2. Mention how to test manually.
3. If there is an error, fix only the error.

## Current Product Priority
The project is moving from prototype to beta product quickly.
Prioritize features that complete marketplace functionality:
1. Lesson request status visibility
2. Accepted matches page
3. Practice room MVP
4. Supabase auth and database
5. Deployment

## Current Recommended Next Feature
Create a student matches page at `/student/matches` that displays accepted lesson requests.

## Commit Style
Use concise product-focused commits:
- `Add student matches page`
- `Show lesson request status on student dashboard`
- `Add practice room MVP`
- `Add Supabase schema`
