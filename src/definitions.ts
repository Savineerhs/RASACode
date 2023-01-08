import { Uri } from "vscode";
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
	IntentInNLU
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

	addContribution(sourceFile: string, entry: any)
	{
		if (!Object.keys(this.contributions).includes(sourceFile))
			this.contributions[sourceFile] = {
				"intents": [], 
				"actions": []
			};

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

	resetContributor(sourceFile: string)
	{
		if (Object.keys(this.contributions).includes(sourceFile))
		{
			this.contributions[sourceFile] = {};
		}
	}
}

export class TrainingData {
	contributions: any = {}; 

	addContribution(sourceFile: string, entry: any)
	{
		if (!Object.keys(this.contributions).includes(sourceFile))
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
		}	
	}

	resetContributor(sourceFile: string)
	{
		if (Object.keys(this.contributions).includes(sourceFile))
		{
			this.contributions[sourceFile] = {};
		}
	}
}