require('dotenv').config();

const fs = require('fs');
const https = require('https');
const fetch = require('fetch-timeline');

const wordleFile = 'https://www.nytimes.com/games/wordle/main.18740dce.js',
    wordleVar = 'Ma';

// https://github.com/dwyl/english-words/raw/master/words_alpha.txt
const popular = fs.readFileSync('./words_alpha.txt', 'utf8').split('\r\n').filter(w => w.length == 5);

function matchesGuess(guess) {
    return function (word) {
        return guess.every((c, i) => c == word[i]);
    };
}

const params = {
    screenName: 'cmbuckleywordle',
};

const opts = {
    credentials: {
        consumerKey:       process.env.TWITTER_CONSUMER_KEY,
        consumerSecret:    process.env.TWITTER_CONSUMER_SECRET,
        accessToken:       process.env.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    },
    limit: 10,
};

let guesses = {};
    word = [],
    facts = [];

https.get(wordleFile, res => {
    let wordleData = '';
    res.on('data', d => wordleData += d);
    res.on('end', () => {
        const matches = wordleData.match(new RegExp(`var ${wordleVar}=(\\[[^\\]]+\\])`)),
            answers = JSON.parse(matches[1]);

        fetch(params, opts).on('data', ({text}) => {
            const textData = text.split('\n'),
                number = textData[0].split(' ')[1];

            guesses[number] = {
                guess: textData[2],
                answer: answers[number],
            };
        }).on('info', () => {
            Object.values(guesses).forEach(guessData => {
                [...guessData.guess].forEach((result, index) => {
                    if (result == '🟩') {
                        word[index] = guessData.answer[index];
                    }
                });
            });

            Object.values(guesses).forEach(guessData => {
                let guess = [...guessData.guess],
                    answer = [...guessData.answer];

                word.forEach((c, i) => {
                    delete guess[i];

                    if (answer.indexOf(c) > -1) {
                        answer.splice(answer.indexOf(c), 1);
                    }
                });

                const yellows = guess.filter(c => c === '🟨').length;
                if (yellows) {
                    facts.push({
                        letters: yellows,
                        from: [... new Set(answer.filter(Boolean))],
                    });
                }
            });
            console.log(guesses);
            console.log(word);
            console.log(facts);
            console.log(popular.filter(matchesGuess(word)));
        });
    });
});
