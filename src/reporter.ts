/**
 * Frontier 3: Deterministic AI Agent Trajectory Evaluator
 * Terminal and HTML report formatters.
 */

import { AgentTrajectoryAuditSummary } from './types.js';

export function formatTrajectoryAuditTerminalReport(
  summary: AgentTrajectoryAuditSummary
): string {
  const lines: string[] = [];
  lines.push('================================================================');
  lines.push('🤖 AI AGENT TRAJECTORY BENCHMARK EVALUATION');
  lines.push('================================================================');
  lines.push(`Trajectory ID:   ${summary.trajectoryId}`);
  lines.push(`Agent Model:     ${summary.agentModel}`);
  lines.push(`Steps Audited:   ${summary.totalStepsEvaluated}`);
  lines.push(`Tokens Consumed: ${summary.totalTokensUsed.toLocaleString()}`);
  lines.push(`Final Score:     ${summary.evaluationScore} / 100`);
  lines.push(`Audit Verdict:   ${summary.passFailStatus}`);
  lines.push('================================================================\n');

  if (summary.exceptions.length === 0) {
    lines.push('✅ Clean Trajectory: Zero test tampering, zero credential leaks, and clean execution.');
    return lines.join('\n');
  }

  lines.push('ITEMIZED TRAJECTORY FAILURE MODES:');
  lines.push('────────────────────────────────────────────────────────────────');
  summary.exceptions.forEach((e, idx) => {
    lines.push(`[${e.severity}] #${idx + 1} Step ${e.stepIndex || 'N/A'}: ${e.type} (-${e.penaltyScore} pts)`);
    lines.push(`   Violation: ${e.explanation}`);
    lines.push(`   Evidence:  ${e.forensicEvidence}`);
    lines.push(`   Rubric:    ${e.rubricReference}`);
    lines.push(`   Fix:       ${e.recommendedAction}`);
    lines.push('────────────────────────────────────────────────────────────────');
  });

  return lines.join('\n');
}

export function generateTrajectoryAuditHtmlReport(
  summary: AgentTrajectoryAuditSummary
): string {
  const statusColor = summary.passFailStatus === 'PASS' ? '#22c55e' : '#ef4444';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agent Trajectory Audit: ${summary.trajectoryId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 32px; }
    .container { max-width: 960px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; }
    h1 { margin-top: 0; color: #38bdf8; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #0f172a; padding: 16px; border-radius: 8px; border-left: 4px solid #38bdf8; }
    .kpi-val { font-size: 24px; font-weight: bold; color: #f1f5f9; }
    .kpi-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #94a3b8; font-size: 12px; text-transform: uppercase; }
    .badge-critical { background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
    .badge-high { background: #ea580c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 AI Agent Trajectory Evaluation</h1>
    <p style="color: #94a3b8;">Trajectory: <strong>${summary.trajectoryId}</strong> | Model: <strong>${summary.agentModel}</strong></p>

    <div class="kpi-grid">
      <div class="kpi" style="border-left-color: ${statusColor};">
        <div class="kpi-val" style="color: ${statusColor};">${summary.passFailStatus}</div>
        <div class="kpi-label">Verdict</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">${summary.evaluationScore}/100</div>
        <div class="kpi-label">Trajectory Score</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">${summary.totalStepsEvaluated}</div>
        <div class="kpi-label">Steps Audited</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">${summary.criticalExceptionsCount}</div>
        <div class="kpi-label">Critical Defects</div>
      </div>
    </div>

    <h2>Evaluation Findings & Deductions</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Step</th>
          <th>Defect Code</th>
          <th>Penalty</th>
          <th>Forensic Diagnostic</th>
          <th>Remediation Requirement</th>
        </tr>
      </thead>
      <tbody>
        ${summary.exceptions.map(e => `
          <tr>
            <td><span class="badge-${e.severity.toLowerCase()}">${e.severity}</span></td>
            <td>Step ${e.stepIndex || 'N/A'}</td>
            <td><strong>${e.type}</strong></td>
            <td style="color:#ef4444; font-weight:bold;">-${e.penaltyScore}</td>
            <td>${e.explanation}<br><small style="color:#38bdf8;">${e.rubricReference}</small></td>
            <td>${e.recommendedAction}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
