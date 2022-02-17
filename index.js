require('dotenv').config();

const https = require('https');
const fetch = require('fetch-timeline');

const wordleFile = 'https://www.nytimes.com/games/wordle/main.18740dce.js',
    wordleVar = 'Ma';

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
    word = [];

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
            console.log(guesses);
            console.log(word);
        });
    });
});
