import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Search, 
  TrendingUp, 
  Briefcase, 
  LogOut,
  Bell,
  Newspaper
} from "lucide-react";

const routePaths = [
  { path: "/dashboard/overview", pathName: "Overview", icon: <LayoutDashboard size={20} /> },
  { path: "/dashboard/coin-price", pathName: "Coin Price", icon: <CircleDollarSign size={20} /> },
  { path: "/dashboard/Search-Coins", pathName: "Search Coins", icon: <Search size={20} /> },
  { path: "/dashboard/portfolio", pathName: "Portfolio", icon: <Briefcase size={20} /> },
  { path: "/dashboard/alerts", pathName: "Alerts", icon: <Bell size={20} /> },
  { path: "/dashboard/news", pathName: "News", icon: <Newspaper size={20} /> },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage token
    localStorage.removeItem("token"); // Assuming 'token' is used
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <section className="bg-[#161616] h-full flex flex-col p-6 border-r border-white/5">
      {/* Sidebar Header / Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-xl rotate-45"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Crypto Dash</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {routePaths.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-orange-600/10 text-orange-500" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              <span className={isActive ? "text-orange-500" : "text-gray-500 group-hover:text-gray-300"}>
                {route.icon}
              </span>
              <span className="font-medium text-sm">{route.pathName}</span>
              
              {/* Active Indicator (The orange dot/line from the image) */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: User / Log Out */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm cursor-pointer">Log out</span>
        </button>
      </div>
    </section>
  );
}

export default Sidebar;
