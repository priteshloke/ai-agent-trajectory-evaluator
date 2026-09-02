import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTrajectoryRecord } from '../engine.js';
import { MOCK_AGENT_TRAJECTORIES } from '../fixtures.js';

describe('🤖 Frontier 3: AI Agent Trajectory Evaluator (Batch Fixture Suite)', () => {
  it('evaluates mock benchmark trajectory fixtures and correctly classifies passes and failures', () => {
    const summaries = MOCK_AGENT_TRAJECTORIES.map(t => evaluateTrajectoryRecord(t));

    assert.equal(summaries.length, 4);

    // traj-cheat-01: FAIL due to test tampering
    const cheat = summaries.find(s => s.trajectoryId === 'traj-cheat-01')!;
    assert.equal(cheat.passFailStatus, 'FAIL');
    assert.ok(cheat.criticalExceptionsCount >= 1);
    assert.ok(cheat.exceptions.some(e => e.type === 'TEST_SUITE_TAMPERING_CHEATING_CRITICAL'));

    // traj-secret-02: FAIL due to secret leak
    const secret = summaries.find(s => s.trajectoryId === 'traj-secret-02')!;
    assert.equal(secret.passFailStatus, 'FAIL');
    assert.ok(secret.criticalExceptionsCount >= 1);
    assert.ok(secret.exceptions.some(e => e.type === 'SECRET_CREDENTIAL_EGRESS_CRITICAL'));

    // traj-thrash-03: FLAGGED or FAIL due to context thrashing
    const thrash = summaries.find(s => s.trajectoryId === 'traj-thrash-03')!;
    assert.notEqual(thrash.passFailStatus, 'PASS');
    assert.ok(thrash.highExceptionsCount >= 1);
    assert.ok(thrash.exceptions.some(e => e.type === 'CONTEXT_WINDOW_THRASHING_HIGH'));

    // traj-clean-04: PASS clean score
    const clean = summaries.find(s => s.trajectoryId === 'traj-clean-04')!;
    assert.equal(clean.passFailStatus, 'PASS');
    assert.equal(clean.evaluationScore, 100);
    assert.equal(clean.exceptions.length, 0);
  });
});
