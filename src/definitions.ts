import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from "vscode";
const YAML = require('yaml');
import { readFileSync } from "fs";




export enum RASADeclarationType {
    IntentDeclaration,
    ActionDeclaration,
    ResponseDeclaration,
    IntentInStory,
    ActionInStory,
    IntentInRule,
    ActionInRule,
    IntentInNLU,
    RuleLocation,
    StoryLocation
}

export class Domain {
	contributions: any = {}; 

	public get availableIntents()
	{
		let intents: any[] = [];
		Object.keys(this.contributions).forEach(contribution => {
			let intentsInContributingFile = this.contributions[contribution]["intents"].map(function(i: any) {return i["declaration"]});
			intents.push(...intentsInContributingFile); 
		});
		return intents;
	}

	public get availableActions()
	{
		let actions: any[] = [];
		Object.keys(this.contributions).forEach(contribution => {
			let actionsInContributingFile = this.contributions[contribution]["actions"].map(function(i: any) {return i["declaration"]});
			actions.push(...actionsInContributingFile); 
		});
		return actions;
	}

	public get filePaths()
	{
		return Object.keys(this.contributions); 
	}

	addContribution(sourceFile: string, entry: any|null)
	{
		if (!Object.keys(this.contributions).includes(sourceFile))
			this.contributions[sourceFile] = {
				"intents": [], 
				"actions": []
			};

		if (entry != null)
		{	
			switch(entry["type"])
			{
				case RASADeclarationType.IntentDeclaration:
					this.contributions[sourceFile]["intents"].push(entry);
					break; 

				case RASADeclarationType.ResponseDeclaration: 
				case RASADeclarationType.ActionDeclaration: 
					this.contributions[sourceFile]["actions"].push(entry);
					break; 

			}	
		}
	}

	resetContributor(sourceFile: string)
	{
		if (Object.keys(this.contributions).includes(sourceFile))
		{
			this.contributions[sourceFile] = {
				"intents": [], 
				"actions": []
			};
		}
	}
}

export class TrainingData {
	contributions: any = {}; 

	public get usedIntents()
	{
		let intents: any[] = [];
		Object.keys(this.contributions).forEach(contribution => {
			intents.push(...this.contributions[contribution]["stories"]["intents"].map(function(i: any) {return i["declaration"]})); 
			intents.push(...this.contributions[contribution]["rules"]["intents"].map(function(i: any) {return i["declaration"]}));
		});
		return intents;
	}

	public get usedActions()
	{
		let actions: any[] = [];
		Object.keys(this.contributions).forEach(contribution => {
			actions.push(...this.contributions[contribution]["stories"]["actions"].map(function(i: any) {return i["declaration"]})); 
			actions.push(...this.contributions[contribution]["rules"]["actions"].map(function(i: any) {return i["declaration"]})); 
		});
		return actions;
	}

	public get trainedIntents()
	{
		let intents: any[] = [];
		Object.keys(this.contributions).forEach(contribution => {
			intents.push(...this.contributions[contribution]["nlu"].map(function(i: any) {return i["declaration"]})); 
		});
		return intents;
	}

	public get filePaths()
	{
		return Object.keys(this.contributions); 
	}

	addContribution(sourceFile: string, entry: any|null)
	{
		if (!Object.keys(this.contributions).includes(sourceFile))
			this.contributions[sourceFile] = {
				"nlu": [], 
				"stories": {
					"locations": [],
					"intents": [], 
					"actions": []
				}, 
				"rules": {
					"locations": [],
					"intents": [], 
					"actions": []
				}
			};

		if (entry != null)
		{
			switch(entry["type"])
			{
				case RASADeclarationType.IntentInRule:
					this.contributions[sourceFile]["rules"]["intents"].push(entry); 
					break; 

				case RASADeclarationType.IntentInStory:
					this.contributions[sourceFile]["stories"]["intents"].push(entry);
					break; 

				case RASADeclarationType.ActionInRule:
					this.contributions[sourceFile]["rules"]["actions"].push(entry);
					break; 

				case RASADeclarationType.ActionInStory:
					this.contributions[sourceFile]["stories"]["actions"].push(entry); 
					break; 

				case RASADeclarationType.IntentInNLU: 
					this.contributions[sourceFile]["nlu"].push(entry);  
					break; 

				case RASADeclarationType.StoryLocation: 
					this.contributions[sourceFile]["stories"]["locations"].push(entry); 
					break;
			
				case RASADeclarationType.RuleLocation: 
					this.contributions[sourceFile]["rules"]["locations"].push(entry); 
					break;
			}	
		}
	}

	resetContributor(sourceFile: string)
	{
		if (Object.keys(this.contributions).includes(sourceFile))
		{
			this.contributions[sourceFile] = {
				"nlu": [], 
				"stories": {
					"intents": [], 
					"actions": []
				}, 
				"rules": {
					"intents": [], 
					"actions": []
				}
			};
		}
	}
}

export class RASATreeItem extends TreeItem
{
	type: string;
	constructor(label: string, collapsibleState: TreeItemCollapsibleState, type: string) 
	{
		super(label, collapsibleState);
		this.type = type;
	}
}


