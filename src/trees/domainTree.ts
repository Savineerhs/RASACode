import * as vscode from 'vscode'; 

import { DomainTreeItem, RASADeclarationType } from '../definitions';
import { Domain } from '../definitions';


export class DomainTreeProvider implements vscode.TreeDataProvider<DomainTreeItem> 
{
    domain: Domain;
    constructor(domain: Domain) {
        this.domain = domain;
    }

    private onDidChangeTreeDataEvent: vscode.EventEmitter<DomainTreeItem | undefined | null | void> = new vscode.EventEmitter<DomainTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DomainTreeItem | undefined | null | void> = this.onDidChangeTreeDataEvent.event;

    refresh() 
    {
        this.onDidChangeTreeDataEvent.fire();
    }

    getTreeItem(element: DomainTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> 
    {
        return element;    
    }

    getChildren(element?: DomainTreeItem | undefined): vscode.ProviderResult<DomainTreeItem[]> 
    {
        if (element)
        {
            switch(element.type)
            {
                case "IntentsLabel":
                    let intentsInDomain: DomainTreeItem[] = [];
                    Object.values(this.domain.contributions).forEach(function(f: any) 
                    {
                        f["intents"].forEach(function(intent: any) 
                        {
                            intentsInDomain.push(
                                new DomainTreeItem(intent["declaration"], vscode.TreeItemCollapsibleState.None, "Intent", new vscode.ThemeIcon("dash"))
                            )
                        })
                    })
                    
                    return intentsInDomain;
                
                case "ActionsLabel": 
                    let actionsInDomain: DomainTreeItem[] = [];
                    Object.values(this.domain.contributions).forEach(function(f: any)
                    {
                        f["actions"].forEach(function(action: any)
                        {
                            if (action["type"] == RASADeclarationType.ResponseDeclaration)
                                actionsInDomain.push(
                                    new DomainTreeItem(action["declaration"], vscode.TreeItemCollapsibleState.None, "Action", new vscode.ThemeIcon("comment"))       
                                )

                            else if (action["type"] == RASADeclarationType.ActionDeclaration)
                                actionsInDomain.push(
                                    new DomainTreeItem(action["declaration"], vscode.TreeItemCollapsibleState.None, "Action", new vscode.ThemeIcon("zap", new vscode.ThemeColor("charts.yellow")))       
                                )   
                        })
                    })
                    return actionsInDomain;
            }
        }
        
        else 
        {
            return Promise.resolve([
                new DomainTreeItem("Intents", vscode.TreeItemCollapsibleState.Collapsed, "IntentsLabel", new vscode.ThemeIcon("report", new vscode.ThemeColor("charts.blue"))),
                new DomainTreeItem("Actions", vscode.TreeItemCollapsibleState.Collapsed, "ActionsLabel", new vscode.ThemeIcon("zap", new vscode.ThemeColor("charts.yellow")))
            ]);
        }
    }
}
