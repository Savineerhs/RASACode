import * as vscode from 'vscode';
import { writeFileSync, existsSync } from 'fs';
import { recursiveRead } from './utils';
import { TrainingData, Domain } from './definitions';
import { readAll } from './reading';
import { scanAllTrainingDataFiles, scanAllDomainFiles, checkForRescan, scanAfterDeletion } from './scanning';
import { DomainTreeProvider } from './trees/domainTree';
import { TrainingDataTreeProvider } from './trees/trainingDataTree';

let diagnosticsCollection: vscode.DiagnosticCollection;
let domainTreeProvider: DomainTreeProvider;
let trainingDataTreeProvider: TrainingDataTreeProvider;


export let domain: Domain;
export let trainingData: TrainingData;

const workspacePath = vscode.workspace.workspaceFolders![0] ?? null;

export function activate(context: vscode.ExtensionContext) {
	let rasacodeFileLocation = workspacePath.uri.fsPath + '/.rasacode';

	trainingData = new TrainingData(); 
	domain = new Domain();

	diagnosticsCollection = vscode.languages.createDiagnosticCollection("rasacode");
	
	if (existsSync(rasacodeFileLocation)) 
	{
		initializeProject();
	}
	
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
		initializeProject();
	});

	function initializeProject()
	{
		const ymlPaths = recursiveRead(workspacePath.uri.fsPath, [".vscode", "node_modules", "env"]);
		readAll(ymlPaths, domain, trainingData);
		scanAllTrainingDataFiles(domain, trainingData, diagnosticsCollection);
		scanAllDomainFiles(domain, trainingData, diagnosticsCollection); 

		domainTreeProvider = new DomainTreeProvider(domain)
		vscode.window.registerTreeDataProvider(
			'rasacode-domain-tree',
			domainTreeProvider
		);

		trainingDataTreeProvider = new TrainingDataTreeProvider(trainingData)
		vscode.window.registerTreeDataProvider(
			'rasacode-trainingData-tree', 
			trainingDataTreeProvider
		)

		context.subscriptions.push(disposable);
		context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => 
		checkForRescan(
			document, 
			domain, 
			trainingData, 
			diagnosticsCollection,
			domainTreeProvider,
			trainingDataTreeProvider
		)));

		context.subscriptions.push(vscode.workspace.onDidCreateFiles(files => 
		{
			let filePaths = files["files"];
			filePaths.forEach(file => 
			{
				vscode.workspace.openTextDocument(file).then(doc => 
				{
					checkForRescan(doc, domain, trainingData, diagnosticsCollection, domainTreeProvider, trainingDataTreeProvider);
				})
			});
		}))

		context.subscriptions.push(vscode.workspace.onDidDeleteFiles(files => 
		{
			let filePaths = files["files"];
			filePaths.forEach(file => 
			{
				scanAfterDeletion(file.fsPath, domain, trainingData, diagnosticsCollection, domainTreeProvider, trainingDataTreeProvider);
			})
		}))
	}
}

export function deactivate() {}
