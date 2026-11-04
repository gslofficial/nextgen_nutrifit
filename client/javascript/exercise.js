/* =========================================================
   NextGen NutriFit — Exercise Library
   Data-driven cards + a rep-counting / rest-timing player.
   Movements without a filmed clip use a looping motion-pattern
   pictogram (built below) that matches the actual joint action.
   ========================================================= */

/* ---------- Motion pictograms (SMIL loops, one per movement pattern) ---------- */
const ICONS = {
  cardio: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -9;0 0" dur="0.55s" repeatCount="indefinite"/>
        <circle cx="100" cy="38" r="14"/>
        <line x1="100" y1="52" x2="100" y2="112"/>
        <line x1="100" y1="112" x2="76" y2="172"/>
        <line x1="100" y1="112" x2="124" y2="172"/>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="70 100 62;-25 100 62;70 100 62" dur="0.55s" repeatCount="indefinite"/>
          <line x1="100" y1="62" x2="142" y2="46"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-70 100 62;25 100 62;-70 100 62" dur="0.55s" repeatCount="indefinite"/>
          <line x1="100" y1="62" x2="58" y2="46"/>
        </g>
      </g>
    </g>`,
  squat: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="34" r="14"/>
      <line x1="86" y1="58" x2="72" y2="90"/>
      <line x1="114" y1="58" x2="128" y2="90"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 24;0 0" dur="1.3s" repeatCount="indefinite"/>
        <line x1="100" y1="48" x2="100" y2="110"/>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 100 110;34 100 110;0 100 110" dur="1.3s" repeatCount="indefinite"/>
          <line x1="100" y1="110" x2="86" y2="150"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 100 110;-34 100 110;0 100 110" dur="1.3s" repeatCount="indefinite"/>
          <line x1="100" y1="110" x2="114" y2="150"/>
        </g>
      </g>
    </g>`,
  lunge: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="96" cy="34" r="14"/>
      <line x1="96" y1="48" x2="100" y2="106"/>
      <line x1="82" y1="60" x2="66" y2="88"/>
      <line x1="110" y1="60" x2="126" y2="88"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 100 106;18 100 106;0 100 106" dur="1.3s" repeatCount="indefinite"/>
        <line x1="100" y1="106" x2="70" y2="132"/>
        <line x1="70" y1="132" x2="72" y2="172"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 100 106;-18 100 106;0 100 106" dur="1.3s" repeatCount="indefinite"/>
        <line x1="100" y1="106" x2="134" y2="120"/>
        <line x1="134" y1="120" x2="150" y2="150"/>
      </g>
    </g>`,
  curl: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="34" r="14"/>
      <line x1="100" y1="48" x2="100" y2="122"/>
      <line x1="86" y1="66" x2="88" y2="150"/>
      <line x1="100" y1="122" x2="88" y2="168"/>
      <line x1="100" y1="122" x2="112" y2="168"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 114 66;-105 114 66;0 114 66" dur="1.1s" repeatCount="indefinite"/>
        <line x1="114" y1="66" x2="114" y2="112"/>
      </g>
    </g>`,
  press: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="40" r="14"/>
      <line x1="100" y1="54" x2="100" y2="120"/>
      <line x1="100" y1="120" x2="86" y2="168"/>
      <line x1="100" y1="120" x2="114" y2="168"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="88 86 66;0 86 66;88 86 66" dur="1.2s" repeatCount="indefinite"/>
        <line x1="86" y1="66" x2="86" y2="106"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-88 114 66;0 114 66;-88 114 66" dur="1.2s" repeatCount="indefinite"/>
        <line x1="114" y1="66" x2="114" y2="106"/>
      </g>
    </g>`,
  row: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-18 100 100;4 100 100;-18 100 100" dur="1.3s" repeatCount="indefinite"/>
        <circle cx="100" cy="34" r="14"/>
        <line x1="100" y1="48" x2="100" y2="120"/>
        <line x1="88" y1="66" x2="60" y2="70"/>
        <line x1="100" y1="120" x2="86" y2="168"/>
        <line x1="100" y1="120" x2="114" y2="168"/>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;30 6;0 0" dur="1.3s" repeatCount="indefinite"/>
          <line x1="88" y1="66" x2="150" y2="80"/>
        </g>
      </g>
    </g>`,
  core: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <line x1="60" y1="150" x2="150" y2="150"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 68 150;-26 68 150;0 68 150" dur="1.3s" repeatCount="indefinite"/>
        <circle cx="68" cy="120" r="13"/>
        <line x1="68" y1="133" x2="68" y2="150"/>
      </g>
      <line x1="150" y1="150" x2="170" y2="132"/>
    </g>`,
  neck: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <line x1="100" y1="70" x2="100" y2="150"/>
      <line x1="86" y1="90" x2="100" y2="110"/>
      <line x1="114" y1="90" x2="100" y2="110"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-16 100 66;16 100 66;-16 100 66" dur="1.6s" repeatCount="indefinite"/>
        <circle cx="100" cy="40" r="16"/>
      </g>
    </g>`,
  yoga: `
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-4 100 120;4 100 120;-4 100 120" dur="3.2s" repeatCount="indefinite"/>
        <circle cx="100" cy="40" r="14"/>
        <line x1="100" y1="54" x2="100" y2="128"/>
        <line x1="100" y1="66" x2="62" y2="48"/>
        <line x1="100" y1="66" x2="138" y2="48"/>
        <line x1="100" y1="128" x2="72" y2="168"/>
        <line x1="100" y1="128" x2="128" y2="168"/>
      </g>
    </g>`
};

