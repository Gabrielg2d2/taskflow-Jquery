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

// Componente de input com label em js puro
function createInput(props: any) {
  const container = document.createElement("div");
  const input = document.createElement("input");
  const label = props.label ? document.createElement("label") : null;
  const error = props.error ? document.createElement("p") : null;+

  // init styles
  container.classList.add("ds-vstack");
  input.classList.add("ds-input:base");

  console.log(props);

  if (label) {
    label.setAttribute("for", props.name);
    label.textContent = props.label;
    container.appendChild(label);
  }

  // add input to container
  container.appendChild(input);

  if (error) {
    input.classList.add("ds-input:error");
    error.classList.add("ds-input:error-message");
    container.appendChild(error);
  }else {
    input.classList.remove("ds-input:error");
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