// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('The extension activated!');

	let disposable = vscode.workspace.onWillSaveTextDocument(e => {
		const promise = new Promise(async (resolve, reject) => {
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				const document = editor.document;

				const lineCount = document.lineCount;
				
				console.log("Start to change all lowercases to uppercases!");
				for (let i = 0; i < lineCount; i++) {
					const line = document.lineAt(i);
					const upperCased = line.text.toUpperCase();
					await editor.edit(editBuilder => {
						editBuilder.replace(line.range, upperCased);
					});
				}

			}
		});

		console.log("onWillSaveTextDocument emitted!");
		e.waitUntil(promise);
		
	})

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
