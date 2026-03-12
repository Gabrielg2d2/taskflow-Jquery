import type { Preview } from "@storybook/html";
import "../src/styles/index.css";
import { initArbitraryStyles } from "../src/utils/arbitrary-styles";

initArbitraryStyles();

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