function iconSVG(pattern){
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${pattern} motion demo">${ICONS[pattern] || ICONS.yoga}</svg>`;
}

/* ---------- Exercise data ---------- */
// type: 'reps' (counted) or 'hold' (timed)
let EXERCISES = [

  // ===== HOME (no equipment) =====
  {id:'jumping-jacks', cat:'home', muscle:'Full body / cardio', name:'Jumping Jacks', pattern:'cardio', type:'reps', sets:3, reps:20, rest:30, video:'exercise_video/jumping-jack.mp4',
    cues:['Feet together, arms at sides to start','Jump feet apart while raising arms overhead','Jump back to start — that\'s one rep','Keep a steady, springy rhythm']},
  {id:'high-knees', cat:'home', muscle:'Full body / cardio', name:'Running in Place (High Knees)', pattern:'cardio', type:'hold', sets:3, hold:30, rest:30,video:'exercise_video/high-knee.mp4',
    cues:['Drive knees up toward hip height','Pump arms like a real sprint','Stay on the balls of your feet','Land light, not flat-footed']},
  {id:'push-up', cat:'home', muscle:'Chest / triceps', name:'Push-Up', pattern:'press', type:'reps', sets:3, reps:12, rest:45,video:'exercise_video/push-up.mp4',
    cues:['Hands just outside shoulder width','Body in one straight line, core tight','Lower until chest is near the floor','Press back up without flaring elbows']},
  {id:'bw-squat', cat:'home', muscle:'Legs / glutes', name:'Bodyweight Squat', pattern:'squat', type:'reps', sets:3, reps:15, rest:40,video:'exercise_video/bodyweight-squat.mp4',
    cues:['Feet shoulder-width, toes slightly out','Sit hips back and down, knees track toes','Thighs to at least parallel','Drive through heels to stand']},
  {id:'lunge-bw', cat:'home', muscle:'Legs / glutes', name:'Forward Lunge', pattern:'lunge', type:'reps', sets:3, reps:12, rest:40,video:'exercise_video/forward-lunge.mp4',
    cues:['Step forward, lower the back knee toward the floor','Front knee stays above the ankle','Push off the front foot to return','Alternate legs each rep']},
  {id:'plank', cat:'home', muscle:'Core', name:'Plank Hold', pattern:'core', type:'hold', sets:3, hold:40, rest:30,video:'exercise_video/plank-hold.mp4',
    cues:['Forearms down, elbows under shoulders','Body one straight line, no sagging hips','Squeeze glutes and brace your core','Breathe — don\'t hold your breath']},
  {id:'mountain-climbers', cat:'home', muscle:'Core / cardio', name:'Mountain Climbers', pattern:'cardio', type:'hold', sets:3, hold:30, rest:30,video:'exercise_video/mountain-climb.mp4',
    cues:['Start in a high plank','Drive knees toward chest, alternating fast','Keep hips low and steady','Hands stay planted under shoulders']},
  {id:'burpee', cat:'home', muscle:'Full body', name:'Burpee', pattern:'cardio', type:'reps', sets:3, reps:10, rest:60,video:'exercise_video/burpee.mp4',
    cues:['Squat down, hands to the floor','Kick feet back into a plank','Chest to floor, then push back up','Jump feet in and leap up']},
  {id:'glute-bridge', cat:'home', muscle:'Glutes / hamstrings', name:'Glute Bridge', pattern:'core', type:'reps', sets:3, reps:15, rest:30,video:'exercise_video/glute-bridge.mp4',
    cues:['Lie back, knees bent, feet flat','Drive hips up, squeezing glutes at the top','Pause a beat, then lower with control','Keep ribs down, no arching the low back']},
  {id:'superman', cat:'home', muscle:'Lower back', name:'Superman Hold', pattern:'core', type:'hold', sets:3, hold:20, rest:30,video:'exercise_video/superman-hold.mp4',
    cues:['Lie face down, arms extended forward','Lift chest, arms and legs off the floor together','Hold, squeezing glutes and back','Lower slowly — don\'t just drop']},
  {id:'wall-sit', cat:'home', muscle:'Legs', name:'Wall Sit', pattern:'squat', type:'hold', sets:3, hold:45, rest:30,video:'exercise_video/wall-sit-crunch.mp4',
    cues:['Back flat against a wall','Slide down until thighs are parallel to floor','Knees stacked over ankles','Hold steady — small wobbles are fine']},
  {id:'bicycle-crunch', cat:'home', muscle:'Stomach', name:'Bicycle Crunch', pattern:'core', type:'reps', sets:3, reps:16, rest:30,video:'exercise_video/bicycle-crunch.mp4',
    cues:['Hand behind head, opposite hand out','Lift knee while crunching elbow toward it','Squeeze the side of your waist','Alternate sides each rep']},

  // ===== GYM — Legs =====
  {id:'barbell-squat', cat:'gym', group:'legs', muscle:'Quads / glutes', name:'Barbell Back Squat', pattern:'squat', type:'reps', sets:4, reps:8, rest:90,video:'exercise_video/barbell-back-squat.mp4',
    cues:['Bar rests across the upper traps','Brace core hard before descending','Hips and knees bend together','Drive up, keep the bar path vertical']},
  {id:'leg-press', cat:'gym', group:'legs', muscle:'Quads / glutes', name:'Leg Press', pattern:'squat', type:'reps', sets:4, reps:10, rest:75,video:'exercise_video/leg-press.mp4',
    cues:['Feet shoulder-width on the platform','Lower until knees reach about 90°','Don\'t let lower back round off the pad','Press through the whole foot']},
  {id:'leg-extension', cat:'gym', group:'legs', muscle:'Quads', name:'Leg Extension', pattern:'squat', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/leg-extension.mp4',
    cues:['Back flat against the pad','Extend knees until legs are straight','Squeeze quads hard at the top','Lower under control, no swinging']},
  {id:'romanian-deadlift', cat:'gym', group:'legs', muscle:'Hamstrings / glutes', name:'Romanian Deadlift', pattern:'row', type:'reps', sets:4, reps:8, rest:90,video:'exercise_video/romanian-deadlift.mp4',
    cues:['Slight knee bend, bar close to shins','Hinge at the hips, chest stays proud','Lower until you feel a hamstring stretch','Drive hips forward to stand']},
  {id:'calf-raise', cat:'gym', group:'legs', muscle:'Calves', name:'Standing Calf Raise', pattern:'squat', type:'reps', sets:3, reps:15, rest:45,video:'exercise_video/calf-raise.mp4',
    cues:['Balls of feet on the edge of a platform','Rise as high onto the toes as possible','Pause and squeeze at the top','Lower until you feel a full stretch']},

  // ===== GYM — Thighs =====
  {id:'sumo-squat', cat:'gym', group:'thighs', muscle:'Inner thighs / glutes', name:'Sumo Squat', pattern:'squat', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/sumo-squat.mp4',
    cues:['Wide stance, toes turned out','Sit straight down between the heels','Keep chest tall throughout','Drive knees out as you stand']},
  {id:'dumbbell-lunge', cat:'gym', group:'thighs', muscle:'Quads / inner thighs', name:'Dumbbell Lunge', pattern:'lunge', type:'reps', sets:3, reps:10, rest:60,video:'exercise_video/dumbbell-lunge.mp4',
    cues:['A dumbbell in each hand, arms at sides','Step forward into a controlled lunge','Front knee tracks over the foot','Push back to standing, switch legs']},
  {id:'leg-curl', cat:'gym', group:'thighs', muscle:'Hamstrings', name:'Lying Leg Curl', pattern:'squat', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/lying-leg-curl.mp4',
    cues:['Hips pressed flat into the pad','Curl heels toward glutes','Squeeze hamstrings at the top','Lower with control, don\'t let the weight drop']},
  {id:'adductor-machine', cat:'gym', group:'thighs', muscle:'Inner thighs', name:'Hip Adductor Machine', pattern:'squat', type:'reps', sets:3, reps:15, rest:45,video:'exercise_video/hip-adductor-machine.mp4',
    cues:['Sit tall, pads against the outer thighs','Squeeze knees together against resistance','Hold a beat at full squeeze','Return under control']},

  // ===== GYM — Shoulders =====
  {id:'overhead-press', cat:'gym', group:'shoulders', muscle:'Shoulders / triceps', name:'Barbell Overhead Press', pattern:'press', type:'reps', sets:4, reps:8, rest:90,visualViewport:true,video:'exercise_video/barbell-overhead-press.mp4',
    cues:['Bar at collarbone height, hands just outside shoulders','Brace core, press straight overhead','Head slides through once the bar clears it','Lower back to the start under control']},
  {id:'lateral-raise', cat:'gym', group:'shoulders', muscle:'Side delts', name:'Dumbbell Lateral Raise', pattern:'press', type:'reps', sets:3, reps:14, rest:45,video:'exercise_video/dumbbell-lateral-raise.mp4',
    cues:['Dumbbells at your sides, soft elbow bend','Raise arms out to shoulder height','Lead with the elbows, not the hands','Lower slowly — this is where it counts']},
  {id:'front-raise', cat:'gym', group:'shoulders', muscle:'Front delts', name:'Dumbbell Front Raise', pattern:'press', type:'reps', sets:3, reps:12, rest:45,video:'exercise_video/dumbbell-front-raise.mp4',
    cues:['Dumbbells in front of thighs','Raise one or both arms to shoulder height','Keep a slight bend in the elbows','Lower with control, avoid swinging']},
  {id:'rear-delt-fly', cat:'gym', group:'shoulders', muscle:'Rear delts', name:'Rear Delt Fly', pattern:'row', type:'reps', sets:3, reps:14, rest:45,video:'exercise_video/rear-delt-fly.mp4',
    cues:['Hinge forward, chest near parallel to floor','Sweep arms out and back, squeezing shoulder blades','Keep a slight bend in the elbows','Lower slowly to the start']},

  // ===== GYM — Neck =====
  {id:'neck-flexion', cat:'gym', group:'neck', muscle:'Neck flexors', name:'Neck Flexion (Manual Resistance)', pattern:'neck', type:'reps', sets:3, reps:10, rest:30,video:'exercise_video/neck-flexion.mp4',
    cues:['Hand on forehead for light resistance','Nod chin toward chest against your hand','Move slowly, no jerking','Return to neutral with control']},
  {id:'neck-lateral', cat:'gym', group:'neck', muscle:'Neck (side)', name:'Neck Lateral Flexion', pattern:'neck', type:'reps', sets:3, reps:10, rest:30,video:'exercise_video/neck-lateral-flexion.mp4',
    cues:['Hand against the side of the head','Tilt ear toward shoulder against light resistance','Keep shoulders down and relaxed','Switch sides evenly']},
  {id:'shrugs', cat:'gym', group:'neck', muscle:'Traps', name:'Barbell Shrug', pattern:'press', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/barbell-shrug.mp4',
    cues:['Bar in front, arms straight','Lift shoulders straight up toward ears','Avoid rolling the shoulders','Lower with control']},

  // ===== GYM — Biceps (uses the reference clip) =====
  {id:'barbell-curl', cat:'gym', group:'biceps', muscle:'Biceps', name:'Barbell Curl', pattern:'curl', type:'reps', sets:4, reps:10, rest:60,video:'exercise_video/barbell-curl.mp4',
    cues:['Grip just outside hip width, elbows pinned to sides','Curl the bar up without swinging the shoulders','Squeeze at the top','Lower fully under control']},
  {id:'hammer-curl', cat:'gym', group:'biceps', muscle:'Biceps / forearms', name:'Hammer Curl', pattern:'curl', type:'reps', sets:3, reps:12, rest:50,video:'exercise_video/hammer-curl.mp4',
    cues:['Dumbbells with palms facing each other','Curl straight up, keeping wrists neutral','Elbows stay tucked at your sides','Lower with control']},
  {id:'concentration-curl', cat:'gym', group:'biceps', muscle:'Biceps', name:'Concentration Curl', pattern:'curl', type:'reps', sets:3, reps:10, rest:45,video:'exercise_video/concentration-curl.mp4',
    cues:['Seated, elbow braced against inner thigh','Curl the dumbbell up slowly','Focus on squeezing the bicep peak','Lower fully before the next rep']},
  {id:'preacher-curl', cat:'gym', group:'biceps', muscle:'Biceps', name:'Preacher Curl', pattern:'curl', type:'reps', sets:3, reps:10, rest:60,video:'exercise_video/preacher-curl.mp4',
    cues:['Upper arms flat against the pad','Curl up without lifting elbows off the pad','Squeeze at the top','Lower until arms are almost straight']},

  // ===== GYM — Triceps =====
  {id:'tricep-pushdown', cat:'gym', group:'triceps', muscle:'Triceps', name:'Cable Tricep Pushdown', pattern:'press', type:'reps', sets:3, reps:12, rest:50,video:'exercise_video/cable-tricep-pushdown.mp4',
    cues:['Elbows pinned to your sides throughout','Push the bar down until arms are straight','Squeeze triceps at full extension','Let the bar rise under control']},
  {id:'skull-crusher', cat:'gym', group:'triceps', muscle:'Triceps', name:'Skull Crusher', pattern:'curl', type:'reps', sets:3, reps:10, rest:60,video:'exercise_video/skull-crusher.mp4',
    cues:['Lying down, bar or dumbbells above the chest','Bend only at the elbow, lowering toward the forehead','Keep upper arms still and vertical','Extend back up, squeezing triceps']},
  {id:'overhead-tricep-ext', cat:'gym', group:'triceps', muscle:'Triceps', name:'Overhead Tricep Extension', pattern:'press', type:'reps', sets:3, reps:12, rest:50,video:'exercise_video/overhead-tricep-extension.mp4',
    cues:['Weight held overhead with both hands','Lower behind the head, elbows pointing up','Keep upper arms close to your ears','Press back up to full extension']},
  {id:'dips', cat:'gym', group:'triceps', muscle:'Triceps / chest', name:'Bench Dips', pattern:'press', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/bench-dips.mp4',
    cues:['Hands on the bench edge, legs extended','Lower hips straight down, elbows pointing back','Go to about 90° at the elbow','Press back up without flaring shoulders']},

  // ===== GYM — Arms (forearms / grip) =====
  {id:'wrist-curl', cat:'gym', group:'arms', muscle:'Forearms', name:'Wrist Curl', pattern:'curl', type:'reps', sets:3, reps:15, rest:40,video:'exercise_video/wrist-curl.mp4',
    cues:['Forearms resting on a bench, palms up','Let the bar roll to your fingertips','Curl the wrist up as far as possible','Lower slowly for a full stretch']},
  {id:'farmers-carry', cat:'gym', group:'arms', muscle:'Forearms / full body', name:"Farmer's Carry", pattern:'row', type:'hold', sets:3, hold:40, rest:60,video:'exercise_video/farmer-carry.mp4',
    cues:['A heavy weight in each hand, shoulders back','Walk with short, controlled steps','Keep the core braced, avoid leaning','Grip hard the whole way']},
  {id:'reverse-curl', cat:'gym', group:'arms', muscle:'Forearms / biceps', name:'Reverse Curl', pattern:'curl', type:'reps', sets:3, reps:12, rest:50,video:'exercise_video/reverse-curl.mp4',
    cues:['Overhand grip on the bar','Curl up keeping wrists firm and flat','Elbows stay tucked to your sides','Lower fully under control']},

  // ===== GYM — Chest =====
  {id:'bench-press', cat:'gym', group:'chest', muscle:'Chest / triceps', name:'Barbell Bench Press', pattern:'press', type:'reps', sets:4, reps:8, rest:90,video:'exercise_video/barbell-bench-press.mp4',
    cues:['Grip just wider than shoulder width','Lower the bar to mid-chest with control','Elbows at roughly 45° from the torso','Press up to full lockout']},
  {id:'incline-barbell-press', cat:'gym', group:'chest', muscle:'Upper chest', name:'Incline Barbell Press', pattern:'press', type:'reps', sets:3, reps:10, rest:75,video:'exercise_video/incline-barbell-press.mp4',
    cues:['Bench set to a 30–45° incline','Press dumbbells up and slightly inward','Stop just short of locking the elbows','Lower until you feel a stretch']},
  {id:'cable-fly', cat:'gym', group:'chest', muscle:'Chest', name:'Cable Fly', pattern:'row', type:'reps', sets:3, reps:14, rest:50,video:'exercise_video/cable-fly.mp4',
    cues:['Slight forward lean, soft elbow bend','Sweep both hands together in front of the chest','Squeeze at the center','Return slowly to the stretch']},
  {id:'pullover', cat:'gym', group:'chest', muscle:'Chest / triceps', name:'Dumbbel Pullover', pattern:'press', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/dumbbell-pullover.mp4',
    cues:['Plate placed across the upper back','Body in one straight line','Lower chest close to the floor','Press back up without sagging hips']},

  // ===== GYM — Back =====
  {id:'lat-pulldown', cat:'gym', group:'back', muscle:'Lats', name:'Lat Pulldown', pattern:'row', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/lat-pulldown.mp4',
    cues:['Wide overhand grip on the bar','Pull down to the upper chest, elbows to your sides','Squeeze shoulder blades together at the bottom','Let the bar rise under control']},
  {id:'barbell-row', cat:'gym', group:'back', muscle:'Mid-back / lats', name:'Barbell Row', pattern:'row', type:'reps', sets:4, reps:8, rest:75,video:'exercise_video/barbell-row.mp4',
    cues:['Hinge forward, back flat, knees soft','Pull the bar to your lower ribs','Drive elbows back, squeeze shoulder blades','Lower with control, don\'t round the back']},
  {id:'deadlift', cat:'gym', group:'back', muscle:'Posterior chain', name:'Conventional Deadlift', pattern:'row', type:'reps', sets:4, reps:6, rest:120,video:'exercise_video/deadlift.mp4',
    cues:['Bar over mid-foot, shins close to it','Flat back, chest up before pulling','Push the floor away with your legs','Lock out hips and knees together']},
  {id:'pull-up', cat:'gym', group:'back', muscle:'Lats / biceps', name:'Pull-Up', pattern:'row', type:'reps', sets:4, reps:6, rest:90,video:'exercise_video/pull-up.mp4',
    cues:['Overhand grip, just outside shoulder width','Pull chin over the bar, elbows driving down','Avoid swinging or kicking','Lower fully under control']},

  // ===== GYM — Abs =====
  {id:'cable-crunch', cat:'gym', group:'abs', muscle:'Abs', name:'Cable Crunch', pattern:'core', type:'reps', sets:3, reps:15, rest:45,video:'exercise_video/cable-crunch.mp4',
    cues:['Kneel below the cable, rope behind your neck','Crunch down, bringing elbows toward your knees','Round the spine — this is a crunch, not a hinge','Rise back up under control']},
  {id:'hanging-leg-raise', cat:'gym', group:'abs', muscle:'Lower abs', name:'Hanging Leg Raise', pattern:'core', type:'reps', sets:3, reps:12, rest:60,video:'exercise_video/hanging-leg-raise.mp4',
    cues:['Hang from the bar with a firm grip','Raise legs to at least hip height','Avoid swinging — control the motion','Lower with control, don\'t let them drop']},
  {id:'russian-twist', cat:'gym', group:'abs', muscle:'Obliques', name:'Russian Twist', pattern:'core', type:'reps', sets:3, reps:20, rest:40,video:'exercise_video/russian-twist.mp4',
    cues:['Sit back slightly, feet hovering or grounded','Rotate the torso side to side','Move from the ribs, not just the arms','Keep the chest lifted throughout']},
  {id:'ab-wheel', cat:'gym', group:'abs', muscle:'Abs / core', name:'Abs Wheel Rollout', pattern:'core', type:'reps', sets:3, reps:10, rest:60,video:'exercise_video/abs-wheel-roll.mp4',
    cues:['Kneel, hands on the wheel in front','Roll forward while keeping the core braced','Go as far as you can control','Pull back in without letting the hips sag']},

  // ===== YOGA =====
  {id:'downward-dog', cat:'yoga', muscle:'Full body stretch', name:'Downward-Facing Dog', pattern:'yoga', type:'hold', sets:3, hold:40, rest:15,video:'exercise_video/downward-dog.mp4',
    cues:['Hands and feet on the mat, hips lifted high','Form an inverted V with your body','Press heels toward the floor, relax the neck','Breathe slowly and evenly']},
  {id:'warrior-2', cat:'yoga', muscle:'Legs / hips', name:'Warrior II', pattern:'yoga', type:'hold', sets:2, hold:30, rest:15,video:'exercise_video/warrior-2.mp4',
    cues:['Wide stance, front knee bent over the ankle','Arms extended parallel to the floor','Gaze over the front hand','Hold, then switch sides']},
  {id:'tree-pose', cat:'yoga', muscle:'Balance / core', name:'Tree Pose', pattern:'yoga', type:'hold', sets:2, hold:30, rest:15,video:'exercise_video/tree-pose.mp4',
    cues:['Weight on one foot, spine tall','Sole of the other foot on the inner thigh or calf','Hands at heart center or reaching overhead','Fix your gaze on one point for balance']},
  {id:'childs-pose', cat:'yoga', muscle:'Back / hips', name:"Child's Pose", pattern:'yoga', type:'hold', sets:1, hold:60, rest:0,video:'exercise_video/childs-pose.mp4',
    cues:['Kneel and sit hips back toward the heels','Fold forward, arms extended or by your sides','Rest the forehead on the mat','Breathe deeply, let the back release']},
  {id:'cobra-pose', cat:'yoga', muscle:'Spine / chest', name:'Cobra Pose', pattern:'yoga', type:'hold', sets:2, hold:25, rest:15,video:'exercise_video/cobra-pose.mp4',
    cues:['Lie face down, hands under the shoulders','Press up, lifting the chest gently','Keep the pelvis grounded on the mat','Shoulders relaxed, away from the ears']},
  {id:'cat-cow', cat:'yoga', muscle:'Spine', name:'Cat–Cow Flow', pattern:'yoga', type:'hold', sets:2, hold:30, rest:15,video:'exercise_video/cat-cow.mp4',
    cues:['On hands and knees, wrists under shoulders','Inhale, drop the belly, lift the gaze (cow)','Exhale, round the spine, tuck the chin (cat)','Move slowly with the breath']},
  {id:'triangle-pose', cat:'yoga', muscle:'Legs / side body', name:'Triangle Pose', pattern:'yoga', type:'hold', sets:2, hold:30, rest:15,video:'exercise_video/triangle-pose.mp4',
    cues:['Wide stance, front leg straight','Hinge at the hip, reach the front hand down','Other arm reaches straight up','Keep both legs strong and straight']},
  {id:'bridge-pose', cat:'yoga', muscle:'Glutes / spine', name:'Bridge Pose', pattern:'yoga', type:'hold', sets:2, hold:30, rest:15,video:'exercise_video/bridge-pose.mp4',
    cues:['Lie back, knees bent, feet flat','Press into your feet, lift the hips','Interlace hands beneath you if comfortable','Keep the neck relaxed, gaze up']},
  {id:'seated-forward-bend', cat:'yoga', muscle:'Hamstrings / back', name:'Seated Forward Bend', pattern:'yoga', type:'hold', sets:1, hold:45, rest:0,video:'exercise_video/seated-forward-bend.mp4',
    cues:['Sit with legs extended in front','Hinge forward from the hips, spine long','Reach for your feet or shins','Relax deeper into the stretch with each exhale']},
  {id:'savasana', cat:'yoga', muscle:'Full body relaxation', name:'Savasana (Final Rest)', pattern:'yoga', type:'hold', sets:1, hold:60, rest:0,video:'exercise_video/savasana.mp4',
    cues:['Lie flat on your back, arms at your sides','Let your feet fall open naturally','Close your eyes, soften the whole body','Breathe naturally — nowhere to be']},
];

