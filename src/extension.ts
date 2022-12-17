import * as vscode from 'vscode';
import { writeFileSync, readFileSync } from 'fs';
import { recursiveRead } from './utils';
import { parse as yamlParse } from 'yaml';

let domainData: {[index: string]: string[]};
let trainingData: {[index: string]: any};

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

	trainingData = {
		"stories": {
			"intents": [], 
			"actions": []
		}, 
		"nlu": {
			"intents": []
		}
	};

	domainData = {
		"intents": [], 
		"actions": [], 
		"responses": []
	};
	
	console.log("Hello World!");
	loadResources();
	context.subscriptions.push(disposable);
}

function loadResources()
{
	let ymlPaths = recursiveRead(workspacePath.uri.fsPath, [".vscode", "node_modules", "env"]);

	ymlPaths.forEach(function(path) 
	{
		const ymlFile: string = readFileSync(path, 'utf-8');
		const ymlContent: any = yamlParse(ymlFile);
	
		if (ymlContent)
		{
			const keys: string[] = Object.keys(ymlContent);

			if (keys.includes("nlu"))
			{
				// NLU training
			}

			if (keys.includes("rules"))
			{
				// Rule training
			}

			if (keys.includes("stories"))
			{
				// Story training
			}

			if (keys.includes("intents"))
			{
				// Intent declaration
			}

			if (keys.includes("actions"))
			{
				// Action declaration
			}

			if (keys.includes("responses"))
			{
				// Response declaration
			}
		}


	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
