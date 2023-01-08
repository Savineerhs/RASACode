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
	knownContributors: string[] = [];
	declaredIntents: any[] = [];
	declaredActions: any[] = [];

	listIntents()
	{
		return this.declaredIntents.map(intent => {return intent["declaration"]});
	}

	listActions()
	{
		return this.declaredActions.map(action => {return action["declaration"]});
	}
}

export class TrainingData {
	knownContributors: string[] = [];

	intentsUsedInStories: any[] = [];
	intentsUsedInRules: any[] = [];
	intentsTrainedInNLU: any[] = [];
	actionsUsedInStories: any[] = [];
	actionsUsedInRules: any[] = [];

	listUsedIntents()
	{
		let i = this.intentsUsedInStories.map(intent => {return intent["declaration"]});
		i.push(...this.intentsUsedInRules.map(intent => {return intent["declaration"]})) 
		return i;
	}

	listUsedActions()
	{
		let i = this.actionsUsedInStories.map(action => {return action["declaration"]});
		i.push(...this.actionsUsedInRules.map(action => {return action["declaration"]}))
		return i
	}
	
	listUsedNLU()
	{
		return this.intentsTrainedInNLU.map(intent => {return intent["declaration"]});
	}
}