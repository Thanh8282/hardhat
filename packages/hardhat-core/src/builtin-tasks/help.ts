import { HelpPrinter } from "../internal/cli/HelpPrinter";
import { HARDHAT_EXECUTABLE_NAME, HARDHAT_NAME } from "../internal/constants";
import { task } from "../internal/core/config/config-env";
import { HardhatError } from "../internal/core/errors";
import { ERRORS } from "../internal/core/errors-list";
import { HARDHAT_PARAM_DEFINITIONS } from "../internal/core/params/hardhat-params";

import { TASK_HELP } from "./task-names";

task(TASK_HELP, "Prints this message")
  .addOptionalPositionalParam(
    "scopeOrTask",
    "An optional task to print more info about"
  )
  .addOptionalPositionalParam(
    "task",
    "An optional task to print more info about"
  )
  .setAction(
    async (
      {
        scopeOrTask: first,
        task: second,
      }: { scopeOrTask?: string; task?: string },
      { tasks, scopes, version }
    ) => {
      const helpPrinter = new HelpPrinter(
        HARDHAT_NAME,
        HARDHAT_EXECUTABLE_NAME,
        version,
        HARDHAT_PARAM_DEFINITIONS,
        tasks,
        scopes
      );

      if (first !== undefined && first !== TASK_HELP) {
        if (scopes[first] !== undefined) {
          // first is a valid scope
          if (second !== undefined && second !== TASK_HELP) {
            if (scopes[first].tasks[second] !== undefined) {
              // second is a valid task under the scope
              helpPrinter.printTaskHelp(scopes[first].tasks[second]);
              return;
            } else {
              // task second is not present under this scope
              throw new HardhatError(
                ERRORS.ARGUMENTS.UNRECOGNIZED_SCOPED_TASK,
                { scope: first, task: second }
              );
            }
          } else {
            // print scope help
            helpPrinter.printScopeHelp(first);
            return;
          }
        } else if (tasks[first] !== undefined) {
          // first is a valid task
          helpPrinter.printTaskHelp(tasks[first]);
          return;
        } else {
          // first is not a valid scope or task
          throw new HardhatError(ERRORS.ARGUMENTS.UNRECOGNIZED_TASK, {
            task: first,
          });
        }
      } else {
        // print global help
        helpPrinter.printGlobalHelp();
        return;
      }
    }
  );
