let EMOJIS = {};
let ALL_RECIPES = {};

function emoji(name) {
  return EMOJIS[name] || "";
}

// Collecte toutes les étapes dans l'ordre en remontant récursivement
function collectSteps(result, steps, seen) {
  if (seen.has(result)) return;
  seen.add(result);

  const recipe = ALL_RECIPES[result];
  if (!recipe) return; // élément de base, pas de recette

  const [a, b] = recipe;

  // D'abord on remonte les ingrédients
  collectSteps(a, steps, seen);
  collectSteps(b, steps, seen);

  // Puis on ajoute cette étape
  steps.push({ a, b, result });
}

function openPopup(result) {
  const steps = [];
  const seen = new Set();
  collectSteps(result, steps, seen);

  if (steps.length === 0) return;

  const stepsHTML = steps
    .map((step, i) => {
      const isFinal = i === steps.length - 1;
      return `
      <div class="recipe-step">
        <div class="step-item">${emoji(step.a)} ${step.a}</div>
        <span class="step-plus">+</span>
        <div class="step-item">${emoji(step.b)} ${step.b}</div>
        <span class="step-arrow">→</span>
        <div class="step-item ${isFinal ? "step-result" : ""}">${emoji(step.result)} ${step.result}</div>
      </div>`;
    })
    .join("");

  document.getElementById("popup-title").innerHTML =
    `${emoji(result)} ${result}`;
  document.getElementById("popup-steps").innerHTML = stepsHTML;
  document.getElementById("overlay").classList.add("open");
}

function closePopup() {
  document.getElementById("overlay").classList.remove("open");
}

function render(recipes, query = "") {
  const entries = Object.entries(recipes).filter(([result, [a, b]]) => {
    const q = query.toLowerCase();
    return !q || result.includes(q) || a.includes(q) || b.includes(q);
  });

  document.getElementById("count-label").textContent =
    `${entries.length} recette${entries.length !== 1 ? "s" : ""} affichée${entries.length !== 1 ? "s" : ""}`;

  document.getElementById("grid").innerHTML = entries
    .map(
      ([result]) => `
    <div class="card" onclick="openPopup('${result.replace(/'/g, "\\'")}')">
      <span class="card-emoji">${emoji(result)}</span>
      <span class="card-name">${result}</span>
    </div>
  `,
    )
    .join("");
}

// Ferme en cliquant sur l'overlay
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("overlay")) closePopup();
});

Promise.all([
  fetch('./json/craft-3.json').then(r => r.text()),
  fetch('./json/emojis-3.json').then(r => r.text())
])
.then(([recipesText, emojisText]) => {

  console.log("RAW RECIPES:", recipesText);
  console.log("RAW EMOJIS:", emojisText);

  const recipes = JSON.parse(recipesText);
  const emojis = JSON.parse(emojisText);

  EMOJIS = emojis;
  ALL_RECIPES = recipes;

  render(recipes);
})
.catch(error => {
  console.error("Erreur :", error);
});
