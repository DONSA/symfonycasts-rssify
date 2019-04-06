const fetch    = require('node-fetch');
const RSS      = require('rss')
const cheerio  = require('cheerio')
const fs       = require('fs')

async function scrape() {

    const BASE_URL = 'https://symfonycasts.com';

    var feed = new RSS({
        title: 'SymfonyCasts',
        feed_url: 'http://localhost/rss.xml',
        site_url: BASE_URL,
        image_url: 'https://www.iol.pt/multimedia/oratvi/multimedia/imagem/id/58a7505c0cf2b10cb6612529/',
    });

    fetch(`${BASE_URL}/updates`)
        .then(data => data.text())
        .then(html => {
            const $ = cheerio.load(html)

            $("[data-type='course']").each(function(i, el) {
                feed.item({
                    title: $(el).find('.course-update a').text().replace(/\s+/g,' ').replace(/\n|\r/g, '').trim(),
                    url: BASE_URL + $(el).find('.course-update a').attr('href'),
                    date: extractDate($(el).find('.text-right.text-nowrap').text()),
                });
            })

            fs.writeFile("./rss.xml", feed.xml({ indent: true }), (err) => {
                if (err) throw new Error(err);
            })
        })

    function extractDate(text) {
        var groups = text.match(/(?<quantity>\d+)\s(?<type>\w+)/).groups;
        var d = new Date();

        if (groups.type === 'days') {
            d.setDate(d.getDate() - groups.quantity);
        }

        if (groups.type === 'hours') {
            d.setHours(d.getHours() - groups.quantity);
        }

        return d.toDateString();
    }
}

async function run() {
    try {
        await scrape()
    } catch (e) {
        console.error(e.message)
    }
}

module.export = run()

