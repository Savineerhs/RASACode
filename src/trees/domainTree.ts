import * as vscode from 'vscode'; 

import { RASATreeItem, RASADeclarationType, Domain } from '../definitions';

export class DomainTreeProvider implements vscode.TreeDataProvider<RASATreeItem> 
{
    domain: Domain;
    constructor(domain: Domain) {
        this.domain = domain;
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
                case "IntentsLabel":
                    let intentsInDomain: RASATreeItem[] = [];
                    Object.values(this.domain.contributions).forEach(function(f: any) 
                    {
                        f["intents"].forEach(function(intent: any) 
                        {
                            let i = new RASATreeItem(intent["declaration"], vscode.TreeItemCollapsibleState.None, "Intent", ); 
                            i.iconPath = new vscode.ThemeIcon("dash"); 
                            i.command = {
                                command: 'vscode.open',
                                title: 'Open Call',
                                arguments: [
                                    vscode.Uri.file(intent["file"]),
                                    <vscode.TextDocumentShowOptions>{
                                        selection: new vscode.Range(intent["position"]["line"], intent["position"]["col"], intent["position"]["line"], intent["position"]["col"] + intent["length"]),
                                    }
                                ]
                            };
                            intentsInDomain.push(i);
                        })
                    })
                    
                    return intentsInDomain;
                
                case "ActionsLabel": 
                    let actionsInDomain: RASATreeItem[] = [];
                    Object.values(this.domain.contributions).forEach(function(f: any)
                    {
                        f["actions"].forEach(function(action: any)
                        {
                            let i = new RASATreeItem(action["declaration"], vscode.TreeItemCollapsibleState.None, "Action");
                            i.command = {
                                command: 'vscode.open',
                                title: 'Open Call',
                                arguments: [
                                    vscode.Uri.file(action["file"]),
                                    <vscode.TextDocumentShowOptions>{
                                        selection: new vscode.Range(action["position"]["line"], action["position"]["col"], action["position"]["line"], action["position"]["col"] + action["length"]),
                                    }
                                ]
                            };

                            if (action["type"] == RASADeclarationType.ResponseDeclaration)
                                i.iconPath = new vscode.ThemeIcon("comment")

                            else if (action["type"] == RASADeclarationType.ActionDeclaration)    
                                i.iconPath = new vscode.ThemeIcon("zap", new vscode.ThemeColor("charts.yellow"))

                            actionsInDomain.push(i); 
                        })
                    })
                    return actionsInDomain;
            }
        }
        
        else 
        {
            let il = new RASATreeItem("Intents", vscode.TreeItemCollapsibleState.Collapsed, "IntentsLabel");
            il.iconPath = new vscode.ThemeIcon("report", new vscode.ThemeColor("charts.blue"));
            let al = new RASATreeItem("Actions", vscode.TreeItemCollapsibleState.Collapsed, "ActionsLabel");
            al.iconPath = new vscode.ThemeIcon("zap", new vscode.ThemeColor("charts.yellow"));
            return Promise.resolve([
                il, al
            ]);
        }
    }
}
