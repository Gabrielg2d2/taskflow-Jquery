import type { Preview } from "@storybook/html";
import "../src/styles/tokens.css";
import "../src/styles/globals.css";
import "../src/styles/utilities";


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
