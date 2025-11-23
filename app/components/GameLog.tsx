"use client";

import React, { useEffect, useRef } from "react";
import { LogEntry } from "../../lib/types";
import { Terminal } from "lucide-react";

interface GameLogProps {
  logs: LogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-56 lg:h-64 bg-walrus-card border border-slate-700 rounded-xl overflow-hidden shadow-lg">
      <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex items-center gap-2">
        <Terminal size={16} className="text-walrus-accent" />
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          System Log
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 font-mono text-sm">
        {logs.length === 0 && (
          <p className="text-slate-500 text-center italic mt-10 text-xs">
            System is idle. Connect your wallet and roll the dice to start generating
            events.
          </p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-fadeIn">
            <span className="text-slate-600 text-xs min-w-[40px]">
              {new Date(log.timestamp).toLocaleTimeString([], {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span
              className={`
                ${log.type === "success" ? "text-green-400" : ""}
                ${log.type === "danger" ? "text-red-400" : ""}
                ${log.type === "warning" ? "text-yellow-400" : ""}
                ${log.type === "info" ? "text-blue-300" : ""}
              `}
            >
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};