import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import LoginModal from "./LoginModal";

export default function Layout() {
  const location = useLocation();
  const isDark = location.pathname.includes("assembly") || location.pathname.includes("showcase");
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className={cn("min-h-screen flex flex-col font-sans antialiased", isDark ? "dark bg-background-dark text-slate-100" : "bg-background-light text-slate-900")}>
      <header className={cn("sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300", 
        isDark ? "border-border-dark bg-background-dark/80" : "border-stone-200 bg-white/80")}>
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className={cn("flex size-8 items-center justify-center rounded transition-colors", isDark ? "bg-primary/10 text-primary" : "text-primary")}>
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">pets</span>
            </div>
            <h1 className={cn("text-lg font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
              PAW-BOX <span className={cn("text-xs font-normal ml-1 opacity-60", isDark ? "text-slate-400" : "text-slate-500")}>{location.pathname === "/" ? "" : location.pathname.includes("showcase") ? "SHOWCASE" : "ASSEMBLY"}</span>
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-primary", location.pathname === "/" && "text-primary", isDark ? "text-slate-400 hover:text-white" : "text-slate-600")}>홈</Link>
            <Link to="/showcase" className={cn("text-sm font-medium transition-colors hover:text-primary", location.pathname === "/showcase" && "text-primary", isDark ? "text-slate-400 hover:text-white" : "text-slate-600")}>쇼케이스</Link>
            <Link to="/assembly" className={cn("text-sm font-medium transition-colors hover:text-primary", location.pathname === "/assembly" && "text-primary", isDark ? "text-slate-400 hover:text-white" : "text-slate-600")}>조립 가이드</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* 로그인 상태 */}
                <span className={cn("hidden md:block text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>
                  {user.given_name}님
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="size-9 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-colors focus:outline-none"
                  >
                    <img
                      alt={user.name}
                      src={user.picture}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                  {showProfileMenu && (
                    <>
                      {/* 클릭 외부 닫기 */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <div className={cn(
                        "absolute right-0 top-11 z-50 w-56 rounded-xl shadow-xl border overflow-hidden",
                        isDark ? "bg-surface-dark border-border-dark" : "bg-white border-stone-200"
                      )}>
                        <div className={cn("px-4 py-3 border-b", isDark ? "border-border-dark" : "border-stone-100")}>
                          <p className={cn("font-bold text-sm truncate", isDark ? "text-white" : "text-slate-900")}>{user.name}</p>
                          <p className={cn("text-xs truncate", isDark ? "text-slate-400" : "text-stone-500")}>{user.email}</p>
                        </div>
                        <button
                          onClick={() => { logout(); setShowProfileMenu(false); }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2",
                            isDark ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-700 hover:bg-stone-50 hover:text-red-600"
                          )}
                        >
                          <span className="text-base">🚪</span>
                          로그아웃
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 비로그인 상태 */}
                <button
                  onClick={() => setShowLogin(true)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold shadow-lg transition-all hover:scale-105",
                    isDark ? "bg-primary text-white shadow-primary/20 hover:shadow-primary/40" : "bg-primary text-white hover:bg-primary-dark shadow-orange-500/20"
                  )}
                >
                  🔑 &nbsp;구글 로그인
                </button>
                <div className={cn("size-8 rounded-full flex items-center justify-center overflow-hidden border", isDark ? "bg-surface-dark border-border-dark" : "bg-stone-200 border-stone-300")}>
                  <span className="text-lg">👤</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className={cn("border-t py-12 transition-colors duration-300", isDark ? "bg-background-dark border-border-dark" : "bg-white border-stone-200")}>
        <div className="mx-auto max-w-[1600px] px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-primary size-6 flex items-center justify-center">
                  <span className="material-symbols-outlined">pets</span>
                </div>
                <h2 className={cn("text-lg font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>Paw-Box</h2>
              </div>
              <p className={cn("text-sm mb-6", isDark ? "text-slate-500" : "text-stone-500")}>지속 가능한 AI 맞춤형 반려동물 집 설계 서비스</p>
              <div className="flex gap-4">
                <a href="#" className={cn("hover:text-primary transition-colors", isDark ? "text-slate-500" : "text-stone-400")}><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
                <a href="#" className={cn("hover:text-primary transition-colors", isDark ? "text-slate-500" : "text-stone-400")}><span className="sr-only">Instagram</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.53c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fillRule="evenodd"></path></svg></a>
              </div>
            </div>
            
            {[
              { title: "서비스", links: ["이용 방법", "쇼케이스", "재료 안내", "가격"] },
              { title: "회사", links: ["소개", "지속가능성", "채용", "문의"] }
            ].map((col) => (
              <div key={col.title}>
                <h3 className={cn("font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>{col.title}</h3>
                <ul className={cn("space-y-2 text-sm", isDark ? "text-slate-400" : "text-stone-600")}>
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className={cn("font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>뉴스레터</h3>
              <p className={cn("text-sm mb-4", isDark ? "text-slate-500" : "text-stone-500")}>DIY 팁과 새로운 기능을 받아보세요.</p>
              <form className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="이메일 입력" 
                  className={cn("flex-1 rounded-lg text-sm focus:border-primary focus:ring-primary p-2 border", 
                    isDark ? "bg-surface-dark border-border-dark text-white placeholder:text-slate-600" : "bg-stone-50 border-stone-200 text-slate-900")}
                />
                <button className="bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 font-bold text-sm transition-colors">
                  구독
                </button>
              </form>
            </div>
          </div>

          <div className={cn("border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4", isDark ? "border-border-dark" : "border-stone-100")}>
            <p className={cn("text-xs", isDark ? "text-slate-500" : "text-stone-400")}>© 2024 Paw-Box. All rights reserved.</p>
            <div className={cn("flex gap-6 text-xs", isDark ? "text-slate-500" : "text-stone-400")}>
              <a href="#" className="hover:text-primary">개인정보처리방침</a>
              <a href="#" className="hover:text-primary">이용약관</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 로그인 모달 */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
