function ValidateMsg(props) {
    return (
        <div className="validate-msg">
            <i className="fa-solid fa-circle-exclamation"></i>
            Please enter {props.fieldName}
        </div>
    )
}

function ErrorMsg(props) {
    return (
        <div className={`validate-msg ${props.class}`}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {props.text}
        </div>
    )
}

export { ValidateMsg, ErrorMsg };