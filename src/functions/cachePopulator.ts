import { FileData } from "@/domain/FileData"
import { stringToColourIdentity } from "@/functions/colourParser"
import { Result } from "@/utils/Result"
import { ofType } from "mismatched"
import { Either, Option } from "prelude-ts"
import { Card } from "@/domain/Card"
import { Arr } from "weland"
import { Colour } from "@/domain/Colour"
import { CardCache } from "@/functions/cardCache"

export const loadFileDataIntoCache = (
  fileData: FileData,
  cache: CardCache,
): Result<Card[]> => {
  const coloursResult = stringToColourIdentity(fileData.fileName)
  if (coloursResult.isLeft()) return Result.widen(coloursResult)
  const colourRequirement = coloursResult.get()
  const cardNames = fileContentsToCardNames(fileData.fileContents)

  if (Arr.isEmpty(cardNames)) return Either.left(new Error("Empty card list"))

  const cards = cardNames.map((cn) => ({ name: cn, colourRequirement }))
  loadIntoCache(colourRequirement, cards, cache)
  return Result.of(cards)
}

const loadIntoCache = (colours: Colour[], cards: Card[], cache: CardCache) => {
  cache.addCards(
    colours,
    cards.map((c) => c.name),
  )
}

export const fileContentsToCardNames = (fileContents: string) =>
  fileContents
    .split("\n")
    .filter(ofType.isDefined)
    .filter(ofType.isString)
    .filter((c) => c.trim().length > 0)
