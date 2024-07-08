// App.tsx
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigation from "./stacks/AppNavigation";
import { AuthProvider } from "./contexts/AuthContext";
import AuthInitializer from "./contexts/AuthInitializer";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthInitializer>
        <PaperProvider>
          <AppNavigation />
        </PaperProvider>
      </AuthInitializer>
    </AuthProvider>
  );
};

export default App;
