# Après la voie · motion design de la vidéo pitch

Les séquences animées de la vidéo pitch « Après la voie » (One Living × escalade, Challenge Bachelor 3, WIN Sport School), au style des vidéos Konbini. Tout est prêt à glisser dans la timeline de CapCut.

Ce dossier est séparé du site : il a ses propres réglages et ses propres dépendances, et il ne change rien au site.

## Les fichiers à importer

Tout est dans `motion/out/`. Format : 1920 × 1080, 30 images par seconde, H.264, sans son (sauf `08_intro_interview_alpha.mov` : ProRes 4444 avec transparence). Les mêmes fichiers en vertical (1080 × 1920, pour les réseaux sociaux) sont dans `motion/out/vertical/`, avec les mêmes noms.

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
| `08_intro_interview.mp4` | L'intro de l'interview, **fond plein** : bandes aux couleurs des voies, ON A POSÉ 5 QUESTIONS, l'invité, les 5 questions en rafale | 4 s |
| `08_intro_interview_alpha.mov` | La même en ProRes 4444 **avec transparence** : l'entrée et la sortie se posent par-dessus la marque et l'interview | 4 s |
| `08_intro_interview_vert.mp4` | La même sur **fond vert** `#00FF00` (« vert » = la couleur, pas le format vertical), si l'alpha ne passe pas dans CapCut | 4 s |
| `previews/` | Planches contact (une image toutes les 0,5 s, toutes les 0,25 s pour la 08), pour vérifier d'un coup d'œil | |
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

### L'intro de l'interview (08) : la poser entre la marque et l'interview

L'intro dure 4 s : ses bandes recouvrent la dernière 0,4 s de la vidéo de la marque, elle est opaque de 0,4 à 3,4 s, puis ses bandes repartent et dévoilent l'interview, dessous.

1. Sur la piste principale : la vidéo de la marque, puis l'interview, collée juste après.
2. Glisser `08_intro_interview_alpha.mov` sur la piste du dessus, en le faisant commencer **0,4 s avant la fin de la vidéo de la marque** (12 images avant, sur le repère de CapCut).
3. L'intro cache alors les 3 premières secondes de l'interview : garder 3 s de marge au début du plan d'interview (l'employé qui s'installe, avant la première réponse). Ces 3 s sont sous l'intro ; à la sortie des bandes, l'interview est déjà lancée.
4. Lire le raccord : à l'entrée, on doit voir la fin de la marque entre les bandes ; à la sortie, l'interview apparaître derrière la bande bleue.

Si CapCut affiche du noir à la place de la transparence, prendre `08_intro_interview_vert.mp4` au même endroit, puis l'incrustation chroma (Vidéo → Supprimer l'arrière-plan → Incrustation chroma, pipette sur le vert, comme pour les questions). La version `08_intro_interview.mp4`, à fond plein, se pose comme un plan normal, en coupe franche.

Le prénom affiché est « MATISSE » (`introInterview.prenom` dans `config.ts`) : pour le changer, modifier cette valeur puis relancer `npm run rendu -- 08` (les 3 versions, horizontal et vertical, en une minute environ). Dans l'interview, le bandeau nominatif qui va avec est `05_bandeaux/bandeau-nom_matisse.mp4`.

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
## Feuille de bruitages

Les moments sont comptés depuis le début de chaque fichier. Dans CapCut, si le clip ne commence pas à 0, ajoute sa position dans la timeline. Le repère se lit minutes:secondes:images (30 images par seconde).

Sons à chercher dans la bibliothèque de CapCut (Audio → Effets sonores) :

- **Whoosh** : chercher « whoosh », « swoosh »
- **Pop** : chercher « pop », « bubble pop »
- **Tampon** : chercher « stamp », « tampon »
- **Ouverture de bouteille** : chercher « bottle open », « soda open »
- **Impact** : chercher « impact », « hit », « boom »
- **Compteur qui défile** : chercher « counter », « ticking »
- **Feutre** : chercher « marker », « scribble »
- **Souffle** : chercher « air », « breath », « powder »
- **Clics rapides** : chercher « typewriter », « click »
- **Tic rapide** : chercher « tick », « clock tick »

Conseil : baisser les whoosh et les clics à 40-60 % du volume de la voix off, garder les impacts et les tampons un peu plus forts.

