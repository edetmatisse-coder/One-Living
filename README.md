# One Living × Escalade

Dossier interactif et maquette de la campagne « Après la voie ».
Challenge Bachelor 3, WIN Sport School, problématique 2 : développer One Living dans le sport amateur, hors rugby.

**Projet étudiant WIN Sport School, non affilié à One Living, présentation locale.** Le site n'est pas fait pour être mis en ligne.

| Adresse      | Contenu                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------- |
| `/`          | Le **Dossier interactif** : 11 sections, la paroi 3D, la matrice des 16 sports, le simulateur « Ma salle » |
| `/campagne/` | La **maquette du site public** « Après la voie » : mini-jeu, bouteille 3D, gamme, carte, FAQ  |

## Lancer le site

Prérequis : Node.js 20.9 ou plus récent (développé avec Node 22) et npm.

```bash
npm install
```

### Pour travailler

```bash
npm run dev
```

Puis ouvrir http://localhost:3000.

### Pour présenter (version hors ligne)

```bash
npm run build
```

```bash
npm run start
```

Puis ouvrir http://127.0.0.1:4173. La commande `npm run present` enchaîne les deux et ouvre le navigateur.

`npm run build` exporte le site complet en fichiers statiques dans `out/` : pages, scripts, polices, visuels. Aucune ressource externe, aucune requête réseau : tout marche sans connexion. `npm run start` sert ce dossier avec un petit serveur local sans dépendance (`scripts/serve.mjs`, options `--port 4174` et `--open`).

- Sans Node, depuis le dossier `out/` : `python3 -m http.server 4173`.
- Ne pas ouvrir `out/index.html` par double-clic : les chemins du site sont absolus (`/_next/…`), il faut un serveur, même local.
- Pour présenter depuis un autre ordinateur, copier le projet entier, ou au minimum `out/` et `scripts/serve.mjs`, puis lancer `node scripts/serve.mjs`.

### Le jour J

- Portable branché sur secteur : sur batterie, certains ordinateurs brident le processeur graphique.
- Chrome ou Edge récents conseillés. Firefox et Safari fonctionnent aussi.
- Si le système a l'option « Réduire les animations » activée, le site affiche des visuels fixes à la place de la 3D. Pour retrouver la 3D : désactiver l'option, ou ajouter `?motion=full` à l'adresse.
- Le son est coupé par défaut : bouton « Son » dans l'en-tête (ambiance de salle feutrée, « pschitt » à l'ouverture de la gamme).

## Raccourcis clavier

| Touche                                     | Action                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `P`                                        | Mode présentation, sur le Dossier comme sur la Campagne : une section par diapositive |
| `→` `↓` `Espace` `Entrée` `Page suivante`  | Diapositive suivante (la molette marche aussi)                                     |
| `←` `↑` `Retour arrière` `Page précédente` | Diapositive précédente                                                             |
| `Début` / `Fin`                            | Première / dernière diapositive                                                    |
| `N`                                        | Afficher ou masquer la note de l'orateur                                           |
| `F`                                        | Plein écran                                                                        |
| `Échap`                                    | Quitter le mode présentation                                                       |
| `V`                                        | Mode vidéo (Dossier) : le Dossier se déroule seul en 3 minutes exactement          |
| `Espace`                                   | Pause ou reprise du mode vidéo                                                     |
| `←` / `→`                                  | Reculer ou avancer de 10 secondes dans le mode vidéo                               |
| `Échap`                                    | Quitter le mode vidéo                                                              |

Les deux modes ont aussi leur bouton dans l'en-tête du Dossier ; la Campagne a celui du mode présentation. En mode vidéo, les curseurs de la matrice bougent seuls et le simulateur passe de la salle type au scénario prudent, puis à la grande salle. Pour la vidéo pitch : lancer un enregistrement d'écran (QuickTime, OBS, Xbox Game Bar), puis appuyer sur `V`.

### Paramètres d'adresse

| Paramètre        | Effet                                                         |
| ---------------- | ------------------------------------------------------------- |
| `?motion=reduce` | Force le mouvement réduit : visuels fixes, animations coupées |
| `?motion=full`   | Ignore le réglage « Réduire les animations » du système       |
| `?quality=low`   | 3D allégée, celle du mobile                                   |
| `?quality=high`  | 3D complète, même sur un petit écran                          |
| `?3d=off`        | Coupe toute la 3D                                             |

## Visuels de marque : `public/brand/`

**À la livraison, `public/brand/` ne contient aucun visuel : les 11 fichiers ci-dessous manquent.** Le site affiche à leur place un emplacement propre, qui indique le nom du fichier attendu. Aucune image n'a été prise sur Internet.

