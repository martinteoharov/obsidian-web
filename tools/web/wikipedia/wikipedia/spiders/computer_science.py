import scrapy

class ComputerScienceSpider(scrapy.spiders.CrawlSpider):
    name = 'computer_science'

    def start_requests(self):
        urls = [
                'https://en.wikipedia.org/wiki/Computer_science',
        ]
        allowed_domains = [ 'en.wikipedia.org' ]

        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        name = response.css('#firstHeading::text').get()
        links = response.xpath('//a/@href').getall()

        incl = ["/wiki/"]
        excl = ["/wikimedia/", "http", ".png", ":"]
        wiki_links = [f"https://en.wikipedia.org{_}" for _ in links 
                    if any(word in _ for word in incl) 
                    and not any(word in _ for word in excl)]

        with open(f'out/{name}.html', 'wb') as f:
            f.write(response.body)

        for link in wiki_links:
            link = response.urljoin(link)
            yield scrapy.Request(link, callback=self.parse)
