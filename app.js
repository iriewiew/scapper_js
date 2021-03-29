const puppeteer = require("puppeteer");
const args = process.argv.slice(2).toString();
const { removeEmpty } = require('./utils');


const checkArgs = () => {
    // console.log(args)
    switch (args) {
        case "box_office":
            console.log("getting box office data...")
            boxOffice();
            break;
        case "get_data2":
            console.log("ok2")
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

async function app() {
    for await (symbol of symbols) {
        const description = await getDescription(symbol.id);
        console.log({ ...symbol, description });
        // console.log(symbol)
    }
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

async function getDescription(symbol) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
        `https://www.imdb.com/title/${symbol}/`
    );

    const text = await page.evaluate(() => {
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

    await browser.close();

    return text;
}

checkArgs();
