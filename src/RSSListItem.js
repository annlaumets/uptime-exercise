import React, {useState} from "react";

export const RSSListItem = ({id, url, removeUrl, confirmUrl}) => {
    const [newUrl, setNewUrl] = useState(url);
    const [showInput, setShowInput] = useState(false);

    const editUrl = () => {
        setShowInput(true);
    }

    const confirmNewUrl = () => {
        setShowInput(false);
        confirmUrl(id, newUrl);
    }

    return (
        <li>
            {showInput
                ? (<>
                    <input type={"text"} value={newUrl} onChange={e => setNewUrl(e.target.value)}/>
                    <button onClick={confirmNewUrl}>Confirm</button>
                </>)
                : (<>
                    <a href={url} rel="noopener noreferrer" target={"_blank"}>{url}</a>
                    <button onClick={editUrl}>Edit</button>
                </>)
            }
            <button onClick={() => removeUrl(id)}>Remove</button>
        </li>
    );
}