import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type ReportTask = {
  agent: { name: string };
  did?: string;
  output?: string;
};

export type ExportFormat = "txt" | "pdf" | "png";

function reportFilename(goal: string, format: ExportFormat): string {
  const slug =
    goal
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "mission";
  const date = new Date().toISOString().slice(0, 10);
  return `orbital-${slug}-${date}.${format}`;
}

export function buildReportText(goal: string, tasks: ReportTask[]): string {
  const header = [
    "ORBITAL MISSION REPORT",
    "=".repeat(40),
    `Objective: ${goal}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
  ].join("\n");

  const sections = tasks.map((task) =>
    [
      task.agent.name,
      task.did ? `DID: ${task.did}` : "DID: unverified",
      "-".repeat(40),
      task.output ?? "",
      "",
    ].join("\n")
  );

  return `${header}${sections.join("\n")}`.trimEnd() + "\n";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadReportTxt(goal: string, tasks: ReportTask[]) {
  const text = buildReportText(goal, tasks);
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), reportFilename(goal, "txt"));
}

async function captureReportCanvas(element: HTMLElement) {
  return html2canvas(element, {
    backgroundColor: "#0d1117",
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

export async function downloadReportPng(element: HTMLElement, goal: string) {
  const canvas = await captureReportCanvas(element);
  canvas.toBlob((blob) => {
    if (!blob) throw new Error("Failed to generate PNG");
    downloadBlob(blob, reportFilename(goal, "png"));
  }, "image/png");
}

export async function downloadReportPdf(element: HTMLElement, goal: string) {
  const canvas = await captureReportCanvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(reportFilename(goal, "pdf"));
}

export async function downloadReport(
  format: ExportFormat,
  goal: string,
  tasks: ReportTask[],
  reportElement: HTMLElement | null
) {
  if (format === "txt") {
    downloadReportTxt(goal, tasks);
    return;
  }

  if (!reportElement) {
    throw new Error("Report is not ready to export yet");
  }

  if (format === "png") {
    await downloadReportPng(reportElement, goal);
    return;
  }

  await downloadReportPdf(reportElement, goal);
}
