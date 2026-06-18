"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Sparkles, Info, AlertTriangle, CheckCircle } from "lucide-react";
import * as motion from "framer-motion/client";

export function AnnouncementBanner() {
  const activeAnnouncements = useQuery(api.announcements.getActive);
  const [dismissedId, setDismissedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const dismissed = localStorage.getItem("dismissed_announcement");
    if (dismissed) setDismissedId(dismissed);
  }, []);

  if (!activeAnnouncements || activeAnnouncements.length === 0) return null;

  const announcement = activeAnnouncements[0];

  if (dismissedId === announcement._id) return null;

  const handleDismiss = () => {
    localStorage.setItem("dismissed_announcement", announcement._id);
    setDismissedId(announcement._id);
  };

  const getStyle = () => {
    switch (announcement.type) {
      case "new_feature": return "bg-indigo-600 text-white border-indigo-700";
      case "warning": return "bg-amber-500 text-white border-amber-600";
      case "success": return "bg-emerald-500 text-white border-emerald-600";
      default: return "bg-indigo-500 text-white border-indigo-600";
    }
  };

  const getIcon = () => {
    switch (announcement.type) {
      case "new_feature": return <Sparkles className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "success": return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: "auto", opacity: 1 }} 
      className={`border-b px-4 py-2 flex items-center justify-between text-sm shadow-md z-50 relative ${getStyle()}`}
    >
      <div className="flex items-center gap-2 flex-1 justify-center">
        {getIcon()}
        <span className="font-semibold">{announcement.title}:</span>
        <span>{announcement.content}</span>
      </div>
      <button 
        onClick={handleDismiss} 
        className="p-1 hover:bg-white/20 rounded-md transition-colors shrink-0"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
