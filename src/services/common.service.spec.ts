import { CommonService } from "./common.service"


describe("Tessing Common service", () => {

    test("Testing getRootUrl", () => {
        let fixtures = [
            ['https://localhost:3000/abc/cd?access=234', 'https://localhost:3000'],
            ['https://www.sigma.com', 'https://www.sigma.com']
        ]

        for(const fixture of fixtures) {
            expect(CommonService.getRootUrl(fixture[0])).toEqual(fixture[1])
        }
    })
})