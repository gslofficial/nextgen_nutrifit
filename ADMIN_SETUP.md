# NextGen NutriFit — Admin Panel Setup

## What was added

- **Database-backed food & exercise data.** Your food diary and exercise
  library used to be hardcoded arrays inside `fooddairy.js` and
  `exercise.js`. They now live in MongoDB (`Food` and `Exercise`
  collections) and are loaded through two new public read endpoints:
  `GET /api/foods` and `GET /api/exercises`. The very first time the
  server starts and finds those collections empty, it automatically
  seeds them with everything that was in your original arrays
  (see `data/foods-seed.json` and `data/exercises-seed.json`), so
  nothing is lost.
- **An admin role on your existing User model** (`role: 'user' | 'admin'`).
- **A separate admin login** at `/adminlogin.html`, kept independent
  from the normal member session.
- **An admin dashboard** at `/admin.html` with three tabs:
  - **Food Diary** — add, edit, delete food items
  - **Exercises** — add, edit, delete exercises (home/gym/yoga)
  - **Users** — view registered users, edit their details, promote/demote
    admin access, or delete accounts

## 1. Install the new dependency-free files

Copy every file from this delivery into your project, keeping the same
folder layout you already use (client pages in your `client/` folder,
`server.js` and `package.json` in the project root). If you already
have a `package.json`, just merge in the dependencies listed here
instead of overwriting yours.

## 2. Install dependencies
To check the connectivity
```bash
npm install
```

## 3. Set your environment variables

Copy `.env.example` to `.env` and fill in your real values (Mongo
connection string, Gmail address, Gmail app password).

## 4. Start the server

```bash
npm start
```

On first boot you'll see log lines like:

```
Connected to MongoDB successfully!
🌱 Seeded 63 food items into the database.
🌱 Seeded 61 exercises into the database.
```

That only happens once — after that, the collections are already
populated and won't be touched again automatically.

## 5. Create your first admin account

Admin access is just a flag on a normal account, so:

1. Register a normal account through your site as usual
   (`registerpage.html`), using the email you want as your admin login.
2. From the project root, run:

   ```bash
   node make-admin.js youremail@example.com
   ```

3. Go to `/adminlogin.html` and log in with that email and the same
   password you registered with.

Repeat step 2 for anyone else (e.g. your professor) who needs admin
access — just promote their existing account the same way.

## 6. Using the dashboard

- **Food Diary tab** — "Add food" opens a form for name, type
  (Vegetarian/Non-Vegetarian), group, and nutrition values per 100g.
  Edits and deletes apply immediately — the public food diary page
  reflects the change the next time it loads.
- **Exercises tab** — "Add exercise" lets you set the category
  (home/gym/yoga), the gym body-group (only relevant for gym
  exercises), sets/reps or sets/hold, rest time, an optional video
  path, and one form cue per line. The `Exercise ID` field must be
  unique — it's the same kind of short slug your original data used
  (e.g. `barbell-squat`).
- **Users tab** — edit a member's profile fields, change their role
  between `user` and `admin`, or delete their account. You can't
  delete the admin account you're currently logged in as.

## Notes

- The admin session is separate from the member session, so being
  logged in as a regular member and as an admin at the same time (in
  different tabs) won't conflict.
- All `/admin/api/*` routes require an active admin session — they
  return `401` otherwise, so they can't be hit by a regular member.
- If you ever want to reset the food/exercise catalog back to the
  original data, drop the `Food` and `Exercise` collections in
  MongoDB and restart the server — it will reseed automatically.
