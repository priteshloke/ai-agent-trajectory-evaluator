#!/usr/bin/env node
/**
 * Frontier 3: Deterministic AI Agent Trajectory Evaluator
 * CLI entrypoint.
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluateTrajectoryRecord } from './engine.js';
import { MOCK_AGENT_TRAJECTORIES } from './fixtures.js';
import {
  formatTrajectoryAuditTerminalReport,
  generateTrajectoryAuditHtmlReport,
} from './reporter.js';
import { AgentTrajectoryRecord } from './types.js';

const program = new Command();

program
  .name('agent-eval')
  .description('Audit AI agent trajectories for test tampering, secret leaks, hallucinated dependencies and thrashing')
  .option('-i, --input <path>', 'Path to agent trajectory JSON file')
  .option('--demo', 'Run audit against built-in trajectory benchmark fixtures', false)
  .option('-o, --output <path>', 'Path to write HTML report')
  .option('--json', 'Output raw summary as JSON', false)
  .action(async (options) => {
    let trajectories: AgentTrajectoryRecord[] = [];

    if (options.demo) {
      trajectories = MOCK_AGENT_TRAJECTORIES;
    } else if (options.input) {
      const p = resolve(process.cwd(), options.input);
      if (!existsSync(p)) {
        console.error(`❌ Input file not found: ${p}`);
        process.exit(1);
      }
      const raw = JSON.parse(readFileSync(p, 'utf-8'));
      trajectories = Array.isArray(raw) ? raw : [raw];
    } else {
      console.error('❌ Provide --input <file.json> or run with --demo');
      process.exit(1);
    }

    const summaries = trajectories.map(t => evaluateTrajectoryRecord(t));

    if (options.json) {
      console.log(JSON.stringify(summaries, null, 2));
      return;
    }

    for (const summary of summaries) {
      console.log(formatTrajectoryAuditTerminalReport(summary));
      console.log('');
    }

    if (options.output) {
      const outPath = resolve(process.cwd(), options.output);
      const combinedHtml = summaries.map(s => generateTrajectoryAuditHtmlReport(s)).join('\n<!-- PAGE BREAK -->\n');
      writeFileSync(outPath, combinedHtml, 'utf-8');
      console.log(`\n📄 HTML report generated at: ${outPath}`);
    }
  });

program.parse(process.argv);
