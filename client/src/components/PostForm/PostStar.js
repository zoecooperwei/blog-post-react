import { useState } from "react";
import "./PostStar.css";

function Star(props) {
    const fullNumber = 5;

    const changeRating = (index) => {
        props.onRatingChange(index+1);
    }

    let stars = [...Array(fullNumber)].map((_, index) => {
        let isLight = (props.rating - 1) >= index;
        return (
            <div className="star-container" key={index} onClick={() => props.disableClick ? {} : changeRating(index)}>
                {isLight && <i className="fa-solid fa-heart"></i>}
                {!isLight && <i className="fa-regular fa-heart"></i>}
            </div>
        )
    });

    return (
        <div className="rating-row">
            {stars}
        </div>
    )
}

export default Star;