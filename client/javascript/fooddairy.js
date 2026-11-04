// Food Diary Data and Functions
let foods = [
  // name, category, type, group, kcal, protein, carbs, fat, fiber, sugar, image, emoji(fallback)
  {name:"Brown Rice, cooked",type:"Vegetarian",group:"Grain",kcal:123,protein:2.7,carbs:25.6,fat:1.0,fiber:1.6,sugar:0.2,image:"./foodphoto/brownrice.png",emoji:"🍚"},
  {name:"White Rice, cooked",type:"Vegetarian",group:"Grain",kcal:130,protein:2.7,carbs:28.2,fat:0.3,fiber:0.4,sugar:0.1,image:"./foodphoto/whiterice.png",emoji:"🍚"},
  {name:"Oats, dry",type:"Vegetarian",group:"Grain",kcal:389,protein:16.9,carbs:66.3,fat:6.9,fiber:10.6,sugar:0.9,image:"./foodphoto/oats.png",emoji:"🥣"},
  {name:"Whole Wheat Flour",type:"Vegetarian",group:"Grain",kcal:340,protein:13.7,carbs:72.6,fat:2.5,fiber:12.2,sugar:0.4,image:"./foodphoto/wholewheatflour.png",emoji:"🌾"},
  {name:"Whole Wheat Roti",type:"Vegetarian",group:"Grain",kcal:297,protein:9.6,carbs:50.0,fat:7.0,fiber:6.0,sugar:2.0,image:"./foodphoto/Wheatflourroti.png",emoji:"🫓"},
  {name:"Quinoa, cooked",type:"Vegetarian",group:"Grain",kcal:120,protein:4.4,carbs:21.3,fat:1.9,fiber:2.8,sugar:0.9,image:"./foodphoto/Quinoacooked.png",emoji:"🥣"},
  {name:"Corn, boiled",type:"Vegetarian",group:"Grain",kcal:96,protein:3.4,carbs:21.0,fat:1.5,fiber:2.4,sugar:4.5,image:"./foodphoto/cornboiled.png",emoji:"🌽"},
  {name:"Sweet Potato, cooked",type:"Vegetarian",group:"Vegetable",kcal:76,protein:1.4,carbs:17.7,fat:0.1,fiber:2.5,sugar:5.4,image:"./foodphoto/sweatpotato.png",emoji:"🍠"},
  {name:"Potato, boiled",type:"Vegetarian",group:"Vegetable",kcal:87,protein:1.9,carbs:20.1,fat:0.1,fiber:1.8,sugar:0.9,image:"./foodphoto/potato.png",emoji:"🥔"},
  {name:"Spinach, raw",type:"Vegetarian",group:"Vegetable",kcal:23,protein:2.9,carbs:3.6,fat:0.4,fiber:2.2,sugar:0.4,image:"./foodphoto/spinach.png",emoji:"🥬"},
  {name:"Broccoli, raw",type:"Vegetarian",group:"Vegetable",kcal:34,protein:2.8,carbs:6.6,fat:0.4,fiber:2.6,sugar:1.7,image:"./foodphoto/broccoli.png",emoji:"🥦"},
  {name:"Carrot, raw",type:"Vegetarian",group:"Vegetable",kcal:41,protein:0.9,carbs:9.6,fat:0.2,fiber:2.8,sugar:4.7,image:"./foodphoto/carrot.png",emoji:"🥕"},
  {name:"Tomato, raw",type:"Vegetarian",group:"Vegetable",kcal:18,protein:0.9,carbs:3.9,fat:0.2,fiber:1.2,sugar:2.6,image:"./foodphoto/tomato.png",emoji:"🍅"},
  {name:"Cucumber, raw",type:"Vegetarian",group:"Vegetable",kcal:15,protein:0.7,carbs:3.6,fat:0.1,fiber:0.5,sugar:1.7,image:"./foodphoto/cucumber.png",emoji:"🥒"},
  {name:"Cauliflower, raw",type:"Vegetarian",group:"Vegetable",kcal:25,protein:1.9,carbs:5.0,fat:0.3,fiber:2.0,sugar:1.9,image:"./foodphoto/cauliflower.png",emoji:"🥦"},
  {name:"Green Peas, cooked",type:"Vegetarian",group:"Vegetable",kcal:84,protein:5.4,carbs:15.6,fat:0.2,fiber:5.5,sugar:5.9,image:"./foodphoto/green-peas.png",emoji:"🫛"},
  {name:"Bell Pepper, raw",type:"Vegetarian",group:"Vegetable",kcal:31,protein:1.0,carbs:6.0,fat:0.3,fiber:2.1,sugar:4.2,image:"./foodphoto/bell-pepper.png",emoji:"🫑"},
  {name:"Beetroot, raw",type:"Vegetarian",group:"Vegetable",kcal:43,protein:1.6,carbs:9.6,fat:0.2,fiber:2.8,sugar:6.8,image:"./foodphoto/beetroot.png",emoji:"🫜"},
  {name:"Lentils, cooked",type:"Vegetarian",group:"Pulse",kcal:116,protein:9.0,carbs:20.1,fat:0.4,fiber:7.9,sugar:1.8,image:"./foodphoto/lentils.png",emoji:"🫘"},
  {name:"Chickpeas, cooked",type:"Vegetarian",group:"Pulse",kcal:164,protein:8.9,carbs:27.4,fat:2.6,fiber:7.6,sugar:4.8,image:"./foodphoto/chickpeas.png",emoji:"🫘"},
  {name:"Kidney Beans, cooked",type:"Vegetarian",group:"Pulse",kcal:127,protein:8.7,carbs:22.8,fat:0.5,fiber:6.4,sugar:0.3,image:"./foodphoto/kidney-beans.png",emoji:"🫘"},
  {name:"Black Beans, cooked",type:"Vegetarian",group:"Pulse",kcal:132,protein:8.9,carbs:23.7,fat:0.5,fiber:8.7,sugar:0.3,image:"./foodphoto/black-beans.png",emoji:"🫘"},
  {name:"Green Gram (Moong), cooked",type:"Vegetarian",group:"Pulse",kcal:105,protein:7.0,carbs:19.2,fat:0.4,fiber:7.6,sugar:2.0,image:"./foodphoto/greengram-moong.png",emoji:"🫘"},
  {name:"Soybeans, cooked",type:"Vegetarian",group:"Pulse",kcal:173,protein:16.6,carbs:9.9,fat:9.0,fiber:6.0,sugar:3.0,image:"./foodphoto/soybeans.png",emoji:"🫘"},
  {name:"Paneer",type:"Vegetarian",group:"Dairy",kcal:265,protein:18.3,carbs:6.1,fat:20.8,fiber:0,sugar:2.6,image:"./foodphoto/paneer.png",emoji:"🧀"},
  {name:"Milk, whole",type:"Vegetarian",group:"Dairy",kcal:61,protein:3.2,carbs:4.8,fat:3.3,fiber:0,sugar:5.1,image:"./foodphoto/milk.png",emoji:"🥛"},
  {name:"Curd / Yogurt, plain",type:"Vegetarian",group:"Dairy",kcal:61,protein:3.5,carbs:4.7,fat:3.3,fiber:0,sugar:4.7,image:"./foodphoto/curd.png",emoji:"🥛"},
  {name:"Tofu",type:"Vegetarian",group:"Dairy",kcal:76,protein:8.1,carbs:1.9,fat:4.8,fiber:0.3,sugar:0.6,image:"./foodphoto/tofu.png",emoji:"⬜"},
  {name:"Almonds",type:"Vegetarian",group:"Nut/Seed",kcal:579,protein:21.2,carbs:21.6,fat:49.9,fiber:12.5,sugar:4.4,image:"./foodphoto/almond.png",emoji:"🌰"},
  {name:"Walnuts",type:"Vegetarian",group:"Nut/Seed",kcal:654,protein:15.2,carbs:13.7,fat:65.2,fiber:6.7,sugar:2.6,image:"./foodphoto/walnuts.png",emoji:"🌰"},
  {name:"Peanuts",type:"Vegetarian",group:"Nut/Seed",kcal:567,protein:25.8,carbs:16.1,fat:49.2,fiber:8.5,sugar:4.7,image:"./foodphoto/peanuts.png",emoji:"🥜"},
  {name:"Chia Seeds",type:"Vegetarian",group:"Nut/Seed",kcal:486,protein:16.5,carbs:42.1,fat:30.7,fiber:34.4,sugar:0,image:"./foodphoto/chia-seeds.png",emoji:"🌱"},
  {name:"Flax Seeds",type:"Vegetarian",group:"Nut/Seed",kcal:534,protein:18.3,carbs:28.9,fat:42.2,fiber:27.3,sugar:1.6,image:"./foodphoto/flax-seeds.png",emoji:"🌱"},
  {name:"Apple",type:"Vegetarian",group:"Fruit",kcal:52,protein:0.3,carbs:13.8,fat:0.2,fiber:2.4,sugar:10.4,image:"./foodphoto/apple.png",emoji:"🍎"},
  {name:"Banana",type:"Vegetarian",group:"Fruit",kcal:89,protein:1.1,carbs:22.8,fat:0.3,fiber:2.6,sugar:12.2,image:"./foodphoto/banana.png",emoji:"🍌"},
  {name:"Orange",type:"Vegetarian",group:"Fruit",kcal:47,protein:0.9,carbs:11.8,fat:0.1,fiber:2.4,sugar:9.4,image:"./foodphoto/orange.png",emoji:"🍊"},
  {name:"Mango",type:"Vegetarian",group:"Fruit",kcal:60,protein:0.8,carbs:15.0,fat:0.4,fiber:1.6,sugar:13.7,image:"./foodphoto/mango.png",emoji:"🥭"},
  {name:"Papaya",type:"Vegetarian",group:"Fruit",kcal:43,protein:0.5,carbs:10.8,fat:0.3,fiber:1.7,sugar:7.8,image:"./foodphoto/papaya.png",emoji:"🍈"},
  {name:"Watermelon",type:"Vegetarian",group:"Fruit",kcal:30,protein:0.6,carbs:7.6,fat:0.2,fiber:0.4,sugar:6.2,image:"./foodphoto/watermelon.png",emoji:"🍉"},
  {name:"Guava",type:"Vegetarian",group:"Fruit",kcal:68,protein:2.6,carbs:14.3,fat:1.0,fiber:5.4,sugar:8.9,image:"./foodphoto/guava.png",emoji:"🍐"},
  {name:"Pomegranate",type:"Vegetarian",group:"Fruit",kcal:83,protein:1.7,carbs:18.7,fat:1.2,fiber:4.0,sugar:13.7,image:"./foodphoto/pomegranate.png",emoji:"🍎"},
  {name:"Papaya",type:"Vegetarian",group:"Fruit",kcal:43,protein:0.5,carbs:10.8,fat:0.3,fiber:1.7,sugar:7.8,image:"./foodphoto/papaya.png",emoji:"🍈"},
  {name:"Strawberries",type:"Vegetarian",group:"Fruit",kcal:32,protein:0.7,carbs:7.7,fat:0.3,fiber:2.0,sugar:4.9,image:"./foodphoto/strawberries.png",emoji:"🍓"},
  {name:"Egg, whole",type:"Non-Vegetarian",group:"Protein",kcal:143,protein:12.6,carbs:0.7,fat:9.5,fiber:0,sugar:0.4,image:"./foodphoto/egg.png",emoji:"🥚"},
  {name:"Chicken Breast, cooked",type:"Non-Vegetarian",group:"Protein",kcal:165,protein:31.0,carbs:0,fat:3.6,fiber:0,sugar:0,image:"./foodphoto/chicken-breast.png",emoji:"🍗"},
  {name:"Chicken Thigh, cooked",type:"Non-Vegetarian",group:"Protein",kcal:209,protein:26.0,carbs:0,fat:10.9,fiber:0,sugar:0,image:"./foodphoto/chicken-thigh.png",emoji:"🍗"},
  {name:"Salmon, cooked",type:"Non-Vegetarian",group:"Protein",kcal:206,protein:22.1,carbs:0,fat:12.4,fiber:0,sugar:0,image:"./foodphoto/salmon.png",emoji:"🐟"},
  {name:"Tuna, canned in water",type:"Non-Vegetarian",group:"Protein",kcal:116,protein:25.5,carbs:0,fat:0.8,fiber:0,sugar:0,image:"./foodphoto/tuna.png",emoji:"🐟"},
  {name:"Sardines, canned",type:"Non-Vegetarian",group:"Protein",kcal:208,protein:24.6,carbs:0,fat:11.5,fiber:0,sugar:0,image:"./foodphoto/sardines.png",emoji:"🐟"},
  {name:"Prawns / Shrimp, cooked",type:"Non-Vegetarian",group:"Protein",kcal:99,protein:24.0,carbs:0.2,fat:0.3,fiber:0,sugar:0,image:"./foodphoto/prawns-shrimp.png",emoji:"🦐"},
  {name:"Turkey Breast, cooked",type:"Non-Vegetarian",group:"Protein",kcal:135,protein:29.0,carbs:0,fat:1.6,fiber:0,sugar:0,image:"./foodphoto/turkey-breast.png",emoji:"🍗"},
  {name:"Lean Beef, cooked",type:"Non-Vegetarian",group:"Protein",kcal:217,protein:26.1,carbs:0,fat:11.8,fiber:0,sugar:0,image:"./foodphoto/lean-beef.png",emoji:"🥩"},
  {name:"Lean Mutton, cooked",type:"Non-Vegetarian",group:"Protein",kcal:258,protein:25.0,carbs:0,fat:16.5,fiber:0,sugar:0,image:"./foodphoto/lean-mutton.png",emoji:"🥩"},
  {name:"Crab, cooked",type:"Non-Vegetarian",group:"Protein",kcal:97,protein:20.0,carbs:0,fat:1.5,fiber:0,sugar:0,image:"./foodphoto/crab.png",emoji:"🦀"},
  {name:"Tilapia, cooked",type:"Non-Vegetarian",group:"Protein",kcal:128,protein:26.2,carbs:0,fat:2.7,fiber:0,sugar:0,image:"./foodphoto/tilapia.png",emoji:"🐟"},
  {name:"Greek Yogurt, plain",type:"Vegetarian",group:"Dairy",kcal:73,protein:9.9,carbs:3.9,fat:2.0,fiber:0,sugar:3.6,image:"./foodphoto/greek-yogurt.png",emoji:"🥛"},
  {name:"Avocado",type:"Vegetarian",group:"Fruit",kcal:160,protein:2.0,carbs:8.5,fat:14.7,fiber:6.7,sugar:0.7,image:"./foodphoto/avocado.png",emoji:"🥑"},
  {name:"Olive Oil",type:"Vegetarian",group:"Other",kcal:884,protein:0,carbs:0,fat:100,fiber:0,sugar:0,image:"./photo/olive-oil.png",emoji:"🫒"},
  {name:"Coconut",type:"Vegetarian",group:"Nut/Seed",kcal:354,protein:3.3,carbs:15.2,fat:33.5,fiber:9.0,sugar:6.2,image:"./foodphoto/coconut.png",emoji:"🥥"},
  {name:"Dark Chocolate 70-85%",type:"Vegetarian",group:"Other",kcal:598,protein:7.8,carbs:45.9,fat:42.6,fiber:10.9,sugar:24.2,image:"./photo/dark-chocolate.png",emoji:"🍫"},
  {name:"Raisins",type:"Vegetarian",group:"Fruit",kcal:299,protein:3.1,carbs:79.2,fat:0.5,fiber:3.7,sugar:59.2,image:"./foodphoto/raisins.png",emoji:"🍇"},
  {name:"Dates",type:"Vegetarian",group:"Fruit",kcal:282,protein:2.5,carbs:75.0,fat:0.4,fiber:8.0,sugar:63.4,image:"./foodphoto/dates.png",emoji:"🌴"},
  {name:"Mushrooms, cooked",type:"Vegetarian",group:"Vegetable",kcal:28,protein:3.6,carbs:5.3,fat:0.5,fiber:2.2,sugar:2.0,image:"./foodphoto/mushrooms.png",emoji:"🍄"}
];

