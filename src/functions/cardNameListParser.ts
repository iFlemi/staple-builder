import { FileData } from "@/domain/FileData"
import { stringToColourIdentity } from "@/functions/colourParser"
import { Result } from "@/utils/Result"
import { ofType } from "mismatched"
import { Either, Option } from "prelude-ts"
import { Card } from "@/domain/Card"
import { Arr } from "weland"

export const fileDataToCardList = (fileData: FileData): Result<Card[]> => {
  const coloursResult = stringToColourIdentity(fileData.fileName)
  if (coloursResult.isLeft()) return Result.widen(coloursResult)
  const colourRequirement = coloursResult.get()
  const cards = fileData.fileContents
    .split("\r\n")
    .filter(ofType.isDefined)
    .filter(ofType.isString)
    .filter((c) => c.trim().length > 0)

  if (Arr.isEmpty(cards)) return Either.left(new Error("Empty card list"))

  return Result.of(
    cards.map((cardName) => ({
      name: cardName,
      colourRequirement,
      packageName: Option.none(),
    })),
  )
}
