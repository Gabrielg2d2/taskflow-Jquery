# @taskflow/design-system

Design System do TaskFlow. Componentes, tokens e utilitários compartilhados.

## Estrutura

```
design-system/
├── src/
│   ├── index.ts
│   ├── dom/h.ts
│   ├── components/
│   │   ├── DSButton.ts
│   │   └── DSInput.ts
│   └── styles/
│       ├── input.css   # entrada Tailwind
│       └── tokens.css  # CSS variables (tema/tokens)
└── .storybook/
```

## Scripts

- `npm run build` – Build do pacote (JS/TS + CSS)
- `npm run dev` – Watch mode para desenvolvimento
- `npm run storybook` – Inicia Storybook na porta 6006
- `npm run build-storybook` – Build estático do Storybook

## Uso

```ts
import { DSButton, DSInput, h } from "@taskflow/design-system";
import "@taskflow/design-system/styles.css";  // opcional se já importar em seu app
```
