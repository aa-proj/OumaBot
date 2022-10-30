export const Kaijo = <const>["東京", "阪神", "新潟"]
export const Housiki = <const>["単勝", "複勝", "枠連", "馬連", "ワイド", "馬単", "３連複", "３連単"]
export const Youbi = <const>["土", "日"]
export type Kaijo = typeof Kaijo[number]
export type Housiki = typeof Housiki[number]
export type Youbi = typeof Youbi[number]

export type BakenBase = {
  kaijo: Kaijo
  youbi: "土" | "日"
  housiki: Housiki
  combination: string
  count: string
  amount: number
}

export const validateTicketText = (text: string): BakenBase[] => {
  const regex = /(東京|阪神|新潟)（([土日])）\d+R(単勝|複勝|枠連|馬連|ワイド|馬単|３連複|３連単)(.+)(\d+組)/g
  const splitText = text.split("\n")
  let result: BakenBase[] = []
  splitText.forEach((text, index) => {
    const baken = regex.exec(text)
    if(!baken) return
    console.log(baken, isKaijo(baken[1]), isYoubi(baken[2]), isHousiki(baken[3]))
    if (isKaijo(baken[1]) && isYoubi(baken[2]) && isHousiki(baken[3])) {
      const nextline = splitText[index + 1]
      console.log(nextline)
      if (nextline.endsWith("円")) {
        const amount = Number(nextline.replace("円", "").replace(/,/g,""))
        if (!amount) return
        result.push({
          kaijo: baken[1],
          youbi: baken[2],
          housiki: baken[3],
          combination: baken[4],
          count: baken[5],
          amount
        })
      }
    }
  })
  return result
}

const isKaijo = (str: string): str is Kaijo => {
  return !!Kaijo.find((text) => str === text);
}

const isYoubi = (str: string): str is Youbi => {
  return !!Youbi.find((text) => str === text);
}

const isHousiki = (str: string): str is Housiki => {
  return !!Housiki.find((text) => str === text);
}
