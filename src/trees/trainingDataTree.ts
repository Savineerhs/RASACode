import * as vscode from 'vscode'; 

import { RASATreeItem, RASADeclarationType, TrainingData } from '../definitions';


export class TrainingDataTreeProvider implements vscode.TreeDataProvider<RASATreeItem> 
{
    trainingData: TrainingData;
    constructor(trainingData: TrainingData) {
        this.trainingData = trainingData;
    }

    private onDidChangeTreeDataEvent: vscode.EventEmitter<RASATreeItem | undefined | null | void> = new vscode.EventEmitter<RASATreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<RASATreeItem | undefined | null | void> = this.onDidChangeTreeDataEvent.event;

    refresh() 
    {
        this.onDidChangeTreeDataEvent.fire();
    }

    getTreeItem(element: RASATreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> 
    {
        return element;    
    }

    getChildren(element?: RASATreeItem | undefined): vscode.ProviderResult<RASATreeItem[]> 
    {
        if (element)
        {
            switch(element.type)
            {
                case "StoriesLabel":
                    let storiesInUse: RASATreeItem[] = [];
                    Object.values(this.trainingData.contributions).forEach(function(f: any) 
                    {
                        f["stories"]["locations"].forEach(function(story: any)
                        {
                            let i = new RASATreeItem(story["declaration"], vscode.TreeItemCollapsibleState.None, "Story")
                            i.iconPath = new vscode.ThemeIcon("comment-discussion"); 
                            i.command = {
                                command: 'vscode.open',
                                title: 'Open Call',
                                arguments: [
                                    vscode.Uri.file(story["file"]),
                                    <vscode.TextDocumentShowOptions>{
                                        selection: new vscode.Range(story["position"]["line"], story["position"]["col"], story["position"]["line"], story["position"]["col"] + story["length"]),
                                    }
                                ]
                            };
                            storiesInUse.push(i);
                        });
                    })

                    return storiesInUse; 

                case "RulesLabel":
                    let rulesInUse: RASATreeItem[] = [];
                    Object.values(this.trainingData.contributions).forEach(function(f: any) 
                    {
                        f["rules"]["locations"].forEach(function(rule: any)
                        {
                            let i = new RASATreeItem(rule["declaration"], vscode.TreeItemCollapsibleState.None, "Rule")
                            i.iconPath = new vscode.ThemeIcon("source-control"); 
                            i.command = {
                                command: 'vscode.open',
                                title: 'Open Call',
                                arguments: [
                                    vscode.Uri.file(rule["file"]),
                                    <vscode.TextDocumentShowOptions>{
                                        selection: new vscode.Range(rule["position"]["line"], rule["position"]["col"], rule["position"]["line"], rule["position"]["col"] + rule["length"]),
                                    }
                                ]
                            };
                            rulesInUse.push(i);
                        });
                    })

                    return rulesInUse; 


                case "NLULabel":
                    let intentsInNLU: RASATreeItem[] = [];
                    Object.values(this.trainingData.contributions).forEach(function(f: any) 
                    {
                        f["nlu"].forEach(function(nlu: any)
                        {
                            let i = new RASATreeItem(nlu["declaration"], vscode.TreeItemCollapsibleState.None, "NLU")
                            i.iconPath = new vscode.ThemeIcon("pencil"); 
                            i.command = {
                                command: 'vscode.open',
                                title: 'Open Call',
                                arguments: [
                                    vscode.Uri.file(nlu["file"]),
                                    <vscode.TextDocumentShowOptions>{
                                        selection: new vscode.Range(nlu["position"]["line"], nlu["position"]["col"], nlu["position"]["line"], nlu["position"]["col"] + nlu["length"]),
                                    }
                                ]
                            };
                            intentsInNLU.push(i);
                        });
                    })

                    return intentsInNLU; 
            }
        }
        
        else 
        {
            let sl = new RASATreeItem("Stories", vscode.TreeItemCollapsibleState.Collapsed, "StoriesLabel");
            sl.iconPath = new vscode.ThemeIcon("bookmark", new vscode.ThemeColor("charts.red"));
            let nl = new RASATreeItem("NLU", vscode.TreeItemCollapsibleState.Collapsed, "NLULabel");
            nl.iconPath = new vscode.ThemeIcon("list-tree", new vscode.ThemeColor("charts.blue"));
            let rl = new RASATreeItem("Rules", vscode.TreeItemCollapsibleState.Collapsed, "RulesLabel");
            rl.iconPath = new vscode.ThemeIcon("terminal", new vscode.ThemeColor("charts.green"));
            return Promise.resolve([
                sl, nl, rl
            ]);
        }
    }
}
