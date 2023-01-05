import { Uri } from "vscode";
const YAML = require('yaml');
import { readFileSync } from "fs";

export enum RASADeclarationType {
	IntentDeclaration,
	ActionDeclaration,
	ResponseDeclaration, 
	IntentInStory, 
	ActionInStory, 
	IntentInNLU
}