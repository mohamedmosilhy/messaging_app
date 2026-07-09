"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleSubmit } from "../actions/registerClient";

export const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

          const registerMessage = await handleSubmit(formData);

          if (registerMessage.success) {
            setFormData({
              username: "",
              email: "",
              password: "",
            });
            router.push("/login");
          } else if (registerMessage.errors) {
            setError(registerMessage.errors);
          } else {
            setError({
              general:
                registerMessage.message ||
                "An error occurred. Please try again.",
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
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="border ml-2 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.username && (
          <p className="text-red-500 text-sm mt-1">{error.username}</p>
        )}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border ml-2 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.email && (
          <p className="text-red-500 text-sm mt-1">{error.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="border ml-2 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.password && (
          <p className="text-red-500 text-sm mt-1">{error.password}</p>
        )}
      </div>
      {error.general && <p className="text-red-500 text-sm">{error.general}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        Register
      </button>
    </form>
  );
};
