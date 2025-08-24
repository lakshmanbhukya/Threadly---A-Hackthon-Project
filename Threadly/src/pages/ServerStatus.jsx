import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { API_CONFIG } from "../config/apiConfig";
import axios from "axios";

const ServerStatus = () => {
  const [status, setStatus] = useState({
    server: "checking",
    database: "checking",
    lastChecked: null,
    error: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setLoading(true);
    const newStatus = {
      server: "checking",
      database: "checking",
      lastChecked: new Date(),
      error: null
    };

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        newStatus.server = "online";
        newStatus.database = "online";
      }
    } catch (error) {
      newStatus.server = "offline";
      newStatus.database = "offline";
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        newStatus.error = "Server is not running";
      } else if (error.code === 'ECONNREFUSED') {
        newStatus.error = "Connection refused - Server is not running";
      } else if (error.code === 'ENOTFOUND') {
        newStatus.error = "Server hostname not found";
      } else if (error.code === 'ETIMEDOUT') {
        newStatus.error = "Connection timeout";
      } else {
        newStatus.error = "Server Error";
      }
    }

    setStatus(newStatus);
    setLoading(false);
  };



  const getStatusIcon = (serviceStatus) => {
    switch (serviceStatus) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "offline":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "checking":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (serviceStatus) => {
    switch (serviceStatus) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case "offline":
        return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      case "checking":
        return <Badge className="bg-yellow-100 text-yellow-800">Checking...</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Server Status</h1>
        <p className="text-gray-600">Check the current status of Threadly services</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Service Status</h2>
          <Button
            onClick={checkServerStatus}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.server)}
              <div>
                <h3 className="font-medium">API Server</h3>
                <p className="text-sm text-gray-600">Backend API</p>
              </div>
            </div>
            {getStatusBadge(status.server)}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.database)}
              <div>
                <h3 className="font-medium">Database Connection</h3>
                <p className="text-sm text-gray-600">MongoDB Atlas</p>
              </div>
            </div>
            {getStatusBadge(status.database)}
          </div>
        </div>

        {status.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">Error Details:</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{status.error}</p>
          </div>
        )}

        {status.lastChecked && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-500 text-center">
            Last checked: {status.lastChecked.toLocaleString()}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Environment:</span>
            <span className="font-mono">{import.meta.env.MODE}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-mono">1.0.0</span>
          </div>
        </div>
      </Card>

      <div className="text-center mt-6">
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default ServerStatus;