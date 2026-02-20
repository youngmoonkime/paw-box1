import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";

interface LoginModalProps {
  onClose?: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { loginWithCredential } = useAuth();
  const [error, setError] = useState("");

  const handleSuccess = (response: { credential?: string }) => {
    if (response.credential) {
      loginWithCredential(response.credential);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 상단 그라디언트 헤더 */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur mb-4">
            <span className="text-white text-4xl">🐾</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Paw-Box</h2>
          <p className="text-orange-100 text-sm">반려동물을 위한 AI 맞춤 집 설계 서비스</p>
        </div>

        {/* 로그인 영역 */}
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-1">시작하기</h3>
            <p className="text-stone-500 text-sm">
              구글 계정으로 로그인하면<br />
              AI 분석, 쇼케이스, 조립 가이드를 이용할 수 있습니다
            </p>
          </div>

          {/* 서비스 혜택 */}
          <div className="w-full bg-stone-50 rounded-xl p-4 space-y-3">
            {[
              { icon: "🤖", text: "AI로 반려동물 크기 자동 분석" },
              { icon: "📐", text: "맞춤형 SVG 박스 도면 생성" },
              { icon: "🛠️", text: "단계별 조립 가이드 제공" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* 구글 로그인 버튼 */}
          <div className="w-full flex flex-col items-center gap-3">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("로그인에 실패했습니다. 다시 시도해 주세요.")}
              width="368"
              text="signin_with"
              shape="pill"
              useOneTap
            />
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
          </div>

          <p className="text-xs text-stone-400 text-center">
            로그인 시{" "}
            <a href="#" className="text-primary hover:underline">이용약관</a>
            {" "}및{" "}
            <a href="#" className="text-primary hover:underline">개인정보처리방침</a>
            에 동의하는 것으로 간주됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
