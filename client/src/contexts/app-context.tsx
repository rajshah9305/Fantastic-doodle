import { createContext, useContext, useReducer, ReactNode } from "react";

interface App {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppState {
  apps: App[];
  currentApp: App | null;
  isLoading: boolean;
}

type AppAction =
  | { type: "SET_APPS"; payload: App[] }
  | { type: "SET_CURRENT_APP"; payload: App | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_APP"; payload: App }
  | { type: "UPDATE_APP"; payload: App }
  | { type: "DELETE_APP"; payload: string };

const initialState: AppState = {
  apps: [],
  currentApp: null,
  isLoading: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_APPS":
      return { ...state, apps: action.payload };
    case "SET_CURRENT_APP":
      return { ...state, currentApp: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "ADD_APP":
      return { ...state, apps: [...state.apps, action.payload] };
    case "UPDATE_APP":
      return {
        ...state,
        apps: state.apps.map(app =>
          app.id === action.payload.id ? action.payload : app
        ),
        currentApp:
          state.currentApp?.id === action.payload.id
            ? action.payload
            : state.currentApp,
      };
    case "DELETE_APP":
      return {
        ...state,
        apps: state.apps.filter(app => app.id !== action.payload),
        currentApp:
          state.currentApp?.id === action.payload ? null : state.currentApp,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
