import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";
import { XCircle, RefreshCw, Server } from "lucide-react";
import { API_CONFIG } from "../config/apiConfig";

const ServerError = ({ onRetry }) => {
  const [checking, setChecking] = useState(false);

  const handleRetry = async () => {
    setChecking(true);
    if (onRetry) {
      await onRetry();
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <Server className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Server Offline</h1>
          <p className="text-muted-foreground mb-4">
            Cannot connect to the Threadly server. Please check if the server is running.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">Connection Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Backend server is not reachable
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            disabled={checking}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "Retry Connection"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/status"}
            className="w-full"
          >
            Check Server Status
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Make sure the backend server is running
        </div>
      </Card>
    </div>
  );
};

export default ServerError;