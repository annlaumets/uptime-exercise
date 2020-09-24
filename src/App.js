import React, {useEffect, useState} from 'react';
import './App.scss';
import Mercury from "@postlight/mercury-parser";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Select from "react-dropdown-select";
import {SmallArticle} from "./SmallArticle";
import {SmallArticleWithImage} from "./SmallArticleWithImage";
import {RSSListItem} from "./RSSListItem";


let Parser = require("rss-parser");
let parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
        ]
    }
});

const baseUrl = "https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss";

function parseRSS(url) {
    return parser.parseURL(url)
        .then(feed => feed.items)
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

            // Collect the categories
            let categoriesSet = new Set();
            let categories = [];
            for (let i = 0; i < result.length; i++) {
                const item = result[i];
                if ('categories' in item) {
                    if (item.categories.some(el => typeof el === 'object')) {
                        item.categories.forEach(category => categoriesSet.add(category._));
                    }
                    else {
                        item.categories.forEach(category => categoriesSet.add(category));
                    }

                }
            }

            categoriesSet.forEach(category => categories.push({value: category, label: category}));

            return {
                result: result,
                categories: categories
            };
        })
        .catch(e => console.error(e));
}

function App() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([{value: "none", label: "None"}]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [newRSSUrl, setNewRSSUrl] = useState('');
    const [rssUrls, setRSSUrls] = useState(JSON.parse(localStorage.getItem('rss')) || []);

    useEffect(() => {
        const urls = [...rssUrls, baseUrl];
        setItems([]);
        setFilteredItems([]);
        setCategories([{value: "none", label: "None"}]);

        for (let i = 0; i < urls.length; i++) {
            parseRSS(urls[i])
                .then(data => {
                    setItems(oldItems => [...oldItems, ...data.result]);
                    setFilteredItems(oldItems => [...oldItems, ...data.result]);
                    setCategories(oldCategories => [...oldCategories, ...data.categories]);
                })
                .catch(e => console.error(e));
        }
    }, [rssUrls]);

    const filterCategories = (value) => {
        // If no category is selected, display all items
        if (value[0].value === "none") {
            setFilteredItems(items);
        }
        else {
            // Filter items based on the category names
            const filtered = items.filter(item => {
                if ("categories" in item) {
                    if (item.categories.some(el => typeof el === 'object')) {
                        return item.categories.some(el => el._ === value[0].value);
                    }
                    else {
                        return item.categories.some(el => el === value[0].value);
                    }
                }
                return false;
            });

            setFilteredItems(filtered);
        }
    }

    const handleClick = (e) => {
        const link = e.currentTarget.id;
        Mercury.parse(link)
            .then(result => {
                // author, title, content, date_published, lead_image_url, word_count
                const overlayArticle = document.querySelector('.overlay__article');
                overlayArticle.innerHTML = result.content;

                // Show the overlay
                const overlay = document.querySelector('.overlay');
                overlay.style.display = "block";
            })
            .catch(e => console.error(e));
    }

    const closeArticle = () => {
        const overlay = document.querySelector('.overlay');
        overlay.style.display = "none";
    }

    const addRSSFeed = () => {
        const url = newRSSUrl;
        const previousUrls = JSON.parse(localStorage.getItem('rss'));
        if (previousUrls) {
            localStorage.setItem('rss', JSON.stringify([...previousUrls, url]));
        }
        else {
            localStorage.setItem('rss', JSON.stringify([url]));
        }

        setRSSUrls(JSON.parse(localStorage.getItem('rss')));
        setNewRSSUrl('');
    }

    function removeRSSUrl(id) {
        let local = JSON.parse(localStorage.getItem('rss'));
        local.splice(id, 1);
        localStorage.setItem('rss', JSON.stringify(local));
        setRSSUrls(local);
    }

    const confirmUrl = (id, newUrl) => {
        const local = JSON.parse(localStorage.getItem('rss'));
        local[id] = newUrl;
        localStorage.setItem('rss', JSON.stringify(local));
        setRSSUrls(local);
    }

    return (
        <div className={'App'}>
            <section className={'filters'}>
                <div className={'rss-add'}>
                    <p>Add new RSS feed:</p>
                    <section>
                        <input type={"text"} value={newRSSUrl} onChange={e => setNewRSSUrl(e.target.value)} /> {/*value={url} onChange={setUrl} />*/}
                        <button onClick={addRSSFeed}>Add</button>
                    </section>
                </div>

                <div className={'rss-list'}>
                    <ul>{rssUrls.map((url, i) =>
                        <RSSListItem key={i} id={i} url={url} removeUrl={removeRSSUrl}
                                     confirmUrl={confirmUrl} />)}
                    </ul>
                </div>

                <div className={'category-select'}>
                    <p>Please select a category:</p>
                    <Select options={categories} onChange={(values) => filterCategories(values)}  values={[categories[0]]}/>
                </div>
            </section>

            <div className="grid">
                {filteredItems.map((item, i) => {
                    if ('media' in item) {
                        return <SmallArticleWithImage key={i} image={item.media.$.url} title={item.title}
                                                      pubDate={item.pubDate}
                                                      author={item.creator} categories={item.categories} link={item.link}
                                                      handleClick={handleClick}
                        />
                    } else {
                        return <SmallArticle key={i} title={item.title} author={item.creator}
                                             contentSnippet={item.contentSnippet} categories={item.categories}
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
