import { existsSync, readFileSync, writeFileSync } from "fs";
import { hideBin } from "yargs/helpers";
import { Compiler, CompilerError } from ".";
import { highlight } from "cli-highlight";
import yargs from "yargs";
import chalk from "chalk";
import { join, parse, resolve } from "path";

yargs(hideBin(process.argv))
  .command(
    "$0 [path] [out]",
    "compiles your Javascript file to MLog",
    yargs => {
      return yargs
        .positional("path", {
          describe: "path of the file to compile",
          type: "string",
        })
        .positional("out", {
          describe: "path of the output file",
          type: "string",
        })
        .option("compact-names", {
          type: "boolean",
          default: false,
          describe:
            "Wether the compiler should preserve or compact variable and function names",
        });
    },
    argv => {
      const path = argv.path;
      if (!path) return console.log("missing required path argument");
      if (!existsSync(path))
        return console.log(`file at ${path} does not exist`);
      const out = argv.out ?? defaultOutPath(path);
      if (path == out)
        return console.log("The out path cannot be the same as the input path");
      const compiler = new Compiler({
        compactNames: argv["compact-names"],
      });
      const code = readFileSync(path, "utf8");
      const [output, error, [node]] = compiler.compile(code);
      if (error) {
        let start = (error as CompilerError).loc as {
          line: number;
          column: number;
        };
        let end = start;

        if (node) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          start = node.loc!.start;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          end = node.loc!.end;
        }

        const lines = code.split("\n");
        console.log(
          chalk.cyanBright([resolve(path), start.line, start.column].join(":"))
        );
        for (
          let i = Math.max(start.line - 3, 0);
          i < Math.min(end.line + 2, lines.length);
          i++
        ) {
          const n = i + 1;
          const head = chalk.gray(`${n} | `.padStart(6, " "));
          console.log(head + highlight(lines[i], { language: "js" }));
          if (n === start.line) {
            console.log(
              chalk.red(" ".repeat(6 + start.column) + "^ " + error.message)
            );
          }
        }

        return;
      }
      writeFileSync(out, output);
      console.log(
        `Success: Compiled ${path}. Your compiled code is at ${out}.`
      );
    }
  )
  .help()
  .scriptName("mlogjs")
  .demandCommand()
  .parse();

function defaultOutPath(path: string) {
  const parsed = parse(path);
  return join(parsed.dir, `${parsed.name}.mlog`);
}
