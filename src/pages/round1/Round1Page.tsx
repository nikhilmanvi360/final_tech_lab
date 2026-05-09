import { useState, FormEvent, useRef, useEffect } from "react";
import {
  Search,
  Database,
  FileText,
  Terminal as TerminalIcon,
} from "lucide-react";
import { useSharedState } from "../../hooks/useSharedState";
import { useOutletContext } from "react-router-dom";
import { api } from "../../services/api";

export function Round1Page() {
  const { team } = useOutletContext<{ team: any }>();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const DB: Record<string, any[]> = {
    weather_reports: [
      {
        date: "2026-04-10",
        location: "Delhi",
        precipitation_mm: 12.4,
        status: "Storm",
      },
      {
        date: "2026-04-11",
        location: "Delhi",
        precipitation_mm: 5.2,
        status: "Light Rain",
      },
      {
        date: "2026-04-12",
        location: "Delhi",
        precipitation_mm: 0.0,
        status: "Clear",
      },
      {
        date: "2026-04-13",
        location: "Delhi",
        precipitation_mm: 0.0,
        status: "Clear",
      },
    ],
    ip_registry: [
      {
        ip_address: "203.45.17.88",
        organization: "Sundaram Infrastructure Pvt. Ltd.",
        location: "Floor 14, Connaught Place, New Delhi",
      },
      {
        ip_address: "104.22.45.19",
        organization: "Global News Network",
        location: "Okhla, New Delhi",
      },
      {
        ip_address: "192.168.1.1",
        organization: "Local Route",
        location: "Internal",
      },
    ],
    police_financials: [
      {
        officer_name: "S. Patil",
        date: "2026-04-11",
        amount_inr: 45000,
        sender: "Gov Salary",
      },
      {
        officer_name: "R. Varma",
        date: "2026-04-11",
        amount_inr: 55000,
        sender: "Gov Salary",
      },
      {
        officer_name: "R. Varma",
        date: "2026-04-13",
        amount_inr: 800000,
        sender: "Offshore_Acc_77492",
      },
    ],
    access_logs: [
      {
        employee: "Priya Mehta",
        entry_time: "2026-04-11 09:14:00",
        exit_time: "-",
        zone: "Newsroom",
      },
      {
        employee: "Dev Sharma",
        entry_time: "2026-04-11 10:05:00",
        exit_time: "2026-04-11 18:30:00",
        zone: "Investigations",
      },
      {
        employee: "R. Dasgupta",
        entry_time: "2026-04-12 02:58:00",
        exit_time: "2026-04-12 03:09:00",
        zone: "Server_Room",
      },
    ],
    phone_records: [
      {
        caller: "Priya Mehta",
        receiver: "Dev Sharma",
        time: "2026-04-12 02:51:00",
        duration_sec: 14,
        type: "SMS",
        content: "I have the names. All of them.",
      },
      {
        caller: "V. Sundaram",
        receiver: "R. Dasgupta",
        time: "2026-04-12 02:47:00",
        duration_sec: 251,
        type: "Voice",
        content: "[ENCRYPTED]",
      },
      {
        caller: "R. Varma",
        receiver: "V. Sundaram",
        time: "2026-04-13 08:15:00",
        duration_sec: 45,
        type: "Voice",
        content: "[ENCRYPTED]",
      },
    ],
  };

  const allTables = Object.keys(DB);
  const allColumns = Array.from(
    new Set(Object.values(DB).flatMap((table) => Object.keys(table[0] || {}))),
  );

  const updateSuggestions = (val: string, pos: number) => {
    if (!inSql) {
      setSuggestions([]);
      return;
    }
    const beforeCursor = val.slice(0, pos);
    const match = beforeCursor.match(/([a-zA-Z0-9_]+)$/);
    if (!match) {
      setSuggestions([]);
      return;
    }

    const word = match[1].toLowerCase();
    const words = beforeCursor.trim().split(/\s+/);
    const prevWord =
      words.length > 1 ? words[words.length - 2].toUpperCase() : "";

    let options: string[] = [];
    if (prevWord === "FROM" || prevWord === "DESCRIBE") {
      options = allTables;
    } else {
      options = [...allTables, ...allColumns];
    }

    const sugs = options.filter(
      (o) => o.toLowerCase().startsWith(word) && o.toLowerCase() !== word,
    );
    setSuggestions(sugs);
  };

  const [history, setHistory] = useSharedState<
    {
      query: string;
      result: any;
      type: "error" | "success" | "table" | "info";
      dir?: string;
    }[]
  >("r1_history", [
    {
      query: "",
      result:
        "TT_OS Terminal v1.0.2\nType `ls`, `cd`, `cat` to navigate directories. Find the database entry point.",
      type: "info",
    },
  ]);

  const [cwd, setCwd] = useSharedState("r1_cwd", "/");
  const [inSql, setInSql] = useSharedState("r1_inSql", false);

  const FS: any = {
    "/": {
      type: "dir",
      contents: ["home", "etc", "var", "opt"]
    },
    "/home": {
      type: "dir",
      contents: ["admin", "guest"]
    },
    "/home/admin": {
      type: "dir",
      contents: ["db_connect.sh", "notes.txt"]
    },
    "/home/admin/notes.txt": {
      type: "file",
      content: "Reminder: Use ./db_connect.sh to start the SQL monitor. Don't forget to DESCRIBE tables before querying."
    },
    "/home/guest": {
      type: "dir",
      contents: []
    },
    "/etc": {
      type: "dir",
      contents: ["passwd", "config.yml"]
    },
    "/etc/passwd": {
      type: "file",
      content: "root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:admin:/home/admin:/bin/bash"
    },
    "/etc/config.yml": {
      type: "file",
      content: "db_host: postgres.internal.local\ndb_user: tt_sys\ndb_pass: [REDACTED]\nactive_port: 5432"
    },
    "/var": { type: "dir", contents: [] },
    "/opt": { type: "dir", contents: [] },
    "/home/admin/db_connect.sh": {
      type: "exec",
      output: "Connecting to TT_OS DB_ENGINE...\nAuthenticated as tt_sys (read-only)\nWelcome to TT_OS SQL Gateway v3.2.1\n\nType SHOW TABLES to list available tables.\nType DESCRIBE <table> to inspect columns.\nType SELECT * FROM <table> to query.\nType EXIT to disconnect."
    },
  };

  const resolvePath = (path: string) => {
    if (path.startsWith("/")) {
      return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
    }
    const current = cwd === "/" ? "" : cwd;
    if (path === "..") {
      if (cwd === "/") return "/";
      const parts = cwd.split("/");
      parts.pop();
      return parts.length === 1 ? "/" : parts.join("/");
    }
    if (path === ".") return cwd;
    return `${current}/${path}`.replace(/\/+/g, "/");
  };

  const endOfTerminalRef = useRef<HTMLDivElement>(null);

  const [discoveredEvidence, setDiscoveredEvidence] = useSharedState<string[]>(
    "r1_evidence",
    [],
  );

  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeQuery = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let newHistory = [...history];
    let result: any = null;
    let type: "error" | "success" | "table" | "info" = "error";

    if (!inSql) {
      const parts = query.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      
      try {
        if (cmd === "ls") {
          const dirPath = parts[1] ? resolvePath(parts[1]) : cwd;
          const node = FS[dirPath];
          if (!node) {
            result = `ls: cannot access '${dirPath}': No such file or directory`;
          } else if (node.type === "file" || node.type === "exec") {
            result = parts[1];
          } else {
            result = node.contents.join("  ");
          }
          type = "info";
        } else if (cmd === "cd") {
          const dirPath = parts[1] ? resolvePath(parts[1]) : "/home/admin";
          const node = FS[dirPath];
          if (!node) {
            result = `cd: ${dirPath}: No such file or directory`;
          } else if (node.type !== "dir") {
            result = `cd: ${dirPath}: Not a directory`;
          } else {
            setCwd(dirPath);
            result = ""; // Success
          }
          type = "info";
        } else if (cmd === "cat") {
          if (!parts[1]) {
            result = "cat: missing file operand";
          } else {
            const filePath = resolvePath(parts[1]);
            const node = FS[filePath];
            if (!node) {
              result = `cat: ${parts[1]}: No such file or directory`;
            } else if (node.type === "dir") {
              result = `cat: ${parts[1]}: Is a directory`;
            } else if (node.type === "exec") {
              result = "cat: Cannot display binary file";
            } else {
              result = node.content;
            }
          }
          type = "info";
        } else if (cmd === "pwd") {
          result = cwd;
          type = "info";
        } else if (cmd === "./db_connect.sh") {
          if (cwd !== "/home/admin") {
            result = "bash: ./db_connect.sh: No such file or directory";
          } else {
            result = FS["/home/admin/db_connect.sh"]?.output || "Connecting to TT_OS DB_ENGINE... Connected.";
            type = "info";
            setInSql(true);
          }
        } else if (cmd === "exit") {
          result = "Logout";
          type = "info";
        } else {
          result = `bash: ${cmd}: command not found`;
        }
      } catch (err: any) {
        result = err.message;
      }
      
      newHistory.push({ query, result, type, dir: cwd });
      setHistory(newHistory);
      setQuery("");
      return;
    }

    // Existing SQL Logic begins here
    const q = query.trim().toUpperCase();

    if (q === "EXIT" || q === "QUIT" || q === "EXIT;" || q === "QUIT;") {
      newHistory.push({ query, result: "Disconnecting from TT_OS DB_ENGINE...", type: "info" });
      setHistory(newHistory);
      setQuery("");
      setInSql(false);
      return;
    }

    try {
      if (q.startsWith("SHOW TABLES")) {
        result = Object.keys(DB).map((k) => ({ table_name: k }));
        type = "table";
      } else if (q.startsWith("DESCRIBE")) {
        const parts = q.trim().split(/\s+/);
        if (parts.length > 1) {
          const tableName = parts[1].replace(";", "").toLowerCase();
          if (DB[tableName]) {
            result = Object.keys(DB[tableName][0]).map((k) => ({
              column_name: k,
            }));
            type = "table";
          } else {
            result = `Error: relation "${tableName}" does not exist.`;
          }
        } else {
          result = "Syntax Error: DESCRIBE requires a table name.";
        }
      } else if (q.startsWith("SELECT ")) {
        const fromMatch = q.match(/FROM\s+([A-Z0-9_]+)/);
        if (!fromMatch) {
          result =
            "Syntax Error: Missing or invalid FROM clause. Expected format: SELECT * FROM table_name";
          api.post("/api/systems/fail").catch(() => {});
        } else {
          const tableName = fromMatch[1].toLowerCase();
          if (!DB[tableName]) {
            result = `Error: relation "${tableName}" does not exist`;
            api.post("/api/systems/fail").catch(() => {});
          } else {
            let data = DB[tableName];
            let whereCol = "";
            let whereVal = "";

            const whereMatch = q.match(
              /WHERE\s+([A-Z0-9_\.]+)\s*(=|LIKE)\s*(.+)$/i,
            );

            if (q.includes(" WHERE ") && !whereMatch) {
              result =
                "Syntax Error: Invalid WHERE clause. Expected format: WHERE column = 'value' OR WHERE column LIKE 'value'";
              api.post("/api/systems/fail").catch(() => {});
            } else {
              let hasError = false;

              if (whereMatch) {
                whereCol = whereMatch[1].toLowerCase();
                const op = whereMatch[2].toUpperCase();
                let rawVal = whereMatch[3].replace(/;$/, "").trim();

                let isString = false;
                if (
                  (rawVal.startsWith("'") && rawVal.endsWith("'")) ||
                  (rawVal.startsWith('"') && rawVal.endsWith('"'))
                ) {
                  rawVal = rawVal.substring(1, rawVal.length - 1);
                  isString = true;
                }

                whereVal = rawVal.toUpperCase();

                if (whereCol.includes(".")) {
                  const [tbl, col] = whereCol.split(".");
                  if (tbl !== tableName) {
                    result = `Error: Ambiguous column name or unknown table alias "${tbl}".`;
                    api.post("/api/systems/fail").catch(() => {});
                    hasError = true;
                  }
                  whereCol = col;
                }

                if (!hasError && data.length > 0 && !(whereCol in data[0])) {
                  result = `Error: column "${whereCol}" does not exist in relation "${tableName}".`;
                  api.post("/api/systems/fail").catch(() => {});
                  hasError = true;
                }

                if (!hasError && data.length > 0) {
                  const sample = data[0][whereCol];
                  if (typeof sample === "number" && isString) {
                    result = `Error: Data type mismatch. Operator ${op} on numeric column "${whereCol}" with string value.`;
                    api.post("/api/systems/fail").catch(() => {});
                    hasError = true;
                  } else if (
                    typeof sample === "number" &&
                    isNaN(Number(rawVal))
                  ) {
                    result = `Error: Data type mismatch. Operator ${op} on numeric column "${whereCol}" with non-numeric value "${rawVal}".`;
                    api.post("/api/systems/fail").catch(() => {});
                    hasError = true;
                  }
                }

                if (!hasError) {
                  data = data.filter((row) => {
                    const rowVal = String(row[whereCol] || "").toUpperCase();
                    if (op === "=") {
                      return rowVal === whereVal;
                    } else if (op === "LIKE") {
                      // Escape regex chars except % and _
                      const escaped = whereVal.replace(
                        /[.+?^${}()|[\]\\]/g,
                        "\\$&",
                      );
                      const regexStr =
                        "^" +
                        escaped.replace(/%/g, ".*").replace(/_/g, ".") +
                        "$";
                      try {
                        return new RegExp(regexStr).test(rowVal);
                      } catch (e) {
                        return false;
                      }
                    }
                    return false;
                  });
                }
              }

              if (!hasError) {
                result = data.length > 0 ? data : "0 rows returned.";
                type = data.length > 0 ? "table" : "info";

                // Check for evidence unlocks
                const hasEvidenceMatch = (expected: string) => {
                  if (whereVal === expected) return true;
                  if (whereMatch && whereMatch[2].toUpperCase() === "LIKE") {
                    const escaped = whereVal.replace(
                      /[.+?^${}()|[\]\\]/g,
                      "\\$&",
                    );
                    const regexStr =
                      "^" +
                      escaped.replace(/%/g, ".*").replace(/_/g, ".") +
                      "$";
                    return new RegExp(regexStr).test(expected);
                  }
                  return false;
                };

                if (
                  tableName === "weather_reports" &&
                  hasEvidenceMatch("2026-04-12")
                )
                  addEvidence("EVIDENCE_WEATHER", "Weather Falsified", "Official report claims storm. DB shows 0.0mm rain on April 12.");
                if (
                  tableName === "ip_registry" &&
                  hasEvidenceMatch("203.45.17.88")
                )
                  addEvidence("EVIDENCE_IP", "IP Traced", "IP 203.45.17.88 resolves to Sundaram Infrastructure Pvt. Ltd.");
                if (
                  tableName === "police_financials" &&
                  hasEvidenceMatch("R. VARMA")
                )
                  addEvidence("EVIDENCE_BRIBE", "Bribe Found", "Inspector R. Varma received ₹800,000 from an offshore account.");
                if (
                  tableName === "access_logs" &&
                  (hasEvidenceMatch("SERVER_ROOM") || hasEvidenceMatch("SERVER ROOM"))
                )
                  addEvidence("EVIDENCE_SERVER", "Insider Access", "R. Dasgupta entered the Server Room at 02:58 AM — immediately before the remote wipe.");
                if (
                  tableName === "phone_records" &&
                  (hasEvidenceMatch("V. SUNDARAM") || hasEvidenceMatch("V.SUNDARAM") || hasEvidenceMatch("V%SUNDARAM"))
                )
                  addEvidence("EVIDENCE_PHONE", "Collusion", "V. Sundaram called R. Dasgupta 15 mins before the remote wipe.");
              }
            }
          }
        }
      } else {
        result =
          "Syntax Error: Command not recognized. Try SHOW TABLES, DESCRIBE [table_name], or SELECT * FROM [table_name].";
        api.post("/api/systems/fail").catch(() => {});
      }
    } catch (err: any) {
      result = err.message;
    }

    newHistory.push({ query, result, type });
    setHistory(newHistory);
    setQuery("");
  };

  const [globalEvidence, setGlobalEvidence] = useSharedState<any[]>("global_evidence", []);

  const addEvidence = (id: string, summary: string, details: string) => {
    if (!discoveredEvidence.includes(id)) {
      setDiscoveredEvidence([...discoveredEvidence, id]);
      
      const newGlobalItem = {
        id,
        source: "Round 1: Archive Discrepancy",
        summary,
        details,
        status: "new"
      };
      // Important to use the current globalEvidence from state
      setGlobalEvidence(prev => {
        if (!prev) return [newGlobalItem];
        if (prev.find((e: any) => e.id === id)) return prev;
        return [...prev, newGlobalItem];
      });

      api.post("/api/r1/claim", { code: id }).catch(() => {});
    }
  };

  const isIntel = team?.playerRole?.includes("Intel");

  return (
    <div className="h-full flex flex-col pt-2">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <h1 className="text-2xl font-bold text-gold uppercase flex items-center gap-2">
          <Database className="w-6 h-6" />
          Archive Discrepancy & SQL Injection
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-gold font-bold bg-gold/10 px-4 py-1 border border-gold/30">
            EVIDENCE FOUND: {discoveredEvidence.length} / 5
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Pane - Official Report & Evidence */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto">
          <div className="border border-border bg-[#e4dac6] text-black p-6 font-serif shadow-inner shrink-0 relative">
            <div className="absolute top-2 right-2 text-[10px] text-red-500 font-bold border border-red-500 px-1 opacity-50 uppercase object-cover transform rotate-12">
              Confidential
            </div>
            <h2 className="text-lg font-bold mb-2 uppercase border-b-2 border-black pb-1 flex items-center justify-between">
              <span>Investigation Report</span>
              <span className="text-xs font-normal">DLH-2026-0412</span>
            </h2>
            <div className="space-y-3 text-xs">
              <p>
                <strong>Subject:</strong> Priya Mehta, F/34
              </p>
              <p>
                <strong>Filed By:</strong> Inspector R. Varma
              </p>
              <p className="bg-red-900/10 p-2 font-bold">
                FORENSICS: Data loss attributed to power surge during electrical
                storm. No malicious software.
              </p>
              <p className="bg-red-900/10 p-2 font-bold">
                CONCLUSION: Natural death. Case closed April 14, 2026.
              </p>
            </div>
          </div>

          <div className="border border-border bg-black/40 p-4">
            <h3 className="font-bold text-gold uppercase border-b border-border pb-2 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" /> Discovered Contradictions
            </h3>
            {discoveredEvidence.length === 0 ? (
              <p className="text-muted text-sm italic">
                Query the databases to find contradictions against the official
                report.
              </p>
            ) : (
              <ul className="space-y-2">
                {discoveredEvidence.includes("EVIDENCE_WEATHER") && (
                  <li className="bg-green-900/20 border border-green-500/50 p-2 text-xs text-green-400">
                    <strong>Weather Falsified:</strong> 0.0mm rain on April 12.
                    No storm.
                  </li>
                )}
                {discoveredEvidence.includes("EVIDENCE_IP") && (
                  <li className="bg-green-900/20 border border-green-500/50 p-2 text-xs text-green-400">
                    <strong>IP Traced:</strong> 203.45.17.88 belongs to Sundaram
                    Infrastructure.
                  </li>
                )}
                {discoveredEvidence.includes("EVIDENCE_BRIBE") && (
                  <li className="bg-green-900/20 border border-green-500/50 p-2 text-xs text-green-400">
                    <strong>Bribe Found:</strong> Inspector Varma received ₹8L
                    from an offshore account.
                  </li>
                )}
                {discoveredEvidence.includes("EVIDENCE_SERVER") && (
                  <li className="bg-green-900/20 border border-green-500/50 p-2 text-xs text-green-400">
                    <strong>Insider Access:</strong> R. Dasgupta entered the
                    Server Room immediately after Priya's wipe.
                  </li>
                )}
                {discoveredEvidence.includes("EVIDENCE_PHONE") && (
                  <li className="bg-green-900/20 border border-green-500/50 p-2 text-xs text-green-400">
                    <strong>Collusion:</strong> V. Sundaram called R. Dasgupta
                    15 mins before the remote wipe.
                  </li>
                )}
              </ul>
            )}
            {discoveredEvidence.length === 5 && (
              <div className="mt-4 bg-gold text-black font-bold uppercase p-2 text-center animate-pulse">
                All 5 Evidence Links Established.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - SQL Terminal or Intel View */}
        {!isIntel ? (
          <div className="w-2/3 flex flex-col border border-border bg-[#0a0a0c]">
            <div className="bg-black border-b border-border p-2 flex items-center gap-2 text-white/50 text-xs font-mono uppercase tracking-widest">
              <Database className="w-4 h-4 text-blue-500" />
              DATABASE SCHEMAS /// FIELD AGENT MODE
            </div>
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-6">
              <div>
                <h3 className="font-bold text-blue-400 mb-2 uppercase border-b border-blue-900/50 pb-1">
                  Table: weather_reports
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs text-white/70">
                  <div>date [DATE]</div>
                  <div>location [STR]</div>
                  <div>precipitation_mm [FLOAT]</div>
                  <div>status [STR]</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-blue-400 mb-2 uppercase border-b border-blue-900/50 pb-1">
                  Table: ip_registry
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs text-white/70">
                  <div>ip_address [STR]</div>
                  <div>organization [STR]</div>
                  <div>location [STR]</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-blue-400 mb-2 uppercase border-b border-blue-900/50 pb-1">
                  Table: police_financials
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs text-white/70">
                  <div>officer_name [STR]</div>
                  <div>date [DATE]</div>
                  <div>amount_inr [INT]</div>
                  <div>sender [STR]</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-blue-400 mb-2 uppercase border-b border-blue-900/50 pb-1">
                  Table: access_logs
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs text-white/70">
                  <div>employee [STR]</div>
                  <div>entry_time [TIME]</div>
                  <div>exit_time [TIME]</div>
                  <div>zone [STR]</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-blue-400 mb-2 uppercase border-b border-blue-900/50 pb-1">
                  Table: phone_records
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs text-white/70">
                  <div>caller [STR]</div>
                  <div>receiver [STR]</div>
                  <div>type [STR]</div>
                  <div>duration_sec [INT]</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-2/3 flex flex-col border border-border bg-[#0a0a0c]">
            <div className="bg-black border-b border-border p-2 flex items-center gap-2 text-white/50 text-xs font-mono uppercase tracking-widest">
              <TerminalIcon className="w-4 h-4 text-blue-500" />
              {inSql ? "TT_OS SQL Database Gateway /// Read-Only Mode" : "TT_OS System Terminal"}
              <span className="ml-auto text-green-400 animate-pulse hidden md:inline">
                Sync Active
              </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {history.map((h, i) => (
                <div key={i} className="mb-4">
                  {h.query && (
                    <div className="text-blue-400 mb-1">
                      <span className="text-gray-500 mr-2">{h.dir ? `admin@ttos:${h.dir}$` : 'TT_SQL>'}</span>
                      {h.query}
                    </div>
                  )}

                  {h.type === "error" && (
                    <div className="text-red-500">{h.result}</div>
                  )}
                  {h.type === "info" && (
                    <div className="text-gray-300 whitespace-pre">
                      {h.result}
                    </div>
                  )}
                  {h.type === "table" && Array.isArray(h.result) && (
                    <div className="flex flex-col gap-2">
                      <div className="overflow-x-auto border border-border/50">
                        <table className="w-full text-left text-xs bg-black/50">
                          <thead className="bg-[#1a140f] text-gold border-b border-border/50">
                            <tr>
                              {Object.keys(h.result[0] || {}).map((col) => (
                                <th
                                  key={col}
                                  className="p-2 border-r border-border/30 last:border-0"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {h.result.map((row, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-border/30 last:border-0 text-green-400 hover:bg-white/5"
                              >
                                {Object.values(row).map((val: any, j) => (
                                  <td
                                    key={j}
                                    className="p-2 border-r border-border/30 last:border-0"
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {h.result.length} row{h.result.length !== 1 ? "s" : ""}{" "}
                        returned.
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={endOfTerminalRef} />
            </div>
            <form
              onSubmit={executeQuery}
              className="border-t border-border bg-[#111] p-2 flex gap-2 relative items-center flex-wrap"
            >
              <span className="text-gray-500 font-mono text-sm ml-2">
                {inSql ? 'TT_SQL>' : `admin@ttos:${cwd}$`}
              </span>
              <div className="relative flex-1">
                {/* Highlighted text behind input */}
                <div className="absolute inset-0 font-mono text-lg pointer-events-none whitespace-pre break-all flex items-center">
                  {query === "" && (
                    <span className="text-white/20">{inSql ? "SELECT * FROM table" : "ls -la"}</span>
                  )}
                  {query !== "" && inSql &&
                    query
                      .split(
                        /(\b(?:SELECT|FROM|WHERE|LIKE|AND|OR|SHOW|TABLES|DESCRIBE|EXIT|QUIT)\b|['"].*?['"])/i,
                      )
                      .map((token, i) => {
                        if (
                          /^(SELECT|FROM|WHERE|LIKE|AND|OR|SHOW|TABLES|DESCRIBE|EXIT|QUIT)$/i.test(
                            token,
                          )
                        ) {
                          return (
                            <span key={i} className="text-pink-400 font-bold">
                              {token}
                            </span>
                          );
                        }
                        if (/^['"].*?['"]$/.test(token)) {
                          return (
                            <span key={i} className="text-green-400">
                              {token}
                            </span>
                          );
                        }
                        return (
                          <span key={i} className="text-blue-100">
                            {token}
                          </span>
                        );
                      })}
                  {query !== "" && !inSql && (
                    <span className="text-blue-100">{query}</span>
                  )}
                </div>
                {/* Actual input */}
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    const pos = e.target.selectionStart || 0;
                    updateSuggestions(e.target.value, pos);
                  }}
                  onKeyUp={(e) => {
                    const pos = e.currentTarget.selectionStart || 0;
                    updateSuggestions(e.currentTarget.value, pos);
                  }}
                  onClick={(e) => {
                    const pos = e.currentTarget.selectionStart || 0;
                    updateSuggestions(e.currentTarget.value, pos);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && suggestions.length > 0) {
                      e.preventDefault();
                      const pos = e.currentTarget.selectionStart || 0;
                      const beforeCursor = query.slice(0, pos);
                      const match = beforeCursor.match(/([a-zA-Z0-9_]+)$/);
                      if (match) {
                        const word = match[1];
                        const newQuery =
                          query.slice(0, pos - word.length) +
                          suggestions[0] +
                          " " +
                          query.slice(pos);
                        setQuery(newQuery);
                        setSuggestions([]);
                        // Request animation frame to set cursor back? Let's just let it be at end.
                      }
                    }
                  }}
                  style={{ color: "transparent", caretColor: "white" }}
                  className="w-full bg-transparent border-none outline-none text-lg font-mono placeholder:text-transparent"
                />
                {suggestions.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 bg-[#1a140f] border border-border p-1 flex gap-2 rounded shadow-lg z-10 w-fit max-w-full overflow-hidden">
                    {suggestions.slice(0, 5).map((s, idx) => (
                      <div
                        key={s}
                        className={`px-2 py-1 text-xs font-mono rounded ${idx === 0 ? "bg-blue-500/20 text-blue-300" : "text-gray-400"}`}
                      >
                        {s}{" "}
                        <span className="text-white/20 ml-1 opacity-50">
                          {idx === 0 ? "Tab" : ""}
                        </span>
                      </div>
                    ))}
                    {suggestions.length > 5 && (
                      <div className="px-2 py-1 text-xs font-mono text-gray-500">
                        ...
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button type="submit" className="hidden" />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
