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
- **Role based login** through the member login page, with the existing
  admin login page retained as a shortcut. Admin APIs check the current
  MongoDB role on each request.
- Login sessions are stored in the same MongoDB database through the existing
  Mongoose connection, so production instances share the same signed-in session.
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

Set `MONGO_URI`, `BREVO_API`, and `BREVO_FROM_EMAIL` in the root `.env`.
`BREVO_FROM_NAME` defaults to `NextGen NutriFit`. Also set a strong
`SESSION_SECRET`; never commit `.env` or put these values in frontend code.
OTP and password reset email go to the address entered for the account.

### Email on Render

Email uses Brevo's transactional email API over HTTPS. In the Render service's
**Environment** settings, add:

1. `BREVO_API` — the Brevo API key.
2. `BREVO_FROM_EMAIL` — a sender address verified and enabled for transactional email in Brevo.
3. `BREVO_FROM_NAME` — for example, `NextGen NutriFit`.

Save the variables and redeploy. A successful API response means Brevo accepted
the email for processing; it does not confirm arrival in the recipient's inbox.

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

3. Log in with the same credentials through either login page. The normal
   login page redirects administrators to `/admin.html` based on the role.

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
