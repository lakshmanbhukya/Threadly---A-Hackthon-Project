import { useEffect, useState } from "react";

const LoadingScreen = ({ message = "Loading..." }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Threadly</h2>
        <p className="text-muted-foreground">
          {message}{dots}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;