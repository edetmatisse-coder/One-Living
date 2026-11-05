import React from 'react';
import { Composition, Folder } from 'remotion';
import { IMAGES_PAR_SECONDE as FPS, bandeaux, questions } from '../config';
import { tCarton, tEntonnoir, tFinal, tMarque, tNom, tQuestion, tSoixanteNeuf, tTitre } from './timelines';
import { slug } from './slug';
import { Marque } from './sequences/Marque';
import { Entonnoir } from './sequences/Entonnoir';
import { SoixanteNeuf } from './sequences/SoixanteNeuf';
import { BandeauNom, Carton, Question } from './sequences/Incrustations';
import { Final } from './sequences/Final';
import { Titre } from './sequences/Titre';

const FORMATS = [
  { suffixe: 'h', width: 1920, height: 1080 },
  { suffixe: 'v', width: 1080, height: 1920 },
] as const;

/** Toutes les séquences, en horizontal (-h, 1920×1080) et en vertical (-v, 1080×1920). */
export const Racine: React.FC = () => (
  <>
    <Folder name="s01-marque">
      {FORMATS.map((f) => (
        <Composition key={f.suffixe} id={`marque-${f.suffixe}`} component={Marque} durationInFrames={tMarque().total} fps={FPS} width={f.width} height={f.height} />
      ))}
    </Folder>
    <Folder name="s02-entonnoir">
      {FORMATS.map((f) => (
        <Composition key={f.suffixe} id={`entonnoir-${f.suffixe}`} component={Entonnoir} durationInFrames={tEntonnoir().total} fps={FPS} width={f.width} height={f.height} />
      ))}
    </Folder>
    <Folder name="s03-chiffre">
      {FORMATS.map((f) => (
        <Composition key={f.suffixe} id={`chiffre69-${f.suffixe}`} component={SoixanteNeuf} durationInFrames={tSoixanteNeuf().total} fps={FPS} width={f.width} height={f.height} />
      ))}
    </Folder>
    <Folder name="s04-questions">
      {questions.liste.map((_, i) =>
        FORMATS.map((f) => (
          <Composition
            key={`${i}${f.suffixe}`}
            id={`question${i + 1}-${f.suffixe}`}
            component={Question}
            defaultProps={{ index: i, transparent: false }}
            durationInFrames={tQuestion().total}
            fps={FPS}
            width={f.width}
            height={f.height}
          />
        )),
      )}
    </Folder>
    <Folder name="s05-bandeaux">
      {FORMATS.map((f) => (
        <Composition
          key={`carton${f.suffixe}`}
          id={`carton-${f.suffixe}`}
          component={Carton}
          defaultProps={{ transparent: false }}
          durationInFrames={tCarton().total}
          fps={FPS}
          width={f.width}
          height={f.height}
        />
      ))}
      {bandeaux.nom.prenoms.map((p) =>
        FORMATS.map((f) => (
          <Composition
            key={`${p}${f.suffixe}`}
            id={`nom-${slug(p)}-${f.suffixe}`}
            component={BandeauNom}
            defaultProps={{ prenom: p, transparent: false }}
            durationInFrames={tNom().total}
            fps={FPS}
            width={f.width}
            height={f.height}
          />
        )),
      )}
    </Folder>
    <Folder name="s06-final">
      {FORMATS.map((f) => (
        <Composition key={f.suffixe} id={`final-${f.suffixe}`} component={Final} durationInFrames={tFinal().total} fps={FPS} width={f.width} height={f.height} />
      ))}
    </Folder>
    <Folder name="s07-titre">
      {FORMATS.map((f) => (
        <Composition key={f.suffixe} id={`titre-${f.suffixe}`} component={Titre} durationInFrames={tTitre().total} fps={FPS} width={f.width} height={f.height} />
      ))}
    </Folder>
  </>
);
