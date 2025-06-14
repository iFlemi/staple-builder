import { FileData } from "@/domain/FileData"
import { stringToColourIdentity } from "@/functions/colourParser"
import { Result } from "@/utils/Result"
import { ofType } from "mismatched"
import { Either } from "prelude-ts"
import { Card } from "@/domain/Card"
import { Arr } from "weland"

export const fileDataToCardList = (fileData: FileData): Result<Card[]> => {
  const coloursResult = stringToColourIdentity(fileData.fileName)
  if (coloursResult.isLeft()) return Result.widen(coloursResult)
  if (fileData.fileCategory === "package")
    return Either.left(new Error("Cannot add package to card list"))

  const colourRequirement = coloursResult.get()
  const rarity = fileData.fileCategory
  const cards = fileData.fileContents
    .split("\r\n")
    .filter(ofType.isDefined)
    .filter(ofType.isString)
    .filter((c) => c.trim().length > 0)

  if (Arr.isEmpty(cards)) return Either.left(new Error("Empty card list"))

  return Result.of(
    cards.map((cardName) => ({
      name: cardName,
      rarity,
      colourRequirement,
    })),
  )
}