### 01_marque.mp4

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,00 s | 00:00:00 | Whoosh | le logo tombe |
| 0,30 s | 00:00:09 | Impact | le logo touche le sol |
| 0,63 s | 00:00:19 | Pop | petit rebond du logo |
| 0,95 s | 00:00:29 | Pop | pastille « LE KOMBUCHA » |
| 1,47 s | 00:01:14 | Whoosh | « FONDÉ PAR JONNY WILKINSON », mot par mot (whoosh léger) |
| 2,27 s | 00:02:08 | Feutre | souligné au feutre sous le nom |
| 3,00 s | 00:03:00 | Whoosh | volet jaune |
| 3,17 s à 4,87 s | 00:03:05 | Compteur qui défile | le compteur défile jusqu'à 2003 |
| 3,25 s | 00:03:08 | Whoosh | bandeau « CHAMPION DU MONDE DE RUGBY » |
| 4,87 s | 00:04:26 | Impact | 2003 se pose |
| 6,00 s | 00:06:00 | Whoosh | volet aux 4 couleurs |
| 6,25 s | 00:06:08 | Tampon | tampon « BIO » |
| 6,80 s | 00:06:24 | Tampon | tampon « FERMENTÉ » |
| 7,35 s | 00:07:11 | Tampon | tampon « VIVANT » |
| 7,90 s | 00:07:27 | Tampon | tampon « BIEN FRAIS » |
| 8,40 s | 00:08:12 | Souffle | l'écran se couvre de buée (souffle froid) |
| 8,70 s | 00:08:21 | Pop | pastille « 1-4 °C » |
| 10,00 s | 00:10:00 | Whoosh | volet jaune, gingembre-curcuma |
| 10,53 s | 00:10:16 | Ouverture de bouteille | la bouteille se pose (ouverture de bouteille, « pschitt ») |
| 11,53 s | 00:11:16 | Pop | pastille « gingembre-curcuma » (pop léger) |
| 12,00 s | 00:12:00 | Whoosh | volet rose, framboise-grenade |
| 12,53 s | 00:12:16 | Pop | la bouteille se pose |
| 13,53 s | 00:13:16 | Pop | pastille « framboise-grenade » (pop léger) |
| 14,00 s | 00:14:00 | Whoosh | volet bleu, passion-goji |
| 14,53 s | 00:14:16 | Pop | la bouteille se pose |
| 15,53 s | 00:15:16 | Pop | pastille « passion-goji » (pop léger) |
| 16,00 s | 00:16:00 | Whoosh | volet orange, mangue-citron vert |
| 16,53 s | 00:16:16 | Pop | la bouteille se pose |
| 17,53 s | 00:17:16 | Pop | pastille « mangue-citron vert » (pop léger) |
| 18,00 s | 00:18:00 | Whoosh | volet anthracite |
| 18,37 s | 00:18:11 | Ouverture de bouteille | premier shot (ouverture, « pschitt » court) |
| 18,53 s | 00:18:16 | Pop | shot 2 |
| 18,70 s | 00:18:21 | Pop | shot 3 |
| 18,97 s | 00:18:29 | Whoosh | « AVANT LA SÉANCE » |
| 19,60 s | 00:19:18 | Pop | pastille « 10 cl » |
| 20,13 s | 00:20:04 | Pop | les 3 shots font un petit saut (3 pops légers, facultatif) |
| 21,00 s | 00:21:00 | Whoosh | volet magnésie (vers le haut) |
| 21,80 s | 00:21:24 | Impact | « ONE GIVING » complet |
| 21,97 s | 00:21:29 | Pop | cœur dessiné |
| 22,00 s | 00:22:00 | Whoosh | la phrase monte (whoosh léger) |
| 23,27 s | 00:23:08 | Feutre | souligné au feutre « santé mentale. » |
| 24,00 s | 00:24:00 | Pop | le cœur bat une fois (pop léger) |

### 02_entonnoir.mp4

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,00 s | 00:00:00 | Whoosh | les 16 noms arrivent |
| 0,35 s | 00:00:11 | Impact | le compteur « 16 » |
| 1,35 s à 2,23 s | 00:01:11 | Clics rapides | 12 noms barrés au feutre (rafale de clics, ou feutre) |
| 2,30 s | 00:02:09 | Pop | il en reste 4 |
| 3,30 s | 00:03:09 | Whoosh | « Running / trail » tombe |
| 3,40 s | 00:03:12 | Whoosh | « Yoga » tombe |
| 3,50 s | 00:03:15 | Whoosh | « Football » tombe |
| 3,87 s | 00:03:26 | Whoosh | ESCALADE remplit l’écran |
| 4,20 s | 00:04:06 | Impact | écran jaune |
| 4,27 s | 00:04:08 | Pop | pastille « 1 » |
| 4,60 s | 00:04:18 | Feutre | souligné sous ESCALADE |

### 03_69.mp4

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,10 s à 1,17 s | 00:00:03 | Compteur qui défile | le compteur file de 0 à 69 |
| 1,17 s | 00:01:05 | Impact | 69 se pose |
| 1,30 s | 00:01:09 | Impact | le « % » claque (impact + whoosh court) |
| 1,50 s | 00:01:15 | Whoosh | la phrase monte (whoosh léger) |
| 2,47 s | 00:02:14 | Feutre | souligné au feutre « après leur séance » |

### 04_questions (les 5 questions, mêmes moments)

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,00 s | 00:00:00 | Whoosh | le bandeau jaune s’ouvre |
| 0,13 s | 00:00:04 | Pop | étiquette « QUESTION n » |
| 2,70 s | 00:02:21 | Whoosh | le bandeau repart |

### 05_bandeaux : carton « Interview imaginée »

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,00 s | 00:00:00 | Whoosh | le carton glisse (whoosh très doux, facultatif) |
| 2,70 s | 00:02:21 | Whoosh | le carton repart (facultatif) |