/* ---------- Sound engine (Web Audio + spoken counting) ---------- */
let audioCtx;

function ctx(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if(audioCtx.state === 'suspended'){
    audioCtx.resume().catch(()=>{});
  }
  return audioCtx;
}

/* Wake up the audio engine + speech engine early (called on player open,
   which is already a user click) so the actual Start button has zero lag. */
function warmUpAudio(){
  try{
    ctx();
  }catch(e){ /* audio unavailable */ }

  try{
    if('speechSynthesis' in window){
      window.speechSynthesis.getVoices();
      const primer = new SpeechSynthesisUtterance(' ');
      primer.volume = 0;
      window.speechSynthesis.speak(primer);
    }
  }catch(e){ /* speech unavailable */ }
}

function beep(freq=880, duration=0.12, type='sine', gain=0.18){
  try{
    const ac = ctx();
    const osc = ac.createOscillator();
    const g = ac.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    osc.connect(g).connect(ac.destination);

    const now = ac.currentTime;

    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    osc.start(now);
    osc.stop(now + duration + 0.02);

  }catch(e){
    /* audio unavailable */
  }
}


/* ---------- Voice counting: 1, 2, 3, 4... ---------- */

function speakCount(number){

  try{

    if(!('speechSynthesis' in window)){
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
      String(number)
    );

    speech.rate = 1.20;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

  }catch(e){
    /* speech unavailable */
  }

}

