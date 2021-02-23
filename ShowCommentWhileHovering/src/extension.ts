// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { promises } from 'dns';
import * as vscode from 'vscode';

import {
	HoverProvider,
	Hover,
	TextDocument,
	Position,
	CancellationToken
} from 'vscode';

class GoHoverProvider implements HoverProvider {

	public provideHover(document: TextDocument, position: Position, token: CancellationToken): Thenable<Hover> {
		// You need to implement finding comments by yourself.
		// The following implementation is from vscode-go.
		const word = adjustWordPosition(document, position);
		return Promise.resolve(new Hover(`Check ${word[1]}... CheckTest Comment`));
	}
}

// https://github.com/golang/vscode-go/blob/5e19b9d7fff902aab4c0e7c09e251ab55963af49/src/util.ts#L449
function isPositionInString(document: vscode.TextDocument, position: vscode.Position): boolean {
	const lineText = document.lineAt(position.line).text;
	const lineTillCurrentPosition = lineText.substr(0, position.character);

	// Count the number of double quotes in the line till current position. Ignore escaped double quotes
	let doubleQuotesCnt = (lineTillCurrentPosition.match(/\"/g) || []).length;
	const escapedDoubleQuotesCnt = (lineTillCurrentPosition.match(/\\\"/g) || []).length;

	doubleQuotesCnt -= escapedDoubleQuotesCnt;
	return doubleQuotesCnt % 2 === 1;
}

// https://github.com/golang/vscode-go/blob/5e19b9d7fff902aab4c0e7c09e251ab55963af49/src/goDeclaration.ts#L104
function adjustWordPosition(
	document: vscode.TextDocument,
	position: vscode.Position
): [boolean, string, vscode.Position] {
	const wordRange = document.getWordRangeAtPosition(position);
	const lineText = document.lineAt(position.line).text;
	const word = wordRange ? document.getText(wordRange) : '';
	if (
		!wordRange ||
		lineText.startsWith('//') ||
		isPositionInString(document, position) ||
		word.match(/^\d+.?\d+$/)
		// goKeywords.indexOf(word) > 0
	) {
		// return [false, null, null];
		return [false, '', new vscode.Position(0, 0)];
	}
	if (position.isEqual(wordRange.end) && position.isAfter(wordRange.start)) {
		position = position.translate(0, -1);
	}

	return [true, word, position];
}

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
	context.subscriptions.push(vscode.languages.registerHoverProvider('plaintext', new GoHoverProvider()));
}

// this method is called when your extension is deactivated
export function deactivate() {}
