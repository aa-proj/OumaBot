import puppeteer from "puppeteer"

export type raceData = {
  raceId: string
  raceNumber: string
  raceTitle: string
  raceStartTime: string
  raceLong: string
  raceHorseCount: string
}

export type raceDetail = {
  title: string,
  raceData: raceData[]
}

export const getRaceDetails = async (date: Date) => {
  // 2008年からデータがあるっぽい
  const year = date.getFullYear()
  const month = ("00" + (date.getMonth() + 1)).slice(-2)
  const day = ("00" + date.getDate()).slice(-2)
  const url = `https://race.netkeiba.com/top/race_list.html?kaisai_date=${year}${month}${day}`
  console.log("GET", year, month, day, url)
  // console.log(url)
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true});
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 720});
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36");
  await page.goto(url, {waitUntil: 'load'});
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));

  const data = await page.evaluate(() => {
    const elements = Array.from(document.getElementsByClassName("RaceList_DataList"))
    let details: raceDetail[] = []
    elements.forEach(element => {
      const title = (<HTMLElement>element.getElementsByClassName("RaceList_DataTitle")[0]).innerText
      // TODO const tenki = ...
      let raceData: raceData[] = []
      const races = Array.from(element.getElementsByClassName("RaceList_DataItem"))
      races.forEach(race => {
        const raceId = (<HTMLAnchorElement>race.getElementsByTagName("a")[0]).href
          .replace("../race/result.html?race_id=", "")
          .replace("../race/shutuba.html?race_id=", "")
          .replace("", "&rf=race_list")
        const raceNumber = (<HTMLElement>race.getElementsByClassName("Race_Num")[0])?.innerText
        const raceTitle = (<HTMLElement>race.getElementsByClassName("ItemTitle")[0])?.innerText
        const raceStartTime = (<HTMLElement>race.getElementsByClassName("RaceList_Itemtime")[0])?.innerText
        const raceLong = (<HTMLElement>race.getElementsByClassName("RaceList_ItemLong")[0])?.innerText
        const raceHorseCount = (<HTMLElement>race.getElementsByClassName("RaceList_Itemnumber")[0])?.innerText
        raceData.push({
          raceId, raceNumber, raceTitle, raceStartTime, raceLong, raceHorseCount
        })
      })
      details.push({
        title, raceData
      })
    })
    return details
  })
  await browser.close()
  // console.log(data)
  return data
}
