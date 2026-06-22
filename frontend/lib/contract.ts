export const ESCROW_ADDRESS = "0x5E6658ac6cBC9b0109C28BED00bC4Af0F0A3f1CD";

/** Native 0G locked per agent hire in createTask. */
export const ESCROW_AMOUNT_PER_TASK_OG = "0.00001";

export const ESCROW_ABI = [
  {
    type: "function",
    name: "createTask",
    stateMutability: "payable",
    inputs: [
      { name: "_agent", type: "address" },
      { name: "_verifiedDid", type: "string" }, // NEW
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "markCompleted",
    stateMutability: "nonpayable",
    inputs: [{ name: "_taskId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "releasePayment",
    stateMutability: "nonpayable",
    inputs: [{ name: "_taskId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "taskCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "tasks",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "agent", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "isCompleted", type: "bool" },
      { name: "isPaid", type: "bool" },
      { name: "verifiedDid", type: "string" }, // NEW
    ],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "TaskCreated",
    inputs: [
      { name: "taskId", type: "uint256", indexed: false },
      { name: "agent", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "verifiedDid", type: "string", indexed: false }, // NEW
    ],
  },
  {
    type: "event",
    name: "TaskCompleted",
    inputs: [{ name: "taskId", type: "uint256", indexed: false }],
  },
  {
    type: "event",
    name: "PaymentReleased",
    inputs: [
      { name: "taskId", type: "uint256", indexed: false },
      { name: "agent", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;