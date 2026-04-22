import { TAG_PREFIXES, hasKnownPrefix } from './pr-title-tagging.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_PREFIXES = Object.values(TAG_PREFIXES);

function buildValidationFailureMessage(prTitle) {
  const shownTitle = typeof prTitle === 'string' && prTitle.trim().length > 0 ? prTitle.trim() : '(empty title)';

  return [
    `Invalid PR title: "${shownTitle}"`,
    `Allowed adversarial-review prefixes: ${REQUIRED_PREFIXES.join(', ')}`,
    'Prefix matching is case-insensitive.',
    'Why this check exists: reviewer routing depends on creation-time tag correctness.',
    'This validation check reruns when PR title is edited, but reviewer routing does not backfill.',
    'Recovery path for malformed creation-time titles: close and recreate the PR with a valid prefix.',
  ].join('\n');
}

function validatePRTitlePrefix(prTitle) {
  if (typeof prTitle !== 'string' || prTitle.trim().length === 0) {
    return {
      valid: false,
      message: buildValidationFailureMessage(prTitle),
    };
  }

  if (!hasKnownPrefix(prTitle)) {
    return {
      valid: false,
      message: buildValidationFailureMessage(prTitle),
    };
  }

  return {
    valid: true,
    message: `PR title prefix is valid. Allowed prefixes: ${REQUIRED_PREFIXES.join(', ')}`,
  };
}

function getPRTitleFromCliOrEnv(argv = process.argv.slice(2), env = process.env) {
  if (argv.length > 1) {
    return {
      ok: false,
      message: 'Usage: node scripts/pr-title-validate.mjs [optional-title]. Prefer PR_TITLE env in CI.',
    };
  }

  if (argv.length === 1) {
    return { ok: true, value: argv[0] };
  }

  return { ok: true, value: env.PR_TITLE };
}

function runCli(argv = process.argv.slice(2), env = process.env) {
  const titleInput = getPRTitleFromCliOrEnv(argv, env);
  if (!titleInput.ok) {
    console.error(titleInput.message);
    process.exitCode = 1;
    return;
  }

  const result = validatePRTitlePrefix(titleInput.value);

  if (!result.valid) {
    console.error(result.message);
    process.exitCode = 1;
    return;
  }

  console.log(result.message);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli();
}

export {
  REQUIRED_PREFIXES,
  buildValidationFailureMessage,
  getPRTitleFromCliOrEnv,
  runCli,
  validatePRTitlePrefix,
};
