import { ProjectTemplate } from './Models/ProjectTemplate';
import { LoggingModes } from './Models/LoggingModes';
import { Ressources } from './Ressources/Ressources';
import * as vscode from 'vscode';
import { Logger } from './Logger';
import { stringify } from 'querystring';

export class DotnetHelper {
    constructor(dotnetArguments: string) {
        let test = this.enumerateTemplatesHandler(dotnetArguments);
        
    }
    dotnetCategoryIndexes: number[] = [];
    dotnetTemplates: ProjectTemplate[] = [];




    enumerateTemplatesHandler = (templateString: string) => 
	{
		this.runDotnetCommand(templateString).then(
			(output) => {
                let templateArray = this.processDotnetOutput(output as string);
                Logger.logToConsole(Ressources.Messages.dotnetGotTemplates, LoggingModes.information);
                vscode.commands.executeCommand('setContext', Ressources.Arguments.conditionsMet, true); //Set context to let the UI know that we can expose the context menu and disable the reload in the command palette
			}).catch((message) => {
				Logger.logToConsole(`${message}${Ressources.Messages.dotnetNotinstalled}`, LoggingModes.error);
			});	
    };
    
    runDotnetCommand(dotnetArguments: string): Promise<unknown> {
        var promise = new Promise((resolve, reject) => {
            const cp = require('child_process');
            cp.exec(`dotnet ${dotnetArguments}`, (err: string, stdout: string, stderr: string) => {
                if (stderr.length > 0) {//TODO: ADD FURTHER ERROR HANDLING
                    reject(`${stderr}`);}
                resolve(stdout);
            });
        });
        return promise;
    }

    processDotnetOutput(dotnetOutput: string): ProjectTemplate[]
    {
        let projectTemplates: ProjectTemplate[] = [];
        
        let seperatedDotnetOutput = dotnetOutput.split("\n");
        let startOfTemplates: number = 0;
        
        for (const [index, line] of seperatedDotnetOutput.entries()){
            if(this.isHeaderSeperator(line, Ressources.Arguments.dotnetSeperator)){
                this.dotnetCategoryIndexes = this.returnHeaderIndexes(seperatedDotnetOutput[index-1]);
                startOfTemplates = index+2;
                break;
            }
        }

        if (this.dotnetCategoryIndexes.length !== 4){
            Logger.logToConsole(this.dotnetCategoryIndexes.length.toString(), LoggingModes.error);
            Logger.logToConsole(Ressources.Messages.dotnetErrorGettingIndexes, LoggingModes.error); // TODO: THROW ERROR OR DO SOME OTHER THING
        }
        for (let i = startOfTemplates; i < seperatedDotnetOutput.length && seperatedDotnetOutput[i].trim() !== ""; i++){ // Second condition is to check wheter we are at the end of the processable tempaltes (e.G. if the line is blank)
            let languages = this.returnHeaderFromIndex(seperatedDotnetOutput[i], this.dotnetCategoryIndexes[2]).split(",");
            
            languages.forEach(language => {
                let projectTemplate: ProjectTemplate = {
                    templateName: this.returnHeaderFromIndex(seperatedDotnetOutput[i], this.dotnetCategoryIndexes[0]),
                    shortName: this.returnHeaderFromIndex(seperatedDotnetOutput[i], this.dotnetCategoryIndexes[1]),
                    language: language.replace("[","").replace("]","").trim(),
                    tag: this.returnHeaderFromIndex(seperatedDotnetOutput[i], this.dotnetCategoryIndexes[3])
                };
                Logger.logToConsole('Adding template to collection:\n' + JSON.stringify(projectTemplate, null, 2), LoggingModes.information); // TODO: Remove
                projectTemplates.push(projectTemplate);
            });
        }
        return projectTemplates;
    }

    isHeaderSeperator(line: string, seperator: string): boolean{
        return line.includes(seperator);
    }

    returnHeaderIndexes(headerString: string): number[]{
        let headerIndexes: number[] = [];
        let headerArray = headerString.split("  ").filter(x => x !== "" && x !== " ");
        headerArray.forEach(x => 
            {
                x = x.trim();
                headerIndexes.push(headerString.indexOf(x))
            });

        return headerIndexes;
    }

    returnHeaderFromIndex(line: string, index: number): string{
        return line.slice(index, line.indexOf("  ", index));
    }
}