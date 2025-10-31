//Packages
import React, { useEffect, useRef, useState } from 'react'
//Assets
import reactLogo from './assets/react.svg'
//Data
import words from './data/words.json'
//Styles
import './App.css'

function App() {
    //Object Interfaces
    interface Guess {
        guess: string[];
        presentCount: number;
        correctCount: number;
    }

    //Constants
    const wordLength = 5;
    const maxGuesses = 10;

    const wordList = words[wordLength]
        ? (words[wordLength] as string[]).sort()
        : (words['5'] as string[]).sort();

    //States
    const [focusedCell, SetFocusedCell] = useState<number>(0);
    const [currentGuess, SetCurrentGuess] = useState<string[]>(Array.from({ length: wordLength }, () => ''));
    const [currentPresentCount, SetCurrentPresentCount] = useState<number>(0);
    const [currentCorrectCount, SetCurrentCorrectCount] = useState<number>(0);
    const [guessList, SetGuessList] = useState<Guess[]>([]);

    //Refs
    const hardleGuessPresentCounterContainerRef = useRef<HTMLDivElement>(null);
    const hardleGuessCorrectCounterContainerRef = useRef<HTMLDivElement>(null);
    
    //Hooks
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (key.length === 1 && key >= 'A' && key <= 'Z') {
                const newGuess = [...currentGuess];
                newGuess[focusedCell] = key;
                SetCurrentGuess(newGuess);
                SetFocusedCell(focusedCell + 1);;
            } else if (key === 'BACKSPACE') {
                if(currentGuess[focusedCell] === '' && focusedCell > 0){
                    SetFocusedCell(focusedCell - 1);
                } else{
                    const newGuess = [...currentGuess];
                    newGuess[focusedCell] = '';
                    SetCurrentGuess(newGuess);
                }
            } else if (key === 'ENTER') {
                OnSubmitGuess(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
            } else if (key === 'ARROWLEFT') {
                if(focusedCell > 0){
                    SetFocusedCell(focusedCell - 1);
                }
            } else if (key === 'ARROWRIGHT') {
                if(focusedCell < wordLength - 1){
                    SetFocusedCell(focusedCell + 1);
                }
            }
        };

        window.addEventListener('keyup', handleKeyDown);
        return () => {  
            window.removeEventListener('keyup', handleKeyDown);
        };
    }, [focusedCell, currentGuess]);


    //Functions
    function UpdatePresentCounter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (hardleGuessPresentCounterContainerRef.current) {
            const containerRect = hardleGuessPresentCounterContainerRef.current.getBoundingClientRect();
            const clickY = e.clientY;

            const relativeClickY = clickY - containerRect.top;

            if (relativeClickY < containerRect.height / 2) {
                console.log('Click on upper part of container');
                SetCurrentPresentCount((prevCount) => (prevCount + 1) % (wordLength + 1));
            } else {
                console.log('Click on lower part of container');
                SetCurrentPresentCount((prevCount) => (prevCount - 1 + (wordLength + 1)) % (wordLength + 1));
            }
        }
    }

    function UpdateCorrectCounter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (hardleGuessCorrectCounterContainerRef.current) {
            const containerRect = hardleGuessCorrectCounterContainerRef.current.getBoundingClientRect();
            const clickY = e.clientY;

            const relativeClickY = clickY - containerRect.top;

            if(relativeClickY/containerRect.height < 0.6 && relativeClickY/containerRect.height > 0.4){
                return;
            }
            else if (relativeClickY < containerRect.height / 2) {
                console.log('Click on upper part of container');
                SetCurrentCorrectCount((prevCount) => (prevCount + 1) % (wordLength + 1));
            } else {
                console.log('Click on lower part of container');
                SetCurrentCorrectCount((prevCount) => (prevCount - 1 + (wordLength + 1)) % (wordLength + 1));
            }
        }
    }

    function OnSubmitGuess(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(!wordList.includes(currentGuess.join('').toLowerCase()) || guessList.length >= maxGuesses || currentPresentCount + currentCorrectCount > wordLength){
            alert('Invalid guess');
            return;
        }

        // Successfully submit guess
        if(currentGuess.every(letter => letter !== '')) {
            const newGuessList = [...guessList];
            newGuessList.push({
                guess: currentGuess,
                presentCount: currentPresentCount,
                correctCount: currentCorrectCount
            });
            
            SetGuessList(newGuessList);
            SetCurrentGuess(Array.from({ length: wordLength }, () => ''));
            SetCurrentPresentCount(0);
            SetCurrentCorrectCount(0);
            SetFocusedCell(0);
        }
    }

    function DeterminePossibleWordList(): string[] {
        let possibleWords = [...wordList];

        guessList.forEach(guessEntry => {
            possibleWords = possibleWords.filter(word => {
                let presentCount = 0;
                let correctCount = 0;

                const wordLetters = word.split('');

                guessEntry.guess.forEach((letter, index) => {
                    if (wordLetters[index] === letter) {
                        correctCount++;
                    } else if (wordLetters.includes(letter)) {
                        presentCount++;
                    }
                });

                return presentCount === guessEntry.presentCount && correctCount === guessEntry.correctCount;
            });
        });

        return possibleWords;
    }

    return (
        <div id='hardle-app-container'>
        <div id='hardle-header'>
            <img id='hardle-header-logo' src={reactLogo} alt='React Logo' />
            <h1 id='hardle-header-title'>Hardle Helper</h1>
        </div>
        <div id='hardle-main-container'>
            <div id='hardle-guess-container'>
                <div id='hardle-guess-list'>
                    {
                        Array.from({ length: maxGuesses }).map((_, i) => (
                            <div className='hardle-guess-list-row' key={i}>
                                <div className='hardle-guess-cells'>
                                    {
                                        Array.from({ length: wordLength }).map((_, j) => (
                                            <div className='hardle-guess-letter-container' data-guess_row={i} data-cell_index={j} key={j}>
                                                <span className='hardle-guess-letter'>{guessList[i] ? guessList[i].guess[j] : ''}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className={`hardle-guess-counters ${guessList[i] ? 'validGuess' : ''}`}>
                                    <div id='hardle-guess-present-counter-container' className='hardle-guess-counters-container'>
                                        <span className='hardle-guess-counter-value'>{guessList[i] ? guessList[i].presentCount : ''}</span>
                                    </div>
                                    <div id='hardle-guess-correct-counter-container' className='hardle-guess-counters-container'>
                                        <span className='hardle-guess-counter-value'>{guessList[i] ? guessList[i].correctCount : ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <form id='hardle-inputs-container' onSubmit={OnSubmitGuess}>
                    <div id='hardle-guess-counters-container'>
                        <div ref={hardleGuessPresentCounterContainerRef} id='hardle-input-guess-present-counter-container' className='hardle-input-guess-counter-container' onClick={(e) => UpdatePresentCounter(e)}>
                            <div className='hardle-guess-arrow-container hardle-guess-up-arrow-container'>
                                <span className='hardle-guess-arrow hardle-guess-up-arrow'>&#x25B2;</span>
                            </div>
                            <span className='hardle-guess-counter'>{currentPresentCount}</span>
                            <div className='hardle-guess-arrow-container hardle-guess-down-arrow-container'>
                                <span className='hardle-guess-arrow hardle-guess-down-arrow'>&#x25BC;</span>
                            </div>
                        </div>
                        <div ref={hardleGuessCorrectCounterContainerRef} id='hardle-input-guess-correct-counter-container' className='hardle-input-guess-counter-container' onClick={(e) => UpdateCorrectCounter(e)}>
                            <div className='hardle-guess-arrow-container hardle-guess-up-arrow-container'>
                                <span className='hardle-guess-arrow hardle-guess-up-arrow'>&#x25B2;</span>
                            </div>
                            <span className='hardle-guess-counter'>{currentCorrectCount}</span>
                            <div className='hardle-guess-arrow-container hardle-guess-down-arrow-container'>
                                <span className='hardle-guess-arrow hardle-guess-down-arrow'>&#x25BC;</span>
                            </div>
                        </div>
                    </div>
                    <div className='hardle-input-guess-cells'>
                        {
                            Array.from({ length: wordLength }).map((_, i) => (
                                <div className={`hardle-input-guess-cell${focusedCell === i ? ' active-cell' : ''}`} data-cell_index={i} key={i} onClick={() => SetFocusedCell(i)}>
                                    <span className='hardle-input-guess-letter'>{currentGuess[i]}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div id='hardle-guess-submit-container'>
                        <button id='hardle-guess-submit' type='submit'>Submit Guess</button>
                    </div>
                </form>
            </div>
            <div id='hardle-words-container'>
                <div id='hardle-words-list-header'>
                    <span id='hardle-words-list-header-title'>Possible Words</span>
                </div>
                <div id='hardle-words-list'>
                    {wordList.map((word, index) => (
                        <div key={index} className='hardle-words-list-item'>
                            {word}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div>
    )
}

export default App
