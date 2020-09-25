import { ProjectTemplate } from './Models/ProjectTemplate';
import { LoggingModes } from './Models/LoggingModes';
import { Ressources } from './Ressources/Ressources';
import * as vscode from 'vscode';
import { Logger } from './Logger';

export class DotnetHelper {
    constructor(dotnetArguments: string) {
        this.runDotnetCommand(dotnetArguments).then(
			(output) => {
                this.dotnetTemplates = this.processDotnetOutput(output as string);
                Logger.logToConsole(Ressources.Messages.dotnetGotTemplates, LoggingModes.information);
                vscode.commands.executeCommand('setContext', Ressources.Arguments.conditionsMet, true); //Set context to let the UI know that we can expose the context menu and disable the reload in the command palette
			}).catch((message) => {
                Logger.logToConsole(`${message}${Ressources.Messages.dotnetNotinstalled}`, LoggingModes.error);
                this.dotnetTemplates;
            });
    }

    //#region Properties

    public dotnetTemplates: ProjectTemplate[] = [];
    readonly templateCount: number = this.dotnetTemplates.length;

    //#endregion 
    
   //#region Methods

    private runDotnetCommand(dotnetArguments: string): Promise<unknown> {
        var promise = new Promise((resolve, reject) => {
            const cp = require('child_process');
            cp.exec(`dotnet ${dotnetArguments}`, (err: string, stdout: string, stderr: string) => {
                if (stderr.length > 0) {
                    reject(`${stderr}`);}
                resolve(stdout);
            });
        });
        return promise;
    }

    private processDotnetOutput(dotnetOutput: string): ProjectTemplate[]
    {
        let projectTemplates: ProjectTemplate[] = [];
        let dotnetCategoryIndexes: number[] = [];
    
        let seperatedDotnetOutput = dotnetOutput.split("\n");
        let startOfTemplates: number = 0;
        
        for (const [index, line] of seperatedDotnetOutput.entries()){
            if(this.isHeaderSeperator(line, Ressources.Arguments.dotnetSeperator)){
                dotnetCategoryIndexes = this.returnHeaderIndexes(seperatedDotnetOutput[index-1]);
                startOfTemplates = index+2;
                break;
            }
        }

        if (dotnetCategoryIndexes.length !== 4){
            Logger.logToConsole(dotnetCategoryIndexes.length.toString(), LoggingModes.error);
            Logger.logToConsole(Ressources.Messages.dotnetErrorGettingIndexes, LoggingModes.error); // TODO: THROW ERROR OR DO SOME OTHER THING
        }
        for (let i = startOfTemplates; i < seperatedDotnetOutput.length && seperatedDotnetOutput[i].trim() !== ""; i++){ // Second condition is to check wheter we are at the end of the processable tempaltes (e.G. if the line is blank)
            let languages = this.returnHeaderFromIndex(seperatedDotnetOutput[i], dotnetCategoryIndexes[2]).split(",");
            
            languages.forEach(language => {
                let projectTemplate: ProjectTemplate = {
                    templateName: this.returnHeaderFromIndex(seperatedDotnetOutput[i], dotnetCategoryIndexes[0]),
                    shortName: this.returnHeaderFromIndex(seperatedDotnetOutput[i], dotnetCategoryIndexes[1]),
                    language: language.replace("[","").replace("]","").trim(),
                    tag: this.returnHeaderFromIndex(seperatedDotnetOutput[i], dotnetCategoryIndexes[3])
                };
                Logger.logToConsole('Adding template to collection:\n' + JSON.stringify(projectTemplate, null, 2), LoggingModes.information); // TODO: Remove
                projectTemplates.push(projectTemplate);
            });
        }
        return projectTemplates;
    }

    private isHeaderSeperator(line: string, seperator: string): boolean{
        return line.includes(seperator);
    }

    private returnHeaderIndexes(headerString: string): number[]{
        let headerIndexes: number[] = [];
        let headerArray = headerString.split("  ").filter(x => x !== "" && x !== " ");
        headerArray.forEach(x => 
            {
                x = x.trim();
                headerIndexes.push(headerString.indexOf(x));
            });

        return headerIndexes;
    }

    private returnHeaderFromIndex(line: string, index: number): string{
        return line.slice(index, line.indexOf("  ", index));
    }

    //#endregion
}