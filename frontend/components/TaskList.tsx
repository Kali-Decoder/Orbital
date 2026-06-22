"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";
import { TaskRow } from "./TaskRow";

export function TaskList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border border-line px-3 py-8 text-center font-mono text-xs text-muted">
        LOADING...
      </div>
    );
  }

  return <TaskListInner />;
}

function TaskListInner() {
  const { data: taskCount, isLoading } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "taskCount",
  });

  const { data: owner } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "owner",
  });

  const count = taskCount ? Number(taskCount) : 0;
  // Task IDs start at 1 (the contract increments taskCount before storing).
  const taskIds = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className="border border-line">
      <table className="w-full text-left">
        <thead className="bg-surface">
          <tr className="border-b border-line">
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-muted">ID</th>
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-muted">Agent</th>
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-muted">Amount</th>
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-muted">Status</th>
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-muted">Action</th>
          </tr>
        </thead>
        <tbody>
          {taskIds.map((id) => (
            <TaskRow key={id} taskId={id} owner={owner as string | undefined} />
          ))}
        </tbody>
      </table>
      {!isLoading && count === 0 && (
        <p className="px-3 py-8 text-center font-mono text-xs text-muted">NO TASKS YET</p>
      )}
      {isLoading && <p className="px-3 py-8 text-center font-mono text-xs text-muted">LOADING...</p>}
    </div>
  );
}
