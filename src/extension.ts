import * as vscode from 'vscode';
import { writeFileSync } from 'fs';
import { recursiveRead } from './utils';
import { TrainingData, Domain } from './definitions';
import { readAll } from './reading';
import { scanDeclarations } from './scanning';

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

	diagnosticsCollection = vscode.languages.createDiagnosticCollection("rasacode");
	
	initialLoad();
	scanDeclarations(domain, trainingData, diagnosticsCollection);
	
	context.subscriptions.push(disposable);
}

function initialLoad()
{
	const ymlPaths = recursiveRead(workspacePath.uri.fsPath, [".vscode", "node_modules", "env"]);
	readAll(ymlPaths, domain, trainingData);
}



export function deactivate() {}
