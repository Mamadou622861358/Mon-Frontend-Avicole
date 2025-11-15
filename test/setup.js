import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock des icônes Lucide React
vi.mock("lucide-react", () => ({
  Home: () => "Home",
  Package: () => "Package",
  ShoppingCart: () => "ShoppingCart",
  User: () => "User",
  Users: () => "Users",
  Search: () => "Search",
  Filter: () => "Filter",
  Eye: () => "Eye",
  EyeOff: () => "EyeOff",
  Lock: () => "Lock",
  Mail: () => "Mail",
  Phone: () => "Phone",
  MapPin: () => "MapPin",
  Trash2: () => "Trash2",
  Plus: () => "Plus",
  Minus: () => "Minus",
  CheckCircle: () => "CheckCircle",
  XCircle: () => "XCircle",
  AlertCircle: () => "AlertCircle",
  Info: () => "Info",
  X: () => "X",
}));

// Mock de react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
  };
});

// Configuration globale des tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

