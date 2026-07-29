"use client";

import { LoaderCircle, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/app/components/ui/input-group";
import { LoginValidation } from "../schemas/login.schema";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const parsed = LoginValidation.safeParse(formData);

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
      const result = await signIn("credentials", {
        ...parsed.data,
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          general: "The email or password you entered is incorrect.",
        });
        return;
      }

      router.replace("/dashboard/conversations");
      router.refresh();
    } catch {
      setErrors({ general: "Unable to sign in right now. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <InputGroup className="h-11 bg-background/55">
            <InputGroupAddon>
              <Mail aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              autoFocus
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
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Enter your password"
            value={formData.password}
          />
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
          {isSubmitting ? "Signing in" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
