require('dotenv').config();

const fs = require('fs');
const https = require('https');
const fetch = require('fetch-timeline');

const wordleFile = 'https://www.nytimes.com/games/wordle/main.18740dce.js',
    wordleVar = 'Ma';

// https://github.com/dwyl/english-words/raw/master/words_alpha.txt
const popular = fs.readFileSync('./words_alpha.txt', 'utf8').split('\r\n').filter(w => w.length == 5);

// filter word list for those that match the guess
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
    limit: process.argv[2] || 10,
};

let guesses = {};
    word = [],
    facts = [];

// get the answers from the website
https.get(wordleFile, res => {
    let wordleData = '';
    res.on('data', d => wordleData += d);
    res.on('end', () => {
        // parse the answers from the JS
        const matches = wordleData.match(new RegExp(`var ${wordleVar}=(\\[[^\\]]+\\])`)),
            answers = JSON.parse(matches[1]);

        // get tweets
        fetch(params, opts).on('data', ({text}) => {
            const textData = text.split('\n'),
                number = textData[0].split(' ')[1];

            guesses[number] = {
                guess: textData[2],
                answer: answers[number],
            };
        }).on('info', () => {
            // loop through tweets and find all the greens for all known letters
            Object.values(guesses).forEach(guessData => {
                [...guessData.guess].forEach((result, index) => {
                    if (result == '🟩') {
                        word[index] = guessData.answer[index];
                    }
                });
            });

            // now parse the yellows and get facts about what other letters are in the guess
            Object.values(guesses).forEach(guessData => {
                let guess = [...guessData.guess],
                    answer = [...guessData.answer];

                word.forEach((c, i) => {
                    delete guess[i];

                    if (answer.indexOf(c) > -1) {
                        answer.splice(answer.indexOf(c), 1);
                    }
                });

                // if we have yellows in the guess, we have a pool of letters (and how many should be from that pool)
                const yellows = guess.filter(c => c === '🟨').length;
                if (yellows) {
                    facts.push({
                        letters: yellows,
                        from: [... new Set(answer.filter(Boolean))],
                        guess: guess,
                    });
                }
            });

            // maybe we got it already?
            if (word.filter(Boolean).length == 5) {
                return console.log('Found guess:', word.join('').toUpperCase());
            }

            // filter the choices according to the facts
            let choices = popular.filter(matchesGuess(word)).filter(choice => {
                choice = [...choice];
                word.forEach((c, i) => delete choice[i]);

                // all facts must have their criteria met
                return facts.every(fact => {
                    const intersection = fact.from.filter(c => choice.includes(c));
                    if (intersection.length < fact.letters) { return false; } // not enough letters from the pool

                    // now check the word would actually fit the yellows
                    return fact.guess.every((c, i) => {
                        if (c != '🟨') { return true; }
                        return fact.from.includes(choice[i]);
                    });
                });
            });

            console.log(guesses);
            console.log(word);
            console.log(facts);
            console.log(choices);

            if (choices.length == 1) {
                console.log('Found guess:', choices[0].toUpperCase());
            }
        });
    });
});
