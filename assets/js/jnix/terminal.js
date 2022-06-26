class Terminal {
	constructor(user, element) {
		this.user = user;
		this.element = element;
		this.emutermLogo = `
<div style="background-color: #383838;
box-shadow: -1rem 1rem #171717;
font-size: clamp(12px,2vw,1rem);
padding: 1rem;
text-align: center;
border: 4px solid #0a0a0a;">


████████╗██╗  ██╗███████╗ ██████╗ 
╚══██╔══╝██║  ██║██╔════╝██╔═══██╗
   ██║   ███████║█████╗  ██║   ██║
   ██║   ██╔══██║██╔══╝  ██║   ██║
   ██║   ██║  ██║███████╗╚██████╔╝
   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ 
                                  
                                                                          
software developer, artist, goof

</div>                                                                               
`;
		this.lines = ['\n', this.emutermLogo, '\n', '\n', '\n'];
		this.cursor = 0;
		this.input = '';
		this.workdir = '~';
		this.listeners = {};

		const root = document.createElement('div');
		this.root = root;
		root.contentEditable = true;
		root.spellcheck = false;
		root.classList.add('terminal-input');

		root.addEventListener('paste', (e) => {
			let paste = (e.clipboardData || window.clipboardData).getData(
				'text',
			);
			// TODO: process lines (execute commands) in necessary
			this.inserTextAtPosition(paste, this.cursor);
			e.preventDefault();
		});

		root.addEventListener('keypress', (e) => {
			// console.log("keypress", e)
			if (e.key == 'Enter') {
				this.writeLine(this.buildContext() + this.input + '\n');
				this.emit('stdin', this.input);
				this.context = '';
				this.input = '';
				this.cursor = 0;
				this.renderInput();
				this.inputElement.scrollIntoView();
			} else {
				this.inserTextAtPosition(e.key, this.cursor);
			}
			e.preventDefault();
		});

		root.addEventListener('keydown', (e) => {
			// console.log(e)

			if (e.key == 'Backspace') {
				this.deleteCharacterAtPosition(this.cursor);
				e.preventDefault();
			} else if (e.key == 'ArrowLeft') {
				this.moveCursorLeft();
				e.preventDefault();
			} else if (e.key == 'ArrowRight') {
				this.moveCursorRight();
				e.preventDefault();
			}

			if (e.ctrlKey) {
			}
		});

		root.addEventListener('input', (e) => {
			// console.log(e)

			if (e.inputType == 'deleteContentBackward') {
				this.deleteCharacterAtPosition(this.cursor);
			}
			e.preventDefault();
		});

		element.replaceWith(root);
		this.root.focus();
		this.render();
		const lines = [
			'type "help" to see a list of available commands\n',
			'\n',
		];
		this.writeLines(lines);
	}

	moveCursorRight() {
		this.cursor = Math.min(this.input.length, this.cursor + 1);
		this.renderCaret();
	}

	moveCursorLeft() {
		this.cursor = Math.max(0, this.cursor - 1);
		this.renderCaret();
	}

	deleteCharacterAtPosition(position) {
		if (position > 0) {
			const text =
				this.input.slice(0, position - 1) + this.input.slice(position);
			this.cursor -= 1;
			this.renderInput(text);
		}
	}

	// TODO: fix insert, not replace
	inserTextAtPosition(text, position) {
		const nextInput =
			this.input.slice(0, position) + text + this.input.slice(position);
		this.cursor += text.length;
		this.renderInput(nextInput);
	}

	on(event, listener) {
		if (event in this.listeners) {
			this.listeners[event].push(listener);
		} else {
			this.listeners[event] = [listener];
		}
	}

	emit(event, data) {
		if (event in this.listeners) {
			this.listeners[event].map((listener) => listener(data));
		}
	}

	render(input) {
		// TODO: only render visible lines on terminal

		this.renderHistory();
		this.renderInput(input);
	}

	renderHistory() {
		this.root.innerHTML = '';
		this.lines.forEach((line) => {
			var node = document.createElement('div');
			node.innerHTML = line;
			this.root.appendChild(node);
		});
	}

	renderCaret() {
		if (this.caretElement) {
			this.caretElement.remove();
		}

		this.caretElement = document.createElement('div');

		this.caretElement.innerText =
			this.inputElement.innerText.slice(
				0,
				this.buildContext().length + this.cursor,
			) + '█';
		this.caretElement.style.userSelect = 'none';
		this.caretElement.style.display = 'inline-block';
		this.caretElement.style.wordBreak = 'break-all';
		this.caretElement.style.position = 'absolute';
		this.caretElement.style.top = '0';
		this.caretElement.style.left = '0';
		this.caretElement.style.color = '#ffffff96';

		if (this.inputElement) {
			this.inputElement.appendChild(this.caretElement);
		} else {
			this.root.appendChild(this.caretElement);
		}
	}

	buildContext() {
		return this.user.name + ':' + this.workdir + '$ ';
	}

	renderInput(nextInput = '') {
		if (!this.inputElement) {
			this.inputElement = document.createElement('div');
			this.inputElement.style.wordBreak = 'break-all';
			this.inputElement.style.position = 'relative';
			this.root.appendChild(this.inputElement);
		}

		if (!this.context) {
			this.context = this.buildContext();
		}

		this.inputElement.innerText = this.context + nextInput + ' ';
		this.input = nextInput;
		this.renderCaret();
	}

	writeLine(line) {
		this.writeLines([line]);
	}

	writeLines(lines) {
		this.lines += lines;
		lines.forEach((line) => {
			const element = document.createElement('div');
			// TODO: process text
			element.innerHTML = line;
			this.root.insertBefore(element, this.inputElement);
		});
	}

	clear() {
		this.lines = [];
		this.cursor = 0;
		this.input = '';
		this.inputElement = null;
		this.caretElement = null;
		this.render();
	}
}

export { Terminal };
