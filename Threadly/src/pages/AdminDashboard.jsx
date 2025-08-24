import React from "react";
import { Button } from "../components/ui/button";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-2xl font-bold text-primary">1,234</p>
          <p className="text-sm text-muted-foreground">
            Total registered users
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Threads</h3>
          <p className="text-2xl font-bold text-primary">567</p>
          <p className="text-sm text-muted-foreground">Total threads created</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Replies</h3>
          <p className="text-2xl font-bold text-primary">2,890</p>
          <p className="text-sm text-muted-foreground">Total replies posted</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button>Manage Users</Button>
          <Button variant="outline">View Reports</Button>
          <Button variant="outline">System Settings</Button>
        </div>
      </div>
    </div>
  );
}
