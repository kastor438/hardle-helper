//Packages
import React from 'react';
//Styles
import './Cell.css'

interface CellProps {
    cellType: string;
    count: number;
    OnChangeNumber?: ((newCount: number) => void) | (() => {});
}

const Cell = ({ cellType, count, OnChangeNumber }: CellProps) => {
    //Refs
    const hardleGuessCounterContainerRef = React.useRef<HTMLDivElement>(null);

    return (
        <div ref={hardleGuessCounterContainerRef} id={`hardle-input-guess-${cellType}-counter-container`} className='hardle-input-guess-counter-container'>
            <div className='hardle-guess-arrow-container hardle-guess-up-arrow-container' onClick={() => OnChangeNumber && OnChangeNumber(count + 1)}>
                <span className='hardle-guess-arrow hardle-guess-up-arrow'>&#x25B2;</span>
            </div>
            <span className='hardle-guess-counter'>{count}</span>
            <div className='hardle-guess-arrow-container hardle-guess-down-arrow-container' onClick={() => OnChangeNumber && OnChangeNumber(count - 1)}>
                <span className='hardle-guess-arrow hardle-guess-down-arrow'>&#x25BC;</span>
            </div>
        </div>
    )
}

export default Cell;