'use client';

import { Amplify } from 'aws-amplify';
import {
  signUp as amplifySignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession as amplifyFetchAuthSession,
} from 'aws-amplify/auth';

const isConfigured =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

if (isConfigured) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        },
      },
    },
    { ssr: true }
  );
}

export async function signUp(email: string, password: string) {
  return amplifySignUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function confirmSignUp(email: string, code: string) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code });
}

export async function signIn(email: string, password: string) {
  return amplifySignIn({ username: email, password });
}

export async function signOut() {
  return amplifySignOut();
}

export async function getCurrentUser() {
  return amplifyGetCurrentUser();
}

export async function fetchAuthSession() {
  return amplifyFetchAuthSession();
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await amplifyFetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
