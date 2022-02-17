# Wordle Reverse

Works out the first guess from a list of tweets.

## Easy Mode

With enough data, this can uinquely determine the first guess, because of the distribution of greens:

```bash
node index.js 20
Found guess: SAINT
```

## Word List

If there is not enough information from the greens alone, a [popular word list](https://github.com/dwyl/english-words/)
is used to check against the guesses:

```bash
node index.js 5

{
  '239': { guess: '⬜⬜🟨🟨⬜', answer: 'robin' },
  '240': { guess: '⬜⬜🟨🟨⬜', answer: 'cynic' },
  '241': { guess: '⬜🟨⬜⬜⬜', answer: 'aroma' },
  '242': { guess: '⬜🟩⬜⬜⬜', answer: 'caulk' },
  '243': { guess: '🟩🟨⬜⬜⬜', answer: 'shake' }
}
[ 's', 'a' ]
[
  {
    letters: 2,
    from: [ 'r', 'o', 'b', 'i', 'n' ],
    guess: [ '', '', '🟨', '🟨', '⬜' ]
  },
  {
    letters: 2,
    from: [ 'c', 'y', 'n', 'i' ],
    guess: [ '', '', '🟨', '🟨', '⬜' ]
  }
]
[ 'sains', 'saint', 'sanit' ]
```

With enough information, this too can uniquely determine the first guess:

```bash
node index.js 15
...
[ 'saint' ]
Found guess: SAINT
```
