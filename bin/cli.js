#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import chalk from "chalk";
import { execSync } from "child_process";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name("expresscreatepragyan")
  .description("CLI to create ready-to-go Express backend starter")
  .version("1.0.0");

program
  .command("new")
  .description("Create a new Express backend project")
  .argument("<project-name>", "Project folder name")
  .action(async (projectName) => {
    const projectPath = join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      console.log(chalk.red("Folder already exists!"));
      return;
    }

    // Ask user which DB they want
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "db",
        message: "Which database do you want?",
        choices: ["MongoDB", "PostgreSQL", "None"],
        default: "MongoDB",
      },
    ]);

    console.log(chalk.green(`Creating project "${projectName}"...`));

    // Copy template folder
    fs.copySync(join(__dirname, "../templates/express"), projectPath);

    // Update .env based on DB choice
    const envPath = join(projectPath, ".env");
    fs.appendFileSync(
      envPath,
      answers.db === "MongoDB"
        ? "\nMONGO_URI=your_mongo_connection_string_here"
        : answers.db === "PostgreSQL"
        ? "\nPG_URI=your_postgres_connection_string_here"
        : ""
    );

    // Install dependencies
    console.log(chalk.yellow("Installing dependencies..."));
    execSync(`cd ${projectName} && npm install`, { stdio: "inherit" });

    console.log(chalk.green(`Project ${projectName} created successfully!`));
    console.log(chalk.blue(`Run:\n cd ${projectName}\n npm run dev`));
  });

program.parse(process.argv);
