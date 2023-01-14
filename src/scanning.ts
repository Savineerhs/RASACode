import * as vscode from 'vscode';
import { Domain, TrainingData } from './definitions';
import { getKeysInDocument, readYML,  } from './reading';
import { DomainTreeProvider } from './trees/domainTree';
import { TrainingDataTreeProvider } from './trees/trainingDataTree';

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

	const config = vscode.workspace.getConfiguration('rasacode');
	
	let diagnosticsInFile: vscode.Diagnostic[] = [];


	domain.contributions[contributionFile]["intents"].forEach(function(declaration: any) 
	{

		if (config.get("warnings") as any ["showWarningsForUnusedIntents"])
			if (!intentsUsedInStoriesAndRules.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " is not being used in any rule or story.", vscode.DiagnosticSeverity.Warning); 
				diagnosticsInFile.push(diagnostic); 
			}

		if (config.get("warnings") as any ["showWarningsForUntrainedIntents"])
			if (!intentsTrainedInNLU.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has no training data associated in NLU.", vscode.DiagnosticSeverity.Warning); 
				diagnosticsInFile.push(diagnostic); 
			}
	});

	domain.contributions[contributionFile]["actions"].forEach(function(declaration: any) 
	{
		if (config.get("warnings") as any ["showWarningsForUnusedActions"])
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
	
	const config = vscode.workspace.getConfiguration('rasacode');

	let diagnosticsInFile: vscode.Diagnostic[] = []; 

	trainingData.contributions[contributionFile]["nlu"].forEach(function(declaration: any) 
	{
		if (config.get("errors") as any ["showErrorsForUndeclaredNLU"])
			if (!intentsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic); 
			}
	});

	trainingData.contributions[contributionFile]["stories"]["intents"].forEach(function(declaration: any)
	{
		if (config.get("errors") as any ["showErrorsForUndeclaredIntents"])
			if (!intentsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
	})

	trainingData.contributions[contributionFile]["stories"]["actions"].forEach(function(declaration: any)
	{
		if (config.get("errors") as any ["showErrorsForUndeclaredActions"])
			if (!actionsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Action " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
	})

	trainingData.contributions[contributionFile]["rules"]["intents"].forEach(function(declaration: any)
	{
		if (config.get("errors") as any ["showErrorsForUndeclaredIntents"])
			if (!intentsInDomain.includes(declaration["declaration"]))
			{
				const range = new vscode.Range(declaration["position"]["line"], declaration["position"]["col"], declaration["position"]["line"], declaration["position"]["col"] + declaration["length"]);
				const diagnostic = new vscode.Diagnostic(range, "Intent " + declaration["declaration"] + " has not been declared in the domain yet.", vscode.DiagnosticSeverity.Error); 
				diagnosticsInFile.push(diagnostic);
			}
	})

	trainingData.contributions[contributionFile]["rules"]["actions"].forEach(function(declaration: any)
	{
		if (config.get("errors") as any ["showErrorsForUndeclaredActions"])
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


export function checkForRescan(
	document :vscode.TextDocument, 
	domain: Domain, 
	trainingData: TrainingData, 
	diagnosticCollection: vscode.DiagnosticCollection,
	domainTree: DomainTreeProvider, 
	trainingDataTree: TrainingDataTreeProvider)
{
	function updateTrainingData() 
	{
		readYML(documentPath, domain, trainingData);
		scanTrainingDataFile(documentPath, domain, trainingData, diagnosticCollection);
		scanAllDomainFiles(domain, trainingData, diagnosticCollection);
		trainingDataTree.refresh();
	}

	function updateDomain()
	{
		readYML(documentPath, domain, trainingData);
		scanDomainFile(documentPath, domain, trainingData, diagnosticCollection); 
		scanAllTrainingDataFiles(domain, trainingData, diagnosticCollection); 
		domainTree.refresh();
	}


	const documentPath: string = document.uri.fsPath;
	const keys = getKeysInDocument(documentPath);
	
	if (trainingData.filePaths.includes(documentPath))
	{				
		trainingData.resetContributor(documentPath);
		updateTrainingData();
	}

	else if (domain.filePaths.includes(documentPath))
	{
		domain.resetContributor(documentPath);
		updateDomain();
	}

	else if (keys.includes("stories") || keys.includes("rules") || keys.includes("nlu"))
	{
		trainingData.addContributor(documentPath); 				
		updateTrainingData();
	} 

	else if (keys.includes("intents") || keys.includes("actions") || keys.includes("responses"))
	{
		domain.addContributor(documentPath); 
		updateTrainingData();
	}
}


export function scanAfterDeletion(
	documentPath :string, 
	domain: Domain, 
	trainingData: TrainingData, 
	diagnosticCollection: vscode.DiagnosticCollection,
	domainTree: DomainTreeProvider, 
	trainingDataTree: TrainingDataTreeProvider)
{
	if (trainingData.filePaths.includes(documentPath))
	{				
		trainingData.resetContributor(documentPath);
		scanAllDomainFiles(domain, trainingData, diagnosticCollection);
		domainTree.refresh();
	}

	else if (domain.filePaths.includes(documentPath))
	{
		domain.resetContributor(documentPath);
		scanAllTrainingDataFiles(domain, trainingData, diagnosticCollection);
		trainingDataTree.refresh();
	}
}