import { InputBase, InputBaseProps } from "../InputBase/index.js";

export function InputText(props: InputBaseProps) {

  return InputBase({
    ...props,
    type: "text"
  });
}