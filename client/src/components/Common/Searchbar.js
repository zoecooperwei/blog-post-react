const { useState, useEffect } = require("react");
import "./Searchbar.css";

function Searchbar(props) {
    const [searchInput, setSearchInput] = useState("");
    let searchTimeout = null;

    // useEffect(() => {
    //     if(props.searchString != undefined) {
    //         setSearchInput(props.searchString);
    //     }
    // }, [props.searchString])

    const onSearchInputChange = (event) => {
        setSearchInput(event.target.value);
        if (props.asYouType) {
            if (searchTimeout != null) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => props.handleSearch(event.target.value), 400);
        }
    }

    const onClearSearch = () => {
        setSearchInput('');
        props.handleSearch('');
    }

    const onKeyPress = (event) => {
        if (event != null) {
            if (event.keyCode == 13) { // Enter
                props.handleSearch(searchInput);
            }
        }
    }

    return (
        <div className={props.className + " search-bar-container"}>
            <div className="search-icon">
                <i className="fa-solid fa-magnifying-glass"></i> 
            </div>
            <input 
                className="search-bar-input" 
                type="search" 
                value={searchInput} 
                placeholder={props.placeholder} 
                onChange={onSearchInputChange} 
                onKeyDownCapture={onKeyPress}
            ></input>
            {searchInput.length > 0 &&
            <div className="search-bar-clear-button" onClick={onClearSearch}>
                <i className="fa-solid fa-xmark"></i>
            </div>
            }
        </div>
    );
}

export default Searchbar;