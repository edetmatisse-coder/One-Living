import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DISPLAY, TEXTE } from '../theme';
import { mots } from '../timelines';
import { EASE_IN, POP, coup, lin, sp } from '../lib/temps';
import { Mots } from './Mots';

/**
 * Bandeau façon Konbini : chaque ligne s'ouvre de gauche à droite (léger
 * dépassement), le texte monte mot par mot, ombre dure (pas de flou : propre
 * sur fond vert). `sortie` : le bandeau repart vers la droite.
 */
export const Bande: React.FC<{
  lignes: string[];
  a: number;
  taille: number;
  fond: string;
  couleur: string;
  rot?: number;
  ombre?: string | null;
  sortie?: number | null;
  aligner?: 'gauche' | 'centre';
  decalage?: number;
  etiquette?: { texte: string; a: number; fond: string; couleur: string } | null;
  famille?: string;
  poids?: number;
}> = ({
  lignes,
  a,
  taille,
  fond,
  couleur,
  rot = 0,
  ombre = null,
  sortie = null,
  aligner = 'centre',
  decalage = 0,
  etiquette = null,
  famille = DISPLAY,
  poids = 900,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: aligner === 'centre' ? 'center' : 'flex-start',
        gap: Math.round(taille * 0.14),
        transform: `rotate(${rot}deg)`,
      }}
    >
      {lignes.map((l, i) => {
        const d = a + i * 4;
        const p = sp(frame, d, { damping: 13, stiffness: 270, mass: 0.6 });
        const s = sortie != null ? lin(frame, sortie + i * 2, sortie + i * 2 + 7, 0, 1, EASE_IN) : 0;
        const sx = Math.max(0, s > 0 ? 1 - s : p);
        const origine = s > 0 ? '100% 50%' : '0% 50%';
        const dx = (i % 2 === 0 ? -1 : 1) * decalage;
        return (
          <div key={i} style={{ position: 'relative', transform: `translateX(${dx}px)` }}>
            {ombre && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: ombre,
                  transform: `translate(${Math.round(taille * 0.09)}px, ${Math.round(taille * 0.1)}px) scaleX(${sx})`,
                  transformOrigin: origine,
                }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: fond, transform: `scaleX(${sx})`, transformOrigin: origine }} />
            <div
              style={{
                position: 'relative',
                padding: `${Math.round(taille * 0.12)}px ${Math.round(taille * 0.3)}px ${Math.round(taille * 0.05)}px`,
                opacity: s > 0.55 ? 0 : 1,
                transform: s > 0 ? `translateX(${s * taille * 0.6}px)` : undefined,
              }}
            >
              <Mots mots={mots(l)} a={d + 3} ecart={2} taille={taille} famille={famille} poids={poids} couleur={couleur} interligne={1} />
            </div>
            {i === 0 && etiquette && <Etiquette {...etiquette} sortie={sortie} taille={taille} />}
          </div>
        );
      })}
    </div>
  );
};

/** Petite étiquette posée en haut à gauche d'un bandeau (« QUESTION 1 »). */
const Etiquette: React.FC<{ texte: string; a: number; fond: string; couleur: string; sortie: number | null; taille: number }> = ({
  texte,
  a,
  fond,
  couleur,
  sortie,
  taille,
}) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const p = sp(frame, a, POP);
  const s = sortie != null ? lin(frame, sortie, sortie + 5, 0, 1, EASE_IN) : 0;
  const t = Math.round(taille * 0.27);
  return (
    <div
      style={{
        position: 'absolute',
        left: Math.round(taille * 0.12),
        top: 0,
        transform: `translateY(-78%) rotate(${-4 + (1 - p) * -20}deg) scale(${Math.max(0, p * (1 - s))})`,
        transformOrigin: '0% 100%',
        background: fond,
        color: couleur,
        fontFamily: TEXTE,
        fontWeight: 700,
        fontSize: t,
        letterSpacing: '0.12em',
        lineHeight: 1,
        padding: `${Math.round(t * 0.45)}px ${Math.round(t * 0.7)}px ${Math.round(t * 0.4)}px`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {texte}
    </div>
  );
};

/** Éclair blanc très bref sur un gros impact. */
export const Flash: React.FC<{ a: number; force?: number; couleur?: string }> = ({ a, force = 0.22, couleur = '#FFFFFF' }) => {
  const frame = useCurrentFrame();
  const o = force * coup(frame, a, 1.6);
  if (o < 0.01) return null;
  return <AbsoluteFill style={{ background: couleur, opacity: o, pointerEvents: 'none' }} />;
};
