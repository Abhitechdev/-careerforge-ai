"use client";

import * as React from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Users, Plus, MoreHorizontal, XCircle, Sparkles, Send } from "lucide-react";
import * as motion from "framer-motion/client";

const columns = [
  { id: "Requested", title: "Requested", color: "border-blue-200 dark:border-blue-900/50 text-blue-700" },
  { id: "Accepted", title: "Accepted", color: "border-amber-200 dark:border-amber-900/50 text-amber-700" },
  { id: "Interview Scheduled", title: "Interview", color: "border-purple-200 dark:border-purple-900/50 text-purple-700" },
  { id: "Hired", title: "Hired", color: "border-emerald-200 dark:border-emerald-900/50 text-emerald-700" },
  { id: "Declined", title: "Declined", color: "border-rose-200 dark:border-rose-900/50 text-rose-700" },
];

export default function ReferralsPage() {
  const { user } = useUser();
  const referrals = useQuery(api.networking.listReferrals, user ? { clerkId: user.id } : "skip");
  const addReferral = useMutation(api.networking.addReferral);
  const updateStatus = useMutation(api.networking.updateReferralStatus);
  const generateTemplate = useAction(api.networking.generateOutreachTemplate);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newCompany, setNewCompany] = React.useState("");
  const [newRole, setNewRole] = React.useState("");
  const [newContact, setNewContact] = React.useState("");
  const [newLinkedIn, setNewLinkedIn] = React.useState("");
  const [newNotes, setNewNotes] = React.useState("");

  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [generatedTemplate, setGeneratedTemplate] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCompany || !newContact) return;
    
    await addReferral({
      clerkId: user.id,
      company: newCompany,
      role: newRole || "Software Engineer",
      contactName: newContact,
      contactLinkedIn: newLinkedIn,
      status: "Requested",
      notes: newNotes,
    });
    
    setIsAddModalOpen(false);
    setNewCompany("");
    setNewRole("");
    setNewContact("");
    setNewLinkedIn("");
    setNewNotes("");
  };

  const handleGenerateTemplate = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const template = await generateTemplate({
        clerkId: user.id,
        type: "Referral Request",
        targetCompany: newCompany,
        targetRole: newRole,
        contactName: newContact,
      });
      setGeneratedTemplate(template || "");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals Hub</h1>
          <p className="text-muted-foreground mt-1">Manage and track your employee referrals and networking outreach.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Request
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Referral Request</h2>
            <form onSubmit={handleAddReferral} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input required value={newCompany} onChange={e => setNewCompany(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input value={newRole} onChange={e => setNewRole(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Frontend Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input required value={newContact} onChange={e => setNewContact(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact LinkedIn</label>
                <input value={newLinkedIn} onChange={e => setNewLinkedIn(e.target.value)} type="url" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://linkedin.com/in/..." />
              </div>
              
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsTemplateModalOpen(true); handleGenerateTemplate(); }} className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" /> Draft Message
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition-colors">
                  Save Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /> AI Outreach Template</h2>
            <div className="bg-secondary/50 p-4 rounded-lg min-h-[200px] border border-border text-sm whitespace-pre-wrap font-mono">
              {isGenerating ? "Generating template..." : generatedTemplate}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(generatedTemplate); alert("Copied to clipboard!"); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition-colors">
                Copy to Clipboard
              </button>
              <button onClick={() => { setIsTemplateModalOpen(false); setIsAddModalOpen(true); }} className="flex-1 bg-secondary hover:bg-secondary/80 py-2 rounded-md font-medium transition-colors">
                Back to Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {referrals && referrals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card p-12 text-center mt-4">
          <Users className="h-12 w-12 text-indigo-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No referrals yet.</h3>
          <p className="text-muted-foreground mb-6 max-w-md">Start tracking your networking efforts and referral requests.</p>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Referral Request
          </button>
        </div>
      ) : (
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-4 min-w-[1200px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col w-[280px] shrink-0 bg-secondary/30 dark:bg-secondary/10 rounded-xl border border-border overflow-hidden">
              <div className="p-3 border-b border-border bg-card flex items-center justify-between shadow-sm">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full border-2 ${col.color.split(' ')[0]} bg-background`} />
                  {col.title}
                </h3>
                <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  {referrals?.filter((r: any) => r.status === col.id).length || 0}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {referrals?.filter((r: any) => r.status === col.id).map((r: any) => (
                  <div key={r._id} className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-indigo-500/50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm leading-tight text-foreground">
                        {r.contactName}
                      </span>
                      <div className="relative group/menu">
                        <button className="relative z-10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:flex flex-col bg-popover border border-border rounded-md shadow-md z-20 w-36 overflow-hidden">
                          {columns.map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => updateStatus({ id: r._id, status: c.id as any })}
                              className="text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                            >
                              Move to {c.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">{r.company}</p>
                    <p className="text-[10px] text-muted-foreground mb-3">{r.role}</p>
                    
                    <div className="flex items-center justify-between">
                      {r.contactLinkedIn && (
                        <a href={r.contactLinkedIn} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline">
                          LinkedIn
                        </a>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {referrals?.filter((r: any) => r.status === col.id).length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Empty</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
