import * as vscode from 'vscode';
import { Domain, TrainingData } from './definitions';


export function scanDomain(domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	const intentsUsedInStoriesAndRules: string[] = trainingData.usedIntents;
	const actionsUsedInStoriesAndRules: string[] = trainingData.usedActions;
	const intentsTrainedInNLU: string[] = trainingData.trainedIntents;

	Object.keys(domain.contributions).forEach(contributionFile => 
	{
		let diagnosticsInFile: vscode.Diagnostic[] = [];

		domain.contributions[contributionFile]["intents"].forEach(function(declaration: any) 
		{
			if (!intentsUsedInStoriesAndRules.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " is not being used in any rule or story.", vscode.DiagnosticSeverity.Warning); 
				diagnosticsInFile.push(diagnostic); 
			}

			if (!intentsTrainedInNLU.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has no training data associated in NLU.", vscode.DiagnosticSeverity.Warning); 
				diagnosticsInFile.push(diagnostic); 
			}
		});

		domain.contributions[contributionFile]["actions"].forEach(function(declaration: any) 
		{
			if (!actionsUsedInStoriesAndRules.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Action " + declaration["declaration"] + " is not being used in any rule or story.", vscode.DiagnosticSeverity.Warning); 
				diagnosticsInFile.push(diagnostic); 
			}
		});
	
		diagnosticCollection.set(vscode.Uri.file(contributionFile), diagnosticsInFile);
	});		
}


export function scanDeclarations(domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	const intentsInDomain: string[] = domain.availableIntents; 
	const actionsInDomain: string[] = domain.availableActions; 

	Object.keys(trainingData.contributions).forEach(contributionFile => 
	{
		let diagnosticsInFile: vscode.Diagnostic[] = []; 

		trainingData.contributions[contributionFile]["nlu"].forEach(function(declaration: any) 
		{
			if (!intentsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic); 
			}
		});

		trainingData.contributions[contributionFile]["stories"]["intents"].forEach(function(declaration: any)
		{
			if (!intentsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
		})

		trainingData.contributions[contributionFile]["stories"]["actions"].forEach(function(declaration: any)
		{
			if (!actionsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Action " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
		})

		trainingData.contributions[contributionFile]["rules"]["intents"].forEach(function(declaration: any)
		{
			if (!intentsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
		})

		trainingData.contributions[contributionFile]["rules"]["actions"].forEach(function(declaration: any)
		{
			if (!actionsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Action " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
		})

		diagnosticCollection.set(vscode.Uri.file(contributionFile), diagnosticsInFile);
	})


}