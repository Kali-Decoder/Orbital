export const AGENTS = [
  {
    name: "Research Agent",
    role: "Searches and gathers data on the given topic",
    roleKey: "research" as const,
    address: "0x1AC038fE3cccd19a46e3aFEF13c7423BAdBF3B4A" as `0x${string}`,
    did: "did:t3n:a8d506961b64e168282d03dce1c935567b595491",
  },
  {
    name: "Analysis Agent",
    role: "Analyses gathered data and produces insights",
    roleKey: "analysis" as const,
    address: "0x8f424b97D9195Dd25418702b1c54A2bC66e0f349" as `0x${string}`,
    did: "did:t3n:9c7cdb55a2a6a4fbd8548264ee7c7c321ff34faf",
  },
  {
    name: "Writer Agent",
    role: "Writes the final report from the analysis",
    roleKey: "writer" as const,
    address: "0xb886b8a7E755F4Bc5F1ddFB823f1169dB595507a" as `0x${string}`,
    did: "did:t3n:816b6a1242f0be06e16c7279246954f677e38f0d",
  },
];
