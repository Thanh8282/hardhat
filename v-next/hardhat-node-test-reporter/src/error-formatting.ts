import { pathToFileURL } from "node:url";
import { inspect } from "node:util";

import chalk from "chalk";
import { diff } from "jest-diff";

// TODO: Clean up the node internal fames from the stack trace
export function formatError(error: Error): string {
  if ("code" in error && error.code === "ERR_TEST_FAILURE") {
    if (error.cause instanceof Error) {
      error = error.cause;
    }

    if ("failureType" in error && error.failureType === "cancelledByParent") {
      return (
        chalk.red("Test cancelled by parent error") +
        "\n" +
        chalk.gray(
          "    This test was cancelled due to an error in its parent suite/it or test/it, or in one of its before/beforeEach",
        )
      );
    }
  }

  const defaultFormat = inspect(error);
  const indexOfMessage = defaultFormat.indexOf(error.message);

  let title: string;
  let stack: string;
  if (indexOfMessage !== -1) {
    title = defaultFormat.substring(0, indexOfMessage + error.message.length);
    stack = defaultFormat
      .substring(indexOfMessage + error.message.length)
      .replace(/^(\r?\n)*/, "");
  } else {
    title = error.message;
    stack = error.stack ?? "";
  }

  title = chalk.red(title);
  stack = replaceFileUrlsWithRelativePaths(stack);
  stack = chalk.gray(stack);

  const diffResult = getErrorDiff(error);

  if (diffResult === undefined) {
    return `${title}
${stack}`;
  }

  return `${title}
${diffResult}

${stack}`;
}

// TODO: Do this in a more robust way and that works well with windows
function replaceFileUrlsWithRelativePaths(stack: string): string {
  return stack.replaceAll(
    "(" + pathToFileURL(process.cwd() + "/").toString(),
    "(",
  );
}

function isDiffableError(
  error: Error,
): error is Error & { actual: any; expected: any } {
  return (
    "expected" in error && "actual" in error && error.expected !== undefined
  );
}

function getErrorDiff(error: Error): string | undefined {
  if (!isDiffableError(error)) {
    return undefined;
  }

  if ("showDiff" in error && error.showDiff === false) {
    return undefined;
  }

  return diff(error.expected, error.actual) ?? undefined;
}
