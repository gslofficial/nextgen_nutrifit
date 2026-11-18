const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function makeElement(dataset = {}) {
  const listeners = {};
  const classes = new Set();
  return {
    dataset,
    value: '',
    innerHTML: '',
    textContent: '',
    listeners,
    classList: {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle(name, force) {
        const shouldAdd = force === undefined ? !classes.has(name) : force;
        if (shouldAdd) classes.add(name);
        else classes.delete(name);
        return shouldAdd;
      }
    },
    addEventListener(type, callback) {
      (listeners[type] ||= []).push(callback);
    },
    querySelectorAll() { return []; },
    scrollIntoView() {}
  };
}

async function loadFoodPageScript() {
  const ids = ['foodGrid', 'searchInput', 'filterRow', 'resultsCount', 'emptyState', 'foodSelect', 'grams', 'gramDisplay', 'clearSearch', 'calcIcon', 'calcCalories', 'calcProtein', 'calcCarbs', 'calcFat', 'calcFiber', 'calcSugar', 'calculator', 'year', 'menuToggle', 'navLinks'];
  const elements = Object.fromEntries(ids.map(id => [id, makeElement()]));
  const filterButtons = ['All', 'Vegetarian', 'Non-Vegetarian', 'Fruit', 'Vegetable', 'Grain', 'Pulse', 'Dairy', 'Nut/Seed']
    .map(filter => makeElement({ filter }));
  const categoryButtons = ['Vegetarian', 'Non-Vegetarian', 'Mixed']
    .map(category => makeElement({ categoryJump: category }));
  elements.navLinks.querySelectorAll = () => [];

  const document = {
    getElementById: id => elements[id] || makeElement(),
    querySelectorAll(selector) {
      if (selector === '.filter') return filterButtons;
      if (selector === '[data-category-jump]') return categoryButtons;
      return [];
    },
    createElement: () => makeElement(),
    createTextNode: text => ({ textContent: text })
  };
  const source = fs.readFileSync('client/javascript/fooddairy.js', 'utf8');
  vm.runInNewContext(source, {
    document,
    fetch: async () => ({ ok: false }),
    console,
    Date,
    Number,
    String,
    Math,
    Object,
    Array
  });
  await new Promise(resolve => setImmediate(resolve));
  return { elements, filterButtons, categoryButtons };
}

test('food search responds to mobile input and native search events', async () => {
  const { elements } = await loadFoodPageScript();
  const input = elements.searchInput;
  assert.equal(input.listeners.input.length, 1);
  assert.equal(input.listeners.search.length, 1);

  input.value = 'chicken';
  input.listeners.input[0]();
  assert.match(elements.foodGrid.innerHTML, /Chicken Breast/);
  assert.doesNotMatch(elements.foodGrid.innerHTML, />Apple</);

  input.value = 'salmon';
  input.listeners.search[0]();
  assert.match(elements.foodGrid.innerHTML, /Salmon/);
  assert.doesNotMatch(elements.foodGrid.innerHTML, /Chicken Breast/);
});

test('search combines correctly with Vegetarian, Non-Vegetarian, and Mixed filters', async () => {
  const { elements, filterButtons, categoryButtons } = await loadFoodPageScript();
  const clickFilter = filter => {
    const button = filterButtons.find(item => item.dataset.filter === filter);
    elements.filterRow.listeners.click[0]({ target: { closest: selector => selector === '.filter' ? button : null } });
  };

  clickFilter('Vegetarian');
  elements.searchInput.value = 'apple';
  elements.searchInput.listeners.input[0]();
  assert.match(elements.foodGrid.innerHTML, />Apple</);
  assert.doesNotMatch(elements.foodGrid.innerHTML, /Chicken Breast/);

  clickFilter('Non-Vegetarian');
  elements.searchInput.value = 'chicken';
  elements.searchInput.listeners.input[0]();
  assert.match(elements.foodGrid.innerHTML, /Chicken Breast/);
  assert.doesNotMatch(elements.foodGrid.innerHTML, />Apple</);

  const mixedButton = categoryButtons.find(item => item.dataset.categoryJump === 'Mixed');
  mixedButton.listeners.click[0]();
  elements.searchInput.value = 'rice';
  elements.searchInput.listeners.input[0]();
  assert.match(elements.foodGrid.innerHTML, /White Rice/);
  assert.doesNotMatch(elements.foodGrid.innerHTML, /Chicken Breast/);
  assert.equal(elements.searchInput.value, 'rice');
});

test('mobile registration date hint is tied to the date field and hidden by default', () => {
  const page = fs.readFileSync('client/registerpage.html', 'utf8');
  const css = fs.readFileSync('client/css_file/register.css', 'utf8');
  assert.match(page, /type="date" name="dob" aria-describedby="dobHint" required/);
  assert.match(page, /id="dobHint">Select your date of birth using the calendar\./);
  assert.match(css, /\.dob-hint\s*\{\s*display:\s*none\s*;\s*\}/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.dob-hint\s*\{\s*display:\s*block/);
});
