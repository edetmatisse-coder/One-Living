# Après la voie · One Living × B'Wall

Maquette du site de la campagne « Après la voie » : les boissons One Living au bar des salles d'escalade B'Wall (Quimper, Lorient, Vannes). Cobranding One Living × B'Wall, partenariat imaginé pour le projet.
Challenge Bachelor 3, WIN Sport School, problématique 2 : développer One Living dans le sport amateur, hors rugby.

**Projet étudiant WIN Sport School, non affilié à One Living ni à B'Wall.** Maquette non officielle : en local pour la soutenance, et en ligne sur GitHub Pages.

Une seule page, de haut en bas : le haut de page (la bouteille 3D devant une paroi B'Wall, les quatre parfums qui défilent), un bandeau One Living × B'Wall, le concept en 3 temps (avec le chiffre clé : 69 % des grimpeurs boivent un verre après leur séance), la gamme en 3D (à faire tourner au glisser), l'histoire de la marque, les salles B'Wall, la voie du mois, trois buveurs de kombucha, l'offre aux salles et la FAQ.

## Lancer le site

Prérequis : Node.js 20.9 ou plus récent, et npm. Toutes les commandes se lancent **dans le dossier du projet** (celui qui contient `package.json`).

```bash
npm install
```

### Pour présenter

```bash
npm run build
```

```bash
npm run start
```

Puis ouvrir http://localhost:4173 dans Chrome ou Edge. Laisser la fenêtre de commande ouverte pendant la présentation (`Ctrl+C` pour arrêter). `npm run present` fait les deux et ouvre le navigateur.

Le site complet est exporté dans `out/` : pages, scripts, polices, images. Il marche sans connexion. Il faut juste ce petit serveur local : ne pas ouvrir `out/index.html` par double-clic.

### Pour modifier le site

```bash
npm run dev
```

Puis ouvrir http://localhost:3000 : les modifications s'affichent tout de suite.

## Le site en ligne

https://edetmatisse-coder.github.io/One-Living/

GitHub republie le site tout seul à chaque push sur la branche `claude/loving-goodall-iiro2p`, en 2 minutes environ (à suivre dans l'onglet Actions, « Mise en ligne (GitHub Pages) »). En ligne, le pied de page dit « maquette non officielle » au lieu de « présentation locale ».

- Première mise en ligne : sur GitHub, Settings → Pages → Source : « GitHub Actions ».
- Pour retirer le site (après la soutenance, par exemple) : Settings → Pages → « Unpublish site ».

## Ta photo du haut de page

Le haut de page attend une photo de la bouteille dans une salle d'escalade. Tant qu'elle manque, la bouteille en 3D s'affiche devant une photo floutée de la paroi de B'Wall Lorient, et les quatre parfums défilent.

1. Nommer la photo `photo-salle.jpg` (ou `.png`, `.webp`).
2. La déposer dans le dossier `public/brand/`.
3. Relancer `npm run build` puis `npm run start`.
4. Pour le site en ligne : sur GitHub, ouvrir le dossier `public/brand/`, « Add file » → « Upload files », déposer la photo, puis « Commit changes ». Le site en ligne se met à jour en 2 minutes environ.

Conseils : une photo en largeur (paysage), d'au moins 2000 pixels de large. Le titre se pose sur la gauche de l'image, assombrie en dégradé : placer la bouteille plutôt à droite.

## Les visuels

| Fichier | Contenu | État |
| --- | --- | --- |
| `public/brand/logo-one-living.png` | Logo One Living | Repris de oneliving.com |
| `public/brand/produits/` | Photos et étiquettes des 10 boissons, photo du fondateur | Repris de oneliving.com |
| `public/brand/photo-salle.jpg` | Photo du haut de page | **À fournir** |
| `public/brand/logo-win.png` | Logo WIN Sport School (pied de page) | **À fournir**, un emplacement propre s'affiche en attendant |
| `public/brand/logo-bwall.png` | Logo B'Wall blanc, sans signature (en-tête, pied de page, salles) | Repris de b-wall.fr |
| `public/brand/bwall/` | Logo B'Wall couleur, pictogramme, photos des salles (paroi du haut de page, les 3 temps, voie du mois, bar de Vannes, fiches) | Repris de b-wall.fr |

Les photos et les étiquettes appartiennent à One Living, les logos et les photos de salles à B'Wall ; ils ne servent qu'à cette maquette étudiante, en local et en ligne.

### La gamme en 3D

Les dix boissons de la gamme réelle (oneliving.com) :

- **Bouteille en verre 33 cl**, kombucha bio : gingembre-curcuma, framboise-grenade, passion-goji, mangue-citron vert.
- **Canette 25 cl**, kombucha sans sucres : gingembre-curcuma, framboise-grenade, passion-goji.
- **Shot 10 cl** : tropical, fraise-citron, agrumes-gingembre.

Chaque modèle 3D est construit à partir des photos produits du site : la silhouette mesurée donne la forme exacte du contenant, et l'étiquette est « déroulée » à plat puis réenroulée sur le modèle. Le script `scripts/extract-products.py` (Python 3, Pillow, numpy) refait ce travail à partir des photos ; ses résultats sont déjà dans le projet.

Le dos : le site de One Living ne montre que la face des produits. Le dos des bouteilles bio reprend donc leur fiche de dégustation (oneliving.com), posée sur l'étiquette noire ; les canettes et les shots sont imprimés recto verso (le même visuel au dos). On le voit en faisant tourner la boisson au glisser.

## Ce qui est hypothétique ou fictif

- **Salles B'Wall** : ce sont de vraies salles. Adresses, horaires, chiffres clés et photos viennent du site officiel [b-wall.fr](https://www.b-wall.fr/contact/). Le partenariat est imaginé (B'Wall n'est pas engagé, chaque fiche et le bandeau du haut le disent) ; le frigo, les boissons proposées et la voie du mois sont des exemples.
- **Trois buveurs de kombucha** (Claire, Malik, Inès) : profils inventés, marqués « Exemple de profil ».
- **Marge de la salle**, environ 1,38 € HT par bouteille (revente à 3,50 € TTC, soit 3,18 € HT avec la TVA à 10 % sur place, moins cession à 1,80 € HT), soit environ 2 000 € HT par an pour la salle type de 150 passages par jour : hypothèses de travail, marquées « Hypothèse », à confirmer avec One Living.
- **Formulaire** « Devenir salle partenaire » : démo, rien n'est envoyé. Au clic : « Démo : aucune donnée n'est envoyée. »
- **QR code** et vidéo de la voie du mois : démo.

## À savoir avant la soutenance

1. **B'Wall est une vraie enseigne, et le site est cobrandé One Living × B'Wall** (logos, couleurs, photos des salles) : c'est un partenaire visé, pas un accord signé. Le bandeau du haut et chaque fiche de salle le précisent ; le dire aussi à l'oral.
2. **Aucune promesse santé dans les textes du site.** Les shots sont présentés par leur parfum (tropical, fraise-citron, agrumes-gingembre), jamais par leur nom commercial.
3. **Les vraies étiquettes, elles, restent lisibles sur les modèles 3D et les photos.** Sur les shots, on lit « Energy », « Gut », « Immunity », « 1BN live cultures », « Gut health & wellbeing » ; sur les canettes, « Sugar free ». Ce sont les mentions de la marque, pas les nôtres, mais un jury attentif peut le relever.
4. **« L'alternative sans alcool » est devenue « l'alternative à la bière »** : la fermentation laisse des traces d'alcool, la FAQ l'explique.
5. **Jonny Wilkinson** est présenté de façon factuelle (champion du monde 2003, a parlé ouvertement de son anxiété), sans aucune citation, ni de lui ni de la marque.
6. **Le dos des boissons est une reconstitution** : fiche de dégustation de la marque pour les bouteilles, recto verso pour les canettes et les shots. Les vrais dos (ingrédients, valeurs nutritionnelles) ne sont pas publiés sur oneliving.com.
7. Le Dossier interactif (matrice des 16 sports, simulateur), le mini-jeu, One Giving et les modes présentation et vidéo ont été retirés. Ils restent dans l'historique Git (commit `9450b59`) si besoin.
8. **La version en ligne est publique** : toute personne qui a le lien la voit. Les logos et les photos appartiennent à One Living et à B'Wall, et le pied de page dit « maquette non officielle ». La retirer après la soutenance si besoin (voir « Le site en ligne »).

## Mouvement réduit et mobile

- Si l'option « Réduire les animations » est activée sur l'ordinateur, la 3D est remplacée par les photos des produits et les animations sont coupées. Pour retrouver la 3D malgré l'option : ajouter `?motion=full` à l'adresse.
- Sur mobile, la page est complète et la 3D est allégée.
- Paramètres d'adresse utiles : `?quality=low` (3D allégée), `?3d=off` (sans 3D), `?motion=reduce` (force le mouvement réduit).

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
npm run screens
```

`npm run screens` prend des captures à 1440 et 390 px de large (le site doit tourner).

Stack : Next.js 16 (export statique), TypeScript, Tailwind CSS 4, react-three-fiber et drei, shaders GLSL, Lenis, Zustand, Vitest, Playwright.
