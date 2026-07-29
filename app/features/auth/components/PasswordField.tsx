"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/app/components/ui/input-group";

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type"
>;

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup className="h-11 bg-background/55">
      <InputGroupAddon>
        <LockKeyhole aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput type={isVisible ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((value) => !value)}
          size="icon-xs"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
