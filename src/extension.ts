import * as vscode from 'vscode';
import { LoggingModes } from './Models/loggingModes';
import { ProjectTemplate } from './Models/ProjectTemplate';
let prerequesitsMet = false;

export function activate(context: vscode.ExtensionContext) {
	// The code you place here will be executed once when the application loaded
	let extensionName = context.extensionUri.path;
	const dotnetTemplateString = 'dotnet2 new -l'; //TODO: Expose with settings

	logToConsole(`Loaded extension ${extensionName}`, LoggingModes.information);

	tryGetDOTNETTemplates(dotnetTemplateString).then(
		(output) => {
			//logToConsole(output as string, LoggingModes.information);
			let templateArray = getTemplateArrFromDOTNETString(output as string);
			logToConsole("Got all the available DOTNET Templates - now exposing them in File-Explorer context menu", LoggingModes.information);
			prerequesitsMet = true;
		}).catch((message) => {
			logToConsole(message, LoggingModes.error);
		});

	let disposable = vscode.commands.registerCommand('vscode-dotnet-menu.EnumerateTemplates', commandHandler);
	
	context.subscriptions.push(disposable);
}

function commandHandler(): any{ 
	if (prerequesitsMet){
		vscode.window.showInformationMessage('Activated Extension - remove after debugging');
	}
}

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
	console.log(`\n${new Date().toLocaleTimeString()} ${LoggingModes[type]}${message}`);
}

function tryGetDOTNETTemplates(availableDOTNETTemplates: string): Promise<unknown> {
	var promise = new Promise((resolve, reject) => {
		const cp = require('child_process');
		cp.exec(availableDOTNETTemplates, (err: string, stdout: string, stderr: string) => {
			if (stderr.length > 0) {//TODO: ADD FURTHER ERROR HANDLING
				reject(`${stderr}Is the dotnet SDK installed on your system and available in your PATH variable?\nCheck if you get output from dotnet by typing 'dotnet --info' into command line`);
			}
			resolve(stdout);
		});
	});
	return promise;
}

interface Dictionary {
	[Key: string]: any;
}