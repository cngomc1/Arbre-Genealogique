 un **arbre généalogique dynamique en JavaScript pur (avec D3.js + SVG)**. Tu pourras copier-coller, adapter et réussir ton livrable sans prise de tête.

---

## 🚀 Objectif :  
Créer un **arbre généalogique interactif** avec possibilité d’ajouter des **enfants, parents, conjoints**, tout en **mettant à jour dynamiquement** l’arbre affiché.

---

## ✅ Technologies utilisées :
- HTML
- CSS
- JavaScript
- [D3.js](https://d3js.org/) (lib de visualisation de données)
- SVG (pour dessiner l’arbre)

---

## ⏳ Temps disponible : 2 heures  
Je vais te guider **par blocs de 15 à 20 minutes** ⏰

---

## ⛳ Étape 1 : Initialisation du projet (15 minutes)

### 🛠️ Structure de ton projet
Crée un dossier `arbre-genealogique` avec :

```
📁 arbre-genealogique
├── index.html
├── style.css
├── script.js
```

### ✨ `index.html`
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Arbre Généalogique</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>👨‍👩‍👧‍👦 Arbre Généalogique Dynamique</h1>
  <div id="tree-container">
    <svg id="tree"></svg>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

### 🎨 `style.css`
```css
body {
  font-family: Arial, sans-serif;
  text-align: center;
}

#tree-container {
  width: 100%;
  height: 90vh;
  border: 1px solid #ccc;
  overflow: auto;
}

svg {
  width: 2000px;
  height: 1000px;
}

.node rect {
  fill: #f3f4f6;
  stroke: #555;
  stroke-width: 2px;
  rx: 10px;
}

.node text {
  font-size: 12px;
}

button {
  margin: 2px;
  font-size: 10px;
}
```

---

## 🌳 Étape 2 : Structure de données + arbre de base (20 minutes)

### 🧠 Structure JSON de départ
```js
const data = {
  id: 1,
  name: "Christine",
  photo: "https://via.placeholder.com/40",
  children: [
    {
      id: 2,
      name: "Enfant 1",
      photo: "https://via.placeholder.com/40",
      children: []
    }
  ]
};
```

### 🧰 Fonction pour générer l’arbre (dans `script.js`)
```js
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

let rootData = d3.hierarchy(data);
let treeLayout = d3.tree().size([height, width - 200]);

updateTree(rootData);

function updateTree(root) {
  svg.selectAll("*").remove(); // Clear

  treeLayout(root);

  // Draw links
  svg.selectAll('line.link')
    .data(root.links())
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('x1', d => d.source.y)
    .attr('y1', d => d.source.x)
    .attr('x2', d => d.target.y)
    .attr('y2', d => d.target.x)
    .attr('stroke', '#999');

  // Draw nodes
  const nodes = svg.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  nodes.append("rect")
    .attr("width", 100)
    .attr("height", 70)
    .attr("x", -50)
    .attr("y", -35);

  nodes.append("image")
    .attr("xlink:href", d => d.data.photo)
    .attr("x", -15)
    .attr("y", -30)
    .attr("width", 30)
    .attr("height", 30);

  nodes.append("text")
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text(d => d.data.name);

  // Add buttons
  nodes.append("foreignObject")
    .attr("x", -45)
    .attr("y", 10)
    .attr("width", 90)
    .attr("height", 60)
    .append("xhtml:div")
    .html(d => `
      <button onclick="showInfo(${d.data.id})">Infos</button>
      <button onclick="addChild(${d.data.id})">+Relation</button>
    `);
}
```

---

## 👶 Étape 3 : Ajouter une personne (20 minutes)

Dans `script.js` ajoute :

```js
let nextId = 3;

function addChild(parentId) {
  const name = prompt("Nom de la personne :");
  const type = prompt("Relation (parent, enfant, conjoint) :");

  if (!name || !type) return;

  const newPerson = {
    id: nextId++,
    name,
    photo: "https://via.placeholder.com/40",
    children: []
  };

  function findAndAdd(node) {
    if (node.id === parentId) {
      if (type === "enfant") {
        node.children = node.children || [];
        node.children.push(newPerson);
      } else if (type === "parent") {
        const newRoot = {
          id: nextId++,
          name,
          photo: "https://via.placeholder.com/40",
          children: [JSON.parse(JSON.stringify(data))]
        };
        Object.assign(data, newRoot);
        return true;
      } else if (type === "conjoint") {
        node.children.push({
          ...newPerson,
          name: "(Conjoint) " + name
        });
      }
      return true;
    } else if (node.children) {
      return node.children.some(child => findAndAdd(child));
    }
    return false;
  }

  findAndAdd(data);
  updateTree(d3.hierarchy(data));
}

function showInfo(id) {
  alert("Détails de l'utilisateur #" + id);
}
```

---

## 💅 Étape 4 : Finitions et test (30 minutes)

### ✅ Checklist :
- [x] Arbre généré à partir d’un JSON
- [x] Boutons par individu
- [x] Ajout de relation dynamique
- [x] Mise à jour automatique de l’arbre
- [x] Bonne IHM (lisible, interactive)

---

## 🔁 Étape 5 : Bonus (si tu as le temps)
- Ajouter des modals au lieu de prompt
- Permettre de modifier une personne
- Ajouter des liens mari-conjoint visuellement différents
- Sauvegarde dans `localStorage`

---

## ✅ Résultat
Tu auras un **arbre visuel généré dynamiquement** avec **ajout d’individus** et **mise à jour fluide**.

---

## 💬 Besoin du code complet en fichier ZIP ? Ou une version déployée ?  
Dis-moi et je te fais ça en 2 min 👌

