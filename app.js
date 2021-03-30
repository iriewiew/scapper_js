const puppeteer = require("puppeteer");
const args = process.argv.slice(2);
const { removeEmpty } = require('./utils');
const pramId = args[1] ? args[1].toString() : null;

const checkArgs = () => {
    switch (args[0].toString()) {
        case "box_office":
            console.log("getting box office data...")
            boxOffice();
            break;
        case "movie_data":
            console.log(`getting movie data ID: ${pramId}`)
            movieData(pramId)
            break;
    }
}
const symbols = [
    {
        title: "Nobody (2021)",
        id: "tt7888964"
    },
    {
        title: "Rā yā kạb mạngkr tạw sudtĥāy (2021)",
        id: "tt5109280"
    }
];

async function movieData(movieId) {
    // for await (symbol of symbols) {
    const data = await getDescription(movieId);
    console.log(data);
    // console.log(symbol)
    // }
}

async function boxOffice() {
    const data = await getBoxOffice();
    console.log(data);
}

async function getBoxOffice() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
        `https://www.imdb.com/chart/boxoffice/`
    );

    const text = await page.evaluate(() => {
        const date = document.querySelector(
            "div#boxoffice > h4"
        ).innerText;
        return date;
    });

    const table = await page.evaluate(() => {

        const rowNodeList = document.querySelectorAll('div#boxoffice > table > tbody > tr');
        const rowArray = Array.from(rowNodeList);
        return rowArray.map(tr => {
            const dataNodeList = tr.querySelectorAll('td');
            const dataArray = Array.from(dataNodeList);
            const dataNodeUrlList = tr.querySelectorAll('td > a');
            const dataUrlArray = Array.from(dataNodeUrlList);
            const dataNodeCoverList = tr.querySelectorAll('td > a > img');
            const dataCoverArray = Array.from(dataNodeCoverList);
            const [Img, Title, Weekend, Gross, Weeks, WatchList] = dataArray.map(td => td.innerText);
            const [CoverUrl] = dataCoverArray.map(img => img.getAttribute('src'));
            const [url] = dataUrlArray.map(a => a.getAttribute('href'));

            return { Title, Weekend, Gross, Weeks, CoverUrl, url }
        })
    });

    await browser.close();

    return {
        date: text,
        list: table
    };
}

async function getDescription(movieId) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
        `https://www.imdb.com/title/${movieId}/`
    );

    const data = await page.evaluate(() => {
        const title = document.querySelector(
            "#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > h1"
        ).innerText;
        const summary = document.querySelector(
            "#title-overview-widget > div.plot_summary_wrapper > div.plot_summary > div.summary_text"
        ).innerText;
        return {
            title,
            summary,
        };

    });

    const table = await page.evaluate(() => {

        const rowNodeList = document.querySelectorAll('div#titleCast > table > tbody > tr');
        const rowArray = Array.from(rowNodeList);
        return rowArray.slice(1).map(tr => {
            const dataNodeList = tr.querySelectorAll('td');
            const dataArray = Array.from(dataNodeList);
            // const dataNodeCoverList = tr.querySelectorAll('td.primary_photo > a');
            // const dataCoverArray = Array.from(dataNodeCoverList);
            const [title, actor, Weekend, as] = dataArray.map(td => td.innerText);
            // const [imgUrl] = dataCoverArray.map(img => img.getAttribute('src'));

            return { actor, as, imgUrl }
        })
    });

    await browser.close();

    return {
        ...data,
        castList: table
    };
}

checkArgs();
