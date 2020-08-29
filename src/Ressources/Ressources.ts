import { type } from "os";

export module Ressources
{
    export module Messages{
        export const dotnetNotinstalled = "Is the dotnet SDK installed on your system and available in your PATH variable?\nCheck if you get output from dotnet by typing 'dotnet --info' into command line\nAfter fixing stuff you might want to retry with the 'Reload DOTNET Templates' command";
        export const dotnetGotTemplates = "Got all the available DOTNET Templates - now exposing them in File-Explorer context menu"; 
    }

    export module Arguments{
        export const dotnetListTemplates = "new -l";
        export const conditionsMet = "vscode-dotnet-menu:conditionsMet";
    }

    export module Commands{
        export const enumerateCommand = "vscode-dotnet-menu.EnumerateTemplates";
        export const menuCommand = "vscode-dotnet-menu.MenuCommand";
    }
}