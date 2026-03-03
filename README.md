# API REST Ticketing -- Nexora Dynamics

API de gestion de tickets internes pour la societe Nexora Dynamics. Elle permet de centraliser les demandes (bugs, acces, materiel), de suivre leur traitement et de controler les acces selon les roles.

Construite avec Express.js, Sequelize (MariaDB) et JWT.

---

## Installation

### Prerequis

- Node.js (ou Bun)
- Docker et Docker Compose

### Lancement de la base de donnees

```bash
docker compose up -d
```

Cela demarre une instance MariaDB sur le port 3306 et phpMyAdmin sur le port 8080.

### Configuration

Creer un fichier `.env` a la racine du projet :

```
API_PORT=3000
DB_NAME="mon_projet"
DB_USER="root"
DB_PASSWORD="root_password"
DB_HOST="localhost"
DB_PORT=3306
JWT_KEY="votre_cle_secrete"
```

### Installation des dependances et demarrage

```bash
npm install
npm run dev
```

Ou avec Bun :

```bash
bun install
bun run dev
```

Le serveur demarre sur le port defini dans `.env` (par defaut 3000).

### Initialisation du schema

Le fichier `sql/schema.sql` contient la structure complete de la base. Il peut etre execute manuellement via phpMyAdmin (http://localhost:8080) ou en ligne de commande. Le fichier `sql/jeu-donnees.sql` fournit les donnees initiales (categories et priorites). Sequelize synchronise egalement les tables au demarrage avec `alter: true`.

---

## Architecture du projet

```
app.js                  Point d'entree de l'application Express
server.js               Demarrage du serveur HTTP
helper/
  connexion.js          Connexion Sequelize a la base
  associate.js          Definitions des relations entre modeles
  sync.js               Synchronisation du schema
module/
  auth/                 Authentification (login, inscription)
  user/                 Gestion des utilisateurs
  team/                 Gestion des equipes
  ticket/               Gestion des tickets
  ticket_category/      Categories de tickets
  ticket_priority/      Priorites de tickets
  comment/              Commentaires sur les tickets
sql/
  schema.sql            Structure complete de la base de donnees
  jeu-donnees.sql       Donnees initiales (categories, priorites, etc.)
```

Chaque module suit une architecture en trois couches et contient quatre fichiers :

- `model.js` — schema Sequelize (definition de la table)
- `service.js` — logique metier (regles, validations, acces aux donnees)
- `controller.js` — gestion des requetes HTTP et des reponses (fait appel au service)
- `route.js` — declaration des routes Express (avec middleware d'authentification si besoin)

Le middleware d'authentification JWT se trouve dans `module/auth/auth.middleware.js`. Il verifie le token `Authorization: Bearer <token>` et expose les donnees decodees dans `req.token`.

---

## Roles et droits

L'API distingue trois roles :

**Collaborateur** : cree des tickets, consulte ses propres tickets, commente ses tickets, peut annuler un ticket non traite.

**Support** : voit tous les tickets, prend en charge un ticket, change son statut selon les transitions autorisees, ajoute des commentaires (y compris internes).

**Manager** : voit les tickets des membres de son equipe, peut modifier la priorite d'un ticket, ne peut pas traiter techniquement un ticket.

---

## Regles metier

### Visibilite des tickets

- Un collaborateur ne voit que ses propres tickets.
- Un manager voit les tickets de son equipe.
- Un support voit tous les tickets.

### Transitions de statut autorisees

| Depuis        | Vers          | Qui peut le faire           |
|---------------|---------------|-----------------------------|
| open          | assigned      | Support                     |
| assigned      | in_progress   | Support                     |
| in_progress   | resolved      | Support                     |
| resolved      | closed        | Support ou Collaborateur    |
| open          | cancelled     | Auteur du ticket uniquement |

Toute autre transition est refusee par l'API.

### Priorite

- Un collaborateur ne peut pas creer un ticket avec la priorite "critical".
- Un manager peut modifier la priorite d'un ticket.
- Un support ne peut pas modifier la priorite.

### Commentaires

- Tout utilisateur authentifie peut commenter un ticket auquel il a acces.
- Un commentaire marque `is_internal: true` n'est visible que par les membres du support et les managers.
- Seul l'auteur d'un commentaire peut le modifier ou le supprimer.

---

## Routes de l'API

Toutes les routes (sauf l'inscription et la connexion) necessitent un token JWT dans le header `Authorization: Bearer <token>`.

---

### Authentification

#### POST /auth/signin -- Inscription

Cree un nouveau compte utilisateur.

**Corps de la requete :**
```json
{
  "full_name": "Test User",
  "email": "test@nexora.com",
  "password": "password123",
  "role": "support"
}
```

**Reponse attendue : 201**
```json
{
  "id": 1,
  "full_name": "Test User",
  "email": "test@nexora.com",
  "role": "support",
  "team_id": null,
  "created_at": "...",
  "updated_at": "..."
}
```

Si l'email existe deja, la reponse est `400` avec `{ "error": "Email already exists" }`.

---

#### POST /auth/login -- Connexion

Authentifie un utilisateur et retourne un token JWT.

**Corps de la requete :**
```json
{
  "email": "test@nexora.com",
  "password": "password123"
}
```

**Reponse attendue : 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "full_name": "Test User"
}
```

Si le mot de passe est incorrect : `400` avec `{ "error": "Wrong password" }`.
Si le compte n'existe pas : `400` avec `{ "error": "Account not found" }`.

---

### Utilisateurs

#### POST /users -- Creer un utilisateur

Pas de token requis.

**Corps de la requete :**
```json
{
  "full_name": "Bob Martin",
  "email": "bob@nexora.com",
  "password": "password123",
  "role": "collaborateur"
}
```

**Reponse attendue : 201**
```json
{
  "id": 2,
  "full_name": "Bob Martin",
  "email": "bob@nexora.com",
  "role": "collaborateur",
  "team_id": null,
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### GET /users -- Lister tous les utilisateurs

Token requis.

**Reponse attendue : 200**
```json
[
  { "id": 1, "full_name": "Test User", "email": "test@nexora.com", "role": "support", ... },
  { "id": 2, "full_name": "Bob Martin", "email": "bob@nexora.com", "role": "collaborateur", ... }
]
```

Sans token : `401` avec `{ "error": "Unauthorized" }`.

---

#### GET /users/:id -- Obtenir un utilisateur par son identifiant

Token requis.

**Reponse attendue : 200**
```json
{
  "id": 1,
  "full_name": "Test User",
  "email": "test@nexora.com",
  "role": "support",
  "team_id": null,
  "created_at": "...",
  "updated_at": "..."
}
```

Si l'utilisateur n'existe pas : `404` avec `{ "error": "Utilisateur non trouve" }`.

---

#### PUT /users/:id -- Modifier un utilisateur

Token requis.

**Corps de la requete :**
```json
{
  "full_name": "Test User Updated",
  "role": "manager"
}
```

**Reponse attendue : 200**
```json
{
  "id": 1,
  "full_name": "Test User Updated",
  "email": "test@nexora.com",
  "role": "manager",
  ...
}
```

---

#### DELETE /users/:id -- Supprimer un utilisateur

Token requis.

**Reponse attendue : 200**
```json
{ "message": "Utilisateur supprime" }
```

---

### Equipes

#### POST /teams -- Creer une equipe

Token requis.

**Corps de la requete :**
```json
{
  "name": "Equipe Test",
  "manager_id": 1
}
```

**Reponse attendue : 201**
```json
{
  "id": 1,
  "name": "Equipe Test",
  "manager_id": 1,
  "created_at": "..."
}
```

---

#### GET /teams -- Lister toutes les equipes

Token requis.

**Reponse attendue : 200**
```json
[
  { "id": 1, "name": "Equipe Test", "manager_id": 1, "created_at": "..." }
]
```

---

#### GET /teams/:id -- Obtenir une equipe par son identifiant

Token requis.

**Reponse attendue : 200**
```json
{
  "id": 1,
  "name": "Equipe Test",
  "manager_id": 1,
  "created_at": "..."
}
```

---

#### PUT /teams/:id -- Modifier une equipe

Token requis.

**Corps de la requete :**
```json
{
  "name": "Equipe Test Updated"
}
```

**Reponse attendue : 200**
```json
{ "message": "Lignes modifiees : 1" }
```

---

#### DELETE /teams/:id -- Supprimer une equipe

Token requis.

**Reponse attendue : 200**
```json
{ "message": "Lignes supprimees : 1" }
```

---

### Categories de tickets

#### POST /ticket-categories -- Creer une categorie

Token requis.

**Corps de la requete :**
```json
{
  "code": "test_cat",
  "label": "Categorie Test"
}
```

**Reponse attendue : 201**
```json
{
  "id": 5,
  "code": "test_cat",
  "label": "Categorie Test"
}
```

---

#### GET /ticket-categories -- Lister toutes les categories

Token requis.

**Reponse attendue : 200**
```json
[
  { "id": 1, "code": "bug", "label": "Bug applicatif" },
  { "id": 2, "code": "access", "label": "Demande d'acces" },
  { "id": 3, "code": "materiel", "label": "Demande de materiel" },
  { "id": 4, "code": "autre", "label": "Autre" },
  { "id": 5, "code": "test_cat", "label": "Categorie Test" }
]
```

---

#### GET /ticket-categories/:id -- Obtenir une categorie

Token requis.

**Reponse attendue : 200**
```json
{ "id": 5, "code": "test_cat", "label": "Categorie Test" }
```

---

#### PUT /ticket-categories/:id -- Modifier une categorie

Token requis.

**Corps de la requete :**
```json
{ "label": "Categorie Test Updated" }
```

**Reponse attendue : 200**
```json
{ "message": "Lignes modifiees : 1" }
```

---

#### DELETE /ticket-categories/:id -- Supprimer une categorie

Token requis.

**Reponse attendue : 200**
```json
{ "message": "Lignes supprimees : 1" }
```

---

### Priorites de tickets

#### POST /ticket-priorities -- Creer une priorite

Token requis.

**Corps de la requete :**
```json
{
  "code": "test_pri",
  "label": "Priorite Test",
  "level": 10
}
```

**Reponse attendue : 201**
```json
{
  "id": 5,
  "code": "test_pri",
  "label": "Priorite Test",
  "level": 10
}
```

---

#### GET /ticket-priorities -- Lister toutes les priorites

Token requis.

**Reponse attendue : 200** -- Liste triee par niveau croissant.

---

#### GET /ticket-priorities/:id -- Obtenir une priorite

Token requis.

**Reponse attendue : 200**
```json
{ "id": 5, "code": "test_pri", "label": "Priorite Test", "level": 10 }
```

---

#### PUT /ticket-priorities/:id -- Modifier une priorite

Token requis.

**Corps de la requete :**
```json
{ "label": "Priorite Test Updated" }
```

**Reponse attendue : 200**
```json
{ "message": "Lignes modifiees : 1" }
```

---

#### DELETE /ticket-priorities/:id -- Supprimer une priorite

Token requis.

**Reponse attendue : 200**
```json
{ "message": "Lignes supprimees : 1" }
```

---

### Tickets

#### POST /tickets -- Creer un ticket

Token requis. L'auteur du ticket est automatiquement l'utilisateur connecte.

**Corps de la requete :**
```json
{
  "title": "Bug de test",
  "description": "Description du bug de test",
  "category_id": 5,
  "priority_id": 5
}
```

**Reponse attendue : 201**
```json
{
  "id": 1,
  "title": "Bug de test",
  "description": "Description du bug de test",
  "category_id": 5,
  "priority_id": 5,
  "status": "open",
  "author_id": 1,
  "assignee_id": null,
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### GET /tickets -- Lister les tickets

Token requis. Supporte les filtres en query string : `status`, `priority`, `category`.

**Reponse attendue : 200**
```json
[
  {
    "id": 1,
    "title": "Bug de test",
    "status": "open",
    "author": { "id": 1, "full_name": "Test User", "email": "test@nexora.com" },
    "assignee": null,
    "category": { "id": 5, "code": "test_cat", "label": "Categorie Test" },
    "priority": { "id": 5, "code": "test_pri", "label": "Priorite Test", "level": 10 },
    ...
  }
]
```

---

#### GET /tickets/:id -- Obtenir un ticket

Token requis. Inclut les relations auteur, assigne, categorie et priorite.

**Reponse attendue : 200**

---

#### PUT /tickets/:id -- Modifier un ticket

Token requis.

**Corps de la requete :**
```json
{ "title": "Bug de test (mis a jour)" }
```

**Reponse attendue : 200**
```json
{ "message": "Lignes modifiees : 1" }
```

---

#### PATCH /tickets/:id/assign -- Assigner un ticket

Token requis. Le statut passe automatiquement a "assigned".

**Corps de la requete :**
```json
{ "assignee_id": 2 }
```

**Reponse attendue : 200**
```json
{ "message": "Ticket assigne avec succes" }
```

---

#### PATCH /tickets/:id/status -- Modifier le statut

Token requis. Le statut doit etre une valeur valide parmi : open, assigned, in_progress, resolved, closed, cancelled.

**Corps de la requete :**
```json
{ "status": "in_progress" }
```

**Reponse attendue : 200**
```json
{ "message": "Statut mis a jour" }
```

Si le statut est invalide : `400` avec `{ "error": "Statut invalide" }`.

---

#### DELETE /tickets/:id -- Supprimer un ticket

Token requis.

**Reponse attendue : 200**
```json
{ "message": "Lignes supprimees : 1" }
```

---

### Commentaires

Les commentaires sont lies a un ticket. Toutes les routes sont sous `/tickets/:ticketId/comments`.

#### POST /tickets/:ticketId/comments -- Ajouter un commentaire

Token requis.

**Corps de la requete :**
```json
{
  "content": "Commentaire de test",
  "is_internal": false
}
```

**Reponse attendue : 201**
```json
{
  "id": 1,
  "ticket_id": 1,
  "author_id": 1,
  "content": "Commentaire de test",
  "is_internal": false,
  "created_at": "..."
}
```

Pour un commentaire interne (visible uniquement par le support), envoyer `"is_internal": true`. Seuls les utilisateurs avec le role support ou manager peuvent creer des commentaires internes.

---

#### GET /tickets/:ticketId/comments -- Lister les commentaires d'un ticket

Token requis. Les collaborateurs ne voient que les commentaires non internes.

**Reponse attendue : 200**
```json
[
  {
    "id": 1,
    "content": "Commentaire de test",
    "is_internal": false,
    "author": { "id": 1, "full_name": "Test User", "email": "test@nexora.com" },
    ...
  }
]
```

---

#### PUT /tickets/:ticketId/comments/:id -- Modifier un commentaire

Token requis. Seul l'auteur du commentaire peut le modifier.

**Corps de la requete :**
```json
{ "content": "Commentaire mis a jour" }
```

**Reponse attendue : 200**

Si l'utilisateur n'est pas l'auteur : `403` avec `{ "error": "Acces refuse" }`.

---

#### DELETE /tickets/:ticketId/comments/:id -- Supprimer un commentaire

Token requis. Seul l'auteur du commentaire peut le supprimer.

**Reponse attendue : 200**
```json
{ "message": "Commentaire supprime" }
```

---

## Technologies

- Express.js 5
- Sequelize 6 (ORM)
- MariaDB
- JSON Web Tokens (JWT)
- bcryptjs (hachage des mots de passe)
- Docker Compose (base de donnees)

---

## Tests et collection Bruno

Un dossier `bruno/` est inclus a la racine du projet. Il contient une collection [Bruno](https://www.usebruno.com/) couvrant l'ensemble des routes de l'API, organisee par module (Auth, Users, Teams, Tickets, Comments, etc.).

L'environnement `Local` (fichier `bruno/environments/Local.bru`) preconfigure l'URL de base et le token JWT pour faciliter les tests en local.