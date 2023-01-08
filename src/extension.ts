import * as vscode from 'vscode';
import { writeFileSync, readFileSync } from 'fs';
import { recursiveRead } from './utils';
import { getStoryUsage, getNluUsage, getIntentDeclarations, getActionDeclarations, getResponseDeclarations, getRuleUsage } from './reading';
const YAML = require('yaml');

import { RASADeclarationType, TrainingData, Domain } from './definitions';
import { LineCounter } from 'yaml';

let diagnosticsCollection: vscode.DiagnosticCollection;
let domain: Domain;
let trainingData: TrainingData;

const workspacePath = vscode.workspace.workspaceFolders![0] ?? null;

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('rasacode.init', () => {
		vscode.window.showInformationMessage('Initializing RASACode...');
		
		console.log("Initializing RASACode...");
		let fileContent = "This file indicates to the RASACode extension that this folder is a RASA project. Adding it to your .gitignore is recommended."
		
		
		if (workspacePath == null)
		{
			vscode.window.showErrorMessage('Unable to initialize RASACode. Make sure you have a project folder open.');
			return;
		}

		writeFileSync(workspacePath.uri.fsPath + '/.rasacode', fileContent);
	});

	trainingData = new TrainingData(); 
	domain = new Domain();

	diagnosticsCollection = vscode.languages.createDiagnosticCollection("rasa");
	
	loadUsageData();
	scanDeclarations();
	
	context.subscriptions.push(disposable);
}

function loadUsageData()
{
	const ymlPaths = recursiveRead(workspacePath.uri.fsPath, [".vscode", "node_modules", "env"]);

	ymlPaths.forEach(function(path) 
	{
		let counter = new LineCounter();		
		const ymlContent = 
			YAML.parseDocument(
				readFileSync(path, 'utf-8'),
				{ keepCstNodes: true, 
				lineCounter: counter}
			)["contents"]

		let declarationsInThisFile: any = []; 
		
		console.log("Now reading " + path);			

		if (ymlContent)
		{
			const declarationBlocksInDocument = Object.values(ymlContent["items"]);
			declarationBlocksInDocument.forEach(function(declarationBlock: any) 
			{
				const declarationBlockName = declarationBlock["key"].toString(); 
				
				switch (declarationBlockName)
				{
					// Technically, even though RASA won't allow it, this extension will work for YAML files that declare both domain and training content. :D
					// == Training usages ==
					case "stories":
						let storyUsages = getStoryUsage(declarationBlock, counter, path); 
						trainingData.intentsUsedInStories.push(...storyUsages["intents"]);
						trainingData.actionsUsedInStories.push(...storyUsages["actions"]);
						trainingData.knownContributors.indexOf(path) === -1 ? trainingData.knownContributors.push(path):{};
						break; 
						
					case "rules":
						let ruleUsages = getRuleUsage(declarationBlock, counter, path); 
						trainingData.intentsUsedInRules.push(...ruleUsages["intents"]);
						trainingData.actionsUsedInRules.push(...ruleUsages["actions"]);
						trainingData.knownContributors.indexOf(path) === -1 ? trainingData.knownContributors.push(path):{};	
						break; 

					case "nlu":
						let nluUsage = getNluUsage(declarationBlock, counter, path); 
						trainingData.intentsTrainedInNLU.push(...nluUsage);
						trainingData.knownContributors.indexOf(path) === -1 ? trainingData.knownContributors.push(path):{}; 
						break; 
						
					// == Domain declarations == 
					case "intents": 
						let declaredIntents = getIntentDeclarations(declarationBlock, counter, path); 
						domain.declaredIntents.push(...declaredIntents);
						domain.knownContributors.indexOf(path) === -1 ? domain.knownContributors.push(path):{}; 
						break;


					case "actions": 
						let declaredActions = getActionDeclarations(declarationBlock, counter, path); 
						domain.declaredActions.push(...declaredActions);
						domain.knownContributors.indexOf(path) === -1 ? domain.knownContributors.push(path):{}; 
						break; 


					case "responses": 
						let declaredResponses = getResponseDeclarations(declarationBlock, counter, path); 
						domain.declaredActions.push(...declaredResponses); 
						domain.knownContributors.indexOf(path) === -1 ? domain.knownContributors.push(path):{}; 
						break; 


					default: 
						break; 
				}
			})
		}
	});
}

function scanDeclarations()
{
	let foundDiagnostics: any = {}; 
	function addDiagnostic(diagnostic: vscode.Diagnostic, resourceFile: string)
	{
		if (!Object.keys(foundDiagnostics).includes(resourceFile))
			foundDiagnostics[resourceFile] = [];

		foundDiagnostics[resourceFile].push(diagnostic);
	}

	const intentsInDomain: string[] = domain.listIntents();
	const actionsInDomain: string[] = domain.listActions(); 

	trainingData.intentsUsedInStories.forEach(function(declaration: any) 
	{
		if (!intentsInDomain.includes(declaration["declaration"]))
		{
			const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
			const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been delcared in the domain yet.", vscode.DiagnosticSeverity.Error); 
			addDiagnostic(diagnostic, declaration["file"]); 
		}
	});

	trainingData.intentsUsedInRules.forEach(function(declaration: any) 
	{
		if (!intentsInDomain.includes(declaration["declaration"]))
		{
			const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
			const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been delcared in the domain yet.", vscode.DiagnosticSeverity.Error); 
			addDiagnostic(diagnostic, declaration["file"]); 
		}
	});

	trainingData.actionsUsedInStories.forEach(function(declaration: any) 
	{
		if (!actionsInDomain.includes(declaration["declaration"]))
		{
			const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
			const diagnostic = new vscode.Diagnostic(range, "Action " + declaration["declaration"] + " has not been delcared in the domain yet.", vscode.DiagnosticSeverity.Error); 
			addDiagnostic(diagnostic, declaration["file"]); 
		}
	});

	trainingData.actionsUsedInRules.forEach(function(declaration: any) 
	{
		if (!actionsInDomain.includes(declaration["declaration"]))
		{
			const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
			const diagnostic = new vscode.Diagnostic(range, "Action " + declaration["declaration"] + " has not been delcared in the domain yet.", vscode.DiagnosticSeverity.Error); 
			addDiagnostic(diagnostic, declaration["file"]); 
		}
	});

	trainingData.intentsTrainedInNLU.forEach(function(declaration: any) 
	{
		if (!intentsInDomain.includes(declaration["declaration"]))
		{
			const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
			const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been delcared in the domain yet.", vscode.DiagnosticSeverity.Error); 
			addDiagnostic(diagnostic, declaration["file"]); 
		}
	});

	Object.keys(foundDiagnostics).forEach(resourceFile => {
		diagnosticsCollection.set(vscode.Uri.file(resourceFile), foundDiagnostics[resourceFile]); 
	});
}

export function deactivate() {}
