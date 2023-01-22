import { useState } from "react";
import "./UploadButton.css";

function UploadButton() {
    let txt = "Make Predictions";
    const [buttonTxt, setButtonTxt] = useState(txt);

    function clickHandler(e) {
        console.log("1.Image upload OK,\n2. Param selection OK,\n3. HTTP request sent");
        setButtonTxt("Loading...");
    };

    return (
        <button onClick={clickHandler}>{buttonTxt}</button>
    );
}

export default UploadButton;