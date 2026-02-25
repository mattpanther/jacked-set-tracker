// Jacked Workout Program Data - All 3 Months
// Path tier templates for Month 1
const TIER_A = { // Primary exercises (positions 1-2)
  jackedUp:   { min:13, max:20, mult:2, rest:60 },
  jacked:     { min:8,  max:12, mult:3, rest:90 },
  jackedDown: { min:4,  max:7,  mult:4, rest:150 },
  pinkDB:     { min:21, max:99, mult:1.5, rest:45 },
  hiLoad:     { min:1,  max:3,  multMap:{1:30,2:20,3:15}, rest:60 },
};
const TIER_B = { // Secondary exercises (positions 3-4)
  jackedUp:   { min:13, max:20, mult:2, rest:60 },
  jacked:     { min:8,  max:12, mult:2, rest:90 },
  jackedDown: { min:4,  max:7,  mult:3, rest:150 },
  pinkDB:     { min:21, max:99, mult:1.5, rest:45 },
  hiLoad:     { min:1,  max:3,  multMap:{1:30,2:20,3:15}, rest:60 },
};

const WORKOUTS = {
  1: {
    name: "Month 1", type: "multiplier",
    schedule: [
      { id:"chest-a", name:"Chest A", exercises:[
        { name:"DB Bench Press", range:[8,12], tier:"A" },
        { name:"DB Incline Bench Press", range:[8,12], tier:"A" },
        { name:"DB Floor Flys", range:[8,12], tier:"B" },
        { name:"Pushups", range:[20,50], tier:"BW",
          paths:{ jackedUp:{min:51,max:75,mult:1,rest:60}, jacked:{min:20,max:50,mult:2,rest:60}, jackedDown:{min:10,max:19,mult:3,rest:150} } },
      ], correctives:[{ name:"Doorway Face Pulls", target:45 }] },

      { id:"back-a", name:"Back A", exercises:[
        { name:"DB Rows", range:[8,12], tier:"A" },
        { name:"Weighted Pullups", range:[8,12], tier:"A" },
        { name:"DB Tripod Rows", range:[8,12], tier:"B" },
        { name:"DB Urlachers", range:[8,12], tier:"B" },
      ], correctives:[{ name:"Bridge & Reach Overs", target:45 }] },

      { id:"triceps-a", name:"Triceps A", exercises:[
        { name:"Lying DB Tricep Ext.", range:[8,12], tier:"A" },
        { name:"DB JM Press", range:[8,12], tier:"A" },
        { name:"DB Kickbacks", range:[8,12], tier:"B" },
        { name:"Cobra Pushups", range:[15,35], tier:"BW",
          paths:{ jackedUp:{min:36,max:50,mult:1,rest:60}, jacked:{min:15,max:35,mult:2,rest:90}, jackedDown:{min:7,max:14,mult:3,rest:150} } },
      ], correctives:[{ name:"Hanging Scap Pulls", target:45 }] },

      { id:"legs-a", name:"Legs A", exercises:[
        { name:"DB Bulgarian Split Squats", range:[8,12], tier:"A", perSide:true },
        { name:"DB Hip Thrusts", range:[8,12], tier:"A" },
        { name:"DB Step Ups", range:[8,12], tier:"B", perSide:true },
        { name:"DB Alt. Reverse Sprinter Lunges", range:[8,12], tier:"B", perSide:true },
      ], correctives:[{ name:"Bottomed Out Squat Reaches", target:45 }] },

      { id:"shoulders-a", name:"Shoulders A", exercises:[
        { name:"DB OHP", range:[8,12], tier:"A" },
        { name:"DB Side Lateral Raises", range:[8,12], tier:"A" },
        { name:"Alt. DB Front Raises", range:[8,12], tier:"B", perSide:true },
        { name:"DB Abduction Rows", range:[8,12], tier:"B", perSide:true },
      ], correctives:[{ name:"ER Wall Slides", target:45 }] },

      { id:"biceps-a", name:"Biceps A", exercises:[
        { name:"DB Straight Bar Curls", range:[8,12], tier:"A" },
        { name:"Weighted Chins", range:[8,12], tier:"A" },
        { name:"DB Hammer Curls", range:[8,12], tier:"B" },
        { name:"DB 'No Money' Curls", range:[8,12], tier:"B" },
      ], correctives:[{ name:"Angels and Devils", target:45 }] },

      { id:"rest-1", name:"Rest Day", isRest:true, exercises:[], correctives:[] },

      { id:"chest-b", name:"Chest B", exercises:[
        { name:"Weighted Dips", range:[8,12], tier:"A" },
        { name:"DB Underhand Bench Press", range:[8,12], tier:"A" },
        { name:"DB Floor Press", range:[8,12], tier:"B" },
        { name:"Alt. DB UCV Raises", range:[8,12], tier:"B", perSide:true },
      ], correctives:[{ name:"Prone 'W' Raise", target:45 }] },

      { id:"back-b", name:"Back B", exercises:[
        { name:"DB Chest Supported Rows", range:[8,12], tier:"A" },
        { name:"DB Alt. Gorilla Rows", range:[8,12], tier:"A", perSide:true },
        { name:"Double DB Pullovers", range:[8,12], tier:"B" },
        { name:"DB High Pulls", range:[8,12], tier:"B" },
      ], correctives:[{ name:"T-Spine Rotations", target:45 }] },

      { id:"triceps-b", name:"Triceps B", exercises:[
        { name:"Elbows Tucked DB Bench", range:[8,12], tier:"A" },
        { name:"DB Skull Crushers", range:[8,12], tier:"A" },
        { name:"DB Overhead Extensions", range:[8,12], tier:"B" },
        { name:"Bench Dips", range:[20,50], tier:"BW",
          paths:{ jackedUp:{min:51,max:75,mult:2,rest:60}, jacked:{min:20,max:50,mult:2,rest:90}, jackedDown:{min:10,max:19,mult:3,rest:150} } },
      ], correctives:[{ name:"Inchworms", target:45 }] },

      { id:"legs-b", name:"Legs B", exercises:[
        { name:"Alt. Reverse DB Lunges", range:[8,12], tier:"A", perSide:true },
        { name:"DB RDL's", range:[8,12], tier:"A" },
        { name:"DB Goblet Squats", range:[8,12], tier:"B" },
        { name:"Double DB Frog Press", range:[8,12], tier:"B" },
      ], correctives:[{ name:"Jane Fondas", target:45 }] },

      { id:"shoulders-b", name:"Shoulders B", exercises:[
        { name:"DB Cheat Laterals", range:[8,12], tier:"A", perSide:true },
        { name:"Modified DB Bradford Press", range:[8,12], tier:"A" },
        { name:"Single DB Press Outs", range:[8,12], tier:"B", perSide:true },
        { name:"DB Rear Delt Rows", range:[8,12], tier:"B" },
      ], correctives:[{ name:"Lunge and Reach", target:45 }] },

      { id:"biceps-b", name:"Biceps B", exercises:[
        { name:"Alt. DB Curls", range:[8,12], tier:"A", perSide:true },
        { name:"DB Drag Curls", range:[8,12], tier:"A" },
        { name:"DB Cross Body Hammer Curls", range:[8,12], tier:"B", perSide:true },
        { name:"DB Spider Curls", range:[8,12], tier:"B" },
      ], correctives:[{ name:"Superman Press Outs", target:45 }] },

      { id:"rest-2", name:"Rest Day", isRest:true, exercises:[], correctives:[] },
    ]
  },

  2: {
    name: "Month 2", type: "fixed", backToJacked: true,
    dropSetRule: "everyOther", // Jacked to Max: drop set every other set
    schedule: [
      { id:"pull-a", name:"Pull A", exercises:[
        { name:"DB Rows", range:[4,6], base:25, drop:"DB T-Bar Rows" },
        { name:"DB Straight Bar Curls", range:[4,6], base:25, drop:"DB Waiter Curls" },
        { name:"DB High Pulls", range:[10,12], base:35, drop:"DB Assisted High Pulls" },
        { name:"Double DB Pullovers", range:[10,12], base:35, drop:"DB Pullovers" },
        { name:"DB 'No Money' Curls", range:[20,25], base:45, drop:"DB Shovel Curls" },
      ], correctives:[{ name:"Hanging Scap Pulls", target:30 },{ name:"Angels and Devils", target:30 }] },

      { id:"push-a", name:"Push A", exercises:[
        { name:"DB Bench Press", range:[4,6], base:25, drop:"Crush Grip DB Bench Press" },
        { name:"Lying DB Tricep Ext.", range:[4,6], base:25, drop:"Floor DB Tricep Ext." },
        { name:"Modified Bradford Press", range:[10,12], base:35, drop:"DB Over and Backs" },
        { name:"Floor Flys", range:[10,12], base:35, drop:"DB Floor Squeeze Press" },
        { name:"Alt. DB UCV Raises", range:[20,25], base:45, perSide:true, drop:"Cavaliere Crossovers" },
      ], correctives:[{ name:"Doorway Face Pulls", target:30 },{ name:"Bridge & Reach Overs", target:30 }] },

      { id:"legs-a2", name:"Legs A", exercises:[
        { name:"DB Bulgarian Split Squats", range:[6,8], base:30, perSide:true, drop:"DB Goblet Bulgarian Split Squats" },
        { name:"DB Leaning Step Ups", range:[6,8], base:30, perSide:true, drop:"DB Hip Thrusts" },
        { name:"DB Static Creeping Lunges", range:[10,12], base:35, perSide:true, drop:"DB Goblet Static Creeping Lunges" },
        { name:"DB Bench Front Squats", range:[10,12], base:35, drop:"DB Goblet Bench Front Squats" },
        { name:"DB Swings", range:[20,25], base:45, drop:"DB Sumo Drop Squats" },
      ], correctives:[{ name:"Bottomed Out Squat Reaches", target:30 },{ name:"Jane Fondas", target:30 }] },

      { id:"rest-m2-1", name:"Rest Day", isRest:true, exercises:[], correctives:[] },

      { id:"pull-b", name:"Pull B", exercises:[
        { name:"Weighted Pullups", range:[4,6], base:25, drop:"Jumping Pullups" },
        { name:"DB Alt. Gorilla Rows", range:[4,6], base:25, perSide:true, drop:"Incline Angled Rows" },
        { name:"DB Hammer Curls", range:[10,12], base:35, drop:"Incline Crush Grip Hammer Curls" },
        { name:"DB Spider Curls", range:[10,12], base:35, drop:"Single DB Preacher Curls" },
        { name:"DB Chest Supported Rows", range:[20,25], base:45, drop:"DB Incline Crush Grip Rows" },
      ], correctives:[{ name:"T-Spine Rotations", target:30 },{ name:"Superman Press Outs", target:30 }] },

      { id:"push-b", name:"Push B", exercises:[
        { name:"DB Incline Bench Press", range:[4,6], base:25, drop:"Crush Grip DB Incline Bench" },
        { name:"Alt. DB Front Raises", range:[4,6], base:25, perSide:true, drop:"DB Crush Grip Front Raises" },
        { name:"DB Side Lateral Raises", range:[10,12], base:35, drop:"DB Abduction Rows" },
        { name:"DB Overhead Extensions", range:[10,12], base:35, drop:"Single DB Extensions" },
        { name:"DB Kickbacks", range:[20,25], base:45, drop:"DB Swinging Kickbacks" },
      ], correctives:[{ name:"Prone 'W' Raises", target:30 },{ name:"Inchworms", target:30 }] },

      { id:"legs-b2", name:"Legs B", exercises:[
        { name:"DB RDL's", range:[6,8], base:30, drop:"Single DB RDL's" },
        { name:"DB Rocket Squats", range:[6,8], base:30, drop:"DB Squats (DB's to Floor)" },
        { name:"Double DB Frog Press", range:[10,12], base:35, drop:"DB Frog Press" },
        { name:"DB Alt. Reverse Sprinter Lunges", range:[10,12], base:35, perSide:true, drop:"Single Arm DB Reverse Sprinter Lunges" },
        { name:"DB Plyo Step Ups", range:[20,25], base:45, perSide:true, drop:"DB Goblet Step Ups" },
      ], correctives:[{ name:"Leg Swings", target:30 },{ name:"Hip Drops", target:30 }] },

      { id:"rest-m2-2", name:"Rest Day", isRest:true, exercises:[], correctives:[] },

      { id:"pull-c", name:"Pull C", exercises:[
        { name:"DB Haney Shrugs", range:[4,6], base:25, drop:"DB Shrugs" },
        { name:"Weighted Chins", range:[4,6], base:25, drop:"Jumping Chins" },
        { name:"DB Drag Curls", range:[10,12], base:35, drop:"DB Waiter Drag Curls" },
        { name:"DB Tripod Rows", range:[10,12], base:35, perSide:true, drop:"DB T-Bar Rows" },
        { name:"DB Urlachers", range:[20,25], base:45, drop:"DB High Pulls" },
      ], correctives:[{ name:"Hanging Scap Pulls", target:30 },{ name:"Superman Press Outs", target:30 }] },

      { id:"push-c", name:"Push C", exercises:[
        { name:"DB OHP", range:[4,6], base:25, drop:"DB Over and Backs" },
        { name:"Weighted Dips", range:[4,6], base:25, drop:"Decline DB Bench Press" },
        { name:"DB JM Press", range:[10,12], base:35, drop:"DB PJR Pullovers" },
        { name:"DB Underhand Bench Press", range:[10,12], base:35, drop:"DB Upper Chest Pullovers" },
        { name:"DB Press Outs", range:[20,25], base:45, drop:"Single DB Press Outs" },
      ], correctives:[{ name:"Doorway Face Pulls", target:30 },{ name:"Lunge and Reach", target:30 }] },

      { id:"legs-c2", name:"Legs C", exercises:[
        { name:"Alt. Reverse DB Lunges", range:[6,8], base:30, perSide:true, drop:"Single DB Split Squats" },
        { name:"DB Hip Thrusts", range:[6,8], base:30, drop:"Single DB Hip Thrusts" },
        { name:"DB Single Leg RDL Calf Raises", range:[10,12], base:35, perSide:true, drop:"DB RDL Calf Raises" },
        { name:"DB Cossack Squats", range:[10,12], base:35, perSide:true, drop:"DB Sumo Squats" },
        { name:"DB Goblet Squats", range:[20,25], base:45, drop:"DB Drop Squats" },
      ], correctives:[{ name:"Bottomed Out Squat Reaches", target:30 },{ name:"Leg Swings", target:30 }] },

      { id:"rest-m2-3", name:"Rest Day", isRest:true, exercises:[], correctives:[] },
    ]
  },

  3: {
    name: "Month 3", type: "fixed", backToJacked: true,
    dropSetRule: "sets135", // Jacked to Max: double drop set on sets 1,3,5
    // Workout templates (referenced by schedule)
    _workouts: {
      "tb-a": { name:"Total Body A", exercises:[
        { name:"DB Rows", range:[6,10], base:35, jttmSets:5, drops:["DB T-Bar Rows","Inverted Rows"] },
        { name:"DB OHP", range:[6,10], base:35, jttmSets:5, drops:["DB Over and Backs","Pike Pushups"] },
        { name:"DB Drag Curls", range:[8,12], base:35, jttmSets:3, drops:["Waiter Drag Curls","Negative Chin Hang"] },
        { name:"DB Kickbacks", range:[8,12], base:35, jttmSets:3, drops:["DB Swinging Kickbacks","Bench Dips"] },
        { name:"DB Static Creeping Lunges", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["DB Goblet Static Creeping Lunges","Triple Split Squat Lateral Jumps"] },
        { name:"DB Hip Thrusts", range:[8,12], base:35, jttmSets:3, drops:["Single DB Hip Thrusts","Long Leg Marches"] },
      ], correctives:[] },
      "corr-a": { name:"Corrective A", exercises:[], correctives:[
        { name:"Doorway Face Pulls", target:30 },
        { name:"Hanging Scap Pulls", target:30 },
        { name:"Bottomed Out Squat Reaches", target:30 },
      ] },
      "tb-b": { name:"Total Body B", exercises:[
        { name:"DB Alt. Gorilla Rows", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["Incline Angled Rows","Chinups"] },
        { name:"DB Floor Fly", range:[6,10], base:35, jttmSets:5, drops:["DB Floor Squeeze Press","Pushups"] },
        { name:"DB Cross Body Hammer Curls", range:[8,12], base:35, jttmSets:3, perSide:true, drops:["DB Shovel Curls","Flexed Arm Hang"] },
        { name:"Lying DB Tricep Ext.", range:[8,12], base:35, jttmSets:3, drops:["DB JM Press","Cobra Pushups"] },
        { name:"DB Alt. Step Ups", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["DB Alt. Goblet Step Ups","Alt. Step Up Thrusts"] },
        { name:"DB RDL's", range:[8,12], base:35, jttmSets:3, drops:["Single DB RDL's","Slick Floor Bridge Hamstring Curls"] },
      ], correctives:[] },
      "corr-b": { name:"Corrective B", exercises:[], correctives:[
        { name:"Prone 'W' Raises", target:30 },
        { name:"T-Spine Rotations", target:30 },
        { name:"Jane Fondas", target:30 },
      ] },
      "tb-c": { name:"Total Body C", exercises:[
        { name:"Double DB Pullovers", range:[6,10], base:35, jttmSets:5, drops:["DB Pullovers","Pullups"] },
        { name:"DB Cheat Laterals", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["DB Abduction Rows","BW Side Lateral Raises"] },
        { name:"DB Straight Bar Curls", range:[8,12], base:35, jttmSets:3, drops:["DB Waiter Curls","Inverted Chin Curls"] },
        { name:"DB JM Press", range:[8,12], base:35, jttmSets:3, drops:["DB PJR Pullover","Diamond Cutter Pushups"] },
        { name:"Alt. Reverse DB Lunges", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["Alt. Reverse DB Lunges (DB's to Knees)","Split Squat Tuck Jumps"] },
        { name:"DB Leaning Step Ups", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["DB Hip Thrusts","Leaning Speed Step Ups"] },
      ], correctives:[] },
      "corr-c": { name:"Corrective C", exercises:[], correctives:[
        { name:"Bridge & Reach Overs", target:20 },
        { name:"ER Wall Slides", target:20 },
        { name:"Angels and Devils", target:20 },
        { name:"Leg Swings", target:20 },
      ] },
      "tb-d": { name:"Total Body D", exercises:[
        { name:"DB Haney Shrugs", range:[6,10], base:35, jttmSets:5, drops:["DB Shrugs","Trap Pullups"] },
        { name:"Incline DB Bench Press", range:[6,10], base:35, jttmSets:5, drops:["Crush Grip DB Incline Bench","Dips"] },
        { name:"DB Hammer Curls", range:[8,12], base:35, jttmSets:3, drops:["Incline Crush Grip Hammer Curls","Super Close Grip Pullups"] },
        { name:"DB Overhead Extensions", range:[8,12], base:35, jttmSets:3, drops:["DB Incline Power Bombs","BW Tricep Extensions"] },
        { name:"DB Bulgarian Split Squats", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["DB Goblet Bulgarian Split Squats","Bulgarian Split Squat Hops"] },
        { name:"DB Alt. Reverse Sprinter Lunges", range:[6,10], base:35, jttmSets:5, perSide:true, drops:["DB Goblet Alt. Reverse Sprinter Lunges","Sprinter Plyo Lunges"] },
      ], correctives:[] },
      "corr-d": { name:"Corrective D", exercises:[], correctives:[
        { name:"Inchworms", target:20 },
        { name:"Lunge and Reach", target:20 },
        { name:"Superman Press Outs", target:20 },
        { name:"Hip Drops", target:20 },
      ] },
      "challenge": { name:"10×400 Challenge", isChallenge:true, exercises:[
        { name:"DB Thrusters", range:[14,16], base:100, challengeSets:10, challengeReps:10 },
        { name:"DB Renegade Rows", range:[7,8], base:50, challengeSets:10, challengeReps:5, perSide:true },
        { name:"DB Floor Press", range:[14,16], base:100, challengeSets:10, challengeReps:10 },
        { name:"DB Power High Pull", range:[14,16], base:100, challengeSets:10, challengeReps:10 },
      ], correctives:[] },
    },
    // Day-by-day schedule matching the Athleanx app (Days 57-84)
    schedule: [] // built dynamically below
  }
};

// Build Month 3 schedule from templates (Days 57-84)
(function() {
  const REST = { name:"Rest Day", isRest:true, exercises:[], correctives:[] };
  const w = WORKOUTS[3]._workouts;
  const seq = [
    // Week 9
    "tb-a","corr-a","tb-b","corr-b","tb-a","REST","REST",
    // Week 10
    "tb-b","corr-b","tb-a","corr-a","tb-b","REST","REST",
    // Week 11
    "tb-c","corr-c","tb-d","corr-d","tb-c","REST","REST",
    // Week 12
    "tb-d","corr-d","tb-c","corr-c","tb-d","REST","challenge",
  ];
  WORKOUTS[3].schedule = seq.map((id, i) => {
    if (id === "REST") return { ...REST, id:`rest-m3-${i}` };
    const tmpl = w[id];
    return { id:`${id}-d${i}`, name:tmpl.name, exercises:[...tmpl.exercises], correctives:[...tmpl.correctives], isChallenge:tmpl.isChallenge };
  });
})();
