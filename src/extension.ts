import * as vscode from 'vscode';
import { LoggingModes } from './Models/loggingModes';
import { ProjectTemplate } from './Models/ProjectTemplate';
import { Ressources } from './Ressources/Ressources';

export function activate(context: vscode.ExtensionContext) {
	// The code you place here will be executed once when the application loaded
	let extensionName = context.extensionUri.path;

	logToConsole(`Loaded extension ${extensionName}`, LoggingModes.information);
	
	//Initially get all dotnet templates, if possible, and register the Reload Command which is only visible when the conditionsMet Context is not set to true
	enumerateTemplatesHandler(Ressources.Arguments.dotnetListTemplates);

	//Register Commands
	let enumerateCommand = vscode.commands.registerCommand(Ressources.Commands.enumerateCommand, () => enumerateTemplatesHandler(Ressources.Arguments.dotnetListTemplates));
	let menuCommand = vscode.commands.registerCommand(Ressources.Commands.menuCommand, () => {});//TODO: Only temporary, waiting for VSCode Devs to implement the menu item stuff at start of Oct. 2020

	context.subscriptions.push(enumerateCommand, menuCommand);
}

const enumerateTemplatesHandler = (templateString: string) => 
	{
		runCommand(templateString).then(
			(output) => {
				let templateArray = getTemplateArrFromDOTNETString(output as string);
				logToConsole(Ressources.Messages.dotnetGotTemplates, LoggingModes.information);
				//Set context to let the UI know that we can expose the context menu and disable the reload in the command palette
				vscode.commands.executeCommand('setContext', Ressources.Arguments.conditionsMet, true);
			}).catch((message) => {
				logToConsole(`${message}${Ressources.Messages.dotnetNotinstalled}`, LoggingModes.error);
			});	
	};

function getTemplateArrFromDOTNETString(dotnetOutput: string): ProjectTemplate[]
{
	let projectTemplates: ProjectTemplate[] = [];
	let foundTemplateSection = false;

	dotnetOutput.split("\n").forEach(line => {
		if(foundTemplateSection && line.length > 0){
			let templateArray = line.split("  ").filter(x => x !== "" && x !== " ");
			if (templateArray.length > 3){//TODO: CHECK ON HOW TO DYNAMICALLY SPLIT WHEN THERE IS NO LANGUAGE SPECIFIED

				templateArray[2].split(",").forEach(x => {
					x = x.replace("[","").replace("]","").trim();
					projectTemplates.push(new ProjectTemplate(templateArray[0], templateArray[1], x, templateArray[3]));
				});
			}
		}
		//We found the characters which seperates the header from the actual values, after settings this flag we can add the keys to our dictionary
		if (line.includes("------------------------------")){
			foundTemplateSection = true;
		}
	});
	return projectTemplates;
}

function logToConsole(message: string, type: LoggingModes) {
	console.log(`---${new Date().toLocaleTimeString()} ${LoggingModes[type]}\n${message}`);
}

function runCommand(dotnetArguments: string): Promise<unknown> {
	var promise = new Promise((resolve, reject) => {
		const cp = require('child_process');
		cp.exec(`dotnet2 ${dotnetArguments}`, (err: string, stdout: string, stderr: string) => {
			if (stderr.length > 0) {//TODO: ADD FURTHER ERROR HANDLING
				reject(`${stderr}`);}
			resolve(stdout);
		});
	});
	return promise;
}