| Fichier (sans extension)       | Contenu                                | Utilisé dans                                       |
| ------------------------------ | -------------------------------------- | -------------------------------------------------- |
| `logo-one-living`              | Logo One Living, fond transparent      | En-têtes du Dossier et de la Campagne, étiquette de la bouteille 3D |
| `logo-win`                     | Logo WIN Sport School                  | Pieds de page                                      |
| `bouteille-gingembre-curcuma`  | Visuel produit détouré                 | Campagne, la gamme                                 |
| `bouteille-framboise-grenade`  | Visuel produit détouré                 | Campagne, la gamme                                 |
| `bouteille-passion-goji`       | Visuel produit détouré                 | Campagne, la gamme                                 |
| `bouteille-mangue-citron-vert` | Visuel produit détouré                 | Campagne, la gamme                                 |
| `etiquette-gingembre-curcuma`  | Étiquette à plat (environ 3:1)         | Texture de la bouteille 3D                         |
| `etiquette-framboise-grenade`  | Étiquette à plat (environ 3:1)         | Texture de la bouteille 3D                         |
| `etiquette-passion-goji`       | Étiquette à plat (environ 3:1)         | Texture de la bouteille 3D                         |
| `etiquette-mangue-citron-vert` | Étiquette à plat (environ 3:1)         | Texture de la bouteille 3D                         |
| `shots`                        | Visuel des 3 shots                     | Campagne, bloc « Les shots »                       |

Formats acceptés : `.svg`, `.png`, `.webp`, `.jpg`, `.jpeg`. Le site détecte les fichiers à chaque requête avec `npm run dev`, et une fois pour toutes au `npm run build` : après un ajout, refaire le build. Tant qu'aucune étiquette n'est fournie, la bouteille 3D porte une étiquette dessinée aux couleurs du parfum.

Après l'ajout des étiquettes ou du logo, mettre aussi à jour les visuels fixes de la bouteille (voir plus bas) :

```bash
npm run fallbacks -- --only bouteille
```

## Ce qui est hypothétique ou fictif

Dans le site, tout chiffre non sourcé porte le badge **Hypothèse**, tout contenu inventé porte **Exemple** ou **Démo**. La section « Sources et hypothèses » du Dossier reprend cette liste : « Les valeurs marquées Hypothèse sont à confirmer avec One Living et notre sondage terrain. »

### Hypothèses (badge « Hypothèse »)

- **Modèle économique par point de vente** : jours d'ouverture, passages par jour, taux de prise, prix de cession et de revente, coût de revient de 1,00 €, coût d'activation. Valeurs de travail, à confirmer avec One Living.
- **Notes des 16 sports**, de 1 à 5 sur les 6 critères de la matrice : notation de l'équipe, appuyée sur les licences Insee et l'Observatoire de l'escalade. Les 5 scénarios de pondération sont aussi un choix de l'équipe.
- **Note économique sur 7 critères** : notation de l'équipe à partir du modèle économique, et les 5 jeux de pondérations testés.
- **Potentiel national** : environ 432 000 bouteilles, 780 000 € de chiffre d'affaires de cession et 300 000 € de contribution si les 291 salles privées sont équipées comme la salle type.
- **Préréglage « Grande salle »** du simulateur : 350 jours, 400 passages par jour, 3 % de prise, 300 € d'activation (deux frigos).
- **Marge de la salle** : environ 1,70 € par bouteille (revente à 3,50 € moins cession à 1,80 €).
- **Ordres de grandeur des indicateurs** : bouteilles par salle et par mois, coût par pratiquant touché.

### Contenus fictifs (badges « Exemple » et « Démo »)

- Les **salles partenaires** de la carte « Trouver une salle » et leur fiche : noms, adresses et horaires inventés. Aucune salle réelle n'est engagée.
- Les **3 profils de grimpeurs** (« Exemple de profil »).
- Les **compteurs One Giving** (« Chiffres de démonstration »).
- Le **QR code** et la vidéo de la voie du mois.
- Le **formulaire** « Devenir salle partenaire » : rien n'est envoyé ni enregistré. Au clic : « Démo : aucune donnée n'est envoyée. »

### Faits sourcés

| Chiffre ou fait                                                               | Source                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------ |
| 69 % des grimpeurs boivent un verre après leur séance                         | Observatoire de l'escalade 2026 (Union Sport & Cycle) |
| 291 salles privées (2025), 1 070 structures FFME                              | Observatoire de l'escalade 2026            |
| Critère « volume » de la matrice                                              | Insee, licences sportives 2025             |
| 2018 No.1 Living, 2024 One Living, Royaume-Uni : 2e kombucha en GMS, 3,4 M£, +38,4 % | The Grocer                          |
| Kombucha en France 6 M€ (2024), boissons fermentées en GMS 21,4 M€ (2025, près de +160 %) | IntoTheMinds                    |
| Ciao Kombucha, 23 M€                                                          | L'Essentiel de l'Éco                        |
| Présence chez Decathlon Pro, format 33 cl                                     | Decathlon Pro                              |
| 13,2 millions de pratiquants de running                                       | Observatoire du Running 2026 (marathons.com) |
| Pourquoi « probiotique » figure dans la colonne « On évite »                 | Foodinnov                                  |

