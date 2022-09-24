import React from "react";

function Die(props) {


    return (
        <div onClick={props.holdDie} className={props.isHeld ? "die die-held" : "die"}>
            <h2>
                {props.value}
            </h2>
        </div>
    )
}

export default Die