/* Generic voice announcement (used for rest start/end callouts, etc.) */
function speakText(text){

  try{

    if(!('speechSynthesis' in window)){
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

  }catch(e){
    /* speech unavailable */
  }

}


const sfx = {

  /* Beep + voice count */
  rep: (number) => {

    beep(
      740,
      0.09,
      'sine',
      0.16
    );

    speakCount(number);

  },

  tick: () => {

    beep(
      520,
      0.05,
      'sine',
      0.08
    );

  },

  warn: () => {

    beep(
      300,
      0.14,
      'square',
      0.14
    );

  },

  go: () => {

    beep(
      1040,
      0.16,
      'sine',
      0.2
    );

  },

  done: () => {

    beep(
      660,
      0.12,
      'sine',
      0.2
    );

    setTimeout(() => {
      beep(
        880,
        0.12,
        'sine',
        0.2
      );
    }, 140);

    setTimeout(() => {
      beep(
        1100,
        0.18,
        'sine',
        0.22
      );
    }, 280);

  }

};

/* ---------- Render cards ---------- */
const homeGrid = document.getElementById('homeGrid');
const gymGrid = document.getElementById('gymGrid');
const yogaGrid = document.getElementById('yogaGrid');
const muscleChips = document.getElementById('muscleChips');

const GYM_GROUPS = [
  {id:'legs', label:'Legs'}, {id:'thighs', label:'Thighs'}, {id:'shoulders', label:'Shoulders'},
  {id:'neck', label:'Neck'}, {id:'biceps', label:'Biceps'}, {id:'triceps', label:'Triceps'},
  {id:'arms', label:'Arms'}, {id:'chest', label:'Chest'}, {id:'back', label:'Back'}, {id:'abs', label:'Abs'}
];

function metaLine(ex){
  const setPart = `${ex.sets} sets`;
  const workPart = ex.type === 'reps' ? `${ex.reps} reps` : `${ex.hold}s hold`;
  return `${setPart} · ${workPart}`;
}

function cardMedia(ex){
  if(ex.video){
    return `<video src="${ex.video}" autoplay muted loop playsinline></video>`;
  }
  return iconSVG(ex.pattern);
}

function renderCard(ex){
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'ex-card';
  card.setAttribute('data-id', ex.id);
  card.innerHTML = `
    <div class="ex-card-media">
      ${ex.video ? '<span class="ex-card-badge">Filmed demo</span>' : '<span class="ex-card-badge">Motion cue</span>'}
      ${cardMedia(ex)}
    </div>
    <div class="ex-card-body">
      <p class="ex-card-muscle">${ex.muscle}</p>
      <p class="ex-card-name">${ex.name}</p>
      <p class="ex-card-meta">${metaLine(ex)}</p>
    </div>
  `;
  card.addEventListener('click', () => openPlayer(ex.id));
  return card;
}

function renderHome(){
  homeGrid.innerHTML = '';
  EXERCISES.filter(e => e.cat === 'home').forEach(ex => homeGrid.appendChild(renderCard(ex)));
}

function renderYoga(){
  yogaGrid.innerHTML = '';
  EXERCISES.filter(e => e.cat === 'yoga').forEach(ex => yogaGrid.appendChild(renderCard(ex)));
}

let activeGroup = 'legs';
function renderChips(){
  muscleChips.innerHTML = '';
  GYM_GROUPS.forEach(g => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = g.label;
    chip.setAttribute('role','tab');
    chip.setAttribute('aria-selected', g.id === activeGroup ? 'true' : 'false');
    chip.addEventListener('click', () => {
      activeGroup = g.id;
      renderChips();
      renderGym();
    });
    muscleChips.appendChild(chip);
  });
}

