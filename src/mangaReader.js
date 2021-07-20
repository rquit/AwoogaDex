import "./mangaReader.css";
import React, { useState, useEffect } from "react";
import useEventListener from '@use-it/event-listener';
const axios = require("axios");

export default function MangaReader({ match }) {
    const [chapterInfo, setChapterInfo] = useState({});
    let dataSaverStatus = false;
    const preloadStatus = true;
    const limit = 24;
    const chapterID = match.params.chapterid;
    const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';
    let pages = [];
    useEffect(() => {
        async function getChapter(chapterID, _callback) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            pages = [];
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`, 
                params: {
                    ids: [`${chapterID}`],
                    translatedLanguage: ['en'],
                    limit: limit,
                    "order[chapter]": "asc"
                }
            }).then(async response => {
                let resData = response.data.results[0].data.attributes;
                // get base url to reconstruct the iamge ur
                let imageBaseUrl = await axios.get(`${baseURL}/at-home/server/${chapterID}`);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                if(resData.dataSaver) dataSaverStatus = true;
                // push all of the chapter pages into the pages array
                const pageData = (dataSaverStatus ? resData.dataSaver : resData.data);
                pageData.forEach(page => {
                    pages.push(`${imageBaseUrl.data.baseUrl}/${dataSaverStatus ? 'data-saver' : 'data'}/${resData.hash}/${page}`);
                });

                setChapterInfo({
                    chapter: resData.chapter,
                    volume: (resData.volume ? resData.volume : "?"),
                    pages: pages,
                });
                console.log("called")
            }).catch(err => console.error(err));
            _callback();
        }
        async function preloadPages() {
            if(preloadStatus) {
                pages.forEach(page => {
                    new Image().src = page;
                });
            } else if(!preloadStatus) {
                return;
            }
        }
        // this is so there isnt any stupid ass error with "OH YEAH IM FUCKING REACTARDED AND I AM AN IMPATIENT PIECE OF SHIT HOLY FUCK"
        function load() {
            getChapter(chapterID, () => preloadPages());
        }

        load();
    }, [chapterID])
    
    return (
        <div id="top">
            {chapterInfo.pages ? <PageReader chapterInfo={chapterInfo} /> : <p>Preloading all images, please wait. This is to prevent lag while reading.</p>}
        </div>
    )
}

function PageReader(props) {
    const [pageNumber, setPageNumber] = useState(0);
    const [imgDisplay, setImgDisplay] = useState("original");
    const [imgStyle, setImgStyle] = useState({
        width: "",
        height: ""
    });
    const { pages } = props.chapterInfo;
    let page = pages[pageNumber];

    function changeStyle(e) {
        e.preventDefault();
        if(imgDisplay === "original") {
            setImgStyle({
                width: "",
                height: ""
            });
        } else if(imgDisplay === "fit-width") {
            setImgStyle({
                width: "75vw",
                height: ""
            });
        } else if(imgDisplay === "fit-height") {
            setImgStyle({
                width: "",
                height: "100vh"
            });
        }
    }

    function incrementPageNumber() {
        if(pageNumber < pages.length - 1) {
            setPageNumber(pageNumber + 1);
        } else if(pageNumber >= pages.length - 1) {
            return;
        }
    }

    function decrementPageNumber() {
        if(pageNumber > 0) {
            setPageNumber(pageNumber - 1);
        } else if(pageNumber <= 0) {
            return;
        }
    }

    function endPageNumber() {
        setPageNumber(pages.length - 1);
    }

    function startPageNumber() {
        setPageNumber(0);
    }

    function handler({ key }) {
        switch(key) {
            case 'ArrowRight':
                incrementPageNumber();
                break;
            case 'ArrowLeft':
                decrementPageNumber();
                break;
            default:
                break;
        }
    }

    useEventListener('keydown', handler);
    
    return (<>
        <div className="sidebar">
            <BackToHome />
            <p className="page-number">Page {pageNumber + 1}</p>
            <div className="nav-buttons">
                <button className="change-page" onClick={decrementPageNumber}>&lt;</button>
                <button className="change-page" onClick={startPageNumber}>Start</button>
                <button className="change-page" onClick={endPageNumber}>End</button>
                <button className="change-page" onClick={incrementPageNumber}>&gt;</button>
            </div>
            <form id="style-dropdown" onSubmit={e => changeStyle(e)} className="style-dropdown">
                <select id="mobile-submit" type="submit" name="style" onChange={e => setImgDisplay(e.target.value)} >
                    <option value="original">Original</option>
                    <option value="fit-width">Fit Width</option>
                    <option value="fit-height">Fit Height</option>
                </select>
                <button className="form-submit" type="submit">✓</button>
            </form>
        </div>
        <div className="reader-page">
            <div className="click-to-change">
                <a readOnly class="change-page-i noSelect" type="text" href="#top" onClick={decrementPageNumber}></a>
                <a readOnly class="change-page-i noSelect" type="text" href="#top" onClick={incrementPageNumber}></a>
            </div>
            <div className="dummy-div"></div>
            <div className="reader-container">
                {/* eslint-disable-next-line no-sequences */}
                <img style={imgStyle} id="img" className="reader-image" src={page} alt={`page ${pageNumber + 1} from manga`} />
            </div>
        </div>
    </>)
}

function BackToHome() {
    return (
        <div className="home-btn-sidebar">
            <a id="home-btn-link" className="home-btn-link" href="/"><button id="home-btn-sidebar">Back To Home</button></a>
        </div>
    )
}