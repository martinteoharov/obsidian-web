import scrapy

class ComputerScienceSpider(scrapy.spiders.CrawlSpider):
    name = 'computer_science_online'

    def start_requests(self):
        urls = [
                'https://en.wikipedia.org/wiki/Computer_science',
        ]
        allowed_domains = [ 'en.wikipedia.org', ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        name = response.css('#firstHeading::text').get()
        links = response.xpath('//a/@href').getall()

        wiki_links = [f"https://en.wikipedia.org{_}" for _ in links if "/wiki/" in _ and "wikimedia" not in _ and "http" not in _ and ".png" not in _]

        for link in wiki_links:
            link = response.urljoin(link)
            yield scrapy.Request(link, callback=self.parse)

        yield { "path":response.request.url, "name": name, "links": wiki_links }