const foodGrid = document.getElementById("foodGrid");
const searchInput = document.getElementById("searchInput");
const filterRow = document.getElementById("filterRow");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const foodSelect = document.getElementById("foodSelect");
const grams = document.getElementById("grams");
const gramDisplay = document.getElementById("gramDisplay");
const clearSearch = document.getElementById("clearSearch");
const calcIcon = document.getElementById("calcIcon");

let activeFilter = "All";

const fmt = n => Number(n).toFixed(n < 10 && n % 1 !== 0 ? 1 : 0);

function renderFoods(){
  const term = searchInput.value.trim().toLowerCase();
  const filtered = foods.filter(f => {
    const matchesText = !term || `${f.name} ${f.type} ${f.group}`.toLowerCase().includes(term);
    const matchesFilter = activeFilter === "All" ||
      f.type === activeFilter ||
      f.group === activeFilter ||
      (activeFilter === "Mixed" && true);
    return matchesText && matchesFilter;
  });
  foodGrid.innerHTML = filtered.map((f, index) => `
    <article class="food-card">
      <div class="food-visual">
        <span class="tag">${f.type}</span>
        <img class="food-image" src="${f.image || './photo/food-placeholder.png'}" alt="${f.name}" onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('span'),{className:'food-image-emoji',textContent:'${f.emoji || "🍽️"}'}));">
      </div>
      <div class="food-body">
        <h3>${f.name}</h3>
        <div class="sub">${f.group} • values per 100 g</div>
        <div class="mini-nutrients">
          <div><span>Protein</span><b>${fmt(f.protein)}g</b></div>
          <div><span>Carbs</span><b>${fmt(f.carbs)}g</b></div>
          <div><span>Fat</span><b>${fmt(f.fat)}g</b></div>
        </div>
        <div class="food-bottom">
          <strong>${fmt(f.kcal)} kcal</strong>
          <button data-calc="${foods.indexOf(f)}">Calculate</button>
        </div>
      </div>
    </article>
  `).join("");
  resultsCount.textContent = `${filtered.length} food${filtered.length === 1 ? "" : "s"} shown`;
  emptyState.classList.toggle("hidden", filtered.length !== 0);
  foodGrid.classList.toggle("hidden", filtered.length === 0);
}

