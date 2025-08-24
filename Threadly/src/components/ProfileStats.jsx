import React from "react";
import { Badge } from "./ui/Badge";
import {
  TrendingUp,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Calendar,
  Award,
  Users,
} from "lucide-react";

export default function ProfileStats({ stats }) {
  const statItems = [
    {
      label: "Karma",
      value: stats.karma,
      icon: Award,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Posts",
      value: stats.posts,
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Comments",
      value: stats.comments,
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Views",
      value: stats.totalViews || "12.4k",
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Profile Stats
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="text-center p-4 rounded-lg bg-accent/50 border border-border"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Additional stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">
                Member Since
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(stats.joinDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">
                Contributions
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.posts + stats.comments} total
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">
                Activity
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.posts > 0 ? "Active" : "New Member"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
