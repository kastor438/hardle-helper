//Packages
import React from 'react';
//Styles
import './GuessRow.css';

export interface GuessRowProps {
    guess?: {
        guess: string[];
        presentCount: number;
        correctCount: number;
    };
    isCurrentGuess?: boolean;
    wordLength: number;
    rowNum: number;
}

const GuessRow = ({guess, isCurrentGuess, wordLength, rowNum}: GuessRowProps) => {
    const presentGuessCounterContainerRef = React.useRef<HTMLDivElement>(null);
    const correctGuessCounterContainerRef = React.useRef<HTMLDivElement>(null);
 
    return (
        <div className={`hardle-guess-list-row${isCurrentGuess ? ' currRow' : ''}`} key={rowNum}>
            <div className='hardle-guess-cells'>
                {
                    Array.from({ length: wordLength }).map((_, j) => (
                        <div className='hardle-guess-letter-container' data-guess_row={rowNum} data-cell_index={j} key={j}>
                            <span className='hardle-guess-letter'>{guess ? guess.guess[j] : ''}</span>
                        </div>
                    ))
                }
            </div>
            <div className={`guess-row-counters-container ${guess ? 'validGuess' : ''}`}>
                <div ref={presentGuessCounterContainerRef} id={`hardle-guess-present-counter-container`} className='hardle-guess-counter-container'>
                    <span className='hardle-guess-counter'>{guess ? guess.presentCount : 0}</span>
                </div>
                <div ref={correctGuessCounterContainerRef} id={`hardle-guess-correct-counter-container`} className='hardle-guess-counter-container'>
                    <span className='hardle-guess-counter'>{guess ? guess.correctCount : 0}</span>
                </div>
            </div>
        </div>
    )
}

export default GuessRow;