### 05_bandeaux : bandeau nominatif (Jeanelle, Matisse, Aïna, Benois)

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,00 s | 00:00:00 | Whoosh | le bandeau nominatif entre |
| 4,67 s | 00:04:20 | Whoosh | le bandeau sort |

### 06_final.mp4

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,10 s à 0,83 s | 00:00:03 | Clics rapides | « APRÈS LA VOIE. » lettre par lettre (clics rapides) |
| 0,90 s | 00:00:27 | Impact | le point final |
| 1,05 s | 00:01:02 | Souffle | trait de magnésie (frottement de craie, souffle de poudre) |
| 1,80 s | 00:01:24 | Pop | Jeanelle LE MAREC |
| 1,93 s | 00:01:28 | Pop | Matisse EDET |
| 2,07 s | 00:02:02 | Pop | Aïna GOUARIN |
| 2,20 s | 00:02:06 | Pop | Benois LE BIHAN |
| 2,60 s | 00:02:18 | Whoosh | mention du projet (whoosh très doux) |

### 07_titre.mp4

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,10 s à 1,20 s | 00:00:03 | Clics rapides | les lettres claquent une à une (machine à écrire rapide) |
| 1,27 s | 00:01:08 | Impact | la question est complète |
| 1,47 s | 00:01:14 | Feutre | souligné sous la dernière ligne |

### 08_intro_interview (les trois versions : plein, alpha, vert)

| Moment | Repère CapCut | Son | Sur quoi |
| --- | --- | --- | --- |
| 0,00 s | 00:00:00 | Whoosh | bande jaune (entrée) |
| 0,07 s | 00:00:02 | Whoosh | bande rose (entrée) |
| 0,13 s | 00:00:04 | Whoosh | bande bleue (entrée) |
| 0,57 s | 00:00:17 | Impact | « ON A » |
| 0,77 s | 00:00:23 | Impact | « POSÉ » |
| 1,00 s | 00:01:00 | Impact | « 5 QUESTIONS » |
| 1,63 s | 00:01:19 | Pop | le logo One Living |
| 2,40 s | 00:02:12 | Tic rapide | question 1/5 |
| 2,60 s | 00:02:18 | Tic rapide | question 2/5 |
| 2,80 s | 00:02:24 | Tic rapide | question 3/5 |
| 3,00 s | 00:03:00 | Tic rapide | question 4/5 |
| 3,20 s | 00:03:06 | Tic rapide | question 5/5 |
| 3,40 s | 00:03:12 | Whoosh | les bandes repartent (sortie) |
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

## Contrôle qualité

Chaque séquence a été vérifiée sur sa planche contact (une image toutes les 0,5 s, dans `out/previews/`), en horizontal et en vertical, puis corrigée en deux tours :

- **01 :** logo plus grand et mieux placé, tampons plus grands, buée moins grise avec plus de gouttes, pied des bouteilles visible, noms géants qui défilent plus vite, mots courts répétés (GOJI GOJI GOJI) pour rester lisibles de part et d'autre de la bouteille, pastille du nom exact de chaque parfum, petit saut des shots et cœur qui bat (un temps fort là où l'image respirait trop longtemps), reflet ralenti pour qu'il se voie, phrase One Giving équilibrée sans mot seul en fin de ligne.
- **02 :** ESCALADE remplit vraiment l'écran, la pastille « 1 » ne touche plus le mot, le compteur descend quand le nom tombe réellement, un nom barré reste lisible avant de disparaître, vertical recentré.
- **03 :** compteur et phrase recentrés, « après leur séance » toujours ensemble sous son souligné.
- **04 :** bandeaux plus grands, lignes équilibrées en vertical, « One Living » jamais coupé en deux, PNG réellement transparents.
- **05 :** bandeau nominatif plus lisible et remonté en vertical (hors de la zone des sous-titres des réseaux sociaux).
- **06 et 07 :** groupe recentré, noms de l'équipe plus grands, lettres qui claquent sans déborder sur la ligne d'au-dessus.
- **08 :** les bandes partent dès la première image, le zoom de chaque mot se pose net pile sur l'impact (le flash blanc tombe sur un « 5 QUESTIONS » lisible), pastille « rôle joué » écartée du logo, questions plus grandes ; en vertical, pastille déplacée et rôle plus lisible. ProRes allégé : environ 34 Mo au lieu de 179 Mo pour 4 s, sans perte visible.

## Pour aller plus loin

- `src/sequences/` : une séquence par fichier. `src/composants/` : les briques (tampon, volet, bouteille, compteur, stickers…). `src/timelines.ts` : les moments clés calculés depuis `config.ts`, lus par les animations et par la feuille de bruitages.
- `scripts/detourage.py` refait les détourages et le logo, `scripts/textures.py` refait le grain et les textures (Python 3, Pillow, numpy). Leurs résultats sont déjà dans `public/`.
- Remotion est gratuit pour les particuliers et les petites équipes (licence : [remotion.dev/license](https://www.remotion.dev/license)).