function renderGym(){
  gymGrid.innerHTML = '';
  EXERCISES.filter(e => e.cat === 'gym' && e.group === activeGroup).forEach(ex => gymGrid.appendChild(renderCard(ex)));
}

function renderAll() {
  renderHome();
  renderChips();
  renderGym();
  renderYoga();
  document.getElementById('totalExerciseCount').textContent = EXERCISES.length;
}

// ✅ UPDATED: load the live exercise list from the server before first render
async function loadExercisesFromServer() {
  const fallback = EXERCISES;
  try {
    const res = await fetch('/api/exercises');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        EXERCISES = data.map(ex => {
          if (!ex.video) {
            const local = fallback.find(f => f.id === ex.id);
            if (local && local.video) return { ...ex, video: local.video };
          }
          return ex;
        });
      }
    }
  } catch (err) {
    console.warn('Could not load exercises from server, using fallback list.', err);
  } finally {
    renderAll();
  }
}

loadExercisesFromServer();

/* ---------- Player / workout engine ---------- */
const backdrop = document.getElementById('modalBackdrop');
const playerVideo = document.getElementById('playerVideo');
const playerIcon = document.getElementById('playerIcon');
const playerMuscle = document.getElementById('playerMuscle');
const playerTitle = document.getElementById('playerTitle');
const playerCues = document.getElementById('playerCues');
const playerConfig = document.getElementById('playerConfig');
const repsField = document.getElementById('repsField');
const repsFieldLabel = document.getElementById('repsFieldLabel');
const setsOut = document.getElementById('setsOut');
const repsOut = document.getElementById('repsOut');
const restOut = document.getElementById('restOut');
const playerRun = document.getElementById('playerRun');
const runPhase = document.getElementById('runPhase');
const runNumber = document.getElementById('runNumber');
const runUnit = document.getElementById('runUnit');
const runBarFill = document.getElementById('runBarFill');
const playerStart = document.getElementById('playerStart');
const playerStop = document.getElementById('playerStop');

