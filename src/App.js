import React from 'react';
import './App.css';
import Die from "./Die"
import { nanoid } from 'nanoid'
import Confetti from 'react-confetti';

function App() {

    // helper function to format an elapsed time to a String in format 0:00
    const formatTime = React.useCallback(time => {
        if (time === 0) return "0:00"
        if (!time) return false;

        time = time / 1000
        let seconds = Math.floor(time % 60);
        let secondString = seconds < 10 ? "0" + seconds : seconds;
        time = Math.floor(time / 60)
        let minutes = time % 60;

        return `${minutes}:${secondString}`
    }, [])

    // initialize state with random number array
    const [dice, setDice] = React.useState(allNewDice())

    // whether user has won the game
    const [tenzies, setTenzies] = React.useState(false)

    // start time Date object of the current game
    const [startTime, setStartTime] = React.useState(new Date());

    // elapsed time of the current game
    const [elapsedTime, setElapsedTime] = React.useState(0);

    // best time ever from LocalStorage, or none (lazy state initialization)
    const [bestTime, setBestTime] = React.useState(() => JSON.parse(localStorage.getItem("bestTime")))

    // effect runs every time dice state array changes
    React.useEffect(() => {
        // user wins if all dice are held and have the same value
        const firstVal = dice[0].value
        const won = dice.every(die => die.isHeld && die.value === firstVal)
        if (won) {
            setTenzies(true)
        }
    }, [dice])


    // helper function to generate one random die object
    // value is a random number between 1-6 inclusive and isHeld defaults to false
    function createRandomDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }

    // returns an array of 10 random dice
    function allNewDice() {
        return Array(10).fill().map(() => createRandomDie())
    }

    // mark an individual die as "held"
    function holdDie(id) {
        setDice(prevDice => {
            return prevDice.map(die => die.id === id ? { ...die, isHeld: !die.isHeld } : die)
        })
    }

    // event handler for "roll" button click
    function rollClick() {
        setDice(prevDice => prevDice.map(die => {
            // return the die as-is if held, otherwise create a new die
            return (die.isHeld ? die : createRandomDie())
        }))
    }

    // reset game
    function resetGame() {
        setTenzies(false)
        setDice(allNewDice())

        // reset game start time and elapsed time
        setStartTime(new Date())
        setElapsedTime(0)
    }

    // update time display until game is won
    React.useEffect(() => {

        // update the display clock every 1 second
        const interval = setInterval(() => {
            setElapsedTime(new Date().getTime() - startTime.getTime())
        }, 1000)


        if (tenzies) {
            clearInterval(interval)

            // save the current elapsed time as bestTime if it beats best time or if best time is undefined
            if (!bestTime || elapsedTime < bestTime) {
                setBestTime(elapsedTime)
                localStorage.setItem("bestTime", JSON.stringify(elapsedTime))
            }
        }

        // return cleanup function to clear interval
        return () => clearInterval(interval)

    }, [formatTime, startTime, bestTime, elapsedTime, tenzies])


    let diceComponents = dice.map(die => (
        <Die
            key={die.id}
            holdDie={() => holdDie(die.id)}
            value={die.value}
            isHeld={die.isHeld}
        />
    ))

    return (
        <div className="border">
            {tenzies && <Confetti />}

            <main>
                <h1>Tenzies</h1>
                <p className="instructions">
                    Roll until all dice are the same. Click each die to freeze it at its current value between rolls.
                </p>
                <div className="dice-container">
                    {diceComponents}
                </div>
                <button
                    className="roll-button"
                    onClick={tenzies ? resetGame : rollClick}
                >
                    {tenzies ? "New Game" : "Roll"}
                </button>

                <div className="progress">

                    <span> time: {formatTime(elapsedTime)}</span>
                    {bestTime && <span> best time: {formatTime(bestTime)} </span>}

                </div>
            </main>

        </div>
    );
}

export default App;
