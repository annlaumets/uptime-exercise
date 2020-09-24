import React from "react";

export const SmallArticle = ({title, contentSnippet, pubDate, author, link, handleClick}) => {
    const date = new Date(pubDate);
    const shortDate = `${date.getDate()}\\${date.getMonth() + 1}\\${date.getFullYear()}`;

    return (
        <section className={'item'} id={link} onClick={handleClick}>
            <h1>{title}</h1>
            <p>{contentSnippet}</p>
            <div className={'item__information'}>
                <h3>{shortDate}</h3>
                <h3>{author}</h3>
            </div>
        </section>
    );
}