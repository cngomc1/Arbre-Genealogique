// Structure de données pour l'utilisateur
class Person {
    constructor(name, photo, birthDate, familyName, city, profession) {
      this.id = Date.now().toString(); // ID unique basé sur timestamp
      this.name = name;
      this.photo = photo;
      this.birthDate = birthDate;
      this.familyName = familyName;
      this.city = city;
      this.profession = profession;
      this.relations = []; // Liste des relations avec d'autres personnes
    }
  }
  
  // Structure de données pour les relations
  class Relation {
    constructor(personId, relationType) {
      this.personId = personId;
      this.relationType = relationType; // "parent", "child", "spouse"
    }
  }
  
  // Gestionnaire d'arbre généalogique
  class FamilyTreeManager {
    constructor() {
      this.people = {};
      this.rootPerson = null;
      this.currentFocusPerson = null; // Personne actuellement au centre de l'affichage
      this.loadFromLocalStorage();
    }
  
    // Créer un nouvel utilisateur racine
    createRootPerson(personData) {
      const person = new Person(
        personData.name,
        personData.photo,
        personData.birthDate,
        personData.familyName,
        personData.city,
        personData.profession
      );
      
      this.people[person.id] = person;
      this.rootPerson = person.id;
      this.currentFocusPerson = person.id;
      this.saveToLocalStorage();
      return person;
    }
  
    // Définir la personne focalisée
    setFocusPerson(personId) {
      if (this.people[personId]) {
        this.currentFocusPerson = personId;
        return true;
      }
      return false;
    }
  
    // Ajouter une relation
    addRelation(fromPersonId, personData, relationType) {
      // Créer la nouvelle personne
      const newPerson = new Person(
        personData.name,
        personData.photo,
        personData.birthDate,
        personData.familyName,
        personData.city,
        personData.profession
      );
      
      // Ajouter à la liste des personnes
      this.people[newPerson.id] = newPerson;
      
      // Créer la relation dans les deux sens
      const fromPerson = this.people[fromPersonId];
      
      // Relation de la personne d'origine vers la nouvelle personne
      fromPerson.relations.push(new Relation(newPerson.id, relationType));
      
      // Relation inverse
      let inverseRelation;
      if (relationType === 'parent') {
        inverseRelation = 'child';
      } else if (relationType === 'child') {
        inverseRelation = 'parent';
      } else if (relationType === 'spouse') {
        inverseRelation = 'spouse';
      }
      
      newPerson.relations.push(new Relation(fromPersonId, inverseRelation));
      
      this.saveToLocalStorage();
      return newPerson;
    }
  
    // Sauvegarder dans le localStorage
    saveToLocalStorage() {
      localStorage.setItem('familyTreeData', JSON.stringify({
        people: this.people,
        rootPerson: this.rootPerson,
        currentFocusPerson: this.currentFocusPerson
      }));
    }
  
    // Charger depuis le localStorage
    loadFromLocalStorage() {
      const data = localStorage.getItem('familyTreeData');
      if (data) {
        const parsedData = JSON.parse(data);
        this.people = parsedData.people;
        this.rootPerson = parsedData.rootPerson;
        this.currentFocusPerson = parsedData.currentFocusPerson || this.rootPerson;
      }
    }
  
    // Obtenir la personne par ID
    getPerson(personId) {
      return this.people[personId];
    }
  
    // Obtenir toutes les personnes
    getAllPeople() {
      return Object.values(this.people);
    }
  
    // Construire les données d'arbre pour l'affichage
    getTreeData() {
      if (!this.currentFocusPerson) {
        if (!this.rootPerson) return null;
        this.currentFocusPerson = this.rootPerson;
      }
      
      return this.buildTreeNodeWithRelations(this.currentFocusPerson, new Set());
    }
    
    // Construire la structure d'un nœud d'arbre avec ses relations
    buildTreeNodeWithRelations(personId, visited = new Set()) {
      if (visited.has(personId)) return null; // Éviter les boucles infinies
      visited.add(personId);
      
      const person = this.people[personId];
      if (!person) return null;
      
      const treeNode = {
        id: person.id,
        name: person.name,
        photo: person.photo,
        familyName: person.familyName,
        birthDate: person.birthDate,
        city: person.city,
        profession: person.profession,
        parents: [],
        spouses: [],
        children: []
      };
      
      // Ajouter les relations
      for (const relation of person.relations) {
        const relatedPersonId = relation.personId;
        const relatedPerson = this.people[relatedPersonId];
        
        if (!relatedPerson) continue;
        
        // Version simplifiée sans récursion pour éviter les cycles infinis
        const relationInfo = {
          id: relatedPerson.id,
          name: relatedPerson.name,
          photo: relatedPerson.photo,
          familyName: relatedPerson.familyName
        };
        
        if (relation.relationType === 'parent') {
          treeNode.parents.push(relationInfo);
        } else if (relation.relationType === 'spouse') {
          treeNode.spouses.push(relationInfo);
        } else if (relation.relationType === 'child') {
          treeNode.children.push(relationInfo);
        }
      }
      
      return treeNode;
    }
  
    // Trouver le chemin de relation entre deux personnes
    findRelationPath(fromPersonId, toPersonId) {
      if (!this.people[fromPersonId] || !this.people[toPersonId]) {
        return null;
      }
      
      if (fromPersonId === toPersonId) {
        return { path: [], description: "C'est la même personne" };
      }
      
      // BFS pour trouver le chemin le plus court
      const queue = [{ id: fromPersonId, path: [], relations: [] }];
      const visited = new Set([fromPersonId]);
      
      while (queue.length > 0) {
        const { id, path, relations } = queue.shift();
        const person = this.people[id];
        
        for (const relation of person.relations) {
          const nextId = relation.personId;
          
          if (nextId === toPersonId) {
            // Chemin trouvé
            const newPath = [...path, id, nextId];
            const newRelations = [...relations, relation.relationType];
            return { 
              path: newPath, 
              relations: newRelations,
              description: this.describeRelationPath(newPath, newRelations)
            };
          }
          
          if (!visited.has(nextId)) {
            visited.add(nextId);
            queue.push({ 
              id: nextId, 
              path: [...path, id], 
              relations: [...relations, relation.relationType]
            });
          }
        }
      }
      
      return { path: [], description: "Aucune relation trouvée" };
    }
    
    // Décrire en langage naturel la relation entre deux personnes
    describeRelationPath(path, relations) {
      if (path.length < 2) return "Aucune relation trouvée";
      
      // Cas simple : relation directe
      if (path.length === 2) {
        const fromPerson = this.people[path[0]];
        const toPerson = this.people[path[1]];
        const relation = relations[0];
        
        if (relation === 'parent') {
          return `${fromPerson.name} est parent de ${toPerson.name}`;
        } else if (relation === 'child') {
          return `${fromPerson.name} est enfant de ${toPerson.name}`;
        } else if (relation === 'spouse') {
          return `${fromPerson.name} est conjoint(e) de ${toPerson.name}`;
        }
      }
      
      // Relations plus complexes (non exhaustives)
      if (path.length === 3) {
        const fromPerson = this.people[path[0]];
        const middlePerson = this.people[path[1]];
        const toPerson = this.people[path[2]];
        
        if (relations[0] === 'child' && relations[1] === 'child') {
          return `${fromPerson.name} est petit-enfant de ${toPerson.name}`;
        } else if (relations[0] === 'parent' && relations[1] === 'parent') {
          return `${fromPerson.name} est grand-parent de ${toPerson.name}`;
        } else if (relations[0] === 'child' && relations[1] === 'parent') {
          return `${fromPerson.name} est frère/sœur de ${toPerson.name}`;
        } else if (relations[0] === 'spouse' && relations[1] === 'parent') {
          return `${fromPerson.name} est beau-parent de ${toPerson.name}`;
        } else if (relations[0] === 'parent' && relations[1] === 'spouse') {
          return `${fromPerson.name} est beau-parent de ${toPerson.name}`;
        }
      }
      
      // Description générique pour les relations plus complexes
      const personNames = path.map(id => this.people[id].name);
      let description = `${personNames[0]} est lié(e) à ${personNames[personNames.length - 1]} via `;
      
      for (let i = 1; i < personNames.length - 1; i++) {
        description += `${personNames[i]}`;
        if (i < personNames.length - 2) {
          description += ", puis ";
        }
      }
      
      return description;
    }
  }
  
  // UI Controller
  class FamilyTreeApp {
    constructor() {
      this.treeManager = new FamilyTreeManager();
      this.currentView = 'welcome';
      this.selectedPerson = null;
      
      // Initialiser l'app
      this.init();
    }
    
    init() {
      // Vérifier si un arbre existe déjà
      if (this.treeManager.rootPerson) {
        this.showTreeView();
      } else {
        this.showWelcomeView();
      }
      
      // Event listeners globaux
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
          this.closeModal();
        }
      });
    }
    
    // Afficher la vue d'accueil
    showWelcomeView() {
      this.currentView = 'welcome';
      const appContainer = document.getElementById('app');
      
      appContainer.innerHTML = `
        <div class="welcome-container">
          <h1>Arbre Généalogique</h1>
          <button id="create-tree-btn" class="primary-btn">Créer votre arbre généalogique</button>
        </div>
      `;
      
      document.getElementById('create-tree-btn').addEventListener('click', () => {
        this.showPersonFormView();
      });
    }
    
    // Afficher le formulaire d'ajout de personne
    showPersonFormView(fromPersonId = null, relationType = null) {
      this.currentView = 'form';
      const appContainer = document.getElementById('app');
      
      const title = fromPersonId ? 'Ajouter une personne à l\'arbre' : 'Créer votre arbre généalogique';
      
      appContainer.innerHTML = `
        <div class="form-container">
          <h2>${title}</h2>
          <form id="person-form">
            <div class="form-group">
              <label for="name">Nom et prénom *</label>
              <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="photo">URL de la photo</label>
              <input type="text" id="photo" name="photo" placeholder="https://example.com/photo.jpg">
            </div>
            
            <div class="form-group">
              <label for="birthDate">Date de naissance</label>
              <input type="date" id="birthDate" name="birthDate">
            </div>
            
            <div class="form-group">
              <label for="familyName">Nom de famille *</label>
              <input type="text" id="familyName" name="familyName" required>
            </div>
            
            <div class="form-group">
              <label for="city">Ville de résidence</label>
              <input type="text" id="city" name="city">
            </div>
            
            <div class="form-group">
              <label for="profession">Métier ou profession</label>
              <input type="text" id="profession" name="profession">
            </div>
            
            ${relationType ? `
              <div class="form-group">
                <label for="relationType">Relation</label>
                <select id="relationType" name="relationType">
                  <option value="parent" ${relationType === 'parent' ? 'selected' : ''}>Parent</option>
                  <option value="child" ${relationType === 'child' ? 'selected' : ''}>Enfant</option>
                  <option value="spouse" ${relationType === 'spouse' ? 'selected' : ''}>Conjoint(e)</option>
                </select>
              </div>
            ` : ''}
            
            <div class="form-actions">
              <button type="button" id="cancel-btn" class="secondary-btn">Annuler</button>
              <button type="submit" class="primary-btn">
                ${fromPersonId ? 'Ajouter à l\'arbre' : 'Créer mon arbre'}
              </button>
            </div>
          </form>
        </div>
      `;
      
      document.getElementById('cancel-btn').addEventListener('click', () => {
        if (this.treeManager.rootPerson) {
          this.showTreeView();
        } else {
          this.showWelcomeView();
        }
      });
      
      document.getElementById('person-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
          name: document.getElementById('name').value,
          photo: document.getElementById('photo').value || 'https://via.placeholder.com/150',
          birthDate: document.getElementById('birthDate').value,
          familyName: document.getElementById('familyName').value,
          city: document.getElementById('city').value,
          profession: document.getElementById('profession').value
        };
        
        if (fromPersonId) {
          const selectedRelationType = document.getElementById('relationType').value;
          this.treeManager.addRelation(fromPersonId, formData, selectedRelationType);
          this.showTreeView();
        } else {
          this.treeManager.createRootPerson(formData);
          this.showTreeView();
        }
      });
    }
    
    // Afficher la vue de l'arbre
    showTreeView() {
      this.currentView = 'tree';
      const appContainer = document.getElementById('app');
      
      const allPeople = this.treeManager.getAllPeople();
      const currentFocusPerson = this.treeManager.getPerson(this.treeManager.currentFocusPerson);
      
      appContainer.innerHTML = `
        <div class="tree-container">
          <div class="tree-header">
            <h2>Votre Arbre Généalogique</h2>
            <div class="tree-controls">
              <div class="people-selector">
                <label for="focus-person">Centrer sur:</label>
                <select id="focus-person">
                  ${allPeople.map(person => `
                    <option value="${person.id}" ${person.id === this.treeManager.currentFocusPerson ? 'selected' : ''}>
                      ${person.name} ${person.familyName}
                    </option>
                  `).join('')}
                </select>
              </div>
              <button id="relation-finder-btn" class="action-btn">Trouver une relation</button>
            </div>
          </div>
          
          <div class="focus-person-info">
            <p>Focus actuel: <strong>${currentFocusPerson ? currentFocusPerson.name + ' ' + currentFocusPerson.familyName : 'Aucun'}</strong></p>
          </div>
          
          <div id="family-tree"></div>
        </div>
      `;
      
      document.getElementById('focus-person').addEventListener('change', (e) => {
        const personId = e.target.value;
        if (this.treeManager.setFocusPerson(personId)) {
          this.treeManager.saveToLocalStorage();
          this.renderTree();
        }
      });
      
      document.getElementById('relation-finder-btn').addEventListener('click', () => {
        this.showRelationFinder();
      });
      
      this.renderTree();
    }
    
    // Afficher l'outil de recherche de relations
    showRelationFinder() {
      const allPeople = this.treeManager.getAllPeople();
      
      const modalContent = `
        <div class="relation-finder">
          <div class="form-group">
            <label for="relation-from">De:</label>
            <select id="relation-from" class="form-control">
              ${allPeople.map(person => `
                <option value="${person.id}">${person.name} ${person.familyName}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="relation-to">À:</label>
            <select id="relation-to" class="form-control">
              ${allPeople.map(person => `
                <option value="${person.id}">${person.name} ${person.familyName}</option>
              `).join('')}
            </select>
          </div>
          
          <button id="find-relation-btn" class="primary-btn">Trouver la relation</button>
          
          <div id="relation-result" class="relation-result" style="display: none;">
            <h4>Résultat:</h4>
            <p id="relation-description"></p>
          </div>
        </div>
      `;
      
      this.showModal('Trouver une relation', modalContent);
      
      document.getElementById('find-relation-btn').addEventListener('click', () => {
        const fromId = document.getElementById('relation-from').value;
        const toId = document.getElementById('relation-to').value;
        
        const relationResult = this.treeManager.findRelationPath(fromId, toId);
        
        const resultDiv = document.getElementById('relation-result');
        const descriptionEl = document.getElementById('relation-description');
        
        resultDiv.style.display = 'block';
        descriptionEl.textContent = relationResult.description;
      });
    }
    
    // Afficher les détails d'une personne
    showPersonDetails(personId) {
      const person = this.treeManager.getPerson(personId);
      if (!person) return;
      
      const modalContent = `
        <div class="person-details">
          <img src="${person.photo}" alt="${person.name}" class="details-photo">
          <h3>${person.name} ${person.familyName}</h3>
          <div class="details-info">
            ${person.birthDate ? `<p><strong>Date de naissance:</strong> ${new Date(person.birthDate).toLocaleDateString()}</p>` : ''}
            ${person.city ? `<p><strong>Ville:</strong> ${person.city}</p>` : ''}
            ${person.profession ? `<p><strong>Profession:</strong> ${person.profession}</p>` : ''}
          </div>
          <div class="details-actions">
            <button id="focus-on-person-btn" class="secondary-btn">Centrer l'arbre sur cette personne</button>
          </div>
        </div>
      `;
      
      this.showModal('Détails', modalContent);
      
      document.getElementById('focus-on-person-btn').addEventListener('click', () => {
        this.treeManager.setFocusPerson(personId);
        this.treeManager.saveToLocalStorage();
        this.closeModal();
        this.renderTree();
      });
    }
    
    // Afficher le formulaire d'ajout de relation
    showAddRelationForm(personId) {
      this.selectedPerson = personId;
      
      const modalContent = `
        <div class="relation-form-container">
          <div class="form-group">
            <label for="modal-relation-type">Type de relation</label>
            <select id="modal-relation-type" class="form-control">
              <option value="parent">Parent</option>
              <option value="child">Enfant</option>
              <option value="spouse">Conjoint(e)</option>
            </select>
          </div>
          <button id="continue-relation-btn" class="primary-btn">Continuer</button>
        </div>
      `;
      
      this.showModal('Ajouter une relation', modalContent);
      
      document.getElementById('continue-relation-btn').addEventListener('click', () => {
        const relationType = document.getElementById('modal-relation-type').value;
        this.closeModal();
        this.showPersonFormView(personId, relationType);
      });
    }
    
    // Afficher une boîte modale
    showModal(title, content) {
      // Supprimer une modale existante si présente
      const existingModal = document.querySelector('.modal-backdrop');
      if (existingModal) {
        existingModal.remove();
      }
      
      const modalHTML = `
        <div class="modal-backdrop">
          <div class="modal">
            <div class="modal-header">
              <h3>${title}</h3>
              <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-content">
              ${content}
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      document.querySelector('.close-modal-btn').addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    // Fermer la boîte modale
    closeModal() {
      const modal = document.querySelector('.modal-backdrop');
      if (modal) {
        modal.remove();
      }
    }
    
    // Rendu de l'arbre généalogique
    renderTree() {
      const treeData = this.treeManager.getTreeData();
      if (!treeData) return;
      
      const treeContainer = document.getElementById('family-tree');
      
      // Créer les niveaux de l'arbre
      treeContainer.innerHTML = `
        <div class="tree-level parents-level"></div>
        <div class="tree-level root-level"></div>
        <div class="tree-level children-level"></div>
      `;
      
      const parentsLevel = treeContainer.querySelector('.parents-level');
      const rootLevel = treeContainer.querySelector('.root-level');
      const childrenLevel = treeContainer.querySelector('.children-level');
      
      // Ajouter les parents
      if (treeData.parents.length > 0) {
        treeData.parents.forEach(parent => {
          parentsLevel.appendChild(this.createPersonCard(parent));
        });
      }
      
      // Ajouter la personne racine et ses conjoints
      rootLevel.appendChild(this.createPersonCard(treeData, true));
      
      if (treeData.spouses.length > 0) {
        treeData.spouses.forEach(spouse => {
          rootLevel.appendChild(this.createPersonCard(spouse));
        });
      }
      
      // Ajouter les enfants
      if (treeData.children.length > 0) {
        treeData.children.forEach(child => {
          childrenLevel.appendChild(this.createPersonCard(child));
        });
      }
    }
    
    // Créer une carte pour une personne
    createPersonCard(person, isRoot = false) {
      const card = document.createElement('div');
      card.className = `person-card ${isRoot ? 'root-person' : ''}`;
      card.dataset.personId = person.id;
      
      card.innerHTML = `
        <div class="card-image">
          <img src="${person.photo}" alt="${person.name}" class="person-photo">
        </div>
        <div class="card-info">
          <h3>${person.name}</h3>
          <p>${person.familyName}</p>
        </div>
        <div class="card-actions">
          <button class="details-btn" data-person-id="${person.id}">Détails</button>
          <button class="add-relation-btn" data-person-id="${person.id}">Ajouter une relation</button>
        </div>
      `;
      
      // Ajouter les écouteurs d'événements
      card.querySelector('.details-btn').addEventListener('click', (e) => {
        this.showPersonDetails(e.target.dataset.personId);
      });
      
      card.querySelector('.add-relation-btn').addEventListener('click', (e) => {
        this.showAddRelationForm(e.target.dataset.personId);
      });
      
      return card;
    }
  }
  
  // CSS styles
  const appStyles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    body {
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    
    #app {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1, h2, h3 {
      margin-bottom: 15px;
    }
    
    /* Buttons */
    .primary-btn {
      background-color: #4a6fa5;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .primary-btn:hover {
      background-color: #385d8a;
    }
    
    .secondary-btn {
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .secondary-btn:hover {
      background-color: #e0e0e0;
    }
    
    .action-btn {
      background-color: #5a9449;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .action-btn:hover {
      background-color: #4a7a3d;
    }
    
    /* Welcome screen */
    .welcome-container {
      text-align: center;
      padding: 50px 0;
    }
    
    /* Forms */
    .form-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    /* Tree view */
    .tree-container {
      padding: 20px 0;
    }
    
    .tree-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .tree-controls {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .people-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .people-selector select {
      width: auto;
      min-width: 200px;
    }
    
    .focus-person-info {
      margin-bottom: 20px;
      padding: 10px;
      background-color: #f0f7ff;
      border-radius: 4px;
      border-left: 4px solid #4a6fa5;
    }
    
    #family-tree {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      margin-top: 30px;
    }
    
    .tree-level {
      display: flex;
      justify-content: center;
      gap: 20px;
      width: 100%;
      flex-wrap: wrap;
    }
    
    /* Person cards */
    .person-card {
      background: white;
      border-radius: 8px;
      width: 180px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .root-person {
      border: 2px solid #4a6fa5;
    }
    
    .card-image {
      height: 120px;
      overflow: hidden;
    }
    
    .person-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .card-info {
      padding: 10px;
    }
    
    .card-info h3 {
      margin-bottom: 5px;
      font-size: 16px;
    }
    
    .card-info p {
      color: #666;
      font-size: 14px;
    }
    
    .card-actions {
      padding: 0 10px 10px;
      display: flex;
      gap: 5px;
    }
    
    .card-actions button {
      flex: 1;
      padding: 5px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .card-actions button:hover {
      background: #e0e0e0;
    }
    
    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal {
      background-color: white;
      border-radius: 8px;
      width: 500px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #777;
    }
    
    .modal-content {
      padding: 15px;
    }
    
    /* Person details */
    .person-details {
      text-align: center;
    }
    
    .details-photo {
      width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 50%;
      margin-bottom: 15px;
    }
    
    .details-info {
      text-align: left;
      margin-top: 15px;
    }
  `;
  
  // HTML initial
  document.addEventListener('DOMContentLoaded', () => {
    // Ajouter les styles
    const styleElement = document.createElement('style');
    styleElement.textContent = appStyles;
    document.head.appendChild(styleElement);
    
    // Initialiser l'application
    const app = new FamilyTreeApp();
  });