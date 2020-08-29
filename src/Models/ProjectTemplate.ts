export class ProjectTemplate {
    constructor(templateName: string, shortName: string, language: string, tag: string) {
        this.templateName = templateName;
        this.shortName = shortName;
        this.language = language;
        this.tag = tag;
    }

    templateName: string;
    shortName: string;
    language: string;
    tag: string;
}