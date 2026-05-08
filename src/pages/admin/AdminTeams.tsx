import React, { useState, useEffect } from "react";
import {
  Users,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  ShieldOff,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { api } from "../../services/api";

export function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPassword, setNewTeamPassword] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("detective");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");

  const fetchTeams = async () => {
    try {
      const d = await api.get<any>("/api/admin/teams");
      if (d.teams) {
        const formatted = d.teams.map((t: any) => ({
          ...t,
          members: t.members || ["Unknown"],
          active: !t.is_disabled,
        }));
        setTeams(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const toggleTeamStatus = async (
    id: number,
    currentDisabledStatus: boolean,
  ) => {
    const newDisabledStatus = !currentDisabledStatus;
    try {
      const data = await api.post<any>(`/api/admin/teams/${id}/toggle`, {
        disabled: newDisabledStatus,
      });
      if (data.success) {
        setTeams(
          teams.map((t) =>
            t.id === id ? { ...t, active: !data.is_disabled } : t,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const data = await api.post<any>("/api/admin/teams", {
        name: newTeamName,
        password: newTeamPassword,
        role: newTeamRole,
      });

      if (data.success) {
        setTeams([
          ...teams,
          {
            ...data.team,
            members: data.team.members || ["Unknown"],
            active: !data.team.is_disabled,
          },
        ]);
        setNewTeamName("");
        setNewTeamPassword("");
        setNewTeamRole("detective");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (team: any) => {
    setEditingTeamId(team.id);
    setEditMembers([...team.members]);
    setNewMemberName("");
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      setEditMembers([...editMembers, newMemberName.trim()]);
      setNewMemberName("");
    }
  };

  const handleRemoveMember = (idx: number) => {
    setEditMembers(editMembers.filter((_, i) => i !== idx));
  };

  const handleSaveMembers = async (id: number) => {
    try {
      const data = await api.put<any>(`/api/admin/teams/${id}/members`, {
        members: editMembers,
      });
      if (data.success) {
        setTeams(
          teams.map((t) => (t.id === id ? { ...t, members: data.members } : t)),
        );
        setEditingTeamId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEditing = () => {
    setEditingTeamId(null);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-red-500 uppercase tracking-widest flex items-center gap-4">
          <Users className="w-8 h-8" /> Team Management
        </h1>
        <button className="bg-red-900 border border-red-500 text-red-100 px-6 py-2 hover:bg-red-800 transition uppercase font-bold text-sm">
          Purge Inactive Teams
        </button>
      </div>

      <div className="bg-black/50 border border-border p-6 font-mono">
        <h2 className="text-xl font-bold text-gold mb-4 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-5 h-5" /> Provision New Team
        </h2>
        {createError && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 mb-4 text-sm uppercase">
            {createError}
          </div>
        )}
        <form onSubmit={handleCreateTeam} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase text-muted tracking-wider">
              Team Name/ID
            </label>
            <input
              type="text"
              required
              className="w-full bg-black border border-border px-4 py-2 text-white outline-none focus:border-red-500 transition-colors uppercase"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. TEAM_OMEGA"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase text-muted tracking-wider">
              Passcode
            </label>
            <input
              type="password"
              required
              className="w-full bg-black border border-border px-4 py-2 text-white outline-none focus:border-red-500 transition-colors"
              value={newTeamPassword}
              onChange={(e) => setNewTeamPassword(e.target.value)}
              placeholder="Secure Passcode"
            />
          </div>
          <div className="w-48 space-y-2">
            <label className="text-xs uppercase text-muted tracking-wider">
              Access Level
            </label>
            <select
              className="w-full bg-black border border-border px-4 py-2 text-white outline-none focus:border-red-500 transition-colors uppercase"
              value={newTeamRole}
              onChange={(e) => setNewTeamRole(e.target.value)}
            >
              <option value="detective">Field Agent</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-red-500 text-white px-6 py-2 uppercase font-bold tracking-widest hover:bg-red-400 transition-colors disabled:opacity-50"
          >
            {creating ? "INITIATING..." : "DEPLOY"}
          </button>
        </form>
      </div>

      <div className="flex bg-black border border-border p-2 max-w-md">
        <Search className="w-5 h-5 text-muted ml-2 mr-2" />
        <input
          type="text"
          placeholder="SEARCH TEAMS..."
          className="bg-transparent text-white outline-none w-full font-mono uppercase"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-black/50 border border-border">
        {loading ? (
          <div className="p-8 text-center text-muted uppercase font-mono tracking-widest">
            LOADING TEAMS...
          </div>
        ) : (
          <table className="w-full text-left font-mono">
            <thead className="bg-[#1a140f] border-b border-border text-gold text-sm tracking-wide">
              <tr>
                <th className="p-4">STATUS</th>
                <th className="p-4">TEAM NAME</th>
                <th className="p-4">MEMBERS</th>
                <th className="p-4">SCORE</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  className={`hover:bg-white/5 transition-colors ${!team.active ? "opacity-50 grayscale" : ""}`}
                >
                  <td className="p-4">
                    <div
                      className={`w-3 h-3 rounded-full ${team.active ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"}`}
                    />
                  </td>
                  <td className="p-4 font-bold text-white">{team.name}</td>
                  <td className="p-4 text-muted">
                    {editingTeamId === team.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {editMembers.map((member, idx) => (
                            <span
                              key={idx}
                              className="bg-white/10 px-2 py-1 rounded text-white flex items-center gap-1"
                            >
                              {member}
                              <button
                                onClick={() => handleRemoveMember(idx)}
                                className="text-red-400 hover:text-red-300 ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 isolate">
                          <input
                            type="text"
                            className="bg-black border border-border px-2 py-1 text-white text-xs outline-none focus:border-blue-500 w-32 flex-1"
                            placeholder="New member..."
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddMember()
                            }
                          />
                          <button
                            onClick={handleAddMember}
                            className="bg-blue-900 border border-blue-500 text-blue-100 px-3 py-1 text-xs hover:bg-blue-800 transition uppercase font-bold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      team.members.join(" // ")
                    )}
                  </td>
                  <td className="p-4 text-gold font-bold">{team.score}</td>
                  <td className="p-4 text-right space-x-4 flex justify-end items-center">
                    {editingTeamId === team.id ? (
                      <>
                        <button
                          onClick={() => handleSaveMembers(team.id)}
                          className="text-green-400 hover:text-green-300 transition-colors uppercase text-xs tracking-wider flex items-center justify-center"
                        >
                          <Save className="w-4 h-4 mr-1" /> Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-400 hover:text-red-300 transition-colors uppercase text-xs tracking-wider flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            toggleTeamStatus(team.id, !team.active)
                          }
                          className={`${team.active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"} transition-colors uppercase text-xs tracking-wider flex items-center justify-center`}
                        >
                          {team.active ? (
                            <>
                              <ShieldOff className="w-4 h-4 mr-1" /> Disable
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-1" /> Enable
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => startEditing(team)}
                          className="text-blue-400 hover:text-blue-300 transition-colors uppercase text-xs tracking-wider flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit Members
                        </button>
                        <button className="text-red-500 hover:text-red-400 transition-colors uppercase text-xs tracking-wider flex items-center justify-center">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTeams.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted uppercase"
                  >
                    No teams found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
