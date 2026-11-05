import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // motion/ : les séquences vidéo (projet Remotion à part, avec son propre tsconfig)
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**', 'motion/**'],
  },
  {
    rules: {
      // Les scènes R3F utilisent des props three.js non reconnues par le plugin React.
      'react/no-unknown-property': 'off',
    },
  },
  {
    // Dans une boucle useFrame, on modifie volontairement les objets three.js
    // (uniformes, matériaux) créés une fois : c'est le modèle de R3F.
    files: ['src/components/three/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      // les refs de callback (ref={setter}) servent à piloter les maillages image par image
      'react-hooks/refs': 'off',
    },
  },
];

export default config;