function populateSelect(){
  foodSelect.innerHTML = foods.map((f,i)=>`<option value="${i}">${f.name} — ${f.type}</option>`).join("");
  updateCalculator();
}

function updateCalculator(){
  const f = foods[Number(foodSelect.value) || 0];
  const g = Number(grams.value);
  const factor = g / 100;
  gramDisplay.textContent = g;
  if (f.image) {
    calcIcon.innerHTML = `<img src="${f.image}" alt="${f.name}" class="calc-food-image" onerror="this.onerror=null;this.replaceWith(document.createTextNode('${f.emoji || "🍽️"}'));">`;
  } else {
    calcIcon.textContent = f.emoji || "🍽️";
  }
  document.getElementById("calcCalories").textContent = fmt(f.kcal * factor);
  document.getElementById("calcProtein").textContent = `${fmt(f.protein * factor)} g`;
  document.getElementById("calcCarbs").textContent = `${fmt(f.carbs * factor)} g`;
  document.getElementById("calcFat").textContent = `${fmt(f.fat * factor)} g`;
  document.getElementById("calcFiber").textContent = `${fmt(f.fiber * factor)} g`;
  document.getElementById("calcSugar").textContent = `${fmt(f.sugar * factor)} g`;
}

filterRow.addEventListener("click", e => {
  const btn = e.target.closest(".filter");
  if(!btn) return;
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  activeFilter = btn.dataset.filter;
  renderFoods();
});

searchInput.addEventListener("input", renderFoods);

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "All";
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active", b.dataset.filter === "All"));
  renderFoods();
});

foodGrid.addEventListener("click", e => {
  const btn = e.target.closest("[data-calc]");
  if(!btn) return;
  foodSelect.value = btn.dataset.calc;
  grams.value = 100;
  updateCalculator();
  document.getElementById("calculator").scrollIntoView({behavior:"smooth"});
});

document.querySelectorAll("[data-category-jump]").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.categoryJump;
    activeFilter = category;
    document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active", b.dataset.filter === category));
    searchInput.value = "";
    renderFoods();
    document.getElementById("foods").scrollIntoView({behavior:"smooth"});
  });
});

foodSelect.addEventListener("change", updateCalculator);
grams.addEventListener("input", updateCalculator);

document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// ✅ UPDATED: load the live food list from the server before first render
async function loadFoodsFromServer() {
  try {
    const res = await fetch('/api/foods');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        foods = data;
      }
    }
  } catch (err) {
    console.warn('Could not load foods from server, using fallback list.', err);
  } finally {
    populateSelect();
    renderFoods();
  }
}

loadFoodsFromServer();