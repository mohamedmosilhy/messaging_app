"use client";

import { AtSign, LoaderCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/app/components/ui/input-group";
import { handleSubmit } from "../actions/registerClient";
import { RegisterValidation } from "../schemas/register.schema";
import { PasswordField } from "./PasswordField";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const parsed = RegisterValidation.safeParse(formData);

    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0] ?? "general"),
            issue.message,
          ]),
        ),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      const result = await handleSubmit(parsed.data);

      if (result.success) {
        router.push("/login?registered=1");
        return;
      }

      setErrors(
        result.errors ?? {
          general: result.message || "Unable to create your account.",
        },
      );
    } catch {
      setErrors({
        general: "Unable to create your account right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <InputGroup className="h-11 bg-background/55">
            <InputGroupAddon>
              <AtSign aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-invalid={Boolean(errors.username)}
              autoComplete="username"
              autoFocus
              id="username"
              name="username"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              placeholder="your_username"
              value={formData.username}
            />
          </InputGroup>
          <FieldDescription>
            3–20 letters, numbers, or underscores.
          </FieldDescription>
          <FieldError>{errors.username}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <InputGroup className="h-11 bg-background/55">
            <InputGroupAddon>
              <Mail aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="email"
              name="email"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="you@example.com"
              type="email"
              value={formData.email}
            />
          </InputGroup>
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordField
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            id="password"
            name="password"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Create a secure password"
            value={formData.password}
          />
          <FieldDescription>
            At least 8 characters with a letter and number.
          </FieldDescription>
          <FieldError>{errors.password}</FieldError>
        </Field>

        {errors.general ? (
          <div
            className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {errors.general}
          </div>
        ) : null}

        <Button className="h-11 w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : null}
          {isSubmitting ? "Creating account" : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  );
}
