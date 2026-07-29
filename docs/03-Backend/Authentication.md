# Authentication

## Current implementation

I use Auth.js with the credentials provider and JWT session strategy.

```text
Credentials form
  -> Auth.js authorize
  -> Zod login schema
  -> verifyCredentials
  -> bcrypt comparison
  -> JWT callback
  -> session callback
```

## Registration

Registration is a custom route rather than an Auth.js provider action.

Validation rules include:

- username uses letters, numbers, and underscores;
- username length is 3–20;
- email must be valid;
- password length is at least eight;
- password includes a letter and number;
- unknown body fields are rejected.

The service lowercases email and username, hashes the password using bcrypt, and
uses database uniqueness as final race protection.

## Login

The credentials authorize callback:

1. verifies primitive input types;
2. runs `LoginValidation`;
3. calls `verifyCredentials`;
4. returns `null` for expected invalid credentials;
5. lets unexpected failures propagate.

The service intentionally does not reveal whether the email or password was
incorrect.

## JWT and session content

On login, the JWT stores:

- user ID;
- username;
- display name;
- bio;
- avatar URL.

The session callback copies those values to `session.user`. Type augmentation
is defined in the auth feature.

After a successful profile edit, the client calls the Auth.js session update
method with the returned display name, bio, and avatar URL. The JWT callback
handles the `update` trigger, changes those token fields, and the refreshed
server layout immediately receives the new identity.

## Authorization helper

`requireCurrentUserId` calls `auth()` and throws `UnauthorizedError` when no
session exists. Services reuse it instead of duplicating session logic.

## Protected pages

The shared protected route layout calls `auth()` once and redirects missing
sessions to `/login`. The API and service layers continue protecting sensitive
data independently.

## Current issues and recommendations

### Login error UX

Login errors persist until the user changes input or resubmits. Expected
credential failures use generic copy so the form does not reveal which field
was incorrect.

### Rate limiting

Add limits for registration and login before public deployment. Consider
per-IP and per-identity controls without leaking account existence.

### Session policy

Document:

- session lifetime;
- token renewal;
- secret configuration;
- behavior after account deletion or credential change;
- global handling for an expired client session.

### Security

- Keep password hashes out of every response.
- Use HTTPS in production.
- Never commit auth/database secrets.
- Review CSRF/cookie behavior through Auth.js defaults and deployment settings.
- Log authentication failures safely without logging passwords.
