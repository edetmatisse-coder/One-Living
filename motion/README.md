# Après la voie · motion design de la vidéo pitch

Les séquences animées de la vidéo pitch « Après la voie » (One Living × escalade, Challenge Bachelor 3, WIN Sport School), au style des vidéos Konbini. Tout est prêt à glisser dans la timeline de CapCut.

Ce dossier est séparé du site : il a ses propres réglages et ses propres dépendances, et il ne change rien au site.

## Les fichiers à importer

Tout est dans `motion/out/`. Format : 1920 × 1080, 30 images par seconde, H.264, sans son. Les mêmes fichiers en vertical (1080 × 1920, pour les réseaux sociaux) sont dans `motion/out/vertical/`, avec les mêmes noms.

| Fichier | Contenu | Durée |
| --- | --- | --- |
| `01_marque.mp4` | La marque : logo, Jonny Wilkinson, 2003, bio / fermenté / vivant / bien frais, les 4 parfums, les shots, One Giving | 25 s |
| `02_entonnoir.mp4` | 16 sports, puis 4, puis ESCALADE plein écran | 6 s |
| `03_69.mp4` | 69 % des grimpeurs boivent un verre après leur séance, avec la source | 4 s |
| `04_questions/question1_….mp4` à `question5_….mp4` | Les 5 questions de l'interview, bandeau jaune, **fond vert** | 3 s chacune |
| `04_questions/question1_….png` à `question5_….png` | Les mêmes questions, **fond transparent** | image fixe |
| `05_bandeaux/carton_interview-imaginee.mp4` / `.png` | « Interview imaginée, rôle joué par un étudiant », en petit | 3 s |
| `05_bandeaux/bandeau-nom_<prénom>.mp4` / `.png` | Bandeau nominatif bas d'écran, un par prénom de l'équipe : garder celui de l'étudiant qui joue l'employé | 5 s |
| `06_final.mp4` | APRÈS LA VOIE., trait de magnésie, l'équipe, la mention du projet | 5 s |
| `07_titre.mp4` | COMMENT ONE LIVING PEUT SORTIR DU RUGBY ? (facultatif, juste après l'accroche) | 3 s |
| `previews/` | Planches contact (une image toutes les 0,5 s), pour vérifier d'un coup d'œil | |
| `bruitages.md` | La feuille de bruitages (aussi plus bas) | |

## Dans CapCut

### Importer

1. Créer un projet au format 16:9 (ou 9:16 pour la version verticale), 30 images par seconde.
2. Glisser les fichiers de `out/` (ou de `out/vertical/`) dans le panneau des médias, puis dans la timeline, à leur place dans le montage.
3. Les séquences 01, 02, 03, 06 et 07 sont des plans plein écran : elles se posent sur la piste principale, entre les plans filmés.

### Les questions et les bandeaux : incrustation chroma

Les questions (04) et les bandeaux (05) se posent **au-dessus** de l'interview filmée, sur une piste du dessus.

1. Glisser le fichier MP4 sur la piste au-dessus de l'interview, au moment de la question.
2. Le sélectionner, puis dans le panneau de droite : **Vidéo → Supprimer l'arrière-plan → Incrustation chroma** (« Chroma key »).
3. Avec la pipette, cliquer sur le vert du fond.
4. Monter l'**Intensité** jusqu'à ce que le vert disparaisse (vers 20 à 40), puis un peu d'**Ombre** si un liseré vert reste sur les bords.

Le fond est un vert pur (`#00FF00`), sans dégradé ni flou : il se détoure proprement. Le jaune des questions n'a rien à voir avec ce vert, il ne part pas avec.

**Plus simple encore :** les PNG transparents (même nom que la vidéo) se posent directement au-dessus de l'image, sans incrustation. Ce sont des images fixes (la question entièrement affichée) : régler leur durée dans la timeline.

### Le son

Les fichiers sont muets : la voix off et la musique se posent dans CapCut. La feuille de bruitages, plus bas, donne la seconde exacte de chaque son.

## Changer les timings et les textes

Tout se règle dans **`motion/config.ts`** : durées, moments clés et textes. Pas besoin de toucher au reste.

- Ouvrir `config.ts` avec un éditeur de texte (VS Code, Notepad++, ou même le Bloc-notes).
- Les moments sont en **secondes**, comptés depuis le début de chaque séquence. Exemple : `{ texte: 'FERMENTÉ', a: 6.8 }` veut dire que le tampon FERMENTÉ claque à 6,8 s.
- Pour caler sur la voix off : écouter la voix off dans CapCut, noter la seconde où chaque mot est dit, la reporter dans `config.ts`.
- Les nombres s'écrivent avec un point : `4.5` et pas `4,5`. Garder les guillemets autour des textes.
- Les espaces avant `?`, `!`, `:` et `%` deviennent insécables tout seuls : un « ? » ne part jamais seul à la ligne.

Ensuite, relancer le rendu (voir ci-dessous) : les animations, et la feuille de bruitages, suivent toutes seules.

### Relancer le rendu

Prérequis : Node.js 20.9 ou plus récent (le même que pour le site). Toutes les commandes se lancent **dans le dossier `motion/`**.

Une seule fois, pour installer Remotion :

```bash
npm install
```

Pour voir les séquences et tester un réglage en direct, dans le navigateur (chaque modification de `config.ts` s'affiche tout de suite) :

```bash
npm run studio
```

Pour refaire tous les fichiers de `out/` (MP4, PNG, planches contact) :

```bash
npm run rendu
```

Pour refaire une seule séquence, par exemple la 01 :

```bash
npm run rendu -- 01
```

Pour seulement l'horizontal (`--h`) ou seulement le vertical (`--v`) :

```bash
npm run rendu -- 04 --h
```

Pour refaire la feuille de bruitages après un changement de timing :

```bash
npm run bruitages
```

Bon à savoir :

- Au premier rendu, Remotion télécharge un navigateur de rendu (environ 100 Mo) : il faut une connexion internet cette fois-là.
- Compter environ 1 minute 30 pour la séquence 01 sur un ordinateur portable récent, quelques secondes pour les questions et les bandeaux.
- Les planches contact (`out/previews/`) demandent ffmpeg : sans lui, elles sont simplement sautées.

<!-- debut bruitages : section régénérée par npm run bruitages -->
<!-- fin bruitages -->

## Ce qui est réel, ce qui ne l'est pas

- **Bouteilles et shots :** détourés à partir des photos produits de oneliving.com (`scripts/detourage.py`). Le logo One Living est celui du site, agrandi avec des bords nets. Photos et logo appartiennent à One Living ; ils ne servent qu'à ce projet étudiant.
- **Étiquettes des shots :** on y lit « Energy », « Gut », « Immunity », « Daily super shot ». Ce sont les mentions de la marque, pas les nôtres, mais un jury attentif peut le relever (même remarque que pour le site).
- **One Giving :** oneliving.com indique que chaque boisson vendue finance une association de santé mentale proche de l'équipe One Living. La phrase de la séquence 01 reprend ce fait, sans promesse santé sur la boisson.
- **« 1-4 °C » :** je ne l'ai pas trouvé sur oneliving.com (le site dit seulement « Best served chilled », à boire bien frais). À vérifier sur une étiquette, ou à changer dans `config.ts`.
- **Jonny Wilkinson :** son nom seulement, en texte. Aucune photo, aucune citation.
- **69 % :** Observatoire de l'escalade 2026, Union Sport & Cycle (la même source que sur le site).
- **Interview :** imaginée, rôle joué par un étudiant ; le carton et le bandeau nominatif le disent.
- **Noms de l'équipe :** dans `config.ts`, orthographe à vérifier avant le rendu final.

**Attention aux réponses de l'interview :** les textes des séquences ne font aucune promesse santé. Dans la réponse à « Les bienfaits du kombucha ? », éviter « probiotique », « récupération », « bon pour le microbiote » ou « améliore le mental » : parler plutôt du goût, de la fraîcheur, de la fermentation et du moment partagé après la séance.

## Le style, en bref

- **Typo :** Big Shoulders Display 800 à 900 pour les titres, Instrument Sans pour les textes courts. Installées en local (paquets `@fontsource`) : le rendu ne dépend d'aucune connexion.
- **Couleurs :** fond anthracite `#1B1916` avec un grain léger animé, texte blanc magnésie `#F3EFE8`, jaune `#F2B705` pour les questions, et les couleurs des voies pour les parfums (jaune gingembre-curcuma, rose `#E64980` framboise-grenade, bleu `#5C7CFA` passion-goji, orange `#FD7E14` mangue-citron vert).
- **Animations :** mots qui montent derrière un masque avec un léger rebond, chiffres qui défilent et claquent avec un flou de bougé, secousse de caméra à chaque impact, tampons encreurs, volets de couleur plein écran, bouteilles qui entrent inclinées en 3D avec un reflet qui balaie le verre, bulles de fermentation et poussière de magnésie en fond, stickers (pastilles, flèches et soulignés au feutre, trait de magnésie).
- **Rythme :** un temps fort toutes les 12 à 18 images, aucun plan immobile plus d'une seconde, chaque texte reste assez longtemps pour être lu.
- **Intensité :** dans `config.ts`, `EFFETS` règle la secousse, le grain et les particules (1 = réglage d'origine, 0 = coupé).

## Pour aller plus loin

- `src/sequences/` : une séquence par fichier. `src/composants/` : les briques (tampon, volet, bouteille, compteur, stickers…). `src/timelines.ts` : les moments clés calculés depuis `config.ts`, lus par les animations et par la feuille de bruitages.
- `scripts/detourage.py` refait les détourages et le logo, `scripts/textures.py` refait le grain et les textures (Python 3, Pillow, numpy). Leurs résultats sont déjà dans `public/`.
- Remotion est gratuit pour les particuliers et les petites équipes (licence : [remotion.dev/license](https://www.remotion.dev/license)).
