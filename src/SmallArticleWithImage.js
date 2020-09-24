import React from "react";

export const SmallArticleWithImage = ({image, title, pubDate, author, categories, link, handleClick}) => {
    const date = new Date(pubDate);
    const shortDate = `${date.getDate()}\\${date.getMonth() + 1}\\${date.getFullYear()}`;

    return (
        <section className={'item'} id={link} onClick={handleClick}>
            <div className={'item__div'}>
                <section className={'item__categories'} style={{position: "absolute", left: 0, top: 0}}>
                    {categories ? categories.map((category, i) => <p key={i}>{category._}</p>) : null}
                </section>
                <img src={image} alt={""}/>
            </div>
            <h1>{title}</h1>
            <div className={'item__information'}>
                <h3>{shortDate}</h3>
                <h3>{author}</h3>
            </div>
        </section>
    );
}