import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**'],
  },
  {
    rules: {
      // Les scènes R3F utilisent des props three.js non reconnues par le plugin React.
      'react/no-unknown-property': 'off',
    },
  },
];

export default config;