Les liens complets sont dans `src/data/sources.ts` et dans la dernière section du Dossier.

## Choix et écarts à connaître avant la soutenance

1. **Seuil de rentabilité du running : 813 bouteilles**, et non 812. La formule du brief donne 650 € ÷ 0,80 € = 812,5, arrondi au supérieur : 813. Le site applique la formule. Les trois autres seuils sont identiques au brief (1 020, 188, 550).
2. **Les 5 jeux de pondérations de la note économique** ne sont pas détaillés dans le brief. Ceux du site sont définis par l'équipe, sur les 7 critères [volume, marge, coût d'activation, seuil, régularité, moment prouvé, potentiel national] : Nos poids [25, 20, 15, 15, 10, 10, 5], Poids égaux, Volume + [40, 15, 10, 10, 10, 10, 5], Rentabilité + [15, 30, 10, 25, 10, 5, 5], National + [20, 15, 10, 10, 10, 10, 25]. L'escalade est première dans les cinq. À ajuster dans `src/data/economics.ts` si l'équipe en a d'autres.
3. **Les shots** sont présentés par leurs parfums uniquement, comme demandé. Les parfums n'étant pas connus, le site affiche « Parfum à confirmer ». Leurs noms fonctionnels (énergie, immunité, microbiote) n'apparaissent nulle part : ce seraient des promesses santé.
4. **« L'alternative sans alcool » devient « l'alternative à la bière »** : la fermentation laisse des traces d'alcool, la FAQ l'explique. « Sans alcool, sans nuance » figure dans la colonne « On évite ».
5. **Jonny Wilkinson** est présenté de façon factuelle (champion du monde 2003, a parlé ouvertement de son anxiété), sans aucune citation, ni de lui ni de la marque.
6. **Couleurs de la bouteille** : le liquide garde une teinte réaliste pour chaque parfum ; la couleur de voie du parfum pilote l'étiquette, le bouchon et l'interface.
7. **Vérification des sources** : l'environnement de développement n'avait pas accès à Internet, les liens n'ont donc pas pu être rouverts. Les chiffres viennent du brief. À vérifier avant la soutenance : l'attribution des 291 salles privées et des 1 070 structures FFME à l'Observatoire de l'escalade (le brief ne précisait pas leur source), et les chiffres de marché d'IntoTheMinds.

## Mouvement réduit, mobile et performance

- **`prefers-reduced-motion`** : la 3D est remplacée par des visuels fixes, les animations et le défilement fluide sont coupés, les compteurs affichent directement leur valeur finale. Les visuels fixes (`public/fallback/`) sont rendus depuis les vraies scènes 3D ; ils servent aussi de fond pendant le chargement de la 3D. Pour les refaire, avec le site lancé :

  ```bash
  npm run fallbacks
  ```

  Options : `-- --url http://127.0.0.1:4173` pour viser la version de production, `-- --only paroi,salle,bouteille,voie` pour ne refaire qu'une partie.

- **Mobile** : version complète, 3D allégée (moins de particules, pas d'ombres portées ni de post-traitement), curseur personnalisé désactivé au toucher.
- **Performance** : chaque scène 3D s'arrête quand elle sort de l'écran, la résolution de la paroi s'adapte à la fluidité mesurée, la physique du mini-jeu ne se charge qu'en cours de partie. Objectif : 60 images par seconde sur un portable récent.

## Structure du projet

```
src/app             pages (Dossier, Campagne, 404), polices locales, styles globaux
src/components      dossier/, campagne/, layout/, modes/ (présentation, vidéo), ui/, three/ (scènes 3D, shaders GLSL)
src/data            chiffres, textes et sources : sports, économie, marché, sections, campagne
src/lib             calculs (matrice, modèle économique, formats français), testés avec Vitest
src/store           état partagé de l'interface et des outils
scripts             serveur local, captures Playwright, rendu des visuels fixes
public/brand        visuels de marque, à fournir
public/fallback     visuels fixes des scènes 3D
```

Tous les chiffres affichés viennent de `src/data/*.ts`. Les calculs (`src/lib/matrix.ts`, `src/lib/economics.ts`) sont vérifiés par 33 tests qui redonnent les valeurs du brief, à une exception près : le seuil du running (813 et non 812, voir plus haut).

## Vérifications

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run screens -- --url http://127.0.0.1:4173
```

`npm run screens` prend des captures Playwright à 1440 et 390 px de large, page par page, et relève les erreurs de la console (le site doit tourner).

Stack : Next.js 16 (App Router, export statique), TypeScript, Tailwind CSS 4, react-three-fiber, drei, postprocessing, shaders GLSL, GSAP et ScrollTrigger, Lenis, Framer Motion, @react-three/rapier, Zustand, Vitest, Playwright.
