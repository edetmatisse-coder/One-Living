import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import '../polices';
import { TAILLES } from '../tailles';

const POLICES = [
  '700 100px "Big Shoulders Display"',
  '800 100px "Big Shoulders Display"',
  '900 100px "Big Shoulders Display"',
  '400 40px "Instrument Sans"',
  '500 40px "Instrument Sans"',
  '600 40px "Instrument Sans"',
  '700 40px "Instrument Sans"',
  'italic 500 40px "Instrument Sans"',
];
const ECHANTILLON = 'AÀÂÉÈÊËÎÏÔÙÛÇŒaàâéèêëîïôùûçœ0123456789%°’·×?!';

/** Toutes les images utilisées (préchargées : masques et fonds CSS compris). */
export const IMAGES = [
  ...Object.keys(TAILLES).map((id) => staticFile(`produits/${id}.webp`)),
  staticFile('logo-one-living.png'),
  ...[0, 1, 2, 3, 4, 5].map((i) => staticFile(`textures/grain-${i}.png`)),
  staticFile('textures/encre.png'),
  staticFile('textures/craie.png'),
];

/** N'affiche la séquence qu'une fois polices et images chargées (rendu identique à chaque image). */
export const Porte: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender('Polices et images'));
  const [pret, setPret] = useState(false);
  useEffect(() => {
    let vivant = true;
    const polices = POLICES.map((p) => document.fonts.load(p, ECHANTILLON));
    const images = IMAGES.map(
      (src) =>
        new Promise<void>((ok) => {
          const i = new Image();
          i.onload = () => i.decode().then(() => ok(), () => ok());
          i.onerror = () => ok();
          i.src = src;
        }),
    );
    Promise.all([...polices, ...images]).then(() => vivant && setPret(true));
    return () => {
      vivant = false;
    };
  }, []);
  useEffect(() => {
    if (pret) continueRender(handle);
  }, [pret, handle]);
  return pret ? <>{children}</> : null;
};
