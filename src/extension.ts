import * as vscode from 'vscode';
import { writeFileSync, readFileSync } from 'fs';
import { recursiveRead } from './utils';
import { parse as yamlParse, LineCounter } from 'yaml';
import { RASADeclarationType } from './definitions';

let domainData: {[index: string]: any};
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
	const ymlPaths = recursiveRead(workspacePath.uri.fsPath, [".vscode", "node_modules", "env"]);

	ymlPaths.forEach(function(path) 
	{
		const ymlFile: string = readFileSync(path, 'utf-8');
		const ymlContent: any = yamlParse(ymlFile, { lineCounter: new LineCounter(), keepSourceTokens: true } );
	
		let declarationsInThisFile: any = []; 

		if (ymlContent)
		{
			const keys: string[] = Object.keys(ymlContent);

			if (keys.includes("intents"))
			{
				ymlContent["intents"].forEach(function(intentDeclaration: string) {
					declarationsInThisFile.push(
					{
						"text": intentDeclaration,
						"type": RASADeclarationType.DomainIntent	
					});
				});
			}

			if (keys.includes("actions"))
			{
				ymlContent["actions"].forEach(function(actionDeclaration: string) {
					declarationsInThisFile.push(
					{
						"text": actionDeclaration,
						"type": RASADeclarationType.DomainAction	
					});
				});
			}

			if (keys.includes("responses"))
			{
				Object.keys(ymlContent["responses"]).forEach(function(responseDeclaration: string) 
				{
					declarationsInThisFile.push(
					{
						"text": responseDeclaration,
						"type": RASADeclarationType.DomainResponse	
					});
				});
			}

			vscode.workspace.openTextDocument(vscode.Uri.file(path)).then(doc => 
			{
				declarationsInThisFile.forEach(function(declaration: any) 
				{
					let searchText = declaration["searchText"]; 
					for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) 
					{
						const lineOfText = doc.lineAt(lineIndex);
						if (lineOfText.text.includes(searchText))
						{
							const index = lineOfText.text.indexOf(searchText);
							const range = new vscode.Range(lineIndex, index, lineIndex, index + searchText.length);
							declaration["lineNumber"] = lineIndex; 
							declaration["range"] = range; 

						}
					}
				});
			})
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
