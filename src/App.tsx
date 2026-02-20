/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import ShowcasePage from "./components/ShowcasePage";
import AssemblyGuidePage from "./components/AssemblyGuidePage";
import LoginModal from "./components/LoginModal";
import { type ReactNode } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/** 로그인이 필요한 라우트: 미로그인 시 홈으로 리다이렉트 + 모달 표시 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navigate to="/" replace />
        <LoginModal />
      </>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route
                path="showcase"
                element={
                  <ProtectedRoute>
                    <ShowcasePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="assembly"
                element={
                  <ProtectedRoute>
                    <AssemblyGuidePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
