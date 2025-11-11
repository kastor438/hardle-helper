//Packages
import React, { useEffect, useState } from 'react'
import { ViewportList } from 'react-viewport-list';
//Assets
import reactLogo from './assets/react.svg'
//Interfaces
import type { Guess } from './Interfaces/Guess';
//Components
import GuessRow from './Components/GuessRow';
import Cell from './Components/Cell';
//Data
import words from './data/words.json'
//Styles
import './App.css'

function App() {
    //Constants
    const wordLength = 5;
    const maxGuesses = 10;

    const wordList = (words[wordLength]
        ? (words[wordLength] as string[]).sort().map(word => word.toUpperCase())
        : (words['5'] as string[]).sort()).map(word => word.toUpperCase());

    //States
    const [focusedCell, SetFocusedCell] = useState<number>(0);
    const [currentGuess, SetCurrentGuess] = useState<string[]>(Array.from({ length: wordLength }, () => ''));
    const [currentPresentCount, SetCurrentPresentCount] = useState<number>(0);
    const [currentCorrectCount, SetCurrentCorrectCount] = useState<number>(0);
    const [guessList, SetGuessList] = useState<Guess[]>([]);
    const [possibleWordList, SetPossibleWordList] = useState<string[]>(wordList);
    const [evaluatedWordsList, SetEvaluatedWordsList] = useState<string[]>([]);

    //Hooks
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(focusedCell < 0 || focusedCell >= wordLength){
                return;
            }

            const key = e.key.toUpperCase();
            if (key.length === 1 && key >= 'A' && key <= 'Z') {
                const newGuess = [...currentGuess];
                newGuess[focusedCell] = key;
                SetCurrentGuess(newGuess);
                const newFocusedCell = Math.min(focusedCell + 1, wordLength - 1);
                SetFocusedCell(newFocusedCell);
            } else if (key === 'BACKSPACE') {
                if(currentGuess[focusedCell] === '' && focusedCell > 0){
                    const newFocusedCell = Math.max(focusedCell - 1, 0);
                    SetFocusedCell(newFocusedCell);
                } else{
                    const newGuess = [...currentGuess];
                    newGuess[focusedCell] = '';
                    SetCurrentGuess(newGuess);
                }
            } else if (key === 'ENTER') {
                OnSubmitGuess(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
            } else if (key === 'ARROWLEFT') {
                if(focusedCell > 0){
                    const newFocusedCell = Math.max(focusedCell - 1, 0);
                    SetFocusedCell(newFocusedCell);
                }
            } else if (key === 'ARROWRIGHT') {
                if(focusedCell < wordLength - 1){
                    const newFocusedCell = Math.min(focusedCell + 1, wordLength - 1);
                    SetFocusedCell(newFocusedCell);
                }
            }
        };

        window.addEventListener('keyup', handleKeyDown);
        return () => {  
            window.removeEventListener('keyup', handleKeyDown);
        };
    }, [focusedCell, currentGuess]);

    useEffect(() => {
        if(focusedCell < 0){
            SetFocusedCell(0);
        } else if(focusedCell >= wordLength){
            SetFocusedCell(wordLength - 1);
        }
    }, [focusedCell]);

    useEffect(() => {
        if(currentPresentCount + currentCorrectCount > wordLength){
            if(currentPresentCount > 0){
                SetCurrentPresentCount(currentPresentCount - 1);
            }

            if(currentCorrectCount > 0){
                SetCurrentCorrectCount(currentCorrectCount - 1);
            }
        }
    }, [currentPresentCount, currentCorrectCount]);

    useEffect(() => {
        const newPossibleWordList = DeterminePossibleWordList(wordList);
        SetPossibleWordList(newPossibleWordList);
    }, [guessList]);

    useEffect(() => {
        if(guessList.length === 0){
            SetEvaluatedWordsList(possibleWordList);
            console.log("test");
            return;
        }
        if(possibleWordList.length === 0){
            SetEvaluatedWordsList([]);
            return;
        }

        const evaluatedWordsPoints = Array.from({ length: possibleWordList.length }, () => 0);
        
        possibleWordList.forEach((word, wordIndex) => {
            const letterCountMap: { [key: string]: number } = {};
            word.split('').forEach(letter => {
                if(letterCountMap[letter]){
                    letterCountMap[letter]++;
                } else{
                    letterCountMap[letter] = 1;
                }
            });

            Object.keys(letterCountMap).forEach(letter => {
                const letterFrequency = possibleWordList.reduce((count, currentWord) => {
                    return count + (currentWord.includes(letter) ? 1 : 0);
                }, 0);

                evaluatedWordsPoints[wordIndex] += letterFrequency * letterCountMap[letter];
            });
        });

        const evaluatedWordsList: string[] = possibleWordList.sort((a, b) => {
            const aIndex = possibleWordList.indexOf(a);
            const bIndex = possibleWordList.indexOf(b);
            return evaluatedWordsPoints[bIndex] - evaluatedWordsPoints[aIndex];
        });
        SetEvaluatedWordsList(evaluatedWordsList);
    }, [possibleWordList]);

    //Functions
    function OnSubmitGuess(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(currentGuess.join('').toUpperCase());
        if(!wordList.includes(currentGuess.join('').toUpperCase()) || guessList.length >= maxGuesses || currentPresentCount + currentCorrectCount > wordLength){
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

    function DeterminePossibleWordList(possibleWordList: string[]): string[] {
        guessList.forEach(guessEntry => {
            possibleWordList = possibleWordList.filter(word => {
                if(guessEntry.guess.join('') === word){
                    return false;
                }

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

        return possibleWordList;
    }

    function ResetHardleHelper() {
        SetFocusedCell(0);
        SetCurrentGuess(Array.from({ length: wordLength }, () => ''));
        SetCurrentPresentCount(0);
        SetCurrentCorrectCount(0);
        SetGuessList([]);
        SetPossibleWordList(wordList);
    }

    return (
        <div id='hardle-app-container'>
        <div id='hardle-header'>
            <div id='hardle-header-left-spacer'>
                <img id='hardle-header-logo' src={reactLogo} alt='React Logo' />
                <h1 id='hardle-header-title'>Hardle Helper</h1>
            </div>
            <div id='hardle-header-right-controls'>
                <button id='hardle-header-reset-button' onClick={ResetHardleHelper}>Reset</button>
            </div>
        </div>
        <div id='hardle-main-container'>
            <div id='hardle-guess-container'>
                <div id='hardle-guess-list'>
                    {
                        Array.from({ length: maxGuesses }).map((_, i) => (
                            <GuessRow
                                key={`hardle-guess-row-${i}`}
                                guess={guessList[i]}
                                isCurrentGuess={i === guessList.length - 1}
                                wordLength={wordLength}
                                rowNum={i}
                            />
                        ))
                    }
                </div>
                <form id='hardle-inputs-container' onSubmit={OnSubmitGuess}>
                    <div id='hardle-input-guess-counters-container'>
                        <Cell
                            cellType='present'
                            count={currentPresentCount}
                            OnChangeNumber={(newCount: number) => SetCurrentPresentCount(newCount)}
                        />
                        <Cell
                            cellType='correct'
                            count={currentCorrectCount}
                            OnChangeNumber={(newCount: number) => SetCurrentCorrectCount(newCount)}
                        />
                    </div>
                    <div className='hardle-input-guess-cells'>
                        {
                            Array.from({ length: wordLength }).map((_, i) => (
                                <div className={`hardle-input-guess-cell${focusedCell === i ? ' active-cell' : ''}`} data-cell_index={i} key={`hardle-input-guess-cell${i}`} onClick={() => SetFocusedCell(i)}>
                                    <span className='hardle-input-guess-letter'>{currentGuess[i]}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div id='hardle-guess-submit-container'>
                        <button id='hardle-guess-submit-button' type='submit'>Submit Guess</button>
                    </div>
                </form>
            </div>
            <div id='hardle-words-container'>
                <div id='hardle-words-list-header'>
                    <span id='hardle-words-list-header-title'>Possible Words</span>
                </div>
                <div id='hardle-words-list'>
                    <ViewportList
                        items={evaluatedWordsList}
                    >
                        {(word, index) => (
                            <div key={`hardle-words-list-item-${index}`} className='hardle-words-list-item'>
                                {word}
                            </div>
                        )}
                    </ViewportList>
                </div>
            </div>
        </div>
        </div>
    )
}

export default App
