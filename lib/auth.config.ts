import type { NextAuthConfig } from 'next-auth';

// Minimal auth config safe to import in Edge middleware (no Node.js-only modules).
export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      const isLoginPage = request.nextUrl.pathname === '/admin/login';
      if (isAdminRoute && !isLoginPage) return !!auth;
      return true;
    },
  },
};
