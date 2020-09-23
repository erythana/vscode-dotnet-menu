import * as vscode from 'vscode';
import { Logger } from './Logger';
import { Ressources } from './Ressources/Ressources';
import { LoggingModes } from './Models/LoggingModes';
import { DotnetHelper } from './DotnetHelper';

export function activate(context: vscode.ExtensionContext) {
	// The code you place here will be executed once when the application loaded
	let extensionName = context.extensionUri.path;

	Logger.logToConsole(`Loaded extension ${extensionName}`, LoggingModes.information);
	
	let dotnetHelper = new DotnetHelper(Ressources.Arguments.dotnetListTemplates);
	
	//Register Commands
	let enumerateCommand = vscode.commands.registerCommand(Ressources.Commands.enumerateCommand, () => dotnetHelper = new DotnetHelper(Ressources.Arguments.dotnetListTemplates));
	let menuCommand = vscode.commands.registerCommand(Ressources.Commands.menuCommand, () => {});//TODO: Only temporary, waiting for VSCode Devs to implement the menu item stuff at start of Oct. 2020

	context.subscriptions.push(enumerateCommand, menuCommand);
}