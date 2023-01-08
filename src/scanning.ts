import * as vscode from 'vscode';
import { Domain, TrainingData } from './definitions';
import { getKeysInDocument, readYML,  } from './reading';

export function scanAllDomainFiles(domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	Object.keys(domain.contributions).forEach(contributionFile => 
	{
		scanDomainFile(contributionFile, domain, trainingData, diagnosticCollection);
	});
}


export function scanDomainFile(contributionFile: string, domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	const intentsUsedInStoriesAndRules: string[] = trainingData.usedIntents;
	const actionsUsedInStoriesAndRules: string[] = trainingData.usedActions;
	const intentsTrainedInNLU: string[] = trainingData.trainedIntents;

	
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
	diagnosticsInFile = []; 
	
}


export function scanAllTrainingDataFiles(domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	Object.keys(trainingData.contributions).forEach(contributionFile => 
		{
			scanTrainingDataFile(contributionFile, domain, trainingData, diagnosticCollection);
		})
}


export function scanTrainingDataFile(contributionFile: string, domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	const intentsInDomain: string[] = domain.availableIntents; 
	const actionsInDomain: string[] = domain.availableActions; 
	
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
	diagnosticsInFile = []; 
}


export function checkForRescan(document :vscode.TextDocument, domain: Domain, trainingData: TrainingData, diagnosticCollection: vscode.DiagnosticCollection)
{
	const documentPath: string = document.uri.fsPath;
	const keys = getKeysInDocument(documentPath);
	
	if (keys.includes("stories") || keys.includes("rules") || keys.includes("nlu"))
	{
		
		if (!trainingData.filePaths.includes(documentPath))
		{
			trainingData.addContribution(documentPath, null); 
		}			
		trainingData.resetContributor(documentPath);
		readYML(documentPath, domain, trainingData);
		scanTrainingDataFile(documentPath, domain, trainingData, diagnosticCollection);
		scanAllDomainFiles(domain, trainingData, diagnosticCollection);
	} 

	else if (keys.includes("intents") || keys.includes("actions") || keys.includes("responses"))
	{
		if (!domain.filePaths.includes(documentPath))
		{
			domain.addContribution(documentPath, null); 
		}	
		domain.resetContributor(documentPath);
		readYML(documentPath, domain, trainingData);
		scanDomainFile(documentPath, domain, trainingData, diagnosticCollection); 
		scanAllTrainingDataFiles(domain, trainingData, diagnosticCollection); 
	}
}