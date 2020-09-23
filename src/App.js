import React, {useEffect, useState} from 'react';
import './App.scss';
import Mercury from "@postlight/mercury-parser";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Select from "react-dropdown-select";


let Parser = require("rss-parser");
let parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
            ['category', 'category', {keepArray: true}]
        ]
    }
});

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"
const url = "https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss";

async function parseRSS(url) {
    let feed = await parser.parseURL(CORS_PROXY + url);
    return feed.items;
}

const SmallArticle = ({title, contentSnippet, pubDate, author, link, handleClick}) => {
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

const SmallArticleWithImage = ({image, title, pubDate, author, categories, link, handleClick}) => {
    //categories.forEach(category => console.log(category._));

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

function App() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([{value: "none", label: "None"}]);
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        parseRSS(CORS_PROXY + url)
            .then(result => {
                // Sort the posts by date
                result.sort(function (a, b) {
                    const keyA = new Date(a.isoDate),
                        keyB = new Date(b.isoDate);
                    // Compare the 2 dates
                    if (keyA < keyB) return 1;
                    if (keyA > keyB) return -1;
                    return 0;
                });

                setItems(result);
                setFilteredItems(result);

                // Collect the categories
                let categoriesSet = new Set();
                for (let i = 0; i < result.length; i++) {
                    const item = result[i];
                    if ('categories' in item) {
                        item.categories.forEach(category => categoriesSet.add(category._));
                    }
                }

                categoriesSet.forEach(category => setCategories(oldArray => [...oldArray, {value: category, label: category}]));
            })
            .catch(e => console.error(e));
    }, []);

    const filterCategories = (value) => {
        // If no category is selected, display all items
        if (value[0].value === "none") {
            setFilteredItems(items);
        }
        else {
            // Filter items based on the category names
            const filtered = items.filter(item => {
                if ("categories" in item) {
                    return item.categories.some(el => el._ === value[0].value);
                }
                return false;
            });

            setFilteredItems(filtered);
        }
    }

    const handleClick = (e) => {
        const link = e.currentTarget.id;
        Mercury.parse(CORS_PROXY + link)
            .then(result => {
                console.log(result);

                // author, title, content, date_published, lead_image_url, word_count
                const overlayArticle = document.querySelector('.overlay__article');
                overlayArticle.innerHTML = result.content;

                // Show the overlay
                const overlay = document.querySelector('.overlay');
                overlay.style.display = "block";
            });
    }

    const closeArticle = () => {
        const overlay = document.querySelector('.overlay');
        overlay.style.display = "none";
    }

    return (
        <div className={'App'}>
            <div className={'category-select'}>
                <p>Please select a category:</p>
                <Select options={categories} onChange={(values) => filterCategories(values)}  values={[categories[0]]}/>
            </div>

            <div className="grid">
                {filteredItems.map((item, i) => {
                    if ('media' in item) {
                        return <SmallArticleWithImage key={i} image={item.media.$.url} title={item.title}
                                                      pubDate={item.pubDate}
                                                      author={item.author} categories={item.categories} link={item.link}
                                                      handleClick={handleClick}
                        />
                    } else {
                        return <SmallArticle key={i} title={item.title} author={item.author}
                                             contentSnippet={item.contentSnippet}
                                             pubDate={item.pubDate} link={item.link} handleClick={handleClick}
                        />
                    }
                })}
            </div>

            <div className={'overlay'}>
                <div className={'button--close'} onClick={closeArticle}>
                    <FontAwesomeIcon icon={faTimes}/>
                </div>
                <section className={'overlay__article'}/>
            </div>
        </div>
    );
}

export default App;
