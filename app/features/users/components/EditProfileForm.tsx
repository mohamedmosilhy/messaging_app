"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitEditProfile } from "../actions/editClient";

export function EditProfileForm({
  user,
}: {
  user: { displayName: string; bio: string | null; avatarUrl: string | null };
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={async (e) => {
        try {
          e.preventDefault();
          if (isSubmitting) return;
          setIsSubmitting(true);
          setError({});

          const editResult = await submitEditProfile(formData);

          if (editResult.success) {
            setFormData({
              displayName: "",
              bio: "",
              avatarUrl: "",
            });
            router.push("/dashboard");
          } else if (editResult.errors) {
            setError({
              ...editResult.errors,
            });
          } else {
            setError({
              general:
                editResult.message || "An error occurred. Please try again.",
            });
          }
        } catch (error) {
          setError({ general: "An error occurred. Please try again." });
        } finally {
          setIsSubmitting(false);
        }
      }}
      className="flex flex-col gap-4 "
    >
      <div>
        <label htmlFor="displayName">Display Name</label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="border ml-2 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.displayName && (
          <p className="text-red-500 text-sm mt-1">{error.displayName}</p>
        )}
      </div>
      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="border ml-2 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.bio && <p className="text-red-500 text-sm mt-1">{error.bio}</p>}
      </div>
      <div>
        <label htmlFor="avatarUrl">Avatar URL</label>
        <input
          type="text"
          id="avatarUrl"
          name="avatarUrl"
          value={formData.avatarUrl}
          onChange={handleChange}
          className="border ml-2 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.avatarUrl && (
          <p className="text-red-500 text-sm mt-1">{error.avatarUrl}</p>
        )}
      </div>
      {error.general && <p className="text-red-500 text-sm">{error.general}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        Edit Profile
      </button>
    </form>
  );
}