let current = null;   // exercise being configured/run
let config = {sets:3, reps:12, hold:30, rest:30};
let timer = null;     // active interval id
let running = false;

function findExercise(id){ return EXERCISES.find(e => e.id === id); }

function openPlayer(id){
  current = findExercise(id);
  if(!current) return;

  warmUpAudio();

  config = { sets: current.sets, reps: current.reps || 12, hold: current.hold || 30, rest: current.rest };

  playerMuscle.textContent = current.muscle;
  playerTitle.textContent = current.name;
  playerCues.innerHTML = current.cues.map(c => `<li>${c}</li>`).join('');

  if(current.video){
    playerVideo.src = current.video;
    playerVideo.hidden = false;
    playerIcon.hidden = true;
    playerVideo.play().catch(()=>{});
  } else {
    playerVideo.hidden = true;
    playerIcon.hidden = false;
    playerIcon.innerHTML = ICONS[current.pattern] || ICONS.yoga;
  }

  repsFieldLabel.textContent = current.type === 'reps' ? 'Reps' : 'Hold (s)';
  syncConfigOutputs();
  playerConfig.hidden = false;
  playerRun.hidden = true;
  playerStart.hidden = false;
  playerStart.textContent = 'Start workout';
  playerStop.hidden = true;
  running = false;
  clearInterval(timer);

  backdrop.classList.add('open');
}

