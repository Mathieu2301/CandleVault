/**
 * Failure containment for the agent.
 *
 * The agent used to die whenever a third-party API misbehaved: a rejected
 * promise in a best-effort background job (crypto notifications) escaped
 * unhandled, and Node >= 15 turns that into `process.exit(1)`. Kubernetes then
 * restarted the pod, forever.
 *
 * Two layers, on purpose:
 *  - `runSafely` / `scheduleSafely` contain failures at the job boundary, so a
 *    broken notification feature degrades instead of taking trading down.
 *  - `installSafetyNet` is the last-resort backstop for anything we missed.
 */

/** @typedef {{ error: Function, log: Function }} Logger */

const stamp = () => new Date().toISOString();

/**
 * Keep the process alive when an error escapes every local handler.
 *
 * Deliberate availability trade-off: for this agent the realistic uncaught
 * errors are I/O failures (a dead HTTP host, a dropped socket), not corrupted
 * state, and the alternative we are fixing is a guaranteed crash loop. Anything
 * caught here is a bug to fix at the source — it is logged loudly, not hidden.
 *
 * @param {{ logger?: Logger }} [options]
 */
function installSafetyNet({ logger = console } = {}) {
  process.on('unhandledRejection', (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.error(`${stamp()} [unhandledRejection] ${err.stack || err.message}`);
  });

  process.on('uncaughtException', (err) => {
    logger.error(`${stamp()} [uncaughtException] ${err.stack || err.message}`);
  });
}

/**
 * Run a background job, absorbing any failure.
 *
 * @template T
 * @param {string} name Job name, for logs.
 * @param {() => T | Promise<T>} fn
 * @param {{ logger?: Logger }} [options]
 * @returns {Promise<T | undefined>} Never rejects.
 */
async function runSafely(name, fn, { logger = console } = {}) {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`${stamp()} [${name}] failed: ${err.message}`);
    return undefined;
  }
}

/**
 * Run a job now, then on an interval, absorbing failures so one bad run never
 * stops the schedule.
 *
 * @param {string} name
 * @param {() => unknown} fn
 * @param {number} intervalMs
 * @param {{ logger?: Logger, immediate?: boolean }} [options]
 * @returns {() => void} Stop function.
 */
function scheduleSafely(name, fn, intervalMs, { logger = console, immediate = true } = {}) {
  if (immediate) runSafely(name, fn, { logger });
  const timer = setInterval(() => runSafely(name, fn, { logger }), intervalMs);
  return () => clearInterval(timer);
}

module.exports = { installSafetyNet, runSafely, scheduleSafely };
