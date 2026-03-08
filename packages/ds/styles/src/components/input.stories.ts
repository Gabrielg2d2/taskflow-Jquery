import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "Components/Inputs/InputBase",
  render: (args) => `
    <div>
      <input 
        ${args.disabled ? "disabled" : ""}
        ${args.name ? "name=" + '"' + args.name + '"' : ""}
        ${args.value ? "value=" + '"' + args.value + '"' : ""}
        ${args.type ? "type=" + '"' + args.type + '"' : ""}
        ${args.placeholder ? "placeholder=" + '"' + args.placeholder + '"' : ""}

        ${args.error ? "class=" + '"' + "ds-input:base ds-input:error" + '"' : ""}
        ${args.class ? "class=" + '"' + args.class + '"' : ""}
        ${args.helperText ? "helperText=" + '"' + args.helperText + '"' : ""}
        ${args.HelperTextError ? "helperTextError=" + '"' + args.helperTextError + '"' : ""}
      />  
    </div>
  `,
  args: {
    placeholder: "Digite aqui...",
    type: "text",
    disabled: false,
    error: false,
    name: "input-story",
    value: "",
    class: "ds-input:base",
    helperText: "Este é um texto de ajuda",
    helperTextError: "Este é um texto de erro",
  },
  argTypes: {
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "search",
        "date",
        "time",
        "datetime-local",
        "month",
        "week",
      ],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    name: { control: "text" },
    value: { control: "text" },
    class: { control: "text" },
    helperText: { control: "text" },
    helperTextError: { control: "text" },
  },
} satisfies Meta;

export default meta;

export const Base: StoryObj = {
  args: {
    placeholder: "Digite aqui...",
    type: "text",
    disabled: false,
    error: "",
    name: "input-base",
    value: "",
    class: "ds-input:base",
  },
};

export const Error: StoryObj = {
  args: {
    name: "input-error",
    class: "ds-input:base ds-input:error",
  },
};

// Componente de input com label em JS puro - retorna HTMLElement
function createInput(props: Record<string, unknown>): HTMLElement {
  const container = document.createElement("div");
  container.className = "ds-vstack";

  if (props.label) {
    const label = document.createElement("label");
    label.className = "ds-input:label";
    label.htmlFor = String(props.name ?? "");
    label.textContent = String(props.label);
    container.appendChild(label);
  }

  const input = document.createElement("input");
  input.className = "ds-input:base";
  if (props.error) input.classList.add("ds-input:error");
  if (props.placeholder) input.setAttribute("placeholder", String(props.placeholder));
  if (props.type) input.setAttribute("type", String(props.type));
  if (props.name) input.setAttribute("name", String(props.name));
  if (props.value) input.setAttribute("value", String(props.value));
  if (props.disabled) input.setAttribute("disabled", "");
  container.appendChild(input);


  if(props.helperText) {
    const helperText = document.createElement("p");
    helperText.className = "ds-input:helper-text";
    helperText.textContent = String(props.helperText);
    container.appendChild(helperText);
  }
  
  if (props.error) {
    const err = document.createElement("p");
    err.className = "ds-input:error-message";
    err.textContent = String(props.helperTextError);
    container.appendChild(err);
  } 

  return container;
}

export const InputWithLabel: StoryObj = {
  render: (args) => createInput(args),
  args: {
    label: "Label",
    name: "input-with-label",
    class: "ds-input:base",
  },
};