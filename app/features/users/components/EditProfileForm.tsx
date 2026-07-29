"use client";

import { Check, LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Button } from "@/app/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { submitEditProfile } from "../actions/editClient";
import { EditProfileValidation } from "../schemas/editProfile.schema";

type ProfileFormData = {
  displayName: string;
  bio: string;
  avatarUrl: string;
};

type EditProfileFormProps = {
  user: ProfileFormData & {
    email: string;
    username: string;
  };
};

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const initialData: ProfileFormData = {
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
  const [savedData, setSavedData] = useState(initialData);
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(savedData) && !isSubmitting;

  function updateField(name: keyof ProfileFormData, value: string) {
    setSaved(false);
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDirty) return;

    const parsed = EditProfileValidation.safeParse(formData);

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
      setSaved(false);
      setErrors({});
      const result = await submitEditProfile(parsed.data);

      if (!result.success) {
        setErrors(
          result.errors ?? {
            general: result.message || "Could not save your profile.",
          },
        );
        return;
      }

      const nextData = {
        displayName: result.data.displayName,
        bio: result.data.bio ?? "",
        avatarUrl: result.data.avatarUrl ?? "",
      };
      setFormData(nextData);
      setSavedData(nextData);
      await update(nextData);
      setSaved(true);
      router.refresh();
    } catch {
      setErrors({ general: "Could not save your profile. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setFormData(savedData);
    setErrors({});
    setSaved(false);
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/8 bg-background/45 p-5 text-center">
            <UserAvatar
              className="mx-auto size-24 ring-4 ring-primary/10"
              name={formData.displayName || user.username}
              src={formData.avatarUrl}
            />
            <p className="mt-4 truncate font-semibold">
              {formData.displayName || user.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Account email
            </p>
            <p className="mt-1 truncate text-sm">{user.email}</p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Email and username changes are not available in this version.
            </p>
          </div>
        </aside>

        <FieldGroup>
          <Field data-invalid={Boolean(errors.displayName)}>
            <FieldLabel htmlFor="displayName">Display name</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.displayName)}
              autoComplete="name"
              className="h-11 bg-background/55"
              id="displayName"
              maxLength={50}
              name="displayName"
              onChange={(event) =>
                updateField("displayName", event.target.value)
              }
              value={formData.displayName}
            />
            <FieldDescription>
              The name people see in conversations and search.
            </FieldDescription>
            <FieldError>{errors.displayName}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.bio)}>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formData.bio.length}/160
              </span>
            </div>
            <Textarea
              aria-invalid={Boolean(errors.bio)}
              className="min-h-28 resize-none bg-background/55"
              id="bio"
              maxLength={160}
              name="bio"
              onChange={(event) => updateField("bio", event.target.value)}
              placeholder="Share a little about yourself"
              value={formData.bio}
            />
            <FieldError>{errors.bio}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.avatarUrl)}>
            <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.avatarUrl)}
              className="h-11 bg-background/55"
              id="avatarUrl"
              name="avatarUrl"
              onChange={(event) => updateField("avatarUrl", event.target.value)}
              placeholder="https://example.com/avatar.jpg"
              type="url"
              value={formData.avatarUrl}
            />
            <FieldDescription>
              Leave blank to use your initials. Broken images fall back safely.
            </FieldDescription>
            <FieldError>{errors.avatarUrl}</FieldError>
          </Field>

          {errors.general ? (
            <div
              className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {errors.general}
            </div>
          ) : null}

          {saved ? (
            <div
              className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-sm text-primary"
              role="status"
            >
              <Check aria-hidden="true" className="size-4" />
              Profile saved. Your navigation and future messages are updated.
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={!isDirty}
              onClick={reset}
              type="button"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
            <Button disabled={!isDirty || isSubmitting} type="submit">
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {isSubmitting ? "Saving changes" : "Save changes"}
            </Button>
          </div>
        </FieldGroup>
      </div>
    </form>
  );
}