function closePlayer(){
  backdrop.classList.remove('open');
  clearInterval(timer);
  running = false;
  playerVideo.pause();
}

document.getElementById('playerClose').addEventListener('click', closePlayer);
backdrop.addEventListener('click', (e) => { if(e.target === backdrop) closePlayer(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closePlayer(); });

function syncConfigOutputs(){
  setsOut.textContent = config.sets;
  repsOut.textContent = current.type === 'reps' ? config.reps : config.hold;
  restOut.textContent = config.rest + 's';
}

playerConfig.querySelectorAll('.stepper button').forEach(btn => {
  btn.addEventListener('click', () => {
    const field = btn.getAttribute('data-step');
    const dir = parseInt(btn.getAttribute('data-dir'), 10);
    if(field === 'sets'){
      config.sets = Math.max(1, Math.min(8, config.sets + dir));
    } else if(field === 'reps'){
      if(current.type === 'reps'){
        config.reps = Math.max(4, Math.min(50, config.reps + dir * 1));
      } else {
        config.hold = Math.max(10, Math.min(120, config.hold + dir * 5));
      }
    } else if(field === 'rest'){
      config.rest = Math.max(0, Math.min(180, config.rest + dir * 5));
    }
    syncConfigOutputs();
  });
});

/* --- Workout run state machine --- */
function startWorkout(){
  running = true;
  playerConfig.hidden = true;
  playerRun.hidden = false;
  playerStart.hidden = true;
  playerStop.hidden = false;
  runLeadInBeeps(() => runWorkSet(1));
}

/* Plain 3-beep lead-in (no spoken numbers) — used before the workout
   starts and again right after rest ends, so the user has a moment
   to get ready before the exercise actually begins. */
function runLeadInBeeps(callback){
  clearInterval(timer);
  let count = 3;
  runPhase.textContent = 'Get ready';
  runUnit.textContent = '';
  runNumber.textContent = count;
  runBarFill.style.width = '100%';
  beep(880, 0.15, 'sine', 0.25);

  timer = setInterval(() => {
    count--;
    if(!running){
      clearInterval(timer);
      return;
    }
    if(count > 0){
      runNumber.textContent = count;
      runBarFill.style.width = `${(count/3)*100}%`;
      beep(880, 0.15, 'sine', 0.25);
    } else {
      clearInterval(timer);
      callback();
    }
  }, 1000);
}

function endWorkout(completed){
  running = false;
  clearInterval(timer);
  playerRun.hidden = true;
  playerConfig.hidden = false;
  playerStart.hidden = false;
  playerStop.hidden = true;
  playerStart.textContent = completed ? 'Run it again' : 'Resume workout';
  if(completed){
    runPhase.textContent = 'Workout complete';
    sfx.done();
  }
}

playerStart.addEventListener('click', startWorkout);
playerStop.addEventListener('click', () => endWorkout(false));

function runWorkSet(setNum){
  if(!running) return;
  clearInterval(timer);
  runPhase.textContent = `Set ${setNum} of ${config.sets}`;

  if(current.type === 'reps'){
    let rep = 0;
    const target = config.reps;
    const pace = 1250; // ms per rep — steady guided pace
    runUnit.textContent = 'reps';
    runNumber.textContent = '0';
    runBarFill.style.width = '0%';
    sfx.go();
    timer = setInterval(() => {
      rep++;
      runNumber.textContent = rep;
      runBarFill.style.width = `${(rep/target)*100}%`;
      sfx.rep(rep);
      if(rep >= target){
        clearInterval(timer);
        proceedAfterSet(setNum);
      }
    }, pace);
  } else {
    let remaining = config.hold;
    runUnit.textContent = 'sec left';
    runNumber.textContent = remaining;
    runBarFill.style.width = '100%';
    sfx.go();
    timer = setInterval(() => {
      remaining--;
      runNumber.textContent = Math.max(remaining,0);
      runBarFill.style.width = `${(remaining/config.hold)*100}%`;
      if(remaining > 0){
        sfx.rep(remaining); // beep + speak the remaining count, high to low: "30", "29", "28"...
        if(remaining <= 3) sfx.warn(); // extra urgency beep near the end
      }
      if(remaining <= 0){
        clearInterval(timer);
        proceedAfterSet(setNum);
      }
    }, 1000);
  }
}

function proceedAfterSet(setNum){
  if(!running) return;
  if(setNum >= config.sets){
    endWorkout(true);
    return;
  }
  if(config.rest > 0){
    runRest(setNum);
  } else {
    runWorkSet(setNum + 1);
  }
}

function runRest(setNum){
  clearInterval(timer);
  runPhase.textContent = 'Rest';
  runUnit.textContent = 'sec rest';
  let remaining = config.rest;
  runNumber.textContent = remaining;
  runBarFill.style.width = '100%';

  /* small delay so this doesn't cut off the last rep's spoken number */
  setTimeout(() => {
    speakText(`Your rest time start, ${config.rest} seconds`);
  }, 400);

  timer = setInterval(() => {
    remaining--;
    runNumber.textContent = Math.max(remaining,0);
    runBarFill.style.width = `${(remaining/config.rest)*100}%`;
    if(remaining <= 3 && remaining > 0) sfx.warn();
    if(remaining <= 0){
      clearInterval(timer);
      speakText('Rest time over');
      runLeadInBeeps(() => runWorkSet(setNum + 1));
    }
  }, 1000);
}