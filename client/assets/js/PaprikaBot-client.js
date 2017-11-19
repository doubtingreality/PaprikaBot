// PaprikaBot
// JavaScript based message bot
//

(() => {
	class PaprikaBot {
		constructor() {
			this.dictionary = [
				{
					word: 'eat',
					variations: [
						{
							word: 'eat',
							tense: 'present'
						},
						{
							word: 'ate',
							tense: 'past'
						},
						{
							word: 'eaten',
							helper: 'have',
							tense: 'past'
						},
						{
							word: 'eating',
							helper: 'is',
							tense: 'continuous'
						}
					],
					type: 'verb'
				},
				{
					word: 'is',
					variations: [
						{
							word: 'is',
							tense: 'present'
						},
						{
							word: 'are',
							tense: 'present'
						},
						{
							word: 'was',
							tense: 'past'
						},
						{
							word: 'were',
							tense: 'past'
						}
					],
					type: 'helper'
				}
			];
		}

		findInDictionary(word) {
			let found_word = false;

			loop1: for (let index = 0, dictionary_length = this.dictionary.length; index < dictionary_length; index++) {
				const dictionary_word = this.dictionary[index];

				if (dictionary_word.type !== 'verb') {
					continue;
				}

				loop2: for (let variation_index = 0, variations_length = dictionary_word.variations.length; variation_index < variations_length; variation_index++) {
					const variation_word = dictionary_word.variations[variation_index];

					console.log(variation_word, word);

					if (variation_word.word === word.toLowerCase()) {
						found_word = {
							word: dictionary_word,
							variation: index
						};

						break loop1;
					}
				}
			}

			return found_word;
		}

		addWord(word) {
			this.dictionary.push(word);
		}

		parseMessage(message) {
			this.changeStatus('Paprika is thinking...');

			const response = new Message({
				author: 'paprika',
				date: new Date()
			});

			let sentences = message.data.content.match( /[^\.!\?]+[\.!\?]+/g );

			if (!sentences || !sentences[0]) {
				sentences = [
					message.data.content
				];
			}

			sentences.forEach((sentence, index) => {
				sentences[index] = sentence.replace( /[^a-zA-Z\s]/g, '' );
			});

			const dissection = this.dissect(sentences[0]);

			console.log('Found verb:', dissection.verb);
			console.log('Found subject:', dissection.subject);
			console.log('Found article:', dissection.article);

			return response;
		}

		dissect(message_content) {
			const words = message_content.split(' ');
			let dissection = false;

			for (let index = 0, words_length = words.length; index < words_length; index++) {
				const word = words[index];
				const definition = this.findInDictionary(word);

				if (definition && definition.word.type === 'verb') {
					 dissection = {
						verb: word,
						subject: words[index - 1],
						article: (words[index + 1] ? words[index + 1] : false)
					};
				}
			}

			console.log(dissection);

			return dissection || false;
		}

		changeStatus(status) {
			paprika_status.textContent = status;
			paprika_status.classList.add('is-visible');
		}

		hideStatus() {
			paprika_status.classList.remove('is-visible');
		}
	}

	class Messages {
		constructor() {
			this.data = [];
		}

		addMessage(message) {
			this.data.push(message);

			messages_holder.appendChild(message.getElement());
			messages_holder.scrollTop = messages_holder.scrollHeight;

			// Add delay to Paprika's response
			setTimeout(() => {
				const paprika_message = paprika.parseMessage(message);

				if (paprika_message.data.content) {
					const delay_time = 1000 + paprika_message.data.content.length * 45 + Math.random() * 200;

					setTimeout(() => {
						messages_holder.appendChild(paprika_message.getElement());
						messages_holder.scrollTop = messages_holder.scrollHeight;
						paprika.hideStatus();
					}, delay_time);
				} else {
					paprika.hideStatus();
				}
			}, 500);
		}
	}

	class Message {
		constructor(data) {
			this.data = data;

			if (this.data.content) {
				this.addContent(this.data.content);
			}

			return this;
		}

		addContent(content) {
			if (!this.data.element) {
				const new_element = document.createElement('div');
				new_element.classList.add('message');
				new_element.dataset.author = this.data.author;
				this.data.element = new_element;
			}

			this.data.content = content;
			this.data.element.textContent = content;
		}

		getElement() {
			if (!this.data.element) {
				return false;
			}

			return this.data.element;
		}

		toString() {
			return this.data.content;
		}
	}

	const chat_input = document.querySelector('.chat-input');
	const chat_submit = document.querySelector('.chat-submit');
	const messages_holder = document.querySelector('.messages');
	const paprika_status = document.querySelector('.paprika-status');
	const messages = new Messages();
	const paprika = new PaprikaBot();


	chat_input.addEventListener('keydown', (event) => {
		// Pressed enter
		if (event.keyCode === 13) {
			event.preventDefault();
			sendMessage();
		}
	});

	chat_submit.addEventListener('click', (event) => {
		event.preventDefault();
		sendMessage();
	});

	const sendMessage = () => {
		const message_content = chat_input.value;

		if (message_content.trim().length > 0) {
			chat_input.value = '';

			messages.addMessage(new Message({
				content: message_content.trim(),
				author: 'self',
				date: new Date()
			}));
		}
	}
